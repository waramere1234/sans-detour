// api/share-card.ts
//
// Generates a shareable card as inline SVG. Originally rendered to PNG via
// resvg-wasm, but compiling and running the WASM on a Vercel Hobby Node
// serverless function consistently exceeded the 10 s timeout. SVG is rendered
// in 1–2 s by Satori alone, embeds cleanly in browser tabs and the Web Share
// API, and is good enough for V1.
import satori from "satori";
import { parseTopParam, MAX_SHARE_CARD_BARS } from "./_lib/parse-top";
import {
  BRAND_BG, BRAND_ACCENT, BRAND_INK, BRAND_INK_2,
} from "./_lib/brand-colors";
import { PROD_HOSTNAME, SHARE_SOURCE_LINE } from "../src/types";

// "sansdetour.fr" footer text on the SVG card — PROD_HOSTNAME is the
// canonical apex (derived from PROD_ORIGIN in src/types/index.ts) so
// a rebrand updates the visible domain alongside the canonical URL
// via one edit. Previously a stand-alone strip-protocol regex here.

export const config = { runtime: "nodejs" };

// Brand colors live in api/_lib/brand-colors.ts (single source of
// truth for the share card SVG, PWA manifest, and index.html meta
// theme-color). See that file for the OKLCH-derivation rationale.
const BG = BRAND_BG;
const ACCENT = BRAND_ACCENT;
const INK = BRAND_INK;
const INK_2 = BRAND_INK_2;

// Stable TTF mirror of IBM Plex Mono Regular (Google Fonts repo via jsDelivr).
// Satori only supports TTF/OTF (opentype/cff) — woff/woff2 are not decoded.
const FALLBACK_FONT_URL =
  "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/ibmplexmono/IBMPlexMono-Regular.ttf";

let fontCache: ArrayBuffer | null = null;
async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;
  const r = await fetch(FALLBACK_FONT_URL);
  if (!r.ok) throw new Error(`Font fetch failed: ${r.status}`);
  fontCache = await r.arrayBuffer();
  return fontCache;
}

// Satori's first argument is typed as React.ReactNode. We pass a plain
// JSX-shaped object tree (no React import here) — cast through unknown so
// Vercel's tsc accepts it without pulling in React types.
type SatoriTree = Parameters<typeof satori>[0];

export default async function handler(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const fmt = searchParams.get("fmt") === "story" ? "story" : "square";
    const bars = parseTopParam(searchParams.get("t")).slice(0, MAX_SHARE_CARD_BARS);
    if (bars.length === 0) {
      // Mirror the 500 path: explicit `text/plain` so curl / scrapers /
      // browsers don't interpret the short body via a platform-default
      // (which on some hosts is octet-stream, on others text/html).
      return new Response("Missing t param", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const W = 1080;
    const H = fmt === "square" ? 1080 : 1920;
    const top = bars[0];

    const font = await loadFont();

    const tree = {
      type: "div",
      props: {
        style: {
          width: W, height: H, background: BG,
          padding: 64, display: "flex", flexDirection: "column",
          fontFamily: "Plex",
          color: INK,
        },
        children: [
          { type: "div", props: { style: { fontSize: 24, color: INK_2, letterSpacing: 4 }, children: "MES AFFINITÉS RÉELLES" } },
          { type: "div", props: { style: { fontSize: 28, color: INK_2, marginTop: 8 }, children: SHARE_SOURCE_LINE } },
          { type: "div", props: { style: { fontSize: 96, fontWeight: 700, marginTop: 64, color: ACCENT }, children: `${top.code} · ${top.pct}%` } },
          { type: "div", props: {
              style: { marginTop: 64, display: "flex", flexDirection: "column", gap: 16 },
              children: bars.slice(1, 6).map(b => ({
                type: "div", props: {
                  style: { display: "flex", justifyContent: "space-between", fontSize: 32, color: INK_2 },
                  children: [
                    { type: "span", props: { children: b.code } },
                    { type: "span", props: { children: `${b.pct}%` } },
                  ],
                },
              })),
            },
          },
          { type: "div", props: { style: { marginTop: "auto", fontSize: 28, color: INK_2 }, children: PROD_HOSTNAME } },
        ],
      },
    };

    const svg = await satori(tree as unknown as SatoriTree, {
      width: W, height: H,
      fonts: [{ name: "Plex", data: font, weight: 400, style: "normal" }],
    });

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, immutable",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Explicit Content-Type so the response is interpreted as plain text
    // regardless of Vercel's platform-default for 500s — otherwise a
    // curl / scraper might treat the body as octet-stream or HTML.
    return new Response(`share-card error: ${msg}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
