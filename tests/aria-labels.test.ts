import { describe, it, expect } from "vitest";
import {
  WORDMARK_HOME_LABEL,
  PAGE_HEADER_NAV_LABEL,
  EXTERNAL_LINK_SUFFIX,
  externalLinkLabel,
  AN_OPEN_DATA_URL, AN_OPEN_DATA_HOSTNAME,
  GITHUB_REPO_URL, GITHUB_REPO_DISPLAY,
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
