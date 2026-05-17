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
} from "../src/types";
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
