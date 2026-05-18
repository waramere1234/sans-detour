// src/components/DeckStack.tsx
import { DECK_VISIBLE_DEPTH, type Scrutin, type UserVote } from "../types";
import { Card } from "./Card";

export interface DeckStackProps {
  scrutins: Scrutin[];   // current deck (head = top card)
  onVote: (scrutinId: string, choice: UserVote) => void;
  onOpenMethode?: () => void;
}

export function DeckStack({ scrutins, onVote, onOpenMethode }: DeckStackProps) {
  if (scrutins.length === 0) return null;
  const visible = scrutins.slice(0, DECK_VISIBLE_DEPTH);

  function handleSwipe(s: Scrutin, dir: "left" | "right" | "down") {
    const choice: UserVote = dir === "left" ? "contre" : dir === "right" ? "pour" : "skip";
    onVote(s.id, choice);
  }

  return (
    <div style={{
      flex: 1, position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "6px 0",
    }}>
      {visible.map((s, i) => {
        const isTop = i === 0;
        const offset = i * 8;
        const scale = 1 - i * 0.035;
        const opacity = i === 0 ? 1 : i === 1 ? 0.75 : 0.45;
        return (
          <div
            key={s.id}
            // Non-top cards are visual decoration (stacked-deck effect)
            // — already non-interactive via pointer-events:none + tabIndex
            // on the Card root, but SR still announces them as "article"
            // 3 times. aria-hidden removes them from the a11y tree so the
            // user only hears the top card.
            aria-hidden={!isTop}
            style={{
              position: "absolute",
              left: 8, right: 8, top: offset, bottom: offset,
              transform: `scale(${scale}) translateY(${offset / 2}px)`,
              opacity,
              zIndex: 10 - i,
              pointerEvents: isTop ? "auto" : "none",
            }}
          >
            <Card scrutin={s} topMost={isTop} onSwipe={(dir) => handleSwipe(s, dir)} onOpenMethode={isTop ? onOpenMethode : undefined} />
          </div>
        );
      })}
    </div>
  );
}
