import { describe, it, expect } from "vitest";
import { composeDeck, drawNext } from "../src/lib/deck";
import type { Scrutin } from "../src/types";

function mk(id: string, dossier: string): Scrutin {
  return {
    id, numero: 0, date: "2024-01-01",
    dossier_id: dossier, dossier_titre: dossier,
    chapeau: "X", titre_brut: "...", titre_pedago: "...",
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
