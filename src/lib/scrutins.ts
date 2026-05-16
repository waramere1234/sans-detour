// src/lib/scrutins.ts
import { supabase } from "./supabase";
import type { Scrutin, FreshnessInfo } from "../types";
import fixtures from "../../supabase/seed/dev-fixtures.json";

export async function fetchScrutins(): Promise<Scrutin[]> {
  if (!supabase) {
    return fixtures as Scrutin[];
  }
  // Filter on points_cles IS NOT NULL: a card without points_cles came from
  // the ingest fallback (LLM call failed) and is unvotable — no contexte, no
  // analyse, just a truncated raw title. Skip them in the deck rather than
  // ship cards the user can't position on.
  const { data, error } = await supabase
    .from("scrutins")
    .select("*")
    .not("points_cles", "is", null)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Scrutin[];
}

export async function fetchFreshness(): Promise<FreshnessInfo> {
  if (!supabase) {
    return {
      total_scrutins: (fixtures as Scrutin[]).length,
      last_sync_at: new Date().toISOString(),
      next_sync_eta: new Date(Date.now() + 7 * 86400_000).toISOString(),
    };
  }
  // The two queries are independent — parallelise so the banner shows
  // sooner on cold loads. Halves the round-trip latency.
  const [lastSyncRes, countRes] = await Promise.all([
    supabase
      .from("scrutins")
      .select("ingere_le")
      .order("ingere_le", { ascending: false })
      .limit(1),
    supabase
      .from("scrutins")
      .select("*", { count: "exact", head: true })
      .not("points_cles", "is", null),
  ]);
  if (lastSyncRes.error) throw lastSyncRes.error;
  // Without this, a permissions/network error on the count query would
  // silently surface as `total_scrutins: 0` and the banner would render
  // "0 scrutins · MAJ aujourd'hui · sync imminente" — lying about state
  // while the lastSync query happened to succeed.
  if (countRes.error) throw countRes.error;
  const lastSync = lastSyncRes.data?.[0]?.ingere_le ?? new Date().toISOString();
  return {
    total_scrutins: countRes.count ?? 0,
    last_sync_at: lastSync,
    next_sync_eta: new Date(new Date(lastSync).getTime() + 7 * 86400_000).toISOString(),
  };
}
