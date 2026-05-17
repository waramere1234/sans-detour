import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeckStack } from "../src/components/DeckStack";
import type { Scrutin } from "../src/types";

// DeckStack is small but owns the "stacked-deck" visual + the swipe-
// direction → UserVote mapping that the Card hands up. Untested before;
// the keyboard arrow paths already flow through useFlipCardA11y
// (session 101 tests), but the gesture-to-vote translation that lives
// in the wrapper has its own dedicated coverage now.

function mkScrutin(id: string, overrides: Partial<Scrutin> = {}): Scrutin {
  return {
    id,
    numero: parseInt(id.replace(/\D/g, ""), 10) || 1,
    date: "2024-06-15",
    dossier_id: `D${id}`,
    dossier_titre: "T",
    chapeau: `CHAPEAU · ${id}`,
    titre_brut: "Titre brut",
    titre_pedago: `Titre ${id}`,
    position_par_groupe: { LFI: "pour" } as Scrutin["position_par_groupe"],
    votes_bruts: {} as Scrutin["votes_bruts"],
    url_an_officielle: "https://an.example/" + id,
    est_solennel: true,
    pedago_relu: false,
    ...overrides,
  };
}

describe("DeckStack — rendering", () => {
  it("returns null (renders nothing) when scrutins is empty", () => {
    const { container } = render(<DeckStack scrutins={[]} onVote={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders up to 3 cards (top + 2 stacked decorations) even with a longer deck", () => {
    const deck = Array.from({ length: 10 }, (_, i) => mkScrutin(`s${i + 1}`));
    render(<DeckStack scrutins={deck} onVote={vi.fn()} />);
    // The top card uses tabIndex=0, decorations use tabIndex=-1 — so 1
    // article is focusable, the rest are present but tabIndex=-1.
    const articles = screen.getAllByRole("article", { hidden: true });
    expect(articles.length).toBe(3);
  });

  it("renders all 3 cards when deck has exactly 3", () => {
    const deck = [mkScrutin("s1"), mkScrutin("s2"), mkScrutin("s3")];
    render(<DeckStack scrutins={deck} onVote={vi.fn()} />);
    expect(screen.getAllByRole("article", { hidden: true }).length).toBe(3);
  });
});

describe("DeckStack — aria-hidden on non-top wrappers", () => {
  it("the top card's wrapper is NOT aria-hidden; the rest ARE", () => {
    const deck = [mkScrutin("s1"), mkScrutin("s2"), mkScrutin("s3")];
    const { container } = render(<DeckStack scrutins={deck} onVote={vi.fn()} />);
    // Only the 3 direct children of the stack container carry the wrapper
    // aria-hidden — inner decoration spans (✨ emoji, ↗ arrows, etc.)
    // also have aria-hidden so a generic [aria-hidden] selector picks
    // those up too. Scope to the stack container's direct children.
    const stackContainer = container.firstElementChild as HTMLElement;
    const wrappers = Array.from(stackContainer.children) as HTMLElement[];
    expect(wrappers).toHaveLength(3);
    expect(wrappers[0]).toHaveAttribute("aria-hidden", "false");
    expect(wrappers[1]).toHaveAttribute("aria-hidden", "true");
    expect(wrappers[2]).toHaveAttribute("aria-hidden", "true");
  });
});

describe("DeckStack — swipe direction → UserVote mapping", () => {
  // The wrapper translates the directional swipe gesture into a vote
  // semantic. ArrowLeft/ArrowRight/ArrowDown flow via the Card a11y hook
  // to onSwipe, which the wrapper maps to "contre" / "pour" / "skip".

  it("ArrowRight on the top card calls onVote(id, 'pour')", () => {
    const onVote = vi.fn();
    const deck = [mkScrutin("s1"), mkScrutin("s2")];
    render(<DeckStack scrutins={deck} onVote={onVote} />);
    const topCard = screen.getAllByRole("article", { hidden: true })[0];
    fireEvent.keyDown(topCard, { key: "ArrowRight" });
    expect(onVote).toHaveBeenCalledWith("s1", "pour");
  });

  it("ArrowLeft on the top card calls onVote(id, 'contre')", () => {
    const onVote = vi.fn();
    const deck = [mkScrutin("s1")];
    render(<DeckStack scrutins={deck} onVote={onVote} />);
    fireEvent.keyDown(screen.getByRole("article"), { key: "ArrowLeft" });
    expect(onVote).toHaveBeenCalledWith("s1", "contre");
  });

  it("ArrowDown on the top card calls onVote(id, 'skip')", () => {
    const onVote = vi.fn();
    const deck = [mkScrutin("s1")];
    render(<DeckStack scrutins={deck} onVote={onVote} />);
    fireEvent.keyDown(screen.getByRole("article"), { key: "ArrowDown" });
    expect(onVote).toHaveBeenCalledWith("s1", "skip");
  });
});

describe("DeckStack — onOpenMethode prop wiring", () => {
  it("forwards onOpenMethode to the top card only (decorations get undefined)", () => {
    // The ✨IA chip only renders when both topMost + onOpenMethode are
    // truthy on the Card. With a 3-card stack + onOpenMethode prop:
    //  - top card: chip renders (1 chip)
    //  - 2 decorations: chip hidden
    const onOpenMethode = vi.fn();
    const deck = [mkScrutin("s1"), mkScrutin("s2"), mkScrutin("s3")];
    render(<DeckStack scrutins={deck} onVote={vi.fn()} onOpenMethode={onOpenMethode} />);
    // Only one chip rendered (decorations are aria-hidden but still query-
    // able via { hidden: true }).
    const iaChips = screen.queryAllByRole("button", {
      name: /comment ce contenu a été préparé/i,
      hidden: true,
    });
    expect(iaChips.length).toBe(1);
  });
});
