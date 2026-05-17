import { describe, it, expect } from "vitest";
import {
  computeAlignment, alignmentScore,
  computeAlignmentPersonnalites, alignmentScorePersonnalite,
} from "../src/lib/matching";
import type { Scrutin, SessionVote, PersonnaliteVote } from "../src/types";

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

describe("alignmentScore (single scrutin)", () => {
  it("returns 1 when user vote matches group position exactly", () => {
    expect(alignmentScore("pour", "pour")).toBe(1);
    expect(alignmentScore("contre", "contre")).toBe(1);
  });

  it("returns 0.5 when one side abstains and the other votes", () => {
    expect(alignmentScore("pour", "abstention")).toBe(0.5);
    expect(alignmentScore("contre", "abstention")).toBe(0.5);
  });

  it("returns 0 when user pour and group contre", () => {
    expect(alignmentScore("pour", "contre")).toBe(0);
    expect(alignmentScore("contre", "pour")).toBe(0);
  });

  it("returns null when user skips (not counted)", () => {
    expect(alignmentScore("skip", "pour")).toBeNull();
  });

  it("returns null when group is divisé (not counted)", () => {
    expect(alignmentScore("pour", "divisé")).toBeNull();
  });
});

describe("computeAlignment (full session)", () => {
  it("returns 0% counted for empty session", () => {
    const result = computeAlignment([], []);
    expect(result.LFI?.counted ?? 0).toBe(0);
  });

  it("computes per-group alignment with breakdown", () => {
    const scrutins: Scrutin[] = [
      mkScrutin("s1", { LFI: "pour", RN: "contre" }),
      mkScrutin("s2", { LFI: "pour", RN: "pour" }),
      mkScrutin("s3", { LFI: "abstention", RN: "contre" }),
      mkScrutin("s4", { LFI: "divisé", RN: "pour" }),
    ];
    const votes: SessionVote[] = [
      { scrutin_id: "s1", choice: "pour", voted_at: 1 },
      { scrutin_id: "s2", choice: "pour", voted_at: 2 },
      { scrutin_id: "s3", choice: "pour", voted_at: 3 },
      { scrutin_id: "s4", choice: "pour", voted_at: 4 },
    ];

    const result = computeAlignment(scrutins, votes);

    // LFI: s1=+1, s2=+1, s3=+0.5 (pour vs abst), s4 excluded (divisé)
    // total = 2.5/3 = 83%
    expect(result.LFI.pct).toBe(83);
    expect(result.LFI.counted).toBe(3);
    expect(result.LFI.perfect).toBe(2);
    expect(result.LFI.partial).toBe(1);
    expect(result.LFI.conflict).toBe(0);
    expect(result.LFI.divided_excluded).toBe(1);

    // RN: s1=0, s2=+1, s3=0, s4=+1 → 2/4 = 50%
    expect(result.RN.pct).toBe(50);
    expect(result.RN.counted).toBe(4);
  });

  it("excludes user skips from all group denominators", () => {
    const scrutins: Scrutin[] = [
      mkScrutin("s1", { LFI: "pour", RN: "contre" }),
      mkScrutin("s2", { LFI: "pour", RN: "contre" }),
    ];
    const votes: SessionVote[] = [
      { scrutin_id: "s1", choice: "pour", voted_at: 1 },
      { scrutin_id: "s2", choice: "skip", voted_at: 2 },
    ];
    const result = computeAlignment(scrutins, votes);
    expect(result.LFI.counted).toBe(1);
    expect(result.RN.counted).toBe(1);
  });
});

describe("alignmentScorePersonnalite (single scrutin)", () => {
  it("matches the group formula on actual votes", () => {
    expect(alignmentScorePersonnalite("pour", "pour")).toBe(1);
    expect(alignmentScorePersonnalite("pour", "contre")).toBe(0);
    expect(alignmentScorePersonnalite("pour", "abstention")).toBe(0.5);
  });
  it("returns null when the personality was absent or not yet a député", () => {
    expect(alignmentScorePersonnalite("pour", "absent")).toBeNull();
    expect(alignmentScorePersonnalite("pour", "non_dispo")).toBeNull();
  });
  it("returns null when the user skipped", () => {
    expect(alignmentScorePersonnalite("skip", "pour")).toBeNull();
  });
});

describe("computeAlignmentPersonnalites (full session)", () => {
  function mkScrutinPers(id: string, votes: Partial<Record<string, PersonnaliteVote>>): Scrutin {
    return {
      ...mkScrutin(id, { LFI: "pour", RN: "contre" }),
      votes_personnalites: votes as any,
    };
  }
  it("returns 0 counted when no scrutin has personnalité data", () => {
    const result = computeAlignmentPersonnalites(
      [mkScrutin("s1", { LFI: "pour" })],
      [{ scrutin_id: "s1", choice: "pour", voted_at: 1 }],
    );
    expect(result.le_pen.counted).toBe(0);
  });
  it("computes alignment and tracks absent / non_dispo exclusions", () => {
    const scrutins: Scrutin[] = [
      mkScrutinPers("s1", { le_pen: "pour",       chatelain: "non_dispo" }),
      mkScrutinPers("s2", { le_pen: "abstention", chatelain: "absent"   }),
      mkScrutinPers("s3", { le_pen: "contre",     chatelain: "pour"     }),
    ];
    const votes: SessionVote[] = [
      { scrutin_id: "s1", choice: "pour", voted_at: 1 },
      { scrutin_id: "s2", choice: "pour", voted_at: 2 },
      { scrutin_id: "s3", choice: "pour", voted_at: 3 },
    ];
    const r = computeAlignmentPersonnalites(scrutins, votes);
    // Le Pen: s1=+1, s2=+0.5, s3=0 → 1.5/3 = 50%
    expect(r.le_pen.pct).toBe(50);
    expect(r.le_pen.counted).toBe(3);
    expect(r.le_pen.perfect).toBe(1);
    expect(r.le_pen.partial).toBe(1);
    expect(r.le_pen.conflict).toBe(1);
    // Chatelain: s1=non_dispo, s2=absent, s3=+1 → 1/1 = 100%
    expect(r.chatelain.pct).toBe(100);
    expect(r.chatelain.counted).toBe(1);
    expect(r.chatelain.non_dispo_excluded).toBe(1);
    expect(r.chatelain.absent_excluded).toBe(1);
  });
});
