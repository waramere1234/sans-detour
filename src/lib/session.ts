// src/lib/session.ts
import type { SessionState, UserVote } from "../types";

const KEY = "sd_session_v1";

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
  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

export function saveSession(s: SessionState): void {
  localStorage.setItem(KEY, JSON.stringify(s));
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
  return localStorage.getItem("sd_seen_cover") === "true";
}

export function markCoverSeen(): void {
  localStorage.setItem("sd_seen_cover", "true");
}
