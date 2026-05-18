import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { mailto, ERROR_REPORT_SUBJECT } from "../lib/contact";
import { ROUTES } from "../lib/routes";
import {
  MODAL_CLOSE_LABEL,
  METHODESHEET_AN_BLOCK_TITLE, METHODESHEET_CLAUDE_BLOCK_TITLE,
  METHODESHEET_TITLE,
  METHODESHEET_FULL_METHODE_LINK_LABEL, METHODESHEET_REPORT_ERROR_LINK_LABEL,
  METHODESHEET_CLAUDE_MISSION_STRONG,
  METHODESHEET_AN_BLOCK_BODY, METHODESHEET_CLAUDE_NO_AI_IN_SCORE,
  METHODESHEET_CLAUDE_TASKS_BODY, METHODESHEET_CLAUDE_PROMPT_NEUTRALITY_BODY,
  BUTTON_ARROW_RIGHT_PREFIX, BUTTON_ICON_MAIL,
  MODAL_CLOSE_GLYPH,
  METHODESHEET_BLOCK_EMOJI_AN, METHODESHEET_BLOCK_EMOJI_CLAUDE,
  METHODE_SHEET_BACKDROP_TESTID, METHODE_SHEET_TITLE_ID,
} from "../types";
import { useModalA11y } from "../hooks/useModalA11y";

export interface MethodeSheetProps {
  open: boolean;
  onClose: () => void;
}

/** Bottom-sheet « Comment c'est fait ? » triggered from the ✨IA chip on a
 *  Card recto. Modal dialog pattern (different from the TopBar menu, which
 *  is a popover): aria-modal, focus trap, ESC and backdrop close, focus
 *  restored to the opener (the chip) on close. */
export function MethodeSheet({ open, onClose }: MethodeSheetProps) {
  // Modal-a11y plumbing (ESC, body scroll lock, focus on open / restore on
  // close, Tab focus trap) lives in src/hooks/useModalA11y.ts and is shared
  // with RankingOverlay since session 98.
  const { dialogRef, closeBtnRef } = useModalA11y({ open, onClose });
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            data-testid={METHODE_SHEET_BACKDROP_TESTID}
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
            aria-labelledby={METHODE_SHEET_TITLE_ID}
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
              // Bottom padding includes safe-area-inset-bottom so the
              // primary/secondary buttons stay above the iOS home indicator
              // on PWA (same fix as RankingOverlay).
              padding: "22px var(--gutter) calc(28px + env(safe-area-inset-bottom, 0px))",
              display: "flex", flexDirection: "column", gap: 16,
            }}
          >
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderBottom: "1px solid var(--line)", paddingBottom: 12,
            }}>
              <h2 id={METHODE_SHEET_TITLE_ID} style={{
                margin: 0,
                fontFamily: "var(--font-mono)", fontSize: 11,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: "var(--ink-3)", fontWeight: 500,
              }}>{METHODESHEET_TITLE}</h2>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label={MODAL_CLOSE_LABEL}
                style={{
                  background: "transparent", border: "1px solid var(--line)",
                  color: "var(--ink-2)", borderRadius: 4,
                  width: 32, height: 32,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 14,
                  lineHeight: 1,
                }}
              >{MODAL_CLOSE_GLYPH}</button>
            </div>

            <Block emoji={METHODESHEET_BLOCK_EMOJI_AN} title={METHODESHEET_AN_BLOCK_TITLE}>
              {METHODESHEET_AN_BLOCK_BODY}
            </Block>

            <Block emoji={METHODESHEET_BLOCK_EMOJI_CLAUDE} title={METHODESHEET_CLAUDE_BLOCK_TITLE}>
              <p style={{ margin: "0 0 10px" }}>
                {METHODESHEET_CLAUDE_TASKS_BODY}
              </p>
              <p style={{ margin: "0 0 10px" }}>
                {METHODESHEET_CLAUDE_PROMPT_NEUTRALITY_BODY} <strong>{METHODESHEET_CLAUDE_MISSION_STRONG}</strong>
              </p>
              <p style={{ margin: 0 }}>
                {METHODESHEET_CLAUDE_NO_AI_IN_SCORE}
              </p>
            </Block>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              <Link
                to={ROUTES.methode}
                onClick={onClose}
                style={btnPrimary()}
              ><span aria-hidden="true">{BUTTON_ARROW_RIGHT_PREFIX}</span>{METHODESHEET_FULL_METHODE_LINK_LABEL}</Link>
              <a
                href={mailto(ERROR_REPORT_SUBJECT)}
                onClick={onClose}
                style={btnSecondary()}
              ><span aria-hidden="true">{BUTTON_ICON_MAIL}</span>{METHODESHEET_REPORT_ERROR_LINK_LABEL}</a>
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
