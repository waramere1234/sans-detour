import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Legal from "../src/routes/Legal";
import { ROUTES } from "../src/lib/routes";
import { CONTACT_EMAIL } from "../src/lib/contact";
import {
  AN_OPEN_DATA_URL,
  WORDMARK_HOME_LABEL, PAGE_HEADER_NAV_LABEL,
  MENU_LEGAL_LABEL,
} from "../src/types";
import { BACK_LINK_LABEL } from "../src/components/ReadingPageHeader";

// Legal.tsx is the sibling of Methode.tsx (which got dedicated tests in
// session 106). It owns:
//   - the page title + the éditeur / hébergeur / RGPD sections required
//     to be RGPD-compliant
//   - the wordmark + Retour Links pointing at ROUTES.cover (so a route
//     rename in src/lib/routes.ts can't leave Legal stranded)
//   - the contact email surfaced as a mailto link via CONTACT_EMAIL
//   - the AN data link (data.assemblee-nationale.fr — Etalab licence)
//   - 2 production-blocker placeholders ("[à compléter]" + github.com/
//     sansdetour) flagged in the source as must-replace before ship — the
//     tests below assert they are present so a future removal that
//     doesn't fill them in surfaces as a red test

function renderLegal() {
  return render(
    <MemoryRouter initialEntries={[ROUTES.legal]}>
      <Routes>
        <Route path={ROUTES.legal} element={<Legal />} />
        <Route path={ROUTES.cover} element={<div>cover page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Legal — structure", () => {
  it("renders the 'Mentions légales' page title", () => {
    renderLegal();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(new RegExp(MENU_LEGAL_LABEL));
  });

  it("declares the en-tête nav landmark with aria-label", () => {
    renderLegal();
    expect(screen.getByRole("navigation", { name: new RegExp(PAGE_HEADER_NAV_LABEL) })).toBeInTheDocument();
  });
});

describe("Legal — links to cover (route-aware)", () => {
  it("Retour link points at ROUTES.cover (not a hardcoded '/')", () => {
    renderLegal();
    const retour = screen.getByRole("link", { name: new RegExp(BACK_LINK_LABEL) });
    expect(retour).toHaveAttribute("href", ROUTES.cover);
  });

  it("Wordmark Link is labelled 'Accueil' and points at ROUTES.cover", () => {
    renderLegal();
    const accueil = screen.getByRole("link", { name: new RegExp(WORDMARK_HOME_LABEL) });
    expect(accueil).toHaveAttribute("href", ROUTES.cover);
  });
});

describe("Legal — RGPD-required content", () => {
  it("declares the éditeur, hébergeur, RGPD, analytics, sources sections", () => {
    renderLegal();
    const body = document.body.textContent || "";
    expect(body).toMatch(/Éditeur/);
    expect(body).toMatch(/Hébergeur/);
    expect(body).toMatch(/Données personnelles/);
    expect(body).toMatch(/Analytics/);
    expect(body).toMatch(/Sources des données/);
  });

  it("surfaces CONTACT_EMAIL as a mailto link (no hardcoded literal)", () => {
    renderLegal();
    const mailtoLink = screen.getByRole("link", { name: CONTACT_EMAIL });
    expect(mailtoLink).toHaveAttribute("href", expect.stringContaining(`mailto:${CONTACT_EMAIL}`));
  });

  it("links to AN_OPEN_DATA_URL (Etalab licence source)", () => {
    // Derive the href from the const so a future AN domain change
    // updates both this test and the source via the single edit.
    renderLegal();
    const anLink = screen.getByRole("link", { name: /data\.assemblee-nationale\.fr/ });
    expect(anLink).toHaveAttribute("href", AN_OPEN_DATA_URL);
    expect(anLink).toHaveAttribute("target", "_blank");
    expect(anLink).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("Vercel hébergeur block names Vercel Inc. (RGPD identity disclosure)", () => {
    renderLegal();
    expect(document.body.textContent || "").toMatch(/Vercel Inc\./);
  });
});

describe("Legal — production-blocker placeholders (still present, flagged in source)", () => {
  // These tests pin the *current* state so a future PR that thinks the
  // placeholders are real values fills them in instead of silently
  // shipping them. When the placeholders are replaced with real legal
  // text, drop these tests AND the TODO production-blocker comments in
  // Legal.tsx in the same commit.

  it("still shows the '[à compléter]' éditeur placeholder", () => {
    renderLegal();
    expect(document.body.textContent || "").toMatch(/à compléter/);
  });

  it("still links to the wrong github.com/sansdetour url (real repo private)", () => {
    renderLegal();
    const codeLink = screen.queryByRole("link", { name: /github\.com\/sansdetour/ });
    expect(codeLink).not.toBeNull();
  });
});
