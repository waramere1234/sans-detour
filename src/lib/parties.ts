// src/lib/parties.ts
import type { GroupCode } from "../types";

export interface PartyMeta {
  code: GroupCode;
  name: string;            // full name shown on rows
  short: string;           // short label for chips/cards
  colorVar: string;        // CSS variable like "--p-lfi"
  orderHint: number;       // suggested left-right axis order
}

export const PARTIES: Record<GroupCode, PartyMeta> = {
  LFI:  { code: "LFI",  name: "La France Insoumise",                 short: "LFI",  colorVar: "--p-lfi",  orderHint: 0 },
  GDR:  { code: "GDR",  name: "Gauche Démocrate & Républicaine",     short: "GDR",  colorVar: "--p-gdr",  orderHint: 1 },
  ECO:  { code: "ECO",  name: "Écologistes",                         short: "ECO",  colorVar: "--p-eco",  orderHint: 2 },
  SOC:  { code: "SOC",  name: "Socialistes & apparentés",            short: "SOC",  colorVar: "--p-soc",  orderHint: 3 },
  LIOT: { code: "LIOT", name: "Libertés, Indépendants, Outre-mer",   short: "LIOT", colorVar: "--p-liot", orderHint: 4 },
  EPR:  { code: "EPR",  name: "Ensemble pour la République",         short: "EPR",  colorVar: "--p-epr",  orderHint: 5 },
  DEM:  { code: "DEM",  name: "Démocrate (MoDem)",                   short: "DEM",  colorVar: "--p-dem",  orderHint: 6 },
  HOR:  { code: "HOR",  name: "Horizons & Indépendants",             short: "HOR",  colorVar: "--p-hor",  orderHint: 7 },
  DR:   { code: "DR",   name: "Droite Républicaine",                 short: "DR",   colorVar: "--p-dr",   orderHint: 8 },
  UDR:  { code: "UDR",  name: "Union des Droites pour la République", short: "UDR", colorVar: "--p-udr",  orderHint: 9 },
  RN:   { code: "RN",   name: "Rassemblement National",              short: "RN",   colorVar: "--p-rn",   orderHint: 10 },
};

export function getParty(code: GroupCode): PartyMeta {
  return PARTIES[code];
}

export function getPartyColorVar(code: GroupCode): string {
  return `var(${PARTIES[code].colorVar})`;
}
