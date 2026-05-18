// src/lib/session.ts
import { COVER_STORAGE_TRUE_VALUE, type SessionState, type UserVote } from "../types";

// Exported so tests can prime / inspect storage without re-hardcoding the
// strings (previously duplicated 5× in tests/session.test.ts and 3× in
// tests/Cover.test.tsx — a `sd_session_v1 → sd_session_v2` migration would
// have left those tests writing to a stale key while production read from
// the new one, silently passing).
export const SESSION_STORAGE_KEY = "sd_session_v1";
export const COVER_STORAGE_KEY = "sd_seen_cover";

const KEY = SESSION_STORAGE_KEY;
const COVER_KEY = COVER_STORAGE_KEY;

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function newSession(): SessionState {
  return {
    session_id: makeId(),
    cards_seen: [],
    votes: [],
    started_at: Date.now(),
  };
}

export function loadSession(): SessionState | null {
  // localStorage access can THROW (not just write — read too) in sandboxed
  // iframes, certain Safari privacy modes, and when the browser blocks
  // storage for the origin. Without this guard, App + Cover would crash
  // on first render in those contexts. saveSession already had a similar
  // guard; pair them so read/write are symmetric.
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  // Shape-validate before casting. JSON.parse succeeds on any valid JSON
  // ("null", "[]", "{}", a half-rewritten payload from a older schema, or
  // a user who manually edited localStorage), but callers assume
  // `cards_seen` and `votes` are arrays — `session.votes.length` would
  // throw on a junk payload. Bad shape ≡ corrupt: treat as no session.
  if (
    !parsed || typeof parsed !== "object" ||
    !Array.isArray((parsed as SessionState).cards_seen) ||
    !Array.isArray((parsed as SessionState).votes)
  ) {
    return null;
  }
  return parsed as SessionState;
}

export function saveSession(s: SessionState): void {
  // localStorage.setItem can throw in two real scenarios:
  // - Safari private mode (pre-iOS 17): quota is 0 and any write rejects.
  // - Quota exceeded after many sessions on a low-storage device.
  // Without a guard, the throw bubbles into recordVote / markCoverSeen
  // and the page handler dies silently — the "Commencer" button stops
  // working and votes stop being recorded with no UI feedback.
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Best effort: the session stays in memory for the current run but
    // won't survive a reload. We swallow rather than crash the UI.
  }
}

/** Returns true if the vote was newly recorded, false if the scrutin was
 *  already in cards_seen (fast double-click / swipe+click race). Callers
 *  use the return value to gate side effects like analytics that should
 *  fire once per actual vote, not once per click event. */
export function recordVote(scrutinId: string, choice: UserVote): boolean {
  const s = loadSession() ?? newSession();
  // Guard against fast double-clicks / swipe+click races: if this scrutin
  // is already recorded, ignore the new event. Without this, `votes` would
  // accumulate duplicate entries and computeAlignment would count the
  // same scrutin multiple times, inflating the score.
  if (s.cards_seen.includes(scrutinId)) return false;
  s.cards_seen.push(scrutinId);
  s.votes.push({ scrutin_id: scrutinId, choice, voted_at: Date.now() });
  saveSession(s);
  return true;
}

export function resetSession(): void {
  // Symmetric with saveSession / forgetCover / markCoverSeen / loadSession
  // (all have try/catch on localStorage access). Without this guard, a
  // sandboxed-storage context would crash on the user clicking
  // "Recommencer à zéro" (Cover restart) or "Refaire depuis le début"
  // (Result refaire) — the throw bubbles into the click handler and the
  // navigate() that follows never runs.
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Best effort: the localStorage entry stays around (we can't clear
    // it), but the in-memory state is what callers act on next anyway.
  }
}

export function getOrCreateSession(): SessionState {
  const existing = loadSession();
  if (existing) return existing;
  const fresh = newSession();
  saveSession(fresh);
  return fresh;
}

export function hasSeenCover(): boolean {
  // Same throw-on-read defense as loadSession — return false (= treat as
  // not seen) when storage is unavailable so the Cover keeps rendering.
  try {
    return localStorage.getItem(COVER_KEY) === COVER_STORAGE_TRUE_VALUE;
  } catch {
    return false;
  }
}

export function markCoverSeen(): void {
  try {
    localStorage.setItem(COVER_KEY, COVER_STORAGE_TRUE_VALUE);
  } catch {
    // Same Safari-private-mode / quota guard as saveSession — keep the
    // user moving rather than throwing out of `start()`.
  }
}

export function forgetCover(): void {
  // Symmetric counterpart to markCoverSeen — re-show the Cover next time
  // the user lands on "/". Localises the storage key so callers don't
  // hardcode the string and drift when it's renamed.
  try {
    localStorage.removeItem(COVER_KEY);
  } catch {
    // removeItem rarely throws but stay symmetric with the setItem guards.
  }
}
