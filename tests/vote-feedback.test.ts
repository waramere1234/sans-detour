import { describe, it, expect } from "vitest";
import { nextVoteLabel, voteLabel, ZWSP, VOTE_FEEDBACK_LABELS } from "../src/lib/vote-feedback";

// src/lib/vote-feedback.ts owns the aria-live vote-announcement composition
// pulled out of Play.tsx. Two invariants matter:
//   - the base label for each choice (pour/contre/skip) is the documented
//     French phrasing — a refactor that changes "Voté pour" to "Vote pour"
//     would silently break SR feedback
//   - the ZWSP alternation forces aria-live="polite" to re-announce on
//     identical consecutive votes (without it, two "Pour" in a row reads
//     once because the string didn't change)

describe("voteLabel — base French phrasing per choice (round-trip via VOTE_FEEDBACK_LABELS)", () => {
  it("pour → VOTE_FEEDBACK_LABELS.pour", () => {
    expect(voteLabel("pour")).toBe(VOTE_FEEDBACK_LABELS.pour);
    expect(VOTE_FEEDBACK_LABELS.pour).toBe("Voté pour. Carte suivante.");
  });

  it("contre → VOTE_FEEDBACK_LABELS.contre", () => {
    expect(voteLabel("contre")).toBe(VOTE_FEEDBACK_LABELS.contre);
    expect(VOTE_FEEDBACK_LABELS.contre).toBe("Voté contre. Carte suivante.");
  });

  it("skip → VOTE_FEEDBACK_LABELS.skip", () => {
    expect(voteLabel("skip")).toBe(VOTE_FEEDBACK_LABELS.skip);
    expect(VOTE_FEEDBACK_LABELS.skip).toBe("Passé. Carte suivante.");
  });

  it("all 3 labels end with 'Carte suivante.' (consistent SR feedback closer)", () => {
    // Pin the contract: each vote announcement ends with the same
    // "next card incoming" hint. A future divergence (e.g. dropping
    // "Carte suivante." on skip) would change the SR experience
    // unevenly across vote types.
    expect(VOTE_FEEDBACK_LABELS.pour.endsWith("Carte suivante.")).toBe(true);
    expect(VOTE_FEEDBACK_LABELS.contre.endsWith("Carte suivante.")).toBe(true);
    expect(VOTE_FEEDBACK_LABELS.skip.endsWith("Carte suivante.")).toBe(true);
  });
});

describe("nextVoteLabel — zero-width-space alternation", () => {
  it("appends ZWSP on the first call (prev is empty string)", () => {
    const out = nextVoteLabel("", "pour");
    expect(out).toBe(VOTE_FEEDBACK_LABELS.pour + ZWSP);
    expect(out.endsWith(ZWSP)).toBe(true);
  });

  it("strips ZWSP when prev already ended with one (alternation)", () => {
    const first = nextVoteLabel("", "pour"); // ends with ZWSP
    const second = nextVoteLabel(first, "pour"); // identical choice
    expect(second).toBe(VOTE_FEEDBACK_LABELS.pour); // no trailing ZWSP
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
    expect(contreNoZWSP).toBe(VOTE_FEEDBACK_LABELS.contre);
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
