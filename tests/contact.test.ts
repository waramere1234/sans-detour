import { describe, it, expect } from "vitest";
import { CONTACT_EMAIL, mailto } from "../src/lib/contact";

// Session 91 extracted the mailto contact address from 7 sites into a
// single const + helper. The helper's encodeURIComponent pass is what
// makes the pre-filled subject (e.g. MethodeSheet "Signalement d'une
// erreur factuelle") render correctly in Gmail / Safari — a regression
// here would produce broken mailto: links with literal spaces or commas.

describe("CONTACT_EMAIL", () => {
  it("matches the canonical address used across the app", () => {
    expect(CONTACT_EMAIL).toBe("contact@sansdetour.fr");
  });
});

describe("mailto()", () => {
  it("returns the bare mailto when no subject is given", () => {
    expect(mailto()).toBe("mailto:contact@sansdetour.fr");
  });

  it("appends an encoded subject query param", () => {
    const out = mailto("Hello");
    expect(out).toBe("mailto:contact@sansdetour.fr?subject=Hello");
  });

  it("URL-encodes spaces in the subject (Gmail/Safari friendly)", () => {
    const out = mailto("Hello world");
    expect(out).toBe("mailto:contact@sansdetour.fr?subject=Hello%20world");
  });

  it("URL-encodes French accents in the subject", () => {
    // Session 91 replaced a hand-rolled %C3%A9 literal in MethodeSheet
    // with this helper. Pin the encoding so we don't regress.
    const out = mailto("Sans Détour — Signalement d'une erreur factuelle");
    expect(out).toContain("Sans%20D%C3%A9tour");
    expect(out).toContain("Signalement");
    // Em dash is U+2014 → %E2%80%94
    expect(out).toContain("%E2%80%94");
  });

  it("URL-encodes special chars (& : =) so they don't break the query", () => {
    const out = mailto("A & B: C=1");
    expect(out).toContain("A%20%26%20B%3A%20C%3D1");
  });
});
