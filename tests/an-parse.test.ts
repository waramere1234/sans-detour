import { describe, it, expect } from "vitest";
import { parseRaw, type ANScrutinRaw } from "../scripts/lib/an-parse";

// Session 96 extracted parseRaw from both ingest scripts. This function
// turns the raw AN JSON into the trimmed row shape we upsert to Supabase.
// It walks the ventilationVotes tree, maps organeRefs via GROUP_MAPPING,
// sums vote counts, and derives positions via the ≥70% rule. A
// regression here directly changes what rows land in the DB.

function mk(partial: Partial<ANScrutinRaw> = {}): ANScrutinRaw {
  return {
    uid: "VTANR5L17V1234",
    numero: "1234",
    dateScrutin: "2024-06-15",
    typeVote: { codeTypeVote: "SOR", libelleTypeVote: "Scrutin ordinaire" },
    objet: { libelle: "Test", dossierLegislatif: null },
    ventilationVotes: { organe: { groupes: { groupe: [] } } },
    ...partial,
  };
}

function mkGroup(organeRef: string, pour: number, contre = 0, abstention = 0, absent = 0) {
  return {
    organeRef,
    vote: {
      decompteVoix: {
        nonVotants: String(absent),
        pour: String(pour),
        contre: String(contre),
        abstentions: String(abstention),
        nonVotantsVolontaires: "0",
      },
    },
  };
}

describe("parseRaw — shape", () => {
  it("returns id = raw.uid", () => {
    expect(parseRaw(mk({ uid: "VTANR5L17V9999" })).id).toBe("VTANR5L17V9999");
  });

  it("returns numero as integer (parseInt of string field)", () => {
    expect(parseRaw(mk({ numero: "42" })).numero).toBe(42);
  });

  it("returns titre_brut from objet.libelle", () => {
    expect(parseRaw(mk({ objet: { libelle: "Vote sur X", dossierLegislatif: null } })).titre_brut)
      .toBe("Vote sur X");
  });

  it("est_solennel = true only for typeVote SPS", () => {
    expect(parseRaw(mk({ typeVote: { codeTypeVote: "SPS", libelleTypeVote: "" } })).est_solennel).toBe(true);
    expect(parseRaw(mk({ typeVote: { codeTypeVote: "SOR", libelleTypeVote: "" } })).est_solennel).toBe(false);
  });

  it("url_an_officielle uses raw.numero in the AN dyn URL", () => {
    expect(parseRaw(mk({ numero: "42" })).url_an_officielle)
      .toBe("https://www.assemblee-nationale.fr/dyn/17/scrutins/42");
  });

  it("pedago_relu always starts as false (V3 audit feature)", () => {
    expect(parseRaw(mk()).pedago_relu).toBe(false);
  });
});

describe("parseRaw — dossier handling", () => {
  it("uses dossierLegislatif.dossierRef when present", () => {
    const out = parseRaw(mk({
      objet: { libelle: "Vote", dossierLegislatif: { libelle: "PLF 2026", dossierRef: "DLR5L17N0042" } },
    }));
    expect(out.dossier_id).toBe("DLR5L17N0042");
    expect(out.dossier_titre).toBe("PLF 2026");
  });

  it("falls back to STANDALONE-<uid> when dossier is null", () => {
    const out = parseRaw(mk({ uid: "VTANR5L17V0001" }));
    expect(out.dossier_id).toBe("STANDALONE-VTANR5L17V0001");
  });

  it("falls back to truncated libelle when dossier title missing", () => {
    const out = parseRaw(mk({ objet: { libelle: "x".repeat(200), dossierLegislatif: null } }));
    expect(out.dossier_titre.length).toBeLessThanOrEqual(120);
  });
});

describe("parseRaw — vote breakdown", () => {
  it("maps organeRef to GroupCode via GROUP_MAPPING (RN)", () => {
    const out = parseRaw(mk({
      ventilationVotes: { organe: { groupes: { groupe: [mkGroup("PO845401", 80, 5, 2, 1)] } } },
    }));
    expect(out.votes_bruts.RN).toEqual({ pour: 80, contre: 5, abstention: 2, absent: 1 });
  });

  it("ignores unknown organeRefs silently", () => {
    const out = parseRaw(mk({
      ventilationVotes: { organe: { groupes: { groupe: [mkGroup("PO_UNKNOWN", 50)] } } },
    }));
    expect(Object.keys(out.votes_bruts)).toHaveLength(0);
  });

  it("ignores the non-inscrits group (PO840056 → null in GROUP_MAPPING)", () => {
    const out = parseRaw(mk({
      ventilationVotes: { organe: { groupes: { groupe: [mkGroup("PO840056", 100)] } } },
    }));
    expect(Object.keys(out.votes_bruts)).toHaveLength(0);
  });

  it("merges UDR breakdowns when both PO847173 and PO872880 appear", () => {
    // Defensive — they alternate by date in practice, but the merge is
    // documented and tested.
    const out = parseRaw(mk({
      ventilationVotes: {
        organe: {
          groupes: {
            groupe: [
              mkGroup("PO847173", 10, 2, 1, 0),
              mkGroup("PO872880", 5, 3, 0, 1),
            ],
          },
        },
      },
    }));
    expect(out.votes_bruts.UDR).toEqual({ pour: 15, contre: 5, abstention: 1, absent: 1 });
  });

  it("absent = nonVotants + nonVotantsVolontaires", () => {
    // The mkGroup helper sets nonVotantsVolontaires to "0"; bump it directly.
    const out = parseRaw(mk({
      ventilationVotes: {
        organe: {
          groupes: {
            groupe: [{
              organeRef: "PO845413",
              vote: {
                decompteVoix: {
                  pour: "5", contre: "0", abstentions: "0",
                  nonVotants: "2", nonVotantsVolontaires: "3",
                },
              },
            }],
          },
        },
      },
    }));
    expect(out.votes_bruts.LFI.absent).toBe(5);
  });

  it("coerces missing/non-numeric vote counts to 0 (defensive `n` helper)", () => {
    const out = parseRaw(mk({
      ventilationVotes: {
        organe: {
          groupes: {
            groupe: [{
              organeRef: "PO845413",
              vote: {
                decompteVoix: {
                  pour: undefined as unknown as string,
                  contre: "garbage",
                  abstentions: "",
                  nonVotants: "1",
                  nonVotantsVolontaires: "0",
                },
              },
            }],
          },
        },
      },
    }));
    expect(out.votes_bruts.LFI).toEqual({ pour: 0, contre: 0, abstention: 0, absent: 1 });
  });
});

describe("parseRaw — position_par_groupe (computed via ≥70% rule)", () => {
  it("assigns 'pour' to a group with ≥70% effective pour", () => {
    const out = parseRaw(mk({
      ventilationVotes: {
        organe: { groupes: { groupe: [mkGroup("PO845401", 80, 10, 10, 5)] } },
      },
    }));
    expect(out.position_par_groupe.RN).toBe("pour");
  });

  it("assigns 'divisé' when no category reaches 70%", () => {
    const out = parseRaw(mk({
      ventilationVotes: {
        organe: { groupes: { groupe: [mkGroup("PO845401", 50, 30, 20)] } },
      },
    }));
    expect(out.position_par_groupe.RN).toBe("divisé");
  });
});
