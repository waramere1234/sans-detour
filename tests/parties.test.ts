import { describe, it, expect } from "vitest";
import { PARTIES, getParty, getPartyColorVar } from "../src/lib/parties";
import { GROUP_CODES } from "../src/types";

describe("parties registry", () => {
  it("contains an entry for every group code", () => {
    for (const code of GROUP_CODES) {
      expect(PARTIES[code]).toBeDefined();
      expect(PARTIES[code].name.length).toBeGreaterThan(0);
      expect(PARTIES[code].colorVar).toMatch(/^--p-/);
    }
  });

  it("each entry has a non-empty short label", () => {
    for (const code of GROUP_CODES) {
      expect(PARTIES[code].short.length).toBeGreaterThan(0);
    }
  });

  it("colorVar values are unique across groups", () => {
    const vars = GROUP_CODES.map((c) => PARTIES[c].colorVar);
    expect(new Set(vars).size).toBe(vars.length);
  });

  it("returns the party metadata via getParty", () => {
    expect(getParty("LFI").name).toBe("La France Insoumise");
  });

  it("returns the CSS variable token for color", () => {
    expect(getPartyColorVar("RN")).toBe("var(--p-rn)");
  });

  it("getPartyColorVar wraps the colorVar in var()", () => {
    for (const code of GROUP_CODES) {
      expect(getPartyColorVar(code)).toBe(`var(${PARTIES[code].colorVar})`);
    }
  });
});
