// src/components/Card.tsx
import { motion } from "framer-motion";
import type { Scrutin } from "../types";

export interface CardProps {
  scrutin: Scrutin;
  topMost: boolean;       // is this the front card (interactive)?
  onSwipe?: (dir: "left" | "right" | "down") => void;
}

const SWIPE_THRESHOLD = 120;

export function Card({ scrutin, topMost, onSwipe }: CardProps) {
  return (
    <motion.div
      drag={topMost}
      dragSnapToOrigin
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={(_, info) => {
        if (!topMost || !onSwipe) return;
        if (info.offset.x < -SWIPE_THRESHOLD) onSwipe("left");
        else if (info.offset.x > SWIPE_THRESHOLD) onSwipe("right");
        else if (info.offset.y > SWIPE_THRESHOLD) onSwipe("down");
      }}
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 22,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        boxShadow: "0 18px 30px -16px #000",
        cursor: topMost ? "grab" : "default",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 11,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: "var(--accent)", fontWeight: 500,
      }}>{scrutin.chapeau}</div>
      <div style={{
        fontFamily: "var(--font-sans)", fontWeight: 600,
        fontSize: 21, lineHeight: 1.3, letterSpacing: "-0.012em",
        color: "var(--ink)", textWrap: "pretty" as const,
      }}>{scrutin.titre_pedago}</div>
      {scrutin.contexte && (
        <div style={{
          fontFamily: "var(--font-sans)", fontWeight: 400,
          fontSize: 14, lineHeight: 1.5, letterSpacing: "-0.005em",
          color: "var(--ink-2)", textWrap: "pretty" as const,
        }}>{scrutin.contexte}</div>
      )}
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 11,
        color: "var(--ink-3)", letterSpacing: "0.04em",
        display: "flex", justifyContent: "space-between",
        borderTop: "1px solid var(--line)",
        paddingTop: 14, marginTop: "auto",
      }}>
        <span>{new Date(scrutin.date).toLocaleDateString("fr-FR")}</span>
        {scrutin.url_an_officielle
          ? <span>scrutin n° {scrutin.numero}</span>
          : <span style={{ color: "var(--accent)" }} title="Donnée de démonstration — sera remplacée par les vrais scrutins de l'AN une fois le pipeline d'ingestion en production">exemple démo</span>}
      </div>
    </motion.div>
  );
}
