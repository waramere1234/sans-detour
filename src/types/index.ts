// src/types/index.ts

/** Number of scrutins drawn per normal session. Refinement mode lets the
 *  deck grow past this. Single source of truth — referenced by Cover,
 *  Play, Result, and the Methode page copy ("20 votes"). */
export const TARGET = 20;

/** Minimum scrutins counted before showing a live ranking (chip on /play,
 *  "Mon résultat" link in TopBar menu, "Voir mon résultat partiel" on
 *  Cover). Below this, percentages bounce too much to mean anything. */
export const MIN_FOR_RANKING = 5;

/** Below this counted-votes threshold, PersonnaliteRow shows a "trop peu
 *  de données" state (faded, no bar) and the ranking pushes the entry to
 *  the bottom. Same value used both for display and for sort to keep the
 *  two in sync. */
export const LOW_DATA_THRESHOLD = 3;


/** All parliamentary group codes for the 17e legislature. */
export const GROUP_CODES = [
  "LFI", "GDR", "ECO", "SOC", "LIOT",
  "EPR", "DEM", "HOR", "DR", "UDR", "RN",
] as const;
export type GroupCode = typeof GROUP_CODES[number];

/** Thematic buckets used by the deck composer to enforce diversity (V2).
 *  "autre" is the catch-all for votes that don't fit a major 2027 theme. */
export const THEMES = [
  "pouvoir-achat", "retraites", "immigration", "sécurité", "écologie",
  "santé", "école", "fiscalité", "institutions", "international", "autre",
] as const;
export type Theme = typeof THEMES[number];

/** Validate that an LLM-emitted theme label is in the enum; off-list values
 *  collapse to "autre" so a misbehaving model can never inject an arbitrary
 *  bucket into the DB. Called by both ingest scripts (ingest-an.ts,
 *  resume-ingest.ts) — kept here next to THEMES to avoid the previous
 *  duplication of the same 4-line function in both scripts. */
export function normalizeTheme(v: unknown): Theme | undefined {
  if (typeof v !== "string") return undefined;
  const lower = v.trim().toLowerCase();
  return (THEMES as readonly string[]).includes(lower) ? (lower as Theme) : "autre";
}

/** Codes for the 8 presidentially-relevant personalities of the 17e
 *  legislature whose individual votes we extract from the AN nominative
 *  vote breakdown. Each code maps to a député in `PERSONNALITES`
 *  (src/lib/personnalites.ts).
 *
 *  Notable absences:
 *  - Mélenchon, Philippe, Glucksmann: not députés (LFI presidential pillar
 *    is at the national level, Philippe is mayor, Glucksmann is MEP).
 *  - Bardella: elected député in 2024 but resigned before sitting (kept his
 *    European mandate). Zero AN votes.
 *  - Tondelier: EELV national secretary + regional councillor; never député.
 *    ECO is represented by Cyrielle Chatelain (présidente du groupe ECO).
 *  - Darmanin: Ministre de l'Intérieur then Garde des Sceaux through most
 *    of the 17e — only 3 effective votes during the Sept-Dec 2024 Barnier
 *    window. Excluded to keep the personality list informative. */
export const PERSONNALITE_CODES = [
  "le_pen", "faure", "chatelain", "wauquiez",
  "attal", "ciotti",
  "bompard", "panot",
] as const;
export type PersonnaliteCode = typeof PERSONNALITE_CODES[number];

/** Vote of a single named personality on a single scrutin. Adds "absent"
 *  (was on the AN roster that day, didn't vote) and "non_dispo" (wasn't a
 *  député at all on that date — e.g. Bardella after his July 2024 resignation)
 *  on top of the group-level positions. */
export type PersonnaliteVote = "pour" | "contre" | "abstention" | "absent" | "non_dispo";

/** Position taken by a parliamentary group on a single scrutin. */
export type GroupPosition = "pour" | "contre" | "abstention" | "divisé";

/** User's choice on a single scrutin. */
export type UserVote = "pour" | "contre" | "skip";

/** Raw vote breakdown for a group on a scrutin. */
export interface GroupVoteBreakdown {
  pour: number;
  contre: number;
  abstention: number;
  absent: number;  // non-votants
}

/** A scrutin as stored in the database and consumed by the front. */
export interface Scrutin {
  id: string;                  // ex: "VTANR5L17V1234"
  numero: number;
  date: string;                // ISO yyyy-mm-dd
  dossier_id: string;
  dossier_titre: string;
  chapeau: string;             // "RETRAITES · PLFSS 2024"
  titre_brut: string;          // raw AN title
  titre_pedago: string;        // 12-word generated summary
  contexte?: string;           // 30-50 words, 2 short sentences with "Concrètement: …"
                               // or "Par exemple: …" as the second sentence (added
                               // in migration 0002 — see that file's comment for the
                               // full spec, which was widened from the original
                               // "one sentence ≤ 25 words" pre-V1)
  analyse_loi?: ScrutinAnalyse;  // structured 4-axis breakdown (migration 0003).
                                 // Column named `analyse_loi` because ANALYSE
                                 // is a PostgreSQL reserved word.
  points_cles?: string[];        // exactly 3 short factual bullets, 7 words
                                 // max each, shown on the card front below
                                 // the titre_pedago (migration 0004).
  theme?: Theme;                 // thematic bucket used by the deck composer
                                 // to enforce diversity (migration 0005).
  votes_personnalites?: Partial<Record<PersonnaliteCode, PersonnaliteVote>>;
                                 // individual votes of the 8 indexed
                                 // personalities (migration 0006). Partial
                                 // because some personalities may not be
                                 // députés at a given date (non_dispo).
  position_par_groupe: Record<GroupCode, GroupPosition>;
  votes_bruts: Record<GroupCode, GroupVoteBreakdown>;
  url_an_officielle: string;
  est_solennel: boolean;
  pedago_relu: boolean;
}

/** A single user vote on a scrutin during a session. */
export interface SessionVote {
  scrutin_id: string;
  choice: UserVote;
  voted_at: number;  // epoch ms
}

/** Persistent session shape in localStorage. */
export interface SessionState {
  session_id: string;
  cards_seen: string[];        // scrutin ids in order
  votes: SessionVote[];
  started_at: number;          // epoch ms
}

/** Structured analyse — factual breakdown of what a law actually does
 *  (mesures, concernés positifs/négatifs/neutres, calendrier, exceptions).
 *  Generated by the LLM during ingestion, rendered inline in the unified
 *  card verso (`Card.tsx` — there is no "+ analyse" entry-point anymore,
 *  see commit 9cb7e6c). All arrays may be empty; **bold** markdown markers
 *  are supported (rendered via renderWithBold helper). */
export interface ScrutinAnalyse {
  mesures_principales: string[];      // what the law creates / forbids / changes
  concernes_positifs: string[];       // groups/sectors with positive impact
  concernes_negatifs: string[];       // groups/sectors with negative impact
  concernes_neutres: string[];        // groups/sectors with mixed or to-watch impact
  calendrier: string[];               // dates: entry into force, intermediate steps
  exceptions: string[];               // exemptions, derogations, transitions
}

/** Per-group alignment result. */
export interface GroupAlignment {
  group: GroupCode;
  pct: number;                 // 0..100, rounded
  counted: number;             // scrutins where group not "divisé" and user not "skip"
  perfect: number;             // exact match count
  partial: number;             // pour/abstention or contre/abstention
  conflict: number;            // pour/contre
  divided_excluded: number;    // scrutins where group was "divisé" (not counted)
}

/** Per-personality alignment result. Same shape as GroupAlignment with two
 *  extra exclusion counters: scrutins where the personality wasn't a député
 *  yet/anymore (non_dispo) or didn't vote (absent), which are dropped from
 *  the denominator so the percentage stays meaningful on a small base. */
export interface PersonnaliteAlignment {
  personnalite: PersonnaliteCode;
  pct: number;
  counted: number;             // scrutins where the personality voted and user not "skip"
  perfect: number;
  partial: number;
  conflict: number;
  absent_excluded: number;     // personality didn't vote (non-votant)
  non_dispo_excluded: number;  // personality not a député at that date
}

/** Freshness metadata of the database. */
export interface FreshnessInfo {
  total_scrutins: number;
  last_sync_at: string;        // ISO datetime
  next_sync_eta: string;       // ISO datetime
}
