import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { useFlipCardA11y } from "../src/hooks/useFlipCardA11y";
import type { Scrutin } from "../src/types";

// useFlipCardA11y was previously only exercised through Card.test.tsx
// (session 100 added direct tests for useModalA11y + useFreshnessOnce —
// this brings the third hook in line with that pattern). Direct tests
// surface regressions on the keyboard handler invariants without going
// through the heavier Card component.

function mkScrutin(): Scrutin {
  return {
    id: "VTANR5L17V1234",
    numero: 1234,
    date: "2024-06-15",
    dossier_id: "d1",
    dossier_titre: "T",
    chapeau: "FISCALITÉ · LOI X",
    titre_brut: "Projet de loi sur l'ensemble",
    titre_pedago: "Hausse de la taxe carbone",
    position_par_groupe: { LFI: "pour", RN: "contre" } as Scrutin["position_par_groupe"],
    votes_bruts: {} as Scrutin["votes_bruts"],
    url_an_officielle: "https://an.example/1234",
    est_solennel: true,
    pedago_relu: false,
  };
}

interface HarnessProps {
  flipped: boolean;
  topMost: boolean;
  onFlip: () => void;
  onSwipe?: (dir: "left" | "right" | "down") => void;
}

function Harness({ flipped, topMost, onFlip, onSwipe }: HarnessProps) {
  const a11y = useFlipCardA11y({ flipped, topMost, scrutin: mkScrutin(), onFlip, onSwipe });
  return (
    <div {...a11y.rootProps} data-testid="card">
      <div {...a11y.frontProps} data-testid="front">front</div>
      <div {...a11y.backProps} data-testid="back">back</div>
    </div>
  );
}

describe("useFlipCardA11y — rootProps", () => {
  it("sets role=article", () => {
    render(<Harness flipped={false} topMost={true} onFlip={vi.fn()} />);
    expect(screen.getByTestId("card")).toHaveAttribute("role", "article");
  });

  it("composes aria-label with scrutin number + titre_pedago", () => {
    render(<Harness flipped={false} topMost={true} onFlip={vi.fn()} />);
    const card = screen.getByTestId("card");
    expect(card.getAttribute("aria-label")).toMatch(/n°1234/);
    expect(card.getAttribute("aria-label")).toMatch(/Hausse de la taxe carbone/);
  });

  it("sets tabIndex=0 when topMost (Tab-reachable)", () => {
    render(<Harness flipped={false} topMost={true} onFlip={vi.fn()} />);
    expect(screen.getByTestId("card")).toHaveAttribute("tabIndex", "0");
  });

  it("sets tabIndex=-1 when not topMost (DeckStack decoration)", () => {
    render(<Harness flipped={false} topMost={false} onFlip={vi.fn()} />);
    expect(screen.getByTestId("card")).toHaveAttribute("tabIndex", "-1");
  });
});

describe("useFlipCardA11y — aria-hidden faces", () => {
  it("front face is NOT hidden when flipped=false", () => {
    render(<Harness flipped={false} topMost={true} onFlip={vi.fn()} />);
    expect(screen.getByTestId("front")).toHaveAttribute("aria-hidden", "false");
    expect(screen.getByTestId("back")).toHaveAttribute("aria-hidden", "true");
  });

  it("back face is NOT hidden when flipped=true (front hidden)", () => {
    render(<Harness flipped={true} topMost={true} onFlip={vi.fn()} />);
    expect(screen.getByTestId("front")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("back")).toHaveAttribute("aria-hidden", "false");
  });
});

describe("useFlipCardA11y — keyboard handler", () => {
  it("Enter calls onFlip when topMost", () => {
    const onFlip = vi.fn();
    render(<Harness flipped={false} topMost={true} onFlip={onFlip} />);
    fireEvent.keyDown(screen.getByTestId("card"), { key: "Enter" });
    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it("Space calls onFlip when topMost", () => {
    const onFlip = vi.fn();
    render(<Harness flipped={false} topMost={true} onFlip={onFlip} />);
    fireEvent.keyDown(screen.getByTestId("card"), { key: " " });
    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it("Arrow keys call onSwipe with the matching direction (only when not flipped)", () => {
    const onSwipe = vi.fn();
    render(<Harness flipped={false} topMost={true} onFlip={vi.fn()} onSwipe={onSwipe} />);
    fireEvent.keyDown(screen.getByTestId("card"), { key: "ArrowRight" });
    fireEvent.keyDown(screen.getByTestId("card"), { key: "ArrowLeft" });
    fireEvent.keyDown(screen.getByTestId("card"), { key: "ArrowDown" });
    expect(onSwipe).toHaveBeenNthCalledWith(1, "right");
    expect(onSwipe).toHaveBeenNthCalledWith(2, "left");
    expect(onSwipe).toHaveBeenNthCalledWith(3, "down");
  });

  it("Arrow keys are ignored when flipped (vote only on recto)", () => {
    const onSwipe = vi.fn();
    render(<Harness flipped={true} topMost={true} onFlip={vi.fn()} onSwipe={onSwipe} />);
    fireEvent.keyDown(screen.getByTestId("card"), { key: "ArrowRight" });
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it("All keys are ignored when not topMost", () => {
    const onFlip = vi.fn();
    const onSwipe = vi.fn();
    render(<Harness flipped={false} topMost={false} onFlip={onFlip} onSwipe={onSwipe} />);
    fireEvent.keyDown(screen.getByTestId("card"), { key: "Enter" });
    fireEvent.keyDown(screen.getByTestId("card"), { key: "ArrowRight" });
    expect(onFlip).not.toHaveBeenCalled();
    expect(onSwipe).not.toHaveBeenCalled();
  });
});
