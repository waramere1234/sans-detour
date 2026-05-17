import { describe, it, expect } from "vitest";
import {
  stripCitations,
  stripVoteResult,
  stripBoldMarkers,
  extractConcrete,
} from "../src/lib/text-cleanup";

// Session 92 extracted these from Card.tsx (Card was inline-only) and
// AuditTrail.tsx (which had a less robust inline copy missing the
// orphan-tag strip). Tests pin both helpers' behavior so the two
// consumer sites stay in lockstep.

describe("stripCitations", () => {
  it("removes <cite>…</cite> wrappers and keeps the inner text", () => {
    const out = stripCitations("La loi prévoit X <cite index=\"1-2\">selon AN</cite> dès 2026.");
    expect(out).toBe("La loi prévoit X selon AN dès 2026.");
  });

  it("strips orphan opening <cite ...> with no close (LLM cut mid-token)", () => {
    // The inline version in AuditTrail (pre-session-92) missed this case;
    // the regression would render `<cite ...>` literally in the bullet.
    const out = stripCitations("La loi <cite index=\"1\"> dès 2026.");
    expect(out).toBe("La loi dès 2026.");
  });

  it("strips orphan closing </cite> with no open", () => {
    const out = stripCitations("La loi</cite> dès 2026.");
    expect(out).toBe("La loi dès 2026.");
  });

  it("collapses runs of horizontal whitespace from the strip", () => {
    const out = stripCitations("A  <cite>X</cite>  B");
    expect(out).toBe("A X B");
  });

  it("trims surrounding whitespace", () => {
    expect(stripCitations("  hello  ")).toBe("hello");
  });

  it("returns input unchanged when no citation markup is present", () => {
    expect(stripCitations("Texte ordinaire.")).toBe("Texte ordinaire.");
  });
});

describe("stripVoteResult", () => {
  it("removes a trailing 'Vote :' fragment", () => {
    const out = stripVoteResult("La loi crée X. Vote : 250 oui, 100 non.");
    expect(out).toBe("La loi crée X.");
  });

  it("removes a trailing 'Résultat :' fragment", () => {
    const out = stripVoteResult("La loi crée X. Résultat : adopté.");
    expect(out).toBe("La loi crée X.");
  });

  it("matches case-insensitively", () => {
    expect(stripVoteResult("X. vote : 1")).toBe("X.");
    expect(stripVoteResult("X. VOTE : 1")).toBe("X.");
  });

  it("does NOT strip a 'vote.' at sentence end (false-positive prevention)", () => {
    // The implementation matches only the colon form precisely because
    // matching `.` would eat ordinary French usage like this.
    const text = "Le texte passe sans vote. Une motion suit.";
    expect(stripVoteResult(text)).toBe(text);
  });

  it("returns input unchanged when no Vote/Résultat marker", () => {
    expect(stripVoteResult("Texte ordinaire.")).toBe("Texte ordinaire.");
  });
});

describe("stripBoldMarkers", () => {
  it("removes **bold** markers and keeps inner text", () => {
    expect(stripBoldMarkers("La loi crée **5 mesures**.")).toBe("La loi crée 5 mesures.");
  });

  it("handles multiple bold spans", () => {
    expect(stripBoldMarkers("**A** et **B**")).toBe("A et B");
  });

  it("leaves unbalanced markers alone (non-greedy match)", () => {
    // `**foo` without a closing pair shouldn't match the lazy regex.
    expect(stripBoldMarkers("**foo")).toBe("**foo");
  });

  it("returns input unchanged with no markers", () => {
    expect(stripBoldMarkers("Texte ordinaire.")).toBe("Texte ordinaire.");
  });
});

// Session 100: extractConcrete moved from AuditTrail.tsx into this lib
// (the natural home — it's pure text processing). Tests pin the
// sentence-boundary regex + comma-fallback drift handling, which are
// non-obvious and easy to break in a future refactor.
describe("extractConcrete", () => {
  it("returns null when contexte is undefined or empty", () => {
    expect(extractConcrete(undefined)).toBeNull();
    expect(extractConcrete("")).toBeNull();
  });

  it("returns null when neither marker is present", () => {
    expect(extractConcrete("La loi modifie le code du travail.")).toBeNull();
  });

  it("extracts the sentence after 'Concrètement :'", () => {
    expect(extractConcrete(
      "Première phrase. Concrètement : la TVA monte à 25%. Phrase suivante.",
    )).toBe("la TVA monte à 25%");
  });

  it("extracts the sentence after 'Par exemple :'", () => {
    expect(extractConcrete(
      "Contexte général. Par exemple : un foyer médian paiera 200€ de plus.",
    )).toBe("un foyer médian paiera 200€ de plus");
  });

  it("handles the comma-drift fallback ('Concrètement, …')", () => {
    // The LLM occasionally drops the colon — extractConcrete falls back
    // to a comma marker so the bullet doesn't surface with a leading ", ".
    expect(extractConcrete(
      "Contexte. Concrètement, la TVA monte à 25%.",
    )).toBe("la TVA monte à 25%");
  });

  it("matches the marker case-insensitively", () => {
    expect(extractConcrete("CONCRÈTEMENT : la loi entre en vigueur en 2027."))
      .toBe("la loi entre en vigueur en 2027");
  });

  it("strips Anthropic <cite> citation markup from the bullet", () => {
    expect(extractConcrete(
      `Contexte. Concrètement : la <cite index="1">TVA</cite> monte à 25%.`,
    )).toBe("la TVA monte à 25%");
  });

  it("strips **bold** markup from the bullet", () => {
    expect(extractConcrete(
      "Contexte. Concrètement : la **TVA** monte à **25%**.",
    )).toBe("la TVA monte à 25%");
  });

  it("trims the trailing period from the matched sentence", () => {
    // Implementation does `.replace(/\.$/, "")` after the regex match.
    expect(extractConcrete(
      "Concrètement : la mesure prend effet en 2026.",
    )).toBe("la mesure prend effet en 2026");
  });

  it("returns the first match when both markers are present", () => {
    expect(extractConcrete(
      "Concrètement : la TVA monte. Par exemple : 200€ de plus.",
    )).toBe("la TVA monte");
  });
});
