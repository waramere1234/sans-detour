import { describe, it, expect } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  TAGLINE, BRAND_NAME, LEGISLATURE_LABEL_LOWERCASE,
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
