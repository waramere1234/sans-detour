// src/lib/matching.ts
import type {
  GroupCode, GroupPosition, UserVote, Scrutin, SessionVote, GroupAlignment,
  PersonnaliteCode, PersonnaliteVote, PersonnaliteAlignment,
} from "../types";
import { GROUP_CODES, PERSONNALITE_CODES } from "../types";

const SCALE: Record<"pour" | "contre" | "abstention", number> = {
  pour: 1,
  abstention: 0,
  contre: -1,
};

/** Score for a single scrutin between user and group. Returns null if not counted. */
export function alignmentScore(user: UserVote, group: GroupPosition): number | null {
  if (user === "skip") return null;
  if (group === "divisé") return null;
  return 1 - Math.abs(SCALE[user] - SCALE[group]) / 2;
}

/** Compute per-group alignment given the session's scrutins and votes. */
export function computeAlignment(
  scrutins: Scrutin[],
  votes: SessionVote[],
): Record<GroupCode, GroupAlignment> {
  const byId = new Map(scrutins.map(s => [s.id, s]));

  const result = {} as Record<GroupCode, GroupAlignment>;
  for (const code of GROUP_CODES) {
    result[code] = {
      group: code, pct: 0, counted: 0,
      perfect: 0, partial: 0, conflict: 0, divided_excluded: 0,
    };
  }

  for (const vote of votes) {
    const scrutin = byId.get(vote.scrutin_id);
    if (!scrutin) continue;
    if (vote.choice === "skip") continue;

    for (const code of GROUP_CODES) {
      const groupPos = scrutin.position_par_groupe[code];
      if (groupPos === "divisé" || groupPos === undefined) {
        if (groupPos === "divisé") result[code].divided_excluded++;
        continue;
      }

      const score = alignmentScore(vote.choice, groupPos);
      if (score === null) continue;

      result[code].counted++;
      if (score === 1) result[code].perfect++;
      else if (score === 0.5) result[code].partial++;
      else result[code].conflict++;
    }
  }

  // Compute pct from counts
  for (const code of GROUP_CODES) {
    const a = result[code];
    if (a.counted === 0) {
      a.pct = 0;
    } else {
      const sum = a.perfect * 1 + a.partial * 0.5 + a.conflict * 0;
      a.pct = Math.round((sum / a.counted) * 100);
    }
  }

  return result;
}

/** Sort group codes by alignment %, highest first. On ties, JS Array.sort
 *  is stable (spec since 2018) so groups keep their GROUP_CODES order,
 *  which is left-to-right political order. */
export function rankByAlignment(
  alignments: Record<GroupCode, GroupAlignment>,
): GroupAlignment[] {
  return GROUP_CODES
    .map(c => alignments[c])
    .sort((a, b) => b.pct - a.pct);
}

/** Score for a single scrutin between user and an individual personality.
 *  Returns null when the comparison can't be made (user skipped, personality
 *  was absent or not yet/anymore a député). */
export function alignmentScorePersonnalite(
  user: UserVote,
  vote: PersonnaliteVote,
): number | null {
  if (user === "skip") return null;
  if (vote === "absent" || vote === "non_dispo") return null;
  return 1 - Math.abs(SCALE[user] - SCALE[vote]) / 2;
}

/** Compute per-personality alignment given the session's scrutins and votes.
 *  Same formula as computeAlignment for groups, but excludes absences and
 *  non-availability from the denominator so the percentage isn't penalised
 *  by mandate-start dates or sick days. */
export function computeAlignmentPersonnalites(
  scrutins: Scrutin[],
  votes: SessionVote[],
): Record<PersonnaliteCode, PersonnaliteAlignment> {
  const byId = new Map(scrutins.map(s => [s.id, s]));

  const result = {} as Record<PersonnaliteCode, PersonnaliteAlignment>;
  for (const code of PERSONNALITE_CODES) {
    result[code] = {
      personnalite: code, pct: 0, counted: 0,
      perfect: 0, partial: 0, conflict: 0,
      absent_excluded: 0, non_dispo_excluded: 0,
    };
  }

  for (const vote of votes) {
    const scrutin = byId.get(vote.scrutin_id);
    if (!scrutin) continue;
    if (vote.choice === "skip") continue;
    const breakdown = scrutin.votes_personnalites;
    if (!breakdown) continue;

    for (const code of PERSONNALITE_CODES) {
      const pv = breakdown[code];
      if (pv === undefined) continue;
      if (pv === "non_dispo") { result[code].non_dispo_excluded++; continue; }
      if (pv === "absent") { result[code].absent_excluded++; continue; }

      const score = alignmentScorePersonnalite(vote.choice, pv);
      if (score === null) continue;

      result[code].counted++;
      if (score === 1) result[code].perfect++;
      else if (score === 0.5) result[code].partial++;
      else result[code].conflict++;
    }
  }

  for (const code of PERSONNALITE_CODES) {
    const a = result[code];
    if (a.counted === 0) {
      a.pct = 0;
    } else {
      const sum = a.perfect * 1 + a.partial * 0.5 + a.conflict * 0;
      a.pct = Math.round((sum / a.counted) * 100);
    }
  }

  return result;
}

/** Sort personalities by alignment %, highest first. */
export function rankPersonnalitesByAlignment(
  alignments: Record<PersonnaliteCode, PersonnaliteAlignment>,
): PersonnaliteAlignment[] {
  return PERSONNALITE_CODES
    .map(c => alignments[c])
    .sort((a, b) => b.pct - a.pct);
}
