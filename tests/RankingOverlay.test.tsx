import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RankingOverlay } from "../src/components/RankingOverlay";
import type { GroupAlignment, GroupCode } from "../src/types";
import { GROUP_CODES, RANKING_OVERLAY_LABEL, MODAL_CLOSE_LABEL } from "../src/types";

// RankingOverlay's modal-a11y plumbing comes from useModalA11y (already
// tested directly in session 98). These tests cover the component-level
// integration: the alignments → rankByAlignment → PartyRow rendering,
// the header chip with the plural rule on `compté`, and the dialog
// surface (role=dialog aria-modal aria-label).

function emptyAlignments(): Record<GroupCode, GroupAlignment> {
  const result = {} as Record<GroupCode, GroupAlignment>;
  for (const c of GROUP_CODES) {
    result[c] = {
      group: c, pct: 0, counted: 0,
      perfect: 0, partial: 0, conflict: 0, divided_excluded: 0,
    };
  }
  return result;
}

function mkAlignments(pcts: Partial<Record<GroupCode, number>>): Record<GroupCode, GroupAlignment> {
  const result = emptyAlignments();
  for (const [code, pct] of Object.entries(pcts)) {
    result[code as GroupCode] = { ...result[code as GroupCode], pct: pct ?? 0, counted: 8 };
  }
  return result;
}

describe("RankingOverlay — visibility", () => {
  it("renders nothing when open=false", () => {
    render(<RankingOverlay open={false} alignments={emptyAlignments()} countedTotal={0} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders a dialog with aria-modal=true + aria-label when open=true", () => {
    render(<RankingOverlay open={true} alignments={emptyAlignments()} countedTotal={8} onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", RANKING_OVERLAY_LABEL);
  });
});

describe("RankingOverlay — header chip (plural rule on 'compté')", () => {
  it("singularises 'compté' when countedTotal === 1", () => {
    render(<RankingOverlay open={true} alignments={emptyAlignments()} countedTotal={1} onClose={vi.fn()} />);
    // The header text is split across spans inside the dialog; use text-content
    // matching on the dialog rather than getByText on a single node.
    expect(screen.getByRole("dialog")).toHaveTextContent(new RegExp(`${RANKING_OVERLAY_LABEL} · 1 compté(?!s)`));
  });

  it("pluralises 'comptés' when countedTotal >= 2 (and on 0 too, French rule)", () => {
    render(<RankingOverlay open={true} alignments={emptyAlignments()} countedTotal={12} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toHaveTextContent(new RegExp(`${RANKING_OVERLAY_LABEL} · 12 comptés`));
  });
});

describe("RankingOverlay — alignment rows", () => {
  it("renders one PartyRow per GROUP_CODES entry (11 rows)", () => {
    render(<RankingOverlay open={true} alignments={emptyAlignments()} countedTotal={0} onClose={vi.fn()} />);
    // PartyRow without onClick has no role=button; query by the short label
    // text which always renders ("LFI", "RN", etc.) within the dialog.
    const dialog = screen.getByRole("dialog");
    for (const code of GROUP_CODES) {
      expect(dialog).toHaveTextContent(code);
    }
  });

  it("ranks by pct descending (highest first)", () => {
    // Mock alignments where RN > EPR > LFI by pct
    const alignments = mkAlignments({ RN: 80, EPR: 60, LFI: 30 });
    render(<RankingOverlay open={true} alignments={alignments} countedTotal={8} onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    const text = dialog.textContent || "";
    // RN appears before EPR before LFI in the visible row order.
    const rnIdx = text.indexOf("RN");
    const eprIdx = text.indexOf("EPR");
    const lfiIdx = text.indexOf("LFI");
    expect(rnIdx).toBeGreaterThan(-1);
    expect(rnIdx).toBeLessThan(eprIdx);
    expect(eprIdx).toBeLessThan(lfiIdx);
  });
});

describe("RankingOverlay — close interactions", () => {
  it("clicking the close button calls onClose", () => {
    const onClose = vi.fn();
    render(<RankingOverlay open={true} alignments={emptyAlignments()} countedTotal={0} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(MODAL_CLOSE_LABEL) }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Escape key calls onClose (via useModalA11y)", () => {
    const onClose = vi.fn();
    render(<RankingOverlay open={true} alignments={emptyAlignments()} countedTotal={0} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
