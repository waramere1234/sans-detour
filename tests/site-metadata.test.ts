import { describe, it, expect } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  TAGLINE, BRAND_NAME, LEGISLATURE_LABEL_LOWERCASE, PROD_ORIGIN,
  PROD_HOSTNAME, APP_LOCALE, OG_LOCALE,
  NOSCRIPT_HEADING, NOSCRIPT_MESSAGE,
} from "../src/types";

// index.html + public/manifest.webmanifest both carry copy that the
// app itself surfaces (tagline on Cover, brand name, legislature
// label). Without these tests, a rewording in one source would silently
// diverge from the others — users see one wording on the Cover hero
// and a different one in the browser tab title / OG preview.
//
// Each canonical string lives as a const in src/types/index.ts; the
// tests read the static files and assert each call site contains the
// const value.

async function readIndexHtml(): Promise<string> {
  return fs.readFile(path.join(process.cwd(), "index.html"), "utf-8");
}

async function readManifest(): Promise<Record<string, unknown>> {
  const raw = await fs.readFile(
    path.join(process.cwd(), "public/manifest.webmanifest"),
    "utf-8",
  );
  return JSON.parse(raw) as Record<string, unknown>;
}

describe("TAGLINE sync (index.html + manifest)", () => {
  it("manifest.description matches TAGLINE", async () => {
    const manifest = await readManifest();
    expect(manifest.description).toBe(TAGLINE);
  });

  it("index.html <meta name='description'> matches TAGLINE", async () => {
    const html = await readIndexHtml();
    const match = html.match(/<meta name="description" content="([^"]+)"/);
    expect(match).not.toBeNull();
    expect(match![1]).toBe(TAGLINE);
  });

  it("index.html <meta property='og:description'> begins with TAGLINE", async () => {
    // og:description is longer than TAGLINE (it appends a marketing
    // sentence). Assert it STARTS with the tagline so a reword that
    // changes only the prefix propagates correctly.
    const html = await readIndexHtml();
    const match = html.match(/<meta property="og:description" content="([^"]+)"/);
    expect(match).not.toBeNull();
    expect(match![1].startsWith(TAGLINE)).toBe(true);
  });

  it("index.html <meta name='twitter:description'> matches TAGLINE", async () => {
    const html = await readIndexHtml();
    const match = html.match(/<meta name="twitter:description" content="([^"]+)"/);
    expect(match).not.toBeNull();
    expect(match![1]).toBe(TAGLINE);
  });

  it("index.html <title> ends with TAGLINE (after the brand name + em dash)", async () => {
    const html = await readIndexHtml();
    const match = html.match(/<title>([^<]+)<\/title>/);
    expect(match).not.toBeNull();
    expect(match![1].endsWith(TAGLINE)).toBe(true);
  });
});

describe("BRAND_NAME sync (manifest + index.html metas)", () => {
  it("manifest.name matches BRAND_NAME", async () => {
    const manifest = await readManifest();
    expect(manifest.name).toBe(BRAND_NAME);
  });

  it("manifest.short_name matches BRAND_NAME", async () => {
    const manifest = await readManifest();
    expect(manifest.short_name).toBe(BRAND_NAME);
  });

  it("index.html <meta property='og:title'> matches BRAND_NAME", async () => {
    const html = await readIndexHtml();
    const match = html.match(/<meta property="og:title" content="([^"]+)"/);
    expect(match).not.toBeNull();
    expect(match![1]).toBe(BRAND_NAME);
  });

  it("index.html <meta name='twitter:title'> matches BRAND_NAME", async () => {
    const html = await readIndexHtml();
    const match = html.match(/<meta name="twitter:title" content="([^"]+)"/);
    expect(match).not.toBeNull();
    expect(match![1]).toBe(BRAND_NAME);
  });

  it("index.html <title> begins with BRAND_NAME (before the em dash + tagline)", async () => {
    const html = await readIndexHtml();
    const match = html.match(/<title>([^<]+)<\/title>/);
    expect(match).not.toBeNull();
    expect(match![1].startsWith(BRAND_NAME)).toBe(true);
  });
});

describe("LEGISLATURE_LABEL_LOWERCASE sync (index.html og:description)", () => {
  it("og:description mentions the current legislature label", async () => {
    // The og:description's marketing sentence references the legislature
    // ("…de la 17e législature."). A V3 transition to the 18e legislature
    // must update LEGISLATURE_LABEL_LOWERCASE AND the og:description in
    // the same commit — this test pins the linkage.
    const html = await readIndexHtml();
    const match = html.match(/<meta property="og:description" content="([^"]+)"/);
    expect(match).not.toBeNull();
    expect(match![1]).toContain(LEGISLATURE_LABEL_LOWERCASE);
  });
});

describe("PROD_ORIGIN sync (index.html canonical + og:url + og:image + twitter:image)", () => {
  // The prod origin appears 4× in index.html static metadata. A rebrand
  // to a different domain edits PROD_ORIGIN in src/types/index.ts and
  // the 4 below; without these pins, a forgotten meta would leave OG
  // previews / canonical / Twitter card pointing at the old origin
  // (and crawlers + share dialogs would render stale).

  it("<link rel='canonical'> matches PROD_ORIGIN (with trailing slash)", async () => {
    const html = await readIndexHtml();
    const match = html.match(/<link rel="canonical" href="([^"]+)"/);
    expect(match).not.toBeNull();
    // Canonical conventionally ends with `/` for the home page.
    expect(match![1]).toBe(`${PROD_ORIGIN}/`);
  });

  it("<meta property='og:url'> matches PROD_ORIGIN/", async () => {
    const html = await readIndexHtml();
    const match = html.match(/<meta property="og:url" content="([^"]+)"/);
    expect(match).not.toBeNull();
    expect(match![1]).toBe(`${PROD_ORIGIN}/`);
  });

  it("<meta property='og:image'> starts with PROD_ORIGIN (icon path appended)", async () => {
    const html = await readIndexHtml();
    const match = html.match(/<meta property="og:image" content="([^"]+)"/);
    expect(match).not.toBeNull();
    expect(match![1].startsWith(PROD_ORIGIN + "/")).toBe(true);
  });

  it("<meta name='twitter:image'> starts with PROD_ORIGIN (icon path appended)", async () => {
    const html = await readIndexHtml();
    const match = html.match(/<meta name="twitter:image" content="([^"]+)"/);
    expect(match).not.toBeNull();
    expect(match![1].startsWith(PROD_ORIGIN + "/")).toBe(true);
  });
});

describe("PROD_HOSTNAME derivation + downstream sync", () => {
  // PROD_HOSTNAME = PROD_ORIGIN with the protocol + trailing slash stripped.
  // Used by the share-card SVG footer, the TopBar menu footer, the contact
  // email domain, and the apex entry of ANALYTICS_HOSTS. Pin the derivation
  // so a future PROD_ORIGIN rebrand propagates atomically.

  it("PROD_HOSTNAME is PROD_ORIGIN minus the https:// protocol and trailing slash", () => {
    expect(PROD_HOSTNAME).toBe(PROD_ORIGIN.replace(/^https?:\/\//, "").replace(/\/$/, ""));
  });

  it("PROD_HOSTNAME is a bare hostname (no scheme, no slash)", () => {
    expect(PROD_HOSTNAME.startsWith("http")).toBe(false);
    expect(PROD_HOSTNAME.includes("/")).toBe(false);
  });
});

describe("APP_LOCALE sync (html lang + manifest lang + og:locale)", () => {
  // BCP47 locale appears at 3 static sites + Card.tsx toLocaleDateString.
  // A future i18n move (en-US? fr-CA?) should propagate from APP_LOCALE
  // to all 3 static files in one edit. OG_LOCALE is derived (underscore
  // variant) so the relationship doesn't drift either.

  it("OG_LOCALE is derived from APP_LOCALE by underscore-substituting the hyphen", () => {
    expect(OG_LOCALE).toBe(APP_LOCALE.replace("-", "_"));
  });

  it("<html lang='...'> matches APP_LOCALE", async () => {
    const html = await readIndexHtml();
    const match = html.match(/<html lang="([^"]+)"/);
    expect(match).not.toBeNull();
    expect(match![1]).toBe(APP_LOCALE);
  });

  it("manifest.lang matches APP_LOCALE", async () => {
    const manifest = await readManifest() as { lang: string };
    expect(manifest.lang).toBe(APP_LOCALE);
  });

  it("<meta property='og:locale'> matches OG_LOCALE (underscore form)", async () => {
    const html = await readIndexHtml();
    const match = html.match(/<meta property="og:locale" content="([^"]+)"/);
    expect(match).not.toBeNull();
    expect(match![1]).toBe(OG_LOCALE);
  });
});

describe("Icon paths sync (manifest ↔ index.html)", () => {
  // The manifest declares the canonical PWA icon set. index.html
  // references the same files for the apple-touch-icon, the favicon,
  // and og:image + twitter:image (absolute-URL variants). A rename of
  // /icons/icon-192.png to /icons/sd-192.png in the manifest must
  // propagate to index.html — without this test, one side would 404
  // while the other rendered correctly.

  async function manifestIconSrcs(): Promise<string[]> {
    const manifest = await readManifest() as { icons: Array<{ src: string }> };
    return manifest.icons.map((i) => i.src);
  }

  it("apple-touch-icon path is listed in manifest.icons", async () => {
    const html = await readIndexHtml();
    const match = html.match(/<link rel="apple-touch-icon" href="([^"]+)"/);
    expect(match).not.toBeNull();
    const srcs = await manifestIconSrcs();
    expect(srcs).toContain(match![1]);
  });

  it("<link rel='icon'> favicon path is listed in manifest.icons", async () => {
    const html = await readIndexHtml();
    const match = html.match(/<link rel="icon"[^>]*href="([^"]+)"/);
    expect(match).not.toBeNull();
    const srcs = await manifestIconSrcs();
    expect(srcs).toContain(match![1]);
  });

  it("og:image path (relative to PROD_ORIGIN) is listed in manifest.icons", async () => {
    const html = await readIndexHtml();
    const match = html.match(/<meta property="og:image" content="([^"]+)"/);
    expect(match).not.toBeNull();
    // Strip the absolute prefix to compare against manifest's path-only entries.
    const pathOnly = match![1].replace(PROD_ORIGIN, "");
    const srcs = await manifestIconSrcs();
    expect(srcs).toContain(pathOnly);
  });
});

describe("NOSCRIPT_HEADING + NOSCRIPT_MESSAGE sync (index.html no-JS fallback)", () => {
  it("index.html <noscript> contains NOSCRIPT_HEADING verbatim", async () => {
    const html = await readIndexHtml();
    expect(html).toContain(NOSCRIPT_HEADING);
  });

  it("index.html <noscript> contains NOSCRIPT_MESSAGE verbatim", async () => {
    // Drift defence: a rewording in the const must propagate to
    // index.html (or vice versa). Without this sync test, the const
    // and the static HTML could diverge silently and no-JS users
    // would read whichever version got updated last.
    const html = await readIndexHtml();
    expect(html).toContain(NOSCRIPT_MESSAGE);
  });

  it("NOSCRIPT_MESSAGE contains BRAND_NAME (brand opener)", () => {
    // Round-trip via BRAND_NAME — a future rebrand updates BRAND_NAME +
    // NOSCRIPT_MESSAGE together. This test catches a half-edit.
    expect(NOSCRIPT_MESSAGE).toContain(BRAND_NAME);
  });
});
