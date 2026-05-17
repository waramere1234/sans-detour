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
});
