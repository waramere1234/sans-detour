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
