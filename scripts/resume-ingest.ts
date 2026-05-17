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

import {
  type Summary,
  type BatchResultLine,
  fallbackSummary,
  extractAnthropicSummary,
} from "./lib/parse-summary";
import { type ParsedScrutinCore } from "./lib/an-parse";
import { iterEligibleScrutins } from "./lib/an-cache";
import {
  requireSupabaseClient, requireAnthropicEnv,
  anthropicBatchResultsUrl, anthropicHeaders,
} from "./lib/env";

// SUPABASE_* + ANTHROPIC_API_KEY are validated lazily via the helpers
// inside main(); BATCH_ID is script-specific so we still read + guard it
// here (clearer error than letting requireAnthropicEnv pass and the
// fetch URL fail).
const BATCH_ID = process.env.BATCH_ID;
if (!BATCH_ID) {
  console.error("Missing BATCH_ID env (the msgbatch_… id from a previous ingest:an run)");
  process.exit(1);
}
const ANTHROPIC_KEY = requireAnthropicEnv();

// ──────────────────── AN parsing ─────────────────────────────────────────────
// CACHE_DIR + JSON_DIR + iterEligibleScrutins live in scripts/lib/an-cache.ts
// (shared with ingest-an.ts + ingest-personnalites.ts since session 97).
// `ParsedRaw` is kept as a local alias for readability in this script.
type ParsedRaw = ParsedScrutinCore;

// ─────────────────────────────────── main ────────────────────────────────────

async function loadEligibleScrutins(): Promise<Map<string, ParsedRaw>> {
  const out = new Map<string, ParsedRaw>();
  for await (const { parsed } of iterEligibleScrutins()) {
    out.set(parsed.id, parsed);
  }
  return out;
}

async function main(): Promise<void> {
  const eligible = await loadEligibleScrutins();
  console.log(`◯ Loaded ${eligible.size} eligible scrutins from local AN cache`);

  console.log(`↓ Fetching batch ${BATCH_ID} results from Anthropic…`);
  // The `!` is safe — the module-level guard at line 35 exits the process
  // if BATCH_ID is undefined. TS narrows that at module scope but loses
  // the narrowing inside async main(); same pattern as the ANTHROPIC_KEY
  // narrowing dance noted in scripts/lib/env.ts comments.
  const r = await fetch(anthropicBatchResultsUrl(BATCH_ID!), {
    headers: anthropicHeaders(ANTHROPIC_KEY),
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
      summaries.set(result.custom_id, extractAnthropicSummary(result.result.message));
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

  const sb = requireSupabaseClient();
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
