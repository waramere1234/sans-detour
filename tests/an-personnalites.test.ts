import { describe, it, expect } from "vitest";
import {
  asArr,
  extractVotesFromScrutin,
  type ANScrutinForPersonnalites,
} from "../scripts/lib/an-personnalites";
import { PERSONNALITE_CODES, type PersonnaliteCode } from "../src/types";
import { PERSONNALITES } from "../src/lib/personnalites";

// scripts/lib/an-personnalites.ts owns:
//   - the asArr "list-or-bare-object" coercion the AN bulk download forces
//     on every nominative field (one-voter lists serialise as the bare
//     object, not a 1-element array)
//   - extractVotesFromScrutin: the 5-bucket sweep (pours/contres/
//     abstentions/nonVotants/nonVotantsVolontaires) + the "non_dispo"
//     default for every personality not seen on the scrutin

// Pull the AN acteurRefs from PERSONNALITES so a ref correction (e.g.
// AN republishes a deputy with a new PA id) touches both the production
// table and the tests via one edit. Hardcoding the same PA… literals
// here would silently keep tests green while production switches refs.
const REF_LE_PEN = PERSONNALITES.le_pen.acteur_ref;
const REF_FAURE = PERSONNALITES.faure.acteur_ref;
const REF_CHATELAIN = PERSONNALITES.chatelain.acteur_ref;
const REF_WAUQUIEZ = PERSONNALITES.wauquiez.acteur_ref;
const REF_ATTAL = PERSONNALITES.attal.acteur_ref;
const REF_CIOTTI = PERSONNALITES.ciotti.acteur_ref;
const REF_BOMPARD = PERSONNALITES.bompard.acteur_ref;
const REF_PANOT = PERSONNALITES.panot.acteur_ref;

function refMap(): Map<string, PersonnaliteCode> {
  return new Map<string, PersonnaliteCode>([
    [REF_LE_PEN, "le_pen"],
    [REF_FAURE, "faure"],
    [REF_CHATELAIN, "chatelain"],
    [REF_WAUQUIEZ, "wauquiez"],
    [REF_ATTAL, "attal"],
    [REF_CIOTTI, "ciotti"],
    [REF_BOMPARD, "bompard"],
    [REF_PANOT, "panot"],
  ]);
}

function mkScrutin(
  bucket:
    | "pours"
    | "contres"
    | "abstentions"
    | "nonVotants"
    | "nonVotantsVolontaires",
  refs: string[] | string,
): ANScrutinForPersonnalites {
  const votant = Array.isArray(refs)
    ? refs.map((r) => ({ acteurRef: r }))
    : { acteurRef: refs };
  return {
    uid: "VTANR5L17V0001",
    dateScrutin: "2024-10-15",
    ventilationVotes: {
      organe: {
        groupes: {
          groupe: [{ vote: { decompteNominatif: { [bucket]: { votant } } } }],
        },
      },
    },
  };
}

describe("asArr — list-or-bare-object coercion", () => {
  it("returns [] for undefined", () => {
    expect(asArr(undefined)).toEqual([]);
  });

  it("returns the array unchanged when given an array", () => {
    expect(asArr([{ acteurRef: "PA1" }, { acteurRef: "PA2" }])).toEqual([
      { acteurRef: "PA1" },
      { acteurRef: "PA2" },
    ]);
  });

  it("wraps a single object in a 1-element array (AN quirk)", () => {
    expect(asArr({ acteurRef: "PA1" })).toEqual([{ acteurRef: "PA1" }]);
  });

  it("returns [] for an empty array (still array, not falsy)", () => {
    expect(asArr([])).toEqual([]);
  });
});

describe("extractVotesFromScrutin — defaults", () => {
  it('defaults every personality to "non_dispo"', () => {
    const empty: ANScrutinForPersonnalites = {
      uid: "VTANR5L17V0001",
      dateScrutin: "2024-10-15",
    };
    const result = extractVotesFromScrutin(empty, refMap());
    for (const code of PERSONNALITE_CODES) {
      expect(result[code]).toBe("non_dispo");
    }
  });

  it("treats a missing decompteNominatif as no-op (all non_dispo)", () => {
    const scrutin: ANScrutinForPersonnalites = {
      uid: "VTANR5L17V0001",
      dateScrutin: "2024-10-15",
      ventilationVotes: { organe: { groupes: { groupe: [{ vote: {} }] } } },
    };
    const result = extractVotesFromScrutin(scrutin, refMap());
    for (const code of PERSONNALITE_CODES) {
      expect(result[code]).toBe("non_dispo");
    }
  });
});

describe("extractVotesFromScrutin — 5 vote buckets", () => {
  it('maps `pours` → "pour"', () => {
    const result = extractVotesFromScrutin(mkScrutin("pours", [REF_LE_PEN]), refMap());
    expect(result.le_pen).toBe("pour");
  });

  it('maps `contres` → "contre"', () => {
    const result = extractVotesFromScrutin(mkScrutin("contres", [REF_FAURE]), refMap());
    expect(result.faure).toBe("contre");
  });

  it('maps `abstentions` → "abstention"', () => {
    const result = extractVotesFromScrutin(
      mkScrutin("abstentions", [REF_CHATELAIN]),
      refMap(),
    );
    expect(result.chatelain).toBe("abstention");
  });

  it('maps `nonVotants` → "absent"', () => {
    const result = extractVotesFromScrutin(
      mkScrutin("nonVotants", [REF_WAUQUIEZ]),
      refMap(),
    );
    expect(result.wauquiez).toBe("absent");
  });

  it('maps `nonVotantsVolontaires` → "absent" (same as nonVotants)', () => {
    const result = extractVotesFromScrutin(
      mkScrutin("nonVotantsVolontaires", [REF_ATTAL]),
      refMap(),
    );
    expect(result.attal).toBe("absent");
  });
});

describe("extractVotesFromScrutin — unknown acteurRefs", () => {
  it("silently skips an acteurRef not in the map (other personalities stay non_dispo)", () => {
    const result = extractVotesFromScrutin(
      mkScrutin("pours", ["PA999999"]),
      refMap(),
    );
    for (const code of PERSONNALITE_CODES) {
      expect(result[code]).toBe("non_dispo");
    }
  });
});

describe("extractVotesFromScrutin — single-voter coercion (asArr in practice)", () => {
  it("handles a `votant` serialised as a bare object (single-voter bucket)", () => {
    const result = extractVotesFromScrutin(mkScrutin("pours", REF_PANOT), refMap());
    expect(result.panot).toBe("pour");
  });

  it("handles a `groupe` serialised as a bare object (single-group case)", () => {
    const scrutin: ANScrutinForPersonnalites = {
      uid: "VTANR5L17V0001",
      dateScrutin: "2024-10-15",
      ventilationVotes: {
        organe: {
          groupes: {
            groupe: {
              vote: {
                decompteNominatif: {
                  contres: { votant: { acteurRef: REF_BOMPARD } },
                },
              },
            },
          },
        },
      },
    };
    const result = extractVotesFromScrutin(scrutin, refMap());
    expect(result.bompard).toBe("contre");
  });
});

describe("extractVotesFromScrutin — multi-group sweep", () => {
  it("merges votes across multiple groups on the same scrutin", () => {
    const scrutin: ANScrutinForPersonnalites = {
      uid: "VTANR5L17V0001",
      dateScrutin: "2024-10-15",
      ventilationVotes: {
        organe: {
          groupes: {
            groupe: [
              {
                vote: {
                  decompteNominatif: {
                    pours: { votant: [{ acteurRef: REF_LE_PEN }] },
                  },
                },
              },
              {
                vote: {
                  decompteNominatif: {
                    contres: { votant: [{ acteurRef: REF_PANOT }, { acteurRef: REF_BOMPARD }] },
                  },
                },
              },
              {
                vote: {
                  decompteNominatif: {
                    abstentions: { votant: { acteurRef: REF_FAURE } },
                  },
                },
              },
            ],
          },
        },
      },
    };
    const result = extractVotesFromScrutin(scrutin, refMap());
    expect(result.le_pen).toBe("pour");
    expect(result.panot).toBe("contre");
    expect(result.bompard).toBe("contre");
    expect(result.faure).toBe("abstention");
    // Personalities not in any bucket → still non_dispo
    expect(result.attal).toBe("non_dispo");
    expect(result.wauquiez).toBe("non_dispo");
    expect(result.chatelain).toBe("non_dispo");
    expect(result.ciotti).toBe("non_dispo");
  });
});
