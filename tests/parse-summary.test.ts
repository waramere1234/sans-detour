import { describe, it, expect } from "vitest";
import {
  asStringArray,
  normalizeAnalyse,
  normalizePointsCles,
  sanitizeJsonControlChars,
  fallbackSummary,
  extractAnthropicSummary,
  type MinimalAnthropicMessage,
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

// Session 95 extracted extractAnthropicSummary from both ingest scripts.
// This is the function that turns a successful batch message into the
// Summary object we upsert to Supabase — a regression here would either
// drop scrutins (parse throws) or upsert bad rows (validation loosens).

function mkMsg(text: string, stop_reason = "end_turn"): MinimalAnthropicMessage {
  return {
    content: [{ type: "text", text }],
    stop_reason,
  };
}

describe("extractAnthropicSummary", () => {
  it("extracts a well-formed JSON payload from a single text block", () => {
    const out = extractAnthropicSummary(mkMsg(
      `{"chapeau": "FISCALITÉ · LOI X", "titre_pedago": "Hausse de la taxe", "contexte": "Texte..."}`,
    ));
    expect(out.chapeau).toBe("FISCALITÉ · LOI X");
    expect(out.titre_pedago).toBe("Hausse de la taxe");
    expect(out.contexte).toBe("Texte...");
  });

  it("concatenates multiple text blocks before matching JSON", () => {
    const msg: MinimalAnthropicMessage = {
      content: [
        { type: "text", text: `Réflexions préalables...` },
        { type: "text", text: `{"chapeau": "X", "titre_pedago": "Y", "contexte": "Z"}` },
      ],
      stop_reason: "end_turn",
    };
    const out = extractAnthropicSummary(msg);
    expect(out.chapeau).toBe("X");
  });

  it("ignores non-text blocks (thinking, server_tool_use, etc.)", () => {
    const msg: MinimalAnthropicMessage = {
      content: [
        { type: "thinking", text: "internal thought" },
        { type: "server_tool_use" },
        { type: "text", text: `{"chapeau": "A", "titre_pedago": "B", "contexte": "C"}` },
      ],
      stop_reason: "end_turn",
    };
    const out = extractAnthropicSummary(msg);
    expect(out.chapeau).toBe("A");
  });

  it("throws when there's no text block (lists stop_reason + block types)", () => {
    const msg: MinimalAnthropicMessage = {
      content: [{ type: "thinking" }, { type: "server_tool_use" }],
      stop_reason: "max_tokens",
    };
    expect(() => extractAnthropicSummary(msg)).toThrow(/No text block/);
    expect(() => extractAnthropicSummary(msg)).toThrow(/stop_reason=max_tokens/);
    expect(() => extractAnthropicSummary(msg)).toThrow(/thinking/);
  });

  it("throws when the text contains no JSON object", () => {
    expect(() => extractAnthropicSummary(mkMsg("plain prose without braces")))
      .toThrow(/No JSON in response/);
  });

  it("throws when chapeau is missing (lists stray keys)", () => {
    const out = mkMsg(`{"titre_pedago": "Y", "contexte": "Z", "erreur": "oops"}`);
    expect(() => extractAnthropicSummary(out)).toThrow(/Missing required fields/);
    expect(() => extractAnthropicSummary(out)).toThrow(/erreur/);
  });

  it("throws when titre_pedago is missing", () => {
    expect(() => extractAnthropicSummary(mkMsg(`{"chapeau": "X"}`)))
      .toThrow(/Missing required fields/);
  });

  it("sanitizes raw control chars inside JSON string literals", () => {
    // Real LLM output: literal newline inside the contexte string.
    const raw = `{"chapeau": "A", "titre_pedago": "B", "contexte": "line1\nline2"}`;
    const out = extractAnthropicSummary(mkMsg(raw));
    expect(out.contexte).toBe("line1\nline2");
  });

  it("normalizes analyse_loi / points_cles / theme on the happy path", () => {
    const raw = `{
      "chapeau": "X", "titre_pedago": "Y", "contexte": "Z",
      "analyse_loi": { "mesures_principales": ["A", "", "B"] },
      "points_cles": ["one two three four five six seven eight"],
      "theme": "FISCALITÉ"
    }`;
    const out = extractAnthropicSummary(mkMsg(raw));
    // asStringArray drops the empty string entry
    expect(out.analyse_loi?.mesures_principales).toEqual(["A", "B"]);
    // normalizePointsCles truncates at 7 words with ellipsis
    expect(out.points_cles?.[0].endsWith("…")).toBe(true);
    // normalizeTheme lowercases + validates against the enum
    expect(out.theme).toBe("fiscalité");
  });

  it("trims surrounding whitespace from chapeau / titre_pedago / contexte", () => {
    const out = extractAnthropicSummary(mkMsg(
      `{"chapeau": "  X  ", "titre_pedago": "  Y  ", "contexte": "  Z  "}`,
    ));
    expect(out.chapeau).toBe("X");
    expect(out.titre_pedago).toBe("Y");
    expect(out.contexte).toBe("Z");
  });
});
