import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  requireSupabaseEnv,
  requireSupabaseClient,
  requireAnthropicEnv,
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
