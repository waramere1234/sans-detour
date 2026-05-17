// api/_lib/parse-top.ts
//
// Share-card URL parameter parser. Pulled out of api/share-card.ts so the
// pure parsing/clamping logic is testable without dragging in satori
// (which loads opentype + a TTF font at module top — overkill for a
// 30-line parser test, and makes the test suite slow to start).
//
// Vercel does NOT deploy files inside `api/_*` as serverless routes (the
// underscore prefix is the framework convention to mark non-route helpers),
// so this module lives next to share-card.ts but stays out of the
// deployed surface.

export interface Bar {
  code: string;
  pct: number;
}

/** Parse the `?t=RN:57,LFI:30,EPR:22` URL param into `Bar[]`. Defends the
 *  rendered card against malformed input (negative pcts, NaN, missing
 *  pieces) so a hand-crafted or buggy share URL can't ship a "-50%" or
 *  "200%" image.
 *
 *  Clamping rule: real alignment scores are `Math.round((sum/counted)*100)`
 *  ∈ [0, 100]. We clamp at those endpoints rather than reject so a near-
 *  miss (e.g. accidental "-5%" from a future refactor's rounding) renders
 *  sanely at 0 instead of breaking the card. */
export function parseTopParam(t: string | null): Bar[] {
  if (!t) return [];
  return t.split(",").map((pair) => {
    const [code, pctStr] = pair.split(":");
    const pct = parseInt(pctStr, 10);
    return { code, pct: Math.max(0, Math.min(100, pct)) };
  }).filter((b) => !!b.code && !isNaN(b.pct));
}
