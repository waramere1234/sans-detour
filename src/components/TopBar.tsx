// src/components/TopBar.tsx
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Wordmark } from "./Wordmark";
import { loadSession } from "../lib/session";
import { track } from "../lib/analytics";
import { FROM_LOGO_STATE } from "../lib/nav-state";
import { mailto } from "../lib/contact";
import { ROUTES } from "../lib/routes";
import {
  MIN_FOR_RANKING, PROD_HOSTNAME, WORDMARK_HOME_LABEL,
  MENU_RESULT_LABEL, MENU_METHODE_LABEL, MENU_LEGAL_LABEL, MENU_CONTACT_LABEL,
  MENU_OPEN_LABEL, MENU_CLOSE_LABEL, MAIN_MENU_LABEL,
  TOPBAR_VERSION_LABEL,
  EXTERNAL_LINK_GLYPH,
} from "../types";


/** Top bar shown on every page except the Cover. Wordmark on the left
 *  links to home; "•••" on the right toggles an anchored popover menu
 *  (one tap opens, another closes). The popover hugs the trigger via a
 *  small tail so the menu reads as part of the button, not a separate
 *  modal — short throw, low ceremony. */
export function TopBar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const prevOpenRef = useRef(menuOpen);

  // Restore focus to trigger when menu closes (ESC, backdrop, route nav)
  useEffect(() => {
    if (prevOpenRef.current && !menuOpen) {
      triggerRef.current?.focus();
    }
    prevOpenRef.current = menuOpen;
  }, [menuOpen]);

  // Auto-close on route change so a navigation from a menu link can
  // never leave a stale-open popover behind.
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // The Cover already shows its own header.
  if (location.pathname === ROUTES.cover) return null;

  return (
    <header className="sd-topbar" style={{
      position: "sticky",
      // top respects iOS safe-area-inset-top so when the user scrolls and
      // the bar becomes stuck, it lands BELOW the notch rather than under
      // it (where the wordmark + ••• would be obscured on iPhone X+ in
      // standalone PWA mode). body has matching padding-top in index.css
      // for the pre-scroll layout, so the bar stays consistently below
      // the notch in both states.
      top: "env(safe-area-inset-top, 0px)",
      // Above DeckStack cards (z-index 10) and their framer-motion transforms.
      zIndex: 30,
      background: "var(--bg)",
      borderBottom: "1px solid var(--line)",
    }}>
      <div style={{
        maxWidth: "var(--max-content)",
        margin: "0 auto",
        padding: "8px var(--gutter)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative", // anchor for the popover
      }}>
        <Link
          to={ROUTES.cover}
          state={FROM_LOGO_STATE}
          aria-label={WORDMARK_HOME_LABEL}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Wordmark />
        </Link>

        <MenuTrigger
          triggerRef={triggerRef}
          open={menuOpen}
          onToggle={() => setMenuOpen((o) => !o)}
        />

        <MenuPopover
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
      </div>
    </header>
  );
}

function MenuTrigger({
  triggerRef, open, onToggle,
}: {
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={onToggle}
      aria-label={open ? MENU_CLOSE_LABEL : MENU_OPEN_LABEL}
      aria-haspopup="menu"
      aria-expanded={open}
      style={{
        background: open ? "var(--accent-soft)" : "transparent",
        border: `1px solid ${open ? "var(--accent-line)" : "var(--line)"}`,
        color: open ? "var(--accent)" : "var(--ink-2)",
        borderRadius: 4,
        padding: "11px 14px",
        fontFamily: "var(--font-mono)", fontSize: 14,
        cursor: "pointer", lineHeight: 1,
        letterSpacing: "0.04em",
        transition: "color 140ms ease, background 140ms ease, border-color 140ms ease",
        // Above the popover backdrop so a tap on the trigger toggles
        // (rather than being eaten by the backdrop click-catcher).
        position: "relative", zIndex: 32,
      }}
    >
      •••
    </button>
  );
}

function MenuPopover({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const session = loadSession();
  const votes = session?.votes.length ?? 0;
  const showResultLink = votes >= MIN_FOR_RANKING && location.pathname !== ROUTES.result;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Invisible click-catcher: any tap outside the popover (and the
              trigger, which sits above this via z-index) closes the menu. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.12 }}
            onClick={onClose}
            aria-hidden="true"
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.18)",
              zIndex: 25,
            }}
          />
          <motion.div
            role="menu"
            aria-label={MAIN_MENU_LABEL}
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={reducedMotion
              ? { duration: 0 }
              : { duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: "var(--gutter)",
              width: "min(260px, calc(100vw - 2 * var(--gutter)))",
              background: "var(--bg-2)",
              border: "1px solid var(--line-2)",
              borderRadius: 6,
              // Layered shadow + faint inner highlight so the popover lifts
              // off the page without resorting to a heavy modal scrim.
              boxShadow:
                "0 18px 40px -14px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.25)",
              zIndex: 31,
              padding: 6,
              display: "flex",
              flexDirection: "column",
              transformOrigin: "top right",
            }}
          >
            {/* Tail/arrow pointing up at the trigger. Built from two borders
                rotated 45° so it inherits --line-2 cleanly. */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: -6,
                right: 16,
                width: 10, height: 10,
                background: "var(--bg-2)",
                borderTop: "1px solid var(--line-2)",
                borderLeft: "1px solid var(--line-2)",
                transform: "rotate(45deg)",
              }}
            />

            {/* aria-current="page" on the link matching the current route
                so SR users know they're already on it — otherwise the menu
                advertises 4 destinations as equivalent even when one is
                the page in front of them. */}
            <nav style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {showResultLink && (
                <MenuLink
                  to={ROUTES.result}
                  label={MENU_RESULT_LABEL}
                  badge={String(votes)}
                  accent
                  onNavigate={() => { track("topbar_nav", { target: "result" }); onClose(); }}
                />
              )}
              <MenuLink
                to={ROUTES.methode}
                label={MENU_METHODE_LABEL}
                current={location.pathname === ROUTES.methode}
                onNavigate={() => { track("topbar_nav", { target: "methode" }); onClose(); }}
              />
              <MenuLink
                to={ROUTES.legal}
                label={MENU_LEGAL_LABEL}
                current={location.pathname === ROUTES.legal}
                onNavigate={() => { track("topbar_nav", { target: "legal" }); onClose(); }}
              />
              <MenuLink
                href={mailto()}
                label={MENU_CONTACT_LABEL}
                external
                onNavigate={() => { track("topbar_nav", { target: "contact" }); onClose(); }}
              />
            </nav>

            <div style={{
              marginTop: 6,
              borderTop: "1px solid var(--line)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              // shorthand `padding` declared once — the previous `paddingTop: 8`
              // here was silently overridden by the shorthand below and never
              // applied. The 10px top in the shorthand is the value that
              // actually rendered.
              padding: "10px 10px 4px",
              fontFamily: "var(--font-mono)", fontSize: 9.5,
              color: "var(--ink-3)", letterSpacing: "0.10em", textTransform: "uppercase",
            }}>
              <span>{PROD_HOSTNAME}</span>
              <span>{TOPBAR_VERSION_LABEL}</span>
            </div>
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
  badge?: string;
  accent?: boolean;
  external?: boolean;
  /** True when this link points at the route the user is already on —
   *  drives aria-current="page" so SR users know they're on it, and
   *  visually tones the label down to ink-3. */
  current?: boolean;
  onNavigate?: () => void;
}) {
  const style: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 500,
    color: props.accent
      ? "var(--accent)"
      : props.current ? "var(--ink-3)" : "var(--ink)",
    textDecoration: "none",
    padding: "10px 12px",
    borderRadius: 4,
    letterSpacing: "-0.005em",
  };

  const inner = (
    <>
      <span>{props.label}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {props.badge && (
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "var(--accent)", letterSpacing: "0.06em",
            background: "var(--accent-soft)",
            padding: "2px 6px", borderRadius: 3,
            lineHeight: 1,
          }}>{props.badge}</span>
        )}
        {props.external && (
          <span aria-hidden="true" style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--ink-3)",
          }}>{EXTERNAL_LINK_GLYPH}</span>
        )}
      </span>
    </>
  );

  if (props.href) {
    return (
      <a
        className="sd-menu-item"
        href={props.href}
        role="menuitem"
        style={style}
        onClick={props.onNavigate}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link
      className="sd-menu-item"
      to={props.to!}
      role="menuitem"
      aria-current={props.current ? "page" : undefined}
      style={style}
      onClick={props.onNavigate}
    >
      {inner}
    </Link>
  );
}
