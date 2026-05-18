// src/types/index.ts

/** Number of scrutins drawn per normal session. Refinement mode lets the
 *  deck grow past this. Single source of truth — referenced by Cover,
 *  Play, Result, and the Methode page copy ("20 votes"). */
export const TARGET = 20;

/** Minimum scrutins counted before showing a live ranking (chip on /play,
 *  "Mon résultat" link in TopBar menu, "Voir mon résultat partiel" on
 *  Cover). Below this, percentages bounce too much to mean anything. */
export const MIN_FOR_RANKING = 5;

/** Below this counted-votes threshold, PersonnaliteRow shows a "trop peu
 *  de données" state (faded, no bar) and the ranking pushes the entry to
 *  the bottom. Same value used both for display and for sort to keep the
 *  two in sync. */
export const LOW_DATA_THRESHOLD = 3;

/** Maximum bullets the front renders in a card's `points_cles` block.
 *  Mirrored by `normalizePointsCles` in scripts/lib/parse-summary.ts
 *  (the ingest-side hard cap) and surfaced in Methode §07's "Ce que fait
 *  Claude" prose so a future bump propagates from the cap to the
 *  documentation. Three sites share this single source of truth. */
export const MAX_POINTS_CLES_BULLETS = 3;

/** Maximum words per `points_cles` bullet — `normalizePointsCles`
 *  truncates the rest with an ellipsis. Same drift-prevention pattern
 *  as the bullet count. */
export const MAX_WORDS_PER_BULLET = 7;


/** Short label for the legislature this app covers — surfaced on the
 *  Cover header ("17e LÉGISLATURE — TON ALIGNEMENT RÉEL") and the Result
 *  header ("RÉSULTAT · 17e LÉGISLATURE"). Centralised so the V3
 *  transition to the 18e legislature is a single edit rather than a
 *  Cover + Result + Methode + Legal scavenger hunt. */
export const LEGISLATURE_LABEL = "17e LÉGISLATURE";

/** Lowercase variant of the legislature label for prose copy — used in
 *  index.html og:description ("…de la 17e législature.") and matched
 *  by tests/site-metadata.test.ts to keep the static HTML in sync with
 *  the V3 transition. */
export const LEGISLATURE_LABEL_LOWERCASE = "17e législature";

/** Tagline rendered on the Cover hero (split across JSX nodes for the
 *  accent color) AND surfaced in 5 static-file sites: index.html meta
 *  description + og:description prefix + twitter:description + title
 *  + manifest.webmanifest description. tests/site-metadata.test.ts
 *  reads each file and asserts the tagline matches this const, so a
 *  rewording propagates from one edit. */
export const TAGLINE = "Pas les programmes. Les vrais votes.";

/** Public app name — used by the PWA manifest (name + short_name) and
 *  surfaced in index.html (og:title + twitter:title + the compound
 *  <title>). Same sync invariant as TAGLINE. */
export const BRAND_NAME = "Sans Détour";

/** Production origin (no trailing slash) — single source of truth for
 *  the canonical URL used by index.html's <link rel="canonical">,
 *  og:url, og:image (with `/icons/...` path appended), and
 *  twitter:image. A rebrand to a different domain edits this const
 *  and the 4 static call sites surface in tests/site-metadata.test.ts. */
export const PROD_ORIGIN = "https://sansdetour.fr";

/** Production hostname (no protocol, no trailing slash) — derived from
 *  PROD_ORIGIN so a rebrand updates the apex once and the share-card
 *  footer, the TopBar menu-footer label, the contact email domain,
 *  and the analytics gate's apex entry all follow. Previously a
 *  literal "sansdetour.fr" duplicated across 4 sites. */
export const PROD_HOSTNAME = PROD_ORIGIN.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** BCP47 locale used by:
 *  - index.html (<html lang=...>)
 *  - public/manifest.webmanifest (lang)
 *  - Card.tsx scrutin-date rendering (toLocaleDateString)
 *  Single source of truth so a future i18n move (e.g. en-US for a
 *  diaspora variant) is a deliberate edit rather than a search-and-
 *  replace across 4 sites with one inevitably missed. */
export const APP_LOCALE = "fr-FR";

/** Open Graph locale variant — same semantic as APP_LOCALE but with
 *  the OG-spec underscore separator (`fr_FR` not `fr-FR`). Derived
 *  from APP_LOCALE so a future locale change touches both sides via
 *  one edit. */
export const OG_LOCALE = APP_LOCALE.replace("-", "_");

/** Max content width (px) for prose-heavy "reading" pages: Methode +
 *  the RouteLoader fallback in main.tsx that the Suspense boundary
 *  shows while Methode/Legal lazy-load. Wider than the app screens
 *  (Cover/Play/Result use `var(--max-content)` which is ~480) and
 *  Legal (640) so the longer Methode paragraphs don't wrap awkwardly.
 *  Previously inlined 720 in 2 places — a future bump (e.g. to 760
 *  for better line-length) would have left RouteLoader showing the
 *  old width during the Methode lazy-load flash. */
export const READING_PAGE_MAX_WIDTH = 720;

/** Cover primary-CTA label triplet — the button text changes based
 *  on the user's session state. Co-located so a rewording of any one
 *  label happens alongside the other two, and tests can iterate the
 *  set as a single source of truth.
 *
 *  - START_LABEL: first visit, no session yet ("Commencer").
 *  - RESUME_LABEL: in-progress session, votes < TARGET ("Reprendre").
 *  - VIEW_RESULT_LABEL: completed session, votes ≥ TARGET
 *    ("Voir mon résultat"). Also re-used by Play.tsx's RetryError
 *    fallback when the deck is exhausted. */
export const START_LABEL = "Commencer";
export const RESUME_LABEL = "Reprendre";
export const VIEW_RESULT_LABEL = "Voir mon résultat";

/** Cover secondary-CTA labels (visible only when hasInProgress=true).
 *  - RESTART_LABEL: destructive "wipe session, start over" link. The
 *    string is also the prefix of the window.confirm prompt — Cover
 *    builds the confirm message as `${RESTART_LABEL} ? Tes N votes…`.
 *  - VIEW_PARTIAL_RESULT_LABEL: link to /result before TARGET is
 *    reached, gated on canSeePartialResult = votes >= MIN_FOR_RANKING.
 *    Centralised so a rewording propagates from one edit to the
 *    visible text + tests + the parallel Result.tsx REFAIRE_LABEL
 *    semantic (different CTA, different copy, different route). */
export const RESTART_LABEL = "Recommencer à zéro";
export const VIEW_PARTIAL_RESULT_LABEL = "Voir mon résultat partiel";

/** Compose the `window.confirm(...)` message body for Cover.tsx's restart
 *  action. Centralises the singular ("Ton vote en cours sera perdu.") /
 *  plural ("Tes N votes en cours seront perdus.") French agreement +
 *  the RESTART_LABEL prefix. tests/Cover.test.tsx pin both branches via
 *  `expect.stringMatching(/.../)` — exporting the helper lets the tests
 *  round-trip via the function instead of re-typing the literals. A
 *  future rewording (or a future stop-pluralizing-and-just-say-"N votes
 *  perdus" cleanup) propagates from one edit. */
export function restartConfirmMessage(votesCount: number): string {
  const lossPhrase = votesCount === 1
    ? "Ton vote en cours sera perdu."
    : `Tes ${votesCount} votes en cours seront perdus.`;
  return `${RESTART_LABEL} ? ${lossPhrase}`;
}

/** Compose the `window.confirm(...)` message body for Result.tsx's
 *  refaire (restart-from-result) action. Symmetric to
 *  restartConfirmMessage (Cover) — the loss-phrase differs because
 *  the user has completed the session and reached a result, so the
 *  message names both the votes AND the result as what will be lost.
 *  tests/Result.test.tsx pin the plural branch via stringMatching;
 *  the helper round-trips so a rewording propagates from one edit. */
export function refaireConfirmMessage(total: number): string {
  const lossPhrase = total === 1
    ? "Ton vote et ton résultat seront perdus."
    : `Tes ${total} votes et ton résultat seront perdus.`;
  return `${REFAIRE_LABEL} ? ${lossPhrase}`;
}

/** aria-label + visible-header prefix for the RankingOverlay modal
 *  ("Classement partiel · N comptés"). The same string appears 5×:
 *    - aria-label on the role="dialog" container
 *    - visible header prefix before the · N comptés count
 *    - aria-label test assertion (.toHaveAttribute)
 *    - visible-header test assertions × 2 (regex with the count suffix)
 *  A rewording would have required 5 in-lockstep edits; centralising
 *  the const keeps source + tests in sync. */
export const RANKING_OVERLAY_LABEL = "Classement partiel";

/** Close-button label used by 2 modals — MethodeSheet (as aria-label,
 *  with visible "✕" icon) + RankingOverlay (as visible button text,
 *  no aria-label needed because the visible text is the accessible
 *  name). Centralising means a future i18n flip ("Close") propagates
 *  to both modals + the RankingOverlay test regex via one edit. */
export const MODAL_CLOSE_LABEL = "Fermer";

/** Separator label rendered on Card verso between the LLM-rendered
 *  synthesis sections (above) and the raw AN libellé (below). The
 *  "↑ Synthèse IA · ↓ texte officiel AN" inscription makes the bias
 *  framing explicit (Methode §07 leans on the same wording). Pinned
 *  by 2 .getByText regex assertions in tests/Card.test.tsx — exporting
 *  the const keeps source + tests in sync, and the literal stays
 *  available for tests/Methode.test.tsx if it ever cross-references. */
export const CARD_VERSO_SEPARATOR_LABEL = "↑ Synthèse IA  ·  ↓ texte officiel AN";

/** Visible "Voir sur AN ↗" link text on Card verso footer (the link
 *  that opens the official AN scrutin page in a new tab). Methode §07
 *  prose references this exact wording in quoted form ("« Voir sur
 *  AN ↗ »") — so a rewording must propagate to both sites in lockstep.
 *  Exporting the const enforces the round-trip. */
export const AN_LINK_VISIBLE_LABEL = "Voir sur AN ↗";

/** TopBar menu trigger aria-labels — the same `<button>` swaps its
 *  aria-label between MENU_OPEN_LABEL and MENU_CLOSE_LABEL based on
 *  the `open` state. Tests pin these via `getByRole("button", { name:
 *  /Ouvrir le menu/ })` 18× and /Fermer le menu/ once — exporting the
 *  consts keeps source + 19 test sites in sync. MAIN_MENU_LABEL is
 *  the aria-label on the popover `<nav>` landmark. */
export const MENU_OPEN_LABEL = "Ouvrir le menu";
export const MENU_CLOSE_LABEL = "Fermer le menu";
export const MAIN_MENU_LABEL = "Menu principal";

/** ErrorBoundary fallback copy — rendered when a React error escapes
 *  to the root boundary. 3 user-visible strings pinned by tests via
 *  case-insensitive regex (.getByText /quelque chose s'est cassé/i,
 *  .getByRole("button", { name: /recharger/i })). Exporting them
 *  keeps source + tests in sync; the sr-only h1 wording stays here
 *  so an i18n flip propagates to all 3 strings together. */
export const ERROR_FALLBACK_HEADING = "Erreur";
export const ERROR_FALLBACK_MESSAGE = "Quelque chose s'est cassé de notre côté.";
export const ERROR_FALLBACK_RELOAD_LABEL = "Recharger";

/** Result.tsx button label that toggles the personnalités section
 *  (V2 P2 — 8 indexed presidential figures). Used 1× in source +
 *  6× in tests/Result.test.tsx as regex literals — a rewording
 *  would have required 7 in-lockstep edits. Centralised so a future
 *  i18n flip ("Show candidates" / "Voir les candidat·e·s") propagates
 *  to all 7 sites via one edit. */
export const PERSONNALITES_TOGGLE_LABEL = "Voir les personnalités";

/** Header label above the raw AN libellé block on Card verso. The
 *  string makes explicit "below this is the unmodified official AN
 *  wording" — pair to CARD_VERSO_SEPARATOR_LABEL. Used 1× in source
 *  + 2× in tests/Card.test.tsx as regex literals; centralised so a
 *  rewording propagates from one edit. */
export const CARD_AN_LIBELLE_PREFIX_LABEL = "Intitulé officiel AN";

/** aria-label on the Methode.tsx in-page Sommaire <nav> landmark
 *  (the table-of-contents listing the 7 sections). Pinned by 1
 *  test regex `name: /Sommaire/` — exporting the const keeps source
 *  + test in sync and surfaces a future rewording (e.g. "Table des
 *  matières") to the test pin. */
export const METHODE_SOMMAIRE_NAV_LABEL = "Sommaire de la méthode";

/** Cover.tsx top-right source-attribution block (two stacked lines).
 *  Pinned by 2 test regex literals (`/Données AN/i`, `/Claude/i`).
 *  Two consts so a rewording of either pole (AN-side vs Claude-side)
 *  is independent. The two strings document the same contract as
 *  CARD_VERSO_SEPARATOR_LABEL: explicit IA-vs-AN provenance. */
export const COVER_SOURCE_ATTRIBUTION_AN = "Données AN officielles";
export const COVER_SOURCE_ATTRIBUTION_CLAUDE = "résumés Claude (IA)";

/** Compose the aria-label for the ChipTop1 "currently #1 — tap for full
 *  ranking" pill on /play (visible once countedTotal ≥ MIN_FOR_RANKING).
 *  The previous inline template was `Top 1 actuel : ${name} à ${pct} %.
 *  Toucher pour voir le classement complet.` and only the {name} + {pct}
 *  slots were pinned by tests via `.stringContaining(...)` — the
 *  surrounding wording was unpinned and could silently drift. The helper
 *  encapsulates the template; round-trip tests assert the full string. */
export function chipTop1AriaLabel(partyName: string, pct: number): string {
  return `Top 1 actuel : ${partyName} à ${pct} %. Toucher pour voir le classement complet.`;
}

/** MethodeSheet bottom-sheet's 2 source-attribution Block titles, paired
 *  with COVER_SOURCE_ATTRIBUTION_AN/CLAUDE (Cover header). Same IA-vs-AN
 *  framing — the sheet's 2 emoji-prefixed blocks document what comes from
 *  the AN open data vs what's reformulated by Claude. Centralised so the
 *  4-site pair (Cover × 2 + Sheet × 2) stays aligned through reworks. */
export const METHODESHEET_AN_BLOCK_TITLE = "AN officiel";
export const METHODESHEET_CLAUDE_BLOCK_TITLE = "Mis en forme par IA Claude";

/** aria-label on the ✨IA chip button inside Card recto (visible when the
 *  card is topMost + onOpenMethode is provided). The chip opens
 *  MethodeSheet — the aria-label briefs SR users on what they'll get
 *  before they activate. Single source site today, no test pins;
 *  centralising defends against silent rewording. */
export const CARD_IA_CHIP_ARIA_LABEL = "IA — comment ce contenu a été préparé";

/** Methode.tsx page header eyebrow + h1 visible text. The h1 is pinned
 *  by 1 test regex (`/Comment on calcule/`, loose partial match) — a
 *  rewording could partially desync source + test. Centralising both
 *  strings closes the gap and surfaces the eyebrow too (currently
 *  unpinned). The eyebrow lives in the same header block above the
 *  h1 with uppercase styling. */
export const METHODE_PAGE_EYEBROW = "MÉTHODE & SOURCES";
export const METHODE_PAGE_H1 = "Comment on calcule, et avec quelles données";

/** Card recto + AuditTrail per-row demo-data short fallback label
 *  ("démo"). Rendered when the scrutin lacks a real `url_an_officielle`
 *  — the dev-fixture path used by `npm run seed`. 3 sites today:
 *    - Card.tsx recto footer (replaces "n° N" when demo)
 *    - AuditTrail.tsx per-row link (replaces external AN link)
 *    - tests/AuditTrail.test.tsx `getByText("démo")` assertion
 *  Distinct from DEMO_DATA_LABEL_PREFIX (which is the longer aria-label
 *  prefix used on Card verso footer + the AuditTrail title/aria-label).
 *  This is the short visible badge; that is the long screen-reader hint. */
export const DEMO_FALLBACK_SHORT_LABEL = "démo";

/** AuditTrail.tsx per-row icon `aria-label`s — one per
 *  `alignmentScore` outcome ({null, 0, 0.5, 1}). 10 sites today
 *  (4 source ifs + 6 test getByLabelText assertions). Centralised
 *  so a rewording propagates to source + 6 tests in one edit. */
export const AUDIT_TRAIL_LABEL_DIVIDED = "Groupe divisé, non compté";
export const AUDIT_TRAIL_LABEL_ALIGNED = "Aligné";
export const AUDIT_TRAIL_LABEL_PARTIAL = "Partiel";
export const AUDIT_TRAIL_LABEL_OPPOSED = "Opposé";

/** Compose the SR-friendly one-sentence aria-label rendered on each
 *  PartyRow (Result.tsx ranking + RankingOverlay rows). The previous
 *  inline template `${name}, ${pct} % d'alignement sur ${counted}
 *  scrutin(s) compté(s)` was pinned by 4 test regex partial-matches —
 *  a partial rewording (e.g. drop "d'alignement") would pass silently.
 *  Helper + round-trip pin closes the gap. Handles the singular /
 *  plural agreement on "scrutin" + "compté" via the same `!== 1` rule. */
export function partyRowAriaLabel(name: string, pct: number, counted: number): string {
  const s = counted !== 1 ? "s" : "";
  return `${name}, ${pct} % d'alignement sur ${counted} scrutin${s} compté${s}`;
}

/** Compose the SR-friendly one-sentence aria-label rendered on each
 *  PersonnaliteRow. Two branches:
 *    - Normal:    `${name}, ${pct} % d'alignement sur ${counted} vote(s)`
 *    - Low-data:  `${name}, trop peu de données : ${counted} vote(s) comparable(s)`
 *  Low-data branch drops the pct to avoid implying a real score on a
 *  1-2 vote sample (LOW_DATA_THRESHOLD). 5+ test regex partial-matches
 *  in tests/PersonnaliteRow.test.tsx pin individual fragments; the
 *  helper enables full-string round-trips. The "tooLittleData" flag is
 *  passed explicitly so the consumer (PersonnaliteRow) doesn't have to
 *  duplicate the LOW_DATA_THRESHOLD comparison inside this helper. */
export function personnaliteRowAriaLabel(
  displayName: string,
  pct: number,
  counted: number,
  tooLittleData: boolean,
): string {
  const s = counted !== 1 ? "s" : "";
  if (tooLittleData) {
    return `${displayName}, trop peu de données : ${counted} vote${s} comparable${s}`;
  }
  return `${displayName}, ${pct} % d'alignement sur ${counted} vote${s}`;
}

/** Compose the visible right-column text rendered in PersonnaliteRow:
 *    - Normal:    "{pct}% · {counted}"
 *    - Low-data:  "— · {counted} vote(s)" (no pct → suppress implied score)
 *  Previously an inline 2-branch ternary in PersonnaliteRow.tsx; pinned
 *  by 2 test regex partial-matches (`/57%.*12/`, `/— · N votes/`). Helper
 *  enables round-trip via full-string match. Same `tooLittleData` flag
 *  contract as personnaliteRowAriaLabel — the consumer passes it
 *  explicitly so the helper doesn't need to know LOW_DATA_THRESHOLD. */
export function personnaliteRowRightColumnText(
  pct: number,
  counted: number,
  tooLittleData: boolean,
): string {
  if (tooLittleData) {
    const s = counted !== 1 ? "s" : "";
    return `— · ${counted} vote${s}`;
  }
  return `${pct}% · ${counted}`;
}

/** AuditTrail breakdown-chip kinds, used by `auditTrailChipText` to
 *  pick the right wording + plural rule. The 4 kinds mirror the 4
 *  outcomes of alignmentScore (perfect → "aligné", partial → "partiel",
 *  conflict → "opposé", divided → "divisé non compté"). */
export type AuditTrailChipKind = "aligned" | "partial" | "opposed" | "divided";

/** Compose the noun-with-plural for the AuditTrail breakdown chip
 *  ("aligné(s)" / "partiel(s)" / "opposé(s)" / "divisé(s) non
 *  compté(s)"). Pulled out of 4 inline `aligné{plural}` templates +
 *  5 test regex partial-matches in tests/AuditTrail.test.tsx (one
 *  per kind + a plural-rule pin for "divisé"). The UI puts the count
 *  in a separately-colored span; this helper just returns the noun.
 *  Each kind has its own French plural rule + optional modifier
 *  agreement ("non compté" agrees with "divisé"). */
export function auditTrailChipNoun(count: number, kind: AuditTrailChipKind): string {
  const s = count !== 1 ? "s" : "";
  switch (kind) {
    case "aligned":  return `aligné${s}`;
    case "partial":  return `partiel${s}`;
    case "opposed":  return `opposé${s}`;
    case "divided":  return `divisé${s} non compté${s}`;
  }
}

/** Compose the full "N noun" form used by tests for textContent
 *  assertions (toHaveTextContent matches the count + noun together).
 *  Wraps auditTrailChipNoun + the count. */
export function auditTrailChipText(count: number, kind: AuditTrailChipKind): string {
  return `${count} ${auditTrailChipNoun(count, kind)}`;
}

/** Compose the visible RankingOverlay header text rendered before the
 *  list of PartyRow ranks ("Classement partiel · N comptés"). Pulled
 *  out of the inline `{RANKING_OVERLAY_LABEL} · {N} compté(s)` template
 *  in RankingOverlay.tsx + 2 test regex partial-matches. Centralised
 *  so source + tests round-trip via the helper. */
export function rankingOverlayHeaderText(countedTotal: number): string {
  const s = countedTotal !== 1 ? "s" : "";
  return `${RANKING_OVERLAY_LABEL} · ${countedTotal} compté${s}`;
}

/** Compose the Result.tsx eyebrow span text — the small uppercase
 *  label above the h1. Two branches:
 *    - Partial: "RÉSULTAT PARTIEL · N/TARGET" (when isPartial=true)
 *    - Complete: "RÉSULTAT · 17e LÉGISLATURE" (uses LEGISLATURE_LABEL)
 *  Pulled out of the inline 2-branch ternary in Result.tsx so the
 *  branching logic + the wording are testable independently. */
export function resultEyebrowText(isPartial: boolean, total: number, target: number): string {
  if (isPartial) return `RÉSULTAT PARTIEL · ${total}/${target}`;
  return `RÉSULTAT · ${LEGISLATURE_LABEL}`;
}

/** Compose the Result.tsx body-line text rendered below the h1
 *  ("N scrutin(s) · N compté(s) · N skip(s)"). 3-segment plural-rule
 *  template pulled out of inline ${plural} ternaries in Result.tsx so
 *  the rewording + plural rules are testable + drift-proof. */
export function resultHeaderBodyLineText(total: number, counted: number, skips: number): string {
  const sT = total !== 1 ? "s" : "";
  const sC = counted !== 1 ? "s" : "";
  const sS = skips !== 1 ? "s" : "";
  return `${total} scrutin${sT} · ${counted} compté${sC} · ${skips} skip${sS}`;
}

/** Compose the Result.tsx "N indexée(s)" count label rendered next to
 *  the PERSONNALITES_TOGGLE_LABEL button. Plural-rule on the feminine
 *  "indexée" → "indexées". Currently 1 source + 0 tests; centralising
 *  defends against silent rewording and the plural rule. */
export function resultPersonnalitesIndexedCountText(count: number): string {
  return `${count} indexée${count !== 1 ? "s" : ""}`;
}

/** Compose the suffix of the "Continuer le test" CTA — the parenthesised
 *  "(N vote(s) restant(s))" count of votes still needed to reach TARGET.
 *  Singular/plural agreement applies to both "vote" + "restant". Pulled
 *  out of inline `${remaining === 1 ? "vote restant" : "votes restants"}`
 *  ternary in Result.tsx so the plural rule is testable independently. */
export function continueTestRemainingSuffix(remaining: number): string {
  return remaining === 1 ? "vote restant" : "votes restants";
}

/** Cover.tsx start-button progress-chip state. Drives the right-hand
 *  text rendered next to the CTA label (Commencer/Reprendre/Voir mon
 *  résultat). The 3 states map to the 3 user-visible scenarios:
 *    - "fresh":      first visit, no session → "≈ 5 min · N votes"
 *    - "inProgress": session started, not yet at TARGET → "N/M · K restant(s)"
 *    - "completed":  session reached TARGET → "N/M terminés" */
export type CoverProgressState = "fresh" | "inProgress" | "completed";

/** Compose the Cover.tsx progress-chip text. Pulled out of the inline
 *  3-branch ternary in Cover.tsx so the per-branch wording + the
 *  plural rule on "restant" are testable. Currently unpinned by tests
 *  — the helper enables a new round-trip test surface. */
export function coverProgressChipText(
  state: CoverProgressState,
  votesCount: number,
  target: number,
  remainingVotes: number,
): string {
  switch (state) {
    case "fresh":      return `≈ 5 min · ${target} votes`;
    case "completed":  return `${votesCount}/${target} terminés`;
    case "inProgress": {
      const s = remainingVotes !== 1 ? "s" : "";
      return `${votesCount}/${target} · ${remainingVotes} restant${s}`;
    }
  }
}

/** Result.tsx h1 lead phrase "Tu es surtout aligné avec" — the
 *  invariant opener before the colored party-name span. The JSX
 *  splits the sentence across 3 spans for accent styling on the
 *  party name + the final period; this const pins the lead text
 *  so a silent rewording surfaces at test time. */
export const RESULT_TOP_LEAD = "Tu es surtout aligné avec";

/** Wordmark visible text "sans/détour" — the lowercase brand mark
 *  rendered on Cover hero + TopBar + reading-page headers. Distinct
 *  from BRAND_NAME (which is "Sans Détour", capitalized with space —
 *  used in share text, contact subject, page <title>). 1 source +
 *  1 test pin; centralising defends against a silent rebrand. */
export const WORDMARK_TEXT = "sans/détour";

/** MethodeSheet bottom-sheet h2 title — "Comment c'est fait ?". This
 *  is the dialog's accessible name (referenced via aria-labelledby).
 *  Single source today + 0 test pins; centralising defends against
 *  silent rewording and gives the test surface a const to assert. */
export const METHODESHEET_TITLE = "Comment c'est fait ?";

/** MethodeSheet 2 footer link labels:
 *    - "Méthode complète" — navigates to /methode for the full page
 *    - "Signaler une erreur factuelle" — opens mailto with
 *      ERROR_REPORT_SUBJECT
 *  Each pinned by 1 test regex partial-match (`/méthode complète/i`,
 *  `/signaler/i`). Centralising lets tests round-trip via the const. */
export const METHODESHEET_FULL_METHODE_LINK_LABEL = "Méthode complète";
export const METHODESHEET_REPORT_ERROR_LINK_LABEL = "Signaler une erreur factuelle";

/** Result.tsx 2 visible h2 headings — SR-rotor landmarks that help
 *  navigating-by-heading users find the parties list vs the
 *  personnalités section. Both untested today; centralising defends
 *  against silent rewording. */
export const RESULT_GROUPS_H2 = "Alignement par groupe parlementaire";
export const RESULT_PERSONNALITES_H2 = "Alignement avec figures du mandat";

/** TopBar bottom popover footer line — small uppercase metadata
 *  "{PROD_HOSTNAME}  ·  v2 · données A.N.". The right-half ("v2 ·
 *  données A.N.") is currently inline + untested. Centralising
 *  defends against silent rewording (e.g. v2 → v3 with no test pin). */
export const TOPBAR_VERSION_LABEL = "v2 · données A.N.";

/** Play.tsx RetryError messages — 2 distinct branches today:
 *    - PLAY_DECK_EXHAUSTED_MESSAGE: deck.length === 0 && pool.length > 0
 *      (user has voted on every available scrutin) — retry routes to
 *      /result instead of refetching.
 *    - PLAY_EMPTY_POOL_MESSAGE: deck.length === 0 && poolLoaded (Supabase
 *      returned 0 rows / every row was filtered out) — retry refetches.
 *  Both inline + untested today; centralising surfaces a future rewording
 *  and pins the 2 distinct error states (different retry semantics). */
export const PLAY_DECK_EXHAUSTED_MESSAGE = "Plus de scrutins disponibles à voter dans ton deck.";
export const PLAY_EMPTY_POOL_MESSAGE = "Aucun scrutin disponible pour le moment. Réessaie dans quelques minutes.";

/** Cover.tsx hero <p> paragraph — the value-proposition explainer
 *  rendered under the h1 TAGLINE. Documents the "vote-based, not
 *  programme-based" framing called out in Methode §07 + the Cover
 *  source attribution. Untested today; centralising lets a future
 *  rewording surface in tests. */
export const COVER_HERO_PARAGRAPH = "Découvre avec quels partis tu es vraiment aligné. On ne regarde pas les programmes — on regarde ce que les députés ont effectivement voté à l'Assemblée Nationale.";

/** aria-roledescription applied by useFlipCardA11y to every Card root.
 *  This is what SR users hear when they reach a card in the deck —
 *  it briefs them on the 2 interaction modes (swipe + arrow keys) so
 *  keyboard users learn the shortcuts. Without "ou flèches", the
 *  description would suggest touch-only and keyboard users would Tab
 *  past without trying. Untested today; centralising defends. */
export const CARD_FLIP_ROLE_DESCRIPTION =
  "carte de scrutin — glissez ou utilisez les flèches pour voter";

/** Compose the Card aria-label rendered by useFlipCardA11y: "Scrutin
 *  n°{N} : {titre_pedago}". Previously inline template + pinned by
 *  `.stringContaining(numero)` partial-match — the surrounding wording
 *  ("Scrutin n°…", " : ") was unpinned. Helper enables a full round-
 *  trip test of the template. */
export function cardAriaLabel(numero: number, titrePedago: string): string {
  return `Scrutin n°${numero} : ${titrePedago}`;
}

/** Compact "AN ↗" link text rendered by AuditTrail per-row (different
 *  from the long-form `AN_LINK_VISIBLE_LABEL = "Voir sur AN ↗"` on
 *  the Card verso footer). The mono-font row is tight, so the link
 *  shrinks to just the AN abbreviation + the external-link arrow.
 *  Untested today; centralising pins the contract. */
export const AN_LINK_SHORT_LABEL = "AN ↗";

/** `<noscript>` fallback heading + message rendered in index.html for
 *  users without JavaScript. Untested today; the consts let a sync
 *  test (read index.html, assert it contains these strings) catch
 *  silent drift. The message documents the privacy contract ("Aucune
 *  donnée n'est envoyée à un serveur") so a regression that drops
 *  that clause silently would surface as a test failure. */
export const NOSCRIPT_HEADING = "JavaScript requis";
export const NOSCRIPT_MESSAGE = "Sans Détour calcule ton alignement politique localement dans le navigateur — il faut activer JavaScript pour que l'app fonctionne. Aucune donnée n'est envoyée à un serveur.";

/** Visible text inside the `<Suspense fallback>` element for lazy
 *  routes (main.tsx RouteLoader). Single source today; centralising
 *  defends against silent rewording. Note: distinct from
 *  SKELETON_CARD/RESULT_LOADING_LABEL — those are component-level
 *  loading aria-labels; this is the route-level chunk-loading placeholder. */
export const ROUTE_LOADER_LABEL = "Chargement…";

/** Card verso analyse_loi ColoredSection titles — render above the 3
 *  scalar-field analyse lists (mesures_principales / calendrier /
 *  exceptions). Each title is the user-visible header for its
 *  ScrutinAnalyse field on the unified verso. Centralising lets a
 *  future rewording propagate to source + would-be-tests in one edit. */
export const CARD_ANALYSE_TITLE_MESURES = "Mesures";
export const CARD_ANALYSE_TITLE_CALENDRIER = "Calendrier";
export const CARD_ANALYSE_TITLE_EXCEPTIONS = "Exceptions";

/** Card verso "Qui est concerné" section — header + 3 sub-list labels
 *  for the positifs / negatifs / neutres impact groups. The 3 sub-list
 *  labels are intentionally action-verbs (not descriptive nouns) so the
 *  SR reads "Bénéficient: …" / "Contraints: …" — telling the user what
 *  happens to each group, not just labeling the group. */
export const CARD_ANALYSE_CONCERNES_HEADER = "Qui est concerné";
export const CARD_ANALYSE_CONCERNES_POSITIFS = "Bénéficient";
export const CARD_ANALYSE_CONCERNES_NEGATIFS = "Contraints";
export const CARD_ANALYSE_CONCERNES_NEUTRES = "À surveiller";

/** Methode §07 IA Claude section — 4 strong-tagged sub-headings that
 *  open paragraphs and 1 closing-tag standalone strong phrase. Pinned
 *  via consts so a rewording of the IA-transparency framing propagates
 *  to the prose + (eventually) tests in lockstep. */
export const METHODE_S07_HEADING_CE_QUE_FAIT_CLAUDE = "Ce que fait Claude.";
export const METHODE_S07_HEADING_CE_QU_IL_NE_FAIT_PAS = "Ce qu'il ne fait pas.";
export const METHODE_S07_HEADING_CADRE_BIAIS = "Comment on cadre les biais.";
export const METHODE_S07_HEADING_LIMITES_SIGNALEMENT = "Limites & signalement.";

/** Legal.tsx 7 RGPD-required sub-headings rendered as bold prefixes of
 *  each prose block ("**Éditeur** — [Nom]…"). These are the load-bearing
 *  identity + compliance labels the RGPD requires: editor + host +
 *  personal data + analytics + independence + data sources + code source.
 *  3 are loosely pinned by /Éditeur/, /Hébergeur/, /Données personnelles/
 *  regex in tests/Legal.test.tsx; the other 4 are untested. Centralising
 *  closes the gap. */
export const LEGAL_RGPD_HEADING_EDITEUR = "Éditeur";
export const LEGAL_RGPD_HEADING_HEBERGEUR = "Hébergeur";
export const LEGAL_RGPD_HEADING_DONNEES_PERSONNELLES = "Données personnelles";
export const LEGAL_RGPD_HEADING_ANALYTICS = "Analytics";
export const LEGAL_RGPD_HEADING_INDEPENDANCE = "Indépendance";
export const LEGAL_RGPD_HEADING_SOURCES_DONNEES = "Sources des données";
export const LEGAL_RGPD_HEADING_CODE_SOURCE = "Code source";

/** Cover.tsx secondary <nav> aria-label — the bottom row with the
 *  Methode/Legal/Contact links. Single source today + 0 tests. */
export const COVER_SECONDARY_NAV_LABEL = "Liens secondaires";

/** Legal.tsx Vercel hébergeur identity — name + postal address, RGPD-
 *  required hosting disclosure. Currently 1 source line + 1 test regex
 *  `/Vercel Inc\./` partial-match. A future host change (Cloudflare,
 *  Netlify…) updates these 2 consts atomically. */
export const LEGAL_HEBERGEUR_NAME = "Vercel Inc.";
export const LEGAL_HEBERGEUR_ADDRESS = "340 S Lemon Ave #4133, Walnut, CA 91789, USA";

/** Legal.tsx analytics-tool disclosure — the parenthetical clarifying
 *  Plausible's RGPD compliance. Single source + 0 tests. */
export const LEGAL_ANALYTICS_DESCRIPTION =
  "Plausible (analytics anonymisés sans cookies, conformes RGPD).";

/** Legal.tsx data-license label rendered after the AN open-data link
 *  ("…), licence Etalab 2.0."). Single source + 0 tests. */
export const LEGAL_DATA_LICENSE_LABEL = "licence Etalab 2.0";

/** Legal.tsx Données personnelles body — the load-bearing privacy
 *  claim. Distinct from but conceptually paired with NOSCRIPT_MESSAGE's
 *  privacy clause ("Aucune donnée n'est envoyée à un serveur") — both
 *  surfaces document the same no-data-server contract. Pin so a future
 *  weakening (e.g. adding analytics fields) surfaces here. */
export const LEGAL_PERSONAL_DATA_BODY =
  "Sans Détour ne collecte aucune donnée personnelle. Aucune inscription, aucun cookie de tracking. Toutes les interactions sont stockées localement dans le navigateur (localStorage). Aucune donnée n'est transmise à un serveur Sans Détour.";

/** Legal.tsx Indépendance body — the editorial-independence claim
 *  paired with Methode §06's parallel-but-differently-worded claim
 *  ("Aucune affiliation parti / média / institution."). Both surfaces
 *  document the same contract; they're intentionally worded differently
 *  for Legal RGPD formality vs Methode plain prose. Pin the Legal one
 *  so its formal wording doesn't drift. */
export const LEGAL_INDEPENDANCE_BODY =
  "Sans Détour est un projet indépendant. Aucune affiliation politique, médiatique ou institutionnelle.";

/** Methode §06 "Aucune affiliation parti / média / institution."
 *  — informal-prose version of the Legal independence claim. The
 *  slash-separated list reads tighter on prose pages than Legal's
 *  comma-separated formal version. Pin so the 2 paired claims don't
 *  silently converge. */
export const METHODE_S06_NO_AFFILIATION_PHRASE =
  "Aucune affiliation parti / média / institution.";

/** Methode §06 funding-disclosure prose — documents how Sans Détour is
 *  funded (or rather not). The "pas de don accepté pendant les 6 mois
 *  précédant un scrutin national" clause is the load-bearing electoral-
 *  independence guarantee. Pin so a future weakening surfaces in tests. */
export const METHODE_S06_HOSTING_FUNDING_BODY =
  "Hébergement sur fonds personnels. Pas d'annonceur, pas de sponsor, pas de don accepté pendant les 6 mois précédant un scrutin national.";

/** Methode §05 Confidentialité 2 prose paragraphs — paired with
 *  LEGAL_PERSONAL_DATA_BODY (session 163), these document the same
 *  no-tracking / browser-local data contract from a plain-prose
 *  perspective. The technical list ("Pas de compte … pas de POST")
 *  + the localStorage explanation ("Tes votes vivent dans le
 *  localStorage…") together form the privacy contract. */
export const METHODE_S05_NO_TRACKING_PHRASE =
  "Pas de compte utilisateur, pas de cookie de tracking, pas d'analytics nominatifs, pas de POST.";
export const METHODE_S05_LOCALSTORAGE_EXPLANATION =
  "Tes votes vivent dans le ";  // followed by `<code>localStorage</code>` + " de ton navigateur. …"

/** Methode §05 second-paragraph tail (after the inline <code>localStorage</code>
 *  span). Pinned separately because the JSX splits the text on the
 *  code element. Both the prefix + the tail are load-bearing privacy
 *  disclosures. */
export const METHODE_S05_LOCALSTORAGE_TAIL =
  " de ton navigateur. Si tu vides ton cache, ils disparaissent. C'est volontaire : on n'a aucun moyen technique de savoir comment tu as voté ni qui tu es.";

/** Methode §01 update-cadence claim. Single source, load-bearing
 *  documentation of the weekly ingestion pipeline cadence. A future
 *  bump (daily, monthly) should propagate from this const. */
export const METHODE_S01_UPDATE_CADENCE =
  "Mise à jour automatisée toutes les semaines.";

/** Methode §03 closing paragraph on the "divided group" exclusion
 *  rule — explains that divided groups are skipped from BOTH the
 *  group's count AND the user's comparison. Load-bearing methodology
 *  disclosure paired with AUDIT_TRAIL_LABEL_DIVIDED (session 150). */
export const METHODE_S03_DIVIDED_RULE_BODY =
  "Un scrutin sur lequel un groupe est ";  // followed by `<strong>divisé</strong>` + the tail
export const METHODE_S03_DIVIDED_RULE_TAIL =
  " ne compte pas pour ce groupe — pas pour toi non plus, dans cette comparaison.";

/** Methode §03 group-introduction opener — the prose explaining why
 *  per-group position computation is needed (députés don't always
 *  vote the same way). Pin so a future rewording surfaces. */
export const METHODE_S03_GROUP_INTRO =
  "Un groupe parlementaire compte plusieurs dizaines de députés qui ne votent pas toujours pareil. Pour résumer en une position unique :";

/** Methode §07 closing strong-tag of the "Ce que fait Claude." paragraph
 *  — "Mise en forme, pas commentaire." Pairs with the heading to make
 *  the IA's role boundary explicit: the model reformulates content, it
 *  doesn't comment on it. Load-bearing IA-transparency claim. */
export const METHODE_S07_MISE_EN_FORME_CLOSER = "Mise en forme, pas commentaire.";

/** Methode §07 transparency guarantee — the load-bearing claim that
 *  the raw AN libellé is always shown alongside the LLM-rendered
 *  synthesis. This is the anti-bias contract: users can always
 *  compare the IA output against the official source. */
export const METHODE_S07_LIBELLE_BRUT_GUARANTEE =
  "Le libellé officiel brut est affiché sur la face Résumé du verso de chaque carte";

/** Methode page-lead paragraph (under h1, above §01) — opens with an
 *  anti-bias framing then the strong-tagged "pure math" guarantee.
 *  Both phrases are load-bearing IA-transparency claims. Splitting
 *  around the <strong> JSX boundary so each can be pinned separately. */
export const METHODE_PAGE_LEAD_INTRO = "Aucune opinion, aucun panel.";
export const METHODE_PAGE_LEAD_PURE_MATH =
  "Le calcul d'alignement est une formule mathématique pure — l'IA n'y intervient pas.";

/** Methode §04 lead paragraph — opens the alignment-calculation
 *  section before the <Formula> block. Same ":" anti-orphan-formula
 *  contract as METHODE_S03_GROUP_INTRO. */
export const METHODE_S04_OPENER =
  "Pour chaque groupe, on compare ce que tu as voté à ce que ce groupe a voté, scrutin par scrutin :";

/** Methode §02 closing sentence on excluded scrutin types — the
 *  symmetric "what we drop" claim paired with the "what we keep"
 *  strong-tagged list above it. Load-bearing methodology disclosure
 *  on the filtering rule (paired with `isEligibleScrutin` in
 *  scripts/lib/an-filter.ts). */
export const METHODE_S02_EXCLUSIONS_SUFFIX =
  "On exclut les amendements, les votes en commission et les motions procédurales (rejet préalable, renvoi).";

/** Methode §07 model disclosure — names the LLM model + the API used
 *  for ingestion. Pin so a future model bump (Haiku 5, Sonnet, etc.)
 *  surfaces in tests AND the user-facing doc stays in sync with the
 *  ANTHROPIC_MODEL env config in scripts/ingest-an.ts. */
export const METHODE_S07_MODEL_DISCLOSURE =
  "Modèle : Claude Haiku 4.5 d'Anthropic, via Batches API + web_search";

/** Methode §07 "Ce que fait Claude" task-list body — describes the 5
 *  things the LLM does during ingestion. Split into prefix + suffix
 *  around the inline {MAX_POINTS_CLES_BULLETS} interpolation so each
 *  half can be pinned independently. */
export const METHODE_S07_CLAUDE_TASKS_PREFIX =
  "Reformuler le titre brut du scrutin en 12 mots, condenser le projet de loi en ";
export const METHODE_S07_CLAUDE_TASKS_SUFFIX =
  " points clés, rédiger un résumé contextuel de 30 à 50 mots, structurer une synthèse détaillée (mesures, concernés, calendrier, exceptions), et taguer le scrutin par thème.";

/** Methode §07 "Limites & signalement" disclaimer body. Split into
 *  prefix + suffix around the inline mailto-link JSX. Contains the
 *  V3 roadmap mention (relecture humaine systématique) which doubles
 *  as a load-bearing limitation disclosure. */
export const METHODE_S07_LIMITES_DISCLAIMER_PREFIX =
  "Claude peut se tromper sur les nuances : un mot mal choisi, une mesure oubliée, un thème mal taggué. Pour l'instant, aucune relecture humaine systématique (V3 prévue). Si tu repères une erreur factuelle : ";
export const METHODE_S07_LIMITES_DISCLAIMER_SUFFIX = " — on corrige.";

/** Methode §07 "Ce qu'il ne fait pas." body — 3-task negative list
 *  documenting what Claude does NOT do. Paired with the positive
 *  task-list in METHODE_S07_CLAUDE_TASKS_*. The closing "Sur ces
 *  trois plans, Claude n'intervient à aucun moment." is the
 *  load-bearing reinforcement. */
export const METHODE_S07_NE_FAIT_PAS_BODY =
  "Le calcul d'alignement (formule mathématique pure), la composition du deck (round-robin algorithmique par thème), l'extraction des votes individuels (parsing des XML officiels AN). Sur ces trois plans, Claude n'intervient à aucun moment.";

/** Methode §07 "Comment on cadre les biais." body — split into prefix
 *  + suffix around the inline `<strong>METHODE_S07_LIBELLE_BRUT_GUARANTEE</strong>`
 *  + the « {AN_LINK_VISIBLE_LABEL} » reference. Documents the prompt
 *  neutrality + source-mix (raw AN libellé + web_search context) +
 *  the user's verification path. */
export const METHODE_S07_CADRE_BIAIS_PREFIX =
  "Le prompt envoyé à Claude est neutre par construction. Sa source : le libellé brut AN + des résultats de recherche web pour le contexte. ";
export const METHODE_S07_CADRE_BIAIS_SUFFIX = " — tu peux comparer directement.";

/** Methode §02 caps-example parenthetical — illustrates the
 *  practical effect of the per-dossier + per-chapeau caps using
 *  concrete examples (retraite, Mayotte). Load-bearing because it
 *  shows users *why* the diversity caps exist. */
export const METHODE_S02_CAPS_EXAMPLE =
  "pour ne pas avoir 8 votes retraite de suite ni 3 votes Mayotte d'affilée";

/** Methode §01 strong-tagged data-source identity. Names the official
 *  AN open-data portal as the canonical source — paired with the
 *  AN_OPEN_DATA_HOSTNAME `<code>` element rendered immediately after. */
export const METHODE_S01_DATA_SOURCE_STRONG =
  "l'open data officiel de l'Assemblée Nationale";

/** Methode §01 data-source quality claim — the load-bearing "no
 *  manual transcription, no secondary source" disclosure. Centralised
 *  so a rewording that softens the quality contract surfaces in tests. */
export const METHODE_S01_DATA_SOURCE_QUALITY_CLAIM =
  "Aucune retranscription manuelle, aucune source secondaire.";

/** Methode §04 rank-threshold noise explanation — explains *why* the
 *  ranking only appears at MIN_FOR_RANKING+ scrutins (below that,
 *  percentages are too noisy to interpret). Load-bearing because it
 *  justifies the threshold gate to users. The text after the strong-
 *  tagged threshold phrase. */
export const METHODE_S04_RANK_NOISE_EXPLANATION =
  "en dessous, les pourcentages bougent trop pour signifier quoi que ce soit";

/** Methode §01 "same files" authority claim — documents that the AN
 *  open-data files Sans Détour uses are the same files used by major
 *  media + the AN's own internal service. Load-bearing because it
 *  establishes provenance + non-manipulation. */
export const METHODE_S01_SAME_FILES_CLAIM =
  "Ce sont les mêmes fichiers que ceux utilisés par les médias de référence et le service interne de l'AN.";

/** Methode §02 concrete theme examples — illustrates the strategic
 *  round-robin theme balance with 3 anchor topics (paired with
 *  METHODE_S02_CAPS_EXAMPLE's retraite/Mayotte topic anchors). */
export const METHODE_S02_THEMES_EXAMPLES = "santé, immigration, fiscalité…";

/** Methode §03 Formula footnote on excluded actors — documents that
 *  absents + non-voters are dropped from the group-position math.
 *  Load-bearing transparency on the per-group threshold-vote logic
 *  (paired with `computePosition` in src/lib/compute-positions.ts). */
export const METHODE_S03_ABSENTS_EXCLUSION =
  "(absents et non-votants exclus du calcul)";

/** Methode §02 5 strong-tagged scrutin types Sans Détour KEEPS — the
 *  positive list paired with METHODE_S02_EXCLUSIONS_SUFFIX (the
 *  negative list). These 5 categories drive the user-facing filter
 *  documentation; they must stay synchronized with the rules in
 *  `isEligibleScrutin` (scripts/lib/an-filter.ts). */
export const METHODE_S02_KEPT_SOLENNELS = "scrutins solennels";
export const METHODE_S02_KEPT_VOTES_FINAUX = "votes finaux sur l'ensemble d'une loi";
export const METHODE_S02_KEPT_CENSURE = "motions de censure";
export const METHODE_S02_KEPT_REFERENDAIRES = "motions référendaires";
export const METHODE_S02_KEPT_PROPOSITIONS = "propositions de résolution";

/** Methode §04 alignment-formula 5 lines — the per-scrutin scoring
 *  math + the aggregation formula. Must stay synchronized with
 *  `alignmentScore` (src/lib/matching.ts). Pinned as a tuple to
 *  make the line-count invariant explicit. */
export const METHODE_S04_FORMULA_LINES = [
  "Score par scrutin :",
  "+1 si ton vote = position du groupe",
  "+0,5 si l'un des deux s'abstient et l'autre vote",
  "0 si désaccord net (pour vs contre)",
  "Somme des scores ÷ nombre de scrutins comptés × 100 = % affiché",
] as const;

/** Methode §03 Formula threshold-rule line — the strict-majority
 *  rule that turns per-député votes into a group position. Must
 *  stay synchronized with THRESHOLD in src/lib/compute-positions.ts.
 *  The "→" arrow signals the rule's then-branch. */
export const METHODE_S03_THRESHOLD_RULE_SUFFIX =
  "% des votants effectifs du groupe → pour / contre / abstention";
export const METHODE_S03_THRESHOLD_RULE_ELSE = "sinon → groupe divisé";

/** Methode §02 theme-balance load-bearing phrases — document the
 *  diversity-vs-random commitment ("plutôt qu'au hasard pur") and
 *  the cap-rules count commitment ("avec deux garde-fous"). Paired
 *  with the round-robin composition logic in src/lib/deck.ts. */
export const METHODE_S02_RANDOM_AVOIDANCE = "plutôt qu'au hasard pur";
export const METHODE_S02_GARDE_FOUS_LEAD = "avec deux garde-fous";

/** Methode §02 per-cap garde-fou suffixes — the strong-tagged
 *  text that follows each cap number ({DEFAULT_CAP_PER_DOSSIER} /
 *  {DEFAULT_CAP_PER_CHAPEAU_PREFIX}). The 2 caps are paired in
 *  composeDeck (src/lib/deck.ts) and share the "jamais plus de N"
 *  prefix structure. Pinning the suffixes separately enforces the
 *  per-vs-per-sujet contract distinction. */
export const METHODE_S02_GARDE_FOU_LEAD = "jamais plus de ";
export const METHODE_S02_GARDE_FOU_DOSSIER_SUFFIX = " scrutins du même dossier législatif";
export const METHODE_S02_GARDE_FOU_SUJET_SUFFIX = " scrutins du même sujet";

/** Methode §04 rank-threshold strong-tag suffix — follows the
 *  {MIN_FOR_RANKING}<sup>e</sup> interpolation as " scrutin compté".
 *  The "e" superscript (French ordinal marker, e.g., "8e" = "8th")
 *  is rendered separately via inline JSX and not part of this const. */
export const METHODE_S04_RANK_THRESHOLD_SUFFIX = " scrutin compté";

/** Cover.tsx eyebrow tagline suffix — the uppercase mono text rendered
 *  after the LEGISLATURE_LABEL prefix as "{LEGISLATURE_LABEL} — {EYEBROW_SUFFIX}".
 *  Load-bearing because it frames the whole page as a personal-alignment
 *  experience (vs e.g. a generic political quiz). */
export const COVER_EYEBROW_SUFFIX = "TON ALIGNEMENT RÉEL";

/** Methode page-lead prose tail — the closing sentence of the page-lead
 *  paragraph that follows the strong-tagged "pure math" guarantee and
 *  introduces the section-07 cross-reference. Documents the IA-vs-math
 *  split + the section-07 navigation hint. */
export const METHODE_PAGE_LEAD_TAIL =
  "En revanche, les résumés, les points clés et les synthèses des scrutins sont mis en forme par Claude (voir ";

/** Methode page-lead cross-reference link text — "section 07" — paired
 *  with the inline `<a href="#methode-07">` anchor. The visible text is
 *  what SR users hear; the href is structural. Pin so a rewording that
 *  drops the number or changes "section" to "partie" surfaces. */
export const METHODE_PAGE_LEAD_SECTION_07_REF = "section 07";

/** Card verso footer flip-back hint — visible text rendered on the
 *  card verso left-side footer ("tap pour revenir ‹"). Tells users
 *  they can flip the card back to its recto. Pin so a rewording
 *  that loses the affordance (e.g., to "Retour" or "Recto") surfaces. */
export const CARD_VERSO_FLIP_BACK_HINT = "tap pour revenir";

/** Card verso fallback prose for scrutins missing `analyse_loi` —
 *  rendered in place of the ColoredSection blocks when the ingestion
 *  LLM didn't structure the synthesis. Documents the user-visible
 *  fallback path so a future ingestion pipeline change that always
 *  produces analyse_loi doesn't silently leave this dead code. */
export const CARD_NO_ANALYSE_FALLBACK_BODY =
  "Aucune explication détaillée disponible pour ce scrutin. Le texte officiel ci-dessous donne le sujet général.";

/** Methode §07 AN-link parenthetical — split into prefix + suffix
 *  around `{AN_LINK_VISIBLE_LABEL}` JSX interpolation. Documents
 *  the AN-deep-link availability companion to the
 *  METHODE_S07_LIBELLE_BRUT_GUARANTEE claim. */
export const METHODE_S07_AN_LINK_PARENTHETICAL_PREFIX =
  "(et la page AN complète est toujours accessible via « ";
export const METHODE_S07_AN_LINK_PARENTHETICAL_SUFFIX = " »)";

/** Cover h1 tagline — split across 2 JSX nodes so the second half can
 *  carry the accent color. TAGLINE itself documents that the two halves
 *  compose into the canonical product tagline; pin both halves so the
 *  hero h1 stays in lockstep with the meta description / og:description /
 *  twitter:description copies that read TAGLINE directly. The composition
 *  invariant (`PART_1 + " " + PART_2 + "." === TAGLINE`) lives in the
 *  Cover test so any tweak to one half without the other fails CI. */
export const TAGLINE_PART_1 = "Pas les programmes";
export const TAGLINE_PART_2 = "Les vrais votes";

/** Methode §06 independence opener — split around `<strong>indépendant</strong>`
 *  JSX interpolation. The opening sentence ("Sans Détour est un projet
 *  indépendant.") pairs with the formal Legal version in
 *  LEGAL_INDEPENDANCE_BODY (same claim, different register). The
 *  load-bearing word is `indépendant` — strong-tagged for emphasis on
 *  the methodology page. PREFIX starts with BRAND_NAME so a future
 *  rebrand propagates here automatically. */
export const METHODE_S06_INDEPENDENCE_OPENER_PREFIX = "Sans Détour est un projet ";
export const METHODE_S06_INDEPENDENCE_STRONG = "indépendant";
export const METHODE_S06_INDEPENDENCE_OPENER_SUFFIX = ". ";

/** MethodeSheet Claude block "Sa mission" strong-tagged claim — the
 *  load-bearing AI-role-boundary statement. Documents the contract
 *  between Sans Détour and Claude: render legibly (transform the
 *  libellé brut into a synthesis), DO NOT comment (no political
 *  opinion, no editorialization). Pinned so a rewording that softens
 *  "pas commenter" to "résumer fidèlement" (or similar) — which
 *  would weaken the no-editorialization contract — surfaces in tests. */
export const METHODESHEET_CLAUDE_MISSION_STRONG =
  "Sa mission : rendre lisible, pas commenter.";

/** Play.tsx visually-hidden h1 — the only page-level landmark for SR
 *  users on /play (the visible UI is interactive deck cards with no
 *  on-screen title). Documents the SR heading-rotor entry point. A
 *  rewording that broke the page-mission framing (e.g., "Page de
 *  votes" / "Cartes") would degrade SR navigation. */
export const PLAY_SR_HEADING = "Voter sur les scrutins";

/** MethodeSheet AN block body — the comma-separated list of fields
 *  Sans Détour reads from the AN open-data feed. Paired with
 *  METHODESHEET_AN_BLOCK_TITLE and the §01 prose on Methode that
 *  documents the same data contract. Pin so a future schema change
 *  (e.g., we start ingesting vote-time metadata or remove a column)
 *  surfaces here before drifting from the rest of the methodology. */
export const METHODESHEET_AN_BLOCK_BODY =
  "Date, numéro, vote des députés, libellé brut du scrutin, position des groupes parlementaires.";

/** MethodeSheet Claude block "no AI in score" claim — the load-bearing
 *  contract that the alignment computation is a pure mathematical
 *  formula, NOT inferred by Claude. Pairs with
 *  METHODESHEET_CLAUDE_MISSION_STRONG (AI renders, but does not
 *  comment) and METHODE_S04_OPENER (the formule mathématique pure
 *  promise). A softening to "principalement mathématique" or
 *  "essentiellement formule" would weaken the transparency contract
 *  that distinguishes this product from black-box political AI tools. */
export const METHODESHEET_CLAUDE_NO_AI_IN_SCORE =
  "Le calcul d'alignement, lui, est une formule mathématique pure — aucune IA dans le score.";

/** MethodeSheet Claude block 1st paragraph — lists the 4 outputs Claude
 *  produces from the AN libellé brut (titre court reformulé, points
 *  clés, résumé, synthèse du texte officiel). Paired with
 *  METHODE_S07_CLAUDE_TASKS_PREFIX/SUFFIX on the full methode page —
 *  both surfaces document the same 4-output contract. If we add or
 *  drop a Claude output (e.g., we start asking Claude to generate
 *  metaphors), both surfaces must move in lockstep. */
export const METHODESHEET_CLAUDE_TASKS_BODY =
  "Le titre court reformulé, les points clés, le résumé, la synthèse du texte officiel.";

/** MethodeSheet Claude block 2nd paragraph (prefix sans le strong tag) —
 *  load-bearing prompt-input neutrality claim: documents what Claude
 *  receives (libellé brut AN + web search results) AND what's
 *  deliberately excluded from the prompt (no human opinion, no
 *  political orientation). Paired with METHODE_S07_CADRE_BIAIS_PREFIX/SUFFIX
 *  (same contract, different register). The "+" between "libellé brut"
 *  and "résultats de recherche web" is intentional typography that
 *  reads as composition. */
export const METHODESHEET_CLAUDE_PROMPT_NEUTRALITY_BODY =
  "Claude reçoit le libellé brut de l'AN + des résultats de recherche web. Pas d'opinion humaine ni d'orientation politique dans son prompt.";

/** ErrorBoundary "Si ça persiste : " prefix — split around the
 *  `{CONTACT_EMAIL}` JSX interpolation that renders the mailto link.
 *  Documents the conditional fallback framing (contact only if reload
 *  doesn't help). A rewording that drops "Si ça persiste" would lose
 *  the conditional framing and push users to email on every error,
 *  defeating the reload-first recovery flow. */
export const ERROR_FALLBACK_PERSISTENCE_HELP_PREFIX = "Si ça persiste : ";

/** Result.tsx empty-pool RetryError message — surfaced when Supabase
 *  returns zero rows (or every row is filtered out) on the result
 *  screen. Parallel to PLAY_EMPTY_POOL_MESSAGE on the Play route;
 *  the 2 messages document the same "no data" failure path on
 *  different screens. Distinct from RETRY_FETCH_FAILED_MESSAGE
 *  (that one is for fetch-rejected, not empty-pool). */
export const RESULT_EMPTY_POOL_MESSAGE =
  "Impossible de calculer ton alignement : aucun scrutin disponible. Réessaie dans quelques minutes.";

/** Legal §sources opener — split into prefix + separator around the
 *  AN open-data link AND the LEGAL_DATA_LICENSE_LABEL JSX
 *  interpolation. The full sentence reads:
 *  "Open data officiel de l'Assemblée Nationale ({AN_LINK}),
 *   {LEGAL_DATA_LICENSE_LABEL}."
 *  PREFIX opens the parenthesis around the link; SEPARATOR closes
 *  it and reads ", " into the license-label noun. Pin so a future
 *  rewording that loses the "officiel" anchor (the load-bearing
 *  claim that we use the *official* AN feed, not a third-party
 *  proxy) surfaces. */
export const LEGAL_SOURCES_DONNEES_OPENER_PREFIX =
  "Open data officiel de l'Assemblée Nationale (";
export const LEGAL_SOURCES_DONNEES_LINK_TO_LICENSE_SEPARATOR = "), ";

/** Legal §code-source opener — split before the GitHub link
 *  interpolation. The full sentence reads:
 *  "Open source sous licence MIT, disponible sur {GITHUB_LINK}."
 *  The "MIT" license claim is load-bearing: paired with the
 *  Methode §06 + §07 MIT-license annotations and the
 *  GITHUB_REPO_URL/DISPLAY constants. A softening to "open source"
 *  alone (dropping "MIT") would weaken the legal commitment.
 *  This claim is currently a production-blocker because the actual
 *  repo is private at waramere1234/sans-detour — see the TODO
 *  comment in Legal.tsx. */
export const LEGAL_CODE_SOURCE_OPENER_PREFIX =
  "Open source sous licence MIT, disponible sur ";

/** Methode §03 strong-tagged "divisé" label — must match the
 *  GroupPosition discriminant exactly. The matching algorithm in
 *  src/lib/matching.ts checks `groupPos === "divisé"` to exclude
 *  divided groups from scoring; the strong-tagged user-visible
 *  label here documents that same value. A rewording that
 *  capitalized ("Divisé") or pluralized ("divisés") would desync
 *  the methodology page from the actual logic.
 *
 *  An invariant test asserts METHODE_S03_DIVIDED_STRONG_LABEL
 *  matches a GroupPosition value so a type rename forces a
 *  visible-copy update in lockstep. */
export const METHODE_S03_DIVIDED_STRONG_LABEL = "divisé";

/** Methode §01 data-source opener — splits into prefix + separator
 *  around the strong-tagged METHODE_S01_DATA_SOURCE_STRONG and the
 *  code-tagged AN_OPEN_DATA_HOSTNAME JSX interpolations. The full
 *  rendered sentence reads:
 *  "Les votes proviennent de <strong>{S01_DATA_SOURCE_STRONG}</strong>,
 *   exposé sur <code>{AN_OPEN_DATA_HOSTNAME}</code>. ..."
 *  PREFIX opens the data-attribution claim; SEPARATOR transitions
 *  from the strong-tagged source name into the code-tagged hostname.
 *  Pin so a future rewording that loses "proviennent de" (the
 *  data-provenance verb) surfaces. */
export const METHODE_S01_DATA_SOURCE_OPENER_PREFIX = "Les votes proviennent de ";
export const METHODE_S01_DATA_SOURCE_TO_CODE_SEPARATOR = ", exposé sur ";

/** Methode §02 kept-scrutins opener — leads the inclusion-policy
 *  paragraph that lists the 5 scrutin types we keep (SPS, SOR,
 *  censure, référendaires, propositions). The opener "On garde
 *  les " uses the active-voice editorial first-person plural ("on")
 *  that distinguishes this app's tone from formal RGPD prose. A
 *  rewording to "Nous gardons" or "Sont conservés" would shift the
 *  register and weaken the methodology page's plain-French tone. */
export const METHODE_S02_KEPT_OPENER_PREFIX = "On garde les ";

/** Methode §04 rank-threshold opener — splits into prefix + bridge
 *  around the strong-tagged `{MIN_FOR_RANKING}<sup>e</sup>{...}`
 *  numeric and the rank-noise explanation. The full rendered
 *  sentence reads:
 *  "Le ranking apparaît à partir du <strong>{N}^e ...</strong> —
 *   {RANK_NOISE_EXPLANATION}."
 *  PREFIX frames the rank-threshold-rule opener; BRIDGE is the em-dash
 *  separator that introduces the noise-explanation clause. A
 *  rewording that loses "apparaît à partir du" would weaken the
 *  threshold-gating framing that the §04 rule rests on. */
export const METHODE_S04_RANK_OPENER_PREFIX = "Le ranking apparaît à partir du ";
export const METHODE_S04_RANK_BRIDGE_SEPARATOR = " — ";

/** Methode §05 `<code>localStorage</code>` label — the literal value
 *  rendered inside the inline <code> tag. Must match the actual
 *  browser API key string used in src/lib/session.ts (`localStorage`)
 *  exactly. A drift between the displayed name and the API call
 *  would silently misclaim the persistence mechanism. */
export const METHODE_S05_LOCALSTORAGE_CODE_LABEL = "localStorage";

/** AuditTrail demo-fallback tooltip + aria suffixes — composed onto
 *  DEMO_DATA_LABEL_PREFIX inside template literals to render the
 *  `title=` tooltip ("…sera remplacée par les vrais scrutins…")
 *  and the `aria-label=` short-form ("(pas un scrutin AN réel)").
 *  Load-bearing for the demo-data disclosure contract — pin so a
 *  rewording that downplays the demo nature (e.g., "données
 *  d'exemple" instead of "demo") propagates to source + test.
 *  Both suffixes are joined with DEMO_DATA_LABEL_PREFIX via
 *  template-string concatenation in AuditTrail.tsx. */
export const DEMO_FALLBACK_TITLE_SUFFIX =
  " — sera remplacée par les vrais scrutins de l'AN une fois le pipeline d'ingestion en production";
export const DEMO_FALLBACK_ARIA_SUFFIX = " (pas un scrutin AN réel)";

/** Result.tsx personality-exclusion disclosure — surfaced as a footer
 *  note under the personnalites panel. Documents WHY specific public
 *  political figures are NOT in the 8-personality V2 set. Paired with
 *  the exclusion logic documented in CLAUDE.md ("Mélenchon, Philippe,
 *  Glucksmann, Tondelier, Bardella, Darmanin" excluded by structural
 *  constraint). A change to the personnalites list MUST update this
 *  disclosure — without the pin, adding/removing a name would silently
 *  desync the visible disclosure from the actual exclusion logic. */
export const RESULT_PERSONNALITES_EXCLUSIONS_NOTE =
  "Basé uniquement sur leurs votes effectifs à l'Assemblée Nationale. " +
  "Mélenchon, Philippe, Glucksmann, Tondelier ne siègent pas dans la " +
  "17ᵉ législature ; Bardella, élu en 2024, a démissionné avant de " +
  "siéger ; Darmanin est ministre sur la quasi-totalité du mandat " +
  "(son suppléant vote à sa place). Aucun d'eux n'est mesuré ici.";

/** Methode §04 French-ordinal-superscript marker — the literal "e"
 *  rendered inside the inline `<sup>` tag for the rank-threshold
 *  ordinal (e.g., the "e" in "19e" for "19th"). The French ordinal
 *  convention is "Ne" in superscript (Académie française usage),
 *  NOT "ème" full-form. A drift to "ème" or asciification (dropping
 *  the superscript wrapper) would change the typography. */
export const METHODE_S04_RANK_ORDINAL_MARKER = "e";

/** Methode page-lead link closer suffix — the literal ")." rendered
 *  after the inline `<a href="#methode-07">{SECTION_07_REF}</a>` link.
 *  Closes the parenthesis from METHODE_PAGE_LEAD_TAIL's "(voir " opener
 *  AND ends the sentence with a period. The 2-char suffix is small
 *  but compositionally load-bearing: drop the ")" → unbalanced parens,
 *  drop the "." → no sentence terminator. */
export const METHODE_PAGE_LEAD_LINK_CLOSER_SUFFIX = ").";

/** Accent-colored h1 terminator — the `.` literal rendered inside
 *  `<span style={{ color: "var(--accent)" }}>` at the end of the 3
 *  primary h1 headings (Cover, Methode, Result). Replicated identical
 *  across all 3 routes; centralised so a future tweak (e.g., a typo
 *  like ".." or a switch to em-dash) propagates to one site. The
 *  accent-period is the brand-finish convention. */
export const H1_ACCENT_PERIOD = ".";

/** Result.tsx h1 percent wrapper — split into prefix + suffix around
 *  the `{top.pct}` JSX interpolation. The full h1 reads:
 *  "{RESULT_TOP_LEAD} {GroupName} ({pct}%)" — PREFIX " (" opens the
 *  parenthesis after the party-name span; SUFFIX "%)" appends the
 *  percent sign and closes the parenthesis. Pin the bracket discipline
 *  so a future copy tweak that loses one half doesn't render an
 *  unbalanced parenthesis. */
export const RESULT_H1_PERCENT_WRAPPER_PREFIX = " (";
export const RESULT_H1_PERCENT_WRAPPER_SUFFIX = "%)";

/** Card recto footer numero+date line — split into 2 small glues
 *  around `{scrutin.numero}` and `{date.toLocaleDateString}`. The
 *  full line reads: "n° {numero} · {date}". The "n° " prefix is
 *  the French scrutin-number convention (degree sign U+00B0,
 *  not an ASCII "o"); the middle-dot separator " · " matches the
 *  Freshness banner + the AN libellé prefix span. Pin both halves
 *  so a typographic tweak (e.g., asciifying "n°" to "n.") surfaces. */
export const CARD_FOOTER_NUMERO_PREFIX = "n° ";
export const CARD_FOOTER_DATE_SEPARATOR = " · ";

/** Generic middle-dot typography separator " · " — the visual
 *  segment delimiter used across the app: Card chapeau→IA-chip,
 *  Card AN-libellé-prefix → titre-brut, FreshnessBanner banner-body
 *  line (between total/past/next phrases), and the share-text rank
 *  join. Uses the U+00B7 middle-dot character (NOT an ASCII period).
 *
 *  Centralised so a future typography tweak (e.g., switch to en-dash
 *  or thin-space + dot) propagates from 1 edit instead of 5+. The
 *  semantic-specific CARD_FOOTER_DATE_SEPARATOR remains a distinct
 *  const for the Card numero+date footer, even though it shares the
 *  same value — IDE searches can find each site by its semantic name. */
export const MIDDLE_DOT_SEPARATOR = " · ";

/** share.ts composition separators — split out so the share-text
 *  composition is fully testable + a future i18n flip (English
 *  share text uses ", " for both, French uses " : " before the
 *  summary) propagates from 1 edit each. */
export const SHARE_LEAD_TO_SOURCE_SEPARATOR = ", ";
export const SHARE_LEAD_TO_SUMMARY_SEPARATOR = " : ";

/** Play vote-button aria-hidden glyphs — the 3 visual arrows that
 *  pair 1:1 with VOTE_LABEL_CONTRE / SKIP / POUR. Rendered inside
 *  `<span aria-hidden="true">` since SR users hear the button label
 *  via aria-label (not the decorative arrow). The 3 arrows mirror
 *  the touch-gesture directions documented on the Cover swipe-legend
 *  (← contre / ↓ skip / → pour) — a swap would silently desync the
 *  Play buttons from the Cover affordance preview. */
export const VOTE_GLYPH_CONTRE = "← ";
export const VOTE_GLYPH_SKIP = "↓ ";
/** POUR glyph is a suffix (rendered after the label), not a prefix —
 *  matches the rightward directionality (right-swipe = pour). */
export const VOTE_GLYPH_POUR = " →";

/** Result.tsx restart-icon glyph — used 2× on /result for the
 *  "Continuer à affiner" button (post-completion only) and the
 *  "Refaire" button (always rendered). The cycle arrow ↻ (U+21BB)
 *  signals "redo from start" — a swap to a different glyph would
 *  silently change the affordance hint. */
export const BUTTON_ICON_RESTART = "↻ ";

/** Result.tsx continue-test button paren wrapper — splits into
 *  prefix + suffix around `{remaining} {continueTestRemainingSuffix}`.
 *  The button label reads:
 *  "{ARROW}{CONTINUE_TEST_LABEL_PREFIX} ({N} {suffix})"
 *  PREFIX " (" opens the parenthesis after the label; SUFFIX ")"
 *  closes after the count. Same compositional pattern as the Result
 *  h1 percent wrapper — pin so a future copy tweak that drops one
 *  half renders an unbalanced parenthesis. */
export const RESULT_CONTINUE_TEST_PAREN_PREFIX = " (";
export const RESULT_CONTINUE_TEST_PAREN_SUFFIX = ")";

/** AuditTrail breakdown chip glyphs — 4 aria-hidden visual icons
 *  paired 1:1 with AUDIT_TRAIL_LABEL_ALIGNED / PARTIAL / OPPOSED /
 *  DIVIDED. The chips render in the audit-trail header next to each
 *  count, with the glyph colored to match the vote class. A drift
 *  on any of the 4 glyphs would silently change the visual semantics
 *  without surfacing via the existing label tests. */
export const AUDIT_GLYPH_ALIGNED = "✓ ";
export const AUDIT_GLYPH_PARTIAL = "≈ ";
export const AUDIT_GLYPH_OPPOSED = "✕ ";
export const AUDIT_GLYPH_DIVIDED = "÷ ";

/** Right-arrow prefix glyph "→ " — used in MethodeSheet's full-methode
 *  link (l.124) and Result's continue-test button (l.273). 2 sites,
 *  same visual affordance (forward navigation). Pin so a typography
 *  tweak propagates to one site instead of 2. Distinct from
 *  VOTE_GLYPH_POUR (" →" suffix-style) — the prefix-style trails the
 *  arrow before the label, suffix-style trails the label before the
 *  arrow. */
export const BUTTON_ARROW_RIGHT_PREFIX = "→ ";

/** Back-navigation guillemet glyphs — paired prefix + suffix used as
 *  back-affordance visual affordances:
 *    - PREFIX "‹ " leads ReadingPageHeader's back link (l.45)
 *    - SUFFIX " ‹" trails Card.tsx's verso flip-back hint (l.290),
 *      paired with CARD_VERSO_FLIP_BACK_HINT
 *  Same single-guillemet glyph U+2039 in both, but the spacing
 *  differs (leading vs trailing space). Pin both so a future
 *  tweak that aligns the 2 sites (or replaces the glyph) lands
 *  in lockstep. */
export const BACK_ARROW_PREFIX_GLYPH = "‹ ";
export const BACK_ARROW_SUFFIX_GLYPH = " ‹";

/** Right-arrow suffix glyph " →" — used in Cover start CTA (l.231)
 *  and Play deck-exhausted "Mon résultat" link (l.323). 2 sites,
 *  same forward-navigation affordance (suffix-style: label trails
 *  arrow). Pair to BUTTON_ARROW_RIGHT_PREFIX (prefix-style "→ ").
 *  Same arrow glyph U+2192 as VOTE_GLYPH_POUR (which is also " →"
 *  by value) — kept as a separate const so the vote-button semantic
 *  remains distinct from forward-navigation. A future tweak that
 *  changes one shouldn't silently change the other. */
export const BUTTON_ARROW_RIGHT_SUFFIX = " →";

/** Result share-button icon glyph "📤 " — outbox emoji + space
 *  rendered inside the share button's aria-hidden span. Distinct
 *  from BUTTON_ICON_RESTART (the only other Result button icon)
 *  because share semantics use an outbox metaphor, not a cycle.
 *  Pinned because emoji rendering can vary across platforms; a drift
 *  to "🔼" or "↗" would change the share-affordance semantics. */
export const BUTTON_ICON_SHARE = "📤 ";

/** MethodeSheet report-error mail-icon glyph "✉ " — envelope U+2709
 *  rendered before the report-error link label. Monochrome glyph
 *  (NOT emoji) so it inherits the surrounding text color. A drift
 *  to "📧" or "📨" would change the rendering register to color-
 *  coded emoji ignoring the text color. */
export const BUTTON_ICON_MAIL = "✉ ";

/** Card.tsx recto IA-chip sparkle glyph "✨" — sparkles emoji
 *  rendered inside the chip's aria-hidden span before "IA". Distinct
 *  from BUTTON_ICON_* glyphs because the chip has no trailing space
 *  (the "IA" text wraps flush to the glyph for compactness on the
 *  small chip). A trailing-space drift would break the chip's
 *  tight layout. */
export const CARD_IA_CHIP_GLYPH = "✨";

/** Cover swipe-legend bare arrows — 3 single-char glyphs rendered
 *  standalone (not paired with text on the same line) in the
 *  swipe-gesture legend. Distinct from VOTE_GLYPH_* which have
 *  trailing/leading spaces for label glue; these are bare arrows
 *  for the standalone visual. Pin so a tweak to the arrow style
 *  (e.g., switching from monochrome to filled triangles) propagates
 *  to all 3 affordance previews in lockstep. */
export const SWIPE_LEGEND_ARROW_CONTRE = "←";
export const SWIPE_LEGEND_ARROW_SKIP = "↓";
export const SWIPE_LEGEND_ARROW_POUR = "→";

/** Result.tsx personnalites disclosure-toggle glyphs — the
 *  expanded/collapsed indicator rendered before the toggle button
 *  label. Down-triangle "▾" (U+25BE) signals "expanded" (content
 *  visible below); right-triangle "▸" (U+25B8) signals "collapsed"
 *  (content hidden, click to expand). Pair so a future swap of
 *  conventions (e.g., chevrons ↓/→) lands on both consts together. */
export const DISCLOSURE_GLYPH_OPEN = "▾";
export const DISCLOSURE_GLYPH_CLOSED = "▸";

/** Modal close-button visible glyph "✕" — rendered inside the
 *  MethodeSheet close button as visible text (paired with the
 *  `aria-label={MODAL_CLOSE_LABEL}` for SR users). Same Unicode
 *  codepoint U+2715 as AUDIT_GLYPH_OPPOSED's glyph — pin so a
 *  future glyph swap on either surface lands in lockstep via
 *  the codepoint cross-check test. */
export const MODAL_CLOSE_GLYPH = "✕";

/** External-link arrow glyph "↗" — rendered inside the TopBar
 *  menu's aria-hidden span next to external links (Contact mailto).
 *  U+2197 (north-east arrow) signals "this link opens elsewhere"
 *  (new tab / external app). Distinct from BUTTON_ARROW_RIGHT_*
 *  (which signals forward in-app navigation). A drift to ↘ or →
 *  would change the external-link affordance semantics. */
export const EXTERNAL_LINK_GLYPH = "↗";

/** MethodeSheet Block-component emoji props — passed as the `emoji=`
 *  prop to the 2 Block sections (AN-data block + Claude-IA block).
 *  CLAUDE must equal CARD_IA_CHIP_GLYPH ("✨") so the AI signaling
 *  stays consistent between the Card recto chip and the MethodeSheet
 *  Claude block — a future swap of the AI icon should land on both
 *  surfaces together via the cross-check test. */
export const METHODESHEET_BLOCK_EMOJI_AN = "📊";
export const METHODESHEET_BLOCK_EMOJI_CLAUDE = "✨";

/** Card recto points_cles bullet glyph "·" — bare middle-dot (no
 *  spaces) used as the visual bullet for each points_cles <li>.
 *  Distinct from MIDDLE_DOT_SEPARATOR (" · " with spaces) used as
 *  an inline-text separator. Same Unicode codepoint U+00B7 but
 *  different cadence — pin the no-spaces shape so a future copy-
 *  paste tweak that adds spacing doesn't break the flex layout.
 *  Color is accent (var(--accent)) so the bullet pops while the
 *  bullet text reads normal. */
export const CARD_POINTS_CLES_BULLET_GLYPH = "·";

/** Wordmark component visible 3-part composition — the lowercase
 *  brand mark "sans/détour" rendered as 2 text parts wrapping a
 *  styled <span class="sd-slash">/</span>. Lowercase is intentional
 *  (visual brand convention) — the canonical BRAND_NAME "Sans Détour"
 *  capitalizes both words and joins with a space. Cross-const
 *  invariant: PART_1 + PART_2 (no slash) should match
 *  BRAND_NAME.toLowerCase().replace(/\s+/g, "") so a rebrand of
 *  BRAND_NAME forces an update here. */
export const WORDMARK_PART_1 = "sans";
export const WORDMARK_SLASH = "/";
export const WORDMARK_PART_2 = "détour";

/** AuditTrail h3 party-name prefix "· " — middle-dot + trailing
 *  space rendered inside the lighter-weight span before the party
 *  name (e.g., "RN · Rassemblement National"). Pair to
 *  MIDDLE_DOT_SEPARATOR (" · " with both spaces) but the leading
 *  space lives in the JSX whitespace outside the span — pin so
 *  a future edit that moves the cadence into the const propagates
 *  intentionally instead of accidentally. */
export const AUDIT_TRAIL_HEADER_PARTY_NAME_PREFIX = "· ";

/** Analytics nav-target slugs — used as the `target` prop in
 *  `track("topbar_nav", { target })` (4 sites in TopBar) and
 *  `track("cover_footer_nav", { target })` (3 sites in Cover).
 *  Distinct from MENU_*_LABEL (visible labels) — these are
 *  analytics-payload slugs (lowercase, English-ish, route-keyed).
 *  Centralised so a future analytics-slug rename propagates from
 *  one edit + the 8 test pin sites also round-trip via the const. */
export const NAV_TARGET_RESULT = "result";
export const NAV_TARGET_METHODE = "methode";
export const NAV_TARGET_LEGAL = "legal";
export const NAV_TARGET_CONTACT = "contact";

/** Skeleton-shimmer CSS class — used 7× in CardSkeleton + ResultSkeleton
 *  to apply the shimmer keyframe defined in src/index.css. Centralised
 *  so a CSS-class rename (e.g., dropping the dash, scoping with a
 *  data-attribute) propagates from one edit instead of 7 in-lockstep
 *  changes. Pin paired with the CSS keyframe — a test grep confirms
 *  the class name still exists in src/index.css. */
export const SKELETON_SHIMMER_CLASS = "skeleton-shimmer";

/** MethodeSheet backdrop test-id — used by MethodeSheet.tsx as a
 *  `data-testid` attribute AND by MethodeSheet.test.tsx as the
 *  `getByTestId(...)` selector for the backdrop-click close test.
 *  Centralised so a rename on one side surfaces in CI alongside the
 *  test instead of silently breaking the backdrop-close test pin. */
export const METHODE_SHEET_BACKDROP_TESTID = "methode-sheet-backdrop";

/** MethodeSheet title id — used 2× in the same file: as the `id=` on
 *  the h2 title AND as the `aria-labelledby=` on the role=dialog
 *  motion.div. A rename on one side without the other silently
 *  breaks the SR dialog-title association. Pin so the 2 sites stay
 *  in sync via a single edit. */
export const METHODE_SHEET_TITLE_ID = "methode-sheet-title";

/** Result.tsx personnalites disclosure panel id — used 2× in the
 *  same file: as the `id=` on the disclosure-revealed div AND as
 *  the `aria-controls=` on the toggle button. aria-controls points
 *  at an id; a rename desync silently breaks the SR disclosure
 *  affordance. Pin so both sites stay in sync. */
export const RESULT_PERSONNALITES_PANEL_ID = "personnalites-panel";

/** Methode section-id template prefix — composed via template
 *  literals as `${PREFIX}${n}` (e.g., "methode-07") in 4 source
 *  sites:
 *    - TOC anchor href:      `#${PREFIX}${n}`
 *    - Section id:           `${PREFIX}${n}`
 *    - Page-lead deep-link:  inline `"#methode-07"` literal (cross-ref)
 *    - SPA hash-scroll handler reads `location.hash` against the same prefix
 *  Tests pin the round-trip via the same template. A future rename of
 *  the prefix (e.g., to "section-") needs to land on all 4 source sites
 *  + tests in lockstep — centralising forces that sync. */
export const METHODE_SECTION_ID_PREFIX = "methode-";

/** Methode section-heading-id template prefix — composed as
 *  `${PREFIX}${n}` (e.g., "methode-heading-07") for the h2 id inside
 *  each Section component. The section wrapper points its
 *  aria-labelledby at this id. Pin paired with METHODE_SECTION_ID_PREFIX
 *  so both prefixes stay related (METHODE_SECTION + "heading-" → heading id). */
export const METHODE_SECTION_HEADING_ID_PREFIX = "methode-heading-";

/** AuditTrail h3 heading-id + region id prefixes — composed as
 *  `${PREFIX}${group}` (e.g., "audit-heading-LFI" + "audit-trail-LFI").
 *  HEADING_ID_PREFIX is used 2× in AuditTrail.tsx (h3 id + region
 *  aria-labelledby); PANEL_ID_PREFIX appears as the runtime panelId
 *  passed from Result.tsx via `id={panelId}` and matched against the
 *  PartyRow aria-controls. Pin both so renames stay in sync across
 *  files. */
export const AUDIT_TRAIL_HEADING_ID_PREFIX = "audit-heading-";
export const AUDIT_TRAIL_PANEL_ID_PREFIX = "audit-trail-";

/** Supabase table name for scrutins — used 4× in src/lib/scrutins.ts
 *  (.from("scrutins") in fetchScrutins + 2 sites in fetchFreshness).
 *  The table is defined by supabase/migrations/0001_*.sql; if it ever
 *  rebrands (unlikely but possible during a schema reorg), all source
 *  call sites must update in lockstep. Centralising forces that. */
export const SCRUTINS_TABLE_NAME = "scrutins";

/** Supabase column name for the points_cles JSONB list — used 2× as
 *  the filter `.not("points_cles", "is", null)` in fetchScrutins + the
 *  fetchFreshness count query. Filters out unvotable ingest-fallback
 *  rows (LLM-call failed → no contexte / analyse / points_cles, just
 *  a truncated raw title). Pin so a schema migration renaming the
 *  column (e.g., to `bullet_points`) propagates atomically. */
export const SCRUTINS_COL_POINTS_CLES = "points_cles";

/** Supabase column name for the ingestion timestamp — used 2× in
 *  fetchFreshness (.select("ingere_le") + .order("ingere_le")). The
 *  column is stamped on every upsert by the ingest pipeline so the
 *  banner can compute "MAJ il y a N jours". Pin so a future column
 *  rename surfaces alongside the migration. */
export const SCRUTINS_COL_INGERE_LE = "ingere_le";

/** Supabase column name for the scrutin vote date — used 1× in
 *  fetchScrutins as the `.order("date", { ascending: false })`
 *  sort key. Completes the SCRUTINS_COL_* set (alongside POINTS_CLES
 *  and INGERE_LE). Pin so a schema migration renaming this column
 *  surfaces alongside the migration. */
export const SCRUTINS_COL_DATE = "date";

/** Boolean-as-string value written/read for COVER_STORAGE_KEY in
 *  src/lib/session.ts. Used as both the value passed to setItem
 *  (markCoverSeen) AND the value compared on read (hasSeenCover ===
 *  comparison). A drift on either side silently breaks the read-write
 *  contract — pin so both sites stay in sync via 1 edit. */
export const COVER_STORAGE_TRUE_VALUE = "true";

/** Max length for the `componentStack` slice in ErrorBoundary's
 *  analytics payload. Pulls the magic number out of the inline
 *  `info.componentStack.slice(0, 200)` so a future tweak (e.g.,
 *  bumping to 500 for richer error reports, or trimming to 100
 *  to fit Plausible's 2kB prop limit) propagates from one edit. */
export const ERROR_STACK_TRACE_MAX_LENGTH = 200;

/** Milliseconds per day — `24 * 60 * 60 * 1000`. Used 4× across the
 *  app: FreshnessBanner's diffDays + pastDays helpers (banner display),
 *  and scrutins.ts's fetchFreshness next_sync_eta computation (2 sites
 *  for the supabase-OK + supabase-null branches). Centralised so a
 *  refactor to a Temporal-API based date math (Date.UTC, etc.) can
 *  ship via 1 edit instead of 4 in-lockstep changes. */
export const MS_PER_DAY = 86_400_000;

/** Sync cadence in days — the ingest pipeline runs weekly (see
 *  Methode §01 + METHODE_S01_UPDATE_CADENCE). fetchFreshness uses
 *  this for the +N-days next_sync_eta computation in 2 sites. Pin
 *  so a cadence change (weekly → biweekly) propagates from 1 edit.
 *  Pairs with STALE_AFTER_DAYS (10 = cadence + 3-day grace period). */
export const SYNC_CADENCE_DAYS = 7;

/** Deck-seed range exponent — `Math.floor(Math.random() * 2 ** N)`
 *  generates the seed for mulberry32 in deck.ts (composeDeck +
 *  drawNext). 2**31 keeps the seed in 32-bit signed-int range,
 *  matching mulberry32's expected input domain. A drift to 2**52
 *  would still work but couples the seed to JS Number precision in
 *  a way mulberry32 doesn't promise. */
export const DECK_SEED_RANGE_EXPONENT = 31;

/** TopBar menu item labels — passed as `label=` prop to MenuLink for
 *  each entry. Tests pin them via `getByRole("menuitem", { name: /…/ })`,
 *  and the analytics `target` props (track("topbar_nav", { target })) use
 *  a different "result"/"methode"/"legal"/"contact" slug. The visible
 *  labels live here; the analytics slugs live next to their call sites.
 *
 *  MENU_RESULT_LABEL is also reused inline on the Play.tsx "Mon résultat →"
 *  shortcut button (visible once countedTotal ≥ MIN_FOR_RANKING) so the
 *  same wording on the TopBar menu + the in-deck shortcut + the Cover
 *  partial-result link stays in sync. */
export const MENU_RESULT_LABEL = "Mon résultat";
export const MENU_METHODE_LABEL = "Méthode & sources";
export const MENU_LEGAL_LABEL = "Mentions légales";
export const MENU_CONTACT_LABEL = "Contact";

/** Play.tsx vote-button labels — the visible text rendered on the
 *  fallback button row that appears below the deck for keyboard /
 *  touch-without-gesture users. Each button also carries an aria-label
 *  composed from VOTE_BUTTON_ARIA_LABEL(...). Centralised so a future
 *  copy tweak (e.g. "Voter pour" → "D'accord") propagates to both the
 *  visible text and the SR announcement via one edit. */
export const VOTE_LABEL_CONTRE = "Contre";
export const VOTE_LABEL_SKIP = "Je passe";
export const VOTE_LABEL_POUR = "Pour";

/** Compose the aria-label for a vote button. Pattern:
 *  - "Contre" → "Contre — voter contre ce scrutin"
 *  - "Je passe" → "Je passe — passer ce scrutin sans voter"
 *  - "Pour" → "Pour — voter pour ce scrutin"
 *  The visible label + a context-suffix. The suffix differs per choice
 *  (Skip has "passer …sans voter", Pour/Contre have "voter pour/contre…"),
 *  so the helper takes both as args rather than hardcoding the pattern. */
export function voteButtonAriaLabel(visible: string, contextSuffix: string): string {
  return `${visible} — ${contextSuffix}`;
}
export const VOTE_ARIA_CONTRE = voteButtonAriaLabel(VOTE_LABEL_CONTRE, "voter contre ce scrutin");
export const VOTE_ARIA_SKIP = voteButtonAriaLabel(VOTE_LABEL_SKIP, "passer ce scrutin sans voter");
export const VOTE_ARIA_POUR = voteButtonAriaLabel(VOTE_LABEL_POUR, "voter pour ce scrutin");

/** Compose the aria-label for the "Voir sur AN ↗" external link rendered
 *  twice today (Card.tsx verso footer + AuditTrail.tsx per-row link). The
 *  template literal `Voir le scrutin n°${n} sur le site de l'Assemblée
 *  Nationale (nouvel onglet)` was duplicated; a rewording (or a French
 *  → English flip via EXTERNAL_LINK_SUFFIX) had to land on both sites
 *  in lockstep. Centralising the composition keeps them in sync. The
 *  EXTERNAL_LINK_SUFFIX import inside the body re-uses the canonical
 *  "(nouvel onglet)" marker so a future i18n change touches one place. */
export function anScrutinViewAriaLabel(numero: number): string {
  return `Voir le scrutin n°${numero} sur le site de l'Assemblée Nationale${EXTERNAL_LINK_SUFFIX}`;
}

/** Skeleton aria-labels — announced to screen readers while the deck
 *  (Play.tsx) or the ranking (Result.tsx) is still loading. Each label
 *  was duplicated between its component and its Skeleton.test.tsx
 *  assertion; centralising the strings keeps source + tests in sync. */
export const SKELETON_CARD_LOADING_LABEL = "Chargement des scrutins";
export const SKELETON_RESULT_LOADING_LABEL = "Chargement de ton résultat";

/** Prefix for the 3 sites that surface a "this is a demo data point, not
 *  a real AN scrutin" hint (Card.tsx verso footer aria-label, AuditTrail
 *  per-row `title` tooltip + aria-label). The full wording varies per
 *  site (the title is longer / explanatory; the aria-labels are tighter)
 *  but the leading "Donnée de démonstration" token is load-bearing —
 *  it's what a screen-reader skim picks up first and what indicates
 *  "this is not a production data source" to the user. Centralising the
 *  prefix lets a single rewording propagate to all 3 sites. */
export const DEMO_DATA_LABEL_PREFIX = "Donnée de démonstration";

/** Result.tsx CTA labels. Each is pinned by regex in tests/Result.test.tsx;
 *  centralising the strings keeps the source + the tests + the confirm
 *  prompt (refaire) on Result.tsx in sync.
 *
 *  - SHARE_LABEL: native-share / clipboard fallback CTA ("Partager mon résultat").
 *  - REFAIRE_LABEL: destructive "wipe session + go back to Cover" CTA.
 *  - CONTINUE_REFINE_LABEL: post-completion "draw 20 more" CTA.
 *  - CONTINUE_TEST_LABEL_PREFIX: the front of the "Continuer le test (N
 *    votes restants)" partial-session CTA. The (N votes restants) suffix
 *    is composed inline with the plural rule. */
export const SHARE_LABEL = "Partager mon résultat";
export const REFAIRE_LABEL = "Refaire depuis le début";
export const CONTINUE_REFINE_LABEL = "Continuer à affiner";
export const CONTINUE_TEST_LABEL_PREFIX = "Continuer le test";

/** Padding for the prose-heavy <section> wrappers on Methode + Legal.
 *  Both routes use the same "24px var(--gutter) 48px" — a future bump
 *  to align with a redesign should propagate atomically. Distinct from
 *  the `READING_PAGE_MAX_WIDTH` const (which is per-route since Legal
 *  uses 640 while Methode uses 720) — the padding is the same on both. */
export const READING_PAGE_SECTION_PADDING = "24px var(--gutter) 48px";

/** Canonical "data source" tagline appended to the share text and
 *  shown as a sub-header on the SVG share card (api/share-card.ts).
 *  Lives in src/types (DOM-free) so api/share-card can import it
 *  without dragging in src/lib/share.ts's navigator/window globals.
 *  A rewording propagates from one edit to both surfaces. */
export const SHARE_SOURCE_LINE = "basées sur les vrais votes de l'AN";

/** aria-label for the Wordmark Link that returns to Cover. Used on
 *  Cover (self-link), Methode (back to home), Legal (back to home),
 *  and TopBar (every non-Cover route). Same screen-reader announcement
 *  on every route so a SR user always hears the same destination
 *  description. */
export const WORDMARK_HOME_LABEL = "Accueil";

/** aria-label for the header-region nav landmark on reading pages
 *  (Methode + Legal). Distinguishes the header from the page-body
 *  Sommaire/back-link nav in the SR landmarks rotor. */
export const PAGE_HEADER_NAV_LABEL = "En-tête de la page";

/** Suffix appended to aria-labels on external links (target="_blank")
 *  so screen readers warn the user "this opens in a new tab" before
 *  they activate. Used 5× across Methode + Legal — centralised so a
 *  rewording / French → English flip propagates from one edit. */
export const EXTERNAL_LINK_SUFFIX = " (nouvel onglet)";

/** Build an aria-label for an external link given the visible label.
 *  Usage: `<a aria-label={externalLinkLabel("data.assemblee-nationale.fr")}>`
 *  produces "data.assemblee-nationale.fr (nouvel onglet)". */
export function externalLinkLabel(visibleText: string): string {
  return visibleText + EXTERNAL_LINK_SUFFIX;
}

/** Official AN open-data portal — both the user-facing reference (Methode
 *  §01 + §06 prose, Legal data-sources block) and the script-side bulk
 *  download (`scripts/ingest-an.ts` builds `${AN_OPEN_DATA_URL}static/...`
 *  off this root). A future AN domain change touches 4 sites; one const
 *  keeps them in lockstep. Trailing slash kept so concatenated paths
 *  don't double-up. */
export const AN_OPEN_DATA_URL = "https://data.assemblee-nationale.fr/";

/** Visible hostname form of AN_OPEN_DATA_URL — used as <code>display</code>
 *  text on Methode §01 prose, as link text on Methode §06 + Legal's
 *  Sources block, and as the visible part of externalLinkLabel(...).
 *  Derived by stripping protocol + trailing slash so a future AN domain
 *  change propagates atomically (same pattern as PROD_HOSTNAME). */
export const AN_OPEN_DATA_HOSTNAME =
  AN_OPEN_DATA_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** Public GitHub repo URL surfaced on Methode §06 + §07 + Legal as the
 *  "code source MIT" link target. Currently a production-blocker TODO
 *  (real repo is private at waramere1234/sans-detour); once the team
 *  decides to open-source, the URL updates here and the 3 sites + the
 *  visible-text derivation (GITHUB_REPO_DISPLAY) follow atomically. */
export const GITHUB_REPO_URL = "https://github.com/sansdetour";

/** Visible "github.com/sansdetour" form of GITHUB_REPO_URL — used as link
 *  text on the 3 sites and as the visible part of externalLinkLabel(...).
 *  Derived so a future github.com/<org> rename + URL update propagates
 *  to the visible text in one edit. */
export const GITHUB_REPO_DISPLAY =
  GITHUB_REPO_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** All parliamentary group codes for the 17e legislature. */
export const GROUP_CODES = [
  "LFI", "GDR", "ECO", "SOC", "LIOT",
  "EPR", "DEM", "HOR", "DR", "UDR", "RN",
] as const;
export type GroupCode = typeof GROUP_CODES[number];

/** Thematic buckets used by the deck composer to enforce diversity (V2).
 *  "autre" is the catch-all for votes that don't fit a major 2027 theme. */
export const THEMES = [
  "pouvoir-achat", "retraites", "immigration", "sécurité", "écologie",
  "santé", "école", "fiscalité", "institutions", "international", "autre",
] as const;
export type Theme = typeof THEMES[number];

/** Validate that an LLM-emitted theme label is in the enum; off-list values
 *  collapse to "autre" so a misbehaving model can never inject an arbitrary
 *  bucket into the DB. Called by both ingest scripts (ingest-an.ts,
 *  resume-ingest.ts) — kept here next to THEMES to avoid the previous
 *  duplication of the same 4-line function in both scripts. */
export function normalizeTheme(v: unknown): Theme | undefined {
  if (typeof v !== "string") return undefined;
  const lower = v.trim().toLowerCase();
  return (THEMES as readonly string[]).includes(lower) ? (lower as Theme) : "autre";
}

/** Codes for the 8 presidentially-relevant personalities of the 17e
 *  legislature whose individual votes we extract from the AN nominative
 *  vote breakdown. Each code maps to a député in `PERSONNALITES`
 *  (src/lib/personnalites.ts).
 *
 *  Notable absences:
 *  - Mélenchon, Philippe, Glucksmann: not députés (LFI presidential pillar
 *    is at the national level, Philippe is mayor, Glucksmann is MEP).
 *  - Bardella: elected député in 2024 but resigned before sitting (kept his
 *    European mandate). Zero AN votes.
 *  - Tondelier: EELV national secretary + regional councillor; never député.
 *    ECO is represented by Cyrielle Chatelain (présidente du groupe ECO).
 *  - Darmanin: Ministre de l'Intérieur then Garde des Sceaux through most
 *    of the 17e — only 3 effective votes during the Sept-Dec 2024 Barnier
 *    window. Excluded to keep the personality list informative. */
export const PERSONNALITE_CODES = [
  "le_pen", "faure", "chatelain", "wauquiez",
  "attal", "ciotti",
  "bompard", "panot",
] as const;
export type PersonnaliteCode = typeof PERSONNALITE_CODES[number];

/** Vote of a single named personality on a single scrutin. Adds "absent"
 *  (was on the AN roster that day, didn't vote) and "non_dispo" (wasn't a
 *  député at all on that date — e.g. Bardella after his July 2024 resignation)
 *  on top of the group-level positions. */
export type PersonnaliteVote = "pour" | "contre" | "abstention" | "absent" | "non_dispo";

/** Position taken by a parliamentary group on a single scrutin. */
export type GroupPosition = "pour" | "contre" | "abstention" | "divisé";

/** User's choice on a single scrutin. */
export type UserVote = "pour" | "contre" | "skip";

/** Raw vote breakdown for a group on a scrutin. */
export interface GroupVoteBreakdown {
  pour: number;
  contre: number;
  abstention: number;
  absent: number;  // non-votants
}

/** A scrutin as stored in the database and consumed by the front. */
export interface Scrutin {
  id: string;                  // ex: "VTANR5L17V1234"
  numero: number;
  date: string;                // ISO yyyy-mm-dd
  dossier_id: string;
  dossier_titre: string;
  chapeau: string;             // "RETRAITES · PLFSS 2024"
  titre_brut: string;          // raw AN title
  titre_pedago: string;        // 12-word generated summary
  contexte?: string;           // 30-50 words, 2 short sentences with "Concrètement: …"
                               // or "Par exemple: …" as the second sentence (added
                               // in migration 0002 — see that file's comment for the
                               // full spec, which was widened from the original
                               // "one sentence ≤ 25 words" pre-V1)
  analyse_loi?: ScrutinAnalyse;  // structured 6-list breakdown (mesures,
                                 // concernés +/–/neutres, calendrier,
                                 // exceptions — migration 0003 + the
                                 // ScrutinAnalyse interface below).
                                 // Column named `analyse_loi` because ANALYSE
                                 // is a PostgreSQL reserved word.
  points_cles?: string[];        // exactly 3 short factual bullets, 7 words
                                 // max each, shown on the card front below
                                 // the titre_pedago (migration 0004).
  theme?: Theme;                 // thematic bucket used by the deck composer
                                 // to enforce diversity (migration 0005).
  votes_personnalites?: Partial<Record<PersonnaliteCode, PersonnaliteVote>>;
                                 // individual votes of the 8 indexed
                                 // personalities (migration 0006). Partial
                                 // because some personalities may not be
                                 // députés at a given date (non_dispo).
  position_par_groupe: Record<GroupCode, GroupPosition>;
  votes_bruts: Record<GroupCode, GroupVoteBreakdown>;
  url_an_officielle: string;
  est_solennel: boolean;
  pedago_relu: boolean;
}

/** A single user vote on a scrutin during a session. */
export interface SessionVote {
  scrutin_id: string;
  choice: UserVote;
  voted_at: number;  // epoch ms
}

/** Persistent session shape in localStorage. */
export interface SessionState {
  session_id: string;
  cards_seen: string[];        // scrutin ids in order
  votes: SessionVote[];
  started_at: number;          // epoch ms
}

/** Structured analyse — factual breakdown of what a law actually does
 *  (mesures, concernés positifs/négatifs/neutres, calendrier, exceptions).
 *  Generated by the LLM during ingestion, rendered inline in the unified
 *  card verso (`Card.tsx` — there is no "+ analyse" entry-point anymore,
 *  see commit 9cb7e6c). All arrays may be empty; **bold** markdown markers
 *  are supported (rendered via renderWithBold helper). */
export interface ScrutinAnalyse {
  mesures_principales: string[];      // what the law creates / forbids / changes
  concernes_positifs: string[];       // groups/sectors with positive impact
  concernes_negatifs: string[];       // groups/sectors with negative impact
  concernes_neutres: string[];        // groups/sectors with mixed or to-watch impact
  calendrier: string[];               // dates: entry into force, intermediate steps
  exceptions: string[];               // exemptions, derogations, transitions
}

/** Per-group alignment result. */
export interface GroupAlignment {
  group: GroupCode;
  pct: number;                 // 0..100, rounded
  counted: number;             // scrutins where group not "divisé" and user not "skip"
  perfect: number;             // exact match count
  partial: number;             // pour/abstention or contre/abstention
  conflict: number;            // pour/contre
  divided_excluded: number;    // scrutins where group was "divisé" (not counted)
}

/** Per-personality alignment result. Same shape as GroupAlignment with two
 *  extra exclusion counters: scrutins where the personality wasn't a député
 *  yet/anymore (non_dispo) or didn't vote (absent), which are dropped from
 *  the denominator so the percentage stays meaningful on a small base. */
export interface PersonnaliteAlignment {
  personnalite: PersonnaliteCode;
  pct: number;
  counted: number;             // scrutins where the personality voted and user not "skip"
  perfect: number;
  partial: number;
  conflict: number;
  absent_excluded: number;     // personality didn't vote (non-votant)
  non_dispo_excluded: number;  // personality not a député at that date
}

/** Freshness metadata of the database. */
export interface FreshnessInfo {
  total_scrutins: number;
  last_sync_at: string;        // ISO datetime
  next_sync_eta: string;       // ISO datetime
}
