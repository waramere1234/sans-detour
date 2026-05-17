import { describe, it, expect } from "vitest";
import {
  asStringArray,
  normalizeAnalyse,
  normalizePointsCles,
  sanitizeJsonControlChars,
  fallbackSummary,
} from "../scripts/lib/parse-summary";

// Session 82 extracted these 5 helpers from the 2 ingest scripts (ingest-an,
// resume-ingest) into a shared lib. Both scripts depend on them to keep the
// DB clean — a regression that loosens any of the filters (empty strings,
// non-string values, control-char escapes) would slip past CI silently
// until the next ingestion run produced bad rows in prod. Session 85 added
// the `s.length > 0` filter to asStringArray; lock that in here.

describe("asStringArray", () => {
  it("returns [] for non-arrays", () => {
    expect(asStringArray(undefined)).toEqual([]);
    expect(asStringArray(null)).toEqual([]);
    expect(asStringArray("not an array")).toEqual([]);
    expect(asStringArray(42)).toEqual([]);
    expect(asStringArray({})).toEqual([]);
  });

  it("keeps only string entries", () => {
    expect(asStringArray(["a", 1, "b", null, "c"])).toEqual(["a", "b", "c"]);
  });

  it("filters empty + whitespace-only strings (session 85)", () => {
    expect(asStringArray(["a", "", "b", "  ", "c", "\t"])).toEqual(["a", "b", "c"]);
  });

  it("trims surrounding whitespace from kept entries", () => {
    expect(asStringArray(["  a  ", "b"])).toEqual(["a", "b"]);
  });
});

describe("normalizeAnalyse", () => {
  it("returns undefined for non-object input", () => {
    expect(normalizeAnalyse(undefined)).toBeUndefined();
    expect(normalizeAnalyse(null)).toBeUndefined();
    expect(normalizeAnalyse("string")).toBeUndefined();
    expect(normalizeAnalyse(42)).toBeUndefined();
  });

  it("returns 6 string[] lists from a well-formed object", () => {
    const out = normalizeAnalyse({
      mesures_principales: ["Mesure A"],
      concernes_positifs: ["Group X"],
      concernes_negatifs: ["Group Y"],
      concernes_neutres: [],
      calendrier: ["2026-01-01"],
      exceptions: ["Cas 1"],
    });
    expect(out).toEqual({
      mesures_principales: ["Mesure A"],
      concernes_positifs: ["Group X"],
      concernes_negatifs: ["Group Y"],
      concernes_neutres: [],
      calendrier: ["2026-01-01"],
      exceptions: ["Cas 1"],
    });
  });

  it("coerces missing lists to []", () => {
    const out = normalizeAnalyse({ mesures_principales: ["A"] });
    expect(out?.mesures_principales).toEqual(["A"]);
    expect(out?.concernes_positifs).toEqual([]);
    expect(out?.exceptions).toEqual([]);
  });

  it("filters empty strings inside the lists (via asStringArray)", () => {
    const out = normalizeAnalyse({
      mesures_principales: ["A", "", "B"],
    });
    expect(out?.mesures_principales).toEqual(["A", "B"]);
  });
});

describe("normalizePointsCles", () => {
  it("returns undefined for non-arrays", () => {
    expect(normalizePointsCles(undefined)).toBeUndefined();
    expect(normalizePointsCles("not an array")).toBeUndefined();
    expect(normalizePointsCles({})).toBeUndefined();
  });

  it("caps the list at 3 bullets", () => {
    expect(normalizePointsCles(["a", "b", "c", "d", "e"])).toEqual(["a", "b", "c"]);
  });

  it("filters empty + whitespace-only entries", () => {
    expect(normalizePointsCles(["a", "", "b", "  "])).toEqual(["a", "b"]);
  });

  it("truncates bullets > 7 words with an ellipsis", () => {
    const out = normalizePointsCles(["one two three four five six seven eight nine"]);
    expect(out).toEqual(["one two three four five six seven…"]);
  });

  it("keeps bullets of exactly 7 words unchanged", () => {
    expect(normalizePointsCles(["one two three four five six seven"])).toEqual([
      "one two three four five six seven",
    ]);
  });

  it("returns undefined when all entries are stripped", () => {
    expect(normalizePointsCles(["", "  ", null])).toBeUndefined();
  });
});

describe("sanitizeJsonControlChars", () => {
  it("escapes literal newlines inside strings", () => {
    const input = '{"k": "line1\nline2"}';
    const out = sanitizeJsonControlChars(input);
    // Two-character escape: backslash + 'n'
    expect(out).toContain("line1\\nline2");
    // The result must be valid JSON now
    expect(() => JSON.parse(out)).not.toThrow();
  });

  it("escapes tabs + carriage returns + low control chars", () => {
    const input = `{"k": "a\tb\rc\x01d"}`;
    const out = sanitizeJsonControlChars(input);
    expect(out).toContain("a\\tb\\rc\\u0001d");
    expect(() => JSON.parse(out)).not.toThrow();
  });

  it("leaves control chars OUTSIDE strings alone (formatting whitespace)", () => {
    const input = '{\n  "k": "v"\n}';
    const out = sanitizeJsonControlChars(input);
    // Newlines between the structural braces / colon stay as-is.
    expect(out).toContain('"k"');
    expect(() => JSON.parse(out)).not.toThrow();
  });

  it("respects backslash-escape sequences (does not double-escape)", () => {
    const input = '{"k": "already \\n escaped"}';
    const out = sanitizeJsonControlChars(input);
    // The pre-escaped \n stays as \n (single backslash in the source).
    expect(out).toBe(input);
  });
});

describe("fallbackSummary", () => {
  it("derives chapeau from the first 3 dossier words, uppercase", () => {
    const out = fallbackSummary("any title", "Projet de loi de finances 2026");
    expect(out.chapeau).toBe("PROJET DE LOI");
  });

  it("strips trailing punctuation from chapeau", () => {
    // Implementation regex is `/[.,;:!?]+$/` — only the trailing run is
    // removed (embedded commas inside the 3-word window stay).
    const out = fallbackSummary("any title", "Réforme du code.");
    expect(out.chapeau).toBe("RÉFORME DU CODE");
  });

  it("falls back to 'scrutin' for empty dossier title", () => {
    const out = fallbackSummary("any title", "");
    expect(out.chapeau).toBe("SCRUTIN");
  });

  it("truncates titre_pedago at 14 words with ellipsis", () => {
    const longTitle = Array.from({ length: 20 }, (_, i) => `word${i + 1}`).join(" ");
    const out = fallbackSummary(longTitle, "Dossier X");
    // Implementation appends "…" directly to the 14th word (no space):
    // `words.slice(0, 14).join(" ") + (words.length > 14 ? "…" : "")`
    expect(out.titre_pedago.endsWith("…")).toBe(true);
    expect(out.titre_pedago.split(/\s+/).length).toBe(14);
  });

  it("keeps titre_pedago intact when ≤ 14 words", () => {
    const out = fallbackSummary("short brut title", "Dossier X");
    expect(out.titre_pedago).toBe("short brut title");
  });

  it("returns empty contexte for empty dossier", () => {
    const out = fallbackSummary("title", "");
    expect(out.contexte).toBe("");
  });
});
