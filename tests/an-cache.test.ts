import { describe, it, expect } from "vitest";
import path from "node:path";

// scripts/lib/an-cache.ts exports CACHE_DIR + JSON_DIR consts (single
// source of truth for the local AN cache path — read by ingest-an,
// resume-ingest, ingest-personnalites) and the iterEligibleScrutins
// async generator. The iterator depends on the real filesystem and
// resists vi.mock of node:fs cleanly (vitest's specifier matching
// doesn't intercept the script-side import in this test boundary), so
// it's covered by the integration runs of `npm run ingest:*` rather
// than here. These tests pin the path-const contract that the 3 ingest
// scripts depend on.

import { CACHE_DIR, JSON_DIR } from "../scripts/lib/an-cache";

describe("CACHE_DIR + JSON_DIR", () => {
  it("CACHE_DIR is the documented /tmp/sd-an-cache path", () => {
    // Pin the actual path here — if a future move (e.g. ~/.cache/sans-detour)
    // happens, edit this assertion deliberately at the same time as the
    // 3 script call sites stop reading from the old location.
    expect(CACHE_DIR).toBe("/tmp/sd-an-cache");
  });

  it("JSON_DIR is CACHE_DIR + '/json' (composed via path.join, rename-safe)", () => {
    // Round-trip: a bump to CACHE_DIR propagates automatically because
    // JSON_DIR is built from it via path.join — pin the linkage.
    expect(JSON_DIR).toBe(path.join(CACHE_DIR, "json"));
  });

  it("JSON_DIR is an absolute path (lib consumers don't need to resolve)", () => {
    expect(path.isAbsolute(JSON_DIR)).toBe(true);
  });

  it("JSON_DIR ends with the literal 'json' segment (not a generic data dir)", () => {
    // Defensive: a refactor that renamed the segment to e.g. 'data' would
    // break the 3 script call sites which all do `fs.readdir(JSON_DIR)`
    // expecting per-scrutin JSON files. Pin the segment name.
    expect(path.basename(JSON_DIR)).toBe("json");
  });
});
