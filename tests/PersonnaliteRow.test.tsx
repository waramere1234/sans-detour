import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PersonnaliteRow } from "../src/components/PersonnaliteRow";
import {
  LOW_DATA_THRESHOLD, personnaliteRowAriaLabel,
  type PersonnaliteAlignment,
} from "../src/types";
import { getPersonnalite } from "../src/lib/personnalites";

// PersonnaliteRow has accumulated invariants over sessions 25, 78, 81, 86:
//  - session 25-like: SR-friendly composed aria-label (one sentence)
//  - session 86: plural rule applied uniformly to "vote" in both branches
//    (the tooLittleData branch always had it; the normal branch had a
//    hardcoded "votes" that was fragile if LOW_DATA_THRESHOLD changed)
//  - LOW_DATA_THRESHOLD = 3: counted < 3 renders the "trop peu de données"
//    state (faded, no bar, no pct in the right column)

function mk(overrides: Partial<PersonnaliteAlignment> = {}): PersonnaliteAlignment {
  return {
    personnalite: "le_pen",
    pct: 57,
    counted: 12,
    perfect: 7, partial: 1, conflict: 4,
    absent_excluded: 0,
    non_dispo_excluded: 0,
    ...overrides,
  };
}

describe("PersonnaliteRow — normal data path", () => {
  it("renders the short name and the percent display", () => {
    render(<PersonnaliteRow alignment={mk()} />);
    expect(screen.getByText("Le Pen")).toBeInTheDocument();
    // Right column shows "{pct}% · {counted}" in normal mode
    expect(screen.getByText(/57%.*12/)).toBeInTheDocument();
  });

  it("composes a SR-friendly aria-label via personnaliteRowAriaLabel (normal branch round-trip)", () => {
    render(<PersonnaliteRow alignment={mk()} />);
    const expected = personnaliteRowAriaLabel(getPersonnalite("le_pen").display_name, 57, 12, false);
    expect(screen.getByLabelText(expected)).toBeInTheDocument();
  });

  it("uses singular 'vote' in aria-label when counted === 1 (defense, round-trip via helper)", () => {
    // Today this branch only fires when counted >= LOW_DATA_THRESHOLD (=3),
    // so counted=1 actually goes to the tooLittleData path. We can't easily
    // exercise the normal-branch-with-counted=1 without lowering the
    // threshold. So instead, verify the plural rule's pattern is used
    // (singular form for counted=1 in *either* branch). counted=1 → "trop
    // peu" branch fires → "1 vote comparable" (also singular).
    render(<PersonnaliteRow alignment={mk({ counted: 1 })} />);
    const expected = personnaliteRowAriaLabel(getPersonnalite("le_pen").display_name, 57, 1, true);
    expect(screen.getByLabelText(expected)).toBeInTheDocument();
    expect(expected).toMatch(/1 vote comparable(?!s)/);
  });
});

describe("PersonnaliteRow — tooLittleData path (counted < LOW_DATA_THRESHOLD)", () => {
  // Derive the "just under" boundary from the const so a future bump
  // (e.g. LOW_DATA_THRESHOLD → 5) reuses the boundary value without
  // silently leaving counted=2 in the tooLittleData branch when 2 is no
  // longer below the threshold.
  const justBelow = LOW_DATA_THRESHOLD - 1; // currently 2

  it("renders the 'trop peu de données' label at LOW_DATA_THRESHOLD - 1 (round-trip via helper)", () => {
    render(<PersonnaliteRow alignment={mk({ counted: justBelow, pct: 0 })} />);
    const expected = personnaliteRowAriaLabel(getPersonnalite("le_pen").display_name, 0, justBelow, true);
    expect(screen.getByLabelText(expected)).toBeInTheDocument();
  });

  it("singularises 'vote comparable' when counted === 1 (round-trip via helper)", () => {
    render(<PersonnaliteRow alignment={mk({ counted: 1, pct: 0 })} />);
    const expected = personnaliteRowAriaLabel(getPersonnalite("le_pen").display_name, 0, 1, true);
    expect(screen.getByLabelText(expected)).toBeInTheDocument();
    // Defence: explicit singular pattern still surfaces if the helper
    // regresses to a stale "votes comparables" plural on counted=1.
    expect(expected).toMatch(/1 vote comparable(?!s)/);
  });

  it("uses plural 'votes comparables' when counted >= 2", () => {
    render(<PersonnaliteRow alignment={mk({ counted: justBelow, pct: 0 })} />);
    const expected = personnaliteRowAriaLabel(getPersonnalite("le_pen").display_name, 0, justBelow, true);
    expect(screen.getByLabelText(expected)).toBeInTheDocument();
    expect(expected).toMatch(new RegExp(`${justBelow} votes comparables`));
  });

  it("renders '— · N vote' in the right column (no pct) for low-data", () => {
    render(<PersonnaliteRow alignment={mk({ counted: justBelow, pct: 50 })} />);
    // No pct number rendered standalone in the right column.
    expect(screen.getByText(new RegExp(`— · ${justBelow} votes`))).toBeInTheDocument();
  });

  it("crosses out of the tooLittleData branch at exactly LOW_DATA_THRESHOLD (boundary inclusive on the >= side)", () => {
    // counted === LOW_DATA_THRESHOLD → NOT tooLittleData (counted < THRESHOLD is false).
    render(<PersonnaliteRow alignment={mk({ counted: LOW_DATA_THRESHOLD, pct: 50 })} />);
    expect(screen.queryByLabelText(/trop peu de données/)).not.toBeInTheDocument();
  });

  it("LOW_DATA_THRESHOLD is the canonical value 3 (pin-the-value)", () => {
    // Bump deliberate: edit this assertion + the matching Methode §03/§04
    // copy together.
    expect(LOW_DATA_THRESHOLD).toBe(3);
  });
});
