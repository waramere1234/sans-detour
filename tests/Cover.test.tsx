import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  MemoryRouter, Route, Routes,
  type InitialEntry,
} from "react-router-dom";
import Cover from "../src/routes/Cover";
import { resetSession, recordVote, COVER_STORAGE_KEY } from "../src/lib/session";
import { FROM_LOGO_STATE } from "../src/lib/nav-state";
import { ROUTES } from "../src/lib/routes";
import { TARGET } from "../src/types";

function renderCover(initialEntries: InitialEntry[] = [ROUTES.cover]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path={ROUTES.cover} element={<Cover />} />
        <Route path={ROUTES.play} element={<div>play page</div>} />
        <Route path={ROUTES.result} element={<div>result page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Cover", () => {
  beforeEach(() => {
    localStorage.clear();
    resetSession();
  });

  it("renders the cover on fresh visit (no hasSeenCover)", () => {
    renderCover();
    expect(screen.getByRole("button", { name: /commencer/i })).toBeInTheDocument();
  });

  it("includes the updated data + AI source sub-text", () => {
    renderCover();
    expect(screen.getByText(/Données AN/i)).toBeInTheDocument();
    expect(screen.getByText(/Claude/i)).toBeInTheDocument();
  });

  it("redirects to /play when hasSeenCover and votes < 20", () => {
    localStorage.setItem(COVER_STORAGE_KEY, "true");
    recordVote("s1", "pour");
    renderCover();
    expect(screen.getByText("play page")).toBeInTheDocument();
  });

  it("redirects to /result when hasSeenCover and votes >= TARGET (completed)", () => {
    localStorage.setItem(COVER_STORAGE_KEY, "true");
    // Record TARGET votes so the completion branch fires. Loop bound uses
    // the constant so changing TARGET in types/index.ts doesn't silently
    // detach this test from the redirect's actual threshold.
    for (let i = 1; i <= TARGET; i++) recordVote(`s${i}`, "pour");
    renderCover();
    expect(screen.getByText("result page")).toBeInTheDocument();
    expect(screen.queryByText("play page")).not.toBeInTheDocument();
  });

  it("stays on cover when navigated with state.fromLogo=true (bypass auto-resume)", () => {
    localStorage.setItem(COVER_STORAGE_KEY, "true");
    recordVote("s1", "pour");
    renderCover([{ pathname: ROUTES.cover, state: FROM_LOGO_STATE }]);
    // votes=1, hasInProgress=true → primary CTA reads "Reprendre", not
    // "Commencer". Match on /reprendre/i so the assertion can't be
    // accidentally satisfied by the secondary "Recommencer à zéro"
    // button (which contains "commencer" as a substring).
    expect(screen.getByRole("button", { name: /reprendre/i })).toBeInTheDocument();
  });
});
