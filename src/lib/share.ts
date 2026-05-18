// src/lib/share.ts
//
// Pure share-text composition + the 3-tier share-action fallback chain
// for Result.tsx. The composition (top-N mapping + partial-vs-complete
// lead + numbered separator) is fully testable; the action's
// navigator.share / clipboard / prompt branches mock cleanly in jsdom.

import {
  SHARE_SOURCE_LINE, MIDDLE_DOT_SEPARATOR,
  SHARE_LEAD_TO_SOURCE_SEPARATOR, SHARE_LEAD_TO_SUMMARY_SEPARATOR,
  type GroupAlignment,
} from "../types";
import { getParty } from "./parties";

// SHARE_SOURCE_LINE lives in src/types (DOM-free) so api/share-card.ts
// can import it without dragging in the navigator/window globals this
// file references via performShare. Re-exported below for ergonomic
// consumer access — same module surface as before.
export { SHARE_SOURCE_LINE };

/** Max number of groups included in the share text. Keep small enough
 *  to fit a tweet/iMessage preview without truncation; the SVG share
 *  card endpoint (api/share-card.ts) caps at 8 for its taller layout. */
export const SHARE_TOP_N = 6;

/** Lead phrase that opens every share message: "Mes affinités politiques
 *  réelles, basées sur les vrais votes de l'AN : …". Exported (not file-
 *  local) because tests/share.test.ts pin the wording via 2 .toContain
 *  assertions — keeping it private to this file means a rewording would
 *  silently desync source + tests. The composeShareText output is
 *  asserted via SHARE_LEAD_PREFIX round-trip in tests. */
export const SHARE_LEAD_PREFIX = "Mes affinités politiques réelles";

/** Label shown by `window.prompt(...)` in performShare's last-resort
 *  branch (Safari < 13 / clipboard blocked). Exported because the test
 *  assertion uses `.toHaveBeenCalledWith(LABEL, …)` and a copy tweak
 *  would otherwise need to land on source + test in lockstep. */
export const CLIPBOARD_PROMPT_LABEL = "Copie ton résultat :";

/** Build the parenthetical "(résultat partiel N/TARGET)" marker injected
 *  into the share-text lead when the user shares a partial session
 *  (before reaching TARGET votes). Pulled out of the inline template
 *  in composeShareText so:
 *    - a future i18n flip ("(partial N/M)" for en-US) touches one place
 *    - the test pin can round-trip via the helper instead of inlining
 *      the literal "résultat partiel 7/20" which drifts on rewording
 *  Returns the marker WITH a leading space so callers concatenate
 *  cleanly: `${PREFIX}${partialResultMarker(...) || ""}, ${...}`. */
export function partialResultMarker(total: number, target: number): string {
  return ` (résultat partiel ${total}/${target})`;
}

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
    .join(MIDDLE_DOT_SEPARATOR);
  // DRY: only the parenthetical suffix differs between the two branches —
  // the prefix + " basées sur…" tail is identical, so build it once.
  const partialParen = args.isPartial
    ? partialResultMarker(args.total, args.target)
    : "";
  const lead = `${SHARE_LEAD_PREFIX}${partialParen}${SHARE_LEAD_TO_SOURCE_SEPARATOR}${SHARE_SOURCE_LINE}`;
  return `${lead}${SHARE_LEAD_TO_SUMMARY_SEPARATOR}${summary}`;
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
    window.prompt(CLIPBOARD_PROMPT_LABEL, clipboardText);
    return "prompted";
  }
}
