// scripts/lib/an-cache.ts
//
// Shared local cache constants + scanning helper used by the three AN
// ingestion scripts (ingest-an, resume-ingest, ingest-personnalites).
// Before this lib, the `/tmp/sd-an-cache/json` path was hardcoded in 3
// places and the eligibility-scan loop was duplicated in 2.
import { promises as fs } from "node:fs";
import path from "node:path";
import { isEligibleScrutin } from "./an-filter";
import { parseRaw, type ANScrutinRaw, type ParsedScrutinCore } from "./an-parse";

/** Local cache root for the AN bulk download. Single source of truth so a
 *  future move (e.g. to `~/.cache/sans-detour`) is a one-line edit. */
export const CACHE_DIR = "/tmp/sd-an-cache";

/** Directory holding the per-scrutin JSON files after the bulk zip is
 *  extracted. ingest-an.ts populates it via the bulk download + unzip
 *  step; resume-ingest and ingest-personnalites read from it. */
export const JSON_DIR = path.join(CACHE_DIR, "json");

/** Async generator that yields every eligible scrutin from the local
 *  cache as a fully-parsed `ParsedScrutinCore`. Centralises the read-
 *  json + `raw.scrutin ?? raw` unwrap + isEligibleScrutin filter +
 *  parseRaw chain that ingest-an and resume-ingest used to inline.
 *
 *  Both consumers iterate this and collect differently (ingest-an
 *  pushes to an array + counts SPS vs other; resume-ingest builds a
 *  Map<id, parsed>) — yielding leaves the collection strategy to the
 *  caller without forcing one shape on the other. */
export async function* iterEligibleScrutins(): AsyncGenerator<{
  raw: ANScrutinRaw;
  parsed: ParsedScrutinCore;
}> {
  const files = (await fs.readdir(JSON_DIR)).filter((f) => f.endsWith(".json"));
  for (const f of files) {
    const json = JSON.parse(await fs.readFile(path.join(JSON_DIR, f), "utf-8"));
    // The bulk download wraps each scrutin under a `scrutin` key in some
    // files (older format) and at the top level in others. Probe both.
    const raw: ANScrutinRaw = json.scrutin ?? json;
    if (!isEligibleScrutin(raw)) continue;
    yield { raw, parsed: parseRaw(raw) };
  }
}
