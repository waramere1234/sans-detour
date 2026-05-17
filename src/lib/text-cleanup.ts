// src/lib/text-cleanup.ts
//
// Shared text-cleanup helpers used by Card.tsx (verso contexte + analyse
// bullets) and AuditTrail.tsx (extractConcrete bullet). Before this lib,
// both files inlined slightly different versions of citation stripping —
// AuditTrail's version missed the orphan-tag strip from Card's, so a
// malformed `<cite>` without a matching `</cite>` would leak into the
// AuditTrail row. Centralising keeps the two sites in lockstep.

/** Strip Anthropic web_search citation markup like
 *  `<cite index="20-2,20-3">text</cite>` — preserve the inner text, drop
 *  the wrapper. Also drops any orphan opening/closing tags (a model that
 *  cut its output mid-token leaves stray `<cite ...>` without close).
 *  Collapses runs of horizontal whitespace inserted by the strip. */
export function stripCitations(text: string): string {
  return text
    .replace(/<cite[^>]*>([\s\S]*?)<\/cite>/g, "$1")
    .replace(/<\/?cite[^>]*>/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Strip trailing "Vote : X oui, Y non" / "Résultat : ..." fragments the
 *  LLM sometimes appends to contexte. The vote outcome is computed
 *  elsewhere; including it conflates "what the law does" with "what
 *  happened at the vote", which spoils the user's own vote and is
 *  off-topic.
 *
 *  Matches ONLY the colon form (`Vote :`, `Résultat :`) because that's
 *  the LLM's appendage style. Matching `.` would eat ordinary French
 *  usage like "passer un texte sans vote." which truncates the contexte
 *  mid-sentence. */
export function stripVoteResult(text: string): string {
  const m = text.match(/\s+(Vote|Résultat)\s*:/i);
  if (!m || m.index === undefined) return text;
  return text.slice(0, m.index).trim();
}

/** Drop `**bold**` markdown markers from a string. Use when the rendering
 *  surface is too compact for emphasis (AuditTrail bullet). For
 *  emphasis-aware rendering, use renderWithBold in Card.tsx instead. */
export function stripBoldMarkers(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1");
}

/** Extract the first "Concrètement :" or "Par exemple :" sentence from the
 *  contexte field, returning a clean one-line bullet (no citations, no
 *  bold markup, no trailing period). Returns `null` when neither marker is
 *  present (fallback summaries don't have these).
 *
 *  The sentence-boundary regex `(?=\.\s+[A-Z]|\.?$)` matches:
 *  - a period followed by whitespace then a capital letter (start of next
 *    sentence), OR
 *  - end of string (optionally preceded by a period).
 *
 *  The optional `[:,]?` after the marker handles the LLM's occasional
 *  drift from "Concrètement :" to "Concrètement, …" — without the comma
 *  fallback, the bullet would surface with a leading ", " that the
 *  later trim can't recover. */
export function extractConcrete(contexte?: string): string | null {
  if (!contexte) return null;
  // stripCitations handles both wrapped `<cite>…</cite>` and orphan
  // opening/closing tags (LLM mid-token cut).
  const cleaned = stripCitations(contexte);
  const m = cleaned.match(/(?:Concrètement|Par exemple)\s*[:,]?\s*([^]+?)(?=\.\s+[A-Z]|\.?$)/i);
  if (!m) return null;
  const sentence = m[1].trim().replace(/\.$/, "");
  // AuditTrail row is dense — bold markup adds noise without emphasis value.
  return stripBoldMarkers(sentence);
}
