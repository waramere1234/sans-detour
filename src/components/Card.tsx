// src/components/Card.tsx
import { useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import type { Scrutin } from "../types";

export interface CardProps {
  scrutin: Scrutin;
  topMost: boolean;       // is this the front card (interactive)?
  onSwipe?: (dir: "left" | "right" | "down") => void;
}

const SWIPE_THRESHOLD = 120;

// Shared card-face style so front and back have identical visual dimensions.
const FACE_STYLE: React.CSSProperties = {
  background: "var(--bg-2)",
  border: "1px solid var(--line)",
  borderRadius: 14,
  padding: 22,
  display: "flex",
  flexDirection: "column",
  gap: 18,
  boxShadow: "0 18px 30px -16px #000",
  // 3D flip plumbing — both faces sit on top of each other; the rotated one
  // hides itself via backface-visibility.
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
};

export function Card({ scrutin, topMost, onSwipe }: CardProps) {
  const [flipped, setFlipped] = useState(false);

  // Tap (no drag movement) toggles flip. Skip when the tap landed on an
  // interactive descendant (anchor, button) so links / buttons still work
  // on the back without immediately flipping the card back.
  function handleTap(e: MouseEvent | TouchEvent | PointerEvent) {
    if (!topMost) return;
    const target = e.target as HTMLElement | null;
    if (target && target.closest("a, button")) return;
    setFlipped((f) => !f);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (!topMost || !onSwipe) return;
    // Swipe is only intended on the front face — when flipped, dragging is
    // disabled below, so this branch only runs for the front.
    if (info.offset.x < -SWIPE_THRESHOLD) onSwipe("left");
    else if (info.offset.x > SWIPE_THRESHOLD) onSwipe("right");
    else if (info.offset.y > SWIPE_THRESHOLD) onSwipe("down");
  }

  return (
    <motion.div
      drag={topMost && !flipped}
      dragSnapToOrigin
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onTap={handleTap}
      onDragEnd={handleDragEnd}
      style={{
        cursor: topMost ? (flipped ? "pointer" : "grab") : "default",
        userSelect: "none",
        // Allow vertical scroll inside the back face when flipped; lock to
        // gestures on the front so swipe-down works as expected.
        touchAction: topMost && !flipped ? "none" : "auto",
        perspective: 1500,
      }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          transformStyle: "preserve-3d",
        }}
      >
        {/* FRONT — sets the card's natural height. */}
        <div style={FACE_STYLE}>
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
            display: "flex", justifyContent: "space-between", alignItems: "center",
            borderTop: "1px solid var(--line)",
            paddingTop: 14, marginTop: "auto",
          }}>
            <span>{new Date(scrutin.date).toLocaleDateString("fr-FR")}</span>
            <span style={{ color: "var(--ink-2)" }}>tap pour détails ›</span>
            {scrutin.url_an_officielle
              ? <span>n° {scrutin.numero}</span>
              : <span style={{ color: "var(--accent)" }}>démo</span>}
          </div>
        </div>

        {/* BACK — same bounding box as front, rotated 180° so it shows after flip. */}
        <div
          style={{
            ...FACE_STYLE,
            position: "absolute",
            inset: 0,
            transform: "rotateY(180deg)",
            overflow: "auto",
            gap: 14,
          }}
        >
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--ink-3)",
            paddingBottom: 6, borderBottom: "1px solid var(--line)",
          }}>
            <span>Détails du scrutin</span>
            <span>n° {scrutin.numero} · {new Date(scrutin.date).toLocaleDateString("fr-FR")}</span>
          </div>

          <BackSection eyebrow="Chapeau">
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 12,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "var(--accent)", fontWeight: 500,
            }}>{scrutin.chapeau}</span>
          </BackSection>

          <BackSection eyebrow="Reformulation">
            <p style={{
              fontFamily: "var(--font-sans)", fontWeight: 600,
              fontSize: 15, lineHeight: 1.35, letterSpacing: "-0.012em",
              color: "var(--ink)", margin: 0,
            }}>{scrutin.titre_pedago}</p>
          </BackSection>

          {scrutin.contexte && (
            <BackSection eyebrow="Contexte">
              <p style={{
                fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.55,
                color: "var(--ink-2)", margin: 0,
              }}>{scrutin.contexte}</p>
            </BackSection>
          )}

          <BackSection eyebrow="Titre officiel (AN)">
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: 12, lineHeight: 1.55,
              color: "var(--ink-2)", margin: 0,
            }}>{scrutin.titre_brut}</p>
          </BackSection>

          <BackSection eyebrow="Dossier législatif">
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: 12, lineHeight: 1.55,
              color: "var(--ink-2)", margin: 0,
            }}>{scrutin.dossier_titre}</p>
          </BackSection>

          <div style={{
            marginTop: "auto",
            paddingTop: 12, borderTop: "1px solid var(--line)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.04em",
          }}>
            <span style={{ color: "var(--ink-3)" }}>tap pour revenir ‹</span>
            {scrutin.url_an_officielle
              ? <a href={scrutin.url_an_officielle}
                  target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--accent)", textDecoration: "none" }}>
                  Voir sur AN ↗
                </a>
              : <span style={{ color: "var(--accent)" }}>donnée démo</span>}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function BackSection({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 9,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: "var(--ink-3)", fontWeight: 500,
      }}>{eyebrow}</span>
      {children}
    </div>
  );
}
