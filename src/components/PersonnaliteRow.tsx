// src/components/PersonnaliteRow.tsx
import { getPersonnalite } from "../lib/personnalites";
import { getPartyColorVar } from "../lib/parties";
import type { PersonnaliteAlignment } from "../types";

export interface PersonnaliteRowProps {
  alignment: PersonnaliteAlignment;
}

export function PersonnaliteRow({ alignment }: PersonnaliteRowProps) {
  const meta = getPersonnalite(alignment.personnalite);
  const color = getPartyColorVar(meta.group_code);
  const tooLittleData = alignment.counted < 3;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 12,
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid var(--line)",
        opacity: tooLittleData ? 0.55 : 1,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 120 }}>
        <span aria-hidden="true" style={{
          width: 8, height: 8, borderRadius: "50%", background: color,
        }} />
        <span style={{
          fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 500,
          color: "var(--ink)",
        }}>{meta.short_name}</span>
      </span>
      <span aria-hidden="true" style={{
        height: 5, background: "var(--bg-3)", borderRadius: 1,
        overflow: "hidden",
      }}>
        <span style={{
          display: "block", height: "100%",
          width: `${tooLittleData ? 0 : alignment.pct}%`, background: color,
        }} />
      </span>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 11.5,
        color: "var(--ink-2)", textAlign: "right",
        minWidth: 64,
      }}>
        {tooLittleData
          ? `— · ${alignment.counted} vote${alignment.counted === 1 ? "" : "s"}`
          : `${alignment.pct}% · ${alignment.counted}`}
      </span>
    </div>
  );
}
