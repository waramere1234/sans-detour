import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Methode, { METHODE_SECTIONS, METHODE_SECTION_BODY_TITLES } from "../src/routes/Methode";
import { ROUTES } from "../src/lib/routes";
import { DEFAULT_CAP_PER_DOSSIER, DEFAULT_CAP_PER_CHAPEAU_PREFIX } from "../src/lib/deck";
import { THRESHOLD } from "../src/lib/compute-positions";
import {
  MAX_POINTS_CLES_BULLETS,
  READING_PAGE_MAX_WIDTH,
  READING_PAGE_SECTION_PADDING,
  METHODE_SOMMAIRE_NAV_LABEL,
  METHODE_PAGE_H1,
  METHODE_S06_NO_AFFILIATION_PHRASE,
  METHODE_S06_HOSTING_FUNDING_BODY,
  METHODE_S01_UPDATE_CADENCE,
  METHODE_S05_NO_TRACKING_PHRASE,
  METHODE_S03_GROUP_INTRO,
  METHODE_S07_MISE_EN_FORME_CLOSER, METHODE_S07_LIBELLE_BRUT_GUARANTEE,
  METHODE_PAGE_LEAD_INTRO, METHODE_PAGE_LEAD_PURE_MATH,
  METHODE_S04_OPENER, METHODE_S02_EXCLUSIONS_SUFFIX,
  METHODE_S07_MODEL_DISCLOSURE,
  METHODE_S07_CLAUDE_TASKS_PREFIX, METHODE_S07_CLAUDE_TASKS_SUFFIX,
  METHODE_S07_LIMITES_DISCLAIMER_PREFIX, METHODE_S07_LIMITES_DISCLAIMER_SUFFIX,
  METHODE_S07_NE_FAIT_PAS_BODY,
  METHODE_S07_CADRE_BIAIS_PREFIX, METHODE_S07_CADRE_BIAIS_SUFFIX,
  METHODE_S02_CAPS_EXAMPLE,
  METHODE_S01_DATA_SOURCE_STRONG, METHODE_S01_DATA_SOURCE_QUALITY_CLAIM,
  METHODE_S04_RANK_NOISE_EXPLANATION,
} from "../src/types";
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
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(new RegExp(METHODE_PAGE_H1));
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

  it("each Section body renders its METHODE_SECTION_BODY_TITLES title (round-trip)", () => {
    renderMethode();
    for (const [n] of METHODE_SECTIONS) {
      const expected = METHODE_SECTION_BODY_TITLES[n];
      // Section renders the title in an h2 with id=`methode-heading-${n}`.
      const heading = document.getElementById(`methode-heading-${n}`);
      expect(heading).not.toBeNull();
      expect(heading!.textContent).toContain(expected);
    }
  });

  it("METHODE_SECTION_BODY_TITLES has the same 7 ids as METHODE_SECTIONS (no orphan title)", () => {
    const sectionIds = METHODE_SECTIONS.map(([n]) => n);
    const titleIds = Object.keys(METHODE_SECTION_BODY_TITLES);
    expect(titleIds.sort()).toEqual(sectionIds.slice().sort());
  });

  it("§06 surfaces METHODE_S06_NO_AFFILIATION_PHRASE (independence claim)", () => {
    renderMethode();
    const section = document.getElementById("methode-06")!;
    expect(section.textContent).toContain(METHODE_S06_NO_AFFILIATION_PHRASE);
  });

  it("§06 surfaces METHODE_S06_HOSTING_FUNDING_BODY (electoral-independence funding contract)", () => {
    renderMethode();
    const section = document.getElementById("methode-06")!;
    expect(section.textContent).toContain(METHODE_S06_HOSTING_FUNDING_BODY);
  });

  it("§01 surfaces METHODE_S01_UPDATE_CADENCE (weekly ingestion cadence disclosure)", () => {
    renderMethode();
    const section = document.getElementById("methode-01")!;
    expect(section.textContent).toContain(METHODE_S01_UPDATE_CADENCE);
  });

  it("§05 surfaces METHODE_S05_NO_TRACKING_PHRASE (privacy-tech list)", () => {
    renderMethode();
    const section = document.getElementById("methode-05")!;
    expect(section.textContent).toContain(METHODE_S05_NO_TRACKING_PHRASE);
  });

  it("§03 surfaces METHODE_S03_GROUP_INTRO (per-group position-computation rationale)", () => {
    renderMethode();
    const section = document.getElementById("methode-03")!;
    expect(section.textContent).toContain(METHODE_S03_GROUP_INTRO);
  });

  it("§07 surfaces METHODE_S07_MISE_EN_FORME_CLOSER (IA-role-boundary claim)", () => {
    renderMethode();
    const section = document.getElementById("methode-07")!;
    expect(section.textContent).toContain(METHODE_S07_MISE_EN_FORME_CLOSER);
  });

  it("§07 surfaces METHODE_S07_LIBELLE_BRUT_GUARANTEE (anti-bias transparency contract)", () => {
    renderMethode();
    const section = document.getElementById("methode-07")!;
    expect(section.textContent).toContain(METHODE_S07_LIBELLE_BRUT_GUARANTEE);
  });

  it("page-lead surfaces METHODE_PAGE_LEAD_INTRO + METHODE_PAGE_LEAD_PURE_MATH (anti-bias framing)", () => {
    renderMethode();
    const body = document.body.textContent || "";
    expect(body).toContain(METHODE_PAGE_LEAD_INTRO);
    expect(body).toContain(METHODE_PAGE_LEAD_PURE_MATH);
  });

  it("§04 surfaces METHODE_S04_OPENER (alignment-calculation lead before <Formula>)", () => {
    renderMethode();
    const section = document.getElementById("methode-04")!;
    expect(section.textContent).toContain(METHODE_S04_OPENER);
  });

  it("§02 surfaces METHODE_S02_EXCLUSIONS_SUFFIX (excluded scrutin types)", () => {
    renderMethode();
    const section = document.getElementById("methode-02")!;
    expect(section.textContent).toContain(METHODE_S02_EXCLUSIONS_SUFFIX);
  });

  it("§07 surfaces METHODE_S07_MODEL_DISCLOSURE (LLM model + API)", () => {
    renderMethode();
    const section = document.getElementById("methode-07")!;
    expect(section.textContent).toContain(METHODE_S07_MODEL_DISCLOSURE);
  });

  it("§07 surfaces METHODE_S07_CLAUDE_TASKS_PREFIX + SUFFIX (5-task IA disclosure)", () => {
    renderMethode();
    const section = document.getElementById("methode-07")!;
    expect(section.textContent).toContain(METHODE_S07_CLAUDE_TASKS_PREFIX.trim());
    expect(section.textContent).toContain(METHODE_S07_CLAUDE_TASKS_SUFFIX.trim());
  });

  it("§07 surfaces METHODE_S07_LIMITES_DISCLAIMER_PREFIX + SUFFIX (V3 roadmap + signalement)", () => {
    renderMethode();
    const section = document.getElementById("methode-07")!;
    expect(section.textContent).toContain(METHODE_S07_LIMITES_DISCLAIMER_PREFIX.trim());
    expect(section.textContent).toContain(METHODE_S07_LIMITES_DISCLAIMER_SUFFIX.trim());
  });

  it("§07 surfaces METHODE_S07_NE_FAIT_PAS_BODY (3-task negative list)", () => {
    renderMethode();
    const section = document.getElementById("methode-07")!;
    expect(section.textContent).toContain(METHODE_S07_NE_FAIT_PAS_BODY);
  });

  it("§07 surfaces METHODE_S07_CADRE_BIAIS_PREFIX + SUFFIX (prompt neutrality + verification path)", () => {
    renderMethode();
    const section = document.getElementById("methode-07")!;
    expect(section.textContent).toContain(METHODE_S07_CADRE_BIAIS_PREFIX.trim());
    expect(section.textContent).toContain(METHODE_S07_CADRE_BIAIS_SUFFIX.trim());
  });

  it("§02 surfaces METHODE_S02_CAPS_EXAMPLE (concrete retraite/Mayotte example)", () => {
    renderMethode();
    const section = document.getElementById("methode-02")!;
    expect(section.textContent).toContain(METHODE_S02_CAPS_EXAMPLE);
  });

  it("§01 surfaces METHODE_S01_DATA_SOURCE_STRONG + QUALITY_CLAIM", () => {
    renderMethode();
    const section = document.getElementById("methode-01")!;
    expect(section.textContent).toContain(METHODE_S01_DATA_SOURCE_STRONG);
    expect(section.textContent).toContain(METHODE_S01_DATA_SOURCE_QUALITY_CLAIM);
  });

  it("§04 surfaces METHODE_S04_RANK_NOISE_EXPLANATION (why rank requires MIN_FOR_RANKING+)", () => {
    renderMethode();
    const section = document.getElementById("methode-04")!;
    expect(section.textContent).toContain(METHODE_S04_RANK_NOISE_EXPLANATION);
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
    const sommaire = screen.getByRole("navigation", { name: new RegExp(METHODE_SOMMAIRE_NAV_LABEL) });
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

  it("page <section> maxWidth derives from READING_PAGE_MAX_WIDTH", () => {
    // Pin the const-derived inline style so a bump in src/types
    // (e.g. 720 → 760 for better line-length) propagates to the
    // rendered DOM without a separate Methode edit.
    renderMethode();
    const section = screen.getByRole("heading", { level: 1 }).closest("section");
    expect(section).not.toBeNull();
    expect((section as HTMLElement).style.maxWidth).toBe(`${READING_PAGE_MAX_WIDTH}px`);
  });

  it("page <section> padding derives from READING_PAGE_SECTION_PADDING", () => {
    // Methode + Legal share this padding; pin via test so a one-sided
    // edit on either route surfaces.
    renderMethode();
    const section = screen.getByRole("heading", { level: 1 }).closest("section");
    expect((section as HTMLElement).style.padding).toBe(READING_PAGE_SECTION_PADDING);
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
