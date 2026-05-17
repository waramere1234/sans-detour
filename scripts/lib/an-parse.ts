// scripts/lib/an-parse.ts
//
// Shared AN-JSON → DB-row parser used by both scripts/ingest-an.ts (initial
// batch) and scripts/resume-ingest.ts (failed-batch recovery). Before this
// lib, the types AND the parseRaw function body were duplicated in both
// scripts — ingest-an's ANGroupVote even carried two extra fields
// (nombreMembresGroupe, vote.positionMajoritaire) that the parser never
// read. Single source of truth keeps the recovery flow byte-for-byte in
// step with the initial-batch flow.
import type { GroupCode, GroupPosition, GroupVoteBreakdown } from "../../src/types";
import { computeGroupPosition } from "../../src/lib/compute-positions";
import { GROUP_MAPPING } from "./an-groups";

/** Per-group vote breakdown as it appears in the AN bulk JSON. Only the
 *  fields the parser actually reads — both scripts inlined a wider shape
 *  with `nombreMembresGroupe` and `vote.positionMajoritaire`, but neither
 *  field was ever accessed. */
export interface ANGroupVote {
  organeRef: string;
  vote: {
    decompteVoix: {
      nonVotants: string;
      pour: string;
      contre: string;
      abstentions: string;
      nonVotantsVolontaires: string;
    };
  };
}

/** Full AN scrutin envelope from `Scrutins.json.zip` (data.assemblee-nationale.fr). */
export interface ANScrutinRaw {
  uid: string;
  numero: string;
  dateScrutin: string;
  typeVote: { codeTypeVote: string; libelleTypeVote: string };
  objet: {
    libelle: string;
    dossierLegislatif: { libelle: string; dossierRef: string } | null;
  };
  ventilationVotes: { organe: { groupes: { groupe: ANGroupVote[] } } };
}

/** The fields parseRaw produces. `ingest-an.ts` later wraps this with LLM-
 *  generated titre_pedago/chapeau/contexte; `resume-ingest.ts` uses the
 *  shape directly when patching previously-ingested rows. */
export interface ParsedScrutinCore {
  id: string;
  numero: number;
  date: string;
  dossier_id: string;
  dossier_titre: string;
  titre_brut: string;
  position_par_groupe: Record<GroupCode, GroupPosition>;
  votes_bruts: Record<GroupCode, GroupVoteBreakdown>;
  est_solennel: boolean;
  url_an_officielle: string;
  pedago_relu: boolean;
}

/** Coerce a string field from the AN JSON (always serialised as string,
 *  even for counts) into a non-negative integer. `null`/`undefined` and
 *  unparseable values both collapse to 0 — defensive against AN payloads
 *  that occasionally omit a counter when the value is zero. */
function n(s: string | null | undefined): number {
  return parseInt(s ?? "0", 10) || 0;
}

/** Turn a raw AN scrutin into the trimmed shape we upsert. Walks the
 *  ventilationVotes tree, maps organeRefs via GROUP_MAPPING, sums each
 *  group's pour/contre/abstention/absent counts, then derives the
 *  position_par_groupe via computeGroupPosition (≥70% rule).
 *
 *  Defensive UDR merge: PO847173 and PO872880 both map to UDR (group
 *  reconstituted around 2025-09 with a new organeRef). If a single
 *  scrutin contained both refs, the breakdowns are summed instead of
 *  overwritten — observed never to happen in practice (they alternate
 *  by date), but the merge is cheap insurance against a future quirk. */
export function parseRaw(raw: ANScrutinRaw): ParsedScrutinCore {
  const votes_bruts = {} as Record<GroupCode, GroupVoteBreakdown>;
  const position_par_groupe = {} as Record<GroupCode, GroupPosition>;

  for (const g of raw.ventilationVotes?.organe?.groupes?.groupe ?? []) {
    const code = GROUP_MAPPING[g.organeRef];
    if (!code) continue;
    const dv = g.vote.decompteVoix;
    const breakdown: GroupVoteBreakdown = {
      pour: n(dv.pour),
      contre: n(dv.contre),
      abstention: n(dv.abstentions),
      absent: n(dv.nonVotants) + n(dv.nonVotantsVolontaires),
    };
    if (votes_bruts[code]) {
      votes_bruts[code] = {
        pour: votes_bruts[code].pour + breakdown.pour,
        contre: votes_bruts[code].contre + breakdown.contre,
        abstention: votes_bruts[code].abstention + breakdown.abstention,
        absent: votes_bruts[code].absent + breakdown.absent,
      };
    } else {
      votes_bruts[code] = breakdown;
    }
    position_par_groupe[code] = computeGroupPosition(votes_bruts[code]);
  }

  const dossier = raw.objet?.dossierLegislatif;
  return {
    id: raw.uid,
    numero: parseInt(raw.numero, 10),
    date: raw.dateScrutin,
    dossier_id: dossier?.dossierRef ?? `STANDALONE-${raw.uid}`,
    dossier_titre: dossier?.libelle ?? raw.objet?.libelle?.slice(0, 120) ?? "Sans dossier",
    titre_brut: raw.objet?.libelle ?? "",
    position_par_groupe,
    votes_bruts,
    est_solennel: raw.typeVote?.codeTypeVote === "SPS",
    url_an_officielle: `https://www.assemblee-nationale.fr/dyn/17/scrutins/${raw.numero}`,
    pedago_relu: false,
  };
}
