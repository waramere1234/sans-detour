// scripts/ingest-an.ts
//
// One-shot bootstrap: download all scrutins of the 17e legislature from
// data.assemblee-nationale.fr, filter to "scrutins publics solennels" (SPS),
// parse + compute group positions + (optionally) generate LLM summaries,
// upsert into Supabase.
//
// Usage:
//   SUPABASE_URL=https://xxx.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
//   [ANTHROPIC_API_KEY=sk-ant-...] \
//   npm run ingest:an
//
// If ANTHROPIC_API_KEY is missing, titre_pedago/chapeau fall back to a
// truncated form of the raw AN libellé. Re-run later with the key set
// to upgrade the rows in place.

import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { computeGroupPosition } from "../src/lib/compute-positions";
import type { GroupCode, GroupPosition, GroupVoteBreakdown } from "../src/types";

// ───────────────────────────────────────────────────────────────── config

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env");
  process.exit(1);
}

const BULK_URL =
  "https://data.assemblee-nationale.fr/static/openData/repository/17/loi/scrutins/Scrutins.json.zip";
const CACHE_DIR = "/tmp/sd-an-cache";
const ZIP_PATH = path.join(CACHE_DIR, "Scrutins.json.zip");
const JSON_DIR = path.join(CACHE_DIR, "json");

/**
 * AN organeRef → internal GroupCode. Triangulated from observed group sizes
 * across the 46 SPS scrutins of the 17e legislature; verified for RN/LFI/ECO
 * via instances/resume pages on assemblee-nationale.fr.
 *
 * PO847173 and PO872880 both correspond to "Union des droites pour la
 * République" — the group was reconstituted around 2025-09 with a new
 * organeRef but the same political identity, so we collapse both to UDR.
 *
 * PO840056 is the non-inscrits pool (~10 deputies) — excluded from the app
 * since it is not a parliamentary group.
 */
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

// ─────────────────────────────────────────────────────── AN bulk download

async function ensureBulk(): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  try {
    const stat = await fs.stat(JSON_DIR);
    if (stat.isDirectory()) {
      const files = await fs.readdir(JSON_DIR);
      if (files.length > 1000) {
        console.log(`✓ AN cache hit: ${files.length} files in ${JSON_DIR}`);
        return;
      }
    }
  } catch {
    // fall through
  }

  console.log(`↓ Downloading ${BULK_URL} …`);
  const r = await fetch(BULK_URL);
  if (!r.ok) throw new Error(`AN download failed: ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  await fs.writeFile(ZIP_PATH, buf);
  console.log(`✓ Saved ${(buf.length / 1024 / 1024).toFixed(1)} MB to ${ZIP_PATH}`);

  console.log(`⊟ Unzipping…`);
  execSync(`unzip -oq "${ZIP_PATH}" -d "${CACHE_DIR}"`, { stdio: "inherit" });
  const files = await fs.readdir(JSON_DIR);
  console.log(`✓ Extracted ${files.length} scrutin files to ${JSON_DIR}`);
}

// ──────────────────────────────────────────────────────── AN scrutin parse

interface ANGroupVote {
  organeRef: string;
  nombreMembresGroupe: string;
  vote: {
    positionMajoritaire: string;
    decompteVoix: {
      nonVotants: string;
      pour: string;
      contre: string;
      abstentions: string;
      nonVotantsVolontaires: string;
    };
  };
}

interface ANScrutinRaw {
  uid: string;
  numero: string;
  dateScrutin: string;
  typeVote: { codeTypeVote: string; libelleTypeVote: string };
  objet: {
    libelle: string;
    dossierLegislatif: { libelle: string; dossierRef: string } | null;
  };
  ventilationVotes: {
    organe: { groupes: { groupe: ANGroupVote[] } };
  };
}

interface ParsedScrutin {
  id: string;
  numero: number;
  date: string;
  dossier_id: string;
  dossier_titre: string;
  titre_brut: string;
  titre_pedago: string;
  chapeau: string;
  position_par_groupe: Record<GroupCode, GroupPosition>;
  votes_bruts: Record<GroupCode, GroupVoteBreakdown>;
  est_solennel: boolean;
  url_an_officielle: string;
  pedago_relu: boolean;
}

function n(s: string | null | undefined): number {
  return parseInt(s ?? "0", 10) || 0;
}

function parseRaw(raw: ANScrutinRaw): Omit<ParsedScrutin, "titre_pedago" | "chapeau"> {
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
    // If UDR appears as both PO847173 and PO872880 in the same scrutin
    // (shouldn't happen — they alternate by date — but defensive merge):
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

// ─────────────────────────────────────────────── titre pédago (LLM optional)

const PROMPT_TEMPLATE = `Tu reçois le titre brut d'un scrutin solennel à l'Assemblée Nationale française.
Génère deux choses :
1. CHAPEAU : un chapeau contextuel ultra-court de la forme "[THÈME] · [DOSSIER]" (max 4 mots, en majuscules, sans ponctuation finale). Ex : "RETRAITES · PLFSS 2024".
2. TITRE_PEDAGO : reformulation factuelle du sujet de fond du vote en une phrase de 12 mots maximum. Pas de prise de parti. Pas de qualificatif (éviter "controversé", "important", "scandaleux"). Vocabulaire accessible à un lycéen.

Réponds en JSON strict : {"chapeau": "...", "titre_pedago": "..."}.

Titre brut :
"""
{TITRE_BRUT}
"""

Dossier législatif (contexte, peut être vide) :
"""
{DOSSIER_TITRE}
"""`;

interface Summary {
  chapeau: string;
  titre_pedago: string;
}

async function summarizeWithLLM(titreBrut: string, dossierTitre: string): Promise<Summary> {
  const prompt = PROMPT_TEMPLATE
    .replace("{TITRE_BRUT}", titreBrut)
    .replace("{DOSSIER_TITRE}", dossierTitre);

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${await r.text()}`);
  const json = await r.json() as { content?: { text: string }[] };
  const text = json.content?.[0]?.text ?? "";
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("No JSON in LLM response");
  return JSON.parse(m[0]) as Summary;
}

function fallbackSummary(titreBrut: string, dossierTitre: string): Summary {
  // Truncate to ~12 words for titre_pedago, derive a 3-word eyebrow from dossier.
  const words = titreBrut.split(/\s+/).filter(Boolean);
  const titre_pedago = words.slice(0, 14).join(" ") + (words.length > 14 ? "…" : "");
  const dossierWords = (dossierTitre || "scrutin").split(/\s+/).filter(Boolean).slice(0, 3);
  const chapeau = dossierWords.join(" ").toUpperCase().replace(/[.,;:!?]+$/, "");
  return { chapeau, titre_pedago };
}

// ─────────────────────────────────────────────────────────────── orchestrator

async function main(): Promise<void> {
  await ensureBulk();

  const files = (await fs.readdir(JSON_DIR)).filter(f => f.endsWith(".json"));
  console.log(`◯ Scanning ${files.length} scrutin files…`);

  const solennels: Awaited<ReturnType<typeof parseRaw>>[] = [];
  for (const f of files) {
    const raw = JSON.parse(await fs.readFile(path.join(JSON_DIR, f), "utf-8"));
    const s = raw.scrutin ?? raw;
    if (s.typeVote?.codeTypeVote !== "SPS") continue;
    solennels.push(parseRaw(s));
  }
  console.log(`◯ Found ${solennels.length} scrutins solennels (SPS)`);

  if (!ANTHROPIC_KEY) {
    console.warn("⚠ ANTHROPIC_API_KEY not set — using fallback summaries (re-run later with key to upgrade)");
  }

  const enriched: ParsedScrutin[] = [];
  for (let i = 0; i < solennels.length; i++) {
    const s = solennels[i];
    const summary = ANTHROPIC_KEY
      ? await summarizeWithLLM(s.titre_brut, s.dossier_titre)
      : fallbackSummary(s.titre_brut, s.dossier_titre);
    enriched.push({ ...s, ...summary });
    if (ANTHROPIC_KEY) console.log(`  [${i + 1}/${solennels.length}] ${summary.chapeau} — ${summary.titre_pedago}`);
  }

  console.log(`↑ Upserting ${enriched.length} scrutins to Supabase…`);
  const sb = createClient(SUPABASE_URL!, SUPABASE_KEY!);
  // Wipe demo fixtures first to avoid mixed state. We identify them as the
  // rows whose url_an_officielle is empty (fixture marker).
  const { error: delErr } = await sb.from("scrutins").delete().eq("url_an_officielle", "");
  if (delErr) console.warn("⚠ Could not delete demo rows:", delErr.message);

  // Upsert in chunks to stay under PostgREST limits.
  const CHUNK = 100;
  for (let i = 0; i < enriched.length; i += CHUNK) {
    const chunk = enriched.slice(i, i + CHUNK);
    const { error } = await sb.from("scrutins").upsert(chunk);
    if (error) {
      console.error(`✕ Chunk ${i}-${i + chunk.length} failed:`, error);
      process.exit(1);
    }
  }
  console.log(`✓ Done. ${enriched.length} solennels in scrutins table.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
