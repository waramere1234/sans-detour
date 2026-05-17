import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  track,
  ANALYTICS_HOSTS,
  ANALYTICS_EVENTS,
  type AnalyticsEvent,
} from "../src/lib/analytics";

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

  it("calls plausible on every allowed hostname (iterates ANALYTICS_HOSTS — no parallel literal)", () => {
    for (const host of ANALYTICS_HOSTS) {
      plausibleMock.mockClear();
      setHostname(host);
      track("vote", { choice: "pour" });
      expect(plausibleMock).toHaveBeenCalledWith("vote", { props: { choice: "pour" } });
    }
  });

  it("ANALYTICS_HOSTS includes the prod apex + www subdomain", () => {
    // Pin the actual hostnames here — if a rebrand changes the set, both
    // this test AND the gate update via the same edit.
    expect(ANALYTICS_HOSTS.has("sansdetour.fr")).toBe(true);
    expect(ANALYTICS_HOSTS.has("www.sansdetour.fr")).toBe(true);
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
    setHostname([...ANALYTICS_HOSTS][0]);
    track("vote", { choice: "contre", counted: 5 });
    expect(plausibleMock).toHaveBeenCalledWith("vote", {
      props: { choice: "contre", counted: 5 },
    });
  });

  it("omits the second argument when no props are passed", () => {
    setHostname([...ANALYTICS_HOSTS][0]);
    track("result_reached");
    expect(plausibleMock).toHaveBeenCalledWith("result_reached", undefined);
  });
});

describe("Plausible data-domain (index.html) sync with ANALYTICS_HOSTS", () => {
  // The <script defer data-domain="..." src="https://plausible.io/...">
  // tag in index.html declares the dashboard target. ANALYTICS_HOSTS is
  // the runtime allow-list. Both must point at the same prod apex — a
  // rebrand changing one and not the other splits analytics between
  // a dead dashboard and a stale gate. Pin the linkage here.

  it("data-domain in index.html is a member of ANALYTICS_HOSTS", async () => {
    const html = await fs.readFile(
      path.join(process.cwd(), "index.html"),
      "utf-8",
    );
    const match = html.match(/data-domain="([^"]+)"/);
    expect(match).not.toBeNull();
    const plausibleDomain = match![1];
    // The data-domain typically points at the apex (no www). It MUST
    // appear in ANALYTICS_HOSTS so track() emits events that the
    // dashboard actually receives.
    expect(ANALYTICS_HOSTS.has(plausibleDomain)).toBe(true);
  });
});

describe("AnalyticsEvent type (session 99 — typo defense)", () => {
  // These are compile-time assertions: if the AnalyticsEvent union ever
  // regresses to `string`, the @ts-expect-error annotations would fail
  // the build (the line they prefix would compile cleanly). With the
  // union in place, the annotated lines are real type errors that the
  // directive silently swallows — which is the desired protection.

  it("every documented event is non-empty lowercase-snake (iterates ANALYTICS_EVENTS — no parallel literal)", () => {
    // ANALYTICS_EVENTS is the single source of truth; the test auto-extends
    // the moment a new event is added to the const array. Previous version
    // hardcoded a parallel 15-element list — adding an event to the union
    // without updating the array left the new event silently uncovered.
    expect(ANALYTICS_EVENTS.length).toBeGreaterThan(0);
    for (const e of ANALYTICS_EVENTS) {
      expect(e).toMatch(/^[a-z_]+$/);
    }
  });

  it("AnalyticsEvent type is the union of ANALYTICS_EVENTS members (compile-time)", () => {
    // Pin the type derivation: a refactor that decouples the type from the
    // const list would surface here as a TS error.
    const sampled: AnalyticsEvent = ANALYTICS_EVENTS[0];
    expect(typeof sampled).toBe("string");
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
