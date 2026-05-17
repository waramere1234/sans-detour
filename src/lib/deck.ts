// src/lib/deck.ts
import type { Scrutin } from "../types";

/** Deck composition caps used by both Play.tsx (initial compose + draws
 *  on swipe) and the deck test suites. Exported here so a future bump
 *  (e.g. 2 → 3 per dossier) propagates atomically: previously the value
 *  was a private const in Play.tsx and duplicated as the literal `2`
 *  ~10× across tests/deck*.test.ts, so a bump would silently leave the
 *  tests validating the old policy. */
export const DEFAULT_CAP_PER_DOSSIER = 2;
export const DEFAULT_CAP_PER_CHAPEAU_PREFIX = 2;

export interface ComposeOptions {
  size: number;
  capPerDossier: number;
  /** Optional cap on how many scrutins sharing the same chapeau prefix
   *  (the text before " · ") may appear. Catches subject clusters that
   *  the dossier cap misses — e.g. multiple MAYOTTE scrutins each with a
   *  STANDALONE dossier_id slip past capPerDossier but share the same
   *  political subject. Set undefined to disable. */
  capPerChapeauPrefix?: number;
  /** Scrutins already seen this session — must not appear in the new deck. */
  excludeIds?: Set<string>;
  /** Per-dossier counts already accumulated this session — respected by cap. */
  seenDossierCounts?: Map<string, number>;
  /** Per-prefix counts already accumulated this session — respected by cap. */
  seenChapeauPrefixCounts?: Map<string, number>;
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

/** Extract the chapeau prefix used by the per-subject cap. The chapeau format
 *  is "[SUBJECT] · [DETAIL]" so we take everything before the first " · ".
 *  Lowercased + trimmed for case-insensitive matching across the LLM's
 *  cosmetic variations. */
export function chapeauPrefix(s: Scrutin): string {
  const c = s.chapeau ?? "";
  const idx = c.indexOf(" · ");
  return (idx > 0 ? c.slice(0, idx) : c).trim().toLowerCase();
}

/** Compose a deck of `size` scrutins from `pool` while:
 *  - capping at `capPerDossier` per legislative dossier (V1 behavior),
 *  - optionally capping at `capPerChapeauPrefix` per subject (V2 — catches
 *    UKRAINE / MAYOTTE / MOTION CENSURE clusters that bypass the dossier cap
 *    because their rows have STANDALONE dossier_ids),
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
  const prefixCounts = new Map<string, number>(opts.seenChapeauPrefixCounts ?? []);
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
        if (opts.capPerChapeauPrefix !== undefined) {
          const prefix = chapeauPrefix(s);
          const pc = prefixCounts.get(prefix) ?? 0;
          if (pc >= opts.capPerChapeauPrefix) continue;
          prefixCounts.set(prefix, pc + 1);
        }
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
  capPerChapeauPrefix?: number;
  seenChapeauPrefixCounts?: Map<string, number>;
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
  // Resolve the prefix-counts map once, with the same default-empty pattern
  // composeDeck uses (line 69). Without this, a caller that sets
  // `capPerChapeauPrefix: 2` but forgets `seenChapeauPrefixCounts` would
  // silently get the cap skipped: `undefined?.get() ?? 0` is always 0,
  // so `0 >= 2` never triggers. Defaulting to an empty Map preserves the
  // cap behavior (cap of N still triggers once the Map is grown — useful
  // for composability if the caller threads the map through later draws).
  const prefixCounts = opts.capPerChapeauPrefix !== undefined
    ? (opts.seenChapeauPrefixCounts ?? new Map<string, number>())
    : null;
  for (const s of shuffled) {
    if (seenIds.has(s.id)) continue;
    const c = opts.seenDossierCounts.get(s.dossier_id) ?? 0;
    if (c >= opts.capPerDossier) continue;
    if (prefixCounts) {
      const prefix = chapeauPrefix(s);
      const pc = prefixCounts.get(prefix) ?? 0;
      if (pc >= opts.capPerChapeauPrefix!) continue;
    }
    return s;
  }
  return null;
}
