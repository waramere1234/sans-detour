import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

export interface MethodeSheetProps {
  open: boolean;
  onClose: () => void;
}

/** Bottom-sheet « Comment c'est fait ? » triggered from the ✨IA chip on a
 *  Card recto. Modal dialog pattern (different from the TopBar menu, which
 *  is a popover): aria-modal, focus trap, ESC and backdrop close, focus
 *  restored to the opener (the chip) on close. */
export function MethodeSheet({ open, onClose }: MethodeSheetProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  // Save the opener so we can restore focus when the sheet closes
  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement as HTMLElement | null;
      const id = requestAnimationFrame(() => closeBtnRef.current?.focus());
      return () => cancelAnimationFrame(id);
    } else {
      openerRef.current?.focus();
    }
  }, [open]);

  // ESC handler
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Focus trap: cycle Tab within dialog
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = dialog.querySelectorAll<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            data-testid="methode-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.16 }}
            onClick={onClose}
            aria-hidden="true"
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 40,
            }}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="methode-sheet-title"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={reducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 380, damping: 32 }}
            style={{
              position: "fixed",
              left: 0, right: 0, bottom: 0,
              maxHeight: "85dvh",
              overflow: "auto",
              background: "var(--bg-2)",
              borderTop: "1px solid var(--line)",
              borderRadius: "14px 14px 0 0",
              zIndex: 41,
              padding: "22px var(--gutter) 28px",
              display: "flex", flexDirection: "column", gap: 16,
            }}
          >
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderBottom: "1px solid var(--line)", paddingBottom: 12,
            }}>
              <h2 id="methode-sheet-title" style={{
                margin: 0,
                fontFamily: "var(--font-mono)", fontSize: 11,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: "var(--ink-3)", fontWeight: 500,
              }}>Comment c'est fait ?</h2>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                style={{
                  background: "transparent", border: "1px solid var(--line)",
                  color: "var(--ink-2)", borderRadius: 4,
                  width: 32, height: 32,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 14,
                  lineHeight: 1,
                }}
              >✕</button>
            </div>

            <Block emoji="📊" title="AN officiel">
              Date, numéro, vote des députés, libellé brut du scrutin,
              position des groupes parlementaires.
            </Block>

            <Block emoji="✨" title="Mis en forme par IA Claude">
              <p style={{ margin: "0 0 10px" }}>
                Le titre court reformulé, les points clés, le résumé, la
                synthèse du texte officiel.
              </p>
              <p style={{ margin: "0 0 10px" }}>
                Claude reçoit le libellé brut de l'AN + des résultats de
                recherche web. Pas d'opinion humaine ni d'orientation
                politique dans son prompt. <strong>Sa mission : rendre lisible,
                pas commenter.</strong>
              </p>
              <p style={{ margin: 0 }}>
                Le calcul d'alignement, lui, est une formule mathématique
                pure — aucune IA dans le score.
              </p>
            </Block>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              <Link
                to="/methode"
                onClick={onClose}
                style={btnPrimary()}
              ><span aria-hidden="true">→ </span>Méthode complète</Link>
              <a
                href="mailto:contact@sansdetour.fr?subject=Sans%20D%C3%A9tour%20%E2%80%94%20Signalement%20d%27une%20erreur%20factuelle"
                onClick={onClose}
                style={btnSecondary()}
              ><span aria-hidden="true">✉ </span>Signaler une erreur factuelle</a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Block({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* h3 (under MethodeSheet's h2 "Comment c'est fait ?"). Emoji wrapped
        in aria-hidden span so SR doesn't read "outbox tray AN officiel" /
        "sparkles Mis en forme par IA Claude" — emojis are decorative. */}
      <h3 style={{
        fontFamily: "var(--font-mono)", fontSize: 10.5,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: "var(--accent)", fontWeight: 600,
        margin: 0,
      }}><span aria-hidden="true">{emoji} </span>{title}</h3>
      <div style={{
        fontFamily: "var(--font-sans)", fontSize: 13.5, lineHeight: 1.55,
        color: "var(--ink-2)", textWrap: "pretty" as const,
      }}>{children}</div>
    </div>
  );
}

function btnPrimary(): React.CSSProperties {
  return {
    background: "var(--accent)", color: "var(--bg)",
    textAlign: "center", textDecoration: "none",
    padding: "12px 16px", borderRadius: 6,
    fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14,
  };
}
function btnSecondary(): React.CSSProperties {
  return {
    background: "transparent", color: "var(--ink)",
    border: "1px solid var(--line)",
    textAlign: "center", textDecoration: "none",
    padding: "12px 16px", borderRadius: 6,
    fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 13.5,
  };
}
