import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TopBar } from "../src/components/TopBar";
import { resetSession, recordVote } from "../src/lib/session";
import { ROUTES } from "../src/lib/routes";
import {
  MIN_FOR_RANKING,
  MENU_RESULT_LABEL, MENU_METHODE_LABEL, MENU_LEGAL_LABEL, MENU_CONTACT_LABEL,
  MENU_OPEN_LABEL, MENU_CLOSE_LABEL,
  WORDMARK_HOME_LABEL,
} from "../src/types";
import * as analytics from "../src/lib/analytics";

// TopBar owns:
//   - route-aware rendering (hidden on Cover, visible on the other 4 routes)
//   - the popover menu (aria-haspopup="menu", aria-expanded, ESC close,
//     auto-close on route navigation, focus-restore to trigger on close)
//   - the MIN_FOR_RANKING gate on the "Mon résultat" link
//   - aria-current="page" on the link matching the current route

function renderTopBar(initialPath: string = ROUTES.play) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path={ROUTES.cover} element={<TopBar />} />
        <Route path={ROUTES.play} element={<TopBar />} />
        <Route path={ROUTES.result} element={<TopBar />} />
        <Route path={ROUTES.methode} element={<TopBar />} />
        <Route path={ROUTES.legal} element={<TopBar />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("TopBar — route gating", () => {
  beforeEach(() => {
    localStorage.clear();
    resetSession();
  });

  it("renders nothing on Cover (the Cover has its own header)", () => {
    const { container } = renderTopBar(ROUTES.cover);
    expect(container.firstChild).toBeNull();
  });

  it("renders the wordmark Link + menu trigger on /play", () => {
    renderTopBar(ROUTES.play);
    expect(screen.getByRole("link", { name: new RegExp(WORDMARK_HOME_LABEL) })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: new RegExp(MENU_OPEN_LABEL) })).toBeInTheDocument();
  });

  it("renders the menu trigger on /result, /methode, /legal too", () => {
    for (const path of [ROUTES.result, ROUTES.methode, ROUTES.legal]) {
      const { unmount } = renderTopBar(path);
      expect(screen.getByRole("button", { name: new RegExp(MENU_OPEN_LABEL) })).toBeInTheDocument();
      unmount();
    }
  });
});

describe("TopBar — menu popover", () => {
  beforeEach(() => {
    localStorage.clear();
    resetSession();
  });

  it("trigger declares aria-haspopup=menu and aria-expanded=false at rest", () => {
    renderTopBar(ROUTES.play);
    const trigger = screen.getByRole("button", { name: new RegExp(MENU_OPEN_LABEL) });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("clicking the trigger opens the menu (aria-expanded=true + role=menu visible)", () => {
    renderTopBar(ROUTES.play);
    const trigger = screen.getByRole("button", { name: new RegExp(MENU_OPEN_LABEL) });
    fireEvent.click(trigger);
    expect(screen.getByRole("button", { name: new RegExp(MENU_CLOSE_LABEL) })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("Escape closes the menu", async () => {
    renderTopBar(ROUTES.play);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(MENU_OPEN_LABEL) }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    // AnimatePresence may keep the menu in the DOM during exit animation;
    // waitFor for the aria-expanded flip on the trigger.
    await waitFor(() => {
      expect(screen.getByRole("button", { name: new RegExp(MENU_OPEN_LABEL) })).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("restores focus to the trigger after close", async () => {
    renderTopBar(ROUTES.play);
    const trigger = screen.getByRole("button", { name: new RegExp(MENU_OPEN_LABEL) });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: new RegExp(MENU_OPEN_LABEL) })).toHaveFocus();
    });
  });
});

describe("TopBar — Mon résultat gate (MIN_FOR_RANKING threshold)", () => {
  beforeEach(() => {
    localStorage.clear();
    resetSession();
  });

  it("does NOT show 'Mon résultat' before MIN_FOR_RANKING votes", () => {
    // 1 vote — below threshold.
    recordVote("s1", "pour");
    renderTopBar(ROUTES.play);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(MENU_OPEN_LABEL) }));
    expect(screen.queryByRole("menuitem", { name: new RegExp(MENU_RESULT_LABEL) })).not.toBeInTheDocument();
  });

  it("shows 'Mon résultat' once MIN_FOR_RANKING is reached", () => {
    for (let i = 1; i <= MIN_FOR_RANKING; i++) recordVote(`s${i}`, "pour");
    renderTopBar(ROUTES.play);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(MENU_OPEN_LABEL) }));
    expect(screen.getByRole("menuitem", { name: new RegExp(MENU_RESULT_LABEL) })).toBeInTheDocument();
  });

  it("hides 'Mon résultat' while ALREADY on /result (avoids self-link)", () => {
    for (let i = 1; i <= MIN_FOR_RANKING; i++) recordVote(`s${i}`, "pour");
    renderTopBar(ROUTES.result);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(MENU_OPEN_LABEL) }));
    expect(screen.queryByRole("menuitem", { name: new RegExp(MENU_RESULT_LABEL) })).not.toBeInTheDocument();
  });
});

describe("TopBar — aria-current on the link matching the current route", () => {
  beforeEach(() => {
    localStorage.clear();
    resetSession();
  });

  it("marks the Methode link as current when on /methode", () => {
    renderTopBar(ROUTES.methode);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(MENU_OPEN_LABEL) }));
    const methodeLink = screen.getByRole("menuitem", { name: new RegExp(MENU_METHODE_LABEL) });
    expect(methodeLink).toHaveAttribute("aria-current", "page");
  });

  it("does NOT mark Methode as current when on /play", () => {
    renderTopBar(ROUTES.play);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(MENU_OPEN_LABEL) }));
    const methodeLink = screen.getByRole("menuitem", { name: new RegExp(MENU_METHODE_LABEL) });
    expect(methodeLink).not.toHaveAttribute("aria-current");
  });

  it("marks the Legal link as current when on /legal", () => {
    renderTopBar(ROUTES.legal);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(MENU_OPEN_LABEL) }));
    const legalLink = screen.getByRole("menuitem", { name: new RegExp(MENU_LEGAL_LABEL) });
    expect(legalLink).toHaveAttribute("aria-current", "page");
  });
});

describe("TopBar — topbar_nav analytics (target = result/methode/legal/contact)", () => {
  let trackSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    resetSession();
    trackSpy = vi.spyOn(analytics, "track").mockImplementation(() => {});
  });

  afterEach(() => {
    trackSpy.mockRestore();
  });

  it("fires topbar_nav with target=methode on the Méthode menuitem click", () => {
    renderTopBar(ROUTES.play);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(MENU_OPEN_LABEL) }));
    fireEvent.click(screen.getByRole("menuitem", { name: new RegExp(MENU_METHODE_LABEL) }));
    expect(trackSpy).toHaveBeenCalledWith("topbar_nav", { target: "methode" });
  });

  it("fires topbar_nav with target=legal on the Mentions menuitem click", () => {
    renderTopBar(ROUTES.play);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(MENU_OPEN_LABEL) }));
    fireEvent.click(screen.getByRole("menuitem", { name: new RegExp(MENU_LEGAL_LABEL) }));
    expect(trackSpy).toHaveBeenCalledWith("topbar_nav", { target: "legal" });
  });

  it("fires topbar_nav with target=contact on the Contact menuitem click", () => {
    renderTopBar(ROUTES.play);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(MENU_OPEN_LABEL) }));
    fireEvent.click(screen.getByRole("menuitem", { name: new RegExp(MENU_CONTACT_LABEL) }));
    expect(trackSpy).toHaveBeenCalledWith("topbar_nav", { target: "contact" });
  });

  it("fires topbar_nav with target=result on the 'Mon résultat' menuitem click (once MIN_FOR_RANKING reached)", () => {
    // 'Mon résultat' is gated on votes >= MIN_FOR_RANKING.
    for (let i = 1; i <= MIN_FOR_RANKING; i++) recordVote(`s${i}`, "pour");
    renderTopBar(ROUTES.play);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(MENU_OPEN_LABEL) }));
    fireEvent.click(screen.getByRole("menuitem", { name: new RegExp(MENU_RESULT_LABEL) }));
    expect(trackSpy).toHaveBeenCalledWith("topbar_nav", { target: "result" });
  });
});
// Silence the React act() warnings the AnimatePresence animation otherwise
// produces — the actual assertions wait via waitFor where needed.
vi.spyOn(console, "error").mockImplementation((msg) => {
  if (typeof msg === "string" && msg.includes("act(")) return;
});
void act;
