import { describe, it, expect } from "vitest";
import { CONTACT_EMAIL, ERROR_REPORT_SUBJECT, mailto } from "../src/lib/contact";
import { BRAND_NAME, PROD_HOSTNAME } from "../src/types";

// Session 91 extracted the mailto contact address from 7 sites into a
// single const + helper. The helper's encodeURIComponent pass is what
// makes the pre-filled subject (e.g. MethodeSheet "Signalement d'une
// erreur factuelle") render correctly in Gmail / Safari — a regression
// here would produce broken mailto: links with literal spaces or commas.

describe("CONTACT_EMAIL", () => {
  it("matches the canonical address used across the app", () => {
    expect(CONTACT_EMAIL).toBe("contact@sansdetour.fr");
  });

  it("domain part derives from PROD_HOSTNAME (rebrand-safe)", () => {
    // Verifies the const isn't a bare literal: a rebrand updating
    // PROD_ORIGIN → PROD_HOSTNAME propagates to the contact email.
    expect(CONTACT_EMAIL.endsWith(`@${PROD_HOSTNAME}`)).toBe(true);
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
    const out = mailto(ERROR_REPORT_SUBJECT);
    expect(out).toContain("Sans%20D%C3%A9tour");
    expect(out).toContain("Signalement");
    // Em dash is U+2014 → %E2%80%94
    expect(out).toContain("%E2%80%94");
  });

  it("ERROR_REPORT_SUBJECT begins with BRAND_NAME (rebrand-safe)", () => {
    // A future rebrand updating BRAND_NAME propagates here without
    // touching MethodeSheet.tsx OR this test. Pin the linkage.
    expect(ERROR_REPORT_SUBJECT.startsWith(BRAND_NAME)).toBe(true);
  });

  it("URL-encodes special chars (& : =) so they don't break the query", () => {
    const out = mailto("A & B: C=1");
    expect(out).toContain("A%20%26%20B%3A%20C%3D1");
  });
});
