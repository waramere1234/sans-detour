import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PersonnaliteRow } from "../src/components/PersonnaliteRow";
import type { PersonnaliteAlignment } from "../src/types";

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

  it("composes a SR-friendly aria-label with pct + counted votes", () => {
    render(<PersonnaliteRow alignment={mk()} />);
    expect(screen.getByLabelText(/Marine Le Pen.*57.*12 votes/)).toBeInTheDocument();
  });

  it("uses singular 'vote' in aria-label when counted === 1 (defense)", () => {
    // Today this branch only fires when counted >= LOW_DATA_THRESHOLD (=3),
    // so counted=1 actually goes to the tooLittleData path. We can't easily
    // exercise the normal-branch-with-counted=1 without lowering the
    // threshold. So instead, verify the plural rule's pattern is used
    // (singular form for counted=1 in *either* branch). counted=1 → "trop
    // peu" branch fires → "1 vote comparable" (also singular).
    render(<PersonnaliteRow alignment={mk({ counted: 1 })} />);
    expect(screen.getByLabelText(/1 vote comparable(?!s)/)).toBeInTheDocument();
  });
});

describe("PersonnaliteRow — tooLittleData path (counted < LOW_DATA_THRESHOLD = 3)", () => {
  it("renders the 'trop peu de données' label", () => {
    render(<PersonnaliteRow alignment={mk({ counted: 2, pct: 0 })} />);
    expect(screen.getByLabelText(/trop peu de données/)).toBeInTheDocument();
  });

  it("singularises 'vote comparable' when counted === 1", () => {
    render(<PersonnaliteRow alignment={mk({ counted: 1, pct: 0 })} />);
    expect(screen.getByLabelText(/1 vote comparable(?!s)/)).toBeInTheDocument();
  });

  it("uses plural 'votes comparables' when counted === 2", () => {
    render(<PersonnaliteRow alignment={mk({ counted: 2, pct: 0 })} />);
    expect(screen.getByLabelText(/2 votes comparables/)).toBeInTheDocument();
  });

  it("renders '— · N vote' in the right column (no pct) for low-data", () => {
    render(<PersonnaliteRow alignment={mk({ counted: 2, pct: 50 })} />);
    // No pct number rendered standalone in the right column.
    expect(screen.getByText(/— · 2 votes/)).toBeInTheDocument();
  });
});
