import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { track, type AnalyticsEvent } from "../src/lib/analytics";

// Session 56 added a hostname allow-list on track() so dev/preview sessions
// don't pollute the prod Plausible dashboard. Without these tests, removing
// the gate would re-introduce the pollution silently — CI would stay green.

describe("analytics track() hostname gate", () => {
  let plausibleMock: ReturnType<typeof vi.fn>;
  const originalLocation = window.location;

  beforeEach(() => {
    plausibleMock = vi.fn();
    (window as unknown as { plausible: typeof plausibleMock }).plausible = plausibleMock;
  });

  afterEach(() => {
    delete (window as unknown as { plausible?: unknown }).plausible;
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });

  function setHostname(host: string) {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, hostname: host },
    });
  }

  it("calls plausible when hostname is the prod domain", () => {
    setHostname("sansdetour.fr");
    track("vote", { choice: "pour" });
    expect(plausibleMock).toHaveBeenCalledWith("vote", { props: { choice: "pour" } });
  });

  it("calls plausible when hostname is www.sansdetour.fr", () => {
    setHostname("www.sansdetour.fr");
    track("vote");
    expect(plausibleMock).toHaveBeenCalledWith("vote", undefined);
  });

  it("no-ops on localhost (dev)", () => {
    setHostname("localhost");
    track("vote", { choice: "pour" });
    expect(plausibleMock).not.toHaveBeenCalled();
  });

  it("no-ops on Vercel preview deploys", () => {
    setHostname("sans-detour-pr-42-team.vercel.app");
    track("share_clicked");
    expect(plausibleMock).not.toHaveBeenCalled();
  });

  it("no-ops on a custom fork hostname", () => {
    setHostname("fork.example.com");
    track("vote");
    expect(plausibleMock).not.toHaveBeenCalled();
  });

  it("passes props in the { props } envelope Plausible expects", () => {
    setHostname("sansdetour.fr");
    track("vote", { choice: "contre", counted: 5 });
    expect(plausibleMock).toHaveBeenCalledWith("vote", {
      props: { choice: "contre", counted: 5 },
    });
  });

  it("omits the second argument when no props are passed", () => {
    setHostname("sansdetour.fr");
    track("result_reached");
    expect(plausibleMock).toHaveBeenCalledWith("result_reached", undefined);
  });
});

describe("AnalyticsEvent type (session 99 — typo defense)", () => {
  // These are compile-time assertions: if the AnalyticsEvent union ever
  // regresses to `string`, the @ts-expect-error annotations would fail
  // the build (the line they prefix would compile cleanly). With the
  // union in place, the annotated lines are real type errors that the
  // directive silently swallows — which is the desired protection.

  it("accepts every documented event without a cast", () => {
    const events: AnalyticsEvent[] = [
      "cover_started",
      "cover_resumed",
      "cover_restarted",
      "cover_partial_result",
      "cover_result_revisit",
      "cover_footer_nav",
      "topbar_nav",
      "result_reached",
      "result_refaire",
      "share_clicked",
      "personnalites_revealed",
      "affinement_clicked",
      "methode_toc_click",
      "vote",
      "error",
    ];
    // Sanity: each event is non-empty + lowercase-snake.
    for (const e of events) {
      expect(e).toMatch(/^[a-z_]+$/);
    }
  });

  it("rejects a typo at compile time (would-be 'vote_clicked')", () => {
    // @ts-expect-error — 'vote_clicked' is not in the AnalyticsEvent union.
    // The presence of this directive proves the union is enforced; if the
    // signature widened back to `string` the error would disappear and
    // vitest's TS check would flag the now-unused @ts-expect-error.
    const _bad: AnalyticsEvent = "vote_clicked";
    expect(_bad).toBe("vote_clicked");
  });
});
