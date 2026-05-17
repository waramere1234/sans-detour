import { describe, it, expect } from "vitest";
import { computeGroupPosition, THRESHOLD } from "../src/lib/compute-positions";

// THRESHOLD is the documented Methode §03 invariant. Tests derive boundary
// inputs from it (e.g. `pourAtThreshold = THRESHOLD * 100`) so a bump to
// 0.75 propagates correctly — previously the literal `7 pour / 2 contre /
// 1 abstention` ("70% exactly") would have passed silently against a
// new 75% threshold.

describe("computeGroupPosition (≥ THRESHOLD)", () => {
  it("returns 'pour' when ≥ THRESHOLD of effective voters are pour", () => {
    // Derive a 100-vote sample at exactly the threshold ratio.
    const pour = THRESHOLD * 100; // 70 today, would be 75 if THRESHOLD = 0.75
    expect(computeGroupPosition({ pour, contre: 100 - pour - 5, abstention: 5, absent: 5 })).toBe("pour");
  });

  it("returns 'contre' when ≥ THRESHOLD of effective voters are contre", () => {
    expect(computeGroupPosition({ pour: 5, contre: 80, abstention: 15, absent: 0 })).toBe("contre");
  });

  it("returns 'abstention' when ≥ THRESHOLD of effective voters abstain", () => {
    expect(computeGroupPosition({ pour: 10, contre: 10, abstention: 80, absent: 3 })).toBe("abstention");
  });

  it("returns 'divisé' when no category reaches THRESHOLD", () => {
    expect(computeGroupPosition({ pour: 50, contre: 30, abstention: 20, absent: 10 })).toBe("divisé");
  });

  it("excludes 'absent' (non-votants) from the denominator", () => {
    expect(computeGroupPosition({ pour: 70, contre: 30, abstention: 0, absent: 50 })).toBe("pour");
  });

  it("returns 'divisé' if there are zero effective voters", () => {
    expect(computeGroupPosition({ pour: 0, contre: 0, abstention: 0, absent: 12 })).toBe("divisé");
  });

  it("THRESHOLD boundary is inclusive (≥ THRESHOLD, not strict >)", () => {
    // Build a 10-vote sample at exactly the threshold so the inclusiveness
    // bit is tested against the actual constant — flipping >= to > would
    // surface here regardless of the THRESHOLD value.
    const atThreshold = Math.round(THRESHOLD * 10);
    const rest = 10 - atThreshold;
    expect(computeGroupPosition({ pour: atThreshold, contre: rest, abstention: 0, absent: 0 })).toBe("pour");
  });

  it("just below THRESHOLD is 'divisé' (rules out ≥-vs-> confusion)", () => {
    // One vote short of the threshold among 10 effective voters.
    const justBelow = Math.round(THRESHOLD * 10) - 1;
    const rest = 10 - justBelow;
    expect(computeGroupPosition({ pour: justBelow, contre: rest, abstention: 0, absent: 0 })).toBe("divisé");
  });

  it("THRESHOLD is the canonical Methode §03 value (currently 0.70)", () => {
    // Pin the actual value here — if it's bumped to 0.75 the bump is
    // deliberate and lands together with this test edit.
    expect(THRESHOLD).toBe(0.70);
  });
});
