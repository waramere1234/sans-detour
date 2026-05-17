// src/hooks/useFreshnessOnce.ts
import { useEffect, useRef, useState } from "react";
import { fetchFreshness } from "../lib/scrutins";
import type { FreshnessInfo } from "../types";

/** Fetch `FreshnessInfo` once per mount and return it (or `null` while
 *  loading / on failure). Extracted from Cover.tsx and Methode.tsx which
 *  inlined the same state + ref + effect (session 70 introduced the
 *  fetchedRef-on-success pattern so a transient failure doesn't kill the
 *  banner for the rest of the visit).
 *
 *  The ref is set to `true` only after a successful fetch, so React
 *  StrictMode's intentional double-invoke in dev still avoids two
 *  Supabase round-trips. A failure swallows silently — the banner
 *  simply doesn't render, which is the desired graceful degradation. */
export function useFreshnessOnce(): FreshnessInfo | null {
  const [info, setInfo] = useState<FreshnessInfo | null>(null);
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchFreshness()
      .then((freshness) => {
        fetchedRef.current = true;
        setInfo(freshness);
      })
      .catch(() => {});
  }, []);
  return info;
}
