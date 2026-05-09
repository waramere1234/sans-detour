import { describe, it, expect } from "vitest";
import { computeGroupPosition } from "../src/lib/compute-positions";

describe("computeGroupPosition (≥70% threshold)", () => {
  it("returns 'pour' when ≥70% of effective voters are pour", () => {
    expect(computeGroupPosition({ pour: 70, contre: 20, abstention: 10, absent: 5 })).toBe("pour");
  });

  it("returns 'contre' when ≥70% of effective voters are contre", () => {
    expect(computeGroupPosition({ pour: 5, contre: 80, abstention: 15, absent: 0 })).toBe("contre");
  });

  it("returns 'abstention' when ≥70% of effective voters abstain", () => {
    expect(computeGroupPosition({ pour: 10, contre: 10, abstention: 80, absent: 3 })).toBe("abstention");
  });

  it("returns 'divisé' when no category reaches 70%", () => {
    expect(computeGroupPosition({ pour: 50, contre: 30, abstention: 20, absent: 10 })).toBe("divisé");
  });

  it("excludes 'absent' (non-votants) from the denominator", () => {
    expect(computeGroupPosition({ pour: 70, contre: 30, abstention: 0, absent: 50 })).toBe("pour");
  });

  it("returns 'divisé' if there are zero effective voters", () => {
    expect(computeGroupPosition({ pour: 0, contre: 0, abstention: 0, absent: 12 })).toBe("divisé");
  });

  it("uses exact 70% boundary as inclusive (≥70%)", () => {
    expect(computeGroupPosition({ pour: 7, contre: 2, abstention: 1, absent: 0 })).toBe("pour"); // 70% exactly
  });
});
