import { describe, it, expect } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  BRAND_BG, BRAND_ACCENT, BRAND_INK, BRAND_INK_2,
} from "../api/_lib/brand-colors";

// api/_lib/brand-colors.ts owns the sRGB hex approximations of the
// OKLCH theme colors (src/index.css). The same BRAND_BG appears at:
//   - api/share-card.ts (SVG share-card background)
//   - public/manifest.webmanifest (PWA background_color + theme_color)
//   - index.html (<meta name="theme-color">)
// Tests below pin the relationship: a re-skin that updates the OKLCH
// CSS must also update brand-colors.ts AND the two static files in
// the same commit. The static-file reads use node:fs since the files
// aren't loaded into the SPA at runtime.

describe("Brand color consts — shape", () => {
  it("every brand color is a 6-digit hex (no shorthand)", () => {
    for (const c of [BRAND_BG, BRAND_ACCENT, BRAND_INK, BRAND_INK_2]) {
      expect(c).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("brand colors are visually distinct (no accidental dup)", () => {
    const all = [BRAND_BG, BRAND_ACCENT, BRAND_INK, BRAND_INK_2];
    expect(new Set(all).size).toBe(all.length);
  });

  it("BRAND_BG is the canonical app background hex (pin-the-value)", () => {
    // Edit this assertion deliberately alongside a theme re-skin.
    expect(BRAND_BG).toBe("#1d1f24");
  });
});

describe("BRAND_BG sync with static files (manifest + index.html)", () => {
  // Read the static files directly so a future re-skin that updates
  // BRAND_BG but forgets one of the two HTML/JSON files surfaces here.

  it("public/manifest.webmanifest background_color matches BRAND_BG", async () => {
    const raw = await fs.readFile(
      path.join(process.cwd(), "public/manifest.webmanifest"),
      "utf-8",
    );
    const manifest = JSON.parse(raw) as { background_color: string };
    expect(manifest.background_color).toBe(BRAND_BG);
  });

  it("public/manifest.webmanifest theme_color matches BRAND_BG", async () => {
    const raw = await fs.readFile(
      path.join(process.cwd(), "public/manifest.webmanifest"),
      "utf-8",
    );
    const manifest = JSON.parse(raw) as { theme_color: string };
    expect(manifest.theme_color).toBe(BRAND_BG);
  });

  it("index.html <meta name='theme-color'> matches BRAND_BG", async () => {
    const html = await fs.readFile(
      path.join(process.cwd(), "index.html"),
      "utf-8",
    );
    const match = html.match(/<meta name="theme-color" content="(#[0-9a-fA-F]{3,6})"/);
    expect(match).not.toBeNull();
    expect(match![1]).toBe(BRAND_BG);
  });

  it("index.html <noscript> body background matches BRAND_BG (JS-disabled fallback page)", async () => {
    // The <noscript> fallback page sits behind the same brand chrome as
    // the live app. A re-skin that updates BRAND_BG must propagate here
    // too — without this pin, a user with JS disabled would land on a
    // page that doesn't match the (updated) browser-tab theme color.
    const html = await fs.readFile(
      path.join(process.cwd(), "index.html"),
      "utf-8",
    );
    // Extract the inline `background: <hex>` from the noscript div's style attribute.
    const noscriptBlock = html.match(/<noscript>[\s\S]*?<\/noscript>/)?.[0] ?? "";
    const bgMatch = noscriptBlock.match(/background:\s*(#[0-9a-fA-F]{3,6})/);
    expect(bgMatch).not.toBeNull();
    expect(bgMatch![1]).toBe(BRAND_BG);
  });
});
