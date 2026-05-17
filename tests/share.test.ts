import { describe, it, expect } from "vitest";
import { composeShareText, SHARE_TOP_N } from "../src/lib/share";
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
