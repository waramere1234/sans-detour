import { describe, it, expect } from "vitest";
import { THEMES, normalizeTheme } from "../src/types";

// Session 75 extracted `normalizeTheme` from both ingest scripts into
// src/types — it validates the LLM-emitted theme label against the enum
// and collapses unknown values to "autre". Without these tests, a
// regression that loosens the fallback (or changes the case-folding)
// would slip past CI silently — both ingest scripts depend on this
// function to keep arbitrary strings out of the DB.

describe("normalizeTheme", () => {
  it("returns undefined for non-string input", () => {
    expect(normalizeTheme(undefined)).toBeUndefined();
    expect(normalizeTheme(null)).toBeUndefined();
    expect(normalizeTheme(42)).toBeUndefined();
    expect(normalizeTheme({})).toBeUndefined();
    expect(normalizeTheme([])).toBeUndefined();
    expect(normalizeTheme(true)).toBeUndefined();
  });

  it("returns the canonical lowercase theme for valid values", () => {
    for (const t of THEMES) {
      expect(normalizeTheme(t)).toBe(t);
    }
  });

  it("lowercases + trims input before matching", () => {
    expect(normalizeTheme("  RETRAITES  ")).toBe("retraites");
    expect(normalizeTheme("Écologie")).toBe("écologie");
    expect(normalizeTheme("INSTITUTIONS")).toBe("institutions");
  });

  it("collapses unknown strings to 'autre'", () => {
    expect(normalizeTheme("blockchain")).toBe("autre");
    expect(normalizeTheme("politique étrangère")).toBe("autre");
    expect(normalizeTheme("")).toBe("autre");
  });

  it("does not let `autre` be confused with valid themes (idempotent)", () => {
    expect(normalizeTheme("autre")).toBe("autre");
    expect(normalizeTheme("AUTRE")).toBe("autre");
  });
});
