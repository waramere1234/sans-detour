import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Methode, { METHODE_SECTIONS } from "../src/routes/Methode";
import { ROUTES } from "../src/lib/routes";
import { DEFAULT_CAP_PER_DOSSIER, DEFAULT_CAP_PER_CHAPEAU_PREFIX } from "../src/lib/deck";
import { THRESHOLD } from "../src/lib/compute-positions";
import { MAX_POINTS_CLES_BULLETS } from "../src/types";
import * as analytics from "../src/lib/analytics";

// Methode.tsx owns:
//  - the 7 numbered sections + their `methode-NN` anchor ids
//  - the SPA hash deep-link useEffect that scrolls + focuses the target
//    after mount (the browser's native anchor jump runs before React
//    mounts the Section elements, so we need the fallback)
//  - the Sommaire nav listing all 7 sections

function renderMethode(initialPath: string = ROUTES.methode) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path={ROUTES.methode} element={<Methode />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Methode — section structure", () => {
  it("renders the page title", () => {
    renderMethode();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Comment on calcule/);
  });

  it("renders one numbered section per METHODE_SECTIONS entry with id=methode-NN", () => {
    // Iterating METHODE_SECTIONS (instead of hardcoding 01..07) means
    // adding a new section to the const list auto-extends this assertion
    // and forces a matching <Section> body to be rendered.
    renderMethode();
    for (const [n] of METHODE_SECTIONS) {
      const section = document.getElementById(`methode-${n}`);
      expect(section).not.toBeNull();
      // Each section is a region landmark with a labelled-by heading.
      expect(section).toHaveAttribute("role", "region");
      expect(section).toHaveAttribute("aria-labelledby", `methode-heading-${n}`);
    }
  });

  it("Sommaire nav has one anchor link per METHODE_SECTIONS entry", () => {
    renderMethode();
    for (const [n] of METHODE_SECTIONS) {
      const links = screen.getAllByRole("link");
      const target = links.find((a) => a.getAttribute("href") === `#methode-${n}`);
      expect(target).toBeTruthy();
    }
  });

  it("METHODE_SECTIONS contains exactly the 7 documented sections (no surprise add/drop)", () => {
    // Pin the count so an off-by-one addition surfaces here AND in the
    // round-trip section-body test above.
    expect(METHODE_SECTIONS).toHaveLength(7);
  });

  it("the number of rendered Section bodies matches METHODE_SECTIONS.length (no orphan body)", () => {
    // Reverse-drift guard: the test "renders one numbered section per
    // METHODE_SECTIONS entry" catches a missing body but not a body
    // rendered without a matching METHODE_SECTIONS entry. Counting the
    // region landmarks closes the round-trip — a `<Section n="08">` JSX
    // body added without `["08", "…"]` in METHODE_SECTIONS still surfaces
    // here because the count diverges.
    renderMethode();
    const regions = Array.from(document.querySelectorAll('[role="region"]'))
      .filter((el) => el.id.startsWith("methode-"));
    expect(regions).toHaveLength(METHODE_SECTIONS.length);
  });
});

describe("Methode — SPA hash deep-link", () => {
  // The Methode component runs a scrollIntoView + focus on mount when
  // location.hash is set. jsdom doesn't ship `scrollIntoView` on
  // HTMLElement.prototype, so we stub it onto the prototype before
  // each test and assert that the call was made.

  let scrollSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollSpy = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      writable: true,
      value: scrollSpy,
    });
  });

  it("calls scrollIntoView({ behavior: 'instant' }) for #methode-07", async () => {
    renderMethode(`${ROUTES.methode}#methode-07`);
    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalledWith({ behavior: "instant", block: "start" });
    });
  });

  it("does NOT call scrollIntoView when there's no hash", () => {
    renderMethode(ROUTES.methode);
    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it("silently no-ops when the hash points at a non-existent id", () => {
    renderMethode(`${ROUTES.methode}#methode-99`);
    // The effect early-returns when document.getElementById returns null.
    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it("moves focus to the section after the scroll (preventScroll: true)", async () => {
    renderMethode(`${ROUTES.methode}#methode-04`);
    await waitFor(() => {
      const section = document.getElementById("methode-04");
      expect(document.activeElement).toBe(section);
    });
  });
});

describe("Methode — TOC analytics (methode_toc_click × N sections)", () => {
  let trackSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    trackSpy = vi.spyOn(analytics, "track").mockImplementation(() => {});
  });

  afterEach(() => {
    trackSpy.mockRestore();
  });

  it("fires methode_toc_click with the section number on each TOC link click", () => {
    renderMethode();
    // Scope to the Sommaire nav — there's also a cross-section anchor
    // (`<a href="#methode-07">section 07</a>`) in the intro paragraph that
    // intentionally has NO onClick; the previous selector picked that up
    // first because it sits before the Sommaire in DOM order.
    const sommaire = screen.getByRole("navigation", { name: /Sommaire/ });
    for (const [n] of METHODE_SECTIONS) {
      trackSpy.mockClear();
      const link = Array.from(sommaire.querySelectorAll("a")).find(
        (a) => a.getAttribute("href") === `#methode-${n}`,
      );
      expect(link).toBeTruthy();
      fireEvent.click(link!);
      expect(trackSpy).toHaveBeenCalledWith("methode_toc_click", { section: n });
    }
  });
});

describe("Methode — prose derived from canonical const values (no drift between policy + doc)", () => {
  // The Methode page describes the deck composition policy + the
  // group-position threshold to users. Those numbers used to be inlined
  // as literals ("jamais plus de 2 scrutins", "≥ 70%"), so a bump to
  // DEFAULT_CAP_PER_DOSSIER or THRESHOLD in src/lib/* would leave the
  // documentation lying to users. Pin the round-trip here.

  it("§02 'dossier' cap mention matches DEFAULT_CAP_PER_DOSSIER", () => {
    renderMethode();
    const section = document.getElementById("methode-02")!;
    expect(section.textContent).toContain(
      `jamais plus de ${DEFAULT_CAP_PER_DOSSIER} scrutins du même dossier`,
    );
  });

  it("§02 'sujet' cap mention matches DEFAULT_CAP_PER_CHAPEAU_PREFIX", () => {
    renderMethode();
    const section = document.getElementById("methode-02")!;
    expect(section.textContent).toContain(
      `jamais plus de ${DEFAULT_CAP_PER_CHAPEAU_PREFIX} scrutins du même sujet`,
    );
  });

  it("§03 group-position threshold matches THRESHOLD * 100", () => {
    renderMethode();
    const section = document.getElementById("methode-03")!;
    const expectedPct = Math.round(THRESHOLD * 100);
    expect(section.textContent).toContain(`≥ ${expectedPct}%`);
  });

  it("§07 'points clés' count matches MAX_POINTS_CLES_BULLETS", () => {
    renderMethode();
    const section = document.getElementById("methode-07")!;
    expect(section.textContent).toContain(`${MAX_POINTS_CLES_BULLETS} points clés`);
  });
});

describe("Methode — references & legal accuracy", () => {
  it("links to data.assemblee-nationale.fr (the documented source)", () => {
    renderMethode();
    const links = screen.getAllByRole("link");
    const dataLink = links.find((a) => a.getAttribute("href")?.includes("data.assemblee-nationale.fr"));
    expect(dataLink).toBeTruthy();
  });

  it("mentions Claude as the IA used (transparency requirement)", () => {
    renderMethode();
    expect(document.body.textContent || "").toContain("Claude");
  });
});
