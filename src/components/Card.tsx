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
        {/* FRONT — the question. Just chapeau + title + footer. The full
            explanation lives on the back to avoid paraphrase redundancy. */}
        <div style={{ ...FACE_STYLE, gap: 22, justifyContent: "space-between", minHeight: 260 }}>
          {/* Chapeau as eyebrow */}
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--accent)", fontWeight: 500,
          }}>{scrutin.chapeau}</div>

          {/* The question — bigger now that it's the only content above the footer */}
          <div style={{
            flex: 1,
            display: "flex", alignItems: "center",
            fontFamily: "var(--font-sans)", fontWeight: 600,
            fontSize: 24, lineHeight: 1.25, letterSpacing: "-0.014em",
            color: "var(--ink)", textWrap: "pretty" as const,
          }}>{scrutin.titre_pedago}</div>

          {/* Footer */}
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--ink-3)", letterSpacing: "0.04em",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            borderTop: "1px solid var(--line)",
            paddingTop: 14,
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
            gap: 16,
          }}
        >
          {/* Header: eyebrow scrutin + date */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--ink-3)",
            paddingBottom: 8, borderBottom: "1px solid var(--line)",
          }}>
            <span style={{ color: "var(--accent)" }}>{scrutin.chapeau}</span>
            <span>n° {scrutin.numero} · {new Date(scrutin.date).toLocaleDateString("fr-FR")}</span>
          </div>

          {/* Big title — same wording as the front so the user knows what they're reading about */}
          <div style={{
            fontFamily: "var(--font-sans)", fontWeight: 600,
            fontSize: 18, lineHeight: 1.3, letterSpacing: "-0.012em",
            color: "var(--ink)",
          }}>{scrutin.titre_pedago}</div>

          {/* Single substantive explanation field. This is where the real content lives.
              Two transforms applied client-side so old ingest data renders cleanly without
              a re-run: (1) strip trailing "Vote : X oui, Y non" patterns the LLM sometimes
              appended (the vote outcome is computed elsewhere in the app — putting it here
              spoils the user's own vote and conflates "what the law does" with "what
              happened"). (2) Render **bold** markdown markup as styled <strong> so the LLM
              can emphasize key facts (numbers, mechanisms, dates). */}
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.6,
            color: "var(--ink-2)", textWrap: "pretty" as const,
          }}>
            {scrutin.contexte ? (
              renderWithBold(stripVoteResult(scrutin.contexte))
            ) : (
              <em style={{ color: "var(--ink-3)" }}>
                Aucune explication détaillée disponible pour ce scrutin. Le titre officiel ci-dessous donne le sujet général.
              </em>
            )}
          </div>

          {/* Discreet collapsible-feel — titre brut as small print, not as a section */}
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "var(--ink-3)", letterSpacing: "0.04em",
            paddingTop: 8, borderTop: "1px dashed var(--line)",
            lineHeight: 1.5,
          }}>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.12em" }}>Intitulé officiel AN · </span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5 }}>{scrutin.titre_brut}</span>
          </div>

          {/* Footer: back hint + AN link */}
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
                  Voir le texte sur AN ↗
                </a>
              : <span style={{ color: "var(--accent)" }}>donnée démo</span>}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Strip trailing "Vote : X oui, Y non" / "Résultat : ..." fragments the LLM
 *  sometimes appends. The vote outcome is computed elsewhere; including it
 *  in the explanation conflates "what the law does" with "what happened at
 *  the vote", which spoils the user's own vote and is off-topic. */
function stripVoteResult(text: string): string {
  // Find the first occurrence of " Vote :" or " Résultat :" (whitespace-bounded
  // so we don't strip on internal lowercase mentions like "ce vote a un impact")
  // and cut everything from there. Case-insensitive on the marker.
  const m = text.match(/\s+(Vote|Résultat)\s*[:.]/i);
  if (!m || m.index === undefined) return text;
  return text.slice(0, m.index).trim();
}

/** Parse **bold** markdown markup and return alternating text / <strong> nodes.
 *  The LLM is instructed to wrap 2-3 key facts (numbers, mechanisms, dates)
 *  in **...** so they pop visually. Falls back gracefully on plain text. */
function renderWithBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} style={{ color: "var(--ink)", fontWeight: 600 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
