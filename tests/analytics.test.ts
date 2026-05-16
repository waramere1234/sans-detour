import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { track } from "../src/lib/analytics";

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
