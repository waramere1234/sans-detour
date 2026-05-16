import { describe, it, expect } from "vitest";
import { PERSONNALITES, getPersonnalite } from "../src/lib/personnalites";
import { PERSONNALITE_CODES, GROUP_CODES } from "../src/types";

describe("personnalites registry", () => {
  it("contains an entry for every personnalité code", () => {
    for (const code of PERSONNALITE_CODES) {
      expect(PERSONNALITES[code]).toBeDefined();
    }
  });

  it("each entry has non-empty required fields", () => {
    for (const code of PERSONNALITE_CODES) {
      const meta = PERSONNALITES[code];
      expect(meta.display_name.length).toBeGreaterThan(0);
      expect(meta.short_name.length).toBeGreaterThan(0);
      expect(meta.prenom.length).toBeGreaterThan(0);
      expect(meta.nom.length).toBeGreaterThan(0);
      expect(meta.acteur_ref).toMatch(/^PA\d+$/);
    }
  });

  it("group_code is always a valid GroupCode", () => {
    for (const code of PERSONNALITE_CODES) {
      const meta = PERSONNALITES[code];
      expect(GROUP_CODES).toContain(meta.group_code);
    }
  });

  it("acteur_ref values are unique across personnalités", () => {
    const refs = PERSONNALITE_CODES.map((c) => PERSONNALITES[c].acteur_ref);
    expect(new Set(refs).size).toBe(refs.length);
  });

  it("getPersonnalite returns the metadata", () => {
    expect(getPersonnalite("le_pen").display_name).toBe("Marine Le Pen");
    expect(getPersonnalite("le_pen").group_code).toBe("RN");
  });

  it("display_name contains both prenom and nom", () => {
    for (const code of PERSONNALITE_CODES) {
      const meta = PERSONNALITES[code];
      expect(meta.display_name).toContain(meta.prenom);
      expect(meta.display_name).toContain(meta.nom);
    }
  });
});
