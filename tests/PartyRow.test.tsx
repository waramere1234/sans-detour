import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PartyRow } from "../src/components/PartyRow";
import type { GroupAlignment } from "../src/types";

// PartyRow has accumulated subtle invariants over 8+ sessions:
//  - session 25: SR-friendly composed aria-label (one sentence, not 3 fragments)
//  - session 81: plural rule normalized to `!== 1 ? "s" : ""`
//  - session 87: aria-controls only when interactive && expanded (else points
//    at a DOM id that doesn't exist when the AuditTrail panel is unmounted)
// Without dedicated tests, each of these silently regresses on a refactor.

function mk(overrides: Partial<GroupAlignment> = {}): GroupAlignment {
  return {
    group: "LFI",
    pct: 67,
    counted: 8,
    perfect: 5, partial: 1, conflict: 2,
    divided_excluded: 0,
    ...overrides,
  };
}

describe("PartyRow — rendering", () => {
  it("renders the party short code and pct", () => {
    render(<PartyRow alignment={mk()} />);
    expect(screen.getByText("LFI")).toBeInTheDocument();
    expect(screen.getByText("67%")).toBeInTheDocument();
  });

  it("composes a single readable aria-label (SR-friendly)", () => {
    render(<PartyRow alignment={mk()} />);
    // The div has no role when not interactive, but the aria-label still
    // exists on the element.
    const row = screen.getByLabelText(/La France Insoumise.*67.*alignement.*8 scrutins comptés/);
    expect(row).toBeInTheDocument();
  });
});

describe("PartyRow — plural rule (session 81 fix)", () => {
  it("uses singular 'scrutin compté' when counted === 1", () => {
    render(<PartyRow alignment={mk({ counted: 1 })} />);
    expect(screen.getByLabelText(/1 scrutin compté(?!s)/)).toBeInTheDocument();
  });

  it("uses plural 'scrutins comptés' when counted === 0 (French rule)", () => {
    render(<PartyRow alignment={mk({ counted: 0 })} />);
    expect(screen.getByLabelText(/0 scrutins comptés/)).toBeInTheDocument();
  });

  it("uses plural 'scrutins comptés' when counted >= 2", () => {
    render(<PartyRow alignment={mk({ counted: 12 })} />);
    expect(screen.getByLabelText(/12 scrutins comptés/)).toBeInTheDocument();
  });
});

describe("PartyRow — interactive behavior", () => {
  it("becomes a button when onClick is provided", () => {
    render(<PartyRow alignment={mk()} onClick={vi.fn()} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("has no role when onClick is omitted (used in RankingOverlay)", () => {
    render(<PartyRow alignment={mk()} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onClick when activated via mouse", () => {
    const onClick = vi.fn();
    render(<PartyRow alignment={mk()} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick on Enter and Space (keyboard parity)", () => {
    const onClick = vi.fn();
    render(<PartyRow alignment={mk()} onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(screen.getByRole("button"), { key: " " });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("ignores other keys", () => {
    const onClick = vi.fn();
    render(<PartyRow alignment={mk()} onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: "Tab" });
    fireEvent.keyDown(screen.getByRole("button"), { key: "a" });
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("PartyRow — aria-expanded / aria-controls gating (session 87 fix)", () => {
  it("reflects aria-expanded=false when not expanded", () => {
    render(<PartyRow alignment={mk()} expanded={false} controlsId="panel-1" onClick={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
  });

  it("reflects aria-expanded=true when expanded", () => {
    render(<PartyRow alignment={mk()} expanded={true} controlsId="panel-1" onClick={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });

  it("omits aria-controls when collapsed (panel not yet in DOM)", () => {
    // Session 87 fix: pointing at a non-existent panel id is undefined per
    // WAI-ARIA. Gate on interactive && expanded.
    render(<PartyRow alignment={mk()} expanded={false} controlsId="panel-1" onClick={vi.fn()} />);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-controls");
  });

  it("sets aria-controls only when expanded", () => {
    render(<PartyRow alignment={mk()} expanded={true} controlsId="panel-1" onClick={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-controls", "panel-1");
  });
});
