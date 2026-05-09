// src/lib/scrutins.ts
import { supabase } from "./supabase";
import type { Scrutin, FreshnessInfo } from "../types";
import fixtures from "../../supabase/seed/dev-fixtures.json";

export async function fetchScrutins(): Promise<Scrutin[]> {
  if (!supabase) {
    return fixtures as Scrutin[];
  }
  const { data, error } = await supabase
    .from("scrutins")
    .select("*")
    .eq("est_solennel", true)
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
  const { data, error } = await supabase
    .from("scrutins")
    .select("ingere_le")
    .order("ingere_le", { ascending: false })
    .limit(1);
  if (error) throw error;
  const lastSync = data?.[0]?.ingere_le ?? new Date().toISOString();
  const { count } = await supabase
    .from("scrutins")
    .select("*", { count: "exact", head: true })
    .eq("est_solennel", true);
  return {
    total_scrutins: count ?? 0,
    last_sync_at: lastSync,
    next_sync_eta: new Date(new Date(lastSync).getTime() + 7 * 86400_000).toISOString(),
  };
}
