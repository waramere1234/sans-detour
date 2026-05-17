import { describe, it, expect } from "vitest";
import { GROUP_MAPPING } from "../scripts/lib/an-groups";
import { GROUP_CODES, type GroupCode } from "../src/types";

// scripts/lib/an-groups.ts owns the AN organeRef → internal GroupCode map.
// Before this lib, the table was duplicated in ingest-an.ts and
// resume-ingest.ts, and drift between the two would silently route votes
// to the wrong party in the recovery flow. The lib closed the duplication
// but only 3 of the 13 entries were tested indirectly via parseRaw — an
// accidental edit like `PO845470: "HOR"` → `"DR"` would slip past the
// suite. These tests pin every entry explicitly so a swap surfaces here.

describe("GROUP_MAPPING — pinned organeRef → GroupCode entries", () => {
  // The 11 active parliamentary groups of the 17e legislature.
  const expected: Record<string, GroupCode | null> = {
    PO845401: "RN",
    PO845407: "EPR",
    PO845413: "LFI",
    PO845419: "SOC",
    PO845425: "DR",
    PO845439: "ECO",
    PO845454: "DEM",
    PO845470: "HOR",
    PO845485: "LIOT",
    PO845514: "GDR",
    // UDR was reconstituted ~2025-09 with a new organeRef PO872880 but
    // kept its political identity. Both refs collapse to UDR.
    PO847173: "UDR",
    PO872880: "UDR",
    // Non-inscrits pool — explicitly mapped to null so parseRaw can
    // short-circuit instead of treating it as a missing-key lookup.
    PO840056: null,
  };

  for (const [ref, expectedCode] of Object.entries(expected)) {
    it(`${ref} → ${expectedCode === null ? "null (non-inscrits)" : expectedCode}`, () => {
      expect(GROUP_MAPPING[ref]).toBe(expectedCode);
    });
  }

  it("contains exactly the expected number of entries (no surprise additions / drops)", () => {
    expect(Object.keys(GROUP_MAPPING)).toHaveLength(Object.keys(expected).length);
  });

  it("every non-null target is a valid GroupCode (no orphan strings)", () => {
    for (const [, code] of Object.entries(GROUP_MAPPING)) {
      if (code === null) continue;
      expect((GROUP_CODES as readonly string[]).includes(code)).toBe(true);
    }
  });

  it("UDR is the only GroupCode reached by more than one organeRef (PO847173 + PO872880)", () => {
    const codeCounts = new Map<GroupCode, number>();
    for (const [, code] of Object.entries(GROUP_MAPPING)) {
      if (code === null) continue;
      codeCounts.set(code, (codeCounts.get(code) ?? 0) + 1);
    }
    for (const [code, count] of codeCounts) {
      if (code === "UDR") expect(count).toBe(2);
      else expect(count).toBe(1);
    }
  });
});
