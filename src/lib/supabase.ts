// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// No `as string | undefined` cast — ImportMetaEnv is now typed in
// src/vite-env.d.ts so these are already `string | undefined`.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn("[sans-detour] No Supabase env, using dev fixtures.");
}

export const supabase = url && key ? createClient(url, key) : null;
