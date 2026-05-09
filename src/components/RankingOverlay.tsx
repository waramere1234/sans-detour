// src/components/RankingOverlay.tsx
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  // Esc to dismiss the modal (a11y)
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
      {open && (
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
            role="dialog" aria-modal="true" aria-label="Classement partiel"
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
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 11,
                color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase",
              }}>Classement partiel · {countedTotal} comptés</span>
              <button type="button" onClick={onClose}
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
