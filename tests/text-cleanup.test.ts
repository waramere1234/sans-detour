import { describe, it, expect } from "vitest";
import {
  stripCitations,
  stripVoteResult,
  stripBoldMarkers,
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
