// supabase/functions/ingest-scrutins/fetch-an.ts
//
// Fetches the bulk Scrutins.json file published by the Assemblée Nationale
// open-data portal. The exact JSON shape is a documented soft spot of the
// implementation plan: the engineer running this for the first time should
// inspect the actual payload and adjust both this interface and the unwrap
// in `fetchScrutinsFromAN` if needed.

const LEGIS = "XVII";
const BULK_URL = `https://data.assemblee-nationale.fr/static/openData/repository/${LEGIS}/loi/scrutins/Scrutins.json`;

export interface ANScrutinRaw {
  uid: string;
  numero: number;
  dateScrutin: string;
  typeVote: { typeMajorite: string; libelle: string };
  groupes: {
    groupe: {
      organeRef: string;
      vote: { positionMajoritaire: string; nombres: unknown };
    }[];
  };
  titre: string;
  dossierLegislatifRef?: string;
}

export async function fetchScrutinsFromAN(): Promise<ANScrutinRaw[]> {
  const r = await fetch(BULK_URL);
  if (!r.ok) throw new Error(`AN fetch failed: ${r.status}`);
  const json = await r.json();
  // Soft spot: the AN payload is sometimes wrapped in `scrutins.scrutin`,
  // sometimes returned as a top-level array. Inspect actual data and adapt.
  return (json.scrutins?.scrutin ?? json) as ANScrutinRaw[];
}
