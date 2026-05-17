import { describe, it, expect } from "vitest";
import { isEligibleScrutin, type ANScrutinForFilter } from "../scripts/lib/an-filter";

// Session 94 extracted isEligibleScrutin from both ingest scripts into a
// shared lib (it was duplicated with an explicit "MUST stay in sync"
// comment). These tests pin the eligibility branches so a tweak that
// affects which scrutins reach the deck — and which Anthropic batch
// requests we pay for — surfaces here before it ships.

function mk(code: string, titre: string): ANScrutinForFilter {
  return {
    typeVote: { codeTypeVote: code },
    objet: { libelle: titre },
  };
}

describe("isEligibleScrutin", () => {
  describe("amendment exclusions (highest priority)", () => {
    it("drops a title containing 'amendement'", () => {
      expect(isEligibleScrutin(mk("SPS", "Amendement n°42"))).toBe(false);
    });

    it("drops a title containing 'amendements' (plural)", () => {
      expect(isEligibleScrutin(mk("SPS", "Vote sur les amendements"))).toBe(false);
    });

    it("drops 'amendement' even on an SPS scrutin", () => {
      // SPS would otherwise be auto-eligible; the amendment check runs FIRST.
      expect(isEligibleScrutin(mk("SPS", "Amendement de M. Dupont"))).toBe(false);
    });

    it("drops 'à l'article' titles", () => {
      expect(isEligibleScrutin(mk("SOR", "Vote à l'article 3 du projet"))).toBe(false);
    });

    it("amendment match is case-insensitive", () => {
      expect(isEligibleScrutin(mk("SPS", "AMENDEMENT IMPORTANT"))).toBe(false);
    });
  });

  describe("SPS auto-keep", () => {
    it("keeps any SPS that survived the amendment filter", () => {
      expect(isEligibleScrutin(mk("SPS", "Projet de loi de finances 2026"))).toBe(true);
    });
  });

  describe("'sur l'ensemble' keep (final vote signal)", () => {
    it("keeps a non-SPS title containing 'sur l'ensemble'", () => {
      expect(isEligibleScrutin(mk("SOR", "Vote sur l'ensemble du projet"))).toBe(true);
    });

    it("matches case-insensitively", () => {
      expect(isEligibleScrutin(mk("SOR", "Vote SUR L'ENSEMBLE du projet"))).toBe(true);
    });
  });

  describe("motion keeps", () => {
    it("keeps 'motion de censure'", () => {
      expect(isEligibleScrutin(mk("MOT", "Motion de censure contre le gouvernement"))).toBe(true);
    });

    it("keeps 'motion référendaire'", () => {
      expect(isEligibleScrutin(mk("MOT", "Motion référendaire sur la retraite"))).toBe(true);
    });

    it("drops 'motion de rejet préalable' (procedural — not in keep list)", () => {
      // The filter only keeps censure + référendaire motions; "rejet préalable"
      // is procedural and discriminates majorité-vs-opposition, so it's out.
      expect(isEligibleScrutin(mk("MOT", "Motion de rejet préalable"))).toBe(false);
    });

    it("drops 'motion de renvoi en commission' (procedural)", () => {
      expect(isEligibleScrutin(mk("MOT", "Motion de renvoi en commission"))).toBe(false);
    });
  });

  describe("proposition de résolution", () => {
    it("keeps a 'proposition de résolution' title", () => {
      expect(isEligibleScrutin(mk("RES", "Proposition de résolution sur l'Ukraine"))).toBe(true);
    });

    it("drops an amendment on a proposition de résolution", () => {
      // The amendment check runs before this branch, so it wins.
      expect(isEligibleScrutin(mk("RES", "Amendement à la proposition de résolution"))).toBe(false);
    });
  });

  describe("defaults", () => {
    it("drops a title that matches no keep rule", () => {
      expect(isEligibleScrutin(mk("SOR", "Vote ordinaire sans contexte particulier"))).toBe(false);
    });

    it("drops a missing/empty title (no typeVote either)", () => {
      expect(isEligibleScrutin({})).toBe(false);
    });

    it("handles missing objet gracefully", () => {
      expect(isEligibleScrutin({ typeVote: { codeTypeVote: "SOR" } })).toBe(false);
    });

    it("handles missing typeVote gracefully", () => {
      expect(isEligibleScrutin({ objet: { libelle: "Vote ordinaire" } })).toBe(false);
    });
  });
});
