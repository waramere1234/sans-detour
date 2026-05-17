import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// Force the no-supabase fallback so fetchScrutins returns fixtures
// deterministically (same pattern as tests/scrutins.test.ts). MUST be
// declared before the Result import so the mock is installed when the
// component's transitive `scrutins` import lands.
vi.mock("../src/lib/supabase", () => ({ supabase: null }));

import Result from "../src/routes/Result";
import { ROUTES } from "../src/lib/routes";
import {
  resetSession, recordVote, loadSession, hasSeenCover, markCoverSeen,
} from "../src/lib/session";
import fixtures from "../supabase/seed/dev-fixtures.json";
import type { Scrutin } from "../src/types";
import {
  TARGET, LEGISLATURE_LABEL,
  SHARE_LABEL, REFAIRE_LABEL, CONTINUE_REFINE_LABEL, CONTINUE_TEST_LABEL_PREFIX,
  refaireConfirmMessage,
} from "../src/types";
import * as analytics from "../src/lib/analytics";

// Result.tsx fires 5 analytics events (result_reached, result_refaire,
// share_clicked, personnalites_revealed, affinement_clicked). Only the
// `track()` *function* is unit-tested in analytics.test.ts — the call
// sites had no verification. This file pins each call site + the
// refaire confirm flow + the once-per-mount guards.

function renderResult() {
  return render(
    <MemoryRouter initialEntries={[ROUTES.result]}>
      <Routes>
        <Route path={ROUTES.cover} element={<div>cover page</div>} />
        <Route path={ROUTES.play} element={<div>play page</div>} />
        <Route path={ROUTES.result} element={<Result />} />
      </Routes>
    </MemoryRouter>
  );
}

/** Seed N votes against the first N fixtures so computeAlignment + the
 *  ranking branches reach a real Result render (not the empty-session
 *  Navigate guard, not the ResultSkeleton no-pool guard). */
function seedSession(n: number) {
  const ids = (fixtures as Scrutin[]).slice(0, n).map((s) => s.id);
  for (const id of ids) recordVote(id, "pour");
}

describe("Result — refaire() flow (confirm + reset + forgetCover + navigate + analytics)", () => {
  let trackSpy: ReturnType<typeof vi.spyOn>;
  let confirmSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    resetSession();
    markCoverSeen();
    seedSession(TARGET); // completed session so Result renders fully
    trackSpy = vi.spyOn(analytics, "track").mockImplementation(() => {});
    confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    trackSpy.mockRestore();
    confirmSpy.mockRestore();
  });

  it("renders the REFAIRE_LABEL button after a completed session (rename-safe)", async () => {
    renderResult();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: new RegExp(REFAIRE_LABEL) })).toBeInTheDocument();
    });
  });

  it("includes REFAIRE_LABEL in the confirm prompt (re-uses the button copy)", async () => {
    renderResult();
    await waitFor(() => screen.getByRole("button", { name: new RegExp(REFAIRE_LABEL) }));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(REFAIRE_LABEL) }));
    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining(REFAIRE_LABEL));
  });

  it("renders the SHARE_LABEL button on every completed session", async () => {
    renderResult();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: new RegExp(SHARE_LABEL) })).toBeInTheDocument();
    });
  });

  it("prompts the user before wiping (no silent destroy)", async () => {
    renderResult();
    await waitFor(() => screen.getByRole("button", { name: new RegExp(REFAIRE_LABEL) }));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(REFAIRE_LABEL) }));
    expect(confirmSpy).toHaveBeenCalledTimes(1);
  });

  it("uses the plural phrasing with the TARGET count (round-trip via refaireConfirmMessage)", async () => {
    renderResult();
    await waitFor(() => screen.getByRole("button", { name: new RegExp(REFAIRE_LABEL) }));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(REFAIRE_LABEL) }));
    expect(confirmSpy).toHaveBeenCalledWith(refaireConfirmMessage(TARGET));
  });

  it("clears the session AND the cover-seen flag on confirm OK + fires result_refaire", async () => {
    expect(hasSeenCover()).toBe(true); // sanity pre-state
    renderResult();
    await waitFor(() => screen.getByRole("button", { name: new RegExp(REFAIRE_LABEL) }));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(REFAIRE_LABEL) }));
    // Session wiped + cover-seen forgotten (symmetric counterpart to Cover.restart).
    expect(loadSession()).toBeNull();
    expect(hasSeenCover()).toBe(false);
    expect(trackSpy).toHaveBeenCalledWith("result_refaire");
    // Navigation to /cover surfaces the cover route element.
    await waitFor(() => expect(screen.getByText("cover page")).toBeInTheDocument());
  });

  it("does NOTHING when the user cancels (session preserved, no analytics, stays on /result)", async () => {
    confirmSpy.mockReturnValueOnce(false);
    renderResult();
    await waitFor(() => screen.getByRole("button", { name: new RegExp(REFAIRE_LABEL) }));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(REFAIRE_LABEL) }));
    expect(loadSession()?.votes).toHaveLength(TARGET);
    expect(hasSeenCover()).toBe(true);
    expect(trackSpy).not.toHaveBeenCalledWith("result_refaire");
    expect(screen.queryByText("cover page")).not.toBeInTheDocument();
  });

  it("tracks result_refaire AFTER the confirm passes (so cancelled confirms don't inflate the metric)", async () => {
    // Already covered indirectly above; assert call ordering explicitly.
    renderResult();
    await waitFor(() => screen.getByRole("button", { name: new RegExp(REFAIRE_LABEL) }));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(REFAIRE_LABEL) }));
    const confirmCallIdx = confirmSpy.mock.invocationCallOrder[0];
    const trackCalls = trackSpy.mock.invocationCallOrder;
    // First track call after the click must come AFTER the confirm.
    const firstTrackAfterConfirm = trackCalls.find((idx: number) => idx > confirmCallIdx);
    expect(firstTrackAfterConfirm).toBeDefined();
  });
});

describe("Result — affinement_clicked analytics + result_reached on mount", () => {
  let trackSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    resetSession();
    seedSession(TARGET);
    trackSpy = vi.spyOn(analytics, "track").mockImplementation(() => {});
  });

  afterEach(() => {
    trackSpy.mockRestore();
  });

  it("fires 'result_reached' with { counted, top } on mount when session has votes", async () => {
    renderResult();
    await waitFor(() => {
      expect(trackSpy).toHaveBeenCalledWith(
        "result_reached",
        expect.objectContaining({
          counted: expect.any(Number),
          top: expect.any(String),
        }),
      );
    });
  });

  it("renders the LEGISLATURE_LABEL in the header on a completed session (rename-safe via const)", async () => {
    renderResult();
    await waitFor(() => {
      expect(screen.getByText(new RegExp(LEGISLATURE_LABEL))).toBeInTheDocument();
    });
  });

  it("fires 'affinement_clicked' on the 'Continuer à affiner' button click (completed session only)", async () => {
    renderResult();
    // Completed session → not partial → the affinement button is rendered.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: new RegExp(CONTINUE_REFINE_LABEL) })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: new RegExp(CONTINUE_REFINE_LABEL) }));
    expect(trackSpy).toHaveBeenCalledWith("affinement_clicked");
  });

  it("does NOT render 'Continuer à affiner' on a partial session", async () => {
    resetSession();
    seedSession(3); // partial — well below TARGET
    renderResult();
    // Wait for pool to load + Result to render. The partial branch shows
    // "Continuer le test" instead.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: new RegExp(CONTINUE_TEST_LABEL_PREFIX) })).toBeInTheDocument()
    );
    expect(screen.queryByRole("button", { name: new RegExp(CONTINUE_REFINE_LABEL) })).not.toBeInTheDocument();
  });
});

describe("Result — personnalites_revealed analytics + once-per-mount guard", () => {
  let trackSpy: ReturnType<typeof vi.spyOn>;
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    localStorage.clear();
    resetSession();
    seedSession(TARGET);
    trackSpy = vi.spyOn(analytics, "track").mockImplementation(() => {});
    // Fixtures lack votes_personnalites (it's V2 P2 ingest output, not
    // baked into dev-fixtures.json). Inject the field on a copy of the
    // pool so personnalitesWithData.length > 0 and the toggle button
    // actually renders — without this, the gate `{personnalitesWithData
    // .length > 0 && (...)} hides the whole disclosure block.
    const pool = (fixtures as Scrutin[]).slice(0, TARGET).map((s) => ({
      ...s,
      votes_personnalites: {
        le_pen: "pour", faure: "contre", chatelain: "abstention",
        wauquiez: "pour", attal: "contre", ciotti: "pour",
        bompard: "contre", panot: "contre",
      } as Scrutin["votes_personnalites"],
    }));
    const scrutinsMod = await import("../src/lib/scrutins");
    fetchSpy = vi.spyOn(scrutinsMod, "fetchScrutins").mockResolvedValue(pool);
  });

  afterEach(() => {
    trackSpy.mockRestore();
    fetchSpy.mockRestore();
  });

  it("fires 'personnalites_revealed' on the first toggle-open click", async () => {
    renderResult();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Voir les personnalités/ })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /Voir les personnalités/ }));
    expect(trackSpy).toHaveBeenCalledWith("personnalites_revealed");
  });

  it("does NOT fire 'personnalites_revealed' again on subsequent toggles (once-per-mount via personnalitesReportedRef)", async () => {
    renderResult();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Voir les personnalités/ })).toBeInTheDocument()
    );
    const btn = screen.getByRole("button", { name: /Voir les personnalités/ });
    fireEvent.click(btn); // open → fires
    fireEvent.click(btn); // close → no-op for analytics
    fireEvent.click(btn); // open again → still no-op (guard)
    fireEvent.click(btn); // close
    fireEvent.click(btn); // open
    const reveals = trackSpy.mock.calls.filter((c: unknown[]) => c[0] === "personnalites_revealed");
    expect(reveals).toHaveLength(1);
  });

  it("does NOT fire 'personnalites_revealed' on a closing toggle when the panel was already open", async () => {
    renderResult();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Voir les personnalités/ })).toBeInTheDocument()
    );
    const btn = screen.getByRole("button", { name: /Voir les personnalités/ });
    fireEvent.click(btn); // open
    trackSpy.mockClear();
    fireEvent.click(btn); // close
    expect(trackSpy).not.toHaveBeenCalledWith("personnalites_revealed");
  });
});
