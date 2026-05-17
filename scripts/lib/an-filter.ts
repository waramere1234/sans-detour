// scripts/lib/an-filter.ts
//
// Shared AN-data eligibility filter used by both scripts/ingest-an.ts
// (initial batch) and scripts/resume-ingest.ts (failed-batch recovery).
// Before this lib, isEligibleScrutin was duplicated identically in both
// files — the resume version even carried a "MUST stay in sync with
// scripts/ingest-an.ts" comment, an explicit admission of the drift risk.
//
// The eligibility rule decides what scrutins enter the deck. Changing it
// directly affects what users see (and what the Anthropic batch run costs),
// so it deserves a single source of truth + dedicated tests.

/** Minimal shape of an AN scrutin that the eligibility filter inspects.
 *  Intentionally smaller than the full ANScrutinRaw the parseRaw functions
 *  use — this lib only needs typeVote.codeTypeVote and objet.libelle. */
export interface ANScrutinForFilter {
  typeVote?: { codeTypeVote: string };
  objet?: { libelle?: string };
}

/** Keep a scrutin if it's a final vote on a whole text the user can clearly
 *  position on. Drops amendments (sub-clause votes) and procedural motions
 *  (rejet préalable, renvoi en commission) which discriminate
 *  "majorité vs opposition" rather than left vs right.
 *
 *  Rules (order matters — amendment check is first to drop even SPS-typed
 *  amendments):
 *  1. Drop any title containing `amendement(s)` or `à l'article`
 *  2. Keep all SPS (scrutins solennels) that survived step 1
 *  3. Keep "sur l'ensemble" titles (final vote on a whole text)
 *  4. Keep motion de censure / motion référendaire (politically meaningful)
 *  5. Keep propositions de résolution (already filtered for amendments above)
 *  6. Drop everything else */
export function isEligibleScrutin(raw: ANScrutinForFilter): boolean {
  const code = raw.typeVote?.codeTypeVote;
  const titre = raw.objet?.libelle ?? "";

  // Drop amendments first — even SPS ones, they're not deck-friendly.
  if (/\bamendements?\b/i.test(titre)) return false;
  if (/\bà l'article\b/i.test(titre)) return false;

  // SPS that aren't amendments: always keep.
  if (code === "SPS") return true;

  // Final vote on a whole text.
  if (/sur l'ensemble/i.test(titre)) return true;

  // Censure / référendaire motions — politically meaningful signal.
  // Procedural motions (rejet préalable, renvoi en commission) are out.
  if (/\bmotion de censure\b/i.test(titre)) return true;
  if (/\bmotion référendaire\b/i.test(titre)) return true;

  // Final votes on propositions de résolution (the amendment check above
  // already excludes the noisy amendment-on-resolution variants).
  if (/proposition de résolution/i.test(titre)) return true;

  return false;
}
