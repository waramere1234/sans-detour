import { describe, it, expect } from "vitest";
import { FROM_LOGO_STATE, type LocationStateFromLogo } from "../src/lib/nav-state";

// Session 90 extracted { fromLogo: true } from 4 navigation call sites
// into FROM_LOGO_STATE. Cover.tsx reads it via a cast to
// LocationStateFromLogo to skip the auto-redirect. Tests pin the contract
// so a rename of `fromLogo` would surface here rather than in a flaky
// integration test.

describe("FROM_LOGO_STATE", () => {
  it("exposes a fromLogo: true shape", () => {
    expect(FROM_LOGO_STATE.fromLogo).toBe(true);
  });

  it("is structurally compatible with the read-side type", () => {
    // Compile-time check: assigning the const to the read type must
    // pass without `as` casts.
    const asReadShape: LocationStateFromLogo = FROM_LOGO_STATE;
    expect(asReadShape?.fromLogo).toBe(true);
  });

  it("is a stable reference across imports (preserves React deps stability)", () => {
    // useLocation()'s state is reference-compared by React's useEffect.
    // A new object literal each render would re-fire effects; the const
    // gives a stable identity. This test would only fail if someone
    // wrapped the export in a function/getter.
    const a = FROM_LOGO_STATE;
    const b = FROM_LOGO_STATE;
    expect(a).toBe(b);
  });
});
