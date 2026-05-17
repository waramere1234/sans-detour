// scripts/seed-supabase.ts
//
// Dev-mode seed: upserts the 20 scrutins from supabase/seed/dev-fixtures.json
// into a local Supabase project so `npm run dev` can hit a real database
// instead of falling back to the file fixtures. Re-runs are idempotent
// (upsert on PK `id`); `ingere_le` is stamped on every fixture so the
// FreshnessBanner shows the seed timestamp (default now() only fires on
// INSERT, not on the UPSERT-as-UPDATE path — same pattern as ingest-an.ts).
//
// Usage:
//   SUPABASE_URL=https://xxx.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
//   npm run seed
//
// Anthropic API key is NOT required — fixtures are pre-baked.

import fixtures from "../supabase/seed/dev-fixtures.json";
import { requireSupabaseClient } from "./lib/env";

const sb = requireSupabaseClient();

async function main() {
  // Stamp ingere_le on every fixture so FreshnessBanner reports today's
  // date after a seed. The column has `default now()` (migration 0001)
  // but the default only applies on INSERT — on UPSERT/UPDATE Postgres
  // keeps the old value. Same fix pattern as ingest-an.ts (session 70).
  const seededAt = new Date().toISOString();
  const rows = (fixtures as Array<Record<string, unknown>>).map(
    (f) => ({ ...f, ingere_le: seededAt }),
  );
  const { error } = await sb.from("scrutins").upsert(rows);
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log(`Seeded ${rows.length} scrutins.`);
}

// Match the .catch + process.exit(1) pattern used by ingest-an.ts,
// resume-ingest.ts, debug-batch.ts, and ingest-personnalites.ts. Without
// it, an unhandled rejection inside main() exits with code 0 (modulo
// an UnhandledPromiseRejectionWarning), masking failures from
// `npm run seed` in CI / dev shells.
main().catch((e) => { console.error(e); process.exit(1); });
