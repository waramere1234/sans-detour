// src/components/Card.tsx
import { useEffect, useState } from "react";
import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import {
  MAX_POINTS_CLES_BULLETS, APP_LOCALE,
  anScrutinViewAriaLabel, DEMO_DATA_LABEL_PREFIX, DEMO_FALLBACK_SHORT_LABEL,
  CARD_VERSO_SEPARATOR_LABEL, AN_LINK_VISIBLE_LABEL,
  CARD_AN_LIBELLE_PREFIX_LABEL, CARD_IA_CHIP_ARIA_LABEL,
  CARD_ANALYSE_TITLE_MESURES, CARD_ANALYSE_TITLE_CALENDRIER, CARD_ANALYSE_TITLE_EXCEPTIONS,
  CARD_ANALYSE_CONCERNES_HEADER,
  CARD_ANALYSE_CONCERNES_POSITIFS, CARD_ANALYSE_CONCERNES_NEGATIFS, CARD_ANALYSE_CONCERNES_NEUTRES,
  CARD_VERSO_FLIP_BACK_HINT, CARD_NO_ANALYSE_FALLBACK_BODY,
  CARD_FOOTER_NUMERO_PREFIX, CARD_FOOTER_DATE_SEPARATOR,
  MIDDLE_DOT_SEPARATOR,
  BACK_ARROW_SUFFIX_GLYPH,
  CARD_IA_CHIP_GLYPH, CARD_POINTS_CLES_BULLET_GLYPH,
  EXTERNAL_LINK_TARGET, EXTERNAL_LINK_REL, SWIPE_THRESHOLD,
  EASE_OUT_QUART, CARD_FLIP_DURATION_S, CARD_FLIP_ROTATE_DEGREES,
  type Scrutin,
} from "../types";
import { useFlipCardA11y } from "../hooks/useFlipCardA11y";
import { stripCitations, stripVoteResult } from "../lib/text-cleanup";

/** Drop-shadow lifted onto every card face AND onto CardSkeleton so the
 *  loading placeholder casts the same shadow as the real card behind it.
 *  Previously inlined identically in both files — a re-design (e.g.
 *  lighter shadow at higher density) would have meant 2 edits in
 *  lockstep. Exported here because Card is the canonical source. */
export const CARD_FACE_BOX_SHADOW = "0 18px 30px -16px #000";

export interface CardProps {
  scrutin: Scrutin;
  topMost: boolean;       // is this the front card (interactive)?
  onSwipe?: (dir: "left" | "right" | "down") => void;
  onOpenMethode?: () => void;
}

// Shared card-face style so front and back have identical visual dimensions.
const FACE_STYLE: React.CSSProperties = {
  background: "var(--bg-2)",
  border: "1px solid var(--line)",
  borderRadius: 14,
  padding: 22,
  display: "flex",
  flexDirection: "column",
  gap: 18,
  boxShadow: CARD_FACE_BOX_SHADOW,
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
        animate={{ rotateY: flipped ? CARD_FLIP_ROTATE_DEGREES : 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: CARD_FLIP_DURATION_S, ease: EASE_OUT_QUART }}
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
                {MIDDLE_DOT_SEPARATOR}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onOpenMethode(); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  // The tap opens MethodeSheet (role="dialog" aria-modal).
                  // aria-haspopup signals to SR users that a popup is coming
                  // — same pattern as ChipTop1 and the TopBar trigger.
                  aria-haspopup="dialog"
                  aria-label={CARD_IA_CHIP_ARIA_LABEL}
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
                ><span aria-hidden="true">{CARD_IA_CHIP_GLYPH}</span>IA</button>
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
                {scrutin.points_cles.slice(0, MAX_POINTS_CLES_BULLETS).map((p, i) => (
                  <li key={i} style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--accent)", flex: "0 0 auto" }}>{CARD_POINTS_CLES_BULLET_GLYPH}</span>
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
            <span>{new Date(scrutin.date).toLocaleDateString(APP_LOCALE)}</span>
            {scrutin.url_an_officielle
              ? <span>{CARD_FOOTER_NUMERO_PREFIX}{scrutin.numero}</span>
              : <span style={{ color: "var(--accent)" }}>{DEMO_FALLBACK_SHORT_LABEL}</span>}
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
            transform: `rotateY(${CARD_FLIP_ROTATE_DEGREES}deg)`,
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
            <span>{CARD_FOOTER_NUMERO_PREFIX}{scrutin.numero}{CARD_FOOTER_DATE_SEPARATOR}{new Date(scrutin.date).toLocaleDateString(APP_LOCALE)}</span>
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
                {CARD_NO_ANALYSE_FALLBACK_BODY}
              </em>
            )}
          </div>

          {/* Analyse détaillée — rendue uniquement si analyse_loi présent */}
          {scrutin.analyse_loi && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <ColoredSection accent="var(--accent)" title={CARD_ANALYSE_TITLE_MESURES} bullets={scrutin.analyse_loi.mesures_principales} />
              <ColoredImpact
                positifs={scrutin.analyse_loi.concernes_positifs}
                negatifs={scrutin.analyse_loi.concernes_negatifs}
                neutres={scrutin.analyse_loi.concernes_neutres}
              />
              <ColoredSection accent="var(--warn)" title={CARD_ANALYSE_TITLE_CALENDRIER} bullets={scrutin.analyse_loi.calendrier} />
              <ColoredSection accent="var(--ink-3)" title={CARD_ANALYSE_TITLE_EXCEPTIONS} bullets={scrutin.analyse_loi.exceptions} />
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
            {CARD_VERSO_SEPARATOR_LABEL}
          </div>

          {/* Intitulé brut AN */}
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "var(--ink-3)", letterSpacing: "0.04em",
            lineHeight: 1.5,
          }}>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.12em" }}>{CARD_AN_LIBELLE_PREFIX_LABEL}{MIDDLE_DOT_SEPARATOR}</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5 }}>{scrutin.titre_brut}</span>
          </div>

          {/* Shared footer — tap pour revenir + lien AN */}
          <div style={{
            marginTop: "auto",
            paddingTop: 12, borderTop: "1px solid var(--line)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.04em",
          }}>
            <span style={{ color: "var(--ink-3)" }}>{CARD_VERSO_FLIP_BACK_HINT}<span aria-hidden="true">{BACK_ARROW_SUFFIX_GLYPH}</span></span>
            {scrutin.url_an_officielle
              ? <a
                  href={scrutin.url_an_officielle}
                  target={EXTERNAL_LINK_TARGET}
                  rel={EXTERNAL_LINK_REL}
                  aria-label={anScrutinViewAriaLabel(scrutin.numero)}
                  style={{ color: "var(--accent)", textDecoration: "none" }}
                >
                  <span aria-hidden="true">{AN_LINK_VISIBLE_LABEL}</span>
                </a>
              : <span aria-label={`${DEMO_DATA_LABEL_PREFIX} (pas une vraie source AN)`} style={{ color: "var(--accent)" }}>donnée démo</span>}
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
      }}>{CARD_ANALYSE_CONCERNES_HEADER}</span>

      {positifs.length > 0 && (
        <ColoredSubList accent="var(--pour)" label={CARD_ANALYSE_CONCERNES_POSITIFS} bullets={positifs} />
      )}
      {negatifs.length > 0 && (
        <ColoredSubList accent="var(--contre)" label={CARD_ANALYSE_CONCERNES_NEGATIFS} bullets={negatifs} />
      )}
      {neutres.length > 0 && (
        <ColoredSubList accent="var(--ink-3)" label={CARD_ANALYSE_CONCERNES_NEUTRES} bullets={neutres} />
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
