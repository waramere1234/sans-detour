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

import { createClient } from "@supabase/supabase-js";
import fixtures from "../supabase/seed/dev-fixtures.json";

// Pattern aligned with ingest-an.ts / resume-ingest.ts / ingest-personnalites.ts —
// declare without `!` so TypeScript types stay honest (`string | undefined`),
// then narrow via the runtime check before passing to createClient.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

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
main();
