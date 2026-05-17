// scripts/lib/an-groups.ts
//
// Shared AN-organe-ref → internal GroupCode map. Before this lib, the
// table was duplicated identically in both scripts/ingest-an.ts and
// scripts/resume-ingest.ts — 13 entries each, kept in sync by hand. A
// drift (e.g. forgetting to update one when an organeRef changes) would
// silently route votes to the wrong group in the recovery flow.
import type { GroupCode } from "../../src/types";

/** AN organeRef → internal GroupCode. Triangulated from observed group
 *  sizes across the 46 SPS scrutins of the 17e legislature; verified for
 *  RN/LFI/ECO via instances/resume pages on assemblee-nationale.fr.
 *
 *  PO847173 and PO872880 both correspond to "Union des droites pour la
 *  République" — the group was reconstituted around 2025-09 with a new
 *  organeRef but the same political identity, so we collapse both to UDR.
 *
 *  PO840056 is the non-inscrits pool (~10 deputies) — excluded from the
 *  app since it is not a parliamentary group. Mapped to `null` so parseRaw
 *  can short-circuit it explicitly. */
export const GROUP_MAPPING: Record<string, GroupCode | null> = {
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
  PO847173: "UDR",
  PO872880: "UDR",
  PO840056: null,
};
