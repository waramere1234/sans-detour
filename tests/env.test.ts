import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  requireSupabaseEnv,
  requireSupabaseClient,
  requireAnthropicEnv,
  ANTHROPIC_BATCHES_URL,
  ANTHROPIC_API_VERSION,
  ANTHROPIC_MODEL,
  anthropicBatchUrl,
  anthropicBatchResultsUrl,
  anthropicHeaders,
} from "../scripts/lib/env";

// Session 102 extracted these helpers from 4 ingest scripts. The
// success-path tests pin the validated-env shape; the failure path tests
// pin that the helpers exit the process with a clear console.error
// rather than letting downstream code crash with a less-obvious message.

describe("requireSupabaseEnv", () => {
  let originalUrl: string | undefined;
  let originalKey: string | undefined;

  beforeEach(() => {
    originalUrl = process.env.SUPABASE_URL;
    originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  afterEach(() => {
    if (originalUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  });

  it("returns { url, key } when both env vars are set", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    expect(requireSupabaseEnv()).toEqual({
      url: "https://example.supabase.co",
      key: "service-role-key",
    });
  });

  it("returned values are typed as string (no `!` needed at call site)", () => {
    process.env.SUPABASE_URL = "https://x.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "k";
    const { url, key } = requireSupabaseEnv();
    // Compile-time assertion: assigning to `string` would fail if the
    // helper returned `string | undefined`.
    const u: string = url;
    const k: string = key;
    expect(u).toBe("https://x.supabase.co");
    expect(k).toBe("k");
  });

  it("exits the process with code 1 + logs to stderr when URL is missing", () => {
    delete process.env.SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "k";
    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("exit");
    }) as never);
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => requireSupabaseEnv()).toThrow("exit");
    expect(exit).toHaveBeenCalledWith(1);
    expect(err).toHaveBeenCalledWith(expect.stringContaining("Missing SUPABASE_URL"));
    exit.mockRestore();
    err.mockRestore();
  });

  it("exits when KEY is missing (even with URL set)", () => {
    process.env.SUPABASE_URL = "https://x.supabase.co";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("exit");
    }) as never);
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => requireSupabaseEnv()).toThrow("exit");
    exit.mockRestore();
    err.mockRestore();
  });
});

describe("requireSupabaseClient", () => {
  let originalUrl: string | undefined;
  let originalKey: string | undefined;

  beforeEach(() => {
    originalUrl = process.env.SUPABASE_URL;
    originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  afterEach(() => {
    if (originalUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  });

  it("returns a Supabase client (has the .from() chainable)", () => {
    process.env.SUPABASE_URL = "https://x.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    const sb = requireSupabaseClient();
    // Smoke-test the client's surface — we don't hit the network here,
    // just verify createClient wired the URL/key into a usable shape.
    expect(typeof sb.from).toBe("function");
  });
});

describe("requireAnthropicEnv", () => {
  let original: string | undefined;

  beforeEach(() => {
    original = process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => {
    if (original === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = original;
  });

  it("returns the key as a narrowed string", () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    const key: string = requireAnthropicEnv();
    expect(key).toBe("sk-ant-test");
  });

  it("exits with a clear error when the key is missing", () => {
    delete process.env.ANTHROPIC_API_KEY;
    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("exit");
    }) as never);
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => requireAnthropicEnv()).toThrow("exit");
    expect(err).toHaveBeenCalledWith(expect.stringContaining("Missing ANTHROPIC_API_KEY"));
    exit.mockRestore();
    err.mockRestore();
  });
});

describe("ANTHROPIC_BATCHES_URL + anthropicBatchUrl / anthropicBatchResultsUrl", () => {
  // Previously 6 inline copies of `https://api.anthropic.com/v1/messages/
  // batches` across 3 scripts (ingest-an, resume-ingest, debug-batch),
  // each rebuilding `${BASE}/${batchId}` / `${BASE}/${batchId}/results`.
  // Session 120 centralised the base URL + builders here.

  it("base URL points at the v1 Batches endpoint", () => {
    expect(ANTHROPIC_BATCHES_URL).toBe("https://api.anthropic.com/v1/messages/batches");
  });

  it("anthropicBatchUrl(id) → BASE/id", () => {
    expect(anthropicBatchUrl("msgbatch_xyz")).toBe(`${ANTHROPIC_BATCHES_URL}/msgbatch_xyz`);
  });

  it("anthropicBatchResultsUrl(id) → BASE/id/results", () => {
    expect(anthropicBatchResultsUrl("msgbatch_xyz")).toBe(
      `${ANTHROPIC_BATCHES_URL}/msgbatch_xyz/results`,
    );
  });

  it("builders compose deterministically from the base URL (rename-safe)", () => {
    // If the base URL bumps to v2, both builders re-compose without
    // per-script edits — pin the linkage here so a refactor that
    // hand-rolls one builder doesn't drift away from the const.
    const fakeBase = ANTHROPIC_BATCHES_URL;
    expect(anthropicBatchUrl("ID").startsWith(fakeBase + "/")).toBe(true);
    expect(anthropicBatchResultsUrl("ID").endsWith("/results")).toBe(true);
  });
});

describe("ANTHROPIC_API_VERSION + anthropicHeaders", () => {
  // Previously 4 inline `"anthropic-version": "2023-06-01"` headers across
  // 3 scripts (ingest-an, debug-batch × 2, resume-ingest). A version bump
  // (e.g. 2024-...) would mean 4 edits with drift risk. Centralised here.

  it("pins the API version date documented in Anthropic's versioning guide", () => {
    expect(ANTHROPIC_API_VERSION).toBe("2023-06-01");
  });

  it("anthropicHeaders threads the api key + version + content-type", () => {
    const h = anthropicHeaders("sk-ant-test");
    expect(h["x-api-key"]).toBe("sk-ant-test");
    expect(h["anthropic-version"]).toBe(ANTHROPIC_API_VERSION);
    expect(h["content-type"]).toBe("application/json");
  });

  it("anthropicHeaders accepts any string (the optional-key context too)", () => {
    // ingest-an's fallback path passes `ANTHROPIC_KEY!` after a runtime
    // guard, not a narrowed string from requireAnthropicEnv. Pin that
    // anthropicHeaders doesn't add an extra constraint beyond `string`.
    const h = anthropicHeaders("");
    expect(h["x-api-key"]).toBe("");
  });

  it("returns a fresh object each call (no shared-reference contamination)", () => {
    const a = anthropicHeaders("k1");
    const b = anthropicHeaders("k2");
    expect(a).not.toBe(b);
    expect(a["x-api-key"]).toBe("k1");
    expect(b["x-api-key"]).toBe("k2");
  });

  it("ANTHROPIC_MODEL is the canonical Haiku 4.5 id (pin-the-value)", () => {
    // CLAUDE.md V2 P1 documents the ingestion as Haiku 4.5 + Batches.
    // A model upgrade should be a deliberate edit here + the buildRequest
    // call site in ingest-an.ts; pin the value so a typo doesn't drift.
    expect(ANTHROPIC_MODEL).toBe("claude-haiku-4-5");
  });
});
