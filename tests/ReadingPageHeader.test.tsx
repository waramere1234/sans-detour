import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  ReadingPageHeader, BACK_LINK_LABEL,
} from "../src/components/ReadingPageHeader";
import {
  PAGE_HEADER_NAV_LABEL, WORDMARK_HOME_LABEL,
} from "../src/types";
import { ROUTES } from "../src/lib/routes";

// Shared 3-col header for Methode + Legal — extracted from the
// duplicated inline blocks in session 136. Tests pin:
//   - the nav landmark aria-label (cross-route SR consistency)
//   - the two Links pointing at ROUTES.cover
//   - the back-link copy stays "Retour"
//   - the Wordmark link carries WORDMARK_HOME_LABEL aria-label

function renderHeader() {
  return render(
    <MemoryRouter>
      <ReadingPageHeader />
    </MemoryRouter>
  );
}

describe("ReadingPageHeader", () => {
  it("exposes a nav landmark with PAGE_HEADER_NAV_LABEL aria-label", () => {
    renderHeader();
    expect(screen.getByRole("navigation", { name: PAGE_HEADER_NAV_LABEL })).toBeInTheDocument();
  });

  it("renders the Retour back-link pointing at ROUTES.cover", () => {
    renderHeader();
    const back = screen.getByRole("link", { name: new RegExp(BACK_LINK_LABEL) });
    expect(back).toHaveAttribute("href", ROUTES.cover);
  });

  it("renders the Wordmark Link with WORDMARK_HOME_LABEL aria-label pointing at ROUTES.cover", () => {
    renderHeader();
    const wordmark = screen.getByRole("link", { name: WORDMARK_HOME_LABEL });
    expect(wordmark).toHaveAttribute("href", ROUTES.cover);
  });

  it("BACK_LINK_LABEL is the canonical 'Retour' wording", () => {
    expect(BACK_LINK_LABEL).toBe("Retour");
  });

  it("exposes exactly 2 Links (Retour + Wordmark), no orphan affordances", () => {
    renderHeader();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
  });
});
