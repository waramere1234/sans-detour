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

  it("returns the party metadata via getParty", () => {
    expect(getParty("LFI").name).toBe("La France Insoumise");
  });

  it("returns the CSS variable token for color", () => {
    expect(getPartyColorVar("RN")).toBe("var(--p-rn)");
  });
});
