// src/components/Card.tsx
import { useEffect, useState } from "react";
import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import type { Scrutin } from "../types";
import { useFlipCardA11y } from "../hooks/useFlipCardA11y";

export interface CardProps {
  scrutin: Scrutin;
  topMost: boolean;       // is this the front card (interactive)?
  onSwipe?: (dir: "left" | "right" | "down") => void;
  onOpenMethode?: () => void;
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

export function Card({ scrutin, topMost, onSwipe, onOpenMethode }: CardProps) {
  const [flipped, setFlipped] = useState(false);
  // Which content shows on the back when flipped: the explanation (default,
  // triggered by tapping the card body) or the structured analyse (triggered
  // by the "+ analyse" button on the front).
  const [backVariant, setBackVariant] = useState<BackVariant>("explanation");

  const reducedMotion = useReducedMotion();
  const a11y = useFlipCardA11y({
    flipped,
    topMost,
    scrutin,
    onFlip: () => {
      setFlipped((f) => {
        if (!f) setBackVariant("explanation");
        return !f;
      });
    },
    onSwipe,
  });

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

  // Keyboard-only users can reach the back via Tab → Enter on "+ analyse"
  // but there's no pointer-free way back: framer-motion onTap doesn't fire
  // on keyboard events. ESC mirrors the modal-close convention.
  useEffect(() => {
    if (!topMost || !flipped) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFlipped(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [topMost, flipped]);

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
        // Allow vertical scroll inside the back face when flipped; lock to
        // gestures on the front so swipe-down works as expected.
        touchAction: topMost && !flipped ? "none" : "auto",
        perspective: 1500,
        height: "100%",
        outline: "none",
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
        {/* FRONT — the question. Chapeau + "+ analyse" button + title + footer. */}
        <div {...a11y.frontProps} style={{ ...FACE_STYLE, gap: 22, justifyContent: "space-between", height: "100%" }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
          }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 11,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "var(--accent)", fontWeight: 500,
              flex: 1,
            }}>
              {scrutin.chapeau}
              {topMost && onOpenMethode && (
                <>
                  {" · "}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onOpenMethode(); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label="Comment ce contenu a été préparé"
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
                  >✨IA</button>
                </>
              )}
            </div>
            {topMost && scrutin.analyse_loi && (
              // Only render the "+ analyse" button when there's actual
              // analyse data. Previously it stayed visible (muted ink-3)
              // and clicking it showed a "pas encore disponible" fallback
              // — a button that "looks disabled but isn't" is confusing.
              // No data = no entry point.
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); showAnalyse(); }}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="Voir l'analyse détaillée du scrutin"
                style={{
                  background: "transparent",
                  border: "1px solid var(--line)",
                  color: "var(--accent)",
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  padding: "6px 10px", borderRadius: 3,
                  cursor: "pointer", letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                  textTransform: "uppercase",
                }}
              >+ analyse</button>
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
            <span style={{ color: "var(--ink-2)" }}>tap pour détails<span aria-hidden="true"> ›</span></span>
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

          {/* The explanation variant keeps the big titre as anchor; the
              analyse variant goes lighter (the titre is already on the front
              the user just flipped from). */}
          {backVariant === "explanation" ? (
            <>
              <div style={{
                fontFamily: "var(--font-sans)", fontWeight: 600,
                fontSize: 18, lineHeight: 1.3, letterSpacing: "-0.012em",
                color: "var(--ink)",
              }}>{scrutin.titre_pedago}</div>
              <ExplanationBody scrutin={scrutin} />
            </>
          ) : (
            <>
              <div style={{
                fontFamily: "var(--font-sans)", fontWeight: 500,
                fontSize: 13, lineHeight: 1.35,
                color: "var(--ink-3)", textWrap: "pretty" as const,
              }}>{scrutin.titre_pedago}</div>
              <AnalyseBody scrutin={scrutin} />
              {/* IA attribution footer — only on the analyse variant since this face
               *  is 100% LLM-generated content (mesures, concernés, calendrier,
               *  exceptions all come from analyse_loi). */}
              <div style={{
                marginTop: 8, paddingTop: 8,
                borderTop: "1px dashed var(--line)",
                fontFamily: "var(--font-mono)", fontSize: 9.5,
                letterSpacing: "0.08em",
                color: "var(--ink-3)", textAlign: "center",
                lineHeight: 1.5,
              }}>
                Synthèse mise en forme par Claude,<br/>basée sur le libellé officiel AN.
              </div>
            </>
          )}

          {/* Shared footer */}
          <div style={{
            marginTop: "auto",
            paddingTop: 12, borderTop: "1px solid var(--line)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.04em",
          }}>
            <span style={{ color: "var(--ink-3)" }}><span aria-hidden="true">‹ </span>tap pour revenir</span>
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

      {/* Separation line between LLM-rendered summary and the raw AN libellé.
       *  Replaces the previous dashed top-border so the boundary is verbalised
       *  rather than just visual — désamorce le réflexe "biais IA". */}
      <div style={{
        paddingTop: 10, marginTop: 4,
        borderTop: "1px solid var(--line)",
        fontFamily: "var(--font-mono)", fontSize: 9.5,
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: "var(--ink-3)", textAlign: "center",
      }}>
        ↑ Résumé IA  ·  ↓ libellé officiel AN
      </div>

      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        color: "var(--ink-3)", letterSpacing: "0.04em",
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ColoredSection accent="var(--accent)" title="Mesures principales" bullets={a.mesures_principales} />

      <ColoredImpact
        positifs={a.concernes_positifs}
        negatifs={a.concernes_negatifs}
        neutres={a.concernes_neutres}
      />

      <ColoredSection accent="var(--warn)" title="Calendrier" bullets={a.calendrier} />

      <ColoredSection accent="var(--ink-3)" title="Exceptions et cas particuliers" bullets={a.exceptions} />
    </div>
  );
}

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
 *  the vote", which spoils the user's own vote and is off-topic.
 *
 *  Matches ONLY the colon form (`Vote :`, `Résultat :`) because that's the
 *  LLM's appendage style. Matching `.` would eat ordinary French usage like
 *  "passer un texte sans vote." which truncates the contexte mid-sentence. */
function stripVoteResult(text: string): string {
  const m = text.match(/\s+(Vote|Résultat)\s*:/i);
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
