// src/components/Card.tsx
import { useEffect, useState } from "react";
import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import type { Scrutin } from "../types";
import { useFlipCardA11y } from "../hooks/useFlipCardA11y";
import { stripCitations, stripVoteResult } from "../lib/text-cleanup";

export interface CardProps {
  scrutin: Scrutin;
  topMost: boolean;       // is this the front card (interactive)?
  onSwipe?: (dir: "left" | "right" | "down") => void;
  onOpenMethode?: () => void;
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

export function Card({ scrutin, topMost, onSwipe, onOpenMethode }: CardProps) {
  const [flipped, setFlipped] = useState(false);

  const reducedMotion = useReducedMotion();
  const a11y = useFlipCardA11y({
    flipped,
    topMost,
    scrutin,
    onFlip: () => setFlipped((f) => !f),
    onSwipe,
  });

  // Tap on the card body toggles flip. Tap on an <a>/<button> child is ignored
  // so links and the chip IA still fire their own onClick handlers.
  function handleTap(e: MouseEvent | TouchEvent | PointerEvent) {
    if (!topMost) return;
    const target = e.target as HTMLElement | null;
    if (target && target.closest("a, button")) return;
    setFlipped((f) => !f);
  }

  // Keyboard-only users can reach the back via Tab → Enter on the chip but
  // framer-motion onTap doesn't fire on keyboard events. ESC mirrors the
  // modal-close convention.
  useEffect(() => {
    if (!topMost || !flipped) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // If a modal dialog (RankingOverlay, MethodeSheet) is open in front
      // of this card, ESC belongs to the modal — let it close that first
      // instead of also unflipping a card the user can't see.
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      setFlipped(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [topMost, flipped]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (!topMost || !onSwipe) return;
    if (info.offset.x < -SWIPE_THRESHOLD) onSwipe("left");
    else if (info.offset.x > SWIPE_THRESHOLD) onSwipe("right");
    else if (info.offset.y > SWIPE_THRESHOLD) onSwipe("down");
  }

  return (
    <motion.div
      {...a11y.rootProps}
      drag={topMost && !flipped}
      dragSnapToOrigin
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={reducedMotion ? 0 : 0.18}
      onTap={handleTap}
      onDragEnd={handleDragEnd}
      style={{
        cursor: topMost ? (flipped ? "pointer" : "grab") : "default",
        userSelect: "none",
        touchAction: topMost && !flipped ? "none" : "auto",
        perspective: 1500,
        height: "100%",
      }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          transformStyle: "preserve-3d",
          height: "100%",
        }}
      >
        {/* FRONT — chapeau + chip IA, title, 3 bullets, footer (date + n°). */}
        <div {...a11y.frontProps} style={{ ...FACE_STYLE, gap: 22, justifyContent: "space-between", height: "100%" }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--accent)", fontWeight: 500,
          }}>
            {scrutin.chapeau}
            {topMost && onOpenMethode && (
              <>
                {" · "}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onOpenMethode(); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  aria-label="IA — comment ce contenu a été préparé"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "inherit",
                    opacity: 0.7,
                    cursor: "pointer",
                    padding: "4px 2px",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    letterSpacing: "inherit",
                    textTransform: "inherit",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                    textDecorationStyle: "dotted",
                  }}
                ><span aria-hidden="true">✨</span>IA</button>
              </>
            )}
          </div>

          <div style={{
            flex: 1,
            display: "flex", flexDirection: "column", justifyContent: "center",
            gap: 16,
          }}>
            <div style={{
              fontFamily: "var(--font-sans)", fontWeight: 600,
              fontSize: 24, lineHeight: 1.25, letterSpacing: "-0.014em",
              color: "var(--ink)", textWrap: "pretty" as const,
            }}>{scrutin.titre_pedago}</div>
            {scrutin.points_cles && scrutin.points_cles.length > 0 && (
              <ul style={{
                listStyle: "none", padding: 0, margin: 0,
                display: "flex", flexDirection: "column", gap: 6,
                fontFamily: "var(--font-mono)", fontSize: 12,
                lineHeight: 1.4, color: "var(--ink-2)",
                letterSpacing: "-0.005em",
              }}>
                {scrutin.points_cles.slice(0, 3).map((p, i) => (
                  <li key={i} style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--accent)", flex: "0 0 auto" }}>·</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--ink-3)", letterSpacing: "0.04em",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            borderTop: "1px solid var(--line)",
            paddingTop: 14,
          }}>
            <span>{new Date(scrutin.date).toLocaleDateString("fr-FR")}</span>
            {scrutin.url_an_officielle
              ? <span>n° {scrutin.numero}</span>
              : <span style={{ color: "var(--accent)" }}>démo</span>}
          </div>
        </div>

        {/* BACK — single unified scrollable verso : header → contexte LLM →
         *  sections analyse_loi (si présent) → separator → intitulé officiel AN →
         *  footer. Le titre_pedago n'est PAS répété (le user vient de le voir
         *  200ms avant en flipant). */}
        <div
          {...a11y.backProps}
          style={{
            ...FACE_STYLE,
            position: "absolute",
            inset: 0,
            transform: "rotateY(180deg)",
            overflow: "auto",
            gap: 16,
          }}
        >
          {/* Shared header — chapeau + n° + date */}
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

          {/* Contexte LLM (or friendly fallback if absent) */}
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.6,
            color: "var(--ink-2)", textWrap: "pretty" as const,
          }}>
            {scrutin.contexte ? (
              renderWithBold(scrutin.contexte)
            ) : (
              <em style={{ color: "var(--ink-3)" }}>
                Aucune explication détaillée disponible pour ce scrutin. Le texte officiel ci-dessous donne le sujet général.
              </em>
            )}
          </div>

          {/* Analyse détaillée — rendue uniquement si analyse_loi présent */}
          {scrutin.analyse_loi && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <ColoredSection accent="var(--accent)" title="Mesures" bullets={scrutin.analyse_loi.mesures_principales} />
              <ColoredImpact
                positifs={scrutin.analyse_loi.concernes_positifs}
                negatifs={scrutin.analyse_loi.concernes_negatifs}
                neutres={scrutin.analyse_loi.concernes_neutres}
              />
              <ColoredSection accent="var(--warn)" title="Calendrier" bullets={scrutin.analyse_loi.calendrier} />
              <ColoredSection accent="var(--ink-3)" title="Exceptions" bullets={scrutin.analyse_loi.exceptions} />
            </div>
          )}

          {/* Separator: explicitly marks the boundary between LLM-rendered
           *  content (above) and the raw AN libellé (below). Désamorce le
           *  réflexe « biais IA » en plaçant les deux côte à côte. */}
          <div style={{
            paddingTop: 10, marginTop: 4,
            borderTop: "1px solid var(--line)",
            fontFamily: "var(--font-mono)", fontSize: 9.5,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "var(--ink-3)", textAlign: "center",
          }}>
            ↑ Synthèse IA  ·  ↓ texte officiel AN
          </div>

          {/* Intitulé brut AN */}
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "var(--ink-3)", letterSpacing: "0.04em",
            lineHeight: 1.5,
          }}>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.12em" }}>Intitulé officiel AN · </span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5 }}>{scrutin.titre_brut}</span>
          </div>

          {/* Shared footer — tap pour revenir + lien AN */}
          <div style={{
            marginTop: "auto",
            paddingTop: 12, borderTop: "1px solid var(--line)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.04em",
          }}>
            <span style={{ color: "var(--ink-3)" }}>tap pour revenir<span aria-hidden="true"> ‹</span></span>
            {scrutin.url_an_officielle
              ? <a
                  href={scrutin.url_an_officielle}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Voir le scrutin n°${scrutin.numero} sur le site de l'Assemblée Nationale (nouvel onglet)`}
                  style={{ color: "var(--accent)", textDecoration: "none" }}
                >
                  <span aria-hidden="true">Voir sur AN ↗</span>
                </a>
              : <span aria-label="Donnée de démonstration (pas une vraie source AN)" style={{ color: "var(--accent)" }}>donnée démo</span>}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────── ANALYSE SECTIONS

/** Section title in the accent color, with a thin colored left border on the
 *  bullet list. Bullets themselves stay in --ink-2 for readability — the color
 *  carries the structure, not the prose. */
function ColoredSection({
  accent, title, bullets,
}: {
  accent: string; title: string; bullets: string[];
}) {
  if (bullets.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: accent, fontWeight: 600,
      }}>{title}</span>
      <ul style={{
        margin: 0, paddingLeft: 14,
        borderLeft: `2px solid ${accent}`,
        display: "flex", flexDirection: "column", gap: 5,
        listStyle: "none",
      }}>
        {bullets.map((b, i) => (
          <li key={i} style={{
            fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.55,
            color: "var(--ink-2)", textWrap: "pretty" as const,
            paddingLeft: 4,
          }}>
            <span style={{ color: accent, marginRight: 6 }}>•</span>
            {renderWithBold(b)}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Qui est concerné — split into colored positive / negative / neutral lists. */
function ColoredImpact({
  positifs, negatifs, neutres,
}: {
  positifs: string[]; negatifs: string[]; neutres: string[];
}) {
  if (positifs.length + negatifs.length + neutres.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--ink-3)", fontWeight: 600,
      }}>Qui est concerné</span>

      {positifs.length > 0 && (
        <ColoredSubList accent="var(--pour)" label="Bénéficient" bullets={positifs} />
      )}
      {negatifs.length > 0 && (
        <ColoredSubList accent="var(--contre)" label="Contraints" bullets={negatifs} />
      )}
      {neutres.length > 0 && (
        <ColoredSubList accent="var(--ink-3)" label="À surveiller" bullets={neutres} />
      )}
    </div>
  );
}

function ColoredSubList({
  accent, label, bullets,
}: {
  accent: string; label: string; bullets: string[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 9.5,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: accent, fontWeight: 600,
      }}>{label}</span>
      <ul style={{
        margin: 0, paddingLeft: 14,
        borderLeft: `2px solid ${accent}`,
        display: "flex", flexDirection: "column", gap: 4,
        listStyle: "none",
      }}>
        {bullets.map((b, i) => (
          <li key={i} style={{
            fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.55,
            color: "var(--ink-2)", textWrap: "pretty" as const,
            paddingLeft: 4,
          }}>
            <span style={{ color: accent, marginRight: 6 }}>•</span>
            {renderWithBold(b)}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────── TEXT HELPERS

/** Parse **bold** markdown markup and return alternating text / <strong> nodes.
 *  Applies citation/vote-result cleanup first so we never render Anthropic
 *  markup or vote spoilers. */
function renderWithBold(text: string): React.ReactNode {
  const cleaned = stripVoteResult(stripCitations(text));
  const parts = cleaned.split(/(\*\*[^*]+?\*\*)/g);
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
