import { useCallback, type KeyboardEvent } from "react";
import type { Scrutin } from "../types";

export interface UseFlipCardA11yArgs {
  flipped: boolean;
  topMost: boolean;
  scrutin: Scrutin;
  onFlip: () => void;
  onSwipe?: (dir: "left" | "right" | "down") => void;
}

export interface FlipCardA11yResult {
  rootProps: {
    role: "article";
    "aria-roledescription": string;
    "aria-label": string;
    tabIndex: number;
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  };
  frontProps: { "aria-hidden": boolean };
  backProps: { "aria-hidden": boolean };
}

/** Accessibility plumbing for the flippable Card:
 *  - rootProps: role/label, tabIndex (top card focusable), keyboard handlers
 *  - frontProps/backProps: aria-hidden toggled by `flipped` so the SR
 *    only reads one face at a time even though both live in the DOM. */
export function useFlipCardA11y({
  flipped, topMost, scrutin, onFlip, onSwipe,
}: UseFlipCardA11yArgs): FlipCardA11yResult {
  const onKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (!topMost) return;
    const tgt = e.target as HTMLElement;
    if (tgt.closest("a, button")) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onFlip();
      return;
    }
    if (!flipped && onSwipe) {
      if (e.key === "ArrowRight") { e.preventDefault(); onSwipe("right"); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); onSwipe("left"); }
      else if (e.key === "ArrowDown") { e.preventDefault(); onSwipe("down"); }
    }
  }, [flipped, topMost, onFlip, onSwipe]);

  return {
    rootProps: {
      role: "article",
      "aria-roledescription": "carte de scrutin, glissez pour voter",
      "aria-label": `Scrutin n°${scrutin.numero} : ${scrutin.titre_pedago}`,
      tabIndex: topMost ? 0 : -1,
      onKeyDown,
    },
    frontProps: { "aria-hidden": flipped },
    backProps: { "aria-hidden": !flipped },
  };
}
