import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  loadSession, saveSession, recordVote, resetSession, newSession,
  hasSeenCover, markCoverSeen, forgetCover,
} from "../src/lib/session";

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

  it("recordVote returns true on fresh insert, false on duplicate", () => {
    // Session 88: handleVote in Play.tsx gates track() and aria-live on
    // the return value so a double-click doesn't double-count analytics
    // or re-announce "voté pour" twice.
    saveSession(newSession());
    expect(recordVote("s1", "pour")).toBe(true);
    expect(recordVote("s1", "contre")).toBe(false); // duplicate
    expect(recordVote("s2", "skip")).toBe(true);    // fresh again
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

  // Shape-validation guard (added session 46) — JSON.parse succeeds on any
  // valid JSON, but callers assume cards_seen and votes are arrays. A
  // corrupted localStorage payload must downgrade to "no session" instead
  // of crashing the UI on `session.votes.length`.
  it("loadSession returns null on malformed JSON (parse failure)", () => {
    localStorage.setItem("sd_session_v1", "{not-json");
    expect(loadSession()).toBeNull();
  });
  it("loadSession returns null on valid JSON with the wrong shape ({})", () => {
    localStorage.setItem("sd_session_v1", "{}");
    expect(loadSession()).toBeNull();
  });
  it("loadSession returns null on 'null' payload", () => {
    localStorage.setItem("sd_session_v1", "null");
    expect(loadSession()).toBeNull();
  });
  it("loadSession returns null when votes is not an array", () => {
    localStorage.setItem(
      "sd_session_v1",
      JSON.stringify({ session_id: "x", cards_seen: [], votes: "boom", started_at: 0 }),
    );
    expect(loadSession()).toBeNull();
  });
  it("loadSession returns null when cards_seen is missing", () => {
    localStorage.setItem(
      "sd_session_v1",
      JSON.stringify({ session_id: "x", votes: [], started_at: 0 }),
    );
    expect(loadSession()).toBeNull();
  });

  // Defenses added session 69 (loadSession + hasSeenCover) and session 70
  // (resetSession). localStorage access can throw in sandboxed iframes,
  // Safari blocked-storage privacy mode, and certain extension contexts.
  // Without these guards, App + Cover crash on first render or on the
  // "Recommencer" button click.
  describe("localStorage throw defenses", () => {
    let getItem: ReturnType<typeof vi.spyOn>;
    let setItem: ReturnType<typeof vi.spyOn>;
    let removeItem: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("blocked");
      });
      setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("blocked");
      });
      removeItem = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
        throw new Error("blocked");
      });
    });

    afterEach(() => {
      getItem.mockRestore();
      setItem.mockRestore();
      removeItem.mockRestore();
    });

    it("loadSession returns null when localStorage.getItem throws", () => {
      expect(loadSession()).toBeNull();
    });

    it("hasSeenCover returns false when localStorage.getItem throws", () => {
      expect(hasSeenCover()).toBe(false);
    });

    it("resetSession swallows localStorage.removeItem throws", () => {
      expect(() => resetSession()).not.toThrow();
    });

    // Symmetric setItem / removeItem guards: saveSession + markCoverSeen
    // use setItem (Safari private mode quota=0, low-storage devices), and
    // forgetCover uses removeItem. Without these tests, dropping the
    // try/catch in any of them would slip past CI silently — same risk
    // class as the loadSession defense above.
    it("saveSession swallows localStorage.setItem throws", () => {
      expect(() => saveSession(newSession())).not.toThrow();
    });

    it("markCoverSeen swallows localStorage.setItem throws", () => {
      expect(() => markCoverSeen()).not.toThrow();
    });

    it("forgetCover swallows localStorage.removeItem throws", () => {
      expect(() => forgetCover()).not.toThrow();
    });
  });
});
