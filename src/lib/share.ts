// src/lib/share.ts
//
// Pure share-text composition + the 3-tier share-action fallback chain
// for Result.tsx. The composition (top-N mapping + partial-vs-complete
// lead + numbered separator) is fully testable; the action's
// navigator.share / clipboard / prompt branches mock cleanly in jsdom.

import type { GroupAlignment } from "../types";
import { getParty } from "./parties";

/** Max number of groups included in the share text. Keep small enough
 *  to fit a tweet/iMessage preview without truncation; the SVG share
 *  card endpoint (api/share-card.ts) caps at 8 for its taller layout. */
export const SHARE_TOP_N = 6;

const LEAD_PREFIX = "Mes affinités politiques réelles";
const LEAD_SUFFIX = "basées sur les vrais votes de l'AN";

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
  // DRY: only the parenthetical suffix differs between the two branches —
  // the prefix + " basées sur…" tail is identical, so build it once.
  const partialParen = args.isPartial
    ? ` (résultat partiel ${args.total}/${args.target})`
    : "";
  const lead = `${LEAD_PREFIX}${partialParen}, ${LEAD_SUFFIX}`;
  return `${lead} : ${summary}`;
}

/** Result of the share action — used by the Result.tsx handler to gate
 *  follow-up analytics or UI feedback if needed. */
export type ShareOutcome =
  | "shared"     // navigator.share resolved
  | "aborted"   // user dismissed the share sheet (DON'T fall through to clipboard)
  | "copied"   // clipboard.writeText resolved
  | "prompted";  // clipboard failed → window.prompt shown as last resort

/** Run the share action with the 3-tier fallback chain:
 *  1. navigator.share (Web Share API) when available.
 *  2. AbortError → user cancelled, return without copying (consent).
 *  3. clipboard.writeText (silent copy, the iMessage/desktop path).
 *  4. window.prompt (Safari < 13 / restricted contexts last resort).
 *
 *  Pulled out of Result.tsx so the AbortError contract — "intentional
 *  cancel must NOT silently fall through to clipboard" — has a test
 *  pin. A refactor that drops the early return would silently copy
 *  the user's result against their will. */
export async function performShare(
  text: string,
  url: string,
): Promise<ShareOutcome> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ text, url });
      return "shared";
    } catch (err) {
      // AbortError = user dismissed the share sheet intentionally.
      // Respecting that requires we DON'T fall through to clipboard.
      if ((err as { name?: string }).name === "AbortError") return "aborted";
      // Other errors (NotAllowedError, etc.) = share API unavailable,
      // safe to try clipboard as a backup path.
    }
  }
  const clipboardText = `${text}\n${url}`;
  try {
    await navigator.clipboard.writeText(clipboardText);
    return "copied";
  } catch {
    window.prompt("Copie ton résultat :", clipboardText);
    return "prompted";
  }
}
