// src/components/RankingOverlay.tsx
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { GroupAlignment } from "../types";
import { PartyRow } from "./PartyRow";
import { rankByAlignment } from "../lib/matching";
import type { GroupCode } from "../types";
import { useModalA11y } from "../hooks/useModalA11y";

export interface RankingOverlayProps {
  open: boolean;
  alignments: Record<GroupCode, GroupAlignment>;
  countedTotal: number;
  onClose: () => void;
}

export function RankingOverlay({ open, alignments, countedTotal, onClose }: RankingOverlayProps) {
  const ranked = rankByAlignment(alignments);
  // Modal-a11y plumbing (ESC, body scroll lock, focus on open / restore on
  // close, Tab focus trap) lives in src/hooks/useModalA11y.ts and is shared
  // with MethodeSheet since session 98.
  const { dialogRef, closeBtnRef } = useModalA11y({ open, onClose });
  const reducedMotion = useReducedMotion();

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
              }}>Classement partiel · {countedTotal} compté{countedTotal !== 1 ? "s" : ""}</span>
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
