// src/lib/parties.ts
import type { GroupCode } from "../types";

export interface PartyMeta {
  name: string;            // full name shown on rows
  short: string;           // short label for chips/cards
  colorVar: string;        // CSS variable like "--p-lfi"
}

// Insertion order = political left-to-right. Stable JS sort preserves
// this for ties in rankByAlignment without needing an explicit order
// field. (Previously had `code` + `orderHint` fields that no consumer
// touched — removed to keep the metadata honest.)
export const PARTIES: Record<GroupCode, PartyMeta> = {
  LFI:  { name: "La France Insoumise",                 short: "LFI",  colorVar: "--p-lfi"  },
  GDR:  { name: "Gauche Démocrate & Républicaine",     short: "GDR",  colorVar: "--p-gdr"  },
  ECO:  { name: "Écologistes",                         short: "ECO",  colorVar: "--p-eco"  },
  SOC:  { name: "Socialistes & apparentés",            short: "SOC",  colorVar: "--p-soc"  },
  LIOT: { name: "Libertés, Indépendants, Outre-mer",   short: "LIOT", colorVar: "--p-liot" },
  EPR:  { name: "Ensemble pour la République",         short: "EPR",  colorVar: "--p-epr"  },
  DEM:  { name: "Démocrate (MoDem)",                   short: "DEM",  colorVar: "--p-dem"  },
  HOR:  { name: "Horizons & Indépendants",             short: "HOR",  colorVar: "--p-hor"  },
  DR:   { name: "Droite Républicaine",                 short: "DR",   colorVar: "--p-dr"   },
  UDR:  { name: "Union des Droites pour la République", short: "UDR", colorVar: "--p-udr"  },
  RN:   { name: "Rassemblement National",              short: "RN",   colorVar: "--p-rn"   },
};

export function getParty(code: GroupCode): PartyMeta {
  return PARTIES[code];
}

export function getPartyColorVar(code: GroupCode): string {
  return `var(${PARTIES[code].colorVar})`;
}
