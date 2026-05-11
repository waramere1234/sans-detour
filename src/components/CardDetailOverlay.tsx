// src/components/CardDetailOverlay.tsx
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Scrutin } from "../types";

export interface CardDetailOverlayProps {
  open: boolean;
  scrutin: Scrutin | null;
  onClose: () => void;
}

export function CardDetailOverlay({ open, scrutin, onClose }: CardDetailOverlayProps) {
  // Esc to dismiss (a11y) — mirror of RankingOverlay
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
            role="dialog" aria-modal="true" aria-label="Détails du scrutin"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            style={{
              position: "fixed", left: 0, right: 0, bottom: 0,
              maxHeight: "82dvh", overflow: "auto",
              background: "var(--bg)",
              borderTop: "1px solid var(--line)",
              borderRadius: "20px 20px 0 0",
              padding: "20px 22px 32px",
              zIndex: 101,
              display: "flex", flexDirection: "column", gap: 18,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 11,
                color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase",
              }}>
                Scrutin n° {scrutin.numero} · {new Date(scrutin.date).toLocaleDateString("fr-FR")}
              </span>
              <button type="button" onClick={onClose}
                style={{
                  background: "transparent", border: "1px solid var(--line)",
                  color: "var(--ink-2)", fontFamily: "var(--font-mono)",
                  fontSize: 11, padding: "4px 10px", borderRadius: 3, cursor: "pointer",
                }}>Fermer</button>
            </div>

            <Section eyebrow="Chapeau">
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 13,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "var(--accent)", fontWeight: 500,
              }}>{scrutin.chapeau}</span>
            </Section>

            <Section eyebrow="Reformulation pédagogique">
              <p style={{
                fontFamily: "var(--font-sans)", fontWeight: 600,
                fontSize: 18, lineHeight: 1.35, letterSpacing: "-0.012em",
                color: "var(--ink)", margin: 0,
              }}>{scrutin.titre_pedago}</p>
            </Section>

            <Section eyebrow="Contexte">
              <p style={{
                fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.55,
                color: "var(--ink-2)", margin: 0,
              }}>{scrutin.contexte || "Aucun contexte disponible pour ce scrutin."}</p>
            </Section>

            <Section eyebrow="Titre officiel (AN)">
              <p style={{
                fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.55,
                color: "var(--ink-2)", margin: 0,
              }}>{scrutin.titre_brut}</p>
            </Section>

            <Section eyebrow="Dossier législatif">
              <p style={{
                fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.55,
                color: "var(--ink-2)", margin: 0,
              }}>{scrutin.dossier_titre}</p>
            </Section>

            {scrutin.url_an_officielle && (
              <div style={{
                borderTop: "1px solid var(--line)",
                paddingTop: 14,
                display: "flex", justifyContent: "flex-end",
              }}>
                <a href={scrutin.url_an_officielle}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    fontFamily: "var(--font-mono)", fontSize: 11,
                    color: "var(--accent)", letterSpacing: "0.04em",
                    textDecoration: "none",
                  }}>Voir sur assemblee-nationale.fr ↗</a>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: "var(--ink-3)", fontWeight: 500,
      }}>{eyebrow}</span>
      {children}
    </div>
  );
}
