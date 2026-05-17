// api/_lib/brand-colors.ts
//
// sRGB hex approximations of the OKLCH theme colors declared in
// src/index.css. Server-side rendering (Satori for the share-card SVG)
// can't read CSS vars, so the hex values are duplicated here. Static
// files (public/manifest.webmanifest, index.html meta theme-color)
// also need fixed hex values for PWA + tab-color rendering.
//
// Tests in tests/brand-colors.test.ts pin:
//   - api/share-card.ts continues to import these consts (not inline hex)
//   - manifest.webmanifest background_color + theme_color match BRAND_BG
//   - index.html <meta name="theme-color"> matches BRAND_BG
//
// Drift from the OKLCH source values (a CSS theme tweak that doesn't
// also update these consts) is a manual catch — the relationship isn't
// auto-derivable without a sRGB conversion lib. Re-derive via the
// `oklch(0.18 0.012 250)` → sRGB pipeline in any browser DevTools when
// the design system shifts.
//
// `api/_lib/` is the Vercel convention for non-route helpers — the
// underscore prefix keeps this file out of the deployed serverless
// routes alongside parse-top.ts.

/** Background — sRGB approximation of `oklch(0.18 0.012 250)`
 *  (src/index.css `--bg`). Single source of truth across: the SVG
 *  share card, the PWA manifest (background + theme), and the
 *  index.html meta theme-color. */
export const BRAND_BG = "#1d1f24";

/** Orange signal — sRGB approximation of `oklch(0.76 0.16 55)`
 *  (src/index.css `--accent`, board 04 direction D3). Previously held
 *  `#7eb6ff` (D2 république blue, archived) — share images visibly
 *  diverged from the app's identity. */
export const BRAND_ACCENT = "#ed9846";

/** Primary ink — sRGB approximation of `oklch(0.96 0.005 250)`
 *  (src/index.css `--ink`). Used for the share card's heading text. */
export const BRAND_INK = "#f0f1f3";

/** Secondary ink — sRGB approximation of `oklch(0.72 0.01 250)`
 *  (src/index.css `--ink-2`). Used for the share card's metadata
 *  + ranking rows. */
export const BRAND_INK_2 = "#a7adb8";
