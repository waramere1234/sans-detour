// src/lib/deck.ts
import type { Scrutin } from "../types";

export interface ComposeOptions {
  size: number;
  capPerDossier: number;
  /** Scrutins already seen this session — must not appear in the new deck. */
  excludeIds?: Set<string>;
  /** Per-dossier counts already accumulated this session — respected by cap. */
  seenDossierCounts?: Map<string, number>;
  seed?: number;
}

/** Deterministic PRNG — Mulberry32. */
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t |= 0; t = (t + 0x6D2B79F5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle with a deterministic PRNG. */
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Compose a deck of `size` scrutins from `pool` while:
 *  - capping at `capPerDossier` per legislative dossier (V1 behavior),
 *  - excluding already-seen ids,
 *  - balancing themes via a round-robin walk: one scrutin per theme per pass,
 *    so a 20-card session naturally spreads across the available themes
 *    instead of clustering on whatever's most numerous in the pool.
 *
 *  Themes are taken from `scrutin.theme`; scrutins without a theme fall into
 *  an "autre" bucket so older rows (pre-migration 0005) still flow through. */
export function composeDeck(pool: Scrutin[], opts: ComposeOptions): Scrutin[] {
  const seed = opts.seed ?? Math.floor(Math.random() * 2 ** 31);
  const rng = mulberry32(seed);
  const counts = new Map<string, number>(opts.seenDossierCounts ?? []);
  const exclude = opts.excludeIds ?? new Set<string>();

  // Bucket the pool by theme, shuffled within each bucket so the round-robin
  // walk picks a different representative every session.
  const buckets = new Map<string, Scrutin[]>();
  for (const s of pool) {
    if (exclude.has(s.id)) continue;
    const t = s.theme ?? "autre";
    const b = buckets.get(t);
    if (b) b.push(s); else buckets.set(t, [s]);
  }
  for (const [k, v] of buckets) buckets.set(k, shuffle(v, rng));

  // Theme order is itself randomized per session so no single theme is
  // systematically favored when the pool is unbalanced.
  const themeOrder = shuffle([...buckets.keys()], rng);

  const deck: Scrutin[] = [];
  let pickedThisPass = true;
  while (deck.length < opts.size && pickedThisPass) {
    pickedThisPass = false;
    for (const theme of themeOrder) {
      if (deck.length >= opts.size) break;
      const bucket = buckets.get(theme)!;
      while (bucket.length > 0) {
        const s = bucket.shift()!;
        const c = counts.get(s.dossier_id) ?? 0;
        if (c >= opts.capPerDossier) continue;
        deck.push(s);
        counts.set(s.dossier_id, c + 1);
        pickedThisPass = true;
        break;
      }
    }
  }

  return deck;
}

export interface DrawNextOptions {
  capPerDossier: number;
  seenDossierCounts: Map<string, number>;
  seed?: number;
}

/** Draw a single next scrutin (mode affinement). Returns null if pool exhausted. */
export function drawNext(
  pool: Scrutin[],
  seenIds: Set<string>,
  opts: DrawNextOptions,
): Scrutin | null {
  const seed = opts.seed ?? Math.floor(Math.random() * 2 ** 31);
  const rng = mulberry32(seed);
  const shuffled = shuffle(pool, rng);
  for (const s of shuffled) {
    if (seenIds.has(s.id)) continue;
    const c = opts.seenDossierCounts.get(s.dossier_id) ?? 0;
    if (c >= opts.capPerDossier) continue;
    return s;
  }
  return null;
}
