// src/components/TopBar.tsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wordmark } from "./Wordmark";
import { loadSession } from "../lib/session";

const MIN_FOR_RESULT_LINK = 5;

/** Top bar shown on every page except the Cover, which has its own rich
 *  header. Wordmark on the left links to home, "•••" button on the right
 *  opens the secondary nav as a bottom sheet so the legal / méthode /
 *  contact links don't eat persistent screen space. */
export function TopBar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // The Cover already shows a styled wordmark + data source line in its
  // own header. Stacking the TopBar on top of it would duplicate the
  // wordmark, so we skip it there.
  if (location.pathname === "/") return null;

  return (
    <>
      <header className="sd-topbar" style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "var(--bg)",
        borderBottom: "1px solid var(--line)",
        padding: "10px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Link to="/" aria-label="Accueil" style={{ textDecoration: "none", color: "inherit" }}>
          <Wordmark size={12} />
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Ouvrir le menu"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          style={{
            background: "transparent",
            border: "1px solid var(--line)",
            color: "var(--ink-2)",
            borderRadius: 4,
            padding: "4px 12px",
            fontFamily: "var(--font-mono)", fontSize: 14,
            cursor: "pointer", lineHeight: 1,
            letterSpacing: "0.04em",
          }}
        >
          •••
        </button>
      </header>
      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function MenuSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const session = loadSession();
  const votes = session?.votes.length ?? 0;
  const showResultLink = votes >= MIN_FOR_RESULT_LINK && location.pathname !== "/result";

  // Close on Escape + lock body scroll while the sheet is open so the
  // backdrop doesn't scroll the underlying page.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
              zIndex: 20,
            }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            style={{
              position: "fixed", left: 0, right: 0, bottom: 0,
              zIndex: 21,
              background: "var(--bg-2)",
              borderTop: "1px solid var(--line)",
              borderTopLeftRadius: 14, borderTopRightRadius: 14,
              padding: "20px 22px 28px",
              maxWidth: 480, margin: "0 auto",
              display: "flex", flexDirection: "column", gap: 18,
            }}
          >
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              paddingBottom: 14, borderBottom: "1px solid var(--line)",
            }}>
              <Wordmark size={14} />
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer le menu"
                style={{
                  background: "transparent", border: "none",
                  color: "var(--ink-2)", cursor: "pointer",
                  fontFamily: "var(--font-mono)", fontSize: 14,
                  padding: "4px 10px",
                  letterSpacing: "0.04em",
                }}
              >
                fermer ✕
              </button>
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {showResultLink && (
                <MenuLink
                  to="/result"
                  label={`Mon résultat (${votes})`}
                  accent
                  onNavigate={onClose}
                />
              )}
              <MenuLink to="/methode" label="Méthode & sources" onNavigate={onClose} />
              <MenuLink to="/legal" label="Mentions légales" onNavigate={onClose} />
              <MenuLink href="mailto:contact@sansdetour.fr" label="Contact" />
            </nav>

            <p style={{
              margin: 0,
              fontFamily: "var(--font-mono)", fontSize: 10,
              color: "var(--ink-3)", letterSpacing: "0.04em",
              borderTop: "1px solid var(--line)", paddingTop: 12,
            }}>
              sansdetour.fr · v2 · données data.assemblee-nationale.fr
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MenuLink(props: {
  to?: string;
  href?: string;
  label: string;
  accent?: boolean;
  onNavigate?: () => void;
}) {
  const style = {
    display: "block",
    fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 500,
    color: props.accent ? "var(--accent)" : "var(--ink)",
    textDecoration: "none",
    padding: "14px 0",
    borderBottom: "1px solid var(--line)",
    letterSpacing: "-0.005em",
  } as const;
  if (props.href) {
    return <a href={props.href} style={style}>{props.label} ↗</a>;
  }
  return (
    <Link to={props.to!} style={style} onClick={props.onNavigate}>
      {props.label}
    </Link>
  );
}
