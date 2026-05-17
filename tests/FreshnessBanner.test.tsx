import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FreshnessBanner } from "../src/components/FreshnessBanner";
import type { FreshnessInfo } from "../src/types";

// Session 42 promoted the "0 j" boundary cases to natural-language phrasing
// ("MAJ aujourd'hui", "sync imminente") and fixed the past/next plural to the
// French `!== 1 ? "s" : ""` rule. Session 44 added the >10-day stale tone
// switch ("Synchronisation en retard" + transparent background). None of
// these branches had tests — a regression would silently fall back to the
// "0 j" / wrong plural / always-accent rendering.

function mk(pastDays: number, nextDays: number, total = 100): FreshnessInfo {
  const now = Date.now();
  return {
    total_scrutins: total,
    last_sync_at: new Date(now - pastDays * 86400_000).toISOString(),
    next_sync_eta: new Date(now + nextDays * 86400_000).toISOString(),
  };
}

describe("FreshnessBanner", () => {
  it("renders the fresh tone title when past <= STALE_AFTER_DAYS", () => {
    render(<FreshnessBanner info={mk(3, 4)} />);
    expect(screen.getByText("Données à jour")).toBeInTheDocument();
  });

  it("switches to the stale tone title when past > 10 days", () => {
    render(<FreshnessBanner info={mk(15, 0)} />);
    expect(screen.getByText("Synchronisation en retard")).toBeInTheDocument();
  });

  it("promotes past=0 to 'MAJ aujourd'hui'", () => {
    render(<FreshnessBanner info={mk(0, 7)} />);
    expect(screen.getByText(/MAJ aujourd'hui/)).toBeInTheDocument();
  });

  it("promotes next=0 to 'sync imminente'", () => {
    render(<FreshnessBanner info={mk(3, 0)} />);
    expect(screen.getByText(/sync imminente/)).toBeInTheDocument();
  });

  it("uses the French !== 1 plural rule for past days", () => {
    // 1 jour = singular, everything else (including 0 if it weren't promoted) = plural
    render(<FreshnessBanner info={mk(1, 7)} />);
    expect(screen.getByText(/MAJ il y a 1 jour\b/)).toBeInTheDocument();
    expect(screen.queryByText(/MAJ il y a 1 jours/)).not.toBeInTheDocument();
  });

  it("uses 'jours' plural for past >= 2 days", () => {
    render(<FreshnessBanner info={mk(5, 7)} />);
    expect(screen.getByText(/MAJ il y a 5 jours/)).toBeInTheDocument();
  });

  it("renders total_scrutins in the body line", () => {
    render(<FreshnessBanner info={mk(3, 7, 92)} />);
    expect(screen.getByText(/92 scrutins/)).toBeInTheDocument();
  });

  it("singularises 'scrutin' when total_scrutins is 1", () => {
    // Session 83: total_scrutins was hardcoded "scrutins" plural — with a
    // freshly-seeded Supabase (1 row) the banner read "1 scrutins · …".
    render(<FreshnessBanner info={mk(3, 7, 1)} />);
    expect(screen.getByText(/^1 scrutin\b/)).toBeInTheDocument();
    expect(screen.queryByText(/1 scrutins/)).not.toBeInTheDocument();
  });

  it("falls back to 0 (not NaN) when last_sync_at is malformed", () => {
    const info: FreshnessInfo = {
      total_scrutins: 100,
      last_sync_at: "not-a-date",
      next_sync_eta: new Date().toISOString(),
    };
    render(<FreshnessBanner info={info} />);
    // pastDays returns 0 on NaN; should promote to "MAJ aujourd'hui",
    // never leak "MAJ il y a NaN j".
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    expect(screen.getByText(/MAJ aujourd'hui/)).toBeInTheDocument();
  });

  it("falls back to 0 (not NaN) when next_sync_eta is malformed", () => {
    // Symmetric defense for the diffDays path. Session 83 covered the
    // pastDays/last_sync_at side; the diffDays/next_sync_eta side has the
    // same NaN guard in FreshnessBanner — without a test, removing it
    // would slip past CI silently.
    const info: FreshnessInfo = {
      total_scrutins: 100,
      last_sync_at: new Date().toISOString(),
      next_sync_eta: "not-a-date",
    };
    render(<FreshnessBanner info={info} />);
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    expect(screen.getByText(/sync imminente/)).toBeInTheDocument();
  });
});
