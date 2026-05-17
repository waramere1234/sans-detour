import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Methode from "../src/routes/Methode";
import { ROUTES } from "../src/lib/routes";

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

  it("renders the 7 numbered sections with id=methode-NN", () => {
    renderMethode();
    for (const n of ["01", "02", "03", "04", "05", "06", "07"]) {
      const section = document.getElementById(`methode-${n}`);
      expect(section).not.toBeNull();
      // Each section is a region landmark with a labelled-by heading.
      expect(section).toHaveAttribute("role", "region");
      expect(section).toHaveAttribute("aria-labelledby", `methode-heading-${n}`);
    }
  });

  it("Sommaire nav has 7 anchor links to the section ids", () => {
    renderMethode();
    for (const n of ["01", "02", "03", "04", "05", "06", "07"]) {
      const links = screen.getAllByRole("link");
      const target = links.find((a) => a.getAttribute("href") === `#methode-${n}`);
      expect(target).toBeTruthy();
    }
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
