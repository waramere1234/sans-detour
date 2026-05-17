import { describe, it, expect, vi } from "vitest";

// Force the no-supabase fallback path. The repo's .env.local supplies
// VITE_SUPABASE_URL/KEY, which `src/lib/supabase.ts` would otherwise
// pick up *even in test mode* (vite loads .env.local for the test
// command too) — making fetchScrutins hit the live DB and yielding
// non-deterministic counts. Module-level mock ensures `supabase` is
// null when `scrutins.ts` imports it.
vi.mock("../src/lib/supabase", () => ({ supabase: null }));

import { fetchScrutins, fetchFreshness } from "../src/lib/scrutins";
import fixtures from "../supabase/seed/dev-fixtures.json";
import type { Scrutin } from "../src/types";

// src/lib/scrutins.ts has two consumers (Cover via FreshnessBanner +
// useFreshnessOnce, Play+Result via fetchScrutins) and two important
// fallback branches: (1) no supabase client → return the local
// dev-fixtures.json so the dev/test environments aren't blocked on
// VITE_SUPABASE_* env, (2) malformed `ingere_le` → fall back to a
// now-anchored sync ETA so FreshnessBanner doesn't crash.
//
// The vi.mock above pins the supabase client to null so every test in
// this file exercises the fallback path — the live-supabase path is
// integration-tested manually.

describe("fetchScrutins — fallback (no supabase client)", () => {
  it("returns the dev fixtures unchanged when supabase is null", async () => {
    const result = await fetchScrutins();
    expect(result).toEqual(fixtures);
  });

  it("returns 20 scrutins (V1 fixture count)", async () => {
    const result = await fetchScrutins();
    expect(result).toHaveLength(20);
  });

  it("every scrutin has the shape the front consumes", async () => {
    const result: Scrutin[] = await fetchScrutins();
    for (const s of result) {
      expect(typeof s.id).toBe("string");
      expect(typeof s.numero).toBe("number");
      expect(typeof s.date).toBe("string");
      expect(typeof s.titre_brut).toBe("string");
      expect(s.position_par_groupe).toBeTypeOf("object");
    }
  });
});

describe("fetchFreshness — fallback (no supabase client)", () => {
  it("returns total_scrutins equal to the fixture count", async () => {
    const f = await fetchFreshness();
    expect(f.total_scrutins).toBe((fixtures as Scrutin[]).length);
  });

  it("returns last_sync_at as a parseable ISO timestamp", async () => {
    const f = await fetchFreshness();
    const parsed = new Date(f.last_sync_at).getTime();
    expect(Number.isNaN(parsed)).toBe(false);
  });

  it("returns next_sync_eta ~7 days after last_sync_at", async () => {
    const f = await fetchFreshness();
    const last = new Date(f.last_sync_at).getTime();
    const next = new Date(f.next_sync_eta).getTime();
    // Allow a 1-second slack to account for the two Date.now() calls
    // happening in adjacent statements inside fetchFreshness.
    expect(Math.abs(next - last - 7 * 86400_000)).toBeLessThan(1000);
  });

  it("last_sync_at + next_sync_eta are both valid ISO 8601 strings", async () => {
    // Co-tests with the +7d check above: those check timing math; this
    // one pins the wire format the FreshnessBanner depends on (it parses
    // the string with `new Date(...)`; a missing-T or missing-Z would
    // break the relative-time display).
    const f = await fetchFreshness();
    expect(f.last_sync_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(f.next_sync_eta).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
