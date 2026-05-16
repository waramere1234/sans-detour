// src/components/RankingOverlay.tsx
import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { GroupAlignment } from "../types";
import { PartyRow } from "./PartyRow";
import { rankByAlignment } from "../lib/matching";
import type { GroupCode } from "../types";

export interface RankingOverlayProps {
  open: boolean;
  alignments: Record<GroupCode, GroupAlignment>;
  countedTotal: number;
  onClose: () => void;
}

export function RankingOverlay({ open, alignments, countedTotal, onClose }: RankingOverlayProps) {
  const ranked = rankByAlignment(alignments);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  // Esc to dismiss the modal (a11y) + lock body scroll while open so the
  // backdrop doesn't pass through to the underlying /play deck.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // Save opener + focus close button on open, restore on close. Pairs with
  // aria-modal="true" so the modal actually behaves like a modal for
  // keyboard users (otherwise the aria attribute lies about behavior).
  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement as HTMLElement | null;
      const id = requestAnimationFrame(() => closeBtnRef.current?.focus());
      return () => cancelAnimationFrame(id);
    } else {
      openerRef.current?.focus();
    }
  }, [open]);

  // Focus trap: cycle Tab within the dialog so users can't tab into the
  // underlying /play deck while the modal is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = dialog.querySelectorAll<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])',
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.16 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0,
              background: "oklch(0.10 0.01 250 / 0.7)",
              backdropFilter: "blur(2px)",
              zIndex: 100,
            }}
          />
          <motion.div
            ref={dialogRef}
            role="dialog" aria-modal="true" aria-label="Classement partiel"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={reducedMotion
              ? { duration: 0 }
              : { type: "spring", damping: 30, stiffness: 280 }}
            style={{
              position: "fixed", left: 0, right: 0, bottom: 0,
              maxHeight: "82dvh", overflow: "auto",
              background: "var(--bg)",
              borderTop: "1px solid var(--line)",
              borderRadius: "20px 20px 0 0",
              // The sheet's visible bottom edge is at viewport y = 100dvh on
              // iOS PWA, which lands on/under the home indicator (~34px tall).
              // Add the safe-area inset to the bottom padding so the last
              // PartyRow stays above the indicator.
              padding: "20px 22px calc(32px + env(safe-area-inset-bottom, 0px))",
              zIndex: 101,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 11,
                color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase",
              }}>Classement partiel · {countedTotal} comptés</span>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                style={{
                  background: "transparent", border: "1px solid var(--line)",
                  color: "var(--ink-2)", fontFamily: "var(--font-mono)",
                  fontSize: 11, padding: "4px 10px", borderRadius: 3, cursor: "pointer",
                }}>Fermer</button>
            </div>
            {ranked.map(a => (
              <PartyRow key={a.group} alignment={a} />
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
