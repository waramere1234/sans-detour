import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { composeShareText, performShare, SHARE_TOP_N } from "../src/lib/share";
import type { GroupAlignment, GroupCode } from "../src/types";
import { GROUP_CODES } from "../src/types";
import { getParty } from "../src/lib/parties";

// src/lib/share.ts is the pure text-composition pulled out of Result.tsx
// share() in session 115. Tests pin the format (numbered list, " · "
// separator, "X%" suffix), the SHARE_TOP_N truncation, and the
// partial-vs-complete lead string branching.

function mk(group: GroupCode, pct: number): GroupAlignment {
  return {
    group, pct, counted: 8,
    perfect: 4, partial: 1, conflict: 3, divided_excluded: 0,
  };
}

describe("composeShareText — happy path (complete session)", () => {
  it("includes a lead followed by ' : ' and the numbered summary", () => {
    const out = composeShareText({
      ranked: [mk("RN", 57), mk("EPR", 42), mk("LFI", 30)],
      isPartial: false,
      total: 20,
      target: 20,
    });
    expect(out).toContain("Mes affinités politiques réelles, basées sur les vrais votes de l'AN");
    expect(out).toContain(" : ");
    expect(out).toContain("1. RN 57%");
    expect(out).toContain("2. EPR 42%");
    expect(out).toContain("3. LFI 30%");
  });

  it("joins entries with ' · ' (em-space dot for tight share previews)", () => {
    const out = composeShareText({
      ranked: [mk("RN", 50), mk("LFI", 40)],
      isPartial: false,
      total: 20,
      target: 20,
    });
    expect(out).toContain("1. RN 50% · 2. LFI 40%");
  });

  it("uses the short party label (getParty(...).short) not the full name", () => {
    // Sanity: the share text uses the chip-style "LFI" not "La France
    // Insoumise" so the summary fits a tweet preview.
    const out = composeShareText({
      ranked: [mk("LFI", 67)],
      isPartial: false,
      total: 20,
      target: 20,
    });
    expect(out).toContain("LFI");
    expect(out).not.toContain(getParty("LFI").name);
  });
});

describe("composeShareText — partial lead branch", () => {
  it("uses the 'résultat partiel N/TARGET' lead when isPartial=true", () => {
    const out = composeShareText({
      ranked: [mk("RN", 60)],
      isPartial: true,
      total: 7,
      target: 20,
    });
    expect(out).toContain("résultat partiel 7/20");
    expect(out).not.toContain("Mes affinités politiques réelles,"); // complete-branch lead
  });

  it("does NOT mention 'partiel' when isPartial=false", () => {
    const out = composeShareText({
      ranked: [mk("RN", 60)],
      isPartial: false,
      total: 20,
      target: 20,
    });
    expect(out).not.toMatch(/partiel/i);
  });
});

describe("composeShareText — SHARE_TOP_N truncation", () => {
  it(`truncates to SHARE_TOP_N (=${SHARE_TOP_N}) entries even if the ranked list is longer`, () => {
    // Build a synthetic 11-group ranking — composeShareText must drop entries
    // beyond SHARE_TOP_N so the share text fits a tweet preview.
    const ranked: GroupAlignment[] = GROUP_CODES.map((c, i) => mk(c, 100 - i * 5));
    const out = composeShareText({ ranked, isPartial: false, total: 20, target: 20 });
    expect(out).toContain(`${SHARE_TOP_N}. `);
    // The next index after SHARE_TOP_N must NOT appear in the output.
    expect(out).not.toContain(`${SHARE_TOP_N + 1}. `);
  });

  it("handles a ranked list shorter than SHARE_TOP_N without padding", () => {
    const out = composeShareText({
      ranked: [mk("RN", 50), mk("LFI", 40)],
      isPartial: false,
      total: 20,
      target: 20,
    });
    expect(out).toContain("1. RN 50%");
    expect(out).toContain("2. LFI 40%");
    expect(out).not.toContain("3. ");
  });
});

describe("performShare — 3-tier fallback chain", () => {
  // performShare runs the navigator.share → clipboard → prompt waterfall
  // with one critical invariant: an AbortError from navigator.share (user
  // dismissed the share sheet) MUST NOT silently fall through to clipboard.
  // The previous inline implementation in Result.tsx had this nuance buried
  // in a one-liner; extracting + testing pins the consent guarantee.

  let originalShare: ((data: ShareData) => Promise<void>) | undefined;
  let originalClipboard: Clipboard | undefined;
  let originalPrompt: typeof window.prompt;

  beforeEach(() => {
    originalShare = (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share;
    originalClipboard = (navigator as Navigator & { clipboard?: Clipboard }).clipboard;
    originalPrompt = window.prompt;
  });

  afterEach(() => {
    // Restore via defineProperty since navigator.share + clipboard are
    // read-only on the Navigator prototype in jsdom.
    Object.defineProperty(navigator, "share", { configurable: true, value: originalShare });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: originalClipboard });
    window.prompt = originalPrompt;
  });

  function setShare(fn: ((data: ShareData) => Promise<void>) | undefined) {
    Object.defineProperty(navigator, "share", { configurable: true, value: fn });
  }
  function setClipboard(writeText: ((text: string) => Promise<void>) | undefined) {
    const clipboard = writeText ? { writeText } : undefined;
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: clipboard });
  }

  it("returns 'shared' when navigator.share resolves", async () => {
    const shareSpy = vi.fn().mockResolvedValue(undefined);
    setShare(shareSpy);
    const result = await performShare("text", "https://example.test");
    expect(result).toBe("shared");
    expect(shareSpy).toHaveBeenCalledWith({ text: "text", url: "https://example.test" });
  });

  it("returns 'aborted' when navigator.share rejects with AbortError (user-cancel CONSENT invariant)", async () => {
    // Regression guard: a previous refactor that drops the AbortError
    // early-return would silently copy the result to clipboard. Pin
    // here that an aborted share NEVER reaches clipboard.
    const abortErr = Object.assign(new Error("user dismissed"), { name: "AbortError" });
    const shareSpy = vi.fn().mockRejectedValue(abortErr);
    const clipboardSpy = vi.fn().mockResolvedValue(undefined);
    setShare(shareSpy);
    setClipboard(clipboardSpy);
    const result = await performShare("text", "https://example.test");
    expect(result).toBe("aborted");
    expect(clipboardSpy).not.toHaveBeenCalled(); // critical consent invariant
  });

  it("falls through to clipboard when navigator.share rejects with non-AbortError", async () => {
    const otherErr = Object.assign(new Error("not allowed"), { name: "NotAllowedError" });
    const shareSpy = vi.fn().mockRejectedValue(otherErr);
    const clipboardSpy = vi.fn().mockResolvedValue(undefined);
    setShare(shareSpy);
    setClipboard(clipboardSpy);
    const result = await performShare("text", "https://example.test");
    expect(result).toBe("copied");
    expect(clipboardSpy).toHaveBeenCalledWith("text\nhttps://example.test");
  });

  it("falls through to clipboard when navigator.share is unavailable (Safari < 13)", async () => {
    setShare(undefined);
    const clipboardSpy = vi.fn().mockResolvedValue(undefined);
    setClipboard(clipboardSpy);
    const result = await performShare("text", "https://example.test");
    expect(result).toBe("copied");
    expect(clipboardSpy).toHaveBeenCalledTimes(1);
  });

  it("falls through to window.prompt when clipboard fails (last resort)", async () => {
    setShare(undefined);
    setClipboard(vi.fn().mockRejectedValue(new Error("clipboard blocked")));
    const promptSpy = vi.fn().mockReturnValue(null);
    window.prompt = promptSpy;
    const result = await performShare("text", "https://example.test");
    expect(result).toBe("prompted");
    expect(promptSpy).toHaveBeenCalledWith("Copie ton résultat :", "text\nhttps://example.test");
  });

  it("clipboard payload joins text + url with a newline (single canonical format)", async () => {
    setShare(undefined);
    const clipboardSpy = vi.fn().mockResolvedValue(undefined);
    setClipboard(clipboardSpy);
    await performShare("the share line", "https://sansdetour.fr");
    expect(clipboardSpy).toHaveBeenCalledWith("the share line\nhttps://sansdetour.fr");
  });
});
