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

/** Compose a deck of `size` scrutins from `pool`, capping per dossier and
 * skipping any scrutin already in `excludeIds` (already seen this session). */
export function composeDeck(pool: Scrutin[], opts: ComposeOptions): Scrutin[] {
  const seed = opts.seed ?? Math.floor(Math.random() * 2 ** 31);
  const rng = mulberry32(seed);
  const shuffled = shuffle(pool, rng);
  const counts = new Map<string, number>(opts.seenDossierCounts ?? []);
  const exclude = opts.excludeIds ?? new Set<string>();
  const deck: Scrutin[] = [];

  for (const s of shuffled) {
    if (deck.length >= opts.size) break;
    if (exclude.has(s.id)) continue;
    const c = counts.get(s.dossier_id) ?? 0;
    if (c >= opts.capPerDossier) continue;
    deck.push(s);
    counts.set(s.dossier_id, c + 1);
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
