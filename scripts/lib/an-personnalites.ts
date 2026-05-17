// scripts/lib/an-personnalites.ts
//
// V2 personnalités vote extractor — turns the AN nominative-vote tree
// (decompteNominatif) into a per-personality vote record. Before this
// lib, the function + its helper types + the asArr coercion lived
// inline in scripts/ingest-personnalites.ts, untestable. Moving them
// here lets the test suite pin the 5 vote categories + the non_dispo
// default + the AN's quirky `votant: T[] | T` shape.
import type { PersonnaliteCode, PersonnaliteVote } from "../../src/types";
import { PERSONNALITE_CODES } from "../../src/types";

/** A single voter entry in the AN's `decompteNominatif` lists. */
export interface ANVotant { acteurRef: string }

/** Nominative breakdown for a single group on a single scrutin. The
 *  `votant` field can be either an array (typical) OR a single object
 *  (when there's only one voter in that bucket) — asArr coerces. */
export interface ANNominatif {
  pours?: { votant?: ANVotant[] | ANVotant };
  contres?: { votant?: ANVotant[] | ANVotant };
  abstentions?: { votant?: ANVotant[] | ANVotant };
  nonVotants?: { votant?: ANVotant[] | ANVotant };
  nonVotantsVolontaires?: { votant?: ANVotant[] | ANVotant };
}

export interface ANGroup {
  vote?: { decompteNominatif?: ANNominatif };
}

/** Minimal AN scrutin envelope the personnalités path consumes — only
 *  the ventilationVotes tree's `decompteNominatif` is read here. */
export interface ANScrutinForPersonnalites {
  uid: string;
  dateScrutin: string;
  ventilationVotes?: { organe?: { groupes?: { groupe?: ANGroup[] | ANGroup } } };
}

/** Coerce a "list or single object" AN JSON value into an always-array.
 *  The AN bulk download serialises a single-entry list as the bare
 *  object, not a 1-element array — so we normalise here before iterating. */
export function asArr<T>(v: T[] | T | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

/** Extract per-personality vote for one scrutin given the acteurRef →
 *  PersonnaliteCode map. Defaults every personality to "non_dispo" first
 *  (a deputy whose acteurRef never appears in the scrutin is treated as
 *  "not a sitting member at this date" — accurate for personalities
 *  like Bardella who resigned mid-mandate). Upgrades to a real vote
 *  ("pour" / "contre" / "abstention" / "absent") when the acteurRef is
 *  found in any group's decompteNominatif bucket.
 *
 *  Both `nonVotants` (absent for medical/personal reasons) and
 *  `nonVotantsVolontaires` (deliberate non-vote / abstention by refusal)
 *  collapse to "absent" — the app's matching algorithm treats both
 *  identically (excluded from the denominator), so they share a single
 *  PersonnaliteVote value rather than splitting into two states. */
export function extractVotesFromScrutin(
  scrutin: ANScrutinForPersonnalites,
  refToCode: Map<string, PersonnaliteCode>,
): Partial<Record<PersonnaliteCode, PersonnaliteVote>> {
  const out: Partial<Record<PersonnaliteCode, PersonnaliteVote>> = {};
  for (const code of PERSONNALITE_CODES) out[code] = "non_dispo";

  const groupes = asArr(scrutin.ventilationVotes?.organe?.groupes?.groupe);
  for (const g of groupes) {
    const dn = g.vote?.decompteNominatif;
    if (!dn) continue;
    for (const v of asArr(dn.pours?.votant)) {
      const code = refToCode.get(v.acteurRef);
      if (code) out[code] = "pour";
    }
    for (const v of asArr(dn.contres?.votant)) {
      const code = refToCode.get(v.acteurRef);
      if (code) out[code] = "contre";
    }
    for (const v of asArr(dn.abstentions?.votant)) {
      const code = refToCode.get(v.acteurRef);
      if (code) out[code] = "abstention";
    }
    for (const v of asArr(dn.nonVotants?.votant)) {
      const code = refToCode.get(v.acteurRef);
      if (code) out[code] = "absent";
    }
    for (const v of asArr(dn.nonVotantsVolontaires?.votant)) {
      const code = refToCode.get(v.acteurRef);
      if (code) out[code] = "absent";
    }
  }
  return out;
}
