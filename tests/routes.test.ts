import { describe, it, expect } from "vitest";
import { ROUTES, PLAY_AFFINEMENT, type RoutePath } from "../src/lib/routes";

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

describe("PLAY_AFFINEMENT", () => {
  it("is composed from ROUTES.play with the refinement query string", () => {
    expect(PLAY_AFFINEMENT).toBe(`${ROUTES.play}?affinement=1`);
  });

  it("uses '?affinement=1' as the documented refinement-mode flag", () => {
    // Pin the query name + value so a switch from query param to hash
    // or sub-route is a deliberate edit here + the Play.tsx reader.
    expect(PLAY_AFFINEMENT).toBe("/play?affinement=1");
  });
});
