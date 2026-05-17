import { describe, it, expect } from "vitest";
import {
  ROUTES, PLAY_AFFINEMENT,
  AFFINEMENT_PARAM, AFFINEMENT_VALUE, isAffinementMode,
  type RoutePath,
} from "../src/lib/routes";

// Session 104 extracted the 5 route paths from 41+ inline literals across
// src/ into ROUTES. These tests pin the contract: each value is a literal
// string type starting with "/", the union exhausts the 5 entries, and
// PLAY_AFFINEMENT is built from ROUTES.play (so a /play rename
// propagates correctly).

describe("ROUTES", () => {
  it("exposes the 5 documented route paths", () => {
    expect(ROUTES).toEqual({
      cover: "/",
      play: "/play",
      result: "/result",
      methode: "/methode",
      legal: "/legal",
    });
  });

  it("each value starts with a slash (relative URL path)", () => {
    for (const path of Object.values(ROUTES)) {
      expect(path.startsWith("/")).toBe(true);
    }
  });

  it("each value is a literal string type via `as const`", () => {
    // Compile-time assertion: assigning to a wider `string` works; the
    // narrowing matters at consumer sites that use `RoutePath`. The
    // runtime check below confirms the values are all strings.
    for (const path of Object.values(ROUTES)) {
      expect(typeof path).toBe("string");
    }
  });

  it("RoutePath union accepts each ROUTES value without a cast", () => {
    const _cover: RoutePath = ROUTES.cover;
    const _play: RoutePath = ROUTES.play;
    const _result: RoutePath = ROUTES.result;
    const _methode: RoutePath = ROUTES.methode;
    const _legal: RoutePath = ROUTES.legal;
    expect([_cover, _play, _result, _methode, _legal]).toHaveLength(5);
  });
});

describe("PLAY_AFFINEMENT + AFFINEMENT_PARAM/VALUE + isAffinementMode", () => {
  it("PLAY_AFFINEMENT is composed from ROUTES.play + AFFINEMENT_PARAM + AFFINEMENT_VALUE", () => {
    expect(PLAY_AFFINEMENT).toBe(`${ROUTES.play}?${AFFINEMENT_PARAM}=${AFFINEMENT_VALUE}`);
  });

  it("pins the current refinement-mode contract (?affinement=1)", () => {
    // Pin the actual query name + value so a switch from query param to
    // hash or sub-route is a deliberate edit here + the Play.tsx reader.
    expect(AFFINEMENT_PARAM).toBe("affinement");
    expect(AFFINEMENT_VALUE).toBe("1");
    expect(PLAY_AFFINEMENT).toBe("/play?affinement=1");
  });

  it("isAffinementMode is true when params carry the documented param=value", () => {
    const p = new URLSearchParams("affinement=1");
    expect(isAffinementMode(p)).toBe(true);
  });

  it("isAffinementMode is false when the param is absent", () => {
    expect(isAffinementMode(new URLSearchParams(""))).toBe(false);
  });

  it("isAffinementMode is false when the value is anything but AFFINEMENT_VALUE", () => {
    expect(isAffinementMode(new URLSearchParams("affinement=0"))).toBe(false);
    expect(isAffinementMode(new URLSearchParams("affinement=true"))).toBe(false);
    // Empty string value — equally not "1".
    expect(isAffinementMode(new URLSearchParams("affinement="))).toBe(false);
  });

  it("isAffinementMode reads AFFINEMENT_PARAM (rename-safe)", () => {
    // Build the URLSearchParams from the const itself, then assert. If the
    // param name is renamed, the helper still picks it up. (This test
    // documents the linkage rather than testing a fixed string.)
    const p = new URLSearchParams();
    p.set(AFFINEMENT_PARAM, AFFINEMENT_VALUE);
    expect(isAffinementMode(p)).toBe(true);
  });
});
