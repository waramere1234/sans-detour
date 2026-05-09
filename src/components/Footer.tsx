// src/components/Footer.tsx
import { Link } from "react-router-dom";
import { Wordmark } from "./Wordmark";

export interface FooterProps {
  freshness?: { lastSyncAt: string; total: number };
}

function formatRelativeFr(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86400_000);
  if (days < 1) return "aujourd'hui";
  if (days === 1) return "il y a 1 j";
  return `il y a ${days} j`;
}

export function Footer({ freshness }: FooterProps) {
  return (
    <footer
      className="sd-footer"
      style={{
        borderTop: "1px solid var(--line)",
        padding: "16px 22px",
        display: "flex",
        flexWrap: "wrap",
        gap: "14px",
        alignItems: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "var(--ink-3)",
        letterSpacing: "0.06em",
      }}
    >
      <Wordmark size={12} />
      <Link to="/methode" style={{ color: "var(--ink-2)", textDecoration: "none" }}>Méthode &amp; sources</Link>
      <Link to="/legal" style={{ color: "var(--ink-2)", textDecoration: "none" }}>Mentions légales</Link>
      <a href="mailto:contact@sansdetour.fr" style={{ color: "var(--ink-2)", textDecoration: "none" }}>contact</a>
      {freshness && (
        <span style={{ marginLeft: "auto" }}>
          v1 · MAJ {formatRelativeFr(freshness.lastSyncAt)}
        </span>
      )}
    </footer>
  );
}
