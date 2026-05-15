// src/lib/personnalites.ts
import type { GroupCode, PersonnaliteCode } from "../types";

/** Metadata for a presidentially-relevant personality whose individual votes
 *  the app exposes alongside (and on top of) the group-level alignment. */
export interface PersonnaliteMeta {
  code: PersonnaliteCode;
  display_name: string;
  short_name: string;
  /** Parliamentary group the personality sits with on the deck UI — drives
   *  the color via PARTIES. */
  group_code: GroupCode;
  /** First name / last name as written on the AN open-data deputies file.
   *  Used by scripts/ingest-personnalites.ts to resolve `acteurRef` without
   *  hard-coding fragile internal AN IDs. */
  prenom: string;
  nom: string;
  /** Department or circumscription, included for disambiguation when two
   *  députés share a surname (e.g. several "Le Pen" across history). */
  departement?: string;
  /** Optional acteurRef override. Filled in only when the name-based
   *  resolver would be ambiguous or wrong; normally left undefined and the
   *  ingest script writes it back here. */
  acteur_ref?: string;
  /** True if the personality is a declared or strongly-pressed 2027
   *  presidential candidate. Currently informational; the UI uses it later
   *  to highlight the toggle. */
  presidentiable: boolean;
}

export const PERSONNALITES: Record<PersonnaliteCode, PersonnaliteMeta> = {
  le_pen: {
    code: "le_pen",
    display_name: "Marine Le Pen",
    short_name: "Le Pen",
    group_code: "RN",
    prenom: "Marine",
    nom: "Le Pen",
    departement: "Pas-de-Calais",
    presidentiable: true,
  },
  bardella: {
    code: "bardella",
    display_name: "Jordan Bardella",
    short_name: "Bardella",
    group_code: "RN",
    prenom: "Jordan",
    nom: "Bardella",
    presidentiable: true,
  },
  faure: {
    code: "faure",
    display_name: "Olivier Faure",
    short_name: "Faure",
    group_code: "SOC",
    prenom: "Olivier",
    nom: "Faure",
    departement: "Seine-et-Marne",
    presidentiable: true,
  },
  tondelier: {
    code: "tondelier",
    display_name: "Marine Tondelier",
    short_name: "Tondelier",
    group_code: "ECO",
    prenom: "Marine",
    nom: "Tondelier",
    departement: "Pas-de-Calais",
    presidentiable: true,
  },
  wauquiez: {
    code: "wauquiez",
    display_name: "Laurent Wauquiez",
    short_name: "Wauquiez",
    group_code: "DR",
    prenom: "Laurent",
    nom: "Wauquiez",
    departement: "Haute-Loire",
    presidentiable: true,
  },
  attal: {
    code: "attal",
    display_name: "Gabriel Attal",
    short_name: "Attal",
    group_code: "EPR",
    prenom: "Gabriel",
    nom: "Attal",
    departement: "Hauts-de-Seine",
    presidentiable: true,
  },
  darmanin: {
    code: "darmanin",
    display_name: "Gérald Darmanin",
    short_name: "Darmanin",
    group_code: "EPR",
    prenom: "Gérald",
    nom: "Darmanin",
    departement: "Nord",
    presidentiable: true,
  },
  ciotti: {
    code: "ciotti",
    display_name: "Éric Ciotti",
    short_name: "Ciotti",
    group_code: "UDR",
    prenom: "Éric",
    nom: "Ciotti",
    departement: "Alpes-Maritimes",
    presidentiable: true,
  },
  bompard: {
    code: "bompard",
    display_name: "Manuel Bompard",
    short_name: "Bompard",
    group_code: "LFI",
    prenom: "Manuel",
    nom: "Bompard",
    departement: "Bouches-du-Rhône",
    presidentiable: false,
  },
  panot: {
    code: "panot",
    display_name: "Mathilde Panot",
    short_name: "Panot",
    group_code: "LFI",
    prenom: "Mathilde",
    nom: "Panot",
    departement: "Val-de-Marne",
    presidentiable: false,
  },
};

export function getPersonnalite(code: PersonnaliteCode): PersonnaliteMeta {
  return PERSONNALITES[code];
}
