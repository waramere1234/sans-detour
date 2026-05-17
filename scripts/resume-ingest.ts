// scripts/resume-ingest.ts
//
// Recovery script: takes a batch ID from a previous `npm run ingest:an` run
// whose upsert failed (or was interrupted), re-fetches the already-paid
// Anthropic batch results, re-applies the (now-fixed) parsing, and upserts
// to Supabase. No new LLM cost.
//
// Unlike the main script, this one re-parses the local AN JSON cache to
// rebuild a FULL ParsedScrutin row (numero, date, votes, dossier, …) so an
// upsert that lands as INSERT (when the row never made it to DB on the prior
// run) doesn't fail on NOT NULL constraints.
//
// Usage:
//   SUPABASE_URL=... \
//   SUPABASE_SERVICE_ROLE_KEY=... \
//   ANTHROPIC_API_KEY=... \
//   BATCH_ID=msgbatch_01... \
//   npx tsx scripts/resume-ingest.ts

import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";
import { computeGroupPosition } from "../src/lib/compute-positions";
import { normalizeTheme } from "../src/types";
import type {
  GroupCode, GroupPosition, GroupVoteBreakdown, ScrutinAnalyse, Theme,
} from "../src/types";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const BATCH_ID = process.env.BATCH_ID;

if (!SUPABASE_URL || !SUPABASE_KEY || !ANTHROPIC_KEY || !BATCH_ID) {
  console.error("Missing env: need SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, BATCH_ID");
  process.exit(1);
}

const JSON_DIR = path.join("/tmp/sd-an-cache", "json");

// ──────────────────── AN parsing (mirrors ingest-an.ts intentionally) ────────

const GROUP_MAPPING: Record<string, GroupCode | null> = {
  PO845401: "RN",
  PO845407: "EPR",
  PO845413: "LFI",
  PO845419: "SOC",
  PO845425: "DR",
  PO845439: "ECO",
  PO845454: "DEM",
  PO845470: "HOR",
  PO845485: "LIOT",
  PO845514: "GDR",
  PO847173: "UDR",
  PO872880: "UDR",
  PO840056: null,
};

interface ANGroupVote {
  organeRef: string;
  vote: { decompteVoix: { nonVotants: string; pour: string; contre: string; abstentions: string; nonVotantsVolontaires: string }; };
}
interface ANScrutinRaw {
  uid: string;
  numero: string;
  dateScrutin: string;
  typeVote: { codeTypeVote: string; libelleTypeVote: string };
  objet: { libelle: string; dossierLegislatif: { libelle: string; dossierRef: string } | null };
  ventilationVotes: { organe: { groupes: { groupe: ANGroupVote[] } } };
}

interface ParsedRaw {
  id: string;
  numero: number;
  date: string;
  dossier_id: string;
  dossier_titre: string;
  titre_brut: string;
  position_par_groupe: Record<GroupCode, GroupPosition>;
  votes_bruts: Record<GroupCode, GroupVoteBreakdown>;
  est_solennel: boolean;
  url_an_officielle: string;
  pedago_relu: boolean;
}

function n(s: string | null | undefined): number {
  return parseInt(s ?? "0", 10) || 0;
}

function parseRaw(raw: ANScrutinRaw): ParsedRaw {
  const votes_bruts = {} as Record<GroupCode, GroupVoteBreakdown>;
  const position_par_groupe = {} as Record<GroupCode, GroupPosition>;
  for (const g of raw.ventilationVotes?.organe?.groupes?.groupe ?? []) {
    const code = GROUP_MAPPING[g.organeRef];
    if (!code) continue;
    const dv = g.vote.decompteVoix;
    const breakdown: GroupVoteBreakdown = {
      pour: n(dv.pour),
      contre: n(dv.contre),
      abstention: n(dv.abstentions),
      absent: n(dv.nonVotants) + n(dv.nonVotantsVolontaires),
    };
    if (votes_bruts[code]) {
      votes_bruts[code] = {
        pour: votes_bruts[code].pour + breakdown.pour,
        contre: votes_bruts[code].contre + breakdown.contre,
        abstention: votes_bruts[code].abstention + breakdown.abstention,
        absent: votes_bruts[code].absent + breakdown.absent,
      };
    } else {
      votes_bruts[code] = breakdown;
    }
    position_par_groupe[code] = computeGroupPosition(votes_bruts[code]);
  }
  const dossier = raw.objet?.dossierLegislatif;
  return {
    id: raw.uid,
    numero: parseInt(raw.numero, 10),
    date: raw.dateScrutin,
    dossier_id: dossier?.dossierRef ?? `STANDALONE-${raw.uid}`,
    dossier_titre: dossier?.libelle ?? raw.objet?.libelle?.slice(0, 120) ?? "Sans dossier",
    titre_brut: raw.objet?.libelle ?? "",
    position_par_groupe,
    votes_bruts,
    est_solennel: raw.typeVote?.codeTypeVote === "SPS",
    url_an_officielle: `https://www.assemblee-nationale.fr/dyn/17/scrutins/${raw.numero}`,
    pedago_relu: false,
  };
}

// MUST stay in sync with scripts/ingest-an.ts isEligibleScrutin.
function isEligibleScrutin(raw: ANScrutinRaw): boolean {
  const code = raw.typeVote?.codeTypeVote;
  const titre = raw.objet?.libelle ?? "";
  if (/\bamendements?\b/i.test(titre)) return false;
  if (/\bà l'article\b/i.test(titre)) return false;
  if (code === "SPS") return true;
  if (/sur l'ensemble/i.test(titre)) return true;
  if (/\bmotion de censure\b/i.test(titre)) return true;
  if (/\bmotion référendaire\b/i.test(titre)) return true;
  if (/proposition de résolution/i.test(titre)) return true;
  return false;
}

// ──────────────────────────── LLM summary parsing ────────────────────────────

interface AnthropicTextBlock { type: "text"; text: string }
interface AnthropicMessage { content: Array<AnthropicTextBlock | { type: string }>; stop_reason: string }

interface BatchResultLine {
  custom_id: string;
  result:
    | { type: "succeeded"; message: AnthropicMessage }
    | { type: "errored"; error?: unknown }
    | { type: "canceled" }
    | { type: "expired" };
}

interface Summary {
  chapeau: string;
  titre_pedago: string;
  contexte: string;
  analyse_loi?: ScrutinAnalyse;
  points_cles?: string[];
  theme?: Theme;
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}
function normalizeAnalyse(a: unknown): ScrutinAnalyse | undefined {
  if (!a || typeof a !== "object") return undefined;
  const o = a as Record<string, unknown>;
  return {
    mesures_principales: asStringArray(o.mesures_principales),
    concernes_positifs: asStringArray(o.concernes_positifs),
    concernes_negatifs: asStringArray(o.concernes_negatifs),
    concernes_neutres: asStringArray(o.concernes_neutres),
    calendrier: asStringArray(o.calendrier),
    exceptions: asStringArray(o.exceptions),
  };
}
function normalizePointsCles(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const cleaned = v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 3)
    .map((s) => {
      const w = s.split(/\s+/);
      return w.length <= 7 ? s : w.slice(0, 7).join(" ") + "…";
    });
  return cleaned.length > 0 ? cleaned : undefined;
}
function sanitizeJsonControlChars(json: string): string {
  let out = ""; let inString = false; let escapeNext = false;
  for (let i = 0; i < json.length; i++) {
    const c = json[i];
    if (escapeNext) { out += c; escapeNext = false; continue; }
    if (c === "\\") { out += c; escapeNext = true; continue; }
    if (c === '"') { inString = !inString; out += c; continue; }
    if (inString) {
      const code = c.charCodeAt(0);
      if (code === 0x0a) { out += "\\n"; continue; }
      if (code === 0x0d) { out += "\\r"; continue; }
      if (code === 0x09) { out += "\\t"; continue; }
      if (code < 0x20) { out += "\\u" + code.toString(16).padStart(4, "0"); continue; }
    }
    out += c;
  }
  return out;
}

function extractSummary(message: AnthropicMessage): Summary {
  const textBlocks = message.content.filter((b): b is AnthropicTextBlock => b.type === "text");
  if (textBlocks.length === 0) throw new Error(`No text block. stop_reason=${message.stop_reason}`);
  const combined = textBlocks.map((b) => b.text).join("\n");
  const m = combined.match(/\{[\s\S]*\}/);
  if (!m) throw new Error(`No JSON in response. text=${combined.slice(0, 200)}…`);
  const raw = JSON.parse(sanitizeJsonControlChars(m[0])) as Record<string, unknown>;
  const chapeau = typeof raw.chapeau === "string" ? raw.chapeau.trim() : "";
  const titre_pedago = typeof raw.titre_pedago === "string" ? raw.titre_pedago.trim() : "";
  const contexte = typeof raw.contexte === "string" ? raw.contexte.trim() : "";
  if (!chapeau || !titre_pedago) throw new Error(`Missing chapeau or titre_pedago`);
  return {
    chapeau, titre_pedago, contexte,
    analyse_loi: normalizeAnalyse(raw.analyse_loi),
    points_cles: normalizePointsCles(raw.points_cles),
    theme: normalizeTheme(raw.theme),
  };
}

// ────────────────────────────── fallback summary ─────────────────────────────

function fallbackSummary(titreBrut: string, dossierTitre: string): Summary {
  const words = titreBrut.split(/\s+/).filter(Boolean);
  const titre_pedago = words.slice(0, 14).join(" ") + (words.length > 14 ? "…" : "");
  const dossierWords = (dossierTitre || "scrutin").split(/\s+/).filter(Boolean).slice(0, 3);
  const chapeau = dossierWords.join(" ").toUpperCase().replace(/[.,;:!?]+$/, "");
  const ctxWords = (dossierTitre || "").split(/\s+/).filter(Boolean);
  const contexte = ctxWords.length > 0
    ? ctxWords.slice(0, 25).join(" ") + (ctxWords.length > 25 ? "…" : "")
    : "";
  return { chapeau, titre_pedago, contexte };
}

// ─────────────────────────────────── main ────────────────────────────────────

async function loadEligibleScrutins(): Promise<Map<string, ParsedRaw>> {
  const files = (await fs.readdir(JSON_DIR)).filter((f) => f.endsWith(".json"));
  const out = new Map<string, ParsedRaw>();
  for (const f of files) {
    const raw = JSON.parse(await fs.readFile(path.join(JSON_DIR, f), "utf-8"));
    const s: ANScrutinRaw = raw.scrutin ?? raw;
    if (!isEligibleScrutin(s)) continue;
    const parsed = parseRaw(s);
    out.set(parsed.id, parsed);
  }
  return out;
}

async function main(): Promise<void> {
  const eligible = await loadEligibleScrutins();
  console.log(`◯ Loaded ${eligible.size} eligible scrutins from local AN cache`);

  console.log(`↓ Fetching batch ${BATCH_ID} results from Anthropic…`);
  const r = await fetch(`https://api.anthropic.com/v1/messages/batches/${BATCH_ID}/results`, {
    headers: {
      "x-api-key": ANTHROPIC_KEY!,
      "anthropic-version": "2023-06-01",
    },
  });
  if (!r.ok) throw new Error(`Batch results fetch failed: ${r.status} ${await r.text()}`);
  const text = await r.text();

  const summaries = new Map<string, Summary>();
  let ok = 0; let err = 0;
  for (const line of text.split("\n").filter((l) => l.trim())) {
    const result = JSON.parse(line) as BatchResultLine;
    if (result.result.type !== "succeeded") {
      console.error(`  ✕ ${result.custom_id}: ${result.result.type}`);
      err++;
      continue;
    }
    try {
      summaries.set(result.custom_id, extractSummary(result.result.message));
      ok++;
    } catch (e) {
      console.error(`  ✕ ${result.custom_id} parse: ${(e as Error).message}`);
      err++;
    }
  }
  console.log(`✓ Parsed ${ok} summaries (${err} failed → fallback applied)`);

  // Build full rows for every eligible scrutin: parsed AN data + (LLM summary
  // OR fallback). This way an upsert that lands as INSERT for a row that
  // never reached the DB on the prior run still satisfies all NOT NULL
  // constraints (numero, date, votes_bruts, …).
  // `ingere_le` is stamped explicitly because the migration default only
  // applies on INSERT — on UPSERT/UPDATE it'd keep the old value, and
  // FreshnessBanner would report a stale "MAJ il y a X jours" after a
  // resume run that just refreshed every row (same fix as ingest-an.ts).
  const ingestedAt = new Date().toISOString();
  const rows = [...eligible.values()].map((parsed) => {
    const s = summaries.get(parsed.id) ?? fallbackSummary(parsed.titre_brut, parsed.dossier_titre);
    return { ...parsed, ...s, ingere_le: ingestedAt };
  });

  const sb = createClient(SUPABASE_URL!, SUPABASE_KEY!);
  console.log(`↑ Upserting ${rows.length} rows in scrutins…`);
  const CHUNK = 100;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await sb.from("scrutins").upsert(chunk);
    if (error) {
      console.error(`✕ Chunk ${i}-${i + chunk.length} failed:`, error);
      process.exit(1);
    }
    console.log(`  ✓ chunk ${i}-${i + chunk.length}`);
  }

  // Clean up rows that are no longer eligible (e.g., amendments now excluded
  // by a tightened filter). Keeps the DB in sync with the current corpus
  // definition without requiring a manual truncate.
  const eligibleIds = new Set([...eligible.keys()]);
  const { data: existing, error: listErr } = await sb.from("scrutins").select("id");
  if (listErr) {
    console.warn(`⚠ Could not list existing rows for cleanup: ${listErr.message}`);
  } else {
    const stale = (existing ?? []).map((r) => r.id as string).filter((id) => !eligibleIds.has(id));
    if (stale.length > 0) {
      console.log(`↓ Deleting ${stale.length} stale rows (no longer eligible under current filter)…`);
      const { error: delErr } = await sb.from("scrutins").delete().in("id", stale);
      if (delErr) console.warn(`⚠ Delete failed: ${delErr.message}`);
    } else {
      console.log(`✓ No stale rows to delete.`);
    }
  }

  console.log(`✓ Done. ${rows.length} rows ingested.`);
  console.log(`  (${ok} with full LLM enrichment, ${err} on fallback summary)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
