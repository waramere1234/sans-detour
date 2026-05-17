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
