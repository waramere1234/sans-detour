// src/lib/share.ts
//
// Pure share-text composition for Result.tsx. Pulled out of the inline
// `share()` handler so the format (top-N mapping + partial-vs-complete
// lead + numbered separator) is testable without orchestrating the full
// Result component + navigator.share + clipboard + prompt chain.
//
// Side-effecting paths (navigator.share / clipboard / window.prompt)
// stay inline in Result.tsx — they're integration-tested manually.

import type { GroupAlignment } from "../types";
import { getParty } from "./parties";

/** Max number of groups included in the share text. Keep small enough
 *  to fit a tweet/iMessage preview without truncation; the SVG share
 *  card endpoint (api/share-card.ts) caps at 8 for its taller layout. */
export const SHARE_TOP_N = 6;

/** Compose the share message. Result.tsx feeds the post-rank alignment
 *  list straight in — we slice locally so callers can't accidentally
 *  ship the whole 11-group ranking. */
export function composeShareText(args: {
  ranked: GroupAlignment[];
  isPartial: boolean;
  total: number;
  target: number;
}): string {
  const summary = args.ranked
    .slice(0, SHARE_TOP_N)
    .map((a, i) => `${i + 1}. ${getParty(a.group).short} ${a.pct}%`)
    .join(" · ");
  const lead = args.isPartial
    ? `Mes affinités politiques réelles (résultat partiel ${args.total}/${args.target}), basées sur les vrais votes de l'AN`
    : `Mes affinités politiques réelles, basées sur les vrais votes de l'AN`;
  return `${lead} : ${summary}`;
}
