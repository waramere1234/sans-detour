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
  const { error } = await sb.from("scrutins").upsert(fixtures as any[]);
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log(`Seeded ${(fixtures as any[]).length} scrutins.`);
}
main();
