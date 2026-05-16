// tests/deck-invariants.test.ts
import { describe, it, expect } from "vitest";
import { composeDeck, chapeauPrefix } from "../src/lib/deck";
import type { Scrutin } from "../src/types";

function mkScrutin(id: string, theme: Scrutin["theme"], dossierId: string, chapeau: string): Scrutin {
  return {
    id, numero: parseInt(id.replace(/\D/g, ""), 10) || 1,
    date: "2024-01-01",
    dossier_id: dossierId,
    dossier_titre: "T",
    chapeau,
    titre_brut: "...", titre_pedago: "...",
    theme,
    points_cles: ["a", "b", "c"],
    position_par_groupe: { LFI: "pour" } as any,
    votes_bruts: {} as any,
    url_an_officielle: "https://example.com",
    est_solennel: true, pedago_relu: true,
  };
}

describe("composeDeck — V2 invariants", () => {
  it("returns ≤ size cards even when pool is larger", () => {
    const pool = Array.from({ length: 100 }, (_, i) =>
      mkScrutin(`s${i}`, "fiscalité", `d${i}`, `FISCALITÉ · LOI ${i}`)
    );
    const deck = composeDeck(pool, {
      size: 20, capPerDossier: 2, capPerChapeauPrefix: 2,
    });
    expect(deck.length).toBeLessThanOrEqual(20);
  });

  it("honors capPerChapeauPrefix=2 on a MAYOTTE-like cluster", () => {
    const pool = [
      mkScrutin("m1", "international", "DA", "MAYOTTE · cyclone Chido"),
      mkScrutin("m2", "international", "DB", "MAYOTTE · reconstruction"),
      mkScrutin("m3", "international", "DC", "MAYOTTE · état d'urgence"),
      mkScrutin("m4", "international", "DD", "MAYOTTE · loi spéciale"),
      mkScrutin("f1", "fiscalité",     "DE", "FISCALITÉ · taxe carbone"),
      mkScrutin("f2", "fiscalité",     "DF", "FISCALITÉ · niches"),
      mkScrutin("f3", "fiscalité",     "DG", "FISCALITÉ · ISF"),
    ];
    const deck = composeDeck(pool, {
      size: 20, capPerDossier: 2, capPerChapeauPrefix: 2,
    });
    // chapeauPrefix() returns lowercase, so compare against the lowercase form.
    // Asserting >0 ensures the cap mechanic is actually exercised (otherwise
    // the ≤2 check would trivially pass if the test happened to pick 0 cards).
    const mayotteCount = deck.filter((s) => chapeauPrefix(s) === "mayotte").length;
    expect(mayotteCount).toBeGreaterThan(0);
    expect(mayotteCount).toBeLessThanOrEqual(2);
  });

  it("respects resume state (seenDossierCounts pre-filled excludes saturated dossier)", () => {
    const pool = [
      mkScrutin("a1", "fiscalité", "D1", "FISCALITÉ · loi A"),
      mkScrutin("a2", "fiscalité", "D1", "FISCALITÉ · loi A bis"),
      mkScrutin("b1", "santé",     "D2", "SANTÉ · loi B"),
    ];
    const seenDossierCounts = new Map([["D1", 2]]);
    const deck = composeDeck(pool, {
      size: 20, capPerDossier: 2, capPerChapeauPrefix: 2,
      seenDossierCounts,
    });
    expect(deck.map((s) => s.id)).toEqual(["b1"]);
  });

  it("returns no duplicate ids", () => {
    const pool = Array.from({ length: 30 }, (_, i) =>
      mkScrutin(`s${i}`, "fiscalité", `d${i}`, `FISCALITÉ · ${i}`)
    );
    const deck = composeDeck(pool, { size: 20, capPerDossier: 2, capPerChapeauPrefix: 2 });
    const ids = deck.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("returns [] for empty pool", () => {
    const deck = composeDeck([], { size: 20, capPerDossier: 2, capPerChapeauPrefix: 2 });
    expect(deck).toEqual([]);
  });

  it("returns all available when pool < size", () => {
    const pool = [
      mkScrutin("s1", "fiscalité", "D1", "FISCALITÉ · A"),
      mkScrutin("s2", "santé",     "D2", "SANTÉ · B"),
      mkScrutin("s3", "écologie",  "D3", "ÉCOLOGIE · C"),
    ];
    const deck = composeDeck(pool, { size: 20, capPerDossier: 2, capPerChapeauPrefix: 2 });
    expect(deck.length).toBe(3);
  });
});
