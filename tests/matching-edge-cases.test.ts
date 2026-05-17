// tests/matching-edge-cases.test.ts
import { describe, it, expect } from "vitest";
import {
  alignmentScore,
  computeAlignment, computeAlignmentPersonnalites,
  rankByAlignment, rankPersonnalitesByAlignment,
} from "../src/lib/matching";
import { GROUP_CODES, PERSONNALITE_CODES } from "../src/types";
import type { Scrutin, SessionVote } from "../src/types";

function mkScrutin(id: string, positions: Partial<Record<string, "pour" | "contre" | "abstention" | "divisé">>): Scrutin {
  return {
    id, numero: 1, date: "2024-01-01",
    dossier_id: "d1", dossier_titre: "T",
    chapeau: "X · Y", titre_brut: "...", titre_pedago: "...",
    position_par_groupe: positions as any,
    votes_bruts: {} as any,
    url_an_officielle: "https://example.com",
    est_solennel: true, pedago_relu: false,
  };
}

describe("alignmentScore — full matrix completion", () => {
  it("returns 0.5 when user votes pour and group abstains (partial alignment)", () => {
    expect(alignmentScore("pour", "abstention")).toBe(0.5);
  });

  it("returns null for skip on any group position", () => {
    expect(alignmentScore("skip", "contre")).toBeNull();
    expect(alignmentScore("skip", "abstention")).toBeNull();
    expect(alignmentScore("skip", "divisé")).toBeNull();
  });
});

describe("computeAlignment — defensive cases", () => {
  it("silently skips votes pointing to unknown scrutin_id", () => {
    const scrutins: Scrutin[] = [mkScrutin("s1", { LFI: "pour" })];
    const votes: SessionVote[] = [
      { scrutin_id: "s1", choice: "pour", voted_at: 1 },
      { scrutin_id: "ghost", choice: "pour", voted_at: 2 },
    ];
    const result = computeAlignment(scrutins, votes);
    expect(result.LFI.counted).toBe(1);
    expect(result.LFI.perfect).toBe(1);
  });

  it("handles group missing from position_par_groupe (undefined)", () => {
    const scrutins: Scrutin[] = [mkScrutin("s1", { LFI: "pour" })];
    const votes: SessionVote[] = [
      { scrutin_id: "s1", choice: "pour", voted_at: 1 },
    ];
    const result = computeAlignment(scrutins, votes);
    expect(result.RN.counted).toBe(0);
    expect(result.RN.divided_excluded).toBe(0);
    expect(result.RN.pct).toBe(0);
  });

  it("returns pct=0 counted=0 for all groups when all votes are skip", () => {
    const scrutins: Scrutin[] = [
      mkScrutin("s1", { LFI: "pour", RN: "contre" }),
      mkScrutin("s2", { LFI: "pour", RN: "contre" }),
    ];
    const votes: SessionVote[] = [
      { scrutin_id: "s1", choice: "skip", voted_at: 1 },
      { scrutin_id: "s2", choice: "skip", voted_at: 2 },
    ];
    const result = computeAlignment(scrutins, votes);
    for (const code of GROUP_CODES) {
      expect(result[code].counted).toBe(0);
      expect(result[code].pct).toBe(0);
    }
  });

  it("rounds pct via Math.round (e.g. 2.5/3 → 83%, not 84%)", () => {
    const scrutins: Scrutin[] = [
      mkScrutin("s1", { LFI: "pour" }),
      mkScrutin("s2", { LFI: "pour" }),
      mkScrutin("s3", { LFI: "abstention" }),
    ];
    const votes: SessionVote[] = [
      { scrutin_id: "s1", choice: "pour", voted_at: 1 },
      { scrutin_id: "s2", choice: "pour", voted_at: 2 },
      { scrutin_id: "s3", choice: "pour", voted_at: 3 },
    ];
    const result = computeAlignment(scrutins, votes);
    expect(result.LFI.pct).toBe(83);
  });
});

describe("rankByAlignment", () => {
  it("sorts groups by pct descending", () => {
    const scrutins: Scrutin[] = [
      mkScrutin("s1", { LFI: "pour", RN: "contre", EPR: "pour" }),
    ];
    const votes: SessionVote[] = [
      { scrutin_id: "s1", choice: "pour", voted_at: 1 },
    ];
    const a = computeAlignment(scrutins, votes);
    const ranked = rankByAlignment(a);
    expect(ranked[0].pct).toBe(100);
    expect(ranked[ranked.length - 1].pct).toBe(0);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].pct).toBeGreaterThanOrEqual(ranked[i].pct);
    }
  });

  it("returns an array of length GROUP_CODES.length", () => {
    const a = computeAlignment([], []);
    const ranked = rankByAlignment(a);
    expect(ranked.length).toBe(GROUP_CODES.length);
  });

  it("ranking is stable on ties (follows GROUP_CODES order)", () => {
    const a = computeAlignment([], []);
    const ranked = rankByAlignment(a);
    expect(ranked.map((r) => r.group)).toEqual([...GROUP_CODES]);
  });
});

describe("rankPersonnalitesByAlignment", () => {
  it("returns an array of length PERSONNALITE_CODES.length", () => {
    const a = computeAlignmentPersonnalites([], []);
    const ranked = rankPersonnalitesByAlignment(a);
    expect(ranked.length).toBe(PERSONNALITE_CODES.length);
  });

  it("ranking is stable on ties (follows PERSONNALITE_CODES order)", () => {
    const a = computeAlignmentPersonnalites([], []);
    const ranked = rankPersonnalitesByAlignment(a);
    expect(ranked.map((r) => r.personnalite)).toEqual([...PERSONNALITE_CODES]);
  });

  it("pushes low-data personnalités to the bottom even with a 100% pct", () => {
    // A 100%-on-1-vote score must NOT outrank a 60%-on-20-votes — otherwise
    // the ranking lies about the strength of the signal. Two-pass sort:
    // counted < LOW_DATA_THRESHOLD (=3) bucket goes to the bottom, then by
    // pct desc within each bucket. (Logic in src/lib/matching.ts.)
    const empty = computeAlignmentPersonnalites([], []);
    // Forge alignments: le_pen has 1 perfect vote (100% / counted=1, low-data);
    // faure has 12 perfect + 8 conflict over 20 votes (60% / counted=20).
    empty.le_pen = { ...empty.le_pen, counted: 1, perfect: 1, pct: 100 };
    empty.faure  = { ...empty.faure,  counted: 20, perfect: 12, conflict: 8, pct: 60 };
    const ranked = rankPersonnalitesByAlignment(empty);
    const faureIdx = ranked.findIndex((r) => r.personnalite === "faure");
    const lepenIdx = ranked.findIndex((r) => r.personnalite === "le_pen");
    expect(faureIdx).toBeLessThan(lepenIdx);
  });

  it("ranks by pct within the regular (non low-data) bucket", () => {
    const a = computeAlignmentPersonnalites([], []);
    a.le_pen = { ...a.le_pen, counted: 10, perfect: 8, conflict: 2, pct: 80 };
    a.faure  = { ...a.faure,  counted: 10, perfect: 5, conflict: 5, pct: 50 };
    const ranked = rankPersonnalitesByAlignment(a);
    const lepenIdx = ranked.findIndex((r) => r.personnalite === "le_pen");
    const faureIdx = ranked.findIndex((r) => r.personnalite === "faure");
    expect(lepenIdx).toBeLessThan(faureIdx);
  });
});
