// src/lib/personnalites.ts
import type { GroupCode, PersonnaliteCode } from "../types";

/** Metadata for a presidentially-relevant personality whose individual votes
 *  the app exposes alongside (and on top of) the group-level alignment. */
export interface PersonnaliteMeta {
  display_name: string;
  short_name: string;
  /** Parliamentary group the personality sits with on the deck UI — drives
   *  the color via PARTIES. */
  group_code: GroupCode;
  /** First name / last name as written on the AN open-data deputies file. */
  prenom: string;
  nom: string;
  departement?: string;
  /** AN actor identifier (PA…). Hardcoded after manual lookup on
   *  assemblee-nationale.fr/dyn/deputes/<ref> to avoid relying on the
   *  AMO20/AMO30 bulk download (the URL has been moving on the AN side and
   *  returned 404 on the original attempt). Verified May 2026. */
  acteur_ref: string;
  /** True if the personality is a declared or strongly-pressed 2027
   *  presidential candidate. Currently informational. */
  presidentiable: boolean;
}

export const PERSONNALITES: Record<PersonnaliteCode, PersonnaliteMeta> = {
  le_pen: {
    display_name: "Marine Le Pen",
    short_name: "Le Pen",
    group_code: "RN",
    prenom: "Marine",
    nom: "Le Pen",
    departement: "Pas-de-Calais",
    acteur_ref: "PA720614",
    presidentiable: true,
  },
  faure: {
    display_name: "Olivier Faure",
    short_name: "Faure",
    group_code: "SOC",
    prenom: "Olivier",
    nom: "Faure",
    departement: "Seine-et-Marne",
    acteur_ref: "PA609332",
    presidentiable: true,
  },
  chatelain: {
    display_name: "Cyrielle Chatelain",
    short_name: "Chatelain",
    group_code: "ECO",
    prenom: "Cyrielle",
    nom: "Chatelain",
    departement: "Isère",
    acteur_ref: "PA794008",
    presidentiable: false,
  },
  wauquiez: {
    display_name: "Laurent Wauquiez",
    short_name: "Wauquiez",
    group_code: "DR",
    prenom: "Laurent",
    nom: "Wauquiez",
    departement: "Haute-Loire",
    acteur_ref: "PA267285",
    presidentiable: true,
  },
  attal: {
    display_name: "Gabriel Attal",
    short_name: "Attal",
    group_code: "EPR",
    prenom: "Gabriel",
    nom: "Attal",
    departement: "Hauts-de-Seine",
    acteur_ref: "PA722190",
    presidentiable: true,
  },
  ciotti: {
    display_name: "Éric Ciotti",
    short_name: "Ciotti",
    group_code: "UDR",
    prenom: "Éric",
    nom: "Ciotti",
    departement: "Alpes-Maritimes",
    acteur_ref: "PA330240",
    presidentiable: true,
  },
  bompard: {
    display_name: "Manuel Bompard",
    short_name: "Bompard",
    group_code: "LFI",
    prenom: "Manuel",
    nom: "Bompard",
    departement: "Bouches-du-Rhône",
    acteur_ref: "PA793444",
    presidentiable: false,
  },
  panot: {
    display_name: "Mathilde Panot",
    short_name: "Panot",
    group_code: "LFI",
    prenom: "Mathilde",
    nom: "Panot",
    departement: "Val-de-Marne",
    acteur_ref: "PA720892",
    presidentiable: false,
  },
};

export function getPersonnalite(code: PersonnaliteCode): PersonnaliteMeta {
  return PERSONNALITES[code];
}
