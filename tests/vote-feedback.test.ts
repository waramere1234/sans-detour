import { describe, it, expect } from "vitest";
import { nextVoteLabel, voteLabel, ZWSP } from "../src/lib/vote-feedback";

// src/lib/vote-feedback.ts owns the aria-live vote-announcement composition
// pulled out of Play.tsx. Two invariants matter:
//   - the base label for each choice (pour/contre/skip) is the documented
//     French phrasing — a refactor that changes "Voté pour" to "Vote pour"
//     would silently break SR feedback
//   - the ZWSP alternation forces aria-live="polite" to re-announce on
//     identical consecutive votes (without it, two "Pour" in a row reads
//     once because the string didn't change)

describe("voteLabel — base French phrasing per choice", () => {
  it("pour → 'Voté pour. Carte suivante.'", () => {
    expect(voteLabel("pour")).toBe("Voté pour. Carte suivante.");
  });

  it("contre → 'Voté contre. Carte suivante.'", () => {
    expect(voteLabel("contre")).toBe("Voté contre. Carte suivante.");
  });

  it("skip → 'Passé. Carte suivante.'", () => {
    expect(voteLabel("skip")).toBe("Passé. Carte suivante.");
  });
});

describe("nextVoteLabel — zero-width-space alternation", () => {
  it("appends ZWSP on the first call (prev is empty string)", () => {
    const out = nextVoteLabel("", "pour");
    expect(out).toBe("Voté pour. Carte suivante." + ZWSP);
    expect(out.endsWith(ZWSP)).toBe(true);
  });

  it("strips ZWSP when prev already ended with one (alternation)", () => {
    const first = nextVoteLabel("", "pour"); // ends with ZWSP
    const second = nextVoteLabel(first, "pour"); // identical choice
    expect(second).toBe("Voté pour. Carte suivante."); // no trailing ZWSP
    expect(second).not.toBe(first); // string still mutated → aria-live re-announces
  });

  it("flips ZWSP back on the third identical vote (always different from prev)", () => {
    let s = "";
    const seen = new Set<string>();
    for (let i = 0; i < 6; i++) {
      s = nextVoteLabel(s, "pour");
      // Each value must differ from the immediately previous one (recorded in
      // `seen` only as a sanity check that alternation actually happens; the
      // single-character flip means we'll see at most 2 distinct strings).
      seen.add(s);
    }
    expect(seen.size).toBe(2);
  });

  it("alternation works across different choices too", () => {
    // pour → contre after a ZWSP-tailed prev should drop the ZWSP.
    const pourEndZWSP = nextVoteLabel("", "pour");
    expect(pourEndZWSP.endsWith(ZWSP)).toBe(true);
    const contreNoZWSP = nextVoteLabel(pourEndZWSP, "contre");
    expect(contreNoZWSP.endsWith(ZWSP)).toBe(false);
    expect(contreNoZWSP).toBe("Voté contre. Carte suivante.");
  });

  it("every consecutive call produces a string different from its predecessor", () => {
    let prev = "";
    const choices = ["pour", "pour", "contre", "skip", "pour", "skip", "contre"] as const;
    for (const c of choices) {
      const next = nextVoteLabel(prev, c);
      expect(next).not.toBe(prev);
      prev = next;
    }
  });
});

describe("ZWSP constant", () => {
  it("is the official zero-width space code point (U+200B)", () => {
    expect(ZWSP).toBe("​");
    expect(ZWSP.length).toBe(1);
  });
});
