// supabase/functions/ingest-scrutins/parse-scrutins.ts
//
// Translates a raw AN scrutin payload into the shape we persist. Two known
// soft spots:
//   1. GROUP_MAPPING is a stub — only 2 of the 11 groups for the 17e
//      legislature are filled in. The remaining organeRef -> code mappings
//      must be looked up against the live AN reference data and added here
//      before this function produces meaningful output.
//   2. dossier_titre is left as "TBD" — resolving the dossier label from
//      `dossierLegislatifRef` requires a second AN endpoint that we have
//      not wired up yet.

import type { ANScrutinRaw } from "./fetch-an.ts";

// TODO(ingest): fill in the remaining 9 groupe-organeRef -> internal code
// mappings (LFI, GDR, ECO, SOC, LIOT, DEM, HOR, DR, UDR) once we have the
// AN reference list for the 17e legislature.
const GROUP_MAPPING: Record<string, string> = {
  PO845401: "EPR",
  PO845405: "RN",
};

interface VoteBreakdown {
  pour: number;
  contre: number;
  abstention: number;
  absent: number;
}

export interface ParsedScrutin {
  id: string;
  numero: number;
  date: string;
  dossier_id: string;
  dossier_titre: string;
  titre_brut: string;
  votes_bruts: Record<string, VoteBreakdown>;
  est_solennel: boolean;
  url_an_officielle: string;
}

interface VotantList {
  votant?: unknown[];
  nonVotants?: unknown;
}

interface NombresShape {
  pours?: VotantList;
  contres?: VotantList;
  abstentions?: VotantList;
  nonVotants?: VotantList;
}

function countVotants(list: VotantList | undefined): number {
  return list?.votant?.length ?? 0;
}

export function parse(raw: ANScrutinRaw): ParsedScrutin {
  const isSolemn =
    raw.typeVote?.typeMajorite?.toLowerCase()?.includes("solennel") ?? false;

  const votes_bruts: Record<string, VoteBreakdown> = {};
  for (const g of raw.groupes?.groupe ?? []) {
    const code = GROUP_MAPPING[g.groupe.organeRef];
    if (!code) continue;
    const nombres = (g.groupe.vote.nombres ?? {}) as NombresShape;
    votes_bruts[code] = {
      // Soft spot: AN sometimes reports `pours.nonVotants` as a flag/marker
      // rather than a list — when set we treat the group as having zero
      // for-votes. This mirrors the plan's defensive default.
      pour: nombres.pours?.nonVotants ? 0 : countVotants(nombres.pours),
      contre: countVotants(nombres.contres),
      abstention: countVotants(nombres.abstentions),
      absent: countVotants(nombres.nonVotants),
    };
  }

  return {
    id: raw.uid,
    numero: raw.numero,
    date: raw.dateScrutin,
    // TODO(ingest): resolve dossier_titre from a second AN endpoint.
    dossier_id: raw.dossierLegislatifRef ?? "unknown",
    dossier_titre: "TBD",
    titre_brut: raw.titre,
    votes_bruts,
    est_solennel: isSolemn,
    url_an_officielle: `https://www.assemblee-nationale.fr/dyn/17/scrutins/detail/${raw.uid}`,
  };
}
