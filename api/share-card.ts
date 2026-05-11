// api/share-card.ts
import satori from "satori";
import { initWasm, Resvg } from "@resvg/resvg-wasm";

// Node.js serverless runtime: Edge was tried first but the embedded WASM
// pushed the function bundle past Hobby's 1 MB Edge limit. Node has a 50 MB
// bundle limit (plenty for resvg-wasm) and lets us fetch the WASM at runtime
// without the "Wasm code generation disallowed" restriction Edge imposes.
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
const ACCENT = "#7eb6ff";
const INK = "#f0f1f3";
const INK_2 = "#a7adb8";

// Stable TTF mirror of IBM Plex Mono Regular (Google Fonts repo via jsDelivr).
// Satori only supports TTF/OTF (opentype/cff) — woff/woff2 are not decoded.
const FALLBACK_FONT_URL =
  "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/ibmplexmono/IBMPlexMono-Regular.ttf";

const RESVG_WASM_URL =
  "https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm";

let wasmReady: Promise<void> | null = null;
function ensureWasm(): Promise<void> {
  if (!wasmReady) {
    wasmReady = initWasm(fetch(RESVG_WASM_URL)).catch((err: unknown) => {
      // Reset so a subsequent invocation can retry on transient failure.
      wasmReady = null;
      throw err;
    });
  }
  return wasmReady;
}

async function loadFont(url: string): Promise<ArrayBuffer> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Font fetch failed: ${r.status}`);
  return await r.arrayBuffer();
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

    const [font] = await Promise.all([
      loadFont(FALLBACK_FONT_URL),
      ensureWasm(),
    ]);

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

    const png = new Resvg(svg).render().asPng();
    return new Response(png, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, immutable",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(`share-card error: ${msg}`, { status: 500 });
  }
}
