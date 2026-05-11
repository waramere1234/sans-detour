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

type BackVariant = "explanation" | "analyse";

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
  // Which content shows on the back when flipped: the explanation (default,
  // triggered by tapping the card body) or the structured analyse (triggered
  // by the "+ analyse" button on the front).
  const [backVariant, setBackVariant] = useState<BackVariant>("explanation");

  // Tap (no drag movement) toggles flip. Tap on the card body → flip to
  // explanation. Tap on an <a>/<button> child is ignored so links and the
  // "+ analyse" button still fire their own onClick handlers.
  function handleTap(e: MouseEvent | TouchEvent | PointerEvent) {
    if (!topMost) return;
    const target = e.target as HTMLElement | null;
    if (target && target.closest("a, button")) return;
    setFlipped((f) => {
      if (!f) {
        // Front → back: body taps always go to the explanation variant.
        setBackVariant("explanation");
      }
      return !f;
    });
  }

  function showAnalyse() {
    setBackVariant("analyse");
    setFlipped(true);
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
        {/* FRONT — the question. Chapeau + "+ analyse" button + title + footer. */}
        <div style={{ ...FACE_STYLE, gap: 22, justifyContent: "space-between", minHeight: 260 }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
          }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 11,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "var(--accent)", fontWeight: 500,
              flex: 1,
            }}>{scrutin.chapeau}</div>
            {topMost && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); showAnalyse(); }}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="Voir l'analyse détaillée du scrutin"
                style={{
                  background: "transparent",
                  border: "1px solid var(--line)",
                  color: scrutin.analyse_loi ? "var(--accent)" : "var(--ink-3)",
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  padding: "3px 8px", borderRadius: 3,
                  cursor: "pointer", letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                  textTransform: "uppercase",
                }}
              >+ analyse</button>
            )}
          </div>

          <div style={{
            flex: 1,
            display: "flex", alignItems: "center",
            fontFamily: "var(--font-sans)", fontWeight: 600,
            fontSize: 24, lineHeight: 1.25, letterSpacing: "-0.014em",
            color: "var(--ink)", textWrap: "pretty" as const,
          }}>{scrutin.titre_pedago}</div>

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

        {/* BACK — same bounding box as front, rotated 180° so it shows after flip.
            Content switches based on backVariant: explanation (tap card) or
            analyse (tap "+ analyse"). Both share the same header and footer
            so the flip lands on a consistent visual shell. */}
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
          {/* Shared header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--ink-3)",
            paddingBottom: 8, borderBottom: "1px solid var(--line)",
          }}>
            <span style={{ color: "var(--accent)" }}>
              {backVariant === "analyse" ? "Analyse · " : ""}{scrutin.chapeau}
            </span>
            <span>n° {scrutin.numero} · {new Date(scrutin.date).toLocaleDateString("fr-FR")}</span>
          </div>

          {/* Same titre_pedago for orientation, whichever variant */}
          <div style={{
            fontFamily: "var(--font-sans)", fontWeight: 600,
            fontSize: 18, lineHeight: 1.3, letterSpacing: "-0.012em",
            color: "var(--ink)",
          }}>{scrutin.titre_pedago}</div>

          {/* Variant body */}
          {backVariant === "explanation" ? (
            <ExplanationBody scrutin={scrutin} />
          ) : (
            <AnalyseBody scrutin={scrutin} />
          )}

          {/* Shared footer */}
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

// ─────────────────────────────────────────────────── BACK VARIANTS

function ExplanationBody({ scrutin }: { scrutin: Scrutin }) {
  return (
    <>
      <div style={{
        fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.6,
        color: "var(--ink-2)", textWrap: "pretty" as const,
      }}>
        {scrutin.contexte ? (
          renderWithBold(scrutin.contexte)
        ) : (
          <em style={{ color: "var(--ink-3)" }}>
            Aucune explication détaillée disponible pour ce scrutin. Le titre officiel ci-dessous donne le sujet général.
          </em>
        )}
      </div>

      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        color: "var(--ink-3)", letterSpacing: "0.04em",
        paddingTop: 8, borderTop: "1px dashed var(--line)",
        lineHeight: 1.5,
      }}>
        <span style={{ textTransform: "uppercase", letterSpacing: "0.12em" }}>Intitulé officiel AN · </span>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5 }}>{scrutin.titre_brut}</span>
      </div>
    </>
  );
}

function AnalyseBody({ scrutin }: { scrutin: Scrutin }) {
  const a = scrutin.analyse_loi;
  if (!a) {
    return (
      <div style={{
        border: "1px dashed var(--line)",
        borderRadius: 6,
        padding: "16px 18px",
        fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.55,
        color: "var(--ink-2)", textAlign: "center",
      }}>
        Analyse détaillée pas encore disponible pour ce scrutin.<br/>
        <span style={{ color: "var(--ink-3)", fontSize: 11 }}>
          Sera générée au prochain run du pipeline d'ingestion.
        </span>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Section title="Mesures principales" bullets={a.mesures_principales} />
      <DoubleSection
        positifs={a.concernes_positifs}
        negatifs={a.concernes_negatifs}
        neutres={a.concernes_neutres}
      />
      <Section title="Calendrier" bullets={a.calendrier} />
      <Section title="Exceptions et cas particuliers" bullets={a.exceptions} />
    </div>
  );
}

function Section({ title, bullets }: { title: string; bullets: string[] }) {
  if (bullets.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--ink-3)", fontWeight: 500,
      }}>{title}</span>
      <ul style={{
        margin: 0, paddingLeft: 18,
        display: "flex", flexDirection: "column", gap: 4,
      }}>
        {bullets.map((b, i) => (
          <li key={i} style={{
            fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.55,
            color: "var(--ink-2)", textWrap: "pretty" as const,
          }}>
            {renderWithBold(b)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DoubleSection({
  positifs, negatifs, neutres,
}: {
  positifs: string[]; negatifs: string[]; neutres: string[];
}) {
  if (positifs.length + negatifs.length + neutres.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--ink-3)", fontWeight: 500,
      }}>Qui est concerné</span>

      {positifs.length > 0 && (
        <ImpactList accent="var(--pour)" label="Impact positif" bullets={positifs} />
      )}
      {negatifs.length > 0 && (
        <ImpactList accent="var(--contre)" label="Impact négatif" bullets={negatifs} />
      )}
      {neutres.length > 0 && (
        <ImpactList accent="var(--ink-3)" label="Neutre ou à surveiller" bullets={neutres} />
      )}
    </div>
  );
}

function ImpactList({ accent, label, bullets }: { accent: string; label: string; bullets: string[] }) {
  return (
    <div style={{
      borderLeft: `2px solid ${accent}`,
      paddingLeft: 10,
      display: "flex", flexDirection: "column", gap: 3,
    }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 9.5,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: accent, fontWeight: 500,
      }}>{label}</span>
      <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 3 }}>
        {bullets.map((b, i) => (
          <li key={i} style={{
            fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.55,
            color: "var(--ink-2)", textWrap: "pretty" as const,
          }}>
            {renderWithBold(b)}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────── TEXT HELPERS

/** Strip Anthropic web_search citation markup like
 *  `<cite index="20-2,20-3">text</cite>` — preserve the inner text, drop the
 *  wrapper. Also drops any orphan opening/closing tags. */
function stripCitations(text: string): string {
  return text
    .replace(/<cite[^>]*>([\s\S]*?)<\/cite>/g, "$1")
    .replace(/<\/?cite[^>]*>/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Strip trailing "Vote : X oui, Y non" / "Résultat : ..." fragments the LLM
 *  sometimes appends. The vote outcome is computed elsewhere; including it
 *  in the explanation conflates "what the law does" with "what happened at
 *  the vote", which spoils the user's own vote and is off-topic. */
function stripVoteResult(text: string): string {
  const m = text.match(/\s+(Vote|Résultat)\s*[:.]/i);
  if (!m || m.index === undefined) return text;
  return text.slice(0, m.index).trim();
}

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
