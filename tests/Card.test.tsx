import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Card } from "../src/components/Card";
import {
  CARD_VERSO_SEPARATOR_LABEL, CARD_AN_LIBELLE_PREFIX_LABEL,
  CARD_VERSO_FLIP_BACK_HINT, CARD_NO_ANALYSE_FALLBACK_BODY,
  CARD_FOOTER_NUMERO_PREFIX, CARD_FOOTER_DATE_SEPARATOR,
  cardAriaLabel,
  type Scrutin,
} from "../src/types";

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

  it("has role=article and aria-label that round-trips via cardAriaLabel(numero, titre)", () => {
    const scrutin = mkScrutin();
    render(<Card scrutin={scrutin} topMost={true} />);
    const card = screen.getByRole("article");
    // Full-template round-trip (previously only the numero "1234" was
    // pinned via .stringContaining — the surrounding wording "Scrutin
    // n°N :" + the titre_pedago were unpinned).
    expect(card).toHaveAttribute("aria-label", cardAriaLabel(scrutin.numero, scrutin.titre_pedago));
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
    // The DOM normalises the double-spaces around the `·` to single; match
    // a whitespace-collapsed form of the const so the test pin survives
    // jsdom normalisation while still round-tripping via the const.
    expect(screen.getByText(new RegExp(CARD_VERSO_SEPARATOR_LABEL.replace(/\s+/g, "\\s+")))).toBeInTheDocument();
    // Raw AN libellé below the separator
    expect(screen.getByText(new RegExp(CARD_AN_LIBELLE_PREFIX_LABEL, "i"))).toBeInTheDocument();
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
    // The DOM normalises the double-spaces around the `·` to single; match
    // a whitespace-collapsed form of the const so the test pin survives
    // jsdom normalisation while still round-tripping via the const.
    expect(screen.getByText(new RegExp(CARD_VERSO_SEPARATOR_LABEL.replace(/\s+/g, "\\s+")))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(CARD_AN_LIBELLE_PREFIX_LABEL, "i"))).toBeInTheDocument();
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

  it("recto footer renders CARD_FOOTER_NUMERO_PREFIX before the numero (round-trip)", () => {
    const sc = mkScrutin();
    sc.url_an_officielle = "https://an.example/1234";
    render(<Card scrutin={sc} topMost={true} />);
    // The recto footer shows "n° 1234" via {PREFIX}{numero}. Locate
    // any text containing the composed pattern — catches a drop of
    // the prefix or a drift to a different separator/glyph.
    const expected = new RegExp(`${CARD_FOOTER_NUMERO_PREFIX.replace("°", "°")}${sc.numero}`);
    expect(screen.getAllByText(expected).length).toBeGreaterThan(0);
  });

  it("shared header renders CARD_FOOTER_NUMERO_PREFIX + CARD_FOOTER_DATE_SEPARATOR between numero and date (round-trip)", () => {
    render(<Card scrutin={mkScrutin()} topMost={true} />);
    // The shared header at top of both faces renders "n° N · DATE".
    // Round-trip via both consts so a tweak to either glue propagates
    // to source + test in lockstep.
    const numeroPrefix = CARD_FOOTER_NUMERO_PREFIX;
    const dateSep = CARD_FOOTER_DATE_SEPARATOR;
    const matchers = Array.from(document.querySelectorAll("span")).filter(
      (el) => el.textContent?.includes(numeroPrefix) && el.textContent?.includes(dateSep),
    );
    expect(matchers.length).toBeGreaterThan(0);
  });

  it("verso renders CARD_VERSO_FLIP_BACK_HINT in the shared footer (round-trip)", () => {
    render(<Card scrutin={mkScrutin()} topMost={true} />);
    fireEvent.keyDown(screen.getByRole("article"), { key: "Enter" });
    // The footer "tap pour revenir ‹" hint is the verso's flip-back
    // affordance. Pin via the const so a copy tweak that drops the
    // affordance verb propagates to source + test in one edit.
    expect(screen.getByText(new RegExp(CARD_VERSO_FLIP_BACK_HINT))).toBeInTheDocument();
  });

  it("verso renders CARD_NO_ANALYSE_FALLBACK_BODY when contexte is missing (round-trip)", () => {
    const scrutin = mkScrutin();
    delete (scrutin as { contexte?: string }).contexte;
    render(<Card scrutin={scrutin} topMost={true} />);
    fireEvent.keyDown(screen.getByRole("article"), { key: "Enter" });
    // When the scrutin has no `contexte` field, the verso renders the
    // canonical fallback prose. Round-trip via the const so a future
    // rewording stays in sync between Card.tsx and this test.
    expect(screen.getByText(CARD_NO_ANALYSE_FALLBACK_BODY)).toBeInTheDocument();
  });
});
