import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  FreshnessBanner, STALE_AFTER_DAYS,
  FRESHNESS_OK_TITLE, FRESHNESS_STALE_TITLE,
  FRESHNESS_TODAY_PHRASE, FRESHNESS_IMMINENT_PHRASE,
  freshnessPastPhrase, freshnessNextPhrase,
} from "../src/components/FreshnessBanner";
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
  it("renders the fresh tone title at exactly STALE_AFTER_DAYS (boundary)", () => {
    render(<FreshnessBanner info={mk(STALE_AFTER_DAYS, 4)} />);
    expect(screen.getByText(FRESHNESS_OK_TITLE)).toBeInTheDocument();
  });

  it("switches to the stale tone title at STALE_AFTER_DAYS + 1 (just over)", () => {
    render(<FreshnessBanner info={mk(STALE_AFTER_DAYS + 1, 0)} />);
    expect(screen.getByText(FRESHNESS_STALE_TITLE)).toBeInTheDocument();
  });

  it("promotes past=0 to FRESHNESS_TODAY_PHRASE", () => {
    render(<FreshnessBanner info={mk(0, 7)} />);
    expect(screen.getByText(new RegExp(FRESHNESS_TODAY_PHRASE))).toBeInTheDocument();
  });

  it("promotes next=0 to FRESHNESS_IMMINENT_PHRASE", () => {
    render(<FreshnessBanner info={mk(3, 0)} />);
    expect(screen.getByText(new RegExp(FRESHNESS_IMMINENT_PHRASE))).toBeInTheDocument();
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
    // pastDays returns 0 on NaN; should promote to FRESHNESS_TODAY_PHRASE,
    // never leak "MAJ il y a NaN j".
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    expect(screen.getByText(new RegExp(FRESHNESS_TODAY_PHRASE))).toBeInTheDocument();
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
    expect(screen.getByText(new RegExp(FRESHNESS_IMMINENT_PHRASE))).toBeInTheDocument();
  });
});

describe("freshnessPastPhrase + freshnessNextPhrase — drift pins", () => {
  // Plural-rule + boundary helper drift surface. Source previously had
  // inline ternaries `past === 0 ? "MAJ aujourd'hui" : \`MAJ il y a ${past} jour${past !== 1 ? "s" : ""}\``
  // — tests pinned the literal templates via regex. Helpers + 4 const
  // exports keep source + tests in sync.

  it("freshnessPastPhrase(0) returns FRESHNESS_TODAY_PHRASE", () => {
    expect(freshnessPastPhrase(0)).toBe(FRESHNESS_TODAY_PHRASE);
  });

  it("freshnessNextPhrase(0) returns FRESHNESS_IMMINENT_PHRASE", () => {
    expect(freshnessNextPhrase(0)).toBe(FRESHNESS_IMMINENT_PHRASE);
  });

  it("freshnessPastPhrase uses singular 'jour' for past=1, plural 'jours' for past≥2", () => {
    expect(freshnessPastPhrase(1)).toBe("MAJ il y a 1 jour");
    expect(freshnessPastPhrase(2)).toBe("MAJ il y a 2 jours");
    expect(freshnessPastPhrase(7)).toBe("MAJ il y a 7 jours");
  });

  it("freshnessNextPhrase uses singular 'jour' for next=1, plural 'jours' for next≥2", () => {
    expect(freshnessNextPhrase(1)).toBe("prochaine sync dans 1 jour");
    expect(freshnessNextPhrase(2)).toBe("prochaine sync dans 2 jours");
    expect(freshnessNextPhrase(7)).toBe("prochaine sync dans 7 jours");
  });

  it("FRESHNESS_OK_TITLE + FRESHNESS_STALE_TITLE pin the canonical wording", () => {
    expect(FRESHNESS_OK_TITLE).toBe("Données à jour");
    expect(FRESHNESS_STALE_TITLE).toBe("Synchronisation en retard");
  });

  it("FRESHNESS_TODAY_PHRASE + FRESHNESS_IMMINENT_PHRASE pin the canonical boundary wording", () => {
    expect(FRESHNESS_TODAY_PHRASE).toBe("MAJ aujourd'hui");
    expect(FRESHNESS_IMMINENT_PHRASE).toBe("sync imminente");
  });
});
