import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { useFreshnessOnce } from "../src/hooks/useFreshnessOnce";

// Session 99 extracted useFreshnessOnce from Cover.tsx and Methode.tsx
// (both inlined the same state + ref + effect). The hook fires fetchFreshness
// once per mount and only flips its internal ref on a successful resolve so a
// transient failure doesn't kill the banner for the rest of the visit.

// fetchFreshness in dev mode (no Supabase env) returns synthesised data
// derived from dev-fixtures.json — that's the path these tests exercise.
// No need to mock the network.

function Harness({ onInfo }: { onInfo: (info: ReturnType<typeof useFreshnessOnce>) => void }) {
  const info = useFreshnessOnce();
  onInfo(info);
  return null;
}

describe("useFreshnessOnce", () => {
  let infoCalls: Array<ReturnType<typeof useFreshnessOnce>>;
  let captureInfo: (info: ReturnType<typeof useFreshnessOnce>) => void;

  beforeEach(() => {
    infoCalls = [];
    captureInfo = (info) => { infoCalls.push(info); };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null on the initial render", () => {
    render(<Harness onInfo={captureInfo} />);
    expect(infoCalls[0]).toBeNull();
  });

  it("resolves to a FreshnessInfo with the expected shape", async () => {
    render(<Harness onInfo={captureInfo} />);
    await waitFor(() => {
      const last = infoCalls[infoCalls.length - 1];
      expect(last).not.toBeNull();
    });
    const last = infoCalls[infoCalls.length - 1]!;
    expect(typeof last.total_scrutins).toBe("number");
    expect(typeof last.last_sync_at).toBe("string");
    expect(typeof last.next_sync_eta).toBe("string");
  });

  it("fires fetchFreshness only once per mount (StrictMode double-invoke guard)", async () => {
    // The dev path doesn't have a spy point on fetchFreshness directly, but
    // the hook's fetchedRef-on-success means a second render in the same
    // mount must not produce a different info object. We assert that once
    // info is set, subsequent renders return the same reference.
    const { rerender } = render(<Harness onInfo={captureInfo} />);
    await waitFor(() => expect(infoCalls[infoCalls.length - 1]).not.toBeNull());
    const first = infoCalls[infoCalls.length - 1];
    rerender(<Harness onInfo={captureInfo} />);
    rerender(<Harness onInfo={captureInfo} />);
    expect(infoCalls[infoCalls.length - 1]).toBe(first);
  });

  // The hook's `.catch(() => {})` swallows a fetchFreshness rejection — by
  // contract the banner simply doesn't render (graceful degradation). The
  // path mattered enough to comment but had no test, so removing the catch
  // (which would crash Cover on the first network blip) wouldn't have
  // flagged in CI. We mock the module to force a rejection.
  it("stays null when fetchFreshness rejects (silent failure)", async () => {
    const scrutinsMod = await import("../src/lib/scrutins");
    const fetchSpy = vi
      .spyOn(scrutinsMod, "fetchFreshness")
      .mockRejectedValueOnce(new Error("network blip"));
    // Re-import the hook module under test AFTER installing the spy, so
    // the new `fetchFreshness` binding is used. (The hook reads it from
    // the imported namespace each call — vi.spyOn on the module record
    // propagates via live binding.)
    const { useFreshnessOnce: hook } = await import("../src/hooks/useFreshnessOnce");
    function FailHarness() {
      const v = hook();
      captureInfo(v);
      return null;
    }
    render(<FailHarness />);
    // Initial render returns null synchronously.
    expect(infoCalls[0]).toBeNull();
    // Allow the rejected promise to flush; info must remain null.
    await new Promise((r) => setTimeout(r, 0));
    expect(infoCalls[infoCalls.length - 1]).toBeNull();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    fetchSpy.mockRestore();
  });
});
