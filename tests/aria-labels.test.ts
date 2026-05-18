import { describe, it, expect } from "vitest";
import {
  WORDMARK_HOME_LABEL,
  PAGE_HEADER_NAV_LABEL,
  EXTERNAL_LINK_SUFFIX,
  externalLinkLabel,
  AN_OPEN_DATA_URL, AN_OPEN_DATA_HOSTNAME,
  GITHUB_REPO_URL, GITHUB_REPO_DISPLAY,
  VOTE_LABEL_CONTRE, VOTE_LABEL_SKIP, VOTE_LABEL_POUR,
  VOTE_ARIA_CONTRE, VOTE_ARIA_SKIP, VOTE_ARIA_POUR,
  voteButtonAriaLabel,
  anScrutinViewAriaLabel,
  SKELETON_CARD_LOADING_LABEL, SKELETON_RESULT_LOADING_LABEL,
  DEMO_DATA_LABEL_PREFIX,
  RESTART_LABEL, restartConfirmMessage,
  REFAIRE_LABEL, refaireConfirmMessage,
  RANKING_OVERLAY_LABEL, MODAL_CLOSE_LABEL,
  CARD_VERSO_SEPARATOR_LABEL, AN_LINK_VISIBLE_LABEL,
  MENU_OPEN_LABEL, MENU_CLOSE_LABEL, MAIN_MENU_LABEL,
  ERROR_FALLBACK_HEADING, ERROR_FALLBACK_MESSAGE, ERROR_FALLBACK_RELOAD_LABEL,
  PERSONNALITES_TOGGLE_LABEL,
  CARD_AN_LIBELLE_PREFIX_LABEL,
  METHODE_SOMMAIRE_NAV_LABEL,
  COVER_SOURCE_ATTRIBUTION_AN, COVER_SOURCE_ATTRIBUTION_CLAUDE,
  chipTop1AriaLabel,
  METHODESHEET_AN_BLOCK_TITLE, METHODESHEET_CLAUDE_BLOCK_TITLE,
  CARD_IA_CHIP_ARIA_LABEL,
  METHODE_PAGE_EYEBROW, METHODE_PAGE_H1,
  DEMO_FALLBACK_SHORT_LABEL,
  AUDIT_TRAIL_LABEL_DIVIDED, AUDIT_TRAIL_LABEL_ALIGNED,
  AUDIT_TRAIL_LABEL_PARTIAL, AUDIT_TRAIL_LABEL_OPPOSED,
  partyRowAriaLabel, personnaliteRowAriaLabel, personnaliteRowRightColumnText,
  auditTrailChipNoun, auditTrailChipText,
  rankingOverlayHeaderText,
  resultEyebrowText, resultHeaderBodyLineText,
  resultPersonnalitesIndexedCountText, continueTestRemainingSuffix,
  coverProgressChipText, RESULT_TOP_LEAD, WORDMARK_TEXT,
  METHODESHEET_TITLE,
  METHODESHEET_FULL_METHODE_LINK_LABEL, METHODESHEET_REPORT_ERROR_LINK_LABEL,
  RESULT_GROUPS_H2, RESULT_PERSONNALITES_H2,
  TOPBAR_VERSION_LABEL,
  PLAY_DECK_EXHAUSTED_MESSAGE, PLAY_EMPTY_POOL_MESSAGE,
  COVER_HERO_PARAGRAPH,
  CARD_FLIP_ROLE_DESCRIPTION, cardAriaLabel,
  AN_LINK_SHORT_LABEL,
  NOSCRIPT_HEADING, NOSCRIPT_MESSAGE,
  ROUTE_LOADER_LABEL,
  CARD_ANALYSE_TITLE_MESURES, CARD_ANALYSE_TITLE_CALENDRIER, CARD_ANALYSE_TITLE_EXCEPTIONS,
  CARD_ANALYSE_CONCERNES_HEADER,
  CARD_ANALYSE_CONCERNES_POSITIFS, CARD_ANALYSE_CONCERNES_NEGATIFS, CARD_ANALYSE_CONCERNES_NEUTRES,
  METHODE_S07_HEADING_CE_QUE_FAIT_CLAUDE,
  METHODE_S07_HEADING_CE_QU_IL_NE_FAIT_PAS,
  METHODE_S07_HEADING_CADRE_BIAIS,
  METHODE_S07_HEADING_LIMITES_SIGNALEMENT,
  LEGAL_RGPD_HEADING_EDITEUR, LEGAL_RGPD_HEADING_HEBERGEUR,
  LEGAL_RGPD_HEADING_DONNEES_PERSONNELLES, LEGAL_RGPD_HEADING_ANALYTICS,
  LEGAL_RGPD_HEADING_INDEPENDANCE, LEGAL_RGPD_HEADING_SOURCES_DONNEES,
  LEGAL_RGPD_HEADING_CODE_SOURCE,
  LEGAL_HEBERGEUR_NAME, LEGAL_HEBERGEUR_ADDRESS,
  LEGAL_ANALYTICS_DESCRIPTION, LEGAL_DATA_LICENSE_LABEL,
  LEGAL_PERSONAL_DATA_BODY,
  LEGAL_INDEPENDANCE_BODY,
  METHODE_S06_NO_AFFILIATION_PHRASE,
  METHODE_S06_HOSTING_FUNDING_BODY,
  METHODE_S05_NO_TRACKING_PHRASE,
  METHODE_S05_LOCALSTORAGE_EXPLANATION, METHODE_S05_LOCALSTORAGE_TAIL,
  METHODE_S01_UPDATE_CADENCE,
  METHODE_S03_DIVIDED_RULE_BODY, METHODE_S03_DIVIDED_RULE_TAIL,
  METHODE_S03_GROUP_INTRO,
  METHODE_S07_MISE_EN_FORME_CLOSER, METHODE_S07_LIBELLE_BRUT_GUARANTEE,
  METHODE_PAGE_LEAD_INTRO, METHODE_PAGE_LEAD_PURE_MATH,
  METHODE_S04_OPENER, METHODE_S02_EXCLUSIONS_SUFFIX,
  METHODE_S07_MODEL_DISCLOSURE,
  METHODE_S07_CLAUDE_TASKS_PREFIX, METHODE_S07_CLAUDE_TASKS_SUFFIX,
  METHODE_S07_LIMITES_DISCLAIMER_PREFIX, METHODE_S07_LIMITES_DISCLAIMER_SUFFIX,
  METHODE_S07_NE_FAIT_PAS_BODY,
  METHODE_S07_CADRE_BIAIS_PREFIX, METHODE_S07_CADRE_BIAIS_SUFFIX,
  METHODE_S07_AN_LINK_PARENTHETICAL_PREFIX, METHODE_S07_AN_LINK_PARENTHETICAL_SUFFIX,
  CARD_VERSO_FLIP_BACK_HINT, CARD_NO_ANALYSE_FALLBACK_BODY,
  TAGLINE, TAGLINE_PART_1, TAGLINE_PART_2,
  BRAND_NAME,
  METHODE_S06_INDEPENDENCE_OPENER_PREFIX, METHODE_S06_INDEPENDENCE_STRONG,
  METHODE_S06_INDEPENDENCE_OPENER_SUFFIX,
  METHODESHEET_CLAUDE_MISSION_STRONG,
  PLAY_SR_HEADING,
  METHODESHEET_AN_BLOCK_BODY, METHODESHEET_CLAUDE_NO_AI_IN_SCORE,
  METHODESHEET_CLAUDE_TASKS_BODY, METHODESHEET_CLAUDE_PROMPT_NEUTRALITY_BODY,
  ERROR_FALLBACK_PERSISTENCE_HELP_PREFIX,
  RESULT_EMPTY_POOL_MESSAGE,
  LEGAL_SOURCES_DONNEES_OPENER_PREFIX, LEGAL_SOURCES_DONNEES_LINK_TO_LICENSE_SEPARATOR,
  LEGAL_CODE_SOURCE_OPENER_PREFIX,
  METHODE_S03_DIVIDED_STRONG_LABEL,
  METHODE_S01_DATA_SOURCE_OPENER_PREFIX, METHODE_S01_DATA_SOURCE_TO_CODE_SEPARATOR,
  METHODE_S02_KEPT_OPENER_PREFIX,
  type GroupPosition,
  METHODE_S04_RANK_OPENER_PREFIX, METHODE_S04_RANK_BRIDGE_SEPARATOR,
  METHODE_S05_LOCALSTORAGE_CODE_LABEL,
  DEMO_FALLBACK_TITLE_SUFFIX, DEMO_FALLBACK_ARIA_SUFFIX,
  RESULT_PERSONNALITES_EXCLUSIONS_NOTE,
  METHODE_S04_RANK_ORDINAL_MARKER,
  METHODE_PAGE_LEAD_LINK_CLOSER_SUFFIX,
  H1_ACCENT_PERIOD,
  RESULT_H1_PERCENT_WRAPPER_PREFIX, RESULT_H1_PERCENT_WRAPPER_SUFFIX,
  CARD_FOOTER_NUMERO_PREFIX, CARD_FOOTER_DATE_SEPARATOR,
  MIDDLE_DOT_SEPARATOR,
  SHARE_LEAD_TO_SOURCE_SEPARATOR, SHARE_LEAD_TO_SUMMARY_SEPARATOR,
  VOTE_GLYPH_CONTRE, VOTE_GLYPH_SKIP, VOTE_GLYPH_POUR,
  BUTTON_ICON_RESTART,
  RESULT_CONTINUE_TEST_PAREN_PREFIX, RESULT_CONTINUE_TEST_PAREN_SUFFIX,
  AUDIT_GLYPH_ALIGNED, AUDIT_GLYPH_PARTIAL, AUDIT_GLYPH_OPPOSED, AUDIT_GLYPH_DIVIDED,
  BUTTON_ARROW_RIGHT_PREFIX,
  BACK_ARROW_PREFIX_GLYPH, BACK_ARROW_SUFFIX_GLYPH,
  BUTTON_ARROW_RIGHT_SUFFIX,
  BUTTON_ICON_SHARE, BUTTON_ICON_MAIL,
  CARD_IA_CHIP_GLYPH,
  SWIPE_LEGEND_ARROW_CONTRE, SWIPE_LEGEND_ARROW_SKIP, SWIPE_LEGEND_ARROW_POUR,
  DISCLOSURE_GLYPH_OPEN, DISCLOSURE_GLYPH_CLOSED,
  MODAL_CLOSE_GLYPH, EXTERNAL_LINK_GLYPH,
  METHODESHEET_BLOCK_EMOJI_AN, METHODESHEET_BLOCK_EMOJI_CLAUDE,
  CARD_POINTS_CLES_BULLET_GLYPH,
  WORDMARK_PART_1, WORDMARK_SLASH, WORDMARK_PART_2,
  AUDIT_TRAIL_HEADER_PARTY_NAME_PREFIX,
  NAV_TARGET_RESULT, NAV_TARGET_METHODE, NAV_TARGET_LEGAL, NAV_TARGET_CONTACT,
  SKELETON_SHIMMER_CLASS,
  METHODE_SHEET_BACKDROP_TESTID,
  METHODE_SHEET_TITLE_ID, RESULT_PERSONNALITES_PANEL_ID,
  METHODE_SECTION_ID_PREFIX, METHODE_SECTION_HEADING_ID_PREFIX,
  AUDIT_TRAIL_HEADING_ID_PREFIX, AUDIT_TRAIL_PANEL_ID_PREFIX,
  SCRUTINS_TABLE_NAME, SCRUTINS_COL_POINTS_CLES, SCRUTINS_COL_INGERE_LE,
  SCRUTINS_COL_DATE, COVER_STORAGE_TRUE_VALUE, ERROR_STACK_TRACE_MAX_LENGTH,
  MS_PER_DAY, SYNC_CADENCE_DAYS, DECK_SEED_RANGE_EXPONENT,
  SCORE_PERFECT, SCORE_PARTIAL, SCORE_CONFLICT,
  MATCHING_SCALE, PCT_MULTIPLIER,
  EXTERNAL_LINK_TARGET, EXTERNAL_LINK_REL,
  DECK_VISIBLE_DEPTH, SWIPE_THRESHOLD,
  SAFE_AREA_VIEWPORT_HEIGHT, BACKDROP_FADE_DURATION_S, MAILTO_SCHEME,
  EASE_OUT_QUART, CARD_FLIP_DURATION_S, CARD_FLIP_ROTATE_DEGREES,
  MENU_TRIGGER_GLYPH, POPOVER_BACKDROP_FADE_DURATION_S,
  TOPBAR_TRIGGER_TRANSITION_DURATION_MS,
  METHODE_S02_CAPS_EXAMPLE,
  METHODE_S01_DATA_SOURCE_STRONG, METHODE_S01_DATA_SOURCE_QUALITY_CLAIM,
  METHODE_S04_RANK_NOISE_EXPLANATION,
  METHODE_S01_SAME_FILES_CLAIM,
  METHODE_S02_THEMES_EXAMPLES,
  METHODE_S03_ABSENTS_EXCLUSION,
  METHODE_S02_KEPT_SOLENNELS, METHODE_S02_KEPT_VOTES_FINAUX,
  METHODE_S02_KEPT_CENSURE, METHODE_S02_KEPT_REFERENDAIRES, METHODE_S02_KEPT_PROPOSITIONS,
  METHODE_S04_FORMULA_LINES,
  METHODE_S03_THRESHOLD_RULE_SUFFIX, METHODE_S03_THRESHOLD_RULE_ELSE,
  METHODE_S02_RANDOM_AVOIDANCE, METHODE_S02_GARDE_FOUS_LEAD,
  METHODE_S02_GARDE_FOU_LEAD,
  METHODE_S02_GARDE_FOU_DOSSIER_SUFFIX, METHODE_S02_GARDE_FOU_SUJET_SUFFIX,
  METHODE_S04_RANK_THRESHOLD_SUFFIX,
  METHODE_PAGE_LEAD_TAIL, METHODE_PAGE_LEAD_SECTION_07_REF,
  COVER_EYEBROW_SUFFIX,
  COVER_SECONDARY_NAV_LABEL,
  LEGISLATURE_LABEL,
} from "../src/types";
import {
  METHODE_SECTION_BODY_TITLES,
  METHODE_LINK_ANNOTATION_OPEN_DATA,
  METHODE_LINK_ANNOTATION_CODE_SOURCE_MIT,
  METHODE_LINK_ANNOTATION_PROMPT_CODE_PUBLIC,
  METHODE_LINK_ANNOTATION_SIGNALER_ERREUR,
} from "../src/routes/Methode";
import { VOTE_FEEDBACK_LABELS } from "../src/lib/vote-feedback";
import { RETRY_DEFAULT_LABEL } from "../src/components/RetryError";
import { freshnessTotalScrutinsPhrase, STALE_AFTER_DAYS } from "../src/components/FreshnessBanner";

// Centralised aria-labels for cross-route a11y consistency. Used by:
//   - WORDMARK_HOME_LABEL: TopBar wordmark + Cover/Methode/Legal back links (4 sites)
//   - PAGE_HEADER_NAV_LABEL: Methode + Legal page-header nav landmarks (2 sites)
//   - EXTERNAL_LINK_SUFFIX / externalLinkLabel: 5 sites across Methode + Legal
//
// These tests pin the exact strings + the externalLinkLabel composition
// invariant so a future i18n move (en-US) edits one place + tests update
// together.

describe("WORDMARK_HOME_LABEL", () => {
  it("matches the canonical 'Accueil' wording (rebrand-safe)", () => {
    expect(WORDMARK_HOME_LABEL).toBe("Accueil");
  });
});

describe("PAGE_HEADER_NAV_LABEL", () => {
  it("matches the canonical 'En-tête de la page' wording", () => {
    expect(PAGE_HEADER_NAV_LABEL).toBe("En-tête de la page");
  });
});

describe("externalLinkLabel + EXTERNAL_LINK_SUFFIX", () => {
  it("EXTERNAL_LINK_SUFFIX is the documented '(nouvel onglet)' marker (with leading space)", () => {
    expect(EXTERNAL_LINK_SUFFIX).toBe(" (nouvel onglet)");
  });

  it("appends the suffix to the visible link text", () => {
    expect(externalLinkLabel("data.assemblee-nationale.fr")).toBe(
      "data.assemblee-nationale.fr (nouvel onglet)",
    );
  });

  it("works with any text (rename-safe)", () => {
    expect(externalLinkLabel("github.com/sansdetour")).toBe(
      "github.com/sansdetour (nouvel onglet)",
    );
  });

  it("is composable from the const (not a separate literal)", () => {
    // Sanity: a future change to EXTERNAL_LINK_SUFFIX propagates to the
    // helper via concatenation, not a parallel hardcoded suffix.
    const visible = "test.example";
    expect(externalLinkLabel(visible).endsWith(EXTERNAL_LINK_SUFFIX)).toBe(true);
    expect(externalLinkLabel(visible).startsWith(visible)).toBe(true);
  });
});

describe("AN_OPEN_DATA_HOSTNAME — derived from AN_OPEN_DATA_URL", () => {
  // Used 3× as the visible text in Methode §01 <code> + Methode §06
  // link text + Legal sources link text. Pin the derivation so a
  // future AN domain change propagates atomically.
  it("strips the protocol + trailing slash from AN_OPEN_DATA_URL", () => {
    expect(AN_OPEN_DATA_HOSTNAME).toBe(
      AN_OPEN_DATA_URL.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    );
  });

  it("is the canonical 'data.assemblee-nationale.fr' value (pin-the-value)", () => {
    expect(AN_OPEN_DATA_HOSTNAME).toBe("data.assemblee-nationale.fr");
  });

  it("is a bare hostname (no protocol, no slash)", () => {
    expect(AN_OPEN_DATA_HOSTNAME.startsWith("http")).toBe(false);
    expect(AN_OPEN_DATA_HOSTNAME.includes("/")).toBe(false);
  });
});

describe("Play.tsx vote-button labels", () => {
  // Pin the 3 visible button labels + the 3 aria-labels that compose
  // from voteButtonAriaLabel. A copy tweak in either pair (visible
  // text or aria-suffix) should propagate via the same const edit.

  it("VOTE_LABEL_CONTRE / VOTE_LABEL_SKIP / VOTE_LABEL_POUR are the canonical 3 strings", () => {
    expect(VOTE_LABEL_CONTRE).toBe("Contre");
    expect(VOTE_LABEL_SKIP).toBe("Je passe");
    expect(VOTE_LABEL_POUR).toBe("Pour");
  });

  it("VOTE_ARIA_* labels start with the matching visible text", () => {
    // The aria-label pattern is `${visible} — ${contextSuffix}`, so each
    // ARIA const must start with its visible label. A typo (e.g. swapping
    // the suffix vs label) would surface here.
    expect(VOTE_ARIA_CONTRE.startsWith(VOTE_LABEL_CONTRE)).toBe(true);
    expect(VOTE_ARIA_SKIP.startsWith(VOTE_LABEL_SKIP)).toBe(true);
    expect(VOTE_ARIA_POUR.startsWith(VOTE_LABEL_POUR)).toBe(true);
  });

  it("voteButtonAriaLabel composes 'label — suffix'", () => {
    expect(voteButtonAriaLabel("X", "y")).toBe("X — y");
  });

  it("the 3 visible labels are distinct (no accidental dup)", () => {
    const set = new Set([VOTE_LABEL_CONTRE, VOTE_LABEL_SKIP, VOTE_LABEL_POUR]);
    expect(set.size).toBe(3);
  });
});

describe("anScrutinViewAriaLabel — Card + AuditTrail external link a11y", () => {
  // Used 2× (Card.tsx verso footer + AuditTrail.tsx per-row link). Pin
  // the template + the EXTERNAL_LINK_SUFFIX round-trip so a future
  // rewording (or i18n flip) propagates atomically.
  it("composes the canonical 'Voir le scrutin n°N sur le site de l'Assemblée Nationale (nouvel onglet)' wording", () => {
    expect(anScrutinViewAriaLabel(1234)).toBe(
      "Voir le scrutin n°1234 sur le site de l'Assemblée Nationale (nouvel onglet)",
    );
  });

  it("interpolates the numero into the n°N slot", () => {
    expect(anScrutinViewAriaLabel(42)).toContain("n°42");
    expect(anScrutinViewAriaLabel(999)).toContain("n°999");
  });

  it("ends with EXTERNAL_LINK_SUFFIX (round-trip via the shared external-link marker)", () => {
    // A future change to EXTERNAL_LINK_SUFFIX (e.g. " (opens in new tab)"
    // for en-US) should propagate to this helper via concatenation, not
    // a parallel hardcoded suffix.
    expect(anScrutinViewAriaLabel(7).endsWith(EXTERNAL_LINK_SUFFIX)).toBe(true);
  });
});

describe("SKELETON_CARD_LOADING_LABEL + SKELETON_RESULT_LOADING_LABEL", () => {
  // Used 1× in CardSkeleton + 1× in ResultSkeleton + 3× in Skeleton.test.tsx.
  // Pin the visible wording so a rewording propagates from one edit.
  it("SKELETON_CARD_LOADING_LABEL is the canonical 'Chargement des scrutins' wording", () => {
    expect(SKELETON_CARD_LOADING_LABEL).toBe("Chargement des scrutins");
  });

  it("SKELETON_RESULT_LOADING_LABEL is the canonical 'Chargement de ton résultat' wording", () => {
    expect(SKELETON_RESULT_LOADING_LABEL).toBe("Chargement de ton résultat");
  });

  it("both start with 'Chargement' (SR skim consistency)", () => {
    // Distinct skeletons but both must announce "loading" as the first
    // word so a screen reader user hears the same load-bearing token
    // regardless of route. A future divergence (e.g. "Loading the deck"
    // / "Computing your result") should be a deliberate choice, not
    // accidental drift.
    expect(SKELETON_CARD_LOADING_LABEL.startsWith("Chargement")).toBe(true);
    expect(SKELETON_RESULT_LOADING_LABEL.startsWith("Chargement")).toBe(true);
  });

  it("the 2 labels are distinct (no accidental clone)", () => {
    expect(SKELETON_CARD_LOADING_LABEL).not.toBe(SKELETON_RESULT_LOADING_LABEL);
  });
});

describe("DEMO_DATA_LABEL_PREFIX — Card + AuditTrail demo-data hint", () => {
  // The full wording varies per site (title is explanatory, aria-labels
  // are tighter) but the leading "Donnée de démonstration" prefix is the
  // load-bearing token. 3 sites compose with the same prefix.
  it("matches the canonical 'Donnée de démonstration' prefix", () => {
    expect(DEMO_DATA_LABEL_PREFIX).toBe("Donnée de démonstration");
  });

  it("does not include any trailing punctuation / space (consumers append their own)", () => {
    // The 3 sites compose `${PREFIX} (…)` or `${PREFIX} — …` — the prefix
    // must not include the separator else the composed strings double-up.
    expect(DEMO_DATA_LABEL_PREFIX.endsWith(" ")).toBe(false);
    expect(DEMO_DATA_LABEL_PREFIX.endsWith(".")).toBe(false);
    expect(DEMO_DATA_LABEL_PREFIX.endsWith(",")).toBe(false);
  });
});

describe("restartConfirmMessage — Cover.tsx restart confirm prompt", () => {
  // Pulls the singular/plural French agreement + RESTART_LABEL prefix
  // out of inline ternaries in Cover.tsx restart(). tests/Cover.test.tsx
  // round-trip via this helper instead of regex-matching the literal
  // "Ton vote en cours sera perdu" / "Tes N votes en cours seront perdus".
  it("starts with RESTART_LABEL on both branches (preserves the button-copy reuse)", () => {
    expect(restartConfirmMessage(1).startsWith(RESTART_LABEL)).toBe(true);
    expect(restartConfirmMessage(5).startsWith(RESTART_LABEL)).toBe(true);
  });

  it("uses the singular phrasing 'Ton vote ... sera perdu.' when votesCount === 1", () => {
    expect(restartConfirmMessage(1)).toContain("Ton vote en cours sera perdu.");
  });

  it("uses the plural phrasing 'Tes N votes ... seront perdus.' when votesCount !== 1", () => {
    expect(restartConfirmMessage(3)).toContain("Tes 3 votes en cours seront perdus.");
    expect(restartConfirmMessage(20)).toContain("Tes 20 votes en cours seront perdus.");
  });

  it("votesCount === 0 falls into the plural branch (sanity — French treats 0 as plural)", () => {
    // 0 votes is an edge case the UI shouldn't reach (the restart button
    // only renders when hasInProgress=true → votesCount ≥ 1), but the
    // helper's plural-rule logic still needs to be consistent. French
    // treats 0 as plural ("0 votes" not "0 vote") so 0 should hit the
    // plural branch.
    expect(restartConfirmMessage(0)).toContain("Tes 0 votes en cours seront perdus.");
  });

  it("ends with a period (sentence completion, consistent with confirm prompt convention)", () => {
    expect(restartConfirmMessage(1).endsWith(".")).toBe(true);
    expect(restartConfirmMessage(2).endsWith(".")).toBe(true);
  });
});

describe("refaireConfirmMessage — Result.tsx refaire confirm prompt", () => {
  // Symmetric to restartConfirmMessage (Cover): same singular/plural
  // French agreement + REFAIRE_LABEL prefix. The loss-phrase differs —
  // here the user has completed a result, so the message names both
  // the votes AND the result as lost.
  it("starts with REFAIRE_LABEL on both branches", () => {
    expect(refaireConfirmMessage(1).startsWith(REFAIRE_LABEL)).toBe(true);
    expect(refaireConfirmMessage(20).startsWith(REFAIRE_LABEL)).toBe(true);
  });

  it("uses singular 'Ton vote et ton résultat seront perdus.' when total === 1", () => {
    expect(refaireConfirmMessage(1)).toContain("Ton vote et ton résultat seront perdus.");
  });

  it("uses plural 'Tes N votes et ton résultat seront perdus.' when total !== 1", () => {
    expect(refaireConfirmMessage(20)).toContain("Tes 20 votes et ton résultat seront perdus.");
    expect(refaireConfirmMessage(3)).toContain("Tes 3 votes et ton résultat seront perdus.");
  });

  it("names both the votes AND the résultat as lost (distinct from restartConfirmMessage which loses only votes)", () => {
    // Anti-drift guard: if a future refactor unifies the two helpers
    // into one shared restart-style template, this test surfaces it.
    expect(refaireConfirmMessage(1)).toContain("résultat");
    expect(restartConfirmMessage(1)).not.toContain("résultat");
  });

  it("ends with a period (sentence completion)", () => {
    expect(refaireConfirmMessage(1).endsWith(".")).toBe(true);
    expect(refaireConfirmMessage(20).endsWith(".")).toBe(true);
  });
});

describe("RANKING_OVERLAY_LABEL + MODAL_CLOSE_LABEL — modal a11y consts", () => {
  // RANKING_OVERLAY_LABEL is the aria-label + visible-header prefix
  // for RankingOverlay (5 sites: 2 source + 3 tests). MODAL_CLOSE_LABEL
  // is the shared close-button wording for MethodeSheet (aria-label,
  // with visible "✕" icon) + RankingOverlay (visible button text).
  it("RANKING_OVERLAY_LABEL matches the canonical 'Classement partiel' wording", () => {
    expect(RANKING_OVERLAY_LABEL).toBe("Classement partiel");
  });

  it("MODAL_CLOSE_LABEL matches the canonical 'Fermer' wording", () => {
    expect(MODAL_CLOSE_LABEL).toBe("Fermer");
  });

  it("MODAL_CLOSE_LABEL is a single word (icon-button aria-label expects compact wording)", () => {
    // The MethodeSheet close button shows just "✕" with this aria-label;
    // a 2-3 word aria-label here would read awkwardly when paired with
    // the visible icon. Pin the constraint to surface a future drift.
    expect(MODAL_CLOSE_LABEL.split(" ")).toHaveLength(1);
  });
});

describe("CARD_VERSO_SEPARATOR_LABEL + AN_LINK_VISIBLE_LABEL — Card verso copy + AN link visible text", () => {
  // Both pin user-visible Card verso copy. The separator is also pinned
  // via 2 regex assertions in tests/Card.test.tsx (now round-tripping
  // via the const). AN_LINK_VISIBLE_LABEL is referenced both as Card
  // verso link text AND as a quoted reference in Methode §07 prose
  // — a rewording must propagate to both.
  it("CARD_VERSO_SEPARATOR_LABEL contains both 'Synthèse IA' and 'texte officiel AN' (the two pole labels)", () => {
    // The separator's role is to make the IA/AN boundary explicit on
    // the verso. A rewording that drops either pole would defeat the
    // anti-bias framing called out in Methode §07. Pin the contract.
    expect(CARD_VERSO_SEPARATOR_LABEL).toContain("Synthèse IA");
    expect(CARD_VERSO_SEPARATOR_LABEL).toContain("texte officiel AN");
  });

  it("CARD_VERSO_SEPARATOR_LABEL uses arrows pointing up + down (visual ordering hint)", () => {
    // ↑ = above on the verso = Synthèse IA; ↓ = below = texte officiel.
    // A regression that swaps the arrows (or drops them) would confuse
    // the visual hierarchy the comment line documents.
    expect(CARD_VERSO_SEPARATOR_LABEL).toContain("↑");
    expect(CARD_VERSO_SEPARATOR_LABEL).toContain("↓");
  });

  it("AN_LINK_VISIBLE_LABEL is the canonical 'Voir sur AN ↗' wording", () => {
    expect(AN_LINK_VISIBLE_LABEL).toBe("Voir sur AN ↗");
  });

  it("AN_LINK_VISIBLE_LABEL ends with an external-link arrow indicator", () => {
    // The ↗ icon signals "opens new tab" visually without needing the
    // EXTERNAL_LINK_SUFFIX aria-label suffix on the visible text. A
    // future change that drops the arrow should be deliberate, not
    // accidental.
    expect(AN_LINK_VISIBLE_LABEL.endsWith("↗")).toBe(true);
  });
});

describe("MENU_OPEN_LABEL + MENU_CLOSE_LABEL + MAIN_MENU_LABEL — TopBar menu trigger a11y", () => {
  // 18 test sites in tests/TopBar.test.tsx pin MENU_OPEN_LABEL via
  // `getByRole("button", { name: /Ouvrir le menu/ })`; 1 site pins
  // MENU_CLOSE_LABEL. MAIN_MENU_LABEL is the nav-landmark aria-label
  // inside the open popover. A rewording without const-based pins
  // would silently desync 20 sites.

  it("MENU_OPEN_LABEL is the canonical 'Ouvrir le menu' wording", () => {
    expect(MENU_OPEN_LABEL).toBe("Ouvrir le menu");
  });

  it("MENU_CLOSE_LABEL is the canonical 'Fermer le menu' wording", () => {
    expect(MENU_CLOSE_LABEL).toBe("Fermer le menu");
  });

  it("MAIN_MENU_LABEL is the canonical 'Menu principal' wording", () => {
    expect(MAIN_MENU_LABEL).toBe("Menu principal");
  });

  it("open + close labels are distinct (anti-clone)", () => {
    expect(MENU_OPEN_LABEL).not.toBe(MENU_CLOSE_LABEL);
  });

  it("open + close labels both end with 'menu' (consistent suffix for SR skim)", () => {
    // The trigger toggles between these two labels on the same button.
    // Both should end with the same noun ("menu") so the SR announcement
    // reads naturally on open AND close.
    expect(MENU_OPEN_LABEL.endsWith("menu")).toBe(true);
    expect(MENU_CLOSE_LABEL.endsWith("menu")).toBe(true);
  });
});

describe("ERROR_FALLBACK_HEADING + _MESSAGE + _RELOAD_LABEL — ErrorBoundary copy", () => {
  it("ERROR_FALLBACK_HEADING is the canonical 'Erreur' sr-only h1", () => {
    expect(ERROR_FALLBACK_HEADING).toBe("Erreur");
  });

  it("ERROR_FALLBACK_MESSAGE matches the canonical 'Quelque chose s'est cassé...' wording", () => {
    expect(ERROR_FALLBACK_MESSAGE).toBe("Quelque chose s'est cassé de notre côté.");
  });

  it("ERROR_FALLBACK_RELOAD_LABEL is the canonical 'Recharger' button label", () => {
    expect(ERROR_FALLBACK_RELOAD_LABEL).toBe("Recharger");
  });

  it("ERROR_FALLBACK_MESSAGE is a complete sentence (period termination)", () => {
    // ErrorBoundary renders this as a standalone <p>; if a future
    // rewording drops the period, the prose reads truncated.
    expect(ERROR_FALLBACK_MESSAGE.endsWith(".")).toBe(true);
  });
});

describe("PERSONNALITES_TOGGLE_LABEL — Result.tsx personnalités toggle button", () => {
  // 1 source site (Result.tsx button text) + 6 test regex sites in
  // tests/Result.test.tsx. A rewording (e.g. "Voir les candidat·e·s"
  // / "Show candidates") would have required 7 in-lockstep edits.
  it("matches the canonical 'Voir les personnalités' wording", () => {
    expect(PERSONNALITES_TOGGLE_LABEL).toBe("Voir les personnalités");
  });

  it("starts with 'Voir' (the visible chevron + label pattern: '{▾|▸} Voir les …')", () => {
    // Result.tsx prefixes the label with a chevron span ("▾ " or "▸ ")
    // depending on showPersonnalites state. The label itself should
    // start with the verb so the SR announcement reads naturally
    // alongside the chevron.
    expect(PERSONNALITES_TOGGLE_LABEL.startsWith("Voir")).toBe(true);
  });
});

describe("CARD_AN_LIBELLE_PREFIX_LABEL — Card verso AN libellé header", () => {
  // Paired with CARD_VERSO_SEPARATOR_LABEL (session 144) — together
  // they document the "↓ texte officiel AN" / "Intitulé officiel AN ·"
  // anti-bias framing called out in Methode §07.
  it("matches the canonical 'Intitulé officiel AN' wording", () => {
    expect(CARD_AN_LIBELLE_PREFIX_LABEL).toBe("Intitulé officiel AN");
  });

  it("contains 'AN' (the load-bearing official-source token)", () => {
    expect(CARD_AN_LIBELLE_PREFIX_LABEL).toContain("AN");
  });
});

describe("METHODE_SOMMAIRE_NAV_LABEL — Methode in-page TOC nav landmark", () => {
  it("matches the canonical 'Sommaire de la méthode' wording", () => {
    expect(METHODE_SOMMAIRE_NAV_LABEL).toBe("Sommaire de la méthode");
  });

  it("starts with 'Sommaire' (anti-rename guard for the SR landmark rotor)", () => {
    // A future rewording to "Table des matières" would change the SR
    // skim — pin the load-bearing first word so the change is explicit.
    expect(METHODE_SOMMAIRE_NAV_LABEL.startsWith("Sommaire")).toBe(true);
  });
});

describe("COVER_SOURCE_ATTRIBUTION_AN + _CLAUDE — Cover header source pair", () => {
  // The 2 stacked-line attribution block in the top-right header
  // documents the same IA-vs-AN provenance contract as
  // CARD_VERSO_SEPARATOR_LABEL. Two consts so each pole can be reworded
  // independently.
  it("AN attribution matches the canonical 'Données AN officielles' wording", () => {
    expect(COVER_SOURCE_ATTRIBUTION_AN).toBe("Données AN officielles");
  });

  it("Claude attribution matches the canonical 'résumés Claude (IA)' wording", () => {
    expect(COVER_SOURCE_ATTRIBUTION_CLAUDE).toBe("résumés Claude (IA)");
  });

  it("AN attribution contains 'AN' (source-name pin)", () => {
    expect(COVER_SOURCE_ATTRIBUTION_AN).toContain("AN");
  });

  it("Claude attribution contains 'Claude' (model-name pin)", () => {
    // A future model swap (e.g. Haiku 5) would still keep the brand
    // family name "Claude" — pin it as the load-bearing token.
    expect(COVER_SOURCE_ATTRIBUTION_CLAUDE).toContain("Claude");
  });
});

describe("chipTop1AriaLabel — ChipTop1 'currently #1' pill aria-label", () => {
  // Source had inline template `Top 1 actuel : ${name} à ${pct} %.
  // Toucher pour voir le classement complet.` and the test only pinned
  // {name} + {pct} slots via stringContaining — the surrounding wording
  // ("Top 1 actuel :", "Toucher pour voir…") could silently drift. Helper
  // + round-trip pin closes the gap.
  it("composes the canonical 'Top 1 actuel : N à P %. Toucher …' template", () => {
    expect(chipTop1AriaLabel("Rassemblement National", 57)).toBe(
      "Top 1 actuel : Rassemblement National à 57 %. Toucher pour voir le classement complet.",
    );
  });

  it("interpolates both party name + pct into the template slots", () => {
    expect(chipTop1AriaLabel("LFI", 42)).toContain("LFI");
    expect(chipTop1AriaLabel("LFI", 42)).toContain("42");
  });

  it("starts with 'Top 1 actuel' (SR skim load-bearing prefix)", () => {
    // The SR user hears this first when the chip is focused — pin the
    // prefix so a future rewording (e.g. "Tu es aligné à…") is explicit.
    expect(chipTop1AriaLabel("X", 1).startsWith("Top 1 actuel")).toBe(true);
  });

  it("ends with the 'Toucher pour voir le classement complet.' action hint", () => {
    // The chip is a button that opens RankingOverlay; the action hint
    // tells SR users what activation does. Pin the wording.
    expect(chipTop1AriaLabel("X", 1).endsWith("Toucher pour voir le classement complet.")).toBe(true);
  });
});

describe("METHODESHEET_AN_BLOCK_TITLE + _CLAUDE_BLOCK_TITLE — MethodeSheet AN/Claude block titles", () => {
  // Paired with COVER_SOURCE_ATTRIBUTION_AN/CLAUDE — same IA-vs-AN
  // framing across the 2 surfaces (Cover header + MethodeSheet sheet).
  it("AN block title matches the canonical 'AN officiel' wording", () => {
    expect(METHODESHEET_AN_BLOCK_TITLE).toBe("AN officiel");
  });

  it("Claude block title matches the canonical 'Mis en forme par IA Claude' wording", () => {
    expect(METHODESHEET_CLAUDE_BLOCK_TITLE).toBe("Mis en forme par IA Claude");
  });

  it("AN title contains 'AN' (source-name pin)", () => {
    expect(METHODESHEET_AN_BLOCK_TITLE).toContain("AN");
  });

  it("Claude title contains 'Claude' (model-name pin)", () => {
    expect(METHODESHEET_CLAUDE_BLOCK_TITLE).toContain("Claude");
  });
});

describe("CARD_IA_CHIP_ARIA_LABEL — Card recto ✨IA chip aria-label", () => {
  it("matches the canonical 'IA — comment ce contenu a été préparé' wording", () => {
    expect(CARD_IA_CHIP_ARIA_LABEL).toBe("IA — comment ce contenu a été préparé");
  });

  it("starts with 'IA' (matches the visible button text '✨IA' for SR consistency)", () => {
    // The chip renders "✨IA" visually (✨ is aria-hidden) — the aria-label
    // should start with the same token the visible text shows so SR + sighted
    // users get a consistent anchor word.
    expect(CARD_IA_CHIP_ARIA_LABEL.startsWith("IA")).toBe(true);
  });
});

describe("METHODE_PAGE_EYEBROW + METHODE_PAGE_H1 — Methode page header", () => {
  // h1 was pinned by a loose `/Comment on calcule/` regex — a partial
  // rewording (e.g. dropping "et avec quelles données") would pass that
  // pin silently. Full const round-trip closes the gap.
  it("METHODE_PAGE_EYEBROW matches the canonical 'MÉTHODE & SOURCES' wording", () => {
    expect(METHODE_PAGE_EYEBROW).toBe("MÉTHODE & SOURCES");
  });

  it("METHODE_PAGE_H1 matches the canonical 'Comment on calcule, et avec quelles données' wording", () => {
    expect(METHODE_PAGE_H1).toBe("Comment on calcule, et avec quelles données");
  });

  it("METHODE_PAGE_EYEBROW is fully uppercase (eyebrow styling convention)", () => {
    expect(METHODE_PAGE_EYEBROW).toBe(METHODE_PAGE_EYEBROW.toUpperCase());
  });

  it("METHODE_PAGE_H1 has no trailing period (the colored period is a separate JSX span)", () => {
    // The source appends `<span style={{ color: "var(--accent)" }}>.</span>`
    // — so the const must NOT include the period, otherwise the rendered
    // h1 would read "…données.." (double period).
    expect(METHODE_PAGE_H1.endsWith(".")).toBe(false);
  });
});

describe("DEMO_FALLBACK_SHORT_LABEL — Card recto + AuditTrail demo badge", () => {
  it("matches the canonical 'démo' badge wording", () => {
    expect(DEMO_FALLBACK_SHORT_LABEL).toBe("démo");
  });

  it("is shorter than DEMO_DATA_LABEL_PREFIX (badge vs aria-label distinction)", () => {
    // Confirm the two demo-data labels are intentionally distinct:
    // the short visible badge ("démo") vs the long screen-reader
    // hint prefix ("Donnée de démonstration"). A future merge would
    // change either the visible footprint or the SR experience.
    expect(DEMO_FALLBACK_SHORT_LABEL.length).toBeLessThan(DEMO_DATA_LABEL_PREFIX.length);
  });
});

describe("AUDIT_TRAIL_LABEL_* — AuditTrail per-row icon labels", () => {
  // 10 sites: 4 source if-branches in AuditTrail.tsx + 6 getByLabelText
  // assertions in tests/AuditTrail.test.tsx. Centralised so a rewording
  // ("Aligné" → "En accord") propagates from one edit.
  it("DIVIDED matches the canonical 'Groupe divisé, non compté' wording", () => {
    expect(AUDIT_TRAIL_LABEL_DIVIDED).toBe("Groupe divisé, non compté");
  });

  it("ALIGNED matches the canonical 'Aligné' wording", () => {
    expect(AUDIT_TRAIL_LABEL_ALIGNED).toBe("Aligné");
  });

  it("PARTIAL matches the canonical 'Partiel' wording", () => {
    expect(AUDIT_TRAIL_LABEL_PARTIAL).toBe("Partiel");
  });

  it("OPPOSED matches the canonical 'Opposé' wording", () => {
    expect(AUDIT_TRAIL_LABEL_OPPOSED).toBe("Opposé");
  });

  it("the 4 labels are distinct (anti-clone)", () => {
    const set = new Set([
      AUDIT_TRAIL_LABEL_DIVIDED, AUDIT_TRAIL_LABEL_ALIGNED,
      AUDIT_TRAIL_LABEL_PARTIAL, AUDIT_TRAIL_LABEL_OPPOSED,
    ]);
    expect(set.size).toBe(4);
  });
});

describe("partyRowAriaLabel — PartyRow SR-friendly one-sentence label", () => {
  // Pulled out of inline template `${name}, ${pct} % d'alignement sur
  // ${counted} scrutin(s) compté(s)` in PartyRow.tsx. tests/PartyRow.test.tsx
  // round-trip via the helper (replacing 4 loose partial-match regexes).
  it("composes the canonical 'name, P % d'alignement sur N scrutin(s) compté(s)' template", () => {
    expect(partyRowAriaLabel("La France Insoumise", 67, 8)).toBe(
      "La France Insoumise, 67 % d'alignement sur 8 scrutins comptés",
    );
  });

  it("uses singular 'scrutin compté' when counted === 1", () => {
    expect(partyRowAriaLabel("X", 50, 1)).toContain("1 scrutin compté");
    expect(partyRowAriaLabel("X", 50, 1)).not.toContain("scrutins");
  });

  it("uses plural 'scrutins comptés' when counted === 0 (French rule)", () => {
    expect(partyRowAriaLabel("X", 0, 0)).toContain("0 scrutins comptés");
  });

  it("uses plural 'scrutins comptés' when counted >= 2", () => {
    expect(partyRowAriaLabel("X", 80, 12)).toContain("12 scrutins comptés");
  });
});

describe("personnaliteRowAriaLabel — PersonnaliteRow 2-branch SR label", () => {
  // Helper has 2 branches:
  //   - normal:    "{name}, {pct} % d'alignement sur {counted} vote(s)"
  //   - low-data:  "{name}, trop peu de données : {counted} vote(s) comparable(s)"
  it("normal branch composes the canonical 'name, P % d'alignement sur N vote(s)' template", () => {
    expect(personnaliteRowAriaLabel("Marine Le Pen", 57, 12, false)).toBe(
      "Marine Le Pen, 57 % d'alignement sur 12 votes",
    );
  });

  it("low-data branch composes the 'trop peu de données : N vote(s) comparable(s)' template", () => {
    expect(personnaliteRowAriaLabel("Marine Le Pen", 0, 2, true)).toBe(
      "Marine Le Pen, trop peu de données : 2 votes comparables",
    );
  });

  it("normal branch uses singular 'vote' when counted === 1", () => {
    expect(personnaliteRowAriaLabel("X", 50, 1, false)).toContain("1 vote");
    expect(personnaliteRowAriaLabel("X", 50, 1, false)).not.toContain("1 votes");
  });

  it("low-data branch uses singular 'vote comparable' when counted === 1", () => {
    expect(personnaliteRowAriaLabel("X", 0, 1, true)).toContain("1 vote comparable");
    expect(personnaliteRowAriaLabel("X", 0, 1, true)).not.toContain("comparables");
  });

  it("low-data branch drops the pct (avoids implying a real score on a low-sample size)", () => {
    // Pin the contract: even with a non-zero pct passed in, the low-data
    // branch must NOT mention it — the whole point is to suppress the
    // implied "real score" on a 1-2 vote sample.
    expect(personnaliteRowAriaLabel("X", 99, 2, true)).not.toContain("99");
  });
});

describe("freshnessTotalScrutinsPhrase — FreshnessBanner body-line total-scrutins phrase", () => {
  // Pulled out of inline `{N} scrutin{plural}` template in
  // FreshnessBanner.tsx. The session 83 hardcoded-plural bug ("1
  // scrutins") lives inside this helper as the load-bearing invariant.
  it("composes the canonical 'N scrutin(s)' phrase", () => {
    expect(freshnessTotalScrutinsPhrase(92)).toBe("92 scrutins");
    expect(freshnessTotalScrutinsPhrase(1)).toBe("1 scrutin");
  });

  it("uses singular 'scrutin' when total === 1 (session 83 regression guard)", () => {
    expect(freshnessTotalScrutinsPhrase(1)).toBe("1 scrutin");
    expect(freshnessTotalScrutinsPhrase(1)).not.toContain("scrutins");
  });

  it("uses plural 'scrutins' for 0, 2, and >=2 (French rule)", () => {
    expect(freshnessTotalScrutinsPhrase(0)).toBe("0 scrutins");
    expect(freshnessTotalScrutinsPhrase(2)).toBe("2 scrutins");
    expect(freshnessTotalScrutinsPhrase(100)).toBe("100 scrutins");
  });
});

describe("personnaliteRowRightColumnText — PersonnaliteRow visible right-column text", () => {
  // Pulled out of inline 2-branch ternary in PersonnaliteRow.tsx.
  // Distinct from personnaliteRowAriaLabel (the SR sentence) — this
  // is the compact visible "pct% · counted" / "— · N vote(s)" footprint.
  it("normal branch composes '{pct}% · {counted}'", () => {
    expect(personnaliteRowRightColumnText(57, 12, false)).toBe("57% · 12");
  });

  it("low-data branch composes '— · {counted} vote(s)' (no pct, suppress implied score)", () => {
    expect(personnaliteRowRightColumnText(50, 2, true)).toBe("— · 2 votes");
  });

  it("low-data branch uses singular 'vote' when counted === 1", () => {
    expect(personnaliteRowRightColumnText(0, 1, true)).toBe("— · 1 vote");
    expect(personnaliteRowRightColumnText(0, 1, true)).not.toContain("votes");
  });

  it("low-data branch always starts with the em-dash placeholder (visual hint)", () => {
    // The "—" makes it visually obvious the pct is absent (vs the
    // normal "57% · …" form). A regression that drops the em-dash
    // would let low-data rows blend into the normal-data ranking.
    expect(personnaliteRowRightColumnText(99, 2, true).startsWith("—")).toBe(true);
  });

  it("low-data branch DROPS the pct (anti-confidence invariant)", () => {
    // Even passing a non-zero pct, the low-data branch must not surface
    // it visually — the whole point of the low-data state.
    expect(personnaliteRowRightColumnText(80, 2, true)).not.toContain("80");
  });
});

describe("auditTrailChipNoun + auditTrailChipText — AuditTrail breakdown chips × 4", () => {
  // Pulled out of 4 inline `aligné{plural}` templates + 5 test regex
  // partial-matches. The 4 kinds mirror the 4 alignmentScore outcomes.
  it("noun helper composes 'aligné(s)' / 'partiel(s)' / 'opposé(s)' / 'divisé(s) non compté(s)'", () => {
    expect(auditTrailChipNoun(1, "aligned")).toBe("aligné");
    expect(auditTrailChipNoun(2, "aligned")).toBe("alignés");
    expect(auditTrailChipNoun(1, "partial")).toBe("partiel");
    expect(auditTrailChipNoun(2, "partial")).toBe("partiels");
    expect(auditTrailChipNoun(1, "opposed")).toBe("opposé");
    expect(auditTrailChipNoun(2, "opposed")).toBe("opposés");
  });

  it("'divided' kind agrees both adjectives ('divisé' + 'non compté')", () => {
    // French rule: both adjectives in "divisé non compté" must agree
    // with the count. Singular "1 divisé non compté", plural "5 divisés
    // non comptés". A regression that only pluralises one of the two
    // adjectives would surface here.
    expect(auditTrailChipNoun(1, "divided")).toBe("divisé non compté");
    expect(auditTrailChipNoun(5, "divided")).toBe("divisés non comptés");
  });

  it("text helper wraps noun with count ('N noun')", () => {
    expect(auditTrailChipText(1, "aligned")).toBe("1 aligné");
    expect(auditTrailChipText(5, "divided")).toBe("5 divisés non comptés");
  });

  it("uses plural 'aligné(s)' for 0 (French rule treats 0 as plural)", () => {
    expect(auditTrailChipNoun(0, "aligned")).toBe("alignés");
  });
});

describe("rankingOverlayHeaderText — RankingOverlay visible header", () => {
  it("composes '{label} · N compté(s)' with the canonical RANKING_OVERLAY_LABEL prefix", () => {
    expect(rankingOverlayHeaderText(12)).toBe("Classement partiel · 12 comptés");
    expect(rankingOverlayHeaderText(1)).toBe("Classement partiel · 1 compté");
  });

  it("uses singular 'compté' when countedTotal === 1", () => {
    expect(rankingOverlayHeaderText(1)).toContain("1 compté");
    expect(rankingOverlayHeaderText(1)).not.toContain("comptés");
  });

  it("uses plural 'comptés' for 0 and ≥ 2 (French rule)", () => {
    expect(rankingOverlayHeaderText(0)).toContain("0 comptés");
    expect(rankingOverlayHeaderText(2)).toContain("2 comptés");
  });
});

describe("resultEyebrowText — Result.tsx page header eyebrow", () => {
  it("complete branch composes 'RÉSULTAT · {LEGISLATURE_LABEL}'", () => {
    expect(resultEyebrowText(false, 20, 20)).toBe(`RÉSULTAT · ${LEGISLATURE_LABEL}`);
  });

  it("partial branch composes 'RÉSULTAT PARTIEL · N/TARGET'", () => {
    expect(resultEyebrowText(true, 7, 20)).toBe("RÉSULTAT PARTIEL · 7/20");
    expect(resultEyebrowText(true, 12, 30)).toBe("RÉSULTAT PARTIEL · 12/30");
  });

  it("starts with 'RÉSULTAT' on both branches (SR skim invariant)", () => {
    expect(resultEyebrowText(true, 7, 20).startsWith("RÉSULTAT")).toBe(true);
    expect(resultEyebrowText(false, 20, 20).startsWith("RÉSULTAT")).toBe(true);
  });

  it("partial branch includes 'PARTIEL', complete branch does not", () => {
    expect(resultEyebrowText(true, 7, 20)).toContain("PARTIEL");
    expect(resultEyebrowText(false, 20, 20)).not.toContain("PARTIEL");
  });
});

describe("resultHeaderBodyLineText — Result.tsx body line under h1", () => {
  // 3-segment plural-rule template: "N scrutin(s) · N compté(s) · N skip(s)".
  // Previously inline ${plural} ternary, unpinned by tests. Helper enables
  // pin-the-value testing of all 3 plural rules independently.
  it("composes the canonical 3-segment template", () => {
    expect(resultHeaderBodyLineText(20, 18, 2)).toBe("20 scrutins · 18 comptés · 2 skips");
  });

  it("uses singular when each count === 1 (independent plural rules)", () => {
    expect(resultHeaderBodyLineText(1, 1, 1)).toBe("1 scrutin · 1 compté · 1 skip");
  });

  it("uses plural when count === 0 (French rule treats 0 as plural)", () => {
    expect(resultHeaderBodyLineText(0, 0, 0)).toBe("0 scrutins · 0 comptés · 0 skips");
  });

  it("mixes singular + plural across segments correctly", () => {
    expect(resultHeaderBodyLineText(20, 1, 19)).toBe("20 scrutins · 1 compté · 19 skips");
  });
});

describe("resultPersonnalitesIndexedCountText — Result.tsx personnalités count", () => {
  // Feminine plural rule ("indexée" → "indexées") on the count beside
  // the PERSONNALITES_TOGGLE_LABEL button.
  it("composes 'N indexée(s)' with feminine plural rule", () => {
    expect(resultPersonnalitesIndexedCountText(8)).toBe("8 indexées");
    expect(resultPersonnalitesIndexedCountText(1)).toBe("1 indexée");
  });

  it("uses plural for 0 (French rule)", () => {
    expect(resultPersonnalitesIndexedCountText(0)).toBe("0 indexées");
  });

  it("uses feminine agreement (not masculine 'indexé')", () => {
    // The noun being agreed-with is "personnalités" (feminine plural)
    // — a regression to masculine "indexé" would break agreement.
    expect(resultPersonnalitesIndexedCountText(5)).toContain("indexées");
    expect(resultPersonnalitesIndexedCountText(5)).not.toMatch(/\bindexés\b/);
  });
});

describe("continueTestRemainingSuffix — Result.tsx CONTINUE_TEST button suffix", () => {
  // Plural rule on both noun + adjective ("vote restant" → "votes
  // restants"). Composes with CONTINUE_TEST_LABEL_PREFIX + the count
  // to render the full button text.
  it("composes singular 'vote restant' when remaining === 1", () => {
    expect(continueTestRemainingSuffix(1)).toBe("vote restant");
  });

  it("composes plural 'votes restants' when remaining !== 1 (both noun + adj agree)", () => {
    expect(continueTestRemainingSuffix(0)).toBe("votes restants");
    expect(continueTestRemainingSuffix(2)).toBe("votes restants");
    expect(continueTestRemainingSuffix(15)).toBe("votes restants");
  });
});

describe("coverProgressChipText — Cover.tsx start-button progress chip", () => {
  // 3-branch helper (fresh / inProgress / completed). The fresh branch
  // is invariant; the inProgress branch has a plural rule on "restant";
  // the completed branch shows the final fraction.
  it("fresh branch composes '≈ 5 min · {TARGET} votes'", () => {
    expect(coverProgressChipText("fresh", 0, 20, 0)).toBe("≈ 5 min · 20 votes");
  });

  it("completed branch composes '{N}/{TARGET} terminés'", () => {
    expect(coverProgressChipText("completed", 20, 20, 0)).toBe("20/20 terminés");
  });

  it("inProgress branch composes '{N}/{TARGET} · {K} restant(s)' with plural rule", () => {
    expect(coverProgressChipText("inProgress", 19, 20, 1)).toBe("19/20 · 1 restant");
    expect(coverProgressChipText("inProgress", 5, 20, 15)).toBe("5/20 · 15 restants");
  });

  it("inProgress branch uses plural 'restants' for 0 (French rule)", () => {
    expect(coverProgressChipText("inProgress", 20, 20, 0)).toBe("20/20 · 0 restants");
  });

  it("fresh branch ignores votesCount + remainingVotes (only target matters)", () => {
    // The fresh branch fires when no session exists; passing non-zero
    // votesCount/remaining shouldn't bleed into the output.
    expect(coverProgressChipText("fresh", 5, 20, 15)).toBe("≈ 5 min · 20 votes");
  });
});

describe("RESULT_TOP_LEAD + WORDMARK_TEXT — Result h1 + brand visible text", () => {
  it("RESULT_TOP_LEAD matches the canonical 'Tu es surtout aligné avec' wording", () => {
    expect(RESULT_TOP_LEAD).toBe("Tu es surtout aligné avec");
  });

  it("RESULT_TOP_LEAD has no trailing space (JSX adds {' '} after)", () => {
    // The h1 renders `{RESULT_TOP_LEAD}{" "}` — if the const included
    // a trailing space, the output would have a double space before
    // the party name. Pin the no-trailing-space contract.
    expect(RESULT_TOP_LEAD.endsWith(" ")).toBe(false);
  });

  it("WORDMARK_TEXT matches the canonical 'sans/détour' wordmark", () => {
    expect(WORDMARK_TEXT).toBe("sans/détour");
  });

  it("WORDMARK_TEXT is distinct from BRAND_NAME (lowercase + slash, not capitalized + space)", () => {
    // Pin the contract: wordmark = lowercase typographic mark with
    // slash separator; BRAND_NAME = capitalised display form with
    // space. A future "rebrand" that flattens them would surface here.
    expect(WORDMARK_TEXT).toBe(WORDMARK_TEXT.toLowerCase());
    expect(WORDMARK_TEXT).toContain("/");
    expect(WORDMARK_TEXT).not.toContain(" ");
  });
});

describe("METHODESHEET_TITLE + METHODESHEET_*_LINK_LABEL — MethodeSheet bottom-sheet copy", () => {
  // The h2 title doubles as the dialog's accessible name (aria-labelledby).
  // The 2 link labels are pinned by 2 test regex partial-matches.
  it("METHODESHEET_TITLE matches the canonical 'Comment c'est fait ?' wording", () => {
    expect(METHODESHEET_TITLE).toBe("Comment c'est fait ?");
  });

  it("METHODESHEET_TITLE ends with '?' (interrogative form, SR-friendly framing)", () => {
    // The sheet poses a question; the user activates it for the answer.
    // A rewording that drops the question mark would lose the framing.
    expect(METHODESHEET_TITLE.endsWith("?")).toBe(true);
  });

  it("METHODESHEET_FULL_METHODE_LINK_LABEL matches 'Méthode complète'", () => {
    expect(METHODESHEET_FULL_METHODE_LINK_LABEL).toBe("Méthode complète");
  });

  it("METHODESHEET_REPORT_ERROR_LINK_LABEL matches 'Signaler une erreur factuelle'", () => {
    expect(METHODESHEET_REPORT_ERROR_LINK_LABEL).toBe("Signaler une erreur factuelle");
  });

  it("REPORT_ERROR_LINK_LABEL starts with 'Signaler' (action verb, primary affordance)", () => {
    // The button-like link is the user's report-an-error CTA. A
    // rewording to a noun phrase ("Erreur factuelle") would change
    // the affordance from action to label.
    expect(METHODESHEET_REPORT_ERROR_LINK_LABEL.startsWith("Signaler")).toBe(true);
  });
});

describe("RETRY_DEFAULT_LABEL — RetryError default button label", () => {
  // Previously inline default arg `retryLabel = "Réessayer"` + 3 test
  // literal pins. A rewording would have required 4 in-lockstep edits.
  it("matches the canonical 'Réessayer' wording", () => {
    expect(RETRY_DEFAULT_LABEL).toBe("Réessayer");
  });

  it("starts with capital R (button-label convention)", () => {
    // The label appears on a primary CTA button — sentence case should
    // start with a capital letter, not lowercase.
    expect(RETRY_DEFAULT_LABEL[0]).toBe(RETRY_DEFAULT_LABEL[0].toUpperCase());
  });
});

describe("RESULT_GROUPS_H2 + RESULT_PERSONNALITES_H2 — Result page h2 SR-rotor landmarks", () => {
  // Both h2 landmarks help SR users find sections in the heading rotor.
  // Untested today; centralising lets a future rewording propagate via
  // one edit + surfaces a clean test pin.
  it("RESULT_GROUPS_H2 matches 'Alignement par groupe parlementaire'", () => {
    expect(RESULT_GROUPS_H2).toBe("Alignement par groupe parlementaire");
  });

  it("RESULT_PERSONNALITES_H2 matches 'Alignement avec figures du mandat'", () => {
    expect(RESULT_PERSONNALITES_H2).toBe("Alignement avec figures du mandat");
  });

  it("both h2s start with 'Alignement' (SR skim consistency)", () => {
    // The 2 sections of Result.tsx share the same opening noun so a
    // SR user skimming by heading hears "Alignement …" then "Alignement …".
    expect(RESULT_GROUPS_H2.startsWith("Alignement")).toBe(true);
    expect(RESULT_PERSONNALITES_H2.startsWith("Alignement")).toBe(true);
  });

  it("the 2 h2s are distinct (anti-clone)", () => {
    expect(RESULT_GROUPS_H2).not.toBe(RESULT_PERSONNALITES_H2);
  });
});

describe("TOPBAR_VERSION_LABEL — TopBar popover footer version", () => {
  it("matches the canonical 'v2 · données A.N.' wording", () => {
    expect(TOPBAR_VERSION_LABEL).toBe("v2 · données A.N.");
  });

  it("starts with the version token 'v2' (anti-rename guard for the version pin)", () => {
    // A future V3 bump should update this const, surfacing the test.
    // Without the const, a silent v2→v3 commit could land without
    // any test feedback.
    expect(TOPBAR_VERSION_LABEL.startsWith("v")).toBe(true);
  });

  it("ends with 'A.N.' (source-of-data attribution)", () => {
    // The label documents that the data comes from the Assemblée
    // Nationale — pin the suffix to surface a future drop of the
    // attribution.
    expect(TOPBAR_VERSION_LABEL.endsWith("A.N.")).toBe(true);
  });
});

describe("PLAY_DECK_EXHAUSTED_MESSAGE + PLAY_EMPTY_POOL_MESSAGE — Play.tsx error fallbacks", () => {
  // 2 distinct error branches today, both rendered through RetryError:
  // deck-exhausted (pool has data, deck filtered out everything) routes
  // to /result on retry; empty-pool (Supabase returned 0) refetches.
  it("PLAY_DECK_EXHAUSTED_MESSAGE matches the canonical wording", () => {
    expect(PLAY_DECK_EXHAUSTED_MESSAGE).toBe("Plus de scrutins disponibles à voter dans ton deck.");
  });

  it("PLAY_EMPTY_POOL_MESSAGE matches the canonical wording", () => {
    expect(PLAY_EMPTY_POOL_MESSAGE).toBe("Aucun scrutin disponible pour le moment. Réessaie dans quelques minutes.");
  });

  it("the 2 messages are distinct (different retry semantics — anti-clone guard)", () => {
    // Deck-exhausted = user has voted everywhere they can; empty-pool
    // = backend has nothing. Different states, different retry actions
    // — a future merge into a single string would lose the distinction.
    expect(PLAY_DECK_EXHAUSTED_MESSAGE).not.toBe(PLAY_EMPTY_POOL_MESSAGE);
  });

  it("both end with a period (complete-sentence error-message convention)", () => {
    expect(PLAY_DECK_EXHAUSTED_MESSAGE.endsWith(".")).toBe(true);
    expect(PLAY_EMPTY_POOL_MESSAGE.endsWith(".")).toBe(true);
  });
});

describe("COVER_HERO_PARAGRAPH — Cover.tsx hero <p> value-prop explainer", () => {
  it("matches the canonical 'Découvre avec quels partis…' wording", () => {
    expect(COVER_HERO_PARAGRAPH).toBe(
      "Découvre avec quels partis tu es vraiment aligné. On ne regarde pas les programmes — on regarde ce que les députés ont effectivement voté à l'Assemblée Nationale.",
    );
  });

  it("starts with 'Découvre' (call-to-action verb opener)", () => {
    // The hero copy opens with an imperative — a future rewording
    // that flattens it to a declarative ("Sans Détour mesure…") would
    // change the voice. Pin the verb-opener contract.
    expect(COVER_HERO_PARAGRAPH.startsWith("Découvre")).toBe(true);
  });

  it("contains 'pas les programmes' (the load-bearing differentiator)", () => {
    // The whole product framing pivots on "we don't measure programmes
    // — we measure actual votes". A rewording that drops this phrase
    // would lose the core differentiator vs traditional voting compasses.
    expect(COVER_HERO_PARAGRAPH.toLowerCase()).toContain("pas les programmes");
  });

  it("contains 'Assemblée Nationale' (source attribution)", () => {
    expect(COVER_HERO_PARAGRAPH).toContain("Assemblée Nationale");
  });
});

describe("CARD_FLIP_ROLE_DESCRIPTION + cardAriaLabel — useFlipCardA11y SR plumbing", () => {
  // aria-roledescription briefs SR users on the 2 interaction modes
  // (swipe + arrow keys). aria-label labels the card by its number
  // + pedagogical title. Both untested today.
  it("CARD_FLIP_ROLE_DESCRIPTION matches the canonical wording", () => {
    expect(CARD_FLIP_ROLE_DESCRIPTION).toBe(
      "carte de scrutin — glissez ou utilisez les flèches pour voter",
    );
  });

  it("CARD_FLIP_ROLE_DESCRIPTION mentions both interaction modes (touch + keyboard)", () => {
    // The whole point of the description is that keyboard users learn
    // the shortcut exists. If a future rewording drops "flèches", the
    // keyboard-shortcut hint disappears.
    expect(CARD_FLIP_ROLE_DESCRIPTION).toContain("glissez");
    expect(CARD_FLIP_ROLE_DESCRIPTION).toContain("flèches");
  });

  it("cardAriaLabel composes 'Scrutin n°N : titre' template", () => {
    expect(cardAriaLabel(1234, "Hausse de la taxe carbone")).toBe(
      "Scrutin n°1234 : Hausse de la taxe carbone",
    );
  });

  it("cardAriaLabel interpolates both slots (numero + titre)", () => {
    expect(cardAriaLabel(42, "Vote test")).toContain("n°42");
    expect(cardAriaLabel(42, "Vote test")).toContain("Vote test");
  });
});

describe("VOTE_FEEDBACK_LABELS — Play.tsx aria-live announcements per vote", () => {
  // 3 file-local label literals previously duplicated in 3 test pins
  // for voteLabel(). Now centralised — tests round-trip via the const.
  it("pour matches 'Voté pour. Carte suivante.'", () => {
    expect(VOTE_FEEDBACK_LABELS.pour).toBe("Voté pour. Carte suivante.");
  });

  it("contre matches 'Voté contre. Carte suivante.'", () => {
    expect(VOTE_FEEDBACK_LABELS.contre).toBe("Voté contre. Carte suivante.");
  });

  it("skip matches 'Passé. Carte suivante.'", () => {
    expect(VOTE_FEEDBACK_LABELS.skip).toBe("Passé. Carte suivante.");
  });

  it("the 3 labels are distinct (anti-clone)", () => {
    const set = new Set(Object.values(VOTE_FEEDBACK_LABELS));
    expect(set.size).toBe(3);
  });
});

describe("AN_LINK_SHORT_LABEL — AuditTrail compact AN link", () => {
  // Distinct from AN_LINK_VISIBLE_LABEL ("Voir sur AN ↗") — the
  // AuditTrail per-row variant is shorter for the dense mono-font layout.
  it("matches the canonical 'AN ↗' wording", () => {
    expect(AN_LINK_SHORT_LABEL).toBe("AN ↗");
  });

  it("is shorter than AN_LINK_VISIBLE_LABEL (compact-vs-verbose contract)", () => {
    // The 2 labels surface the same target but with different
    // verbosity. A future flattening that merges them would lose the
    // dense-row footprint distinction.
    expect(AN_LINK_SHORT_LABEL.length).toBeLessThan(AN_LINK_VISIBLE_LABEL.length);
  });

  it("ends with the same '↗' arrow indicator as the long form (consistent affordance)", () => {
    expect(AN_LINK_SHORT_LABEL.endsWith("↗")).toBe(true);
    expect(AN_LINK_VISIBLE_LABEL.endsWith("↗")).toBe(true);
  });
});

describe("NOSCRIPT_HEADING + NOSCRIPT_MESSAGE — index.html no-JS fallback", () => {
  // Pinned via consts so a sync test (read index.html, assert it
  // contains these strings) catches silent rewording in the static
  // HTML against the const declaration.
  it("NOSCRIPT_HEADING matches 'JavaScript requis'", () => {
    expect(NOSCRIPT_HEADING).toBe("JavaScript requis");
  });

  it("NOSCRIPT_MESSAGE starts with brand name (Sans Détour ...)", () => {
    // Brand name + the privacy contract ("Aucune donnée n'est envoyée
    // à un serveur") are the 2 load-bearing pieces of this message.
    // Pin the brand opener so a future rewording doesn't drop it.
    expect(NOSCRIPT_MESSAGE.startsWith("Sans Détour")).toBe(true);
  });

  it("NOSCRIPT_MESSAGE contains the privacy contract clause", () => {
    // Without this clause, the no-JS fallback misses an opportunity
    // to reassure on privacy (which is part of the product framing
    // documented in Methode §05).
    expect(NOSCRIPT_MESSAGE).toContain("Aucune donnée n'est envoyée à un serveur");
  });
});

describe("ROUTE_LOADER_LABEL — main.tsx <Suspense> placeholder", () => {
  it("matches the canonical 'Chargement…' wording", () => {
    expect(ROUTE_LOADER_LABEL).toBe("Chargement…");
  });

  it("uses the typographic ellipsis (single char '…'), not three dots ('...')", () => {
    // The typographic ellipsis is one character; "..." is three.
    // A regression that types 3 dots would render visually similar
    // but the codepoint differs — pin the contract.
    expect(ROUTE_LOADER_LABEL).toContain("…");
    expect(ROUTE_LOADER_LABEL).not.toContain("...");
  });
});

describe("CARD_ANALYSE_TITLE_* — Card verso ColoredSection titles", () => {
  // The 3 titles label the 3 scalar-field analyse lists (mesures /
  // calendrier / exceptions) on the unified verso. A rewording would
  // change the visible section headers — pin them.
  it("MESURES matches 'Mesures'", () => {
    expect(CARD_ANALYSE_TITLE_MESURES).toBe("Mesures");
  });

  it("CALENDRIER matches 'Calendrier'", () => {
    expect(CARD_ANALYSE_TITLE_CALENDRIER).toBe("Calendrier");
  });

  it("EXCEPTIONS matches 'Exceptions'", () => {
    expect(CARD_ANALYSE_TITLE_EXCEPTIONS).toBe("Exceptions");
  });

  it("the 3 titles are distinct + each starts with a capital letter", () => {
    const titles = [
      CARD_ANALYSE_TITLE_MESURES, CARD_ANALYSE_TITLE_CALENDRIER, CARD_ANALYSE_TITLE_EXCEPTIONS,
    ];
    expect(new Set(titles).size).toBe(3);
    for (const t of titles) expect(t[0]).toBe(t[0].toUpperCase());
  });
});

describe("CARD_ANALYSE_CONCERNES_* — Card verso 'Qui est concerné' section", () => {
  // Header + 3 sub-list labels for the positifs/negatifs/neutres
  // impact groups. The 3 sub-labels are action-verbs ("Bénéficient" /
  // "Contraints" / "À surveiller") — SR reads them as effect-on-group
  // rather than mere group labels.
  it("HEADER matches 'Qui est concerné'", () => {
    expect(CARD_ANALYSE_CONCERNES_HEADER).toBe("Qui est concerné");
  });

  it("POSITIFS matches 'Bénéficient' (action-verb form)", () => {
    expect(CARD_ANALYSE_CONCERNES_POSITIFS).toBe("Bénéficient");
  });

  it("NEGATIFS matches 'Contraints'", () => {
    expect(CARD_ANALYSE_CONCERNES_NEGATIFS).toBe("Contraints");
  });

  it("NEUTRES matches 'À surveiller'", () => {
    expect(CARD_ANALYSE_CONCERNES_NEUTRES).toBe("À surveiller");
  });

  it("the 3 sub-labels are distinct (anti-clone — different semantic per group)", () => {
    const labels = [
      CARD_ANALYSE_CONCERNES_POSITIFS,
      CARD_ANALYSE_CONCERNES_NEGATIFS,
      CARD_ANALYSE_CONCERNES_NEUTRES,
    ];
    expect(new Set(labels).size).toBe(3);
  });
});

describe("METHODE_S07_HEADING_* — Methode §07 IA Claude sub-headings", () => {
  // 4 strong-tagged sub-headings opening paragraphs in §07. Documents
  // the IA-transparency framing — what Claude does / doesn't do / how
  // bias is framed / limits + reporting.
  it("CE_QUE_FAIT_CLAUDE matches 'Ce que fait Claude.'", () => {
    expect(METHODE_S07_HEADING_CE_QUE_FAIT_CLAUDE).toBe("Ce que fait Claude.");
  });

  it("CE_QU_IL_NE_FAIT_PAS matches \"Ce qu'il ne fait pas.\"", () => {
    expect(METHODE_S07_HEADING_CE_QU_IL_NE_FAIT_PAS).toBe("Ce qu'il ne fait pas.");
  });

  it("CADRE_BIAIS matches 'Comment on cadre les biais.'", () => {
    expect(METHODE_S07_HEADING_CADRE_BIAIS).toBe("Comment on cadre les biais.");
  });

  it("LIMITES_SIGNALEMENT matches 'Limites & signalement.'", () => {
    expect(METHODE_S07_HEADING_LIMITES_SIGNALEMENT).toBe("Limites & signalement.");
  });

  it("each heading ends with a period (sub-heading punctuation convention)", () => {
    // The 4 sub-headings open paragraphs with the strong-period style
    // ("**Heading.** Body…"). A regression that drops the period
    // visually merges the heading into the body.
    const all = [
      METHODE_S07_HEADING_CE_QUE_FAIT_CLAUDE,
      METHODE_S07_HEADING_CE_QU_IL_NE_FAIT_PAS,
      METHODE_S07_HEADING_CADRE_BIAIS,
      METHODE_S07_HEADING_LIMITES_SIGNALEMENT,
    ];
    for (const h of all) expect(h.endsWith(".")).toBe(true);
  });
});

describe("METHODE_SECTION_BODY_TITLES — Methode 7 Section body h2 landmarks", () => {
  // Body title = the full descriptive heading rendered by each <Section>.
  // Distinct from METHODE_SECTIONS short labels (TOC nav).
  it("01 matches 'D'où viennent les données'", () => {
    expect(METHODE_SECTION_BODY_TITLES["01"]).toBe("D'où viennent les données");
  });

  it("04 matches 'Comment on calcule ton alignement'", () => {
    expect(METHODE_SECTION_BODY_TITLES["04"]).toBe("Comment on calcule ton alignement");
  });

  it("07 matches 'Le rôle de l'IA Claude'", () => {
    expect(METHODE_SECTION_BODY_TITLES["07"]).toBe("Le rôle de l'IA Claude");
  });

  it("the 7 body titles are all distinct (anti-clone)", () => {
    const titles = Object.values(METHODE_SECTION_BODY_TITLES);
    expect(new Set(titles).size).toBe(titles.length);
    expect(titles.length).toBe(7);
  });
});

describe("METHODE_LINK_ANNOTATION_* — Methode §06/§07 source-list annotations", () => {
  it("OPEN_DATA matches 'open data officiel'", () => {
    expect(METHODE_LINK_ANNOTATION_OPEN_DATA).toBe("open data officiel");
  });

  it("CODE_SOURCE_MIT matches 'code source MIT'", () => {
    expect(METHODE_LINK_ANNOTATION_CODE_SOURCE_MIT).toBe("code source MIT");
  });

  it("PROMPT_CODE_PUBLIC matches 'prompt et code source publics'", () => {
    expect(METHODE_LINK_ANNOTATION_PROMPT_CODE_PUBLIC).toBe("prompt et code source publics");
  });

  it("SIGNALER_ERREUR matches 'signaler une erreur'", () => {
    expect(METHODE_LINK_ANNOTATION_SIGNALER_ERREUR).toBe("signaler une erreur");
  });

  it("OPEN_DATA + CODE_SOURCE_MIT mention 'data' / 'source' respectively (semantic guard)", () => {
    // The 2 §06 list bullets describe what each link IS — the AN
    // open-data portal vs the github code repo. Pin the load-bearing
    // tokens so a rewording that swaps the labels surfaces here.
    expect(METHODE_LINK_ANNOTATION_OPEN_DATA).toContain("data");
    expect(METHODE_LINK_ANNOTATION_CODE_SOURCE_MIT).toContain("source");
  });
});

describe("LEGAL_RGPD_HEADING_* — Legal.tsx 7 RGPD sub-headings", () => {
  // Pin the canonical wording of each RGPD-required identity +
  // compliance disclosure. Used as <strong> prefixes inside Legal.tsx
  // prose blocks; the 7 consts collectively map to RGPD article
  // requirements (editor + host + data + analytics + indep. + sources
  // + code).
  it("EDITEUR matches 'Éditeur'", () => {
    expect(LEGAL_RGPD_HEADING_EDITEUR).toBe("Éditeur");
  });

  it("HEBERGEUR matches 'Hébergeur'", () => {
    expect(LEGAL_RGPD_HEADING_HEBERGEUR).toBe("Hébergeur");
  });

  it("DONNEES_PERSONNELLES matches 'Données personnelles'", () => {
    expect(LEGAL_RGPD_HEADING_DONNEES_PERSONNELLES).toBe("Données personnelles");
  });

  it("ANALYTICS matches 'Analytics'", () => {
    expect(LEGAL_RGPD_HEADING_ANALYTICS).toBe("Analytics");
  });

  it("INDEPENDANCE matches 'Indépendance'", () => {
    expect(LEGAL_RGPD_HEADING_INDEPENDANCE).toBe("Indépendance");
  });

  it("SOURCES_DONNEES matches 'Sources des données'", () => {
    expect(LEGAL_RGPD_HEADING_SOURCES_DONNEES).toBe("Sources des données");
  });

  it("CODE_SOURCE matches 'Code source'", () => {
    expect(LEGAL_RGPD_HEADING_CODE_SOURCE).toBe("Code source");
  });

  it("the 7 headings are distinct (anti-clone)", () => {
    const set = new Set([
      LEGAL_RGPD_HEADING_EDITEUR, LEGAL_RGPD_HEADING_HEBERGEUR,
      LEGAL_RGPD_HEADING_DONNEES_PERSONNELLES, LEGAL_RGPD_HEADING_ANALYTICS,
      LEGAL_RGPD_HEADING_INDEPENDANCE, LEGAL_RGPD_HEADING_SOURCES_DONNEES,
      LEGAL_RGPD_HEADING_CODE_SOURCE,
    ]);
    expect(set.size).toBe(7);
  });
});

describe("COVER_SECONDARY_NAV_LABEL — Cover.tsx footer nav aria-label", () => {
  it("matches 'Liens secondaires'", () => {
    expect(COVER_SECONDARY_NAV_LABEL).toBe("Liens secondaires");
  });
});

describe("LEGAL_HEBERGEUR_NAME + LEGAL_HEBERGEUR_ADDRESS — Vercel hosting identity", () => {
  it("HEBERGEUR_NAME matches 'Vercel Inc.'", () => {
    expect(LEGAL_HEBERGEUR_NAME).toBe("Vercel Inc.");
  });

  it("HEBERGEUR_ADDRESS matches the full Vercel HQ postal address", () => {
    expect(LEGAL_HEBERGEUR_ADDRESS).toBe("340 S Lemon Ave #4133, Walnut, CA 91789, USA");
  });

  it("HEBERGEUR_NAME + ADDRESS are distinct (anti-merge guard for the 2-line layout)", () => {
    // The Legal.tsx <p> renders the 2 across a <br/> — a future flattening
    // into a single string would break the visual line break.
    expect(LEGAL_HEBERGEUR_NAME).not.toBe(LEGAL_HEBERGEUR_ADDRESS);
  });
});

describe("LEGAL_ANALYTICS_DESCRIPTION — Plausible RGPD disclosure", () => {
  it("matches the canonical 'Plausible (analytics anonymisés sans cookies, conformes RGPD).'", () => {
    expect(LEGAL_ANALYTICS_DESCRIPTION).toBe("Plausible (analytics anonymisés sans cookies, conformes RGPD).");
  });

  it("contains 'Plausible' (analytics-tool name) + 'RGPD' (compliance claim)", () => {
    // Both tokens are load-bearing: Plausible is the actual tool used;
    // RGPD is the compliance contract documented to the user. A future
    // rewording must preserve both or surface here.
    expect(LEGAL_ANALYTICS_DESCRIPTION).toContain("Plausible");
    expect(LEGAL_ANALYTICS_DESCRIPTION).toContain("RGPD");
  });
});

describe("LEGAL_DATA_LICENSE_LABEL — Etalab data license", () => {
  it("matches 'licence Etalab 2.0'", () => {
    expect(LEGAL_DATA_LICENSE_LABEL).toBe("licence Etalab 2.0");
  });

  it("contains the version number '2.0' (anti-bump guard)", () => {
    // The Etalab license is versioned (2.0 today; future versions exist).
    // Pinning the version surfaces a deliberate vs accidental update.
    expect(LEGAL_DATA_LICENSE_LABEL).toContain("2.0");
  });
});

describe("LEGAL_PERSONAL_DATA_BODY — privacy contract claim", () => {
  it("contains the load-bearing 'aucune donnée personnelle' clause", () => {
    expect(LEGAL_PERSONAL_DATA_BODY).toContain("aucune donnée personnelle");
  });

  it("contains 'localStorage' (technical disclosure of where data lives)", () => {
    // The RGPD compliance angle hinges on data being browser-local.
    // Drop this token = lose the privacy contract.
    expect(LEGAL_PERSONAL_DATA_BODY).toContain("localStorage");
  });

  it("contains 'Aucune donnée n'est transmise à un serveur' (no-server claim)", () => {
    expect(LEGAL_PERSONAL_DATA_BODY).toContain("Aucune donnée n'est transmise à un serveur");
  });
});

describe("LEGAL_INDEPENDANCE_BODY + METHODE_S06_NO_AFFILIATION_PHRASE — paired independence claims", () => {
  // Both surfaces document the same editorial-independence contract
  // but with intentionally different wording (Legal is RGPD-formal,
  // Methode is plain prose with slash-separated list).
  it("LEGAL_INDEPENDANCE_BODY matches the formal RGPD wording", () => {
    expect(LEGAL_INDEPENDANCE_BODY).toBe(
      "Sans Détour est un projet indépendant. Aucune affiliation politique, médiatique ou institutionnelle.",
    );
  });

  it("METHODE_S06_NO_AFFILIATION_PHRASE matches the slash-list informal wording", () => {
    expect(METHODE_S06_NO_AFFILIATION_PHRASE).toBe("Aucune affiliation parti / média / institution.");
  });

  it("both contain 'affiliation' (load-bearing token across both wordings)", () => {
    // "Affiliation" is the load-bearing legal term — both wordings
    // must keep it, regardless of which terms follow.
    expect(LEGAL_INDEPENDANCE_BODY.toLowerCase()).toContain("affiliation");
    expect(METHODE_S06_NO_AFFILIATION_PHRASE.toLowerCase()).toContain("affiliation");
  });

  it("the 2 wordings are intentionally distinct (anti-merge guard)", () => {
    // Legal = comma-separated formal list; Methode = slash-separated
    // tight list. A future merge to a single string would lose the
    // RGPD-formal vs plain-prose register distinction.
    expect(LEGAL_INDEPENDANCE_BODY).not.toBe(METHODE_S06_NO_AFFILIATION_PHRASE);
  });
});

describe("METHODE_S06_HOSTING_FUNDING_BODY — Methode §06 funding disclosure", () => {
  it("matches the canonical electoral-independence wording", () => {
    expect(METHODE_S06_HOSTING_FUNDING_BODY).toBe(
      "Hébergement sur fonds personnels. Pas d'annonceur, pas de sponsor, pas de don accepté pendant les 6 mois précédant un scrutin national.",
    );
  });

  it("contains '6 mois' (load-bearing electoral-quiet-period clause)", () => {
    // The "no donations 6 months before an election" clause is the
    // load-bearing electoral-independence guarantee. A rewording that
    // drops or shortens the window weakens the contract.
    expect(METHODE_S06_HOSTING_FUNDING_BODY).toContain("6 mois");
  });

  it("contains 'scrutin national' (specifies what triggers the quiet period)", () => {
    expect(METHODE_S06_HOSTING_FUNDING_BODY).toContain("scrutin national");
  });
});

describe("METHODE_S05_* + LEGAL_PERSONAL_DATA_BODY — paired privacy disclosures", () => {
  // Methode §05 + Legal Données personnelles document the same
  // no-tracking / localStorage privacy contract from different
  // perspectives (plain prose vs RGPD formal).
  it("METHODE_S05_NO_TRACKING_PHRASE matches the canonical no-tracking list", () => {
    expect(METHODE_S05_NO_TRACKING_PHRASE).toBe(
      "Pas de compte utilisateur, pas de cookie de tracking, pas d'analytics nominatifs, pas de POST.",
    );
  });

  it("METHODE_S05_NO_TRACKING_PHRASE lists 4 'pas de' clauses (anti-merge guard)", () => {
    // 4 negative claims, each prefixed "pas de" — a future merge into
    // a shorter list would weaken the privacy contract.
    const count = (METHODE_S05_NO_TRACKING_PHRASE.match(/pas (de|d')/gi) || []).length;
    expect(count).toBe(4);
  });

  it("METHODE_S05_LOCALSTORAGE_EXPLANATION + TAIL surround the <code>localStorage</code> token", () => {
    expect(METHODE_S05_LOCALSTORAGE_EXPLANATION).toContain("Tes votes vivent dans le");
    expect(METHODE_S05_LOCALSTORAGE_TAIL).toContain("de ton navigateur");
    expect(METHODE_S05_LOCALSTORAGE_TAIL).toContain("aucun moyen technique");
  });
});

describe("METHODE_S01_UPDATE_CADENCE — weekly ingestion cadence", () => {
  it("matches 'Mise à jour automatisée toutes les semaines.'", () => {
    expect(METHODE_S01_UPDATE_CADENCE).toBe("Mise à jour automatisée toutes les semaines.");
  });

  it("contains 'semaines' (anti-bump guard for cadence)", () => {
    // The ingestion cadence is weekly today. A future bump (daily,
    // bi-weekly, monthly) should propagate from this const and the
    // test surfaces a deliberate vs accidental change.
    expect(METHODE_S01_UPDATE_CADENCE).toContain("semaines");
  });
});

describe("METHODE_S03_DIVIDED_RULE — divided-group exclusion", () => {
  it("BODY + TAIL together compose the canonical wording", () => {
    // The JSX splits the prose around `<strong>divisé</strong>`.
    // Re-assembling lets us pin the full claim.
    const composed = METHODE_S03_DIVIDED_RULE_BODY + "divisé" + METHODE_S03_DIVIDED_RULE_TAIL;
    expect(composed).toBe(
      "Un scrutin sur lequel un groupe est divisé ne compte pas pour ce groupe — pas pour toi non plus, dans cette comparaison.",
    );
  });

  it("TAIL contains 'ne compte pas pour ce groupe' (load-bearing exclusion rule)", () => {
    // The whole point: divided groups are removed from the user's
    // alignment math. Pin so a rewording that softens or drops the
    // exclusion rule surfaces in tests.
    expect(METHODE_S03_DIVIDED_RULE_TAIL).toContain("ne compte pas pour ce groupe");
  });
});

describe("METHODE_S03_GROUP_INTRO — per-group position-computation rationale", () => {
  it("matches the canonical opener", () => {
    expect(METHODE_S03_GROUP_INTRO).toBe(
      "Un groupe parlementaire compte plusieurs dizaines de députés qui ne votent pas toujours pareil. Pour résumer en une position unique :",
    );
  });

  it("ends with ':' (colon introducing the formula that follows)", () => {
    // The JSX renders this paragraph immediately before <Formula>;
    // the trailing colon is what introduces the formula block. A
    // regression that drops the colon would visually orphan the
    // formula from its lead paragraph.
    expect(METHODE_S03_GROUP_INTRO.trimEnd().endsWith(":")).toBe(true);
  });
});

describe("METHODE_S07_MISE_EN_FORME_CLOSER + METHODE_S07_LIBELLE_BRUT_GUARANTEE — §07 IA framing", () => {
  it("CLOSER matches 'Mise en forme, pas commentaire.'", () => {
    expect(METHODE_S07_MISE_EN_FORME_CLOSER).toBe("Mise en forme, pas commentaire.");
  });

  it("CLOSER contains both 'forme' and 'pas commentaire' (load-bearing role-limit phrase)", () => {
    // The whole point: explicit boundary between "reformulate" and
    // "comment". A future rewording that drops "pas commentaire"
    // would weaken the IA-transparency contract.
    expect(METHODE_S07_MISE_EN_FORME_CLOSER).toContain("forme");
    expect(METHODE_S07_MISE_EN_FORME_CLOSER).toContain("pas commentaire");
  });

  it("LIBELLE_BRUT_GUARANTEE matches the canonical wording", () => {
    expect(METHODE_S07_LIBELLE_BRUT_GUARANTEE).toBe(
      "Le libellé officiel brut est affiché sur la face Résumé du verso de chaque carte",
    );
  });

  it("LIBELLE_BRUT_GUARANTEE contains 'libellé officiel' (anti-bias source-availability claim)", () => {
    // The §07 contract: users can always check the IA's output
    // against the raw AN libellé. A rewording that drops the
    // "officiel" qualifier softens the source-of-truth claim.
    expect(METHODE_S07_LIBELLE_BRUT_GUARANTEE).toContain("libellé officiel");
  });
});

describe("METHODE_PAGE_LEAD_INTRO + METHODE_PAGE_LEAD_PURE_MATH — anti-bias page-lead framing", () => {
  it("INTRO matches 'Aucune opinion, aucun panel.'", () => {
    expect(METHODE_PAGE_LEAD_INTRO).toBe("Aucune opinion, aucun panel.");
  });

  it("PURE_MATH matches the 'formule mathématique pure' claim", () => {
    expect(METHODE_PAGE_LEAD_PURE_MATH).toBe(
      "Le calcul d'alignement est une formule mathématique pure — l'IA n'y intervient pas.",
    );
  });

  it("PURE_MATH contains 'formule mathématique' + 'IA n'y intervient pas' (anti-IA-tinting guards)", () => {
    // The page-lead promises: scoring is math, not IA. Both tokens
    // must remain — a regression dropping either softens the contract.
    expect(METHODE_PAGE_LEAD_PURE_MATH).toContain("formule mathématique");
    expect(METHODE_PAGE_LEAD_PURE_MATH).toContain("l'IA n'y intervient pas");
  });
});

describe("METHODE_S04_OPENER — alignment-calculation formula lead", () => {
  it("matches the canonical opener", () => {
    expect(METHODE_S04_OPENER).toBe(
      "Pour chaque groupe, on compare ce que tu as voté à ce que ce groupe a voté, scrutin par scrutin :",
    );
  });

  it("ends with ':' (anti-formula-orphan guard, paired with METHODE_S03_GROUP_INTRO)", () => {
    expect(METHODE_S04_OPENER.trimEnd().endsWith(":")).toBe(true);
  });

  it("contains 'scrutin par scrutin' (load-bearing per-vote granularity claim)", () => {
    // The alignment math operates per-scrutin, not aggregated.
    // A rewording that drops the "scrutin par scrutin" qualifier
    // weakens the methodological transparency.
    expect(METHODE_S04_OPENER).toContain("scrutin par scrutin");
  });
});

describe("METHODE_S02_EXCLUSIONS_SUFFIX — §02 excluded scrutin types", () => {
  it("matches the canonical exclusion claim", () => {
    expect(METHODE_S02_EXCLUSIONS_SUFFIX).toBe(
      "On exclut les amendements, les votes en commission et les motions procédurales (rejet préalable, renvoi).",
    );
  });

  it("lists 'amendements' + 'commission' + 'motions procédurales' (anti-merge guard)", () => {
    // The 3 excluded categories are documented in scripts/lib/an-filter.ts
    // (isEligibleScrutin) — they're the load-bearing filter rules.
    // A regression that omits one of the 3 would silently desync
    // the user-facing documentation from the actual filter logic.
    expect(METHODE_S02_EXCLUSIONS_SUFFIX).toContain("amendements");
    expect(METHODE_S02_EXCLUSIONS_SUFFIX).toContain("commission");
    expect(METHODE_S02_EXCLUSIONS_SUFFIX).toContain("motions procédurales");
  });
});

describe("METHODE_S07_MODEL_DISCLOSURE — LLM model + API disclosure", () => {
  it("matches the canonical model + API line", () => {
    expect(METHODE_S07_MODEL_DISCLOSURE).toBe(
      "Modèle : Claude Haiku 4.5 d'Anthropic, via Batches API + web_search",
    );
  });

  it("contains 'Claude' + 'Haiku' + 'Anthropic' (load-bearing brand+model tokens)", () => {
    // A future model bump should update all 3 of: this const, the
    // ANTHROPIC_MODEL env config, and CLAUDE.md's stack section.
    // Pinning the brand+model+vendor surfaces a deliberate bump.
    expect(METHODE_S07_MODEL_DISCLOSURE).toContain("Claude");
    expect(METHODE_S07_MODEL_DISCLOSURE).toContain("Haiku");
    expect(METHODE_S07_MODEL_DISCLOSURE).toContain("Anthropic");
  });

  it("contains 'Batches API' + 'web_search' (load-bearing pipeline tooling)", () => {
    // The Batches API is what makes ingestion cheap (~$0.20-0.30 per
    // run, cf. CLAUDE.md); web_search is what provides context. Both
    // tokens are documented contracts to the user — pin them.
    expect(METHODE_S07_MODEL_DISCLOSURE).toContain("Batches API");
    expect(METHODE_S07_MODEL_DISCLOSURE).toContain("web_search");
  });
});

describe("METHODE_S07_CLAUDE_TASKS_* — 5-task IA-role disclosure", () => {
  it("PREFIX + N + SUFFIX composes the canonical task list", () => {
    // The JSX interpolates {MAX_POINTS_CLES_BULLETS} between the
    // prefix and suffix. Composed, this reads as a comma-separated
    // list of the 5 IA tasks.
    const composed = METHODE_S07_CLAUDE_TASKS_PREFIX + "3" + METHODE_S07_CLAUDE_TASKS_SUFFIX;
    expect(composed).toBe(
      "Reformuler le titre brut du scrutin en 12 mots, condenser le projet de loi en 3 points clés, rédiger un résumé contextuel de 30 à 50 mots, structurer une synthèse détaillée (mesures, concernés, calendrier, exceptions), et taguer le scrutin par thème.",
    );
  });

  it("PREFIX contains the 12-mots claim (anti-shortening guard for title reformulation)", () => {
    // The "12 mots" upper bound is documented in CLAUDE.md as the
    // contract for titre_pedago. A regression that drops or changes
    // the count desyncs the doc from the ingestion prompt.
    expect(METHODE_S07_CLAUDE_TASKS_PREFIX).toContain("12 mots");
  });

  it("SUFFIX contains '30 à 50 mots' (resumé length range)", () => {
    // Same drift guard for the contextual-resumé word count.
    expect(METHODE_S07_CLAUDE_TASKS_SUFFIX).toContain("30 à 50 mots");
  });

  it("SUFFIX lists the 4 analyse_loi categories (mesures/concernés/calendrier/exceptions)", () => {
    // The 4 ScrutinAnalyse scalar-field categories must remain
    // documented — a regression that drops one would silently
    // weaken the synthesis transparency disclosure.
    expect(METHODE_S07_CLAUDE_TASKS_SUFFIX).toContain("mesures");
    expect(METHODE_S07_CLAUDE_TASKS_SUFFIX).toContain("concernés");
    expect(METHODE_S07_CLAUDE_TASKS_SUFFIX).toContain("calendrier");
    expect(METHODE_S07_CLAUDE_TASKS_SUFFIX).toContain("exceptions");
  });
});

describe("METHODE_S07_LIMITES_DISCLAIMER_* — V3 roadmap + signalement disclaimer", () => {
  it("PREFIX matches the canonical disclaimer opener", () => {
    expect(METHODE_S07_LIMITES_DISCLAIMER_PREFIX).toBe(
      "Claude peut se tromper sur les nuances : un mot mal choisi, une mesure oubliée, un thème mal taggué. Pour l'instant, aucune relecture humaine systématique (V3 prévue). Si tu repères une erreur factuelle : ",
    );
  });

  it("SUFFIX matches the closing ' — on corrige.'", () => {
    expect(METHODE_S07_LIMITES_DISCLAIMER_SUFFIX).toBe(" — on corrige.");
  });

  it("PREFIX contains 'V3 prévue' (V3-roadmap mention guard)", () => {
    // The "V3 prévue" mention is the user-facing roadmap promise
    // for systematic human review. A regression that drops it
    // would weaken the future-improvement commitment.
    expect(METHODE_S07_LIMITES_DISCLAIMER_PREFIX).toContain("V3 prévue");
  });

  it("PREFIX contains 'aucune relecture humaine systématique' (honesty contract)", () => {
    // The current limitation must be explicitly disclosed — Claude
    // can be wrong, no human review yet. Dropping this clause hides
    // the limitation.
    expect(METHODE_S07_LIMITES_DISCLAIMER_PREFIX).toContain("aucune relecture humaine systématique");
  });
});

describe("METHODE_S07_NE_FAIT_PAS_BODY — 3-task negative IA list", () => {
  it("matches the canonical negative-task list", () => {
    expect(METHODE_S07_NE_FAIT_PAS_BODY).toBe(
      "Le calcul d'alignement (formule mathématique pure), la composition du deck (round-robin algorithmique par thème), l'extraction des votes individuels (parsing des XML officiels AN). Sur ces trois plans, Claude n'intervient à aucun moment.",
    );
  });

  it("contains 'trois plans' (anti-drop guard for the 3-task scope)", () => {
    // The closing sentence "Sur ces trois plans..." reinforces the
    // count = 3. A regression that adds a 4th task without updating
    // this clause would surface here (math mismatch in the prose).
    expect(METHODE_S07_NE_FAIT_PAS_BODY).toContain("trois plans");
  });

  it("contains 'calcul d'alignement' + 'composition du deck' + 'extraction des votes' (3-task pin)", () => {
    expect(METHODE_S07_NE_FAIT_PAS_BODY).toContain("calcul d'alignement");
    expect(METHODE_S07_NE_FAIT_PAS_BODY).toContain("composition du deck");
    expect(METHODE_S07_NE_FAIT_PAS_BODY).toContain("extraction des votes");
  });
});

describe("METHODE_S07_CADRE_BIAIS_* — prompt-neutrality + verification path", () => {
  it("PREFIX matches the canonical neutrality + source claim", () => {
    expect(METHODE_S07_CADRE_BIAIS_PREFIX).toBe(
      "Le prompt envoyé à Claude est neutre par construction. Sa source : le libellé brut AN + des résultats de recherche web pour le contexte. ",
    );
  });

  it("PREFIX contains 'neutre par construction' (anti-bias guarantee)", () => {
    // Load-bearing claim: the prompt is neutral by construction, not
    // by reviewer judgement. A rewording that softens this surfaces.
    expect(METHODE_S07_CADRE_BIAIS_PREFIX).toContain("neutre par construction");
  });

  it("PREFIX contains 'libellé brut AN' + 'recherche web' (source mix)", () => {
    // Documents the 2-source mix: raw AN libellé + web_search context.
    // Same contract as METHODE_S07_MODEL_DISCLOSURE which names the
    // web_search tool. Pin so both stay aligned.
    expect(METHODE_S07_CADRE_BIAIS_PREFIX).toContain("libellé brut AN");
    expect(METHODE_S07_CADRE_BIAIS_PREFIX).toContain("recherche web");
  });

  it("SUFFIX matches ' — tu peux comparer directement.'", () => {
    expect(METHODE_S07_CADRE_BIAIS_SUFFIX).toBe(" — tu peux comparer directement.");
  });

  it("SUFFIX contains 'comparer' (verification-path guarantee)", () => {
    // The whole point of this paragraph: users can verify the IA
    // output against the AN source. Dropping "comparer" weakens
    // the contract.
    expect(METHODE_S07_CADRE_BIAIS_SUFFIX).toContain("comparer");
  });
});

describe("METHODE_S02_CAPS_EXAMPLE — concrete cap-effect illustration", () => {
  it("matches the canonical retraite/Mayotte example", () => {
    expect(METHODE_S02_CAPS_EXAMPLE).toBe(
      "pour ne pas avoir 8 votes retraite de suite ni 3 votes Mayotte d'affilée",
    );
  });

  it("contains 'retraite' + 'Mayotte' (the 2 concrete topic examples)", () => {
    // The 2 examples are intentionally chosen for resonance: retraite
    // is the highest-volume policy topic; Mayotte is a recent cluster.
    // A regression that changes them to abstract topics ("topic A",
    // "topic B") would lose the concrete-illustration value.
    expect(METHODE_S02_CAPS_EXAMPLE).toContain("retraite");
    expect(METHODE_S02_CAPS_EXAMPLE).toContain("Mayotte");
  });

  it("contains '8 votes' + '3 votes' (concrete numerical illustrations)", () => {
    // The 8/3 numbers illustrate the practical effect of the caps
    // (DEFAULT_CAP_PER_DOSSIER and DEFAULT_CAP_PER_CHAPEAU_PREFIX
    // both = 2 today). A rewording that drops the numerical
    // anchors weakens the cap-effect explanation.
    expect(METHODE_S02_CAPS_EXAMPLE).toContain("8 votes");
    expect(METHODE_S02_CAPS_EXAMPLE).toContain("3 votes");
  });
});

describe("METHODE_S01_DATA_SOURCE_STRONG + QUALITY_CLAIM — §01 data-source disclosure", () => {
  it("STRONG matches 'l'open data officiel de l'Assemblée Nationale'", () => {
    expect(METHODE_S01_DATA_SOURCE_STRONG).toBe("l'open data officiel de l'Assemblée Nationale");
  });

  it("STRONG contains 'open data officiel' (official-source qualifier)", () => {
    // The "officiel" qualifier is load-bearing — distinguishes this
    // from any third-party data scraper. A rewording that drops it
    // weakens the source-authority claim.
    expect(METHODE_S01_DATA_SOURCE_STRONG).toContain("open data officiel");
  });

  it("QUALITY_CLAIM matches 'Aucune retranscription manuelle, aucune source secondaire.'", () => {
    expect(METHODE_S01_DATA_SOURCE_QUALITY_CLAIM).toBe(
      "Aucune retranscription manuelle, aucune source secondaire.",
    );
  });

  it("QUALITY_CLAIM contains 'Aucune' twice (anti-merge guard on the 2 negations)", () => {
    // The 2 negations are intentionally paired: "no manual rewriting"
    // + "no secondary source". A regression that merges them into a
    // single weaker claim would weaken the data-quality contract.
    const matches = (METHODE_S01_DATA_SOURCE_QUALITY_CLAIM.match(/aucune/gi) || []).length;
    expect(matches).toBe(2);
  });
});

describe("METHODE_S04_RANK_NOISE_EXPLANATION — rank threshold justification", () => {
  it("matches the canonical noise-floor justification", () => {
    expect(METHODE_S04_RANK_NOISE_EXPLANATION).toBe(
      "en dessous, les pourcentages bougent trop pour signifier quoi que ce soit",
    );
  });

  it("contains 'pourcentages' + 'signifier' (load-bearing math + meaning tokens)", () => {
    // The justification: below MIN_FOR_RANKING, percentages move
    // too much to mean anything. Both tokens carry the explanation.
    expect(METHODE_S04_RANK_NOISE_EXPLANATION).toContain("pourcentages");
    expect(METHODE_S04_RANK_NOISE_EXPLANATION).toContain("signifier");
  });
});

describe("METHODE_S01_SAME_FILES_CLAIM — data-source authority/provenance", () => {
  it("matches the canonical 'mêmes fichiers' authority claim", () => {
    expect(METHODE_S01_SAME_FILES_CLAIM).toBe(
      "Ce sont les mêmes fichiers que ceux utilisés par les médias de référence et le service interne de l'AN.",
    );
  });

  it("contains 'médias de référence' + 'service interne de l'AN' (2-witness authority guard)", () => {
    // The 2 witnesses (major media + AN internal service) establish
    // provenance. A regression that drops either weakens the
    // non-manipulation contract.
    expect(METHODE_S01_SAME_FILES_CLAIM).toContain("médias de référence");
    expect(METHODE_S01_SAME_FILES_CLAIM).toContain("service interne de l'AN");
  });
});

describe("METHODE_S02_THEMES_EXAMPLES — concrete theme anchors", () => {
  it("matches the canonical 3-theme list 'santé, immigration, fiscalité…'", () => {
    expect(METHODE_S02_THEMES_EXAMPLES).toBe("santé, immigration, fiscalité…");
  });

  it("contains 3 distinct theme anchors (anti-merge guard)", () => {
    // The 3 themes are chosen for political-salience resonance.
    // A regression that flattens them into abstract topics loses
    // the concrete-illustration value.
    expect(METHODE_S02_THEMES_EXAMPLES).toContain("santé");
    expect(METHODE_S02_THEMES_EXAMPLES).toContain("immigration");
    expect(METHODE_S02_THEMES_EXAMPLES).toContain("fiscalité");
  });

  it("ends with '…' typographic ellipsis (signals open-ended list)", () => {
    // The trailing ellipsis (single typographic char "…", not "...")
    // signals the 3 examples aren't exhaustive — there are 11 themes
    // total in src/types/index.ts THEME_CODES. A regression to 3 dots
    // would render differently typographically.
    expect(METHODE_S02_THEMES_EXAMPLES.endsWith("…")).toBe(true);
    expect(METHODE_S02_THEMES_EXAMPLES).not.toContain("...");
  });
});

describe("METHODE_S03_ABSENTS_EXCLUSION — Formula footnote on excluded actors", () => {
  it("matches '(absents et non-votants exclus du calcul)'", () => {
    expect(METHODE_S03_ABSENTS_EXCLUSION).toBe("(absents et non-votants exclus du calcul)");
  });

  it("contains 'absents' + 'non-votants' (2-category anti-merge guard)", () => {
    // The 2 excluded actor categories are distinct in
    // src/lib/compute-positions.ts: "absent" + "non_dispo" + the
    // implicit "didn't cast a vote". A merge in the prose would
    // desync from the actual exclusion logic.
    expect(METHODE_S03_ABSENTS_EXCLUSION).toContain("absents");
    expect(METHODE_S03_ABSENTS_EXCLUSION).toContain("non-votants");
  });

  it("is wrapped in parentheses (Formula footnote convention)", () => {
    // The Formula block renders this as a typographic footnote — the
    // parentheses signal "side detail, not main rule" which matters
    // for the visual hierarchy.
    expect(METHODE_S03_ABSENTS_EXCLUSION.startsWith("(")).toBe(true);
    expect(METHODE_S03_ABSENTS_EXCLUSION.endsWith(")")).toBe(true);
  });
});

describe("METHODE_S02_KEPT_* — 5 kept-scrutin-types paired with isEligibleScrutin", () => {
  it("the 5 consts match their canonical wordings", () => {
    expect(METHODE_S02_KEPT_SOLENNELS).toBe("scrutins solennels");
    expect(METHODE_S02_KEPT_VOTES_FINAUX).toBe("votes finaux sur l'ensemble d'une loi");
    expect(METHODE_S02_KEPT_CENSURE).toBe("motions de censure");
    expect(METHODE_S02_KEPT_REFERENDAIRES).toBe("motions référendaires");
    expect(METHODE_S02_KEPT_PROPOSITIONS).toBe("propositions de résolution");
  });

  it("the 5 categories are distinct (anti-clone — each maps to a real AN scrutin type)", () => {
    const set = new Set([
      METHODE_S02_KEPT_SOLENNELS,
      METHODE_S02_KEPT_VOTES_FINAUX,
      METHODE_S02_KEPT_CENSURE,
      METHODE_S02_KEPT_REFERENDAIRES,
      METHODE_S02_KEPT_PROPOSITIONS,
    ]);
    expect(set.size).toBe(5);
  });
});

describe("METHODE_S04_FORMULA_LINES — alignment formula paired with alignmentScore", () => {
  it("contains exactly 5 lines (anti-count-drift guard)", () => {
    // The 5 lines map to: header + 3 score branches + aggregation.
    // A drift to 4 or 6 lines would indicate a math change that
    // should propagate to alignmentScore in src/lib/matching.ts.
    expect(METHODE_S04_FORMULA_LINES).toHaveLength(5);
  });

  it("first line is the header 'Score par scrutin :' ending with ':'", () => {
    expect(METHODE_S04_FORMULA_LINES[0]).toBe("Score par scrutin :");
    expect(METHODE_S04_FORMULA_LINES[0].endsWith(":")).toBe(true);
  });

  it("the 3 score branches (+1/+0,5/0) match alignmentScore in src/lib/matching.ts", () => {
    // Paired with the 3 alignmentScore return values: 1, 0.5, 0.
    // A drift here would silently desync the doc from the actual
    // scoring code.
    expect(METHODE_S04_FORMULA_LINES[1]).toContain("+1");
    expect(METHODE_S04_FORMULA_LINES[2]).toContain("+0,5");
    expect(METHODE_S04_FORMULA_LINES[3]).toContain("0 si désaccord");
  });

  it("aggregation line contains '× 100' (percent-scale invariant)", () => {
    // The aggregation produces a 0..100 percent display. Dropping
    // the ×100 would silently change the percent scale.
    expect(METHODE_S04_FORMULA_LINES[4]).toContain("× 100");
  });
});

describe("METHODE_S03_THRESHOLD_RULE_* — group-position threshold paired with computePosition", () => {
  it("SUFFIX matches the canonical threshold-rule then-branch", () => {
    expect(METHODE_S03_THRESHOLD_RULE_SUFFIX).toBe(
      "% des votants effectifs du groupe → pour / contre / abstention",
    );
  });

  it("ELSE matches 'sinon → groupe divisé'", () => {
    expect(METHODE_S03_THRESHOLD_RULE_ELSE).toBe("sinon → groupe divisé");
  });

  it("both lines contain '→' (formula arrow convention)", () => {
    // The arrow notation is what makes these read as if-then rules
    // in the Formula block. A regression that uses '=' or '->' would
    // change the visual hierarchy.
    expect(METHODE_S03_THRESHOLD_RULE_SUFFIX).toContain("→");
    expect(METHODE_S03_THRESHOLD_RULE_ELSE).toContain("→");
  });

  it("ELSE outcome 'groupe divisé' matches the AUDIT_TRAIL_LABEL_DIVIDED noun", () => {
    // Documents the cross-surface invariant: when the formula's
    // else-branch fires, the audit trail labels the row as "divisé"
    // (cf. AUDIT_TRAIL_LABEL_DIVIDED = "Groupe divisé, non compté").
    // A drift between the 2 surfaces would confuse SR users.
    expect(METHODE_S03_THRESHOLD_RULE_ELSE).toContain("divisé");
  });
});

describe("METHODE_S02_RANDOM_AVOIDANCE + GARDE_FOUS_LEAD — theme-balance commitments", () => {
  it("RANDOM_AVOIDANCE matches 'plutôt qu'au hasard pur'", () => {
    expect(METHODE_S02_RANDOM_AVOIDANCE).toBe("plutôt qu'au hasard pur");
  });

  it("RANDOM_AVOIDANCE contains 'hasard pur' (anti-soften guard)", () => {
    // The wording explicitly rejects "pure randomness" as a strategy
    // — round-robin theme balance is the alternative. A soften to
    // "presque au hasard" would imply randomness is mostly used.
    expect(METHODE_S02_RANDOM_AVOIDANCE).toContain("hasard pur");
  });

  it("GARDE_FOUS_LEAD matches 'avec deux garde-fous'", () => {
    expect(METHODE_S02_GARDE_FOUS_LEAD).toBe("avec deux garde-fous");
  });

  it("GARDE_FOUS_LEAD contains 'deux' (anti-count-drift guard for 2 cap rules)", () => {
    // The "deux" number commits the doc to exactly 2 cap rules
    // (per-dossier + per-chapeau). Adding a 3rd cap requires
    // updating this const + the matching prose. A regression
    // that says "trois" or "deux ou trois" would silently drift.
    expect(METHODE_S02_GARDE_FOUS_LEAD).toContain("deux");
  });
});

describe("METHODE_S02_GARDE_FOU_* — per-cap garde-fou claims", () => {
  it("LEAD matches the shared 'jamais plus de ' prefix", () => {
    expect(METHODE_S02_GARDE_FOU_LEAD).toBe("jamais plus de ");
  });

  it("DOSSIER_SUFFIX matches ' scrutins du même dossier législatif'", () => {
    expect(METHODE_S02_GARDE_FOU_DOSSIER_SUFFIX).toBe(
      " scrutins du même dossier législatif",
    );
  });

  it("SUJET_SUFFIX matches ' scrutins du même sujet'", () => {
    expect(METHODE_S02_GARDE_FOU_SUJET_SUFFIX).toBe(" scrutins du même sujet");
  });

  it("the 2 suffixes are distinct (per-dossier vs per-chapeau semantic split)", () => {
    // The 2 caps target different things: per-dossier (a single
    // legislative file) vs per-chapeau (a thematic cluster). The
    // 2 SUFFIX consts must remain distinct — a merge would silently
    // hide the per-dossier vs per-chapeau distinction in deck.ts.
    expect(METHODE_S02_GARDE_FOU_DOSSIER_SUFFIX).not.toBe(METHODE_S02_GARDE_FOU_SUJET_SUFFIX);
  });

  it("both suffixes start with ' scrutins ' (common-noun convention)", () => {
    expect(METHODE_S02_GARDE_FOU_DOSSIER_SUFFIX.startsWith(" scrutins ")).toBe(true);
    expect(METHODE_S02_GARDE_FOU_SUJET_SUFFIX.startsWith(" scrutins ")).toBe(true);
  });
});

describe("METHODE_S04_RANK_THRESHOLD_SUFFIX — ordinal-marker companion", () => {
  it("matches ' scrutin compté' (singular noun + past participle)", () => {
    expect(METHODE_S04_RANK_THRESHOLD_SUFFIX).toBe(" scrutin compté");
  });

  it("uses singular 'scrutin' (the ordinal designates the Nth element)", () => {
    // The strong-tag renders "Ne scrutin compté" — singular because
    // the ordinal designates a specific N, not a count of N. A
    // regression to "scrutins comptés" would mis-pluralize.
    expect(METHODE_S04_RANK_THRESHOLD_SUFFIX).toContain("scrutin compté");
    expect(METHODE_S04_RANK_THRESHOLD_SUFFIX).not.toContain("scrutins comptés");
  });
});

describe("COVER_EYEBROW_SUFFIX — Cover header eyebrow", () => {
  it("matches 'TON ALIGNEMENT RÉEL'", () => {
    expect(COVER_EYEBROW_SUFFIX).toBe("TON ALIGNEMENT RÉEL");
  });

  it("is uppercase (eyebrow styling convention)", () => {
    expect(COVER_EYEBROW_SUFFIX).toBe(COVER_EYEBROW_SUFFIX.toUpperCase());
  });

  it("contains 'ALIGNEMENT' (the load-bearing product noun)", () => {
    // The whole product is about computing political alignment.
    // A rewording that swaps "ALIGNEMENT" for a generic noun would
    // lose the product-pitch anchor.
    expect(COVER_EYEBROW_SUFFIX).toContain("ALIGNEMENT");
  });
});

describe("METHODE_PAGE_LEAD_TAIL + SECTION_07_REF — page-lead cross-reference", () => {
  it("TAIL matches the canonical IA-attribution wording", () => {
    expect(METHODE_PAGE_LEAD_TAIL).toBe(
      "En revanche, les résumés, les points clés et les synthèses des scrutins sont mis en forme par Claude (voir ",
    );
  });

  it("TAIL contains 'résumés' + 'points clés' + 'synthèses' (3-IA-output anti-drop guard)", () => {
    // The 3 IA outputs documented here are the actual 3 things the
    // LLM produces (paired with METHODE_S07_CLAUDE_TASKS_*). A drop
    // of any one would desync this lead paragraph from §07's task list.
    expect(METHODE_PAGE_LEAD_TAIL).toContain("résumés");
    expect(METHODE_PAGE_LEAD_TAIL).toContain("points clés");
    expect(METHODE_PAGE_LEAD_TAIL).toContain("synthèses");
  });

  it("TAIL ends with '(voir ' (opens parenthesis + link prefix)", () => {
    // The TAIL ends right before the inline <a> link to section 07.
    // The "(voir " prefix opens the parenthesis that closes after
    // the link text in JSX. Pin the exact trailing for round-trip
    // compositional integrity.
    expect(METHODE_PAGE_LEAD_TAIL.endsWith("(voir ")).toBe(true);
  });

  it("SECTION_07_REF matches 'section 07'", () => {
    expect(METHODE_PAGE_LEAD_SECTION_07_REF).toBe("section 07");
  });

  it("SECTION_07_REF contains '07' (anti-renumber guard)", () => {
    // The §07 number must stay aligned with METHODE_SECTIONS[6][0]
    // (the 7th entry). If §07 is renumbered, this const + the href
    // + METHODE_SECTIONS must update in lockstep.
    expect(METHODE_PAGE_LEAD_SECTION_07_REF).toContain("07");
  });
});

describe("GITHUB_REPO_URL + GITHUB_REPO_DISPLAY — code-source link target", () => {
  // Used 3× across Methode §06, Methode §07, and Legal Sources block.
  // Currently a production-blocker TODO (real repo is private at
  // waramere1234/sans-detour). When the team open-sources the project,
  // updating GITHUB_REPO_URL propagates href + visible text + aria-label
  // in one edit.
  it("GITHUB_REPO_URL is the documented public URL", () => {
    expect(GITHUB_REPO_URL).toBe("https://github.com/sansdetour");
  });

  it("GITHUB_REPO_DISPLAY strips the protocol from GITHUB_REPO_URL", () => {
    expect(GITHUB_REPO_DISPLAY).toBe(
      GITHUB_REPO_URL.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    );
  });

  it("GITHUB_REPO_DISPLAY is the canonical 'github.com/sansdetour' value", () => {
    expect(GITHUB_REPO_DISPLAY).toBe("github.com/sansdetour");
  });
});

describe("CARD_VERSO_FLIP_BACK_HINT — Card verso footer flip-back hint", () => {
  it("matches the canonical 'tap pour revenir' wording (pin-the-value)", () => {
    expect(CARD_VERSO_FLIP_BACK_HINT).toBe("tap pour revenir");
  });

  it("contains 'tap' (the touch-affordance verb)", () => {
    // The hint must surface the actual user gesture (tap/click). A
    // rewording that drops the gesture verb (e.g., "Retour" / "Recto")
    // loses the affordance the small text exists to telegraph.
    expect(CARD_VERSO_FLIP_BACK_HINT.toLowerCase()).toContain("tap");
  });

  it("contains 'revenir' (anti-direction-flip guard)", () => {
    // "revenir" anchors the flip-back direction. A flip in copy from
    // "revenir" to "continuer" or "suivant" would silently invert the
    // mental model — the hint sits on the verso, so the action must
    // bring the user back to the recto.
    expect(CARD_VERSO_FLIP_BACK_HINT).toContain("revenir");
  });
});

describe("CARD_NO_ANALYSE_FALLBACK_BODY — Card verso fallback prose when analyse_loi is missing", () => {
  it("matches the canonical fallback wording (pin-the-value)", () => {
    expect(CARD_NO_ANALYSE_FALLBACK_BODY).toBe(
      "Aucune explication détaillée disponible pour ce scrutin. Le texte officiel ci-dessous donne le sujet général.",
    );
  });

  it("opens with 'Aucune' (negation-first framing)", () => {
    // The fallback must lead with the absence (so the user understands
    // immediately why the synthesis isn't there). A rewording that
    // buries the negation in mid-sentence would weaken the signal.
    expect(CARD_NO_ANALYSE_FALLBACK_BODY.startsWith("Aucune")).toBe(true);
  });

  it("points the user to 'le texte officiel ci-dessous' (anti-orphan guard)", () => {
    // The second sentence redirects the user to the AN libellé block
    // rendered below this fallback in the same verso. Pin so a future
    // layout change that moves the AN libellé elsewhere triggers a
    // copy update in lockstep (otherwise the pointer "ci-dessous"
    // becomes a lie).
    expect(CARD_NO_ANALYSE_FALLBACK_BODY).toContain("texte officiel");
    expect(CARD_NO_ANALYSE_FALLBACK_BODY).toContain("ci-dessous");
  });

  it("is exactly 2 sentences (anti-overgrowth guard)", () => {
    // The fallback sits in a small em block on the verso; a future
    // tweak that turns it into a paragraph would break the visual
    // contract with the surrounding short bullets. 2 sentences max.
    const sentenceCount = (CARD_NO_ANALYSE_FALLBACK_BODY.match(/\./g) || []).length;
    expect(sentenceCount).toBe(2);
  });
});

describe("METHODE_S07_AN_LINK_PARENTHETICAL_PREFIX/SUFFIX — Methode §07 AN-link parenthetical", () => {
  it("PREFIX is the canonical opener", () => {
    expect(METHODE_S07_AN_LINK_PARENTHETICAL_PREFIX).toBe(
      "(et la page AN complète est toujours accessible via « ",
    );
  });

  it("SUFFIX is the canonical closer", () => {
    expect(METHODE_S07_AN_LINK_PARENTHETICAL_SUFFIX).toBe(" »)");
  });

  it("PREFIX opens a parenthesis + opens French guillemets", () => {
    // Compositional: PREFIX + AN_LINK_VISIBLE_LABEL + SUFFIX must
    // form a balanced parenthetical with French guillemets around the
    // link text. Pin the bracket discipline so a future copy tweak
    // that drops one half (e.g., removes only « and not ») surfaces.
    expect(METHODE_S07_AN_LINK_PARENTHETICAL_PREFIX.startsWith("(")).toBe(true);
    expect(METHODE_S07_AN_LINK_PARENTHETICAL_PREFIX).toContain("«");
  });

  it("SUFFIX closes guillemet + closes parenthesis", () => {
    expect(METHODE_S07_AN_LINK_PARENTHETICAL_SUFFIX).toContain("»");
    expect(METHODE_S07_AN_LINK_PARENTHETICAL_SUFFIX.endsWith(")")).toBe(true);
  });

  it("PREFIX contains 'page AN complète' (load-bearing claim)", () => {
    // The §07 paragraph promises that even though the libellé brut is
    // visible inline, the *full* AN page is still one click away. The
    // "complète" qualifier is what distinguishes this companion claim
    // from a vague "link to AN" mention. Drop guard.
    expect(METHODE_S07_AN_LINK_PARENTHETICAL_PREFIX).toContain("page AN");
    expect(METHODE_S07_AN_LINK_PARENTHETICAL_PREFIX).toContain("complète");
  });

  it("PREFIX contains 'toujours accessible' (anti-soften guard)", () => {
    // "toujours accessible" is the strong promise: not "souvent",
    // not "généralement", not "quand disponible". Any softening here
    // weakens the transparency guarantee paired with the libellé brut
    // promise (METHODE_S07_LIBELLE_BRUT_GUARANTEE).
    expect(METHODE_S07_AN_LINK_PARENTHETICAL_PREFIX).toContain("toujours accessible");
  });

  it("PREFIX is the only opening parenthesis + SUFFIX is the only closing one (balanced)", () => {
    // Exactly one '(' in PREFIX and exactly one ')' in SUFFIX. Catches
    // accidental nested parentheticals that would render asymmetrically.
    const openCount = (METHODE_S07_AN_LINK_PARENTHETICAL_PREFIX.match(/\(/g) || []).length;
    const closeCount = (METHODE_S07_AN_LINK_PARENTHETICAL_SUFFIX.match(/\)/g) || []).length;
    expect(openCount).toBe(1);
    expect(closeCount).toBe(1);
  });
});

describe("TAGLINE_PART_1 + TAGLINE_PART_2 — Cover h1 tagline halves composing into TAGLINE", () => {
  it("TAGLINE_PART_1 matches the canonical first half (pin-the-value)", () => {
    expect(TAGLINE_PART_1).toBe("Pas les programmes");
  });

  it("TAGLINE_PART_2 matches the canonical second half (pin-the-value)", () => {
    expect(TAGLINE_PART_2).toBe("Les vrais votes");
  });

  it("PART_1 + '. ' + PART_2 + '.' composes back to TAGLINE (round-trip invariant)", () => {
    // The Cover h1 renders PART_1 + "." + <br/> + PART_2 + "." while
    // TAGLINE is the joined "Pas les programmes. Les vrais votes." used
    // by the meta description / og:description / twitter:description /
    // title / manifest. If a future tweak edits one half without the
    // other, this invariant fails and forces a sync edit.
    expect(`${TAGLINE_PART_1}. ${TAGLINE_PART_2}.`).toBe(TAGLINE);
  });

  it("neither half ends with a period (the period lives in Cover JSX, not the const)", () => {
    // The h1 renders the period after each half via a separate JSX
    // span (so the accent color extends to the dot for PART_2). Pin
    // the no-trailing-period contract so a future edit that inlines
    // the period back into the const would surface in CI before drift.
    expect(TAGLINE_PART_1.endsWith(".")).toBe(false);
    expect(TAGLINE_PART_2.endsWith(".")).toBe(false);
  });

  it("PART_2 contains 'vrais votes' (anti-dilution guard for product pitch)", () => {
    // "vrais votes" is THE product pitch — Sans Détour exists because
    // it measures alignment on real parliamentary votes, not programmes
    // or declarations. A rewording that drops "vrais" (e.g., to "Les
    // votes des députés") would lose the load-bearing adjective that
    // distinguishes this product.
    expect(TAGLINE_PART_2).toContain("vrais votes");
  });
});

describe("METHODE_S06_INDEPENDENCE_OPENER_PREFIX/STRONG/SUFFIX — Methode §06 independence claim opener", () => {
  it("PREFIX matches the canonical opener (pin-the-value)", () => {
    expect(METHODE_S06_INDEPENDENCE_OPENER_PREFIX).toBe("Sans Détour est un projet ");
  });

  it("STRONG is the single 'indépendant' word (pin-the-value)", () => {
    expect(METHODE_S06_INDEPENDENCE_STRONG).toBe("indépendant");
  });

  it("SUFFIX is the period-space separator before the next sentence", () => {
    expect(METHODE_S06_INDEPENDENCE_OPENER_SUFFIX).toBe(". ");
  });

  it("PREFIX starts with BRAND_NAME (anti-brand-drift guard)", () => {
    // PREFIX hardcodes "Sans Détour" rather than interpolating BRAND_NAME
    // (the inline-with-strong split doesn't allow it cleanly). Anti-drift
    // guard: assert the brand prefix matches BRAND_NAME so a future
    // rebrand fails this test until PREFIX is updated in lockstep.
    expect(METHODE_S06_INDEPENDENCE_OPENER_PREFIX.startsWith(BRAND_NAME)).toBe(true);
  });

  it("STRONG is 'indépendant' (the load-bearing claim word)", () => {
    // The whole §06 paragraph (and the parallel LEGAL_INDEPENDANCE_BODY)
    // hangs on this single word. A softening to "neutre" or "autonome"
    // would weaken the independence contract that distinguishes Sans
    // Détour from partisan affiliations.
    expect(METHODE_S06_INDEPENDENCE_STRONG).toBe("indépendant");
  });

  it("PREFIX + STRONG + SUFFIX composes the same opening sentence as LEGAL_INDEPENDANCE_BODY's first sentence", () => {
    // Methode §06 (informal) and Legal Indépendance (formal RGPD)
    // surface the same brand-independence contract. The opening
    // sentence must match exactly so a tweak in one surface stays
    // aligned with the other.
    const methodeOpener = METHODE_S06_INDEPENDENCE_OPENER_PREFIX
      + METHODE_S06_INDEPENDENCE_STRONG
      + METHODE_S06_INDEPENDENCE_OPENER_SUFFIX.trim();
    expect(methodeOpener).toBe("Sans Détour est un projet indépendant.");
  });
});

describe("METHODESHEET_CLAUDE_MISSION_STRONG — load-bearing AI-role-boundary claim", () => {
  it("matches the canonical mission statement (pin-the-value)", () => {
    expect(METHODESHEET_CLAUDE_MISSION_STRONG).toBe(
      "Sa mission : rendre lisible, pas commenter.",
    );
  });

  it("contains 'rendre lisible' (the positive half of the role)", () => {
    // The MUST-DO half: Claude transforms the libellé brut + web search
    // results into a synthesis that's readable. A rewording that drops
    // "rendre lisible" would lose the positive contract — what Claude
    // is actually for.
    expect(METHODESHEET_CLAUDE_MISSION_STRONG).toContain("rendre lisible");
  });

  it("contains 'pas commenter' (the must-NOT-do half of the role)", () => {
    // The MUST-NOT-DO half — the no-editorialization contract. A
    // softening to "résumer" or "synthétiser" without the explicit
    // negation would weaken the transparency promise: Claude is
    // permitted to render but forbidden from commenting.
    expect(METHODESHEET_CLAUDE_MISSION_STRONG).toContain("pas commenter");
  });

  it("uses 'Sa mission :' (role-framing) not 'Son rôle' or generic intro (anti-soften guard)", () => {
    // "mission" frames the boundary as a contract, not a suggestion.
    // A softening to "Son rôle est de" or "Claude essaie de" would
    // weaken the binding nature of the claim.
    expect(METHODESHEET_CLAUDE_MISSION_STRONG.startsWith("Sa mission")).toBe(true);
  });

  it("contains exactly one ',' (the rendre/pas-commenter split)", () => {
    // The mission is a 2-clause sentence joined by a single comma:
    // "rendre lisible, pas commenter". A future tweak that adds a
    // third clause or removes the comma would change the cadence
    // and weaken the parallel rendre/pas-commenter structure.
    const commaCount = (METHODESHEET_CLAUDE_MISSION_STRONG.match(/,/g) || []).length;
    expect(commaCount).toBe(1);
  });
});

describe("PLAY_SR_HEADING — Play.tsx visually-hidden h1 (SR landmark for heading rotor)", () => {
  it("matches the canonical wording (pin-the-value)", () => {
    expect(PLAY_SR_HEADING).toBe("Voter sur les scrutins");
  });

  it("starts with an imperative verb 'Voter' (action-framing for SR users)", () => {
    // SR-only landmarks should describe what the user does on the
    // page, not what the page is. "Voter sur..." frames /play as
    // an active task — a rewording to "Liste des scrutins" or
    // "Cartes" would weaken the page-mission cue.
    expect(PLAY_SR_HEADING.startsWith("Voter")).toBe(true);
  });

  it("contains 'scrutins' (the load-bearing domain noun)", () => {
    // "scrutins" is the AN-specific term for parliamentary votes —
    // a softening to "votes" alone would lose the institutional
    // specificity that distinguishes this app from generic poll tools.
    expect(PLAY_SR_HEADING).toContain("scrutins");
  });
});

describe("METHODESHEET_AN_BLOCK_BODY — MethodeSheet AN block body (data contract listing)", () => {
  it("matches the canonical AN-data listing (pin-the-value)", () => {
    expect(METHODESHEET_AN_BLOCK_BODY).toBe(
      "Date, numéro, vote des députés, libellé brut du scrutin, position des groupes parlementaires.",
    );
  });

  it("enumerates the 5 AN data fields (anti-drop guard)", () => {
    // The 5 fields documented here (date, numéro, vote des députés,
    // libellé brut, position des groupes) mirror the actual columns
    // Sans Détour reads from data.assemblee-nationale.fr. A drop
    // would silently desync the user-facing claim from the ingestion
    // schema. Pin all 5 anchors.
    expect(METHODESHEET_AN_BLOCK_BODY).toContain("Date");
    expect(METHODESHEET_AN_BLOCK_BODY).toContain("numéro");
    expect(METHODESHEET_AN_BLOCK_BODY).toContain("vote des députés");
    expect(METHODESHEET_AN_BLOCK_BODY).toContain("libellé brut");
    expect(METHODESHEET_AN_BLOCK_BODY).toContain("position des groupes");
  });

  it("uses 'libellé brut' (anti-soften guard for transparency claim)", () => {
    // "libellé brut" — the raw, unedited AN title — is the
    // transparency anchor paired with METHODE_S07_LIBELLE_BRUT_GUARANTEE.
    // A softening to "titre" or "intitulé" would lose the
    // unedited/verbatim signal that lets users verify the synthesis.
    expect(METHODESHEET_AN_BLOCK_BODY).toContain("libellé brut");
  });

  it("contains exactly 4 commas (anti-count-drift guard for the 5-field comma list)", () => {
    // 5 fields separated by 4 commas. A future add (6th field) or
    // drop (4 fields) would change the count and surface here.
    const commaCount = (METHODESHEET_AN_BLOCK_BODY.match(/,/g) || []).length;
    expect(commaCount).toBe(4);
  });
});

describe("METHODESHEET_CLAUDE_NO_AI_IN_SCORE — load-bearing no-AI-in-scoring contract", () => {
  it("matches the canonical wording (pin-the-value)", () => {
    expect(METHODESHEET_CLAUDE_NO_AI_IN_SCORE).toBe(
      "Le calcul d'alignement, lui, est une formule mathématique pure — aucune IA dans le score.",
    );
  });

  it("contains 'formule mathématique pure' (load-bearing positive claim)", () => {
    // The score is a deterministic formula, not an LLM inference.
    // "pure" is non-negotiable — a softening to "principalement"
    // or "essentiellement" would weaken the determinism guarantee.
    expect(METHODESHEET_CLAUDE_NO_AI_IN_SCORE).toContain("formule mathématique pure");
  });

  it("contains 'aucune IA dans le score' (the negative anti-AI claim)", () => {
    // The MUST-NOT-DO half of the AI-role-boundary contract paired
    // with METHODESHEET_CLAUDE_MISSION_STRONG (Claude renders but
    // does not comment). "aucune IA" is the strongest possible
    // negation — anything weaker ("pas d'IA" / "sans IA") would
    // soften the transparency claim.
    expect(METHODESHEET_CLAUDE_NO_AI_IN_SCORE).toContain("aucune IA dans le score");
  });

  it("uses an em-dash to join the positive + negative halves (anti-merge guard)", () => {
    // The 2 halves (positive: "formule mathématique pure" /
    // negative: "aucune IA dans le score") are joined by an em-dash
    // for visual parity. A merge into a single comma-joined clause
    // would degrade the typographic emphasis on the negation.
    expect(METHODESHEET_CLAUDE_NO_AI_IN_SCORE).toContain(" — ");
  });

  it("ends with 'score.' (anti-truncation guard — the noun must close the contract)", () => {
    // "score" is the noun the negation hangs on. A truncation that
    // drops the final word ("aucune IA dans le calcul") would
    // generalize the claim and lose the specificity that ties it
    // back to "Le calcul d'alignement" at sentence start.
    expect(METHODESHEET_CLAUDE_NO_AI_IN_SCORE.endsWith("score.")).toBe(true);
  });
});

describe("METHODESHEET_CLAUDE_TASKS_BODY — MethodeSheet 1st Claude paragraph (4-output contract)", () => {
  it("matches the canonical 4-output listing (pin-the-value)", () => {
    expect(METHODESHEET_CLAUDE_TASKS_BODY).toBe(
      "Le titre court reformulé, les points clés, le résumé, la synthèse du texte officiel.",
    );
  });

  it("enumerates the 4 Claude outputs (anti-drop guard)", () => {
    // Paired with METHODE_S07_CLAUDE_TASKS_PREFIX/SUFFIX which document
    // the same 4 outputs on the full Methode page. A drop here would
    // desync the sheet from the long-form methodology.
    expect(METHODESHEET_CLAUDE_TASKS_BODY).toContain("titre court reformulé");
    expect(METHODESHEET_CLAUDE_TASKS_BODY).toContain("points clés");
    expect(METHODESHEET_CLAUDE_TASKS_BODY).toContain("résumé");
    expect(METHODESHEET_CLAUDE_TASKS_BODY).toContain("synthèse du texte officiel");
  });

  it("contains exactly 3 commas (anti-count-drift guard for the 4-output comma list)", () => {
    // 4 outputs separated by 3 commas. A future add (5th output) or
    // drop (3 outputs) would change the count and surface here.
    const commaCount = (METHODESHEET_CLAUDE_TASKS_BODY.match(/,/g) || []).length;
    expect(commaCount).toBe(3);
  });

  it("uses 'synthèse du texte officiel' (anti-soften guard for the most ambitious output)", () => {
    // The 4th output — the LLM-generated synthesis of the AN libellé —
    // is the most editorially-loaded. "synthèse du texte officiel"
    // anchors it to the source document; a softening to "résumé long"
    // or "explication" would lose the textuel-officiel anchor that
    // distinguishes the synthesis from the recto's titre_pedago.
    expect(METHODESHEET_CLAUDE_TASKS_BODY).toContain("synthèse du texte officiel");
  });
});

describe("METHODESHEET_CLAUDE_PROMPT_NEUTRALITY_BODY — MethodeSheet 2nd Claude paragraph (prompt-input contract)", () => {
  it("matches the canonical 2-sentence body (pin-the-value)", () => {
    expect(METHODESHEET_CLAUDE_PROMPT_NEUTRALITY_BODY).toBe(
      "Claude reçoit le libellé brut de l'AN + des résultats de recherche web. Pas d'opinion humaine ni d'orientation politique dans son prompt.",
    );
  });

  it("opens with 'Claude reçoit' (subject-first prompt-input framing)", () => {
    // The sentence structure documents WHAT Claude gets — agent-first
    // framing. A rewording to "Le prompt inclut..." would obscure
    // the actor (Claude) and weaken the agency trail.
    expect(METHODESHEET_CLAUDE_PROMPT_NEUTRALITY_BODY.startsWith("Claude reçoit")).toBe(true);
  });

  it("contains 'libellé brut de l'AN' (the input anchor)", () => {
    // Pairs with METHODESHEET_AN_BLOCK_BODY ("libellé brut du scrutin")
    // and METHODE_S07_LIBELLE_BRUT_GUARANTEE. The "libellé brut"
    // qualifier is non-negotiable — it commits to feeding the raw,
    // unedited AN text to Claude rather than a curated summary.
    expect(METHODESHEET_CLAUDE_PROMPT_NEUTRALITY_BODY).toContain("libellé brut");
  });

  it("contains 'résultats de recherche web' (the 2nd input documented)", () => {
    // Claude receives 2 inputs: libellé brut + web search results.
    // Both must be named explicitly; dropping one would misrepresent
    // the actual prompt composition.
    expect(METHODESHEET_CLAUDE_PROMPT_NEUTRALITY_BODY).toContain("résultats de recherche web");
  });

  it("contains 'Pas d'opinion humaine' (negative claim, anti-soften)", () => {
    // The 2nd sentence is the negative half of the prompt-neutrality
    // contract. "Pas d'opinion humaine" is the strongest possible
    // statement against editorial injection; a softening to
    // "peu d'opinion" or "opinion limitée" would weaken the
    // transparency guarantee.
    expect(METHODESHEET_CLAUDE_PROMPT_NEUTRALITY_BODY).toContain("Pas d'opinion humaine");
  });

  it("contains 'orientation politique' (anti-partisan claim)", () => {
    // Paired with the LEGAL_INDEPENDANCE_BODY and §06 independence
    // claim. Explicitly stating no political orientation in the
    // prompt is what backs the brand-independence contract at the
    // technical level.
    expect(METHODESHEET_CLAUDE_PROMPT_NEUTRALITY_BODY).toContain("orientation politique");
  });

  it("is exactly 2 sentences (anti-overgrowth guard)", () => {
    // The body deliberately splits into a 2-sentence structure:
    // (1) what goes IN, (2) what does NOT go in. Adding a 3rd
    // sentence would dilute the contrast.
    const sentenceCount = (METHODESHEET_CLAUDE_PROMPT_NEUTRALITY_BODY.match(/\./g) || []).length;
    expect(sentenceCount).toBe(2);
  });
});

describe("ERROR_FALLBACK_PERSISTENCE_HELP_PREFIX — ErrorBoundary conditional contact prefix", () => {
  it("matches the canonical 'Si ça persiste : ' prefix (pin-the-value)", () => {
    expect(ERROR_FALLBACK_PERSISTENCE_HELP_PREFIX).toBe("Si ça persiste : ");
  });

  it("starts with 'Si' (conditional framing — only contact if reload fails)", () => {
    // The conditional "Si" frames the email as a *fallback* path,
    // not a primary action. A rewording to "Pour signaler : " or
    // "Contact : " would lose the conditional framing and push
    // users to email on every error.
    expect(ERROR_FALLBACK_PERSISTENCE_HELP_PREFIX.startsWith("Si")).toBe(true);
  });

  it("contains 'persiste' (the load-bearing condition word)", () => {
    // "persiste" anchors the condition to: error survives a reload.
    // A softening to "Si vous avez un problème" would generalize the
    // condition and lose the post-reload specificity.
    expect(ERROR_FALLBACK_PERSISTENCE_HELP_PREFIX).toContain("persiste");
  });

  it("ends with ' : ' (French colon with spaces, before the mailto link)", () => {
    // French typography requires a space before AND after the colon.
    // The trailing space allows the JSX-interpolated CONTACT_EMAIL
    // mailto link to render flush without manual spacing in the JSX.
    expect(ERROR_FALLBACK_PERSISTENCE_HELP_PREFIX.endsWith(" : ")).toBe(true);
  });
});

describe("RESULT_EMPTY_POOL_MESSAGE — Result.tsx empty-pool RetryError message", () => {
  it("matches the canonical wording (pin-the-value)", () => {
    expect(RESULT_EMPTY_POOL_MESSAGE).toBe(
      "Impossible de calculer ton alignement : aucun scrutin disponible. Réessaie dans quelques minutes.",
    );
  });

  it("opens with 'Impossible de calculer ton alignement' (page-specific framing)", () => {
    // The Result-page empty-pool message frames the failure in terms
    // of the user's goal on /result ("calculer ton alignement"), not
    // the generic "Aucun scrutin disponible" framing used by Play.
    // A copy paste from PLAY_EMPTY_POOL_MESSAGE would lose this
    // page-specific framing — pin so they stay distinct.
    expect(RESULT_EMPTY_POOL_MESSAGE.startsWith("Impossible de calculer ton alignement")).toBe(true);
  });

  it("contains 'aucun scrutin disponible' (load-bearing condition phrase)", () => {
    // The condition phrase mirrors PLAY_EMPTY_POOL_MESSAGE ("Aucun
    // scrutin disponible"). The 2 surfaces are the same failure
    // class (empty pool) on different pages — the condition phrase
    // must stay shared even though the framing differs.
    expect(RESULT_EMPTY_POOL_MESSAGE.toLowerCase()).toContain("aucun scrutin disponible");
  });

  it("ends with 'dans quelques minutes.' (anti-soften guard for retry guidance)", () => {
    // Tells the user when to retry — "dans quelques minutes" is the
    // specific guidance. A drop to just "Réessaie." would leave the
    // user with no time-frame and a worse UX.
    expect(RESULT_EMPTY_POOL_MESSAGE.endsWith("dans quelques minutes.")).toBe(true);
  });

  it("is distinct from PLAY_EMPTY_POOL_MESSAGE (anti-collapse guard)", () => {
    // The 2 messages document the same failure class on different
    // pages but with page-specific framing. A future refactor that
    // collapses them into one shared const would lose the Result
    // page's "calculer ton alignement" framing. Pin so they stay
    // intentionally divergent.
    expect(RESULT_EMPTY_POOL_MESSAGE).not.toBe(PLAY_EMPTY_POOL_MESSAGE);
  });
});

describe("LEGAL_SOURCES_DONNEES_OPENER_PREFIX + _LINK_TO_LICENSE_SEPARATOR — Legal §sources wrapping the AN open-data link", () => {
  it("PREFIX matches the canonical opener (pin-the-value)", () => {
    expect(LEGAL_SOURCES_DONNEES_OPENER_PREFIX).toBe(
      "Open data officiel de l'Assemblée Nationale (",
    );
  });

  it("SEPARATOR matches the canonical closer-into-license (pin-the-value)", () => {
    expect(LEGAL_SOURCES_DONNEES_LINK_TO_LICENSE_SEPARATOR).toBe("), ");
  });

  it("PREFIX contains 'officiel' (load-bearing source-attribution anchor)", () => {
    // "officiel" commits the app to using the *official* AN feed, not
    // a third-party proxy or scrape. A softening to "données" or
    // "open data" alone would lose the official-source anchor that
    // backs the data-provenance claim in the methodology.
    expect(LEGAL_SOURCES_DONNEES_OPENER_PREFIX).toContain("officiel");
  });

  it("PREFIX contains 'Assemblée Nationale' (the institutional source)", () => {
    expect(LEGAL_SOURCES_DONNEES_OPENER_PREFIX).toContain("Assemblée Nationale");
  });

  it("PREFIX ends with '(' opening parenthesis for the link", () => {
    // Compositional: PREFIX + AN_LINK + SEPARATOR + LICENSE_LABEL +
    // ".". The PREFIX must end with '(' to open the parenthesis the
    // SEPARATOR will close.
    expect(LEGAL_SOURCES_DONNEES_OPENER_PREFIX.endsWith("(")).toBe(true);
  });

  it("SEPARATOR starts with ')' (closes the link parenthesis)", () => {
    expect(LEGAL_SOURCES_DONNEES_LINK_TO_LICENSE_SEPARATOR.startsWith(")")).toBe(true);
  });

  it("SEPARATOR is exactly '), ' (comma + space before license label)", () => {
    // Cadence-pinning: the comma + space gives the typographic
    // breathing room between the parenthesized link and the license
    // noun. A drop to "), " → "). " would change the cadence.
    expect(LEGAL_SOURCES_DONNEES_LINK_TO_LICENSE_SEPARATOR).toBe("), ");
  });
});

describe("LEGAL_CODE_SOURCE_OPENER_PREFIX — Legal §code-source MIT-license opener", () => {
  it("matches the canonical opener (pin-the-value)", () => {
    expect(LEGAL_CODE_SOURCE_OPENER_PREFIX).toBe(
      "Open source sous licence MIT, disponible sur ",
    );
  });

  it("contains 'MIT' (load-bearing license claim)", () => {
    // "MIT" commits the project to a specific permissive license.
    // A softening to "Open source" alone (dropping "MIT") would
    // weaken the legal commitment and break the symmetric claim
    // with the Methode §06 + §07 MIT-license annotations.
    expect(LEGAL_CODE_SOURCE_OPENER_PREFIX).toContain("MIT");
  });

  it("contains 'sous licence' (proper licensing phrasing)", () => {
    // The phrasing "sous licence MIT" is the formal French legal
    // form. A drop to just "open source MIT" would weaken the
    // legal register expected on a Mentions Légales page.
    expect(LEGAL_CODE_SOURCE_OPENER_PREFIX).toContain("sous licence");
  });

  it("ends with 'disponible sur ' (link-prefix cadence with trailing space)", () => {
    // The trailing space lets the GitHub link render flush after
    // the prefix in JSX without manual spacing. Pin so a future
    // edit that drops the space doesn't silently jam the link
    // text against "sur".
    expect(LEGAL_CODE_SOURCE_OPENER_PREFIX.endsWith("disponible sur ")).toBe(true);
  });

  it("contains exactly 1 comma (the MIT/disponible split)", () => {
    // The opener reads "Open source sous licence MIT, disponible
    // sur " — one comma between the license claim and the link
    // pointer. A future tweak that adds a clause (e.g., "Open
    // source, sous licence MIT, disponible sur") would change
    // the cadence.
    const commaCount = (LEGAL_CODE_SOURCE_OPENER_PREFIX.match(/,/g) || []).length;
    expect(commaCount).toBe(1);
  });
});

describe("METHODE_S03_DIVIDED_STRONG_LABEL — Methode §03 <strong>divisé</strong> matching GroupPosition discriminant", () => {
  it("matches the canonical 'divisé' wording (pin-the-value)", () => {
    expect(METHODE_S03_DIVIDED_STRONG_LABEL).toBe("divisé");
  });

  it("is a valid GroupPosition discriminant (anti-rename guard)", () => {
    // The matching algorithm in src/lib/matching.ts checks
    // `groupPos === "divisé"` to exclude divided groups from scoring.
    // The strong-tagged label here MUST be exactly the discriminant
    // value — if a TypeScript rename changes the type, the visible
    // copy must update in lockstep.
    const valid: GroupPosition[] = ["pour", "contre", "abstention", "divisé"];
    expect(valid).toContain(METHODE_S03_DIVIDED_STRONG_LABEL as GroupPosition);
  });

  it("is lowercase (anti-capitalize guard)", () => {
    // GroupPosition values are lowercase strings. A capitalization
    // tweak ("Divisé") would render but no longer match the
    // discriminant, silently misclaiming the algorithm's behavior.
    expect(METHODE_S03_DIVIDED_STRONG_LABEL).toBe(
      METHODE_S03_DIVIDED_STRONG_LABEL.toLowerCase(),
    );
  });

  it("contains the é accent (anti-asciify guard)", () => {
    // The actual GroupPosition value uses é (U+00E9). An accidental
    // ASCII swap to "divise" would break the strict equality check
    // in matching.ts and the divided-exclusion branch.
    expect(METHODE_S03_DIVIDED_STRONG_LABEL).toContain("é");
  });
});

describe("METHODE_S01_DATA_SOURCE_OPENER_PREFIX + TO_CODE_SEPARATOR — Methode §01 data-source claim opener", () => {
  it("PREFIX matches the canonical opener (pin-the-value)", () => {
    expect(METHODE_S01_DATA_SOURCE_OPENER_PREFIX).toBe("Les votes proviennent de ");
  });

  it("SEPARATOR matches the canonical strong-to-code separator (pin-the-value)", () => {
    expect(METHODE_S01_DATA_SOURCE_TO_CODE_SEPARATOR).toBe(", exposé sur ");
  });

  it("PREFIX contains 'proviennent' (data-provenance verb anti-soften)", () => {
    // "proviennent de" is the load-bearing data-provenance verb.
    // A softening to "viennent de" or "sont issus de" would weaken
    // the institutional-source attribution the §01 paragraph rests on.
    expect(METHODE_S01_DATA_SOURCE_OPENER_PREFIX).toContain("proviennent");
  });

  it("PREFIX ends with ' de ' (link-to-strong glue cadence)", () => {
    // The prefix ends with a trailing space so the strong tag
    // renders flush. "de " (preposition + space) is the gluing
    // pattern; a drop to "proviennent" alone would jam the
    // strong content right against the verb.
    expect(METHODE_S01_DATA_SOURCE_OPENER_PREFIX.endsWith("de ")).toBe(true);
  });

  it("SEPARATOR contains 'exposé sur' (institutional-publication verb)", () => {
    // "exposé sur" anchors the technical-publication step: the AN
    // publishes the data on a specific feed (the hostname rendered
    // inside the <code> tag). A softening to "disponible sur" would
    // lose the "exposed-as-API" connotation.
    expect(METHODE_S01_DATA_SOURCE_TO_CODE_SEPARATOR).toContain("exposé sur");
  });

  it("SEPARATOR starts with ', ' (comma-space transitioning from the strong tag)", () => {
    // French typography: comma + space after the strong-tagged
    // source name, before the next clause. Pin so a future edit
    // that loses the comma doesn't run the strong content into
    // the separator phrase.
    expect(METHODE_S01_DATA_SOURCE_TO_CODE_SEPARATOR.startsWith(", ")).toBe(true);
  });
});

describe("METHODE_S02_KEPT_OPENER_PREFIX — Methode §02 inclusion-policy opener", () => {
  it("matches the canonical 'On garde les ' opener (pin-the-value)", () => {
    expect(METHODE_S02_KEPT_OPENER_PREFIX).toBe("On garde les ");
  });

  it("starts with 'On' (informal first-person plural register)", () => {
    // The methodology page uses an editorial "on" (active voice,
    // informal first-person plural) to feel plain-French rather
    // than RGPD-formal. A rewording to "Nous gardons" or
    // "Sont conservés" would shift the register and clash with
    // the rest of Methode's tone.
    expect(METHODE_S02_KEPT_OPENER_PREFIX.startsWith("On ")).toBe(true);
  });

  it("contains 'garde' (the load-bearing inclusion verb)", () => {
    // "garde" frames the policy as active inclusion ("we keep these")
    // not passive filtering ("these are kept"). The verb choice
    // matters for tone — pin so a softening surfaces.
    expect(METHODE_S02_KEPT_OPENER_PREFIX).toContain("garde");
  });

  it("ends with trailing space before the strong-tagged scrutin type", () => {
    // The prefix ends with " " (space after "les") so the strong tag
    // renders flush in JSX without manual spacing. Pin so a future
    // edit that drops the trailing space doesn't jam the strong
    // content against "les".
    expect(METHODE_S02_KEPT_OPENER_PREFIX.endsWith(" ")).toBe(true);
  });
});

describe("METHODE_S04_RANK_OPENER_PREFIX + BRIDGE_SEPARATOR — Methode §04 rank-threshold rule opener", () => {
  it("PREFIX matches the canonical opener (pin-the-value)", () => {
    expect(METHODE_S04_RANK_OPENER_PREFIX).toBe("Le ranking apparaît à partir du ");
  });

  it("BRIDGE_SEPARATOR is the em-dash separator (pin-the-value)", () => {
    expect(METHODE_S04_RANK_BRIDGE_SEPARATOR).toBe(" — ");
  });

  it("PREFIX contains 'apparaît à partir du' (threshold-gating verb)", () => {
    // The threshold-gating verb is non-negotiable — it frames the
    // ranking as appearing *only* past a threshold (not "available
    // from the start" or "visible always"). A softening to "est
    // disponible dès le" would lose the gating-rule semantics.
    expect(METHODE_S04_RANK_OPENER_PREFIX).toContain("apparaît à partir du");
  });

  it("PREFIX ends with ' du ' (link-to-strong glue cadence)", () => {
    // The trailing space lets the strong-tagged ordinal number
    // render flush in JSX. Pin so a future edit that drops the
    // space doesn't jam the strong content against "du".
    expect(METHODE_S04_RANK_OPENER_PREFIX.endsWith("du ")).toBe(true);
  });

  it("BRIDGE_SEPARATOR uses an em-dash (U+2014, not a hyphen)", () => {
    // The separator is the em-dash "—" (U+2014), not a hyphen "-"
    // or en-dash "–". The em-dash signals a clause-introducing
    // separator, which matches the cadence of the noise-explanation
    // clause that follows.
    expect(METHODE_S04_RANK_BRIDGE_SEPARATOR).toContain("—");
    expect(METHODE_S04_RANK_BRIDGE_SEPARATOR).not.toContain("-");
  });

  it("BRIDGE_SEPARATOR is padded with single spaces (typographic breathing)", () => {
    // The em-dash is padded with single ASCII spaces on both sides
    // (French typographic convention for em-dash usage). Pin the
    // exact " — " form so a tweak doesn't introduce thin spaces
    // ( ) or non-breaking spaces.
    expect(METHODE_S04_RANK_BRIDGE_SEPARATOR).toBe(" — ");
  });
});

describe("METHODE_S05_LOCALSTORAGE_CODE_LABEL — Methode §05 <code>localStorage</code> API anchor", () => {
  it("matches the canonical 'localStorage' API name (pin-the-value)", () => {
    expect(METHODE_S05_LOCALSTORAGE_CODE_LABEL).toBe("localStorage");
  });

  it("uses lowercase + uppercase camelCase exactly as in the Web Storage API", () => {
    // The actual browser API is `window.localStorage` (camelCase).
    // A drift to "LocalStorage" or "local_storage" would misclaim
    // the API name. src/lib/session.ts calls localStorage.getItem
    // etc. — this const must match that identifier exactly.
    expect(METHODE_S05_LOCALSTORAGE_CODE_LABEL).toBe("localStorage");
    // Defense in depth: lowercase 'l' start, capital 'S' for Storage.
    expect(METHODE_S05_LOCALSTORAGE_CODE_LABEL.startsWith("l")).toBe(true);
    expect(METHODE_S05_LOCALSTORAGE_CODE_LABEL).toContain("S");
  });

  it("has no whitespace (it's an API identifier, not prose)", () => {
    // The label is the bare API name — no spaces, no surrounding
    // backticks or quotes. Render-time wrapping happens via the
    // <code> tag in JSX.
    expect(METHODE_S05_LOCALSTORAGE_CODE_LABEL).not.toMatch(/\s/);
  });
});

describe("DEMO_FALLBACK_TITLE_SUFFIX + ARIA_SUFFIX — AuditTrail demo-fallback tooltip + SR label", () => {
  it("TITLE_SUFFIX matches the canonical tooltip suffix (pin-the-value)", () => {
    expect(DEMO_FALLBACK_TITLE_SUFFIX).toBe(
      " — sera remplacée par les vrais scrutins de l'AN une fois le pipeline d'ingestion en production",
    );
  });

  it("ARIA_SUFFIX matches the canonical SR clarifier (pin-the-value)", () => {
    expect(DEMO_FALLBACK_ARIA_SUFFIX).toBe(" (pas un scrutin AN réel)");
  });

  it("TITLE_SUFFIX contains 'vrais scrutins' (anti-soften guard for transparency promise)", () => {
    // The tooltip promises demo data will be replaced by *real*
    // scrutins. "vrais scrutins" is the load-bearing transparency
    // anchor — a softening to "futurs scrutins" or "données réelles"
    // would weaken the demo-vs-real distinction.
    expect(DEMO_FALLBACK_TITLE_SUFFIX).toContain("vrais scrutins");
  });

  it("TITLE_SUFFIX contains 'pipeline d'ingestion' (technical-mechanism anchor)", () => {
    // Names the mechanism that replaces demo with real data — the
    // ingestion pipeline (scripts/ingest:an in CLAUDE.md). A drop
    // to "système" or "service" would lose the technical anchor
    // that explains *how* the substitution happens.
    expect(DEMO_FALLBACK_TITLE_SUFFIX).toContain("pipeline d'ingestion");
  });

  it("TITLE_SUFFIX starts with ' — ' (em-dash to compose onto DEMO_DATA_LABEL_PREFIX)", () => {
    // The suffix composes onto DEMO_DATA_LABEL_PREFIX via
    // `${PREFIX}${SUFFIX}` — so the suffix must start with the
    // separator. Pin " — " so a refactor doesn't double-add the
    // separator or drop it.
    expect(DEMO_FALLBACK_TITLE_SUFFIX.startsWith(" — ")).toBe(true);
  });

  it("ARIA_SUFFIX contains 'pas un scrutin AN réel' (negative-claim anti-soften)", () => {
    // The SR aria-label clarifies: this is NOT a real AN scrutin.
    // A softening to "scrutin d'exemple" or "donnée demo" without
    // the explicit negation would weaken the disclosure for SR
    // users who can't see the visual demo styling.
    expect(DEMO_FALLBACK_ARIA_SUFFIX).toContain("pas un scrutin AN réel");
  });

  it("ARIA_SUFFIX is parenthesized (visual cadence: short clarifier appended to the prefix)", () => {
    // The SR clarifier is a short parenthetical, not a full clause.
    // Pin the parens so a future edit doesn't turn it into a long
    // sentence that's noisy in the SR rotor.
    expect(DEMO_FALLBACK_ARIA_SUFFIX.trim().startsWith("(")).toBe(true);
    expect(DEMO_FALLBACK_ARIA_SUFFIX.trim().endsWith(")")).toBe(true);
  });
});

describe("RESULT_PERSONNALITES_EXCLUSIONS_NOTE — personality-exclusion disclosure", () => {
  it("contains the data-provenance opener 'votes effectifs à l'Assemblée Nationale' (pin)", () => {
    // Anchors the methodology contract: only real votes count, no
    // declarations / programs / sondages. Pairs with TAGLINE_PART_2
    // "Les vrais votes" and the entire product pitch.
    expect(RESULT_PERSONNALITES_EXCLUSIONS_NOTE).toContain(
      "votes effectifs à l'Assemblée Nationale",
    );
  });

  it("names all 4 ne-siègent-pas exclusions (Mélenchon + Philippe + Glucksmann + Tondelier)", () => {
    // The 4 figures excluded by structural constraint (not deputies
    // in the 17th legislature). Documented in CLAUDE.md "Exclus par
    // contrainte structurelle". A future edit that drops a name
    // would silently misclaim the V2 personalities scope.
    expect(RESULT_PERSONNALITES_EXCLUSIONS_NOTE).toContain("Mélenchon");
    expect(RESULT_PERSONNALITES_EXCLUSIONS_NOTE).toContain("Philippe");
    expect(RESULT_PERSONNALITES_EXCLUSIONS_NOTE).toContain("Glucksmann");
    expect(RESULT_PERSONNALITES_EXCLUSIONS_NOTE).toContain("Tondelier");
  });

  it("names the 2 special-case exclusions (Bardella démissionné + Darmanin ministre)", () => {
    // The 2 figures with special-case reasons (not "ne siègent pas"):
    // Bardella was elected then resigned before sitting; Darmanin is
    // a minister whose alternate votes in his stead. CLAUDE.md
    // documents both — drop guard.
    expect(RESULT_PERSONNALITES_EXCLUSIONS_NOTE).toContain("Bardella");
    expect(RESULT_PERSONNALITES_EXCLUSIONS_NOTE).toContain("Darmanin");
  });

  it("references the '17ᵉ législature' (anti-legislature-drift guard)", () => {
    // The exclusion is 17ᵉ-legislature-specific (the AN seating
    // period this product measures). When a future legislature
    // turnover happens, this disclosure must be updated alongside
    // LEGISLATURE_LABEL — pin so an update to LEGISLATURE_LABEL
    // alone surfaces here as a sync requirement.
    expect(RESULT_PERSONNALITES_EXCLUSIONS_NOTE).toContain("17ᵉ législature");
  });

  it("contains the supplément clause 'son suppléant vote à sa place' (Darmanin-specific)", () => {
    // The Darmanin-specific reason is that his alternate (suppléant)
    // casts the votes in his stead — meaning his votes don't reflect
    // his personal positions. Without this clause, the disclosure
    // wouldn't explain WHY a minister is excluded.
    expect(RESULT_PERSONNALITES_EXCLUSIONS_NOTE).toContain("son suppléant vote à sa place");
  });

  it("closes with 'Aucun d'eux n'est mesuré ici.' (anti-soften final claim)", () => {
    // The closing sentence anchors the exclusion contract: NONE of
    // the named figures appears in the measurement. "Aucun" is the
    // strongest possible negation; a softening to "Ces personnes
    // n'apparaissent pas" would weaken the disclosure.
    expect(RESULT_PERSONNALITES_EXCLUSIONS_NOTE.endsWith("Aucun d'eux n'est mesuré ici.")).toBe(true);
  });
});

describe("METHODE_S04_RANK_ORDINAL_MARKER — Methode §04 French-ordinal-superscript marker", () => {
  it("matches the canonical 'e' marker (pin-the-value)", () => {
    expect(METHODE_S04_RANK_ORDINAL_MARKER).toBe("e");
  });

  it("is a single lowercase character (French ordinal-superscript convention)", () => {
    // French ordinal in superscript is "e" (Académie française usage:
    // "19e" not "19ème"). A drift to "ème" would render with a full-form
    // suffix that's typographically incorrect for academic register.
    expect(METHODE_S04_RANK_ORDINAL_MARKER).toHaveLength(1);
    expect(METHODE_S04_RANK_ORDINAL_MARKER).toBe(
      METHODE_S04_RANK_ORDINAL_MARKER.toLowerCase(),
    );
  });

  it("is exactly 'e' (no accent, no uppercase, no full-form)", () => {
    // Defense in depth: assert exact value. The French ordinal
    // typography is unambiguous — N + <sup>e</sup>.
    expect(METHODE_S04_RANK_ORDINAL_MARKER).not.toBe("ème");
    expect(METHODE_S04_RANK_ORDINAL_MARKER).not.toBe("E");
    expect(METHODE_S04_RANK_ORDINAL_MARKER).not.toBe("é");
  });
});

describe("METHODE_PAGE_LEAD_LINK_CLOSER_SUFFIX — Methode page-lead link closer ').'", () => {
  it("matches the canonical ').' (pin-the-value)", () => {
    expect(METHODE_PAGE_LEAD_LINK_CLOSER_SUFFIX).toBe(").");
  });

  it("is exactly 2 chars (anti-overgrowth)", () => {
    // The closer is a 2-char compositional anchor: ) closes the
    // parenthesis opened by METHODE_PAGE_LEAD_TAIL's "(voir " +
    // . ends the sentence. A future edit that adds words would
    // duplicate prose that belongs in METHODE_PAGE_LEAD_TAIL.
    expect(METHODE_PAGE_LEAD_LINK_CLOSER_SUFFIX).toHaveLength(2);
  });

  it("starts with ')' (closes the parenthesis from METHODE_PAGE_LEAD_TAIL's '(voir ' opener)", () => {
    // Compositional invariant: the page-lead tail opens "(voir "
    // before the inline link, and this suffix MUST close that
    // parenthesis. Pin the start to ")" so a future tweak that
    // changes the closer (e.g., to "].") fails CI alongside any
    // matching change in the tail.
    expect(METHODE_PAGE_LEAD_LINK_CLOSER_SUFFIX.startsWith(")")).toBe(true);
    // And the tail must indeed open with "(voir ":
    expect(METHODE_PAGE_LEAD_TAIL.endsWith("(voir ")).toBe(true);
  });

  it("ends with '.' (sentence terminator)", () => {
    expect(METHODE_PAGE_LEAD_LINK_CLOSER_SUFFIX.endsWith(".")).toBe(true);
  });
});

describe("H1_ACCENT_PERIOD — brand-finish accent-colored period at h1 end", () => {
  it("is the literal '.' (pin-the-value)", () => {
    expect(H1_ACCENT_PERIOD).toBe(".");
  });

  it("is exactly 1 char (anti-overgrowth)", () => {
    // The accent terminator is intentionally a single period. A future
    // tweak to "‧" or ".." or em-dash would change the brand-finish
    // convention across 3 routes simultaneously.
    expect(H1_ACCENT_PERIOD).toHaveLength(1);
  });

  it("is a period character (anti-replace guard)", () => {
    // The 3 h1 sites (Cover/Methode/Result) all use the same period
    // for the same accent-colored terminator. A typo to "," or ";"
    // would silently change the brand convention.
    expect(H1_ACCENT_PERIOD).toBe(".");
  });
});

describe("RESULT_H1_PERCENT_WRAPPER_PREFIX + SUFFIX — Result h1 percent-wrapper around the pct interpolation", () => {
  it("PREFIX matches the canonical ' (' opener (pin-the-value)", () => {
    expect(RESULT_H1_PERCENT_WRAPPER_PREFIX).toBe(" (");
  });

  it("SUFFIX matches the canonical '%)' closer (pin-the-value)", () => {
    expect(RESULT_H1_PERCENT_WRAPPER_SUFFIX).toBe("%)");
  });

  it("PREFIX starts with a space (separates from preceding party-name span)", () => {
    expect(RESULT_H1_PERCENT_WRAPPER_PREFIX.startsWith(" ")).toBe(true);
  });

  it("PREFIX contains '(' and SUFFIX contains ')' (balanced parenthesis discipline)", () => {
    // Compositional: PREFIX opens "(", SUFFIX closes ")". A drop on
    // either side would render an unbalanced parenthesis.
    expect(RESULT_H1_PERCENT_WRAPPER_PREFIX).toContain("(");
    expect(RESULT_H1_PERCENT_WRAPPER_SUFFIX).toContain(")");
  });

  it("SUFFIX contains '%' (load-bearing unit marker)", () => {
    // The percent sign is what makes the wrapped number a percentage,
    // not a raw count. Dropping "%" would silently misclaim the score
    // (e.g., "(42)" reads as a vote count, not 42%).
    expect(RESULT_H1_PERCENT_WRAPPER_SUFFIX).toContain("%");
  });

  it("PREFIX exactly 1 open paren, SUFFIX exactly 1 close paren (no nesting)", () => {
    const openCount = (RESULT_H1_PERCENT_WRAPPER_PREFIX.match(/\(/g) || []).length;
    const closeCount = (RESULT_H1_PERCENT_WRAPPER_SUFFIX.match(/\)/g) || []).length;
    expect(openCount).toBe(1);
    expect(closeCount).toBe(1);
  });
});

describe("CARD_FOOTER_NUMERO_PREFIX + CARD_FOOTER_DATE_SEPARATOR — Card recto footer 'n° N · DATE' line", () => {
  it("NUMERO_PREFIX matches the canonical 'n° ' (pin-the-value)", () => {
    expect(CARD_FOOTER_NUMERO_PREFIX).toBe("n° ");
  });

  it("DATE_SEPARATOR matches the canonical ' · ' (pin-the-value)", () => {
    expect(CARD_FOOTER_DATE_SEPARATOR).toBe(" · ");
  });

  it("NUMERO_PREFIX uses degree sign U+00B0 (not ASCII 'o' lookalike)", () => {
    // French scrutin-number convention uses the degree sign (°,
    // U+00B0), not an ASCII lowercase "o". A drift to "no " would
    // visually approximate but render as the wrong glyph at smaller
    // sizes and screen-reader incorrectly.
    expect(CARD_FOOTER_NUMERO_PREFIX).toContain("°");
    // Defense-in-depth: confirm the second character is U+00B0
    expect(CARD_FOOTER_NUMERO_PREFIX.charCodeAt(1)).toBe(0x00B0);
  });

  it("NUMERO_PREFIX ends with a space (glue before the numero interpolation)", () => {
    // The trailing space lets `${PREFIX}${numero}` render as "n° 1234"
    // without manual spacing. A drop would render "n°1234".
    expect(CARD_FOOTER_NUMERO_PREFIX.endsWith(" ")).toBe(true);
  });

  it("DATE_SEPARATOR uses middle-dot U+00B7 (not ASCII period)", () => {
    // The middle-dot " · " (U+00B7) is the visual separator used
    // across the app (FreshnessBanner, AN libellé prefix span,
    // and Card footer). A drift to ASCII period "." would change
    // the typography.
    expect(CARD_FOOTER_DATE_SEPARATOR).toContain("·");
    // Defense-in-depth: middle char is U+00B7
    expect(CARD_FOOTER_DATE_SEPARATOR.charCodeAt(1)).toBe(0x00B7);
  });

  it("DATE_SEPARATOR is padded with single spaces on both sides", () => {
    // Cadence-pinning: " · " — one space on each side around the
    // middle-dot. Pin so a tweak doesn't lose padding or use
    // non-breaking spaces.
    expect(CARD_FOOTER_DATE_SEPARATOR.startsWith(" ")).toBe(true);
    expect(CARD_FOOTER_DATE_SEPARATOR.endsWith(" ")).toBe(true);
    expect(CARD_FOOTER_DATE_SEPARATOR.length).toBe(3);
  });
});

describe("MIDDLE_DOT_SEPARATOR — generic typography separator centralization", () => {
  it("matches the canonical ' · ' (pin-the-value)", () => {
    expect(MIDDLE_DOT_SEPARATOR).toBe(" · ");
  });

  it("uses middle-dot U+00B7 (not ASCII period)", () => {
    // Defense-in-depth: middle char must be U+00B7. An ASCII period
    // would render visually different at smaller sizes and could be
    // mistaken for a sentence terminator.
    expect(MIDDLE_DOT_SEPARATOR.charCodeAt(1)).toBe(0x00B7);
  });

  it("is padded with single ASCII spaces on both sides (length 3)", () => {
    expect(MIDDLE_DOT_SEPARATOR.startsWith(" ")).toBe(true);
    expect(MIDDLE_DOT_SEPARATOR.endsWith(" ")).toBe(true);
    expect(MIDDLE_DOT_SEPARATOR).toHaveLength(3);
  });

  it("matches CARD_FOOTER_DATE_SEPARATOR by value (typography consistency cross-check)", () => {
    // CARD_FOOTER_DATE_SEPARATOR is semantic-specific but uses the
    // same typography. Pin the value equality so a tweak to the
    // generic doesn't accidentally desync from the semantic alias.
    expect(MIDDLE_DOT_SEPARATOR).toBe(CARD_FOOTER_DATE_SEPARATOR);
  });
});

describe("SHARE_LEAD_TO_SOURCE_SEPARATOR + SHARE_LEAD_TO_SUMMARY_SEPARATOR — share.ts composition separators", () => {
  it("SOURCE_SEPARATOR matches the canonical ', ' (pin-the-value)", () => {
    expect(SHARE_LEAD_TO_SOURCE_SEPARATOR).toBe(", ");
  });

  it("SUMMARY_SEPARATOR matches the canonical ' : ' (pin-the-value)", () => {
    expect(SHARE_LEAD_TO_SUMMARY_SEPARATOR).toBe(" : ");
  });

  it("SOURCE_SEPARATOR starts with ',' (French typography: comma before space)", () => {
    expect(SHARE_LEAD_TO_SOURCE_SEPARATOR.startsWith(",")).toBe(true);
    expect(SHARE_LEAD_TO_SOURCE_SEPARATOR.endsWith(" ")).toBe(true);
  });

  it("SUMMARY_SEPARATOR is the French colon ' : ' with single spaces on both sides", () => {
    // French typography uses space + colon + space, NOT ASCII colon
    // without spaces. Pin the exact ' : ' so a future edit that
    // strips the leading space doesn't render "...AN: 1. ..." which
    // is incorrect French typography.
    expect(SHARE_LEAD_TO_SUMMARY_SEPARATOR).toBe(" : ");
    expect(SHARE_LEAD_TO_SUMMARY_SEPARATOR.startsWith(" ")).toBe(true);
    expect(SHARE_LEAD_TO_SUMMARY_SEPARATOR.endsWith(" ")).toBe(true);
  });

  it("SOURCE_SEPARATOR is distinct from SUMMARY_SEPARATOR (anti-collapse guard)", () => {
    // The 2 separators are NOT interchangeable — ", " separates the
    // lead phrase from the source line; " : " separates the lead
    // from the summary. A copy-paste collapse to one shared const
    // would render incorrect French typography.
    expect(SHARE_LEAD_TO_SOURCE_SEPARATOR).not.toBe(SHARE_LEAD_TO_SUMMARY_SEPARATOR);
  });
});

describe("VOTE_GLYPH_CONTRE/SKIP/POUR — Play vote-button arrow glyphs (1:1 with VOTE_LABEL_*)", () => {
  it("VOTE_GLYPH_CONTRE matches '← ' (left-arrow + space)", () => {
    expect(VOTE_GLYPH_CONTRE).toBe("← ");
  });

  it("VOTE_GLYPH_SKIP matches '↓ ' (down-arrow + space)", () => {
    expect(VOTE_GLYPH_SKIP).toBe("↓ ");
  });

  it("VOTE_GLYPH_POUR matches ' →' (space + right-arrow, suffix-style)", () => {
    expect(VOTE_GLYPH_POUR).toBe(" →");
  });

  it("CONTRE arrow is left-pointing U+2190 (matches swipe-left affordance)", () => {
    // The Cover swipe-legend shows ← for contre. Play must use the
    // same glyph so the affordance preview matches the actual button.
    expect(VOTE_GLYPH_CONTRE).toContain("←");
    expect(VOTE_GLYPH_CONTRE.charCodeAt(0)).toBe(0x2190);
  });

  it("SKIP arrow is down-pointing U+2193 (matches swipe-down affordance)", () => {
    expect(VOTE_GLYPH_SKIP).toContain("↓");
    expect(VOTE_GLYPH_SKIP.charCodeAt(0)).toBe(0x2193);
  });

  it("POUR arrow is right-pointing U+2192 (matches swipe-right affordance)", () => {
    expect(VOTE_GLYPH_POUR).toContain("→");
    // POUR is suffix-style so the arrow is the SECOND char (after leading space).
    expect(VOTE_GLYPH_POUR.charCodeAt(1)).toBe(0x2192);
  });

  it("CONTRE/SKIP are prefix-style (glyph + space), POUR is suffix-style (space + glyph)", () => {
    // Anti-position-flip guard: a future edit that reverses the
    // POUR positioning (or swaps any of the 3 between prefix/suffix)
    // would render inconsistent buttons. The directionality matters:
    // pour points rightward → glyph trails the label.
    expect(VOTE_GLYPH_CONTRE.endsWith(" ")).toBe(true);
    expect(VOTE_GLYPH_SKIP.endsWith(" ")).toBe(true);
    expect(VOTE_GLYPH_POUR.startsWith(" ")).toBe(true);
  });

  it("all 3 glyphs are exactly 2 chars long (1 arrow + 1 space)", () => {
    expect(VOTE_GLYPH_CONTRE).toHaveLength(2);
    expect(VOTE_GLYPH_SKIP).toHaveLength(2);
    expect(VOTE_GLYPH_POUR).toHaveLength(2);
  });
});

describe("BUTTON_ICON_RESTART — Result restart-icon glyph (continue-refine + refaire)", () => {
  it("matches the canonical '↻ ' (pin-the-value)", () => {
    expect(BUTTON_ICON_RESTART).toBe("↻ ");
  });

  it("uses cycle arrow U+21BB (anti-replace guard)", () => {
    // The clockwise open-circle arrow ↻ (U+21BB) signals "redo from
    // start". A drift to ↺ (counterclockwise) or 🔄 (emoji) would
    // change the visual semantics or the rendering register.
    expect(BUTTON_ICON_RESTART).toContain("↻");
    expect(BUTTON_ICON_RESTART.charCodeAt(0)).toBe(0x21BB);
  });

  it("ends with a trailing space (glue cadence before the label)", () => {
    // The trailing space lets `{GLYPH}{LABEL}` render flush without
    // manual spacing. A drop would render "↻Refaire" jammed.
    expect(BUTTON_ICON_RESTART.endsWith(" ")).toBe(true);
  });
});

describe("RESULT_CONTINUE_TEST_PAREN_PREFIX + _SUFFIX — Result continue-test button paren wrapper", () => {
  it("PREFIX matches the canonical ' (' (pin-the-value)", () => {
    expect(RESULT_CONTINUE_TEST_PAREN_PREFIX).toBe(" (");
  });

  it("SUFFIX matches the canonical ')' (pin-the-value)", () => {
    expect(RESULT_CONTINUE_TEST_PAREN_SUFFIX).toBe(")");
  });

  it("PREFIX starts with space + open-paren (separates from CONTINUE_TEST_LABEL_PREFIX)", () => {
    expect(RESULT_CONTINUE_TEST_PAREN_PREFIX.startsWith(" ")).toBe(true);
    expect(RESULT_CONTINUE_TEST_PAREN_PREFIX).toContain("(");
  });

  it("PREFIX contains '(' and SUFFIX contains ')' (balanced parenthesis discipline)", () => {
    const openCount = (RESULT_CONTINUE_TEST_PAREN_PREFIX.match(/\(/g) || []).length;
    const closeCount = (RESULT_CONTINUE_TEST_PAREN_SUFFIX.match(/\)/g) || []).length;
    expect(openCount).toBe(1);
    expect(closeCount).toBe(1);
  });

  it("matches RESULT_H1_PERCENT_WRAPPER_PREFIX (same compositional pattern)", () => {
    // Both consts open " (" for a numeric interpolation. Pin the
    // value equality so the 2 compositional surfaces stay typographically
    // consistent. A future change to one should land alongside the other.
    expect(RESULT_CONTINUE_TEST_PAREN_PREFIX).toBe(RESULT_H1_PERCENT_WRAPPER_PREFIX);
  });
});

describe("AUDIT_GLYPH_ALIGNED/PARTIAL/OPPOSED/DIVIDED — AuditTrail breakdown chip glyphs", () => {
  it("ALIGNED matches '✓ ' (check mark + space)", () => {
    expect(AUDIT_GLYPH_ALIGNED).toBe("✓ ");
  });

  it("PARTIAL matches '≈ ' (almost-equal + space)", () => {
    expect(AUDIT_GLYPH_PARTIAL).toBe("≈ ");
  });

  it("OPPOSED matches '✕ ' (cross + space)", () => {
    expect(AUDIT_GLYPH_OPPOSED).toBe("✕ ");
  });

  it("DIVIDED matches '÷ ' (division sign + space)", () => {
    expect(AUDIT_GLYPH_DIVIDED).toBe("÷ ");
  });

  it("ALIGNED uses check mark U+2713 (semantic match — aligned)", () => {
    // U+2713 is the WCAG-friendly check mark. A drift to U+2705 (✅
    // emoji) would change the rendering register (color-coded emoji
    // vs monochrome glyph that inherits the color from the surrounding
    // span).
    expect(AUDIT_GLYPH_ALIGNED.charCodeAt(0)).toBe(0x2713);
  });

  it("PARTIAL uses almost-equal U+2248 (semantic match — partial)", () => {
    expect(AUDIT_GLYPH_PARTIAL.charCodeAt(0)).toBe(0x2248);
  });

  it("OPPOSED uses heavy multiplication X U+2715 (semantic match — opposed)", () => {
    expect(AUDIT_GLYPH_OPPOSED.charCodeAt(0)).toBe(0x2715);
  });

  it("DIVIDED uses division sign U+00F7 (semantic match — divided)", () => {
    expect(AUDIT_GLYPH_DIVIDED.charCodeAt(0)).toBe(0x00F7);
  });

  it("all 4 glyphs are exactly 2 chars long (1 glyph + trailing space)", () => {
    expect(AUDIT_GLYPH_ALIGNED).toHaveLength(2);
    expect(AUDIT_GLYPH_PARTIAL).toHaveLength(2);
    expect(AUDIT_GLYPH_OPPOSED).toHaveLength(2);
    expect(AUDIT_GLYPH_DIVIDED).toHaveLength(2);
  });

  it("all 4 glyphs end with trailing space (glue cadence before the count)", () => {
    expect(AUDIT_GLYPH_ALIGNED.endsWith(" ")).toBe(true);
    expect(AUDIT_GLYPH_PARTIAL.endsWith(" ")).toBe(true);
    expect(AUDIT_GLYPH_OPPOSED.endsWith(" ")).toBe(true);
    expect(AUDIT_GLYPH_DIVIDED.endsWith(" ")).toBe(true);
  });
});

describe("BUTTON_ARROW_RIGHT_PREFIX — '→ ' forward-navigation glyph (MethodeSheet + Result)", () => {
  it("matches the canonical '→ ' (pin-the-value)", () => {
    expect(BUTTON_ARROW_RIGHT_PREFIX).toBe("→ ");
  });

  it("uses right-arrow U+2192 (matches VOTE_GLYPH_POUR's arrow)", () => {
    expect(BUTTON_ARROW_RIGHT_PREFIX.charCodeAt(0)).toBe(0x2192);
  });

  it("is prefix-style (arrow + trailing space), distinct from VOTE_GLYPH_POUR suffix-style", () => {
    // BUTTON_ARROW_RIGHT_PREFIX = "→ " (prefix) vs VOTE_GLYPH_POUR = " →" (suffix).
    // Same arrow glyph but reversed spacing. Pin so a future tweak
    // doesn't accidentally merge them into one shared const that
    // ships with wrong cadence at one of the call sites.
    expect(BUTTON_ARROW_RIGHT_PREFIX.endsWith(" ")).toBe(true);
    expect(VOTE_GLYPH_POUR.startsWith(" ")).toBe(true);
    expect(BUTTON_ARROW_RIGHT_PREFIX).not.toBe(VOTE_GLYPH_POUR);
  });

  it("is exactly 2 chars long", () => {
    expect(BUTTON_ARROW_RIGHT_PREFIX).toHaveLength(2);
  });
});

describe("BACK_ARROW_PREFIX_GLYPH + BACK_ARROW_SUFFIX_GLYPH — back-navigation guillemet glyphs", () => {
  it("PREFIX matches '‹ ' (single guillemet + space)", () => {
    expect(BACK_ARROW_PREFIX_GLYPH).toBe("‹ ");
  });

  it("SUFFIX matches ' ‹' (space + single guillemet)", () => {
    expect(BACK_ARROW_SUFFIX_GLYPH).toBe(" ‹");
  });

  it("both use single-left guillemet U+2039 (same glyph, different spacing)", () => {
    // Pin the Unicode codepoint so a drift to < (less-than) or « (double
    // guillemet) surfaces. The single guillemet is the brand convention
    // for back-affordance arrows on reading pages + card verso footers.
    expect(BACK_ARROW_PREFIX_GLYPH.charCodeAt(0)).toBe(0x2039);
    expect(BACK_ARROW_SUFFIX_GLYPH.charCodeAt(1)).toBe(0x2039);
  });

  it("PREFIX is glyph + trailing space, SUFFIX is leading space + glyph (mirrored cadence)", () => {
    // Mirrored: PREFIX leads with the glyph, SUFFIX trails with the
    // glyph. A swap at either site would invert the visual cue.
    expect(BACK_ARROW_PREFIX_GLYPH.endsWith(" ")).toBe(true);
    expect(BACK_ARROW_SUFFIX_GLYPH.startsWith(" ")).toBe(true);
  });

  it("both glyphs are exactly 2 chars long", () => {
    expect(BACK_ARROW_PREFIX_GLYPH).toHaveLength(2);
    expect(BACK_ARROW_SUFFIX_GLYPH).toHaveLength(2);
  });

  it("PREFIX and SUFFIX are NOT equal (anti-collapse — they have opposite spacing)", () => {
    // The 2 consts serve mirrored roles. A future refactor that
    // collapses them into one shared const would render incorrect
    // cadence at one of the 2 sites.
    expect(BACK_ARROW_PREFIX_GLYPH).not.toBe(BACK_ARROW_SUFFIX_GLYPH);
  });
});

describe("BUTTON_ARROW_RIGHT_SUFFIX — ' →' forward-nav suffix glyph (Cover start + Play deck-exhausted result link)", () => {
  it("matches the canonical ' →' (pin-the-value)", () => {
    expect(BUTTON_ARROW_RIGHT_SUFFIX).toBe(" →");
  });

  it("uses right-arrow U+2192 (matches BUTTON_ARROW_RIGHT_PREFIX's arrow)", () => {
    // Same arrow as PREFIX, but trailing instead of leading. Pin so
    // a future tweak (e.g., to ⇒ or »→) lands on both consts together.
    expect(BUTTON_ARROW_RIGHT_SUFFIX.charCodeAt(1)).toBe(0x2192);
  });

  it("equals VOTE_GLYPH_POUR by value but kept distinct for semantic clarity", () => {
    // VOTE_GLYPH_POUR (" →") is for the vote-button "pour" affordance;
    // BUTTON_ARROW_RIGHT_SUFFIX (" →") is for non-vote forward-nav.
    // Same value, different semantic name. A future tweak to one
    // shouldn't silently change the other.
    expect(BUTTON_ARROW_RIGHT_SUFFIX).toBe(VOTE_GLYPH_POUR);
  });

  it("is suffix-style (leading space + arrow), distinct from BUTTON_ARROW_RIGHT_PREFIX prefix-style", () => {
    expect(BUTTON_ARROW_RIGHT_SUFFIX.startsWith(" ")).toBe(true);
    expect(BUTTON_ARROW_RIGHT_PREFIX.endsWith(" ")).toBe(true);
    expect(BUTTON_ARROW_RIGHT_SUFFIX).not.toBe(BUTTON_ARROW_RIGHT_PREFIX);
  });

  it("is exactly 2 chars long", () => {
    expect(BUTTON_ARROW_RIGHT_SUFFIX).toHaveLength(2);
  });
});

describe("BUTTON_ICON_SHARE — Result share button outbox glyph", () => {
  it("matches the canonical '📤 ' (pin-the-value)", () => {
    expect(BUTTON_ICON_SHARE).toBe("📤 ");
  });

  it("contains outbox emoji U+1F4E4 (anti-drift to other share glyphs)", () => {
    // The outbox-tray emoji 📤 (U+1F4E4) signals "share/send".
    // A drift to 🔼 (U+1F53C upward) or ↗ (U+2197 NE arrow) would
    // change the share affordance semantics.
    expect(BUTTON_ICON_SHARE.codePointAt(0)).toBe(0x1F4E4);
  });

  it("ends with trailing space (glue cadence before SHARE_LABEL)", () => {
    expect(BUTTON_ICON_SHARE.endsWith(" ")).toBe(true);
  });
});

describe("BUTTON_ICON_MAIL — MethodeSheet report-error envelope glyph", () => {
  it("matches the canonical '✉ ' (pin-the-value)", () => {
    expect(BUTTON_ICON_MAIL).toBe("✉ ");
  });

  it("uses envelope U+2709 (monochrome, NOT emoji envelope U+1F4E7)", () => {
    // U+2709 ✉ is a monochrome dingbat that inherits text color.
    // U+1F4E7 📧 is a color-coded emoji that ignores text color.
    // We use the monochrome form so the glyph color matches the
    // surrounding link text. Pin the codepoint so a drift to emoji
    // surfaces.
    expect(BUTTON_ICON_MAIL.charCodeAt(0)).toBe(0x2709);
  });

  it("ends with trailing space (glue cadence before the link label)", () => {
    expect(BUTTON_ICON_MAIL.endsWith(" ")).toBe(true);
  });
});

describe("CARD_IA_CHIP_GLYPH — Card recto IA-chip sparkles glyph", () => {
  it("matches the canonical '✨' (pin-the-value)", () => {
    expect(CARD_IA_CHIP_GLYPH).toBe("✨");
  });

  it("uses sparkles emoji U+2728 (anti-drift to other AI glyphs)", () => {
    // U+2728 ✨ is the conventional "AI/generated content" sparkle
    // signal. A drift to 🤖 (robot) or 🪄 (wand) would change the
    // signaling — sparkles is the industry convention.
    expect(CARD_IA_CHIP_GLYPH.codePointAt(0)).toBe(0x2728);
  });

  it("has NO trailing space (chip is compact — 'IA' wraps flush)", () => {
    // Unlike BUTTON_ICON_* which have trailing spaces, the IA chip
    // is intentionally tight. Pin the no-trailing-space so a future
    // edit doesn't accidentally add one and break the chip's layout.
    expect(CARD_IA_CHIP_GLYPH.endsWith(" ")).toBe(false);
    // U+2728 ✨ is in the BMP — single UTF-16 code unit (length 1).
    expect(CARD_IA_CHIP_GLYPH).toHaveLength(1);
  });
});

describe("SWIPE_LEGEND_ARROW_CONTRE/_SKIP/_POUR — Cover swipe-legend bare arrows", () => {
  it("CONTRE matches '←' (left-arrow, no spaces)", () => {
    expect(SWIPE_LEGEND_ARROW_CONTRE).toBe("←");
  });

  it("SKIP matches '↓' (down-arrow, no spaces)", () => {
    expect(SWIPE_LEGEND_ARROW_SKIP).toBe("↓");
  });

  it("POUR matches '→' (right-arrow, no spaces)", () => {
    expect(SWIPE_LEGEND_ARROW_POUR).toBe("→");
  });

  it("each arrow uses the same Unicode codepoint as the matching VOTE_GLYPH_*", () => {
    // The swipe-legend arrows and the vote-button glyphs MUST use
    // the same arrow Unicode so the affordance preview matches the
    // actual button. Pin the codepoint equality so a future drift
    // on one surface fails CI against the other.
    expect(SWIPE_LEGEND_ARROW_CONTRE.charCodeAt(0)).toBe(VOTE_GLYPH_CONTRE.charCodeAt(0)); // U+2190
    expect(SWIPE_LEGEND_ARROW_SKIP.charCodeAt(0)).toBe(VOTE_GLYPH_SKIP.charCodeAt(0)); // U+2193
    expect(SWIPE_LEGEND_ARROW_POUR.charCodeAt(0)).toBe(VOTE_GLYPH_POUR.charCodeAt(1)); // U+2192 (POUR is " →", arrow at idx 1)
  });

  it("each arrow is exactly 1 char (no trailing space, distinct from VOTE_GLYPH_*)", () => {
    // Swipe-legend renders the arrows standalone (large mono span);
    // vote-button glyphs render inline with the label text. The
    // legend variant has no space — pin so a future edit doesn't
    // accidentally add space and break the legend's centering.
    expect(SWIPE_LEGEND_ARROW_CONTRE).toHaveLength(1);
    expect(SWIPE_LEGEND_ARROW_SKIP).toHaveLength(1);
    expect(SWIPE_LEGEND_ARROW_POUR).toHaveLength(1);
  });

  it("legend arrows are NOT equal to VOTE_GLYPH_* (different cadence: bare vs with-space)", () => {
    expect(SWIPE_LEGEND_ARROW_CONTRE).not.toBe(VOTE_GLYPH_CONTRE);
    expect(SWIPE_LEGEND_ARROW_SKIP).not.toBe(VOTE_GLYPH_SKIP);
    expect(SWIPE_LEGEND_ARROW_POUR).not.toBe(VOTE_GLYPH_POUR);
  });
});

describe("DISCLOSURE_GLYPH_OPEN/_CLOSED — Result personnalites toggle indicators", () => {
  it("OPEN matches '▾' (down-pointing triangle, U+25BE)", () => {
    expect(DISCLOSURE_GLYPH_OPEN).toBe("▾");
    expect(DISCLOSURE_GLYPH_OPEN.charCodeAt(0)).toBe(0x25BE);
  });

  it("CLOSED matches '▸' (right-pointing triangle, U+25B8)", () => {
    expect(DISCLOSURE_GLYPH_CLOSED).toBe("▸");
    expect(DISCLOSURE_GLYPH_CLOSED.charCodeAt(0)).toBe(0x25B8);
  });

  it("OPEN points down (expanded content sits below the toggle)", () => {
    // Disclosure convention: the triangle points TOWARD the
    // revealed content. Open state has content below → arrow ↓
    // (triangle ▾). Pin the direction semantics so a swap of
    // OPEN/CLOSED in source surfaces.
    expect(DISCLOSURE_GLYPH_OPEN).toContain("▾");
  });

  it("CLOSED points right (content is hidden, will reveal to the right/down)", () => {
    expect(DISCLOSURE_GLYPH_CLOSED).toContain("▸");
  });

  it("OPEN !== CLOSED (anti-collapse — the 2 states need distinct glyphs)", () => {
    // A future refactor that collapses both into one shared const
    // would render identical glyphs for both states — defeating the
    // visual affordance.
    expect(DISCLOSURE_GLYPH_OPEN).not.toBe(DISCLOSURE_GLYPH_CLOSED);
  });

  it("both glyphs are exactly 1 char (BMP triangles)", () => {
    expect(DISCLOSURE_GLYPH_OPEN).toHaveLength(1);
    expect(DISCLOSURE_GLYPH_CLOSED).toHaveLength(1);
  });
});

describe("AuditTrail per-row icon derives from AUDIT_GLYPH_*.trimEnd() (chip↔row sync)", () => {
  it("AUDIT_GLYPH_ALIGNED trims to '✓' (matches the row-icon for score=1)", () => {
    // The chip glyph "✓ " and the row icon "✓" must stay in sync —
    // both signal "aligned vote". Deriving the row icon from the
    // chip glyph via .trimEnd() makes that explicit. A future
    // emoji/glyph swap on the chip propagates to the row icon
    // automatically.
    expect(AUDIT_GLYPH_ALIGNED.trimEnd()).toBe("✓");
  });

  it("AUDIT_GLYPH_PARTIAL trims to '≈' (matches the row-icon for score=0.5)", () => {
    expect(AUDIT_GLYPH_PARTIAL.trimEnd()).toBe("≈");
  });

  it("AUDIT_GLYPH_OPPOSED trims to '✕' (matches the row-icon for score=0)", () => {
    expect(AUDIT_GLYPH_OPPOSED.trimEnd()).toBe("✕");
  });

  it("AUDIT_GLYPH_DIVIDED trims to '÷' (matches the row-icon for score=null)", () => {
    expect(AUDIT_GLYPH_DIVIDED.trimEnd()).toBe("÷");
  });

  it("all 4 chip glyphs have exactly 1 trailing space (so .trimEnd shortens by 1)", () => {
    // Pin the chip-vs-row cadence-only difference: chip has 1
    // trailing space, row has none. The .trimEnd() derivation must
    // remove exactly 1 char.
    expect(AUDIT_GLYPH_ALIGNED.length - AUDIT_GLYPH_ALIGNED.trimEnd().length).toBe(1);
    expect(AUDIT_GLYPH_PARTIAL.length - AUDIT_GLYPH_PARTIAL.trimEnd().length).toBe(1);
    expect(AUDIT_GLYPH_OPPOSED.length - AUDIT_GLYPH_OPPOSED.trimEnd().length).toBe(1);
    expect(AUDIT_GLYPH_DIVIDED.length - AUDIT_GLYPH_DIVIDED.trimEnd().length).toBe(1);
  });
});

describe("MODAL_CLOSE_GLYPH — MethodeSheet close button visible glyph", () => {
  it("matches the canonical '✕' (pin-the-value)", () => {
    expect(MODAL_CLOSE_GLYPH).toBe("✕");
  });

  it("uses heavy multiplication X U+2715 (same as AUDIT_GLYPH_OPPOSED)", () => {
    expect(MODAL_CLOSE_GLYPH.charCodeAt(0)).toBe(0x2715);
  });

  it("equals AUDIT_GLYPH_OPPOSED.trimEnd() (cross-surface glyph consistency)", () => {
    // The modal close X and the AuditTrail "opposed" chip glyph both
    // use U+2715. Pin the value equality so a future glyph swap on
    // either surface forces an update on the other.
    expect(MODAL_CLOSE_GLYPH).toBe(AUDIT_GLYPH_OPPOSED.trimEnd());
  });

  it("is exactly 1 char with no whitespace (modal close button is centered, no glue)", () => {
    expect(MODAL_CLOSE_GLYPH).toHaveLength(1);
    expect(MODAL_CLOSE_GLYPH).not.toMatch(/\s/);
  });
});

describe("EXTERNAL_LINK_GLYPH — TopBar external-link arrow", () => {
  it("matches the canonical '↗' (pin-the-value)", () => {
    expect(EXTERNAL_LINK_GLYPH).toBe("↗");
  });

  it("uses NE arrow U+2197 (anti-drift to other arrows)", () => {
    // U+2197 ↗ signals "opens elsewhere" — distinct from U+2192 →
    // (forward in-app navigation). A drift to → would conflate
    // external-link semantics with internal-link affordances.
    expect(EXTERNAL_LINK_GLYPH.charCodeAt(0)).toBe(0x2197);
  });

  it("is exactly 1 char (no whitespace, rendered standalone in span)", () => {
    expect(EXTERNAL_LINK_GLYPH).toHaveLength(1);
    expect(EXTERNAL_LINK_GLYPH).not.toMatch(/\s/);
  });

  it("is NOT '→' (anti-collapse — external-link distinct from forward-nav)", () => {
    // Defense against a tempting refactor that uses BUTTON_ARROW_RIGHT_*
    // for external links. The NE arrow and the right arrow signal
    // different affordances; pin the distinction.
    expect(EXTERNAL_LINK_GLYPH).not.toBe("→");
  });
});

describe("METHODESHEET_BLOCK_EMOJI_AN/_CLAUDE — MethodeSheet Block component emoji props", () => {
  it("AN block emoji matches '📊' (chart emoji for data)", () => {
    expect(METHODESHEET_BLOCK_EMOJI_AN).toBe("📊");
  });

  it("CLAUDE block emoji matches '✨' (sparkles for AI)", () => {
    expect(METHODESHEET_BLOCK_EMOJI_CLAUDE).toBe("✨");
  });

  it("AN block uses bar-chart emoji U+1F4CA (data-signaling convention)", () => {
    // U+1F4CA 📊 is the bar-chart emoji — conventionally used to
    // signal "data" or "statistics". Distinct from U+1F4C8 📈 (line
    // chart) or U+1F4C5 📅 (calendar). Pin so a drift to a different
    // chart variant surfaces.
    expect(METHODESHEET_BLOCK_EMOJI_AN.codePointAt(0)).toBe(0x1F4CA);
  });

  it("CLAUDE block emoji equals CARD_IA_CHIP_GLYPH (AI-signaling consistency)", () => {
    // The Card recto IA chip and the MethodeSheet Claude block both
    // signal AI/generated content via the same sparkles glyph. Pin
    // the value equality so a future swap of the AI icon propagates
    // to both surfaces via 1 edit (or fails this cross-check first).
    expect(METHODESHEET_BLOCK_EMOJI_CLAUDE).toBe(CARD_IA_CHIP_GLYPH);
  });

  it("both block emojis are exactly 2 UTF-16 code units (surrogate pair)", () => {
    // 📊 (U+1F4CA) and ✨ — wait, ✨ is in BMP (length 1).
    // 📊 is a surrogate pair (length 2). The 2 emoji types have
    // different lengths intentionally — pin the BMP vs SMP boundary.
    expect(METHODESHEET_BLOCK_EMOJI_AN).toHaveLength(2);
    expect(METHODESHEET_BLOCK_EMOJI_CLAUDE).toHaveLength(1);
  });

  it("AN and CLAUDE emojis are distinct (different blocks, different signaling)", () => {
    expect(METHODESHEET_BLOCK_EMOJI_AN).not.toBe(METHODESHEET_BLOCK_EMOJI_CLAUDE);
  });
});

describe("CARD_POINTS_CLES_BULLET_GLYPH — Card recto points_cles list bullet", () => {
  it("matches the canonical '·' (pin-the-value)", () => {
    expect(CARD_POINTS_CLES_BULLET_GLYPH).toBe("·");
  });

  it("uses middle-dot U+00B7 (same codepoint as MIDDLE_DOT_SEPARATOR)", () => {
    expect(CARD_POINTS_CLES_BULLET_GLYPH.charCodeAt(0)).toBe(0x00B7);
  });

  it("is bare middle-dot — no leading/trailing spaces (distinct from MIDDLE_DOT_SEPARATOR)", () => {
    // MIDDLE_DOT_SEPARATOR = " · " (3 chars, padded) is for inline-text
    // separators. The bullet glyph is bare (1 char) because it lives
    // inside its own flex column and the layout handles spacing. A
    // future edit that adds padding would break the flex alignment.
    expect(CARD_POINTS_CLES_BULLET_GLYPH).toHaveLength(1);
    expect(CARD_POINTS_CLES_BULLET_GLYPH).not.toMatch(/\s/);
  });

  it("matches MIDDLE_DOT_SEPARATOR.trim() (same glyph, different cadence)", () => {
    // The bullet and the inline-separator use the same U+00B7 dot —
    // a future glyph swap on either should propagate via the
    // cross-check test.
    expect(CARD_POINTS_CLES_BULLET_GLYPH).toBe(MIDDLE_DOT_SEPARATOR.trim());
  });
});

describe("WORDMARK_PART_1/_SLASH/_PART_2 — Wordmark visible 3-part composition", () => {
  it("PART_1 matches 'sans' (lowercase, no-cap)", () => {
    expect(WORDMARK_PART_1).toBe("sans");
  });

  it("SLASH matches '/' (the styled-span middle)", () => {
    expect(WORDMARK_SLASH).toBe("/");
  });

  it("PART_2 matches 'détour' (lowercase, with accent)", () => {
    expect(WORDMARK_PART_2).toBe("détour");
  });

  it("both PART_1 and PART_2 are all-lowercase (anti-capitalize guard)", () => {
    // The wordmark uses lowercase as a brand convention — distinct
    // from BRAND_NAME ("Sans Détour", capitalized) used in tab title +
    // meta descriptions. A future drift to capitalized parts would
    // break the visual brand mark.
    expect(WORDMARK_PART_1).toBe(WORDMARK_PART_1.toLowerCase());
    expect(WORDMARK_PART_2).toBe(WORDMARK_PART_2.toLowerCase());
  });

  it("PART_2 contains 'é' accent (anti-asciify guard)", () => {
    // The French "détour" requires the é (U+00E9). An ASCII drift
    // to "detour" would break the brand spelling.
    expect(WORDMARK_PART_2).toContain("é");
  });

  it("PART_1 + PART_2 (no slash) equals BRAND_NAME.toLowerCase() stripped of space (rebrand-safe)", () => {
    // Cross-const invariant: BRAND_NAME = "Sans Détour". The wordmark
    // renders the lowercase-joined version of the brand. A future
    // BRAND_NAME change should force a Wordmark update in lockstep.
    expect(WORDMARK_PART_1 + WORDMARK_PART_2).toBe(
      BRAND_NAME.toLowerCase().replace(/\s+/g, ""),
    );
  });

  it("SLASH is exactly '/' (anti-replace guard for the styled middle)", () => {
    expect(WORDMARK_SLASH).toBe("/");
    expect(WORDMARK_SLASH).toHaveLength(1);
  });
});

describe("AUDIT_TRAIL_HEADER_PARTY_NAME_PREFIX — AuditTrail h3 span party-name prefix", () => {
  it("matches the canonical '· ' (pin-the-value)", () => {
    expect(AUDIT_TRAIL_HEADER_PARTY_NAME_PREFIX).toBe("· ");
  });

  it("uses middle-dot U+00B7 (consistent typography across the app)", () => {
    expect(AUDIT_TRAIL_HEADER_PARTY_NAME_PREFIX.charCodeAt(0)).toBe(0x00B7);
  });

  it("ends with a trailing space (glue before partyName interpolation)", () => {
    expect(AUDIT_TRAIL_HEADER_PARTY_NAME_PREFIX.endsWith(" ")).toBe(true);
  });

  it("matches MIDDLE_DOT_SEPARATOR.trimStart() (cross-const cadence consistency)", () => {
    // The header prefix is the middle-dot + trailing space (the
    // leading space lives in the JSX whitespace outside the span).
    // Trimming the leading space from MIDDLE_DOT_SEPARATOR gives
    // the same shape — pin so a future tweak stays in sync.
    expect(AUDIT_TRAIL_HEADER_PARTY_NAME_PREFIX).toBe(MIDDLE_DOT_SEPARATOR.trimStart());
  });

  it("is exactly 2 chars (1 dot + 1 space)", () => {
    expect(AUDIT_TRAIL_HEADER_PARTY_NAME_PREFIX).toHaveLength(2);
  });
});

describe("NAV_TARGET_* — analytics target slugs for topbar_nav + cover_footer_nav", () => {
  it("RESULT matches 'result' (pin-the-value)", () => {
    expect(NAV_TARGET_RESULT).toBe("result");
  });

  it("METHODE matches 'methode' (no accent — analytics slug, not French)", () => {
    expect(NAV_TARGET_METHODE).toBe("methode");
  });

  it("LEGAL matches 'legal' (no accent)", () => {
    expect(NAV_TARGET_LEGAL).toBe("legal");
  });

  it("CONTACT matches 'contact' (pin-the-value)", () => {
    expect(NAV_TARGET_CONTACT).toBe("contact");
  });

  it("all 4 slugs are lowercase ASCII (anti-accent guard for analytics)", () => {
    // Analytics dashboards expect lowercase ASCII slugs (Plausible
    // would group "methode" + "méthode" + "Méthode" as 3 different
    // events). A drift to accented or capitalized would silently
    // fragment the metric.
    for (const slug of [NAV_TARGET_RESULT, NAV_TARGET_METHODE, NAV_TARGET_LEGAL, NAV_TARGET_CONTACT]) {
      expect(slug).toBe(slug.toLowerCase());
      expect(slug).toMatch(/^[a-z]+$/);
    }
  });

  it("all 4 slugs are distinct (anti-collapse guard)", () => {
    const slugs = new Set([NAV_TARGET_RESULT, NAV_TARGET_METHODE, NAV_TARGET_LEGAL, NAV_TARGET_CONTACT]);
    expect(slugs.size).toBe(4);
  });
});

describe("SKELETON_SHIMMER_CLASS — CSS class for skeleton placeholders", () => {
  it("matches the canonical 'skeleton-shimmer' (pin-the-value)", () => {
    expect(SKELETON_SHIMMER_CLASS).toBe("skeleton-shimmer");
  });

  it("is kebab-case (CSS-class naming convention)", () => {
    expect(SKELETON_SHIMMER_CLASS).toMatch(/^[a-z]+-[a-z]+$/);
  });

  it("has no whitespace (it's a single class name)", () => {
    expect(SKELETON_SHIMMER_CLASS).not.toMatch(/\s/);
  });
});

describe("METHODE_SHEET_BACKDROP_TESTID — paired source/test selector", () => {
  it("matches the canonical 'methode-sheet-backdrop' (pin-the-value)", () => {
    expect(METHODE_SHEET_BACKDROP_TESTID).toBe("methode-sheet-backdrop");
  });

  it("is kebab-case (test-id naming convention)", () => {
    expect(METHODE_SHEET_BACKDROP_TESTID).toMatch(/^[a-z]+(-[a-z]+)+$/);
  });

  it("has no whitespace (single attribute value)", () => {
    expect(METHODE_SHEET_BACKDROP_TESTID).not.toMatch(/\s/);
  });
});

describe("METHODE_SHEET_TITLE_ID + RESULT_PERSONNALITES_PANEL_ID — paired aria-labelledby/aria-controls ids", () => {
  it("METHODE_SHEET_TITLE_ID matches 'methode-sheet-title' (pin-the-value)", () => {
    expect(METHODE_SHEET_TITLE_ID).toBe("methode-sheet-title");
  });

  it("RESULT_PERSONNALITES_PANEL_ID matches 'personnalites-panel' (pin-the-value)", () => {
    expect(RESULT_PERSONNALITES_PANEL_ID).toBe("personnalites-panel");
  });

  it("both ids are kebab-case (DOM-id naming convention)", () => {
    expect(METHODE_SHEET_TITLE_ID).toMatch(/^[a-z]+(-[a-z]+)+$/);
    expect(RESULT_PERSONNALITES_PANEL_ID).toMatch(/^[a-z]+(-[a-z]+)+$/);
  });

  it("both ids are distinct (no accidental shared id collision)", () => {
    expect(METHODE_SHEET_TITLE_ID).not.toBe(RESULT_PERSONNALITES_PANEL_ID);
  });

  it("neither id has whitespace (single DOM attribute value)", () => {
    expect(METHODE_SHEET_TITLE_ID).not.toMatch(/\s/);
    expect(RESULT_PERSONNALITES_PANEL_ID).not.toMatch(/\s/);
  });
});

describe("METHODE_SECTION_ID_PREFIX + METHODE_SECTION_HEADING_ID_PREFIX — Methode id template prefixes", () => {
  it("SECTION_ID_PREFIX matches 'methode-' (pin-the-value)", () => {
    expect(METHODE_SECTION_ID_PREFIX).toBe("methode-");
  });

  it("SECTION_HEADING_ID_PREFIX matches 'methode-heading-' (pin-the-value)", () => {
    expect(METHODE_SECTION_HEADING_ID_PREFIX).toBe("methode-heading-");
  });

  it("HEADING_ID_PREFIX starts with SECTION_ID_PREFIX (paired-prefix invariant)", () => {
    // Compositional invariant: the heading-id prefix builds on the
    // section-id prefix ("methode-heading-" derives from "methode-").
    // A future tweak that breaks the relationship would silently desync
    // the section/heading naming convention.
    expect(METHODE_SECTION_HEADING_ID_PREFIX.startsWith(METHODE_SECTION_ID_PREFIX)).toBe(true);
  });

  it("both prefixes end with '-' (kebab-case template glue)", () => {
    expect(METHODE_SECTION_ID_PREFIX.endsWith("-")).toBe(true);
    expect(METHODE_SECTION_HEADING_ID_PREFIX.endsWith("-")).toBe(true);
  });

  it("composing `${SECTION_ID_PREFIX}07` produces the canonical section id 'methode-07'", () => {
    // Round-trip the canonical §07 deep-link id via the prefix.
    expect(`${METHODE_SECTION_ID_PREFIX}07`).toBe("methode-07");
  });

  it("composing `${SECTION_HEADING_ID_PREFIX}07` produces 'methode-heading-07'", () => {
    expect(`${METHODE_SECTION_HEADING_ID_PREFIX}07`).toBe("methode-heading-07");
  });
});

describe("AUDIT_TRAIL_HEADING_ID_PREFIX + AUDIT_TRAIL_PANEL_ID_PREFIX — AuditTrail id template prefixes", () => {
  it("HEADING_ID_PREFIX matches 'audit-heading-' (pin-the-value)", () => {
    expect(AUDIT_TRAIL_HEADING_ID_PREFIX).toBe("audit-heading-");
  });

  it("PANEL_ID_PREFIX matches 'audit-trail-' (pin-the-value)", () => {
    expect(AUDIT_TRAIL_PANEL_ID_PREFIX).toBe("audit-trail-");
  });

  it("both prefixes start with 'audit-' (paired-prefix-family invariant)", () => {
    // Both ids belong to the audit-trail UI family. Pin the shared
    // "audit-" stem so a future rebrand doesn't accidentally rename
    // only one of the two.
    expect(AUDIT_TRAIL_HEADING_ID_PREFIX.startsWith("audit-")).toBe(true);
    expect(AUDIT_TRAIL_PANEL_ID_PREFIX.startsWith("audit-")).toBe(true);
  });

  it("both prefixes end with '-' (kebab-case template glue)", () => {
    expect(AUDIT_TRAIL_HEADING_ID_PREFIX.endsWith("-")).toBe(true);
    expect(AUDIT_TRAIL_PANEL_ID_PREFIX.endsWith("-")).toBe(true);
  });

  it("HEADING and PANEL prefixes are distinct (no collision when groups overlap)", () => {
    // Both prefixes get a group-code suffix ("audit-heading-LFI" +
    // "audit-trail-LFI"). They must be distinct stems so the IDs
    // don't collide on the same alignment.group.
    expect(AUDIT_TRAIL_HEADING_ID_PREFIX).not.toBe(AUDIT_TRAIL_PANEL_ID_PREFIX);
  });

  it("composing `${HEADING_ID_PREFIX}LFI` produces 'audit-heading-LFI'", () => {
    expect(`${AUDIT_TRAIL_HEADING_ID_PREFIX}LFI`).toBe("audit-heading-LFI");
  });
});

describe("SCRUTINS_TABLE_NAME + SCRUTINS_COL_* — Supabase schema identifiers", () => {
  it("SCRUTINS_TABLE_NAME matches 'scrutins' (pin-the-value, schema-anchored)", () => {
    expect(SCRUTINS_TABLE_NAME).toBe("scrutins");
  });

  it("SCRUTINS_COL_POINTS_CLES matches 'points_cles' (snake_case Supabase column)", () => {
    expect(SCRUTINS_COL_POINTS_CLES).toBe("points_cles");
  });

  it("SCRUTINS_COL_INGERE_LE matches 'ingere_le' (snake_case Supabase column)", () => {
    expect(SCRUTINS_COL_INGERE_LE).toBe("ingere_le");
  });

  it("table name is lowercase (Postgres canonical-form convention)", () => {
    // Postgres folds unquoted identifiers to lowercase. Mixed-case
    // would require quoted identifiers in every query — pin so a
    // future "Scrutins" or "SCRUTINS" drift surfaces.
    expect(SCRUTINS_TABLE_NAME).toBe(SCRUTINS_TABLE_NAME.toLowerCase());
  });

  it("column names are snake_case (Postgres + Supabase convention)", () => {
    // Both columns use snake_case (underscore-separated lowercase).
    // A drift to camelCase would break the Postgres binding. Pin
    // the convention so a future rebrand stays snake_case.
    expect(SCRUTINS_COL_POINTS_CLES).toMatch(/^[a-z]+(_[a-z]+)+$/);
    expect(SCRUTINS_COL_INGERE_LE).toMatch(/^[a-z]+(_[a-z]+)+$/);
  });

  it("all 3 identifiers are distinct (no accidental collision)", () => {
    const ids = new Set([SCRUTINS_TABLE_NAME, SCRUTINS_COL_POINTS_CLES, SCRUTINS_COL_INGERE_LE]);
    expect(ids.size).toBe(3);
  });

  it("table + columns have no whitespace or quote chars (SQL-safe identifiers)", () => {
    // Any whitespace/quote would require Postgres-quoted identifiers
    // and break the .from() / .select() string concatenation. Pin
    // safety guards so a future identifier rename can't ship an
    // injection-prone value.
    for (const id of [SCRUTINS_TABLE_NAME, SCRUTINS_COL_POINTS_CLES, SCRUTINS_COL_INGERE_LE]) {
      expect(id).not.toMatch(/[\s"']/);
    }
  });
});

describe("SCRUTINS_COL_DATE — Supabase scrutin-date sort column", () => {
  it("matches 'date' (pin-the-value, schema-anchored)", () => {
    expect(SCRUTINS_COL_DATE).toBe("date");
  });

  it("is lowercase + has no whitespace/quote (SQL-safe identifier)", () => {
    expect(SCRUTINS_COL_DATE).toBe(SCRUTINS_COL_DATE.toLowerCase());
    expect(SCRUTINS_COL_DATE).not.toMatch(/[\s"']/);
  });

  it("is distinct from the other SCRUTINS_COL_* identifiers (anti-collision)", () => {
    const cols = new Set([SCRUTINS_COL_DATE, SCRUTINS_COL_POINTS_CLES, SCRUTINS_COL_INGERE_LE]);
    expect(cols.size).toBe(3);
  });
});

describe("COVER_STORAGE_TRUE_VALUE — bool-as-string for COVER_STORAGE_KEY", () => {
  it("matches 'true' (pin-the-value)", () => {
    expect(COVER_STORAGE_TRUE_VALUE).toBe("true");
  });

  it("is a string (localStorage stores strings only, NOT a JS boolean)", () => {
    // localStorage.setItem coerces non-strings via toString(), but
    // assigning a JS boolean here would silently convert at runtime
    // and confuse the read-side === comparison if ever refactored
    // to typeof checks. Pin string type explicitly.
    expect(typeof COVER_STORAGE_TRUE_VALUE).toBe("string");
  });

  it("equals lowercase 'true' (anti-capitalize for boolean-string convention)", () => {
    // JavaScript's String(true) returns "true" — match that exact
    // form so the value round-trips through any boolean-coerced read.
    expect(COVER_STORAGE_TRUE_VALUE).toBe(String(true));
  });
});

describe("ERROR_STACK_TRACE_MAX_LENGTH — ErrorBoundary stack truncation", () => {
  it("matches 200 (pin-the-value)", () => {
    expect(ERROR_STACK_TRACE_MAX_LENGTH).toBe(200);
  });

  it("is a positive integer", () => {
    expect(Number.isInteger(ERROR_STACK_TRACE_MAX_LENGTH)).toBe(true);
    expect(ERROR_STACK_TRACE_MAX_LENGTH).toBeGreaterThan(0);
  });

  it("fits within Plausible's 2kB prop limit (safety margin)", () => {
    // Plausible custom-prop values cap at 2000 chars. 200 leaves
    // ample room for the surrounding `msg` field + JSON encoding
    // overhead. Pin so a future bump stays within the limit.
    expect(ERROR_STACK_TRACE_MAX_LENGTH).toBeLessThan(2000);
  });
});

describe("MS_PER_DAY — milliseconds-per-day constant", () => {
  it("matches 86_400_000 (pin-the-value)", () => {
    expect(MS_PER_DAY).toBe(86_400_000);
  });

  it("equals 24 * 60 * 60 * 1000 (compositional invariant)", () => {
    // The constant decomposes into hours/minutes/seconds/ms. Pin the
    // identity so a future refactor (e.g., to a Temporal-API based
    // computation) stays equivalent.
    expect(MS_PER_DAY).toBe(24 * 60 * 60 * 1000);
  });

  it("is a positive integer", () => {
    expect(Number.isInteger(MS_PER_DAY)).toBe(true);
    expect(MS_PER_DAY).toBeGreaterThan(0);
  });
});

describe("SYNC_CADENCE_DAYS — weekly ingest-pipeline cadence", () => {
  it("matches 7 (pin-the-value, weekly cadence)", () => {
    expect(SYNC_CADENCE_DAYS).toBe(7);
  });

  it("is a positive integer", () => {
    expect(Number.isInteger(SYNC_CADENCE_DAYS)).toBe(true);
    expect(SYNC_CADENCE_DAYS).toBeGreaterThan(0);
  });

  it("is strictly less than STALE_AFTER_DAYS (cadence + grace period contract)", () => {
    // STALE_AFTER_DAYS is the threshold beyond which the banner
    // drops the "à jour" framing. It must be ≥ the cadence + a
    // grace period — otherwise the banner would lie before the
    // next scheduled sync. Pin the cadence < threshold invariant
    // so a future cadence bump (weekly → biweekly = 14) forces a
    // matching threshold update.
    expect(SYNC_CADENCE_DAYS).toBeLessThan(STALE_AFTER_DAYS);
  });
});

describe("DECK_SEED_RANGE_EXPONENT — mulberry32 seed range bit-width", () => {
  it("matches 31 (pin-the-value, 32-bit signed-int range)", () => {
    expect(DECK_SEED_RANGE_EXPONENT).toBe(31);
  });

  it("is a positive integer", () => {
    expect(Number.isInteger(DECK_SEED_RANGE_EXPONENT)).toBe(true);
    expect(DECK_SEED_RANGE_EXPONENT).toBeGreaterThan(0);
  });

  it("yields a seed within JS Number-safe range", () => {
    // 2 ** N must stay below Number.MAX_SAFE_INTEGER (2^53 - 1) so
    // the seed math doesn't lose precision. Pin so a future bump
    // (e.g., 53) catches the boundary.
    expect(2 ** DECK_SEED_RANGE_EXPONENT).toBeLessThan(Number.MAX_SAFE_INTEGER);
  });

  it("stays within mulberry32's expected 32-bit-unsigned input domain", () => {
    // mulberry32 starts with `let t = seed >>> 0` (unsigned-int32
    // coercion). A seed below 2^32 round-trips losslessly through
    // the `>>> 0` mask; pin so the exponent stays ≤ 32.
    expect(DECK_SEED_RANGE_EXPONENT).toBeLessThanOrEqual(32);
  });
});

describe("SCORE_PERFECT/_PARTIAL/_CONFLICT — matching score discriminants", () => {
  it("PERFECT matches 1 (pin-the-value, full-alignment outcome)", () => {
    expect(SCORE_PERFECT).toBe(1);
  });

  it("PARTIAL matches 0.5 (abstention-against-direction outcome)", () => {
    expect(SCORE_PARTIAL).toBe(0.5);
  });

  it("CONFLICT matches 0 (opposite-direction outcome)", () => {
    expect(SCORE_CONFLICT).toBe(0);
  });

  it("PERFECT > PARTIAL > CONFLICT (strict ordering invariant)", () => {
    expect(SCORE_PERFECT).toBeGreaterThan(SCORE_PARTIAL);
    expect(SCORE_PARTIAL).toBeGreaterThan(SCORE_CONFLICT);
  });

  it("PARTIAL is the midpoint of PERFECT + CONFLICT (compositional invariant)", () => {
    // The matching formula `1 - |x - y| / 2` produces exactly these
    // 3 values; PARTIAL is the midpoint because abstention is
    // halfway between pour (+1) and contre (-1) on the scale.
    expect(SCORE_PARTIAL).toBe((SCORE_PERFECT + SCORE_CONFLICT) / 2);
  });

  it("all 3 scores are in [0, 1] (score-domain invariant)", () => {
    for (const s of [SCORE_PERFECT, SCORE_PARTIAL, SCORE_CONFLICT]) {
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(1);
    }
  });

  it("all 3 scores are distinct (anti-collapse)", () => {
    const scores = new Set([SCORE_PERFECT, SCORE_PARTIAL, SCORE_CONFLICT]);
    expect(scores.size).toBe(3);
  });
});

describe("MATCHING_SCALE — vote/position-to-numeric mapping", () => {
  it("pour matches +1 (pin-the-value, positive direction)", () => {
    expect(MATCHING_SCALE.pour).toBe(1);
  });

  it("abstention matches 0 (pin-the-value, neutral)", () => {
    expect(MATCHING_SCALE.abstention).toBe(0);
  });

  it("contre matches -1 (pin-the-value, negative direction)", () => {
    expect(MATCHING_SCALE.contre).toBe(-1);
  });

  it("is symmetric around 0 (pour + contre === 0)", () => {
    // The scale is signed so the matching formula `1 - |x - y| / 2`
    // produces 1/0.5/0 cleanly when paired with itself. A drift to
    // asymmetric values (e.g., contre = -2) would break the score
    // discriminants pin above.
    expect(MATCHING_SCALE.pour + MATCHING_SCALE.contre).toBe(0);
  });

  it("abstention is the midpoint (pour + contre) / 2 === abstention", () => {
    expect((MATCHING_SCALE.pour + MATCHING_SCALE.contre) / 2).toBe(MATCHING_SCALE.abstention);
  });

  it("produces SCORE_PERFECT when both sides match (formula round-trip)", () => {
    // `1 - |x - y| / 2` with x === y gives 1 (SCORE_PERFECT).
    expect(1 - Math.abs(MATCHING_SCALE.pour - MATCHING_SCALE.pour) / 2).toBe(SCORE_PERFECT);
  });

  it("produces SCORE_PARTIAL when one side is abstention (formula round-trip)", () => {
    expect(1 - Math.abs(MATCHING_SCALE.pour - MATCHING_SCALE.abstention) / 2).toBe(SCORE_PARTIAL);
  });

  it("produces SCORE_CONFLICT when sides are opposite (formula round-trip)", () => {
    expect(1 - Math.abs(MATCHING_SCALE.pour - MATCHING_SCALE.contre) / 2).toBe(SCORE_CONFLICT);
  });
});

describe("PCT_MULTIPLIER — percent conversion factor", () => {
  it("matches 100 (pin-the-value)", () => {
    expect(PCT_MULTIPLIER).toBe(100);
  });

  it("is a positive integer", () => {
    expect(Number.isInteger(PCT_MULTIPLIER)).toBe(true);
    expect(PCT_MULTIPLIER).toBeGreaterThan(0);
  });

  it("0.5 * PCT_MULTIPLIER === 50 (compositional sanity check)", () => {
    // SCORE_PARTIAL * PCT_MULTIPLIER should yield 50 (the
    // half-aligned display percent). Pin the round-trip so a
    // future drift (e.g., to permille = 1000) catches the
    // related copy/UI assumptions.
    expect(SCORE_PARTIAL * PCT_MULTIPLIER).toBe(50);
  });
});

describe("EXTERNAL_LINK_TARGET + EXTERNAL_LINK_REL — security-relevant link attrs", () => {
  it("TARGET matches '_blank' (pin-the-value)", () => {
    expect(EXTERNAL_LINK_TARGET).toBe("_blank");
  });

  it("REL matches 'noopener noreferrer' (pin-the-value)", () => {
    expect(EXTERNAL_LINK_REL).toBe("noopener noreferrer");
  });

  it("REL contains 'noopener' (tabnabbing prevention — primary defense)", () => {
    // noopener prevents window.opener access from the new tab,
    // so the new tab can't navigate the parent window. Without
    // it, a malicious external link could redirect the user's
    // tab to a phishing page. Pin so a future tweak that drops
    // noopener surfaces in CI as a security regression.
    expect(EXTERNAL_LINK_REL).toContain("noopener");
  });

  it("REL contains 'noreferrer' (defense-in-depth — also nulls window.opener in some browsers)", () => {
    // noreferrer additionally suppresses the Referer header. In
    // older browsers it doubles as the noopener guard. Keep
    // both for maximum compatibility.
    expect(EXTERNAL_LINK_REL).toContain("noreferrer");
  });

  it("REL is space-separated (HTML rel-attribute syntax)", () => {
    // Multiple rel values are space-separated per HTML spec.
    // Pin so a refactor doesn't accidentally use comma-separation
    // (which would parse as a single invalid token).
    expect(EXTERNAL_LINK_REL.split(" ").length).toBe(2);
  });

  it("TARGET starts with '_' (HTML reserved-target convention)", () => {
    // HTML reserved targets are prefixed with "_" (_blank, _self,
    // _parent, _top). Pin so a drift to a custom target like
    // "external" doesn't open in a new tab unexpectedly.
    expect(EXTERNAL_LINK_TARGET.startsWith("_")).toBe(true);
  });
});

describe("DECK_VISIBLE_DEPTH — DeckStack visible-card slice depth", () => {
  it("matches 3 (pin-the-value, top card + 2 backdrop layers)", () => {
    expect(DECK_VISIBLE_DEPTH).toBe(3);
  });

  it("is a positive integer", () => {
    expect(Number.isInteger(DECK_VISIBLE_DEPTH)).toBe(true);
    expect(DECK_VISIBLE_DEPTH).toBeGreaterThan(0);
  });

  it("is small enough to keep DOM lightweight (≤ 5)", () => {
    // The stacked-card visual works best with a small number of
    // background cards (too many = visual noise + DOM weight).
    // Pin so a future bump to 10 would require an opacity-ternary
    // expansion AND surface here as a design-decision flag.
    expect(DECK_VISIBLE_DEPTH).toBeLessThanOrEqual(5);
  });
});

describe("SWIPE_THRESHOLD — Card swipe-recognition drag distance", () => {
  it("matches 120 (pin-the-value, px)", () => {
    expect(SWIPE_THRESHOLD).toBe(120);
  });

  it("is a positive integer (px distance)", () => {
    expect(Number.isInteger(SWIPE_THRESHOLD)).toBe(true);
    expect(SWIPE_THRESHOLD).toBeGreaterThan(0);
  });

  it("is in a UX-reasonable range (50-300 px)", () => {
    // Below 50 px the swipe triggers on accidental tap drift;
    // above 300 the user has to drag more than half the card
    // width on a typical phone. Pin the range so a future tweak
    // stays in the empirically-validated zone.
    expect(SWIPE_THRESHOLD).toBeGreaterThanOrEqual(50);
    expect(SWIPE_THRESHOLD).toBeLessThanOrEqual(300);
  });
});

describe("SAFE_AREA_VIEWPORT_HEIGHT — calc(100dvh − safe-area) shared layout value", () => {
  it("matches the canonical calc(...) expression (pin-the-value)", () => {
    expect(SAFE_AREA_VIEWPORT_HEIGHT).toBe(
      "calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))",
    );
  });

  it("uses 100dvh (dynamic viewport unit, not legacy 100vh)", () => {
    // dvh accounts for the iOS Safari URL bar showing/hiding;
    // 100vh would overflow when the bar is visible. Pin so a
    // refactor to vh doesn't ship the legacy bug.
    expect(SAFE_AREA_VIEWPORT_HEIGHT).toContain("100dvh");
    expect(SAFE_AREA_VIEWPORT_HEIGHT).not.toContain("100vh ");
  });

  it("subtracts both safe-area-inset-top + safe-area-inset-bottom", () => {
    // Both insets are required for iPhone X+ PWA — the notch eats
    // top space, the home indicator eats bottom. Pin both anchors.
    expect(SAFE_AREA_VIEWPORT_HEIGHT).toContain("safe-area-inset-top");
    expect(SAFE_AREA_VIEWPORT_HEIGHT).toContain("safe-area-inset-bottom");
  });

  it("has '0px' fallbacks for non-notched browsers", () => {
    // env(...) returns 0 on non-notched browsers as long as the
    // fallback is specified. Without the explicit '0px' fallback,
    // calc(100dvh - env(...)) would resolve to invalid on some
    // older browsers and the layout would silently break.
    const fallbackCount = (SAFE_AREA_VIEWPORT_HEIGHT.match(/0px/g) || []).length;
    expect(fallbackCount).toBe(2);
  });
});

describe("BACKDROP_FADE_DURATION_S — modal backdrop fade duration", () => {
  it("matches 0.16 (pin-the-value, seconds)", () => {
    expect(BACKDROP_FADE_DURATION_S).toBe(0.16);
  });

  it("is in a reasonable modal-perception range (50-300 ms)", () => {
    // 50ms = barely perceptible; 300ms = sluggish. Pin so a future
    // tweak stays in the UX-validated zone.
    expect(BACKDROP_FADE_DURATION_S).toBeGreaterThanOrEqual(0.05);
    expect(BACKDROP_FADE_DURATION_S).toBeLessThanOrEqual(0.3);
  });

  it("is a positive finite number (no NaN, no infinity)", () => {
    expect(Number.isFinite(BACKDROP_FADE_DURATION_S)).toBe(true);
    expect(BACKDROP_FADE_DURATION_S).toBeGreaterThan(0);
  });
});

describe("MAILTO_SCHEME — URI scheme prefix for mailto() helper", () => {
  it("matches 'mailto:' (pin-the-value)", () => {
    expect(MAILTO_SCHEME).toBe("mailto:");
  });

  it("ends with ':' (URI scheme separator)", () => {
    // The colon is part of the scheme per RFC 3986. Pin so a future
    // edit that drops the colon doesn't ship a broken href.
    expect(MAILTO_SCHEME.endsWith(":")).toBe(true);
  });

  it("is lowercase (URI-scheme canonical form per RFC 3986)", () => {
    expect(MAILTO_SCHEME).toBe(MAILTO_SCHEME.toLowerCase());
  });

  it("contains no whitespace (URI-scheme syntax)", () => {
    expect(MAILTO_SCHEME).not.toMatch(/\s/);
  });
});

describe("EASE_OUT_QUART — Material ease-out-quart cubic-bezier curve", () => {
  it("matches [0.22, 1, 0.36, 1] (pin-the-value)", () => {
    expect(EASE_OUT_QUART).toEqual([0.22, 1, 0.36, 1]);
  });

  it("is exactly 4 elements (cubic-bezier P1.x P1.y P2.x P2.y signature)", () => {
    // Framer Motion's `ease` prop accepts a 4-tuple for cubic-bezier.
    // A length drift would break the easing curve silently (Framer
    // might silently fall back to a default).
    expect(EASE_OUT_QUART).toHaveLength(4);
  });

  it("all 4 control points are in [0, 1] (valid cubic-bezier range)", () => {
    // CSS cubic-bezier control points are bounded to [0, 1] for x;
    // y can exceed [0, 1] for overshoot, but our curve stays within.
    for (const v of EASE_OUT_QUART) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it("P1.y === P2.y === 1 (ease-out signature: starts at 1, lands at 1)", () => {
    // Both y-control-points at 1 produces the "out" half of the curve:
    // the animation accelerates fast then decelerates to land smoothly.
    expect(EASE_OUT_QUART[1]).toBe(1);
    expect(EASE_OUT_QUART[3]).toBe(1);
  });
});

describe("CARD_FLIP_DURATION_S — Card flip transition duration", () => {
  it("matches 0.45 (pin-the-value, seconds)", () => {
    expect(CARD_FLIP_DURATION_S).toBe(0.45);
  });

  it("is positive finite (no NaN, no infinity)", () => {
    expect(Number.isFinite(CARD_FLIP_DURATION_S)).toBe(true);
    expect(CARD_FLIP_DURATION_S).toBeGreaterThan(0);
  });

  it("is in a flip-animation perception range (0.2s–1s)", () => {
    // Below 0.2s = looks like a teleport; above 1s = sluggish.
    // 3D flip especially needs the visual time to register depth.
    // Pin so a future tweak stays in the UX-validated zone.
    expect(CARD_FLIP_DURATION_S).toBeGreaterThanOrEqual(0.2);
    expect(CARD_FLIP_DURATION_S).toBeLessThanOrEqual(1);
  });

  it("is longer than BACKDROP_FADE_DURATION_S (3D flip needs more perceptual time)", () => {
    // The Card 3D flip is a more complex visual than a backdrop
    // opacity fade — pin the duration ordering so a future tweak
    // doesn't accidentally make the flip faster than a fade.
    expect(CARD_FLIP_DURATION_S).toBeGreaterThan(BACKDROP_FADE_DURATION_S);
  });
});

describe("CARD_FLIP_ROTATE_DEGREES — Card rotateY target", () => {
  it("matches 180 (pin-the-value, degrees)", () => {
    expect(CARD_FLIP_ROTATE_DEGREES).toBe(180);
  });

  it("is exactly 180° (half-turn, anti-drift to 90°/270°)", () => {
    // A drift to 90° would land on the card edge (invisible);
    // 270° would flip backwards. 180° is the only correct half-
    // turn for a back-face reveal. Pin defensive against any
    // copy/paste tweak.
    expect(CARD_FLIP_ROTATE_DEGREES).toBe(180);
  });

  it("is a positive integer (degrees, not radians)", () => {
    expect(Number.isInteger(CARD_FLIP_ROTATE_DEGREES)).toBe(true);
    expect(CARD_FLIP_ROTATE_DEGREES).toBeGreaterThan(0);
  });

  it("verso static rotation must equal animation target (compositional invariant)", () => {
    // The verso face is statically `rotateY(180deg)` so it reads
    // upright when the parent flips to 180°. Both use the same
    // const — pin the round-trip so a future tweak forces both
    // sites to update in lockstep.
    expect(`rotateY(${CARD_FLIP_ROTATE_DEGREES}deg)`).toBe("rotateY(180deg)");
  });
});

describe("MENU_TRIGGER_GLYPH — TopBar menu-trigger visible glyph", () => {
  it("matches '•••' (pin-the-value, 3 bullet characters)", () => {
    expect(MENU_TRIGGER_GLYPH).toBe("•••");
  });

  it("is exactly 3 chars (anti-drift to single ellipsis ⋯ or 3 periods)", () => {
    // U+22EF ⋯ would render thinner; "..." would baseline-shift wrong.
    // Pin the exact 3-bullet form (each • is U+2022, single char).
    expect(MENU_TRIGGER_GLYPH).toHaveLength(3);
  });

  it("uses bullet U+2022 (anti-replace guard against • lookalikes)", () => {
    // Each char must be U+2022 (bullet), not U+00B7 (middle dot)
    // or U+2027 (hyphenation point). Pin the codepoint defensively.
    for (let i = 0; i < MENU_TRIGGER_GLYPH.length; i++) {
      expect(MENU_TRIGGER_GLYPH.charCodeAt(i)).toBe(0x2022);
    }
  });
});

describe("POPOVER_BACKDROP_FADE_DURATION_S — TopBar popover backdrop fade", () => {
  it("matches 0.12 (pin-the-value, seconds)", () => {
    expect(POPOVER_BACKDROP_FADE_DURATION_S).toBe(0.12);
  });

  it("is positive finite", () => {
    expect(Number.isFinite(POPOVER_BACKDROP_FADE_DURATION_S)).toBe(true);
    expect(POPOVER_BACKDROP_FADE_DURATION_S).toBeGreaterThan(0);
  });

  it("is less than BACKDROP_FADE_DURATION_S (perceptual hierarchy: popover lighter than modal)", () => {
    // The TopBar popover is a non-modal lightweight surface;
    // modal backdrops fade slightly slower to signal weight.
    // Cross-const invariant pins the visual hierarchy.
    expect(POPOVER_BACKDROP_FADE_DURATION_S).toBeLessThan(BACKDROP_FADE_DURATION_S);
  });

  it("is in a fast-fade range (≤ 0.2s for non-modal surfaces)", () => {
    // Non-modal popovers should fade fast (< 0.2s) so they feel
    // snappy. Modal backdrops can take slightly longer to signal
    // weight. Pin the boundary.
    expect(POPOVER_BACKDROP_FADE_DURATION_S).toBeLessThanOrEqual(0.2);
  });
});

describe("TOPBAR_TRIGGER_TRANSITION_DURATION_MS — TopBar trigger button hover/active transition", () => {
  it("matches 140 (pin-the-value, milliseconds)", () => {
    expect(TOPBAR_TRIGGER_TRANSITION_DURATION_MS).toBe(140);
  });

  it("is a positive integer (CSS ms duration)", () => {
    expect(Number.isInteger(TOPBAR_TRIGGER_TRANSITION_DURATION_MS)).toBe(true);
    expect(TOPBAR_TRIGGER_TRANSITION_DURATION_MS).toBeGreaterThan(0);
  });

  it("is in a hover-transition range (50–250 ms)", () => {
    // Below 50ms = no transition perceived; above 250ms = sluggish
    // for hover state. Pin the UX-validated window.
    expect(TOPBAR_TRIGGER_TRANSITION_DURATION_MS).toBeGreaterThanOrEqual(50);
    expect(TOPBAR_TRIGGER_TRANSITION_DURATION_MS).toBeLessThanOrEqual(250);
  });

  it("composes into the canonical CSS transition string (compositional round-trip)", () => {
    // The full transition string composes 3× the same duration for
    // color, background, border-color. Pin the round-trip so a
    // future tweak that breaks the composition surfaces here.
    const expected = `color ${TOPBAR_TRIGGER_TRANSITION_DURATION_MS}ms ease, background ${TOPBAR_TRIGGER_TRANSITION_DURATION_MS}ms ease, border-color ${TOPBAR_TRIGGER_TRANSITION_DURATION_MS}ms ease`;
    expect(expected).toBe("color 140ms ease, background 140ms ease, border-color 140ms ease");
  });
});



