// src/components/PartyRow.tsx
import { getParty, getPartyColorVar } from "../lib/parties";
import type { GroupAlignment } from "../types";

export interface PartyRowProps {
  alignment: GroupAlignment;
  expanded?: boolean;
  onClick?: () => void;
  /** When interactive and expanded, the id of the AuditTrail panel this
   *  row controls — wired into aria-controls so SR users learn which
   *  region the toggle opens/closes. */
  controlsId?: string;
}

export function PartyRow({ alignment, expanded, onClick, controlsId }: PartyRowProps) {
  const meta = getParty(alignment.group);
  const color = getPartyColorVar(alignment.group);
  const interactive = !!onClick;
  // Compose a single readable label so SR users don't hear three
  // disconnected fragments ("LFI · 25 % · 8") — they hear one sentence.
  const rowLabel = `${meta.name}, ${alignment.pct} % d'alignement sur ${alignment.counted} scrutin${alignment.counted === 1 ? "" : "s"} compté${alignment.counted === 1 ? "" : "s"}`;

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={interactive ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick!();
        }
      } : undefined}
      aria-expanded={interactive ? expanded : undefined}
      aria-controls={interactive ? controlsId : undefined}
      aria-label={rowLabel}
      style={{
        display: "grid",
        gridTemplateColumns: "60px 1fr 44px",
        gap: 12,
        alignItems: "center",
        padding: "12px 0",
        cursor: interactive ? "pointer" : "default",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 12,
        color: "var(--ink)", letterSpacing: "0.04em",
      }}>{meta.short}</span>
      <span aria-hidden="true" style={{
        height: 6, background: "var(--bg-3)", borderRadius: 1,
        overflow: "hidden", position: "relative",
      }}>
        <span style={{
          display: "block", height: "100%",
          width: `${alignment.pct}%`, background: color,
        }} />
      </span>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 12,
        color: "var(--ink-2)", textAlign: "right",
      }}>{alignment.pct}%</span>
    </div>
  );
}
