// src/lib/compute-positions.ts
import type { GroupVoteBreakdown, GroupPosition } from "../types";

const THRESHOLD = 0.70;

export function computeGroupPosition(b: GroupVoteBreakdown): GroupPosition {
  const effective = b.pour + b.contre + b.abstention;
  if (effective === 0) return "divisé";

  const ratio = (n: number) => n / effective;

  if (ratio(b.pour) >= THRESHOLD) return "pour";
  if (ratio(b.contre) >= THRESHOLD) return "contre";
  if (ratio(b.abstention) >= THRESHOLD) return "abstention";
  return "divisé";
}
