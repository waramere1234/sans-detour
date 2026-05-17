import { describe, it, expect } from "vitest";
import {
  WORDMARK_HOME_LABEL,
  PAGE_HEADER_NAV_LABEL,
  EXTERNAL_LINK_SUFFIX,
  externalLinkLabel,
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
