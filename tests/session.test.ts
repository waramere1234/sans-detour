import { describe, it, expect, beforeEach } from "vitest";
import { loadSession, saveSession, recordVote, resetSession, newSession } from "../src/lib/session";

describe("session (localStorage state)", () => {
  beforeEach(() => { localStorage.clear(); });

  it("loadSession returns null when nothing stored", () => {
    expect(loadSession()).toBeNull();
  });

  it("saveSession + loadSession roundtrip", () => {
    const s = newSession();
    saveSession(s);
    const loaded = loadSession();
    expect(loaded).not.toBeNull();
    expect(loaded!.session_id).toBe(s.session_id);
  });

  it("recordVote appends to votes and adds to cards_seen", () => {
    const s = newSession();
    saveSession(s);
    recordVote("s1", "pour");
    const loaded = loadSession()!;
    expect(loaded.votes).toHaveLength(1);
    expect(loaded.votes[0].scrutin_id).toBe("s1");
    expect(loaded.votes[0].choice).toBe("pour");
    expect(loaded.cards_seen).toEqual(["s1"]);
  });

  it("recordVote ignores a duplicate vote on the same scrutin", () => {
    saveSession(newSession());
    recordVote("s1", "pour");
    recordVote("s1", "contre"); // fast double-click / swipe+click race
    const loaded = loadSession()!;
    expect(loaded.votes).toHaveLength(1);
    expect(loaded.votes[0].choice).toBe("pour"); // first vote wins
    expect(loaded.cards_seen).toEqual(["s1"]);
  });

  it("resetSession clears storage", () => {
    saveSession(newSession());
    resetSession();
    expect(loadSession()).toBeNull();
  });

  it("newSession produces unique ids", () => {
    const a = newSession();
    const b = newSession();
    expect(a.session_id).not.toBe(b.session_id);
  });
});
