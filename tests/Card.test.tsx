import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Card } from "../src/components/Card";
import type { Scrutin } from "../src/types";

function mkScrutin(): Scrutin {
  return {
    id: "VTANR5L17V1234", numero: 1234, date: "2024-06-15",
    dossier_id: "d1", dossier_titre: "T",
    chapeau: "FISCALITÉ · LOI X",
    titre_brut: "Projet de loi sur l'ensemble",
    titre_pedago: "Hausse de la taxe carbone de 5 euros par tonne",
    contexte: "Texte sur la taxe carbone **renforcée**.",
    points_cles: ["Hausse 5€/t", "Effet 2026", "5M de foyers concernés"],
    position_par_groupe: { LFI: "pour", RN: "contre" } as any,
    votes_bruts: {} as any,
    url_an_officielle: "https://an.example/1234",
    est_solennel: true, pedago_relu: false,
  };
}

describe("Card a11y", () => {
  it("renders chapeau and title on recto", () => {
    render(<Card scrutin={mkScrutin()} topMost={true} />);
    // Both faces are in the DOM; chapeau appears on both front and back.
    expect(screen.getAllByText(/FISCALITÉ · LOI X/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Hausse de la taxe carbone/).length).toBeGreaterThan(0);
  });

  it("has role=article and aria-label including scrutin numero", () => {
    render(<Card scrutin={mkScrutin()} topMost={true} />);
    const card = screen.getByRole("article");
    expect(card).toHaveAttribute("aria-label", expect.stringContaining("1234"));
  });

  it("is tabbable when topMost, not tabbable otherwise", () => {
    const { rerender } = render(<Card scrutin={mkScrutin()} topMost={true} />);
    expect(screen.getByRole("article")).toHaveAttribute("tabindex", "0");
    rerender(<Card scrutin={mkScrutin()} topMost={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("tabindex", "-1");
  });

  it("calls onSwipe('right') on ArrowRight when topMost and not flipped", () => {
    const onSwipe = vi.fn();
    render(<Card scrutin={mkScrutin()} topMost={true} onSwipe={onSwipe} />);
    fireEvent.keyDown(screen.getByRole("article"), { key: "ArrowRight" });
    expect(onSwipe).toHaveBeenCalledWith("right");
  });

  it("calls onSwipe('left') on ArrowLeft when topMost and not flipped", () => {
    const onSwipe = vi.fn();
    render(<Card scrutin={mkScrutin()} topMost={true} onSwipe={onSwipe} />);
    fireEvent.keyDown(screen.getByRole("article"), { key: "ArrowLeft" });
    expect(onSwipe).toHaveBeenCalledWith("left");
  });

  it("calls onSwipe('down') on ArrowDown when topMost and not flipped", () => {
    const onSwipe = vi.fn();
    render(<Card scrutin={mkScrutin()} topMost={true} onSwipe={onSwipe} />);
    fireEvent.keyDown(screen.getByRole("article"), { key: "ArrowDown" });
    expect(onSwipe).toHaveBeenCalledWith("down");
  });

  it("does not call onSwipe when not topMost", () => {
    const onSwipe = vi.fn();
    render(<Card scrutin={mkScrutin()} topMost={false} onSwipe={onSwipe} />);
    fireEvent.keyDown(screen.getByRole("article"), { key: "ArrowRight" });
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it("flips on Enter key when topMost", () => {
    render(<Card scrutin={mkScrutin()} topMost={true} />);
    const card = screen.getByRole("article");
    // Before flip: front face aria-hidden=false, back aria-hidden=true.
    const [front] = card.querySelectorAll<HTMLElement>("div[aria-hidden]");
    expect(front).toHaveAttribute("aria-hidden", "false");
    fireEvent.keyDown(card, { key: "Enter" });
    // After flip: front aria-hidden=true, back aria-hidden=false.
    const faces = card.querySelectorAll<HTMLElement>("div[aria-hidden]");
    expect(faces[0]).toHaveAttribute("aria-hidden", "true");
    expect(faces[1]).toHaveAttribute("aria-hidden", "false");
  });

  it("flips on Space key when topMost", () => {
    render(<Card scrutin={mkScrutin()} topMost={true} />);
    const card = screen.getByRole("article");
    const [front] = card.querySelectorAll<HTMLElement>("div[aria-hidden]");
    expect(front).toHaveAttribute("aria-hidden", "false");
    fireEvent.keyDown(card, { key: " " });
    const faces = card.querySelectorAll<HTMLElement>("div[aria-hidden]");
    expect(faces[0]).toHaveAttribute("aria-hidden", "true");
    expect(faces[1]).toHaveAttribute("aria-hidden", "false");
  });

  it("ignores arrow keys when flipped (vote only on recto)", () => {
    const onSwipe = vi.fn();
    render(<Card scrutin={mkScrutin()} topMost={true} onSwipe={onSwipe} />);
    fireEvent.keyDown(screen.getByRole("article"), { key: "Enter" });
    fireEvent.keyDown(screen.getByRole("article"), { key: "ArrowRight" });
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it("renders the IA chip when topMost and onOpenMethode provided", () => {
    render(<Card scrutin={mkScrutin()} topMost={true} onOpenMethode={vi.fn()} />);
    expect(screen.getByRole("button", { name: /comment ce contenu a été préparé/i })).toBeInTheDocument();
  });

  it("does not render IA chip when not topMost", () => {
    render(<Card scrutin={mkScrutin()} topMost={false} onOpenMethode={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /comment ce contenu a été préparé/i })).not.toBeInTheDocument();
  });

  it("calls onOpenMethode when IA chip is clicked", () => {
    const onOpenMethode = vi.fn();
    render(<Card scrutin={mkScrutin()} topMost={true} onOpenMethode={onOpenMethode} />);
    fireEvent.click(screen.getByRole("button", { name: /comment ce contenu a été préparé/i }));
    expect(onOpenMethode).toHaveBeenCalled();
  });

  it("IA chip declares aria-haspopup=dialog (opens MethodeSheet modal)", () => {
    // Session 93: the IA chip opens MethodeSheet (role="dialog" aria-modal).
    // aria-haspopup tells SR users to expect a popup before they activate.
    render(<Card scrutin={mkScrutin()} topMost={true} onOpenMethode={vi.fn()} />);
    const chip = screen.getByRole("button", { name: /comment ce contenu a été préparé/i });
    expect(chip).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("verso shows contexte, separator and intitulé AN in a single unified face", () => {
    render(<Card scrutin={mkScrutin()} topMost={true} />);
    fireEvent.keyDown(screen.getByRole("article"), { key: "Enter" });
    // Contexte LLM (renderWithBold strips the ** markers; matching the inner word "renforcée")
    expect(screen.getByText(/renforc/i)).toBeInTheDocument();
    // Separator line marking the IA / AN boundary
    expect(screen.getByText(/Synthèse IA/i)).toBeInTheDocument();
    // Raw AN libellé below the separator
    expect(screen.getByText(/Intitulé officiel AN/i)).toBeInTheDocument();
  });

  it("verso shows analyse sections when analyse_loi is present", () => {
    const scrutin = mkScrutin();
    scrutin.analyse_loi = {
      mesures_principales: ["Mesure A"],
      concernes_positifs: ["Bénéficiaire X"],
      concernes_negatifs: [], concernes_neutres: [],
      calendrier: ["Date Y"],
      exceptions: [],
    };
    render(<Card scrutin={scrutin} topMost={true} />);
    fireEvent.keyDown(screen.getByRole("article"), { key: "Enter" });
    // All sections render at once on the unified verso — no toggle, no +analyse click
    expect(screen.getByText(/Mesure A/)).toBeInTheDocument();
    expect(screen.getByText(/Bénéficiaire X/)).toBeInTheDocument();
    expect(screen.getByText(/Date Y/)).toBeInTheDocument();
  });

  it("verso skips analyse sections when analyse_loi is null", () => {
    const scrutin = mkScrutin();
    delete scrutin.analyse_loi;
    render(<Card scrutin={scrutin} topMost={true} />);
    fireEvent.keyDown(screen.getByRole("article"), { key: "Enter" });
    // Contexte and AN libellé still present
    expect(screen.getByText(/Synthèse IA/i)).toBeInTheDocument();
    expect(screen.getByText(/Intitulé officiel AN/i)).toBeInTheDocument();
    // No "Mesures" section header (exact-match uppercase mono label)
    expect(screen.queryByText(/^Mesures$/)).not.toBeInTheDocument();
  });

  it("recto does not render a + analyse button (merged into unified verso)", () => {
    const scrutin = mkScrutin();
    scrutin.analyse_loi = {
      mesures_principales: ["Mesure A"],
      concernes_positifs: [], concernes_negatifs: [], concernes_neutres: [],
      calendrier: [], exceptions: [],
    };
    render(<Card scrutin={scrutin} topMost={true} />);
    expect(screen.queryByRole("button", { name: /voir l'analyse/i })).not.toBeInTheDocument();
  });
});
