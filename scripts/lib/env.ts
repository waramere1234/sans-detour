// scripts/lib/env.ts
//
// Shared environment-variable readers + Supabase client factory for the
// ingest scripts. Before this lib, each of the 4 Supabase scripts and 3
// Anthropic-touching scripts inlined:
//
//   const SUPABASE_URL = process.env.SUPABASE_URL;
//   const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
//   if (!SUPABASE_URL || !SUPABASE_KEY) {
//     console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env");
//     process.exit(1);
//   }
//   // …
//   const sb = createClient(SUPABASE_URL!, SUPABASE_KEY!);
//
// The `!` was forced because TypeScript narrows the const at module scope
// after the if-guard, but async main() runs in a new scope without that
// narrowing (verified in session 89). Centralising the read + validate
// step lets the caller skip the `!` because the helper returns narrowed
// `string` values directly.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Read SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from `process.env` and
 *  exit the process with a clear message when either is missing. Returns
 *  the pair as narrowed `string`s for use at any scope (top-level or
 *  inside async functions) without `!` assertions. */
export function requireSupabaseEnv(): { url: string; key: string } {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env");
    process.exit(1);
  }
  return { url, key };
}

/** Read + validate the Supabase env and return a ready-to-use service-
 *  role client. Convenience wrapper around `requireSupabaseEnv` +
 *  `createClient` — the most common path. */
export function requireSupabaseClient(): SupabaseClient {
  const { url, key } = requireSupabaseEnv();
  return createClient(url, key);
}

/** Read ANTHROPIC_API_KEY from `process.env` and exit the process with a
 *  clear message when missing. Returns the narrowed `string` for callers
 *  that need to thread it into Anthropic API requests. */
export function requireAnthropicEnv(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    console.error("Missing ANTHROPIC_API_KEY env");
    process.exit(1);
  }
  return key;
}

/** Anthropic Batches API base URL. Centralised so a future move (e.g.
 *  regional endpoint, version bump) is a single edit. Previously
 *  inlined 6× across ingest-an, resume-ingest, debug-batch — each call
 *  site reconstructing `${BASE}/${batchId}` or `${BASE}/${batchId}/results`
 *  from scratch. Helper builders below remove the per-site string
 *  concatenation as a bonus. */
export const ANTHROPIC_BATCHES_URL = "https://api.anthropic.com/v1/messages/batches";

/** URL for a specific batch by id (status + cancel endpoints share it). */
export function anthropicBatchUrl(batchId: string): string {
  return `${ANTHROPIC_BATCHES_URL}/${batchId}`;
}

/** URL for the JSONL results stream of a completed batch. */
export function anthropicBatchResultsUrl(batchId: string): string {
  return `${ANTHROPIC_BATCHES_URL}/${batchId}/results`;
}

/** Anthropic API version header value. Pinned to a known-stable date
 *  per the Versioning docs. Previously inlined 4× across the 3 scripts
 *  (ingest-an, resume-ingest, debug-batch × 2). */
export const ANTHROPIC_API_VERSION = "2023-06-01";

/** Anthropic model id used by the Batches ingestion (V2 P1: Haiku 4.5
 *  + web_search, ~50% off via Batches). Pinned here so a future model
 *  swap is a single edit + an explicit test update — previously a
 *  magic string in the buildRequestParams call. CLAUDE.md notes the
 *  V2 pipeline runs on Haiku 4.5 specifically. */
export const ANTHROPIC_MODEL = "claude-haiku-4-5";

/** Output token budget per scrutin batch request. The analyse field
 *  adds 6 string[] arrays with multiple bullets each — observed
 *  outputs land around 600-900 tokens including the JSON wrapper, so
 *  4096 leaves plenty of headroom. A bump would deliberately accept
 *  higher per-scrutin cost (rare). Exported so future param-tuning
 *  experiments are visible at the lib-level and a regression that
 *  silently drops max_tokens to 1024 (truncating analyse) is caught. */
export const ANTHROPIC_INGEST_MAX_TOKENS = 4096;

/** Cap on web_search invocations per scrutin in the Batches request.
 *  CLAUDE.md V2 P1: "1 à 2 recherches max". Hard-cap defends cost — a
 *  refactor that raises this to 5 would multiply the per-batch search
 *  charge. Pin the value so any change is a deliberate edit. */
export const MAX_WEB_SEARCHES_PER_SCRUTIN = 2;

/** Poll interval (ms) between `getBatchStatus` requests inside
 *  pollBatch. 15 s matches Anthropic's recommended cadence for typical
 *  2-10 min batches — too aggressive wastes status-endpoint quota,
 *  too slow delays the orchestrator's "succeeded → fetch results"
 *  hop. Centralised so a regression accidentally setting it to 100ms
 *  (DoS-ing the status endpoint) surfaces here. */
export const BATCH_POLL_INTERVAL_MS = 15_000;

/** Build the common headers every Anthropic Batches API request needs:
 *  api-key, version, and content-type. Pass the key explicitly so the
 *  helper is usable from both narrowed (`requireAnthropicEnv`) and
 *  optional-key (`ingest-an` fallback path) contexts. */
export function anthropicHeaders(apiKey: string): Record<string, string> {
  return {
    "content-type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": ANTHROPIC_API_VERSION,
  };
}
