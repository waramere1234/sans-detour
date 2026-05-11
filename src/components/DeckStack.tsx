// src/components/DeckStack.tsx
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Scrutin, UserVote } from "../types";
import { Card } from "./Card";
import { CardDetailOverlay } from "./CardDetailOverlay";

export interface DeckStackProps {
  scrutins: Scrutin[];   // current deck (head = top card)
  onVote: (scrutinId: string, choice: UserVote) => void;
}

export function DeckStack({ scrutins, onVote }: DeckStackProps) {
  const [detailScrutin, setDetailScrutin] = useState<Scrutin | null>(null);

  if (scrutins.length === 0) return null;
  const visible = scrutins.slice(0, 3);

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
      <AnimatePresence>
        {visible.map((s, i) => {
          const isTop = i === 0;
          const offset = i * 8;
          const scale = 1 - i * 0.035;
          const opacity = i === 0 ? 1 : i === 1 ? 0.75 : 0.45;
          return (
            <div
              key={s.id}
              style={{
                position: "absolute",
                left: 8, right: 8, top: offset,
                transform: `scale(${scale}) translateY(${offset / 2}px)`,
                opacity,
                zIndex: 10 - i,
                pointerEvents: isTop ? "auto" : "none",
              }}
            >
              <Card
                scrutin={s}
                topMost={isTop}
                onSwipe={(dir) => handleSwipe(s, dir)}
                onShowDetail={isTop ? () => setDetailScrutin(s) : undefined}
              />
            </div>
          );
        })}
      </AnimatePresence>
      <CardDetailOverlay
        open={detailScrutin !== null}
        scrutin={detailScrutin}
        onClose={() => setDetailScrutin(null)}
      />
    </div>
  );
}
