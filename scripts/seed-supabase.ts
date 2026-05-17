import { createClient } from "@supabase/supabase-js";
import fixtures from "../supabase/seed/dev-fixtures.json";

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env");
  process.exit(1);
}

const sb = createClient(url, key);

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
