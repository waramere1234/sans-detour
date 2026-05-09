// src/types/index.ts

/** All parliamentary group codes for the 17e legislature. */
export const GROUP_CODES = [
  "LFI", "GDR", "ECO", "SOC", "LIOT",
  "EPR", "DEM", "HOR", "DR", "UDR", "RN",
] as const;
export type GroupCode = typeof GROUP_CODES[number];

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
  contexte?: string;           // 1-line stake/context, ≤ 25 words (added in migration 0002)
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

/** Freshness metadata of the database. */
export interface FreshnessInfo {
  total_scrutins: number;
  last_sync_at: string;        // ISO datetime
  next_sync_eta: string;       // ISO datetime
}
