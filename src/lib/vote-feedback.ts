// src/lib/vote-feedback.ts
//
// Aria-live announcement composition for Play.tsx vote handler. Two
// concerns previously inlined in the route component:
//   - the choice → label map ("Voté pour. Carte suivante.", etc.)
//   - the zero-width-space alternation that forces aria-live="polite"
//     to re-announce even when the user votes "pour" twice in a row
//     (aria-live only re-announces on content change — without the
//     space toggle, the second identical vote is silent for SR users)
//
// Extracting both lets us pin the format AND the alternation invariant
// without rendering the whole Play route.

import type { UserVote } from "../types";

const LABELS: Record<UserVote, string> = {
  pour: "Voté pour. Carte suivante.",
  contre: "Voté contre. Carte suivante.",
  skip: "Passé. Carte suivante.",
};

/** Zero-width space — invisible char appended to alternate the
 *  announcement string so identical consecutive votes still mutate it. */
export const ZWSP = "​";

/** Compose the next aria-live label given the previous one and the new
 *  user choice. The output ends with a ZWSP iff the previous label did
 *  NOT — alternating the trailing space so the string always differs. */
export function nextVoteLabel(prev: string, choice: UserVote): string {
  return LABELS[choice] + (prev.endsWith(ZWSP) ? "" : ZWSP);
}

/** The base label for a given choice without the alternation marker.
 *  Exported for tests / documentation; production code should call
 *  `nextVoteLabel(prev, choice)` so the alternation kicks in. */
export function voteLabel(choice: UserVote): string {
  return LABELS[choice];
}
