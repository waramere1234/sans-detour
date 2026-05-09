// supabase/functions/ingest-scrutins/compute-positions.ts
//
// Local Deno copy of src/lib/compute-positions.ts. Kept in sync manually so
// the edge function stays self-contained (Deno can't follow Node-style
// extension-less imports into the app source tree).

export type GroupPosition = "pour" | "contre" | "abstention" | "divisé";

export interface GroupVoteBreakdown {
  pour: number;
  contre: number;
  abstention: number;
  absent: number; // non-votants
}

const THRESHOLD = 0.7;

export function computeGroupPosition(b: GroupVoteBreakdown): GroupPosition {
  const effective = b.pour + b.contre + b.abstention;
  if (effective === 0) return "divisé";

  const ratio = (n: number) => n / effective;

  if (ratio(b.pour) >= THRESHOLD) return "pour";
  if (ratio(b.contre) >= THRESHOLD) return "contre";
  if (ratio(b.abstention) >= THRESHOLD) return "abstention";
  return "divisé";
}
