import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardSkeleton } from "../src/components/CardSkeleton";
import { ResultSkeleton } from "../src/components/ResultSkeleton";
import { GROUP_CODES } from "../src/types";

// The two skeleton components mirror the layouts of Card.tsx (Play) and
// the alignment list on Result.tsx. Two invariants matter:
//   - aria-busy + a labelled landmark so SR users learn the page is loading
//     (silent skeletons are the worst-case UX: appear-then-disappear with
//     no narration)
//   - row count anchored on GROUP_CODES.length so the real Result list
//     doesn't replace 6 skeleton rows with 11 real rows and shove the
//     buttons 250 px down (CLS regression noted in the source comment).

describe("CardSkeleton — a11y", () => {
  it("exposes aria-busy='true' so AT announces loading", () => {
    const { container } = render(<CardSkeleton />);
    expect(container.querySelector("[aria-busy='true']")).not.toBeNull();
  });

  it("has a French aria-label so SR speaks the loading state", () => {
    render(<CardSkeleton />);
    expect(screen.getByLabelText("Chargement des scrutins")).toBeInTheDocument();
  });

  it("renders shimmer placeholders (not an empty div) so the layout reserves space", () => {
    const { container } = render(<CardSkeleton />);
    const shimmers = container.querySelectorAll(".skeleton-shimmer");
    expect(shimmers.length).toBeGreaterThan(0);
  });
});

describe("ResultSkeleton — a11y", () => {
  it("exposes aria-busy='true' so AT announces loading", () => {
    const { container } = render(<ResultSkeleton />);
    expect(container.querySelector("[aria-busy='true']")).not.toBeNull();
  });

  it("has a French aria-label so SR speaks the loading state", () => {
    render(<ResultSkeleton />);
    expect(screen.getByLabelText("Chargement de ton résultat")).toBeInTheDocument();
  });
});

describe("ResultSkeleton — row count anchored on GROUP_CODES (no CLS regression)", () => {
  it("renders exactly GROUP_CODES.length placeholder rows", () => {
    render(<ResultSkeleton />);
    // The skeleton renders one <div> per row inside the labelled section.
    // Header has 3 shimmer bars in its own <header> (not a row); rows live
    // as direct children of the section, AFTER the header. Easiest stable
    // selector: every direct-child div of the section.
    const section = screen.getByLabelText("Chargement de ton résultat");
    const rows = Array.from(section.children).filter(
      (el) => el.tagName.toLowerCase() === "div",
    );
    expect(rows).toHaveLength(GROUP_CODES.length);
  });
});
