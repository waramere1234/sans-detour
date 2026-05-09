// src/components/ChipTop1.tsx
import { getParty, getPartyColorVar } from "../lib/parties";
import type { GroupCode } from "../types";

export interface ChipTop1Props {
  topGroup: GroupCode;
  pct: number;
  onTap: () => void;
}

export function ChipTop1({ topGroup, pct, onTap }: ChipTop1Props) {
  const color = getPartyColorVar(topGroup);
  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={`Top 1 actuel : ${getParty(topGroup).name} à ${pct} %. Toucher pour voir le classement complet.`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 11px",
        border: `1px solid ${color}`,
        background: "transparent",
        color,
        fontFamily: "var(--font-mono)",
        fontSize: 11.5,
        letterSpacing: "0.04em",
        fontWeight: 500,
        borderRadius: 3,
        cursor: "pointer",
      }}
    >
      <span aria-hidden="true" style={{
        width: 6, height: 6, borderRadius: "50%", background: color, flex: "0 0 auto",
      }} />
      <span style={{ color: "var(--ink)", fontWeight: 600 }}>{getParty(topGroup).short}</span>
      <span>{pct}%</span>
    </button>
  );
}
