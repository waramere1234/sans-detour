// src/lib/compute-positions.ts
import type { GroupVoteBreakdown, GroupPosition } from "../types";

/** Documented Methode §03 invariant: a group's effective-voter share
 *  must reach this ratio for the group to count as taking a clear
 *  position (pour / contre / abstention); otherwise the group is
 *  classified as `divisé` and excluded from the user's alignment for
 *  that scrutin. Exported so the test suite can derive boundary
 *  inputs from the constant rather than hardcoding "70" — a future
 *  bump to 0.75 would otherwise leave the boundary tests silently
 *  passing on the old threshold. */
export const THRESHOLD = 0.70;

export function computeGroupPosition(b: GroupVoteBreakdown): GroupPosition {
  const effective = b.pour + b.contre + b.abstention;
  if (effective === 0) return "divisé";

  const ratio = (n: number) => n / effective;

  if (ratio(b.pour) >= THRESHOLD) return "pour";
  if (ratio(b.contre) >= THRESHOLD) return "contre";
  if (ratio(b.abstention) >= THRESHOLD) return "abstention";
  return "divisé";
}
