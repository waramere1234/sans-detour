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
} from "../src/types";

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
