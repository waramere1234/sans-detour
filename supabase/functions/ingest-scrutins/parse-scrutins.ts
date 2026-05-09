// supabase/functions/ingest-scrutins/parse-scrutins.ts
//
// ⚠ STATUS: this Deno edge function is NOT the primary ingestion path right
// now. The AN does not actually expose a single bulk JSON endpoint as the
// original plan assumed — it ships a zip of ~6500 per-scrutin JSON files.
// Use scripts/ingest-an.ts (Node-side bootstrap, run manually) which has
// the correct shape, the verified GROUP_MAPPING, and handles the zip.
//
// The constants below (GROUP_MAPPING especially) are kept in sync so that
// when this edge function is rewritten to handle the per-file zip flow,
// no fresh research is needed.

import type { ANScrutinRaw } from "./fetch-an.ts";

/**
 * Verified mapping from AN organeRef → internal GroupCode for the 17e
 * legislature. PO847173 and PO872880 are both "Union des droites pour la
 * République" (the group was reconstituted around 2025-09 with a new ref).
 * PO840056 is the non-inscrits — excluded from the app.
 */
const GROUP_MAPPING: Record<string, string | null> = {
  PO845401: "RN",
  PO845407: "EPR",
  PO845413: "LFI",
  PO845419: "SOC",
  PO845425: "DR",
  PO845439: "ECO",
  PO845454: "DEM",
  PO845470: "HOR",
  PO845485: "LIOT",
  PO845514: "GDR",
  PO847173: "UDR",
  PO872880: "UDR",
  PO840056: null,
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
    // dossier libelle is in objet.dossierLegislatif.libelle when non-null
    // (verified in scripts/ingest-an.ts); the legacy raw.dossierLegislatifRef
    // path is kept here only for backward-compat with the original plan.
    date: raw.dateScrutin,
    dossier_id: raw.dossierLegislatifRef ?? "unknown",
    dossier_titre: "TBD",
    titre_brut: raw.titre,
    votes_bruts,
    est_solennel: isSolemn,
    url_an_officielle: `https://www.assemblee-nationale.fr/dyn/17/scrutins/${raw.numero}`,
  };
}
