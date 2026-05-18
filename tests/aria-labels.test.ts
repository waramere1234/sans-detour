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
import { freshnessTotalScrutinsPhrase } from "../src/components/FreshnessBanner";

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



