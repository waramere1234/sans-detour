// scripts/resume-ingest.ts
//
// Recovery script: takes a batch ID from a previous `npm run ingest:an` run
// whose upsert failed (or was interrupted), re-fetches the already-paid
// Anthropic batch results, re-applies the (now-fixed) parsing, and upserts
// to Supabase. No new LLM cost.
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

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const BATCH_ID = process.env.BATCH_ID;

if (!SUPABASE_URL || !SUPABASE_KEY || !ANTHROPIC_KEY || !BATCH_ID) {
  console.error("Missing env: need SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, BATCH_ID");
  process.exit(1);
}

// Reuse the exact same parser the main script now uses, so behavior matches.
// We dynamically import after the env check so the missing-env error wins.
const ingest = await import("./ingest-an.ts" as string).catch(() => null);
// The functions we need are not currently exported. Re-implement minimal
// pieces here to keep this script standalone — small surface, easy to audit.
void ingest;

const JSON_DIR = path.join("/tmp/sd-an-cache", "json");

interface ANRaw { uid: string; numero: string; }

async function loadParsedFromCache(): Promise<Map<string, { id: string; numero: number }>> {
  // We only need the ids/numeros — the rest of ParsedScrutin (votes_bruts,
  // position_par_groupe, etc.) is already in Supabase from the prior partial
  // run. The recovery only patches the LLM-derived columns: chapeau,
  // titre_pedago, contexte, theme, analyse_loi, points_cles.
  const files = (await fs.readdir(JSON_DIR)).filter((f) => f.endsWith(".json"));
  const out = new Map<string, { id: string; numero: number }>();
  for (const f of files) {
    const raw = JSON.parse(await fs.readFile(path.join(JSON_DIR, f), "utf-8"));
    const s: ANRaw = raw.scrutin ?? raw;
    out.set(s.uid, { id: s.uid, numero: parseInt(s.numero, 10) });
  }
  return out;
}

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

interface ScrutinAnalyse {
  mesures_principales: string[];
  concernes_positifs: string[];
  concernes_negatifs: string[];
  concernes_neutres: string[];
  calendrier: string[];
  exceptions: string[];
}

const THEMES = [
  "pouvoir-achat","retraites","immigration","sécurité","écologie",
  "santé","école","fiscalité","institutions","international","autre",
] as const;
type Theme = typeof THEMES[number];

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

function normalizeTheme(v: unknown): Theme | undefined {
  if (typeof v !== "string") return undefined;
  const lower = v.trim().toLowerCase();
  return (THEMES as readonly string[]).includes(lower) ? (lower as Theme) : "autre";
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
  if (!m) throw new Error(`No JSON in response`);
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

async function main(): Promise<void> {
  const cache = await loadParsedFromCache();
  console.log(`◯ Loaded ${cache.size} scrutin ids from local AN cache`);

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
  console.log(`✓ Parsed ${ok} summaries (${err} failed → fallback in main script)`);

  // Patch only the LLM-derived columns. We DO NOT touch position_par_groupe,
  // votes_bruts, dossier_*, date, est_solennel — those are already correct
  // from the prior partial run and don't depend on the LLM.
  const sb = createClient(SUPABASE_URL!, SUPABASE_KEY!);
  const rows = [...summaries.entries()].map(([id, s]) => ({
    id,
    chapeau: s.chapeau,
    titre_pedago: s.titre_pedago,
    contexte: s.contexte,
    theme: s.theme,
    analyse_loi: s.analyse_loi,
    points_cles: s.points_cles,
  }));

  console.log(`↑ Patching ${rows.length} rows in scrutins…`);
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
  console.log(`✓ Done. ${rows.length} rows patched.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
