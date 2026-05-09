// api/share-card.ts
import satori from "satori";
import { Resvg } from "@resvg/resvg-wasm";

export const config = { runtime: "edge" };

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
const FALLBACK_FONT_URL = "https://fonts.gstatic.com/s/ibmplexmono/v19/-F63fjptAgt5VM-kVkqdyU8n3pwIYVQRHqo.woff2";

async function loadFont(url: string): Promise<ArrayBuffer> {
  const r = await fetch(url);
  return await r.arrayBuffer();
}

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const fmt = searchParams.get("fmt") === "story" ? "story" : "square";
  const bars = parseTopParam(searchParams.get("t"));
  if (bars.length === 0) {
    return new Response("Missing t param", { status: 400 });
  }

  const W = fmt === "square" ? 1080 : 1080;
  const H = fmt === "square" ? 1080 : 1920;
  const top = bars[0];

  const font = await loadFont(FALLBACK_FONT_URL);

  const svg = await satori(
    {
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
    },
    {
      width: W, height: H,
      fonts: [{ name: "Plex", data: font, weight: 400, style: "normal" }],
    },
  );

  const png = new Resvg(svg).render().asPng();
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, immutable",
    },
  });
}
