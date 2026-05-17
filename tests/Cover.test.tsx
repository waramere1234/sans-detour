import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  MemoryRouter, Route, Routes,
  type InitialEntry,
} from "react-router-dom";
import Cover from "../src/routes/Cover";
import { resetSession, recordVote } from "../src/lib/session";

function renderCover(initialEntries: InitialEntry[] = ["/"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<Cover />} />
        <Route path="/play" element={<div>play page</div>} />
        <Route path="/result" element={<div>result page</div>} />
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
    localStorage.setItem("sd_seen_cover", "true");
    recordVote("s1", "pour");
    renderCover();
    expect(screen.getByText("play page")).toBeInTheDocument();
  });

  it("stays on cover when navigated with state.fromLogo=true (bypass auto-resume)", () => {
    localStorage.setItem("sd_seen_cover", "true");
    recordVote("s1", "pour");
    renderCover([{ pathname: "/", state: { fromLogo: true } }]);
    // votes=1, hasInProgress=true → primary CTA reads "Reprendre", not
    // "Commencer". Match on /reprendre/i so the assertion can't be
    // accidentally satisfied by the secondary "Recommencer à zéro"
    // button (which contains "commencer" as a substring).
    expect(screen.getByRole("button", { name: /reprendre/i })).toBeInTheDocument();
  });
});
