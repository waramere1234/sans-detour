// supabase/functions/ingest-scrutins/index.ts
//
// Edge function entry point. Pulls the AN bulk scrutin file, filters down
// to solemn votes we don't already have, computes group positions, asks
// the LLM for a chapeau + pédagogique title, and inserts the row.
//
// Designed to be safe to re-run: existing scrutin ids are skipped.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fetchScrutinsFromAN } from "./fetch-an.ts";
import { parse } from "./parse-scrutins.ts";
import { summarize } from "./summarize.ts";
import {
  computeGroupPosition,
  type GroupPosition,
  type GroupVoteBreakdown,
} from "./compute-positions.ts";

Deno.serve(async () => {
  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const raw = await fetchScrutinsFromAN();
  const counts = { added: 0, skipped: 0, errors: 0 };

  for (const r of raw) {
    try {
      const parsed = parse(r);
      if (!parsed.est_solennel) {
        counts.skipped++;
        continue;
      }

      const { data: existing } = await sb
        .from("scrutins")
        .select("id")
        .eq("id", parsed.id)
        .single();
      if (existing) {
        counts.skipped++;
        continue;
      }

      const position_par_groupe: Record<string, GroupPosition> = {};
      for (const [code, breakdown] of Object.entries(parsed.votes_bruts)) {
        position_par_groupe[code] = computeGroupPosition(
          breakdown as GroupVoteBreakdown,
        );
      }

      const sum = await summarize(parsed.titre_brut);

      const { error } = await sb.from("scrutins").insert({
        ...parsed,
        chapeau: sum.chapeau,
        titre_pedago: sum.titre_pedago,
        position_par_groupe,
        pedago_relu: false,
      });
      if (error) {
        counts.errors++;
        continue;
      }
      counts.added++;
    } catch (e) {
      console.error(r.uid, e);
      counts.errors++;
    }
  }

  return new Response(JSON.stringify(counts), {
    headers: { "content-type": "application/json" },
  });
});
