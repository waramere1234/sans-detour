import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  MemoryRouter, Route, Routes,
  type InitialEntry,
} from "react-router-dom";
import Cover from "../src/routes/Cover";
import { resetSession, recordVote, COVER_STORAGE_KEY, loadSession } from "../src/lib/session";
import { FROM_LOGO_STATE } from "../src/lib/nav-state";
import { ROUTES } from "../src/lib/routes";
import {
  TARGET, MIN_FOR_RANKING, LEGISLATURE_LABEL, TAGLINE,
  START_LABEL, RESUME_LABEL, VIEW_RESULT_LABEL,
  RESTART_LABEL, VIEW_PARTIAL_RESULT_LABEL,
  restartConfirmMessage,
} from "../src/types";
import * as analytics from "../src/lib/analytics";

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

  it("renders the LEGISLATURE_LABEL in the header eyebrow (rename-safe via const)", () => {
    renderCover();
    expect(screen.getByText(new RegExp(LEGISLATURE_LABEL))).toBeInTheDocument();
  });

  it("hero <h1> textContent concatenates to TAGLINE (split JSX for the accent styling)", () => {
    // Cover.tsx splits the tagline across 3 JSX nodes:
    //   "Pas les programmes." + <br/> + <span>Les vrais votes</span> + <span>.</span>
    // so the accent color can land only on "Les vrais votes" and the
    // final period. A copy-paste mistake (a word swapped or omitted in
    // one node) would silently diverge the hero from the
    // tab title / OG description / manifest description that all
    // pin against TAGLINE. textContent strips JSX wrapping and gives
    // us the rendered string for direct comparison.
    renderCover();
    const h1 = screen.getByRole("heading", { level: 1 });
    // The <br/> between "Pas les programmes." and "Les vrais votes"
    // produces no whitespace in textContent (jsdom flattens it), so
    // the rendered string is dense at that join. Normalize both sides
    // by collapsing whitespace to single spaces so a word swap or
    // missing fragment surfaces while the JSX-vs-flat-string boundary
    // doesn't false-positive.
    const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
    // Drop the single space between "programmes." and "Les" that
    // TAGLINE has but the <br/>-joined h1 lacks.
    expect(normalize(h1.textContent ?? "").replace(/\s/g, ""))
      .toBe(normalize(TAGLINE).replace(/\s/g, ""));
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

// All cover.tsx side effects (track + resetSession + navigate) live in
// the `start()` / `restart()` handlers + Link onClick handlers. Below
// describes pin those behaviors so a refactor that drops the track call
// (or fires it before the user confirms a destructive action) surfaces.

describe("Cover — start() analytics + side effects", () => {
  let trackSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    resetSession();
    trackSpy = vi.spyOn(analytics, "track").mockImplementation(() => {});
  });

  afterEach(() => {
    trackSpy.mockRestore();
  });

  it("fires 'cover_started' on a fresh visit (no in-progress session)", () => {
    renderCover();
    fireEvent.click(screen.getByRole("button", { name: /commencer/i }));
    expect(trackSpy).toHaveBeenCalledWith("cover_started");
    expect(trackSpy).not.toHaveBeenCalledWith("cover_resumed");
  });

  it("fires 'cover_resumed' instead when the user has an in-progress session", () => {
    // hasSeenCover=true so auto-resume would fire — pass fromLogo=true to
    // *bypass* the auto-resume effect and reach the Reprendre button.
    localStorage.setItem(COVER_STORAGE_KEY, "true");
    recordVote("s1", "pour");
    renderCover([{ pathname: ROUTES.cover, state: FROM_LOGO_STATE }]);
    fireEvent.click(screen.getByRole("button", { name: /reprendre/i }));
    expect(trackSpy).toHaveBeenCalledWith("cover_resumed");
    expect(trackSpy).not.toHaveBeenCalledWith("cover_started");
  });
});

describe("Cover — restart() flow (confirm + reset + analytics)", () => {
  let trackSpy: ReturnType<typeof vi.spyOn>;
  let confirmSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    resetSession();
    trackSpy = vi.spyOn(analytics, "track").mockImplementation(() => {});
    confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    // hasSeenCover=true + 1 vote so the "Recommencer à zéro" button is
    // rendered (it's gated on hasInProgress). fromLogo bypasses the
    // auto-resume so the user actually sees the Cover.
    localStorage.setItem(COVER_STORAGE_KEY, "true");
    recordVote("s1", "pour");
  });

  afterEach(() => {
    trackSpy.mockRestore();
    confirmSpy.mockRestore();
  });

  it("renders the 'Recommencer à zéro' button when hasInProgress", () => {
    renderCover([{ pathname: ROUTES.cover, state: FROM_LOGO_STATE }]);
    expect(screen.getByRole("button", { name: new RegExp(RESTART_LABEL) })).toBeInTheDocument();
  });

  it("prompts the user before wiping the session (no silent destroy)", () => {
    renderCover([{ pathname: ROUTES.cover, state: FROM_LOGO_STATE }]);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(RESTART_LABEL) }));
    expect(confirmSpy).toHaveBeenCalledTimes(1);
  });

  it("confirm prompt begins with RESTART_LABEL (re-uses the button copy)", () => {
    renderCover([{ pathname: ROUTES.cover, state: FROM_LOGO_STATE }]);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(RESTART_LABEL) }));
    expect(confirmSpy).toHaveBeenCalledWith(expect.stringMatching(new RegExp(`^${RESTART_LABEL}`)));
  });

  it("uses the singular phrasing when votesCount === 1 (round-trip via restartConfirmMessage)", () => {
    renderCover([{ pathname: ROUTES.cover, state: FROM_LOGO_STATE }]);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(RESTART_LABEL) }));
    // Round-trip via restartConfirmMessage(1) — a regression to the plural
    // branch on count=1 (or a rewording of the loss-phrase) surfaces here.
    expect(confirmSpy).toHaveBeenCalledWith(restartConfirmMessage(1));
  });

  it("uses the plural phrasing with the vote count when votesCount >= 2 (round-trip via restartConfirmMessage)", () => {
    // Add 2 more votes (total = 3).
    recordVote("s2", "pour");
    recordVote("s3", "contre");
    renderCover([{ pathname: ROUTES.cover, state: FROM_LOGO_STATE }]);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(RESTART_LABEL) }));
    expect(confirmSpy).toHaveBeenCalledWith(restartConfirmMessage(3));
  });

  it("clears the session and fires 'cover_restarted' when the user confirms", () => {
    expect(loadSession()?.votes).toHaveLength(1); // sanity pre-state
    renderCover([{ pathname: ROUTES.cover, state: FROM_LOGO_STATE }]);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(RESTART_LABEL) }));
    expect(loadSession()).toBeNull();
    expect(trackSpy).toHaveBeenCalledWith("cover_restarted");
  });

  it("does NOTHING when the user cancels the confirm (session preserved, no analytics)", () => {
    confirmSpy.mockReturnValueOnce(false);
    renderCover([{ pathname: ROUTES.cover, state: FROM_LOGO_STATE }]);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(RESTART_LABEL) }));
    expect(loadSession()?.votes).toHaveLength(1); // preserved
    expect(trackSpy).not.toHaveBeenCalledWith("cover_restarted");
  });
});

describe("Cover — auto-resume analytics (cover_result_revisit + cover_partial_result)", () => {
  let trackSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    resetSession();
    trackSpy = vi.spyOn(analytics, "track").mockImplementation(() => {});
  });

  afterEach(() => {
    trackSpy.mockRestore();
  });

  it("primary CTA on a fresh visit uses START_LABEL (rename-safe)", () => {
    renderCover();
    expect(screen.getByRole("button", { name: new RegExp(START_LABEL, "i") })).toBeInTheDocument();
  });

  it("primary CTA on an in-progress session uses RESUME_LABEL (rename-safe)", () => {
    localStorage.setItem(COVER_STORAGE_KEY, "true");
    recordVote("s1", "pour");
    renderCover([{ pathname: ROUTES.cover, state: FROM_LOGO_STATE }]);
    expect(screen.getByRole("button", { name: new RegExp(RESUME_LABEL, "i") })).toBeInTheDocument();
  });

  it("primary CTA on a completed session uses VIEW_RESULT_LABEL (rename-safe)", () => {
    // Same label appears as Play.tsx RetryError fallback when the deck
    // is exhausted — pinning the const here closes the duplication.
    localStorage.setItem(COVER_STORAGE_KEY, "true");
    for (let i = 1; i <= TARGET; i++) recordVote(`s${i}`, "pour");
    renderCover([{ pathname: ROUTES.cover, state: FROM_LOGO_STATE }]);
    expect(screen.getByRole("button", { name: new RegExp(VIEW_RESULT_LABEL) })).toBeInTheDocument();
  });

  it("fires 'cover_result_revisit' when user clicks the primary CTA with a completed session", () => {
    // cover_result_revisit fires inside start() when hasCompleted=true — i.e.
    // user already finished a 20-vote session and clicks the primary CTA
    // (labelled "Voir mon résultat" in that branch). We need fromLogo=true
    // so the auto-resume effect doesn't intercept before the button renders.
    localStorage.setItem(COVER_STORAGE_KEY, "true");
    for (let i = 1; i <= TARGET; i++) recordVote(`s${i}`, "pour");
    renderCover([{ pathname: ROUTES.cover, state: FROM_LOGO_STATE }]);
    fireEvent.click(screen.getByRole("button", { name: /Voir mon résultat/ }));
    expect(trackSpy).toHaveBeenCalledWith("cover_result_revisit");
    expect(trackSpy).not.toHaveBeenCalledWith("cover_started");
    expect(trackSpy).not.toHaveBeenCalledWith("cover_resumed");
  });

  it("does NOT fire 'cover_result_revisit' on a fresh visit (no completed session)", () => {
    renderCover();
    fireEvent.click(screen.getByRole("button", { name: /Commencer/ }));
    expect(trackSpy).not.toHaveBeenCalledWith("cover_result_revisit");
  });

  it("fires 'cover_partial_result' on the 'Voir mon résultat partiel' link click", () => {
    // Gate: votes >= MIN_FOR_RANKING + hasInProgress (votes < TARGET).
    localStorage.setItem(COVER_STORAGE_KEY, "true");
    // Seed exactly MIN_FOR_RANKING votes so the canSeePartialResult gate
    // (votes >= MIN_FOR_RANKING) opens at the boundary. fromLogo bypasses
    // the auto-resume effect so we reach the rendered Cover.
    for (let i = 1; i <= MIN_FOR_RANKING; i++) recordVote(`s${i}`, "pour");
    renderCover([{ pathname: ROUTES.cover, state: FROM_LOGO_STATE }]);
    const link = screen.getByRole("link", { name: new RegExp(VIEW_PARTIAL_RESULT_LABEL) });
    fireEvent.click(link);
    expect(trackSpy).toHaveBeenCalledWith("cover_partial_result");
  });

  it("does NOT render the partial-result link when below MIN_FOR_RANKING", () => {
    localStorage.setItem(COVER_STORAGE_KEY, "true");
    // 1 vote — below MIN_FOR_RANKING=5.
    recordVote("s1", "pour");
    renderCover([{ pathname: ROUTES.cover, state: FROM_LOGO_STATE }]);
    expect(screen.queryByRole("link", { name: new RegExp(VIEW_PARTIAL_RESULT_LABEL) })).not.toBeInTheDocument();
  });
});

describe("Cover — footer nav analytics (cover_footer_nav × 3 targets)", () => {
  let trackSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    resetSession();
    trackSpy = vi.spyOn(analytics, "track").mockImplementation(() => {});
  });

  afterEach(() => {
    trackSpy.mockRestore();
  });

  it("fires cover_footer_nav with target=methode on the Méthode link click", () => {
    renderCover();
    fireEvent.click(screen.getByRole("link", { name: /Méthode/ }));
    expect(trackSpy).toHaveBeenCalledWith("cover_footer_nav", { target: "methode" });
  });

  it("fires cover_footer_nav with target=legal on the Mentions link click", () => {
    renderCover();
    fireEvent.click(screen.getByRole("link", { name: /Mentions légales/ }));
    expect(trackSpy).toHaveBeenCalledWith("cover_footer_nav", { target: "legal" });
  });

  it("fires cover_footer_nav with target=contact on the Contact mailto click", () => {
    renderCover();
    fireEvent.click(screen.getByRole("link", { name: /Contact/ }));
    expect(trackSpy).toHaveBeenCalledWith("cover_footer_nav", { target: "contact" });
  });
});
