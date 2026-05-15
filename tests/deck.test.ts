import { describe, it, expect } from "vitest";
import { composeDeck, drawNext } from "../src/lib/deck";
import type { Scrutin, Theme } from "../src/types";

function mk(id: string, dossier: string, theme?: Theme): Scrutin {
  return {
    id, numero: 0, date: "2024-01-01",
    dossier_id: dossier, dossier_titre: dossier,
    chapeau: "X", titre_brut: "...", titre_pedago: "...",
    theme,
    position_par_groupe: {} as any, votes_bruts: {} as any,
    url_an_officielle: "", est_solennel: true, pedago_relu: true,
  };
}

describe("composeDeck (PRD § 9.3)", () => {
  it("returns 20 scrutins when pool is large enough", () => {
    const pool = Array.from({ length: 100 }, (_, i) => mk(`s${i}`, `d${i % 30}`));
    const deck = composeDeck(pool, { size: 20, capPerDossier: 2, seed: 42 });
    expect(deck).toHaveLength(20);
  });

  it("respects max 2 scrutins per dossier", () => {
    const pool = Array.from({ length: 100 }, (_, i) => mk(`s${i}`, `d${i % 5}`));
    const deck = composeDeck(pool, { size: 20, capPerDossier: 2, seed: 42 });
    const counts = new Map<string, number>();
    for (const s of deck) counts.set(s.dossier_id, (counts.get(s.dossier_id) ?? 0) + 1);
    for (const [, n] of counts) expect(n).toBeLessThanOrEqual(2);
  });

  it("returns no duplicates", () => {
    const pool = Array.from({ length: 50 }, (_, i) => mk(`s${i}`, `d${i % 25}`));
    const deck = composeDeck(pool, { size: 20, capPerDossier: 2, seed: 1 });
    const ids = new Set(deck.map(s => s.id));
    expect(ids.size).toBe(deck.length);
  });

  it("returns fewer than size when pool exhausted", () => {
    const pool = Array.from({ length: 8 }, (_, i) => mk(`s${i}`, `d${i}`));
    const deck = composeDeck(pool, { size: 20, capPerDossier: 2, seed: 1 });
    expect(deck.length).toBeLessThanOrEqual(8);
  });

  it("is deterministic with the same seed", () => {
    const pool = Array.from({ length: 100 }, (_, i) => mk(`s${i}`, `d${i % 30}`));
    const a = composeDeck(pool, { size: 20, capPerDossier: 2, seed: 7 });
    const b = composeDeck(pool, { size: 20, capPerDossier: 2, seed: 7 });
    expect(a.map(s => s.id)).toEqual(b.map(s => s.id));
  });

  it("excludes already-seen scrutins (resume mid-session)", () => {
    const pool = Array.from({ length: 30 }, (_, i) => mk(`s${i}`, `d${i % 15}`));
    const seen = new Set(["s0", "s5", "s10", "s15", "s20"]);
    const deck = composeDeck(pool, {
      size: 20,
      capPerDossier: 2,
      excludeIds: seen,
      seed: 42,
    });
    for (const s of deck) {
      expect(seen.has(s.id)).toBe(false);
    }
  });

  it("respects cap when seenDossierCounts is pre-populated", () => {
    // d0 already has 2 cards seen → cap reached, no new d0 in deck
    const pool = Array.from({ length: 40 }, (_, i) => mk(`s${i}`, `d${i % 10}`));
    const deck = composeDeck(pool, {
      size: 20,
      capPerDossier: 2,
      seenDossierCounts: new Map([["d0", 2]]),
      seed: 42,
    });
    for (const s of deck) {
      expect(s.dossier_id).not.toBe("d0");
    }
  });

  it("spreads themes via round-robin when the pool is heavily skewed", () => {
    // 40 cards on "retraites", 10 on "écologie", 10 on "immigration", 10 on "santé".
    // Without theme balancing a random sampling of 20 would land mostly on retraites;
    // the round-robin should pull from each bucket before piling up.
    const pool: Scrutin[] = [
      ...Array.from({ length: 40 }, (_, i) => mk(`r${i}`, `dR${i}`, "retraites")),
      ...Array.from({ length: 10 }, (_, i) => mk(`e${i}`, `dE${i}`, "écologie")),
      ...Array.from({ length: 10 }, (_, i) => mk(`m${i}`, `dM${i}`, "immigration")),
      ...Array.from({ length: 10 }, (_, i) => mk(`s${i}`, `dS${i}`, "santé")),
    ];
    const deck = composeDeck(pool, { size: 20, capPerDossier: 2, seed: 42 });
    const byTheme = new Map<string, number>();
    for (const s of deck) {
      const t = s.theme ?? "autre";
      byTheme.set(t, (byTheme.get(t) ?? 0) + 1);
    }
    // All 4 themes represented, and no theme dominates more than half the deck.
    expect(byTheme.size).toBe(4);
    for (const n of byTheme.values()) expect(n).toBeLessThanOrEqual(10);
  });

  it("works when no scrutin has a theme (pre-migration rows fall in 'autre')", () => {
    const pool = Array.from({ length: 30 }, (_, i) => mk(`s${i}`, `d${i % 15}`));
    const deck = composeDeck(pool, { size: 20, capPerDossier: 2, seed: 11 });
    expect(deck).toHaveLength(20);
  });
});

describe("drawNext (mode affinement)", () => {
  it("returns a scrutin not in seenIds, respecting cap", () => {
    const pool = Array.from({ length: 50 }, (_, i) => mk(`s${i}`, `d${i % 10}`));
    const seen = new Set(["s0", "s1", "s2"]);
    const next = drawNext(pool, seen, { capPerDossier: 2, seenDossierCounts: new Map([["d0", 1]]), seed: 9 });
    expect(next).not.toBeNull();
    expect(seen.has(next!.id)).toBe(false);
  });

  it("returns null when pool is exhausted", () => {
    const pool = [mk("s0", "d0")];
    const seen = new Set(["s0"]);
    const next = drawNext(pool, seen, { capPerDossier: 2, seenDossierCounts: new Map(), seed: 1 });
    expect(next).toBeNull();
  });
});
