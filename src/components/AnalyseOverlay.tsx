// src/components/AnalyseOverlay.tsx
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Scrutin } from "../types";

export interface AnalyseOverlayProps {
  open: boolean;
  scrutin: Scrutin | null;
  onClose: () => void;
}

export function AnalyseOverlay({ open, scrutin, onClose }: AnalyseOverlayProps) {
  // Esc to dismiss (a11y) — mirrors RankingOverlay
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && scrutin && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0,
              background: "oklch(0.10 0.01 250 / 0.7)",
              backdropFilter: "blur(2px)",
              zIndex: 100,
            }}
          />
          <motion.div
            role="dialog" aria-modal="true" aria-label="Analyse du scrutin"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            style={{
              position: "fixed", left: 0, right: 0, bottom: 0,
              maxHeight: "85dvh", overflow: "auto",
              background: "var(--bg)",
              borderTop: "1px solid var(--line)",
              borderRadius: "20px 20px 0 0",
              padding: "20px 22px 32px",
              zIndex: 101,
              display: "flex", flexDirection: "column", gap: 18,
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "baseline",
              paddingBottom: 10, borderBottom: "1px solid var(--line)",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "var(--ink-3)",
                }}>
                  Analyse · n° {scrutin.numero} · {new Date(scrutin.date).toLocaleDateString("fr-FR")}
                </span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 11,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "var(--accent)", fontWeight: 500,
                }}>{scrutin.chapeau}</span>
              </div>
              <button type="button" onClick={onClose}
                style={{
                  background: "transparent", border: "1px solid var(--line)",
                  color: "var(--ink-2)", fontFamily: "var(--font-mono)",
                  fontSize: 11, padding: "4px 10px", borderRadius: 3, cursor: "pointer",
                }}>Fermer</button>
            </div>

            {/* Title — same wording as front for orientation */}
            <div style={{
              fontFamily: "var(--font-sans)", fontWeight: 600,
              fontSize: 18, lineHeight: 1.3, letterSpacing: "-0.012em",
              color: "var(--ink)",
            }}>{scrutin.titre_pedago}</div>

            {scrutin.analyse ? (
              <>
                <Section title="Mesures principales" bullets={scrutin.analyse.mesures_principales} />
                <DoubleSection
                  positifs={scrutin.analyse.concernes_positifs}
                  negatifs={scrutin.analyse.concernes_negatifs}
                  neutres={scrutin.analyse.concernes_neutres}
                />
                <Section title="Calendrier" bullets={scrutin.analyse.calendrier} />
                <Section title="Exceptions et cas particuliers" bullets={scrutin.analyse.exceptions} />
              </>
            ) : (
              <div style={{
                background: "var(--bg-2)",
                border: "1px dashed var(--line)",
                borderRadius: 6,
                padding: "20px 18px",
                fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.55,
                color: "var(--ink-2)", textAlign: "center",
              }}>
                Analyse détaillée pas encore disponible pour ce scrutin.<br/>
                <span style={{ color: "var(--ink-3)", fontSize: 11.5 }}>
                  Sera générée au prochain run du pipeline d'ingestion.
                </span>
              </div>
            )}

            {/* Footer with AN link */}
            <div style={{
              marginTop: "auto",
              paddingTop: 12, borderTop: "1px solid var(--line)",
              display: "flex", justifyContent: "flex-end", alignItems: "center",
              fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.04em",
            }}>
              {scrutin.url_an_officielle ? (
                <a href={scrutin.url_an_officielle}
                  target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--accent)", textDecoration: "none" }}>
                  Voir le texte sur AN ↗
                </a>
              ) : (
                <span style={{ color: "var(--ink-4)" }}>donnée démo</span>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, bullets }: { title: string; bullets: string[] }) {
  if (bullets.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--ink-3)", fontWeight: 500,
      }}>{title}</span>
      <ul style={{
        margin: 0, paddingLeft: 18,
        display: "flex", flexDirection: "column", gap: 6,
      }}>
        {bullets.map((b, i) => (
          <li key={i} style={{
            fontFamily: "var(--font-sans)", fontSize: 13.5, lineHeight: 1.55,
            color: "var(--ink-2)", textWrap: "pretty" as const,
          }}>
            {renderWithBold(stripCitations(b))}
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
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
      paddingLeft: 12,
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 9.5,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: accent, fontWeight: 500,
      }}>{label}</span>
      <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
        {bullets.map((b, i) => (
          <li key={i} style={{
            fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.55,
            color: "var(--ink-2)", textWrap: "pretty" as const,
          }}>
            {renderWithBold(stripCitations(b))}
          </li>
        ))}
      </ul>
    </div>
  );
}

// — Shared helpers (also live in Card.tsx). Inline here to keep AnalyseOverlay
// self-contained; could be hoisted to src/lib/text-format.ts later. —

function stripCitations(text: string): string {
  return text
    .replace(/<cite[^>]*>([\s\S]*?)<\/cite>/g, "$1")
    .replace(/<\/?cite[^>]*>/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

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
