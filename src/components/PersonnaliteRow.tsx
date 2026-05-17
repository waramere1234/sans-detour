// src/components/PersonnaliteRow.tsx
import { getPersonnalite } from "../lib/personnalites";
import { getPartyColorVar } from "../lib/parties";
import {
  LOW_DATA_THRESHOLD, personnaliteRowAriaLabel, personnaliteRowRightColumnText,
  type PersonnaliteAlignment,
} from "../types";

export interface PersonnaliteRowProps {
  alignment: PersonnaliteAlignment;
}

export function PersonnaliteRow({ alignment }: PersonnaliteRowProps) {
  const meta = getPersonnalite(alignment.personnalite);
  const color = getPartyColorVar(meta.group_code);
  const tooLittleData = alignment.counted < LOW_DATA_THRESHOLD;
  // Same SR-friendly composition as PartyRow (session 25) — SR reads one
  // sentence instead of three disconnected fragments ("Le Pen 57 % 12").
  // The low-data path drops the percent to avoid implying a real score
  // on a 1-2 vote sample.
  const rowLabel = personnaliteRowAriaLabel(meta.display_name, alignment.pct, alignment.counted, tooLittleData);

  return (
    <div
      aria-label={rowLabel}
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
        {personnaliteRowRightColumnText(alignment.pct, alignment.counted, tooLittleData)}
      </span>
    </div>
  );
}
