import { describe, it, expect } from "vitest";
import { parseTopParam } from "../api/_lib/parse-top";

// api/_lib/parse-top.ts is the pure parser pulled out of api/share-card.ts
// (it used to live inline above the satori-rendering handler). Tests here
// pin the defenses against malformed share URLs that would otherwise ship
// "-50%" or "200%" on the SVG card.

describe("parseTopParam — happy path", () => {
  it("returns [] for null", () => {
    expect(parseTopParam(null)).toEqual([]);
  });

  it("returns [] for empty string", () => {
    expect(parseTopParam("")).toEqual([]);
  });

  it("parses a single bar", () => {
    expect(parseTopParam("RN:57")).toEqual([{ code: "RN", pct: 57 }]);
  });

  it("parses a comma-separated list of bars in order", () => {
    expect(parseTopParam("RN:57,LFI:30,EPR:22")).toEqual([
      { code: "RN", pct: 57 },
      { code: "LFI", pct: 30 },
      { code: "EPR", pct: 22 },
    ]);
  });
});

describe("parseTopParam — pct clamp [0, 100]", () => {
  it("clamps a pct below 0 to 0", () => {
    expect(parseTopParam("RN:-50")).toEqual([{ code: "RN", pct: 0 }]);
  });

  it("clamps a pct above 100 to 100", () => {
    expect(parseTopParam("RN:200")).toEqual([{ code: "RN", pct: 100 }]);
  });

  it("accepts boundary values 0 and 100 unchanged", () => {
    expect(parseTopParam("A:0,B:100")).toEqual([
      { code: "A", pct: 0 },
      { code: "B", pct: 100 },
    ]);
  });
});

describe("parseTopParam — malformed input drops", () => {
  it("drops a pair where pct is NaN (non-numeric)", () => {
    expect(parseTopParam("RN:abc,LFI:30")).toEqual([{ code: "LFI", pct: 30 }]);
  });

  it("drops a pair where code is empty (leading colon)", () => {
    expect(parseTopParam(":57,LFI:30")).toEqual([{ code: "LFI", pct: 30 }]);
  });

  it("treats a pair with no colon as { code, pct: NaN } and drops it", () => {
    expect(parseTopParam("ORPHAN,LFI:30")).toEqual([{ code: "LFI", pct: 30 }]);
  });

  it("survives a trailing comma without throwing", () => {
    expect(parseTopParam("RN:57,")).toEqual([{ code: "RN", pct: 57 }]);
  });
});
