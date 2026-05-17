// api/share-card.ts
//
// Generates a shareable card as inline SVG. Originally rendered to PNG via
// resvg-wasm, but compiling and running the WASM on a Vercel Hobby Node
// serverless function consistently exceeded the 10 s timeout. SVG is rendered
// in 1–2 s by Satori alone, embeds cleanly in browser tabs and the Web Share
// API, and is good enough for V1.
import satori from "satori";

export const config = { runtime: "nodejs" };

interface Bar { code: string; pct: number; }

function parseTopParam(t: string | null): Bar[] {
  if (!t) return [];
  return t.split(",").map(pair => {
    const [code, pctStr] = pair.split(":");
    return { code, pct: parseInt(pctStr, 10) };
  }).filter(b => !!b.code && !isNaN(b.pct));
}

const BG = "#1d1f24";
// Orange signal — sRGB approximation of `oklch(0.76 0.16 55)` (index.css
// `--accent`, board 04 direction D3). Server-side rendering can't read CSS
// vars, so the hex is duplicated. Previously held `#7eb6ff` (D2 république
// blue, archived) — share images visibly diverged from the app's identity.
const ACCENT = "#ed9846";
const INK = "#f0f1f3";
const INK_2 = "#a7adb8";

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
    const bars = parseTopParam(searchParams.get("t")).slice(0, 8);
    if (bars.length === 0) {
      return new Response("Missing t param", { status: 400 });
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
          { type: "div", props: { style: { fontSize: 28, color: INK_2, marginTop: 8 }, children: `basées sur les vrais votes de l'AN` } },
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
          { type: "div", props: { style: { marginTop: "auto", fontSize: 28, color: INK_2 }, children: "sansdetour.fr" } },
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
