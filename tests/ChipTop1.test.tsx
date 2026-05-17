import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChipTop1 } from "../src/components/ChipTop1";

// ChipTop1 surfaces the live-score chip on /play once the user crosses
// MIN_FOR_RANKING. It's the user-visible affordance that opens the
// RankingOverlay. Small but critical, and previously untested.

describe("ChipTop1", () => {
  it("renders the party short label and pct", () => {
    render(<ChipTop1 topGroup="RN" pct={42} onTap={vi.fn()} />);
    expect(screen.getByText("RN")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("calls onTap when clicked", () => {
    const onTap = vi.fn();
    render(<ChipTop1 topGroup="LFI" pct={67} onTap={onTap} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it("has an aria-label that includes the full party name and pct", () => {
    render(<ChipTop1 topGroup="EPR" pct={55} onTap={vi.fn()} />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Ensemble pour la République"),
    );
    expect(btn).toHaveAttribute("aria-label", expect.stringContaining("55"));
  });

  it("uses type=button (no implicit form submission)", () => {
    render(<ChipTop1 topGroup="SOC" pct={30} onTap={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("declares aria-haspopup=dialog so SR users know it opens a modal", () => {
    // Session 93: ChipTop1 opens RankingOverlay (role="dialog" aria-modal).
    // Without aria-haspopup, SR users don't know to expect a popup.
    render(<ChipTop1 topGroup="DR" pct={48} onTap={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-haspopup", "dialog");
  });
});
