// src/lib/session.ts
import type { SessionState, UserVote } from "../types";

const KEY = "sd_session_v1";
const COVER_KEY = "sd_seen_cover";

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
  const raw = localStorage.getItem(KEY);
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

export function recordVote(scrutinId: string, choice: UserVote): void {
  const s = loadSession() ?? newSession();
  // Guard against fast double-clicks / swipe+click races: if this scrutin
  // is already recorded, ignore the new event. Without this, `votes` would
  // accumulate duplicate entries and computeAlignment would count the
  // same scrutin multiple times, inflating the score.
  if (s.cards_seen.includes(scrutinId)) return;
  s.cards_seen.push(scrutinId);
  s.votes.push({ scrutin_id: scrutinId, choice, voted_at: Date.now() });
  saveSession(s);
}

export function resetSession(): void {
  localStorage.removeItem(KEY);
}

export function getOrCreateSession(): SessionState {
  const existing = loadSession();
  if (existing) return existing;
  const fresh = newSession();
  saveSession(fresh);
  return fresh;
}

export function hasSeenCover(): boolean {
  return localStorage.getItem(COVER_KEY) === "true";
}

export function markCoverSeen(): void {
  try {
    localStorage.setItem(COVER_KEY, "true");
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
