// src/components/AuditTrail.tsx
import type { GroupAlignment, Scrutin, SessionVote } from "../types";
import { alignmentScore } from "../lib/matching";

export interface AuditTrailProps {
  alignment: GroupAlignment;
  scrutins: Scrutin[];
  votes: SessionVote[];
}

export function AuditTrail({ alignment, scrutins, votes }: AuditTrailProps) {
  const byId = new Map(scrutins.map(s => [s.id, s]));

  const rows = votes
    .filter(v => v.choice !== "skip")
    .map(v => {
      const sc = byId.get(v.scrutin_id);
      if (!sc) return null;
      const groupPos = sc.position_par_groupe[alignment.group];
      if (!groupPos) return null;
      const score = alignmentScore(v.choice, groupPos);
      let icon = "—";
      let color = "var(--ink-3)";
      if (score === null) { icon = "÷"; color = "var(--ink-4)"; }
      else if (score === 1) { icon = "✓"; color = "var(--pour)"; }
      else if (score === 0.5) { icon = "≈"; color = "var(--warn)"; }
      else if (score === 0) { icon = "✕"; color = "var(--contre)"; }
      return { v, sc, groupPos, score, icon, color };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <div style={{
      background: "var(--bg-2)",
      border: "1px solid var(--line)",
      borderRadius: 6,
      padding: "12px 14px",
      margin: "4px 0 12px",
      fontSize: 12,
      lineHeight: 1.5,
    }}>
      <div style={{ display: "flex", gap: 14, marginBottom: 10, flexWrap: "wrap" }}>
        <span><span style={{ color: "var(--pour)" }}>✓ {alignment.perfect}</span> alignés</span>
        <span><span style={{ color: "var(--warn)" }}>≈ {alignment.partial}</span> partiels</span>
        <span><span style={{ color: "var(--contre)" }}>✕ {alignment.conflict}</span> opposés</span>
        <span style={{ color: "var(--ink-3)" }}>÷ {alignment.divided_excluded} divisé non comptés</span>
      </div>
      {rows.map(r => (
        <div key={r.v.scrutin_id} style={{
          display: "grid", gridTemplateColumns: "20px 1fr auto",
          alignItems: "baseline", gap: 8,
          padding: "6px 0", borderTop: "1px dashed var(--line)",
        }}>
          <span style={{ color: r.color, fontWeight: 600 }}>{r.icon}</span>
          <span style={{ color: "var(--ink)" }}>{r.sc.titre_pedago}</span>
          {r.sc.url_an_officielle ? (
            <a href={r.sc.url_an_officielle} target="_blank" rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-mono)", fontSize: 10,
                color: "var(--ink-3)", letterSpacing: "0.04em", textDecoration: "none",
              }}>AN ↗</a>
          ) : (
            <span title="Donnée de démonstration — sera remplacée par les vrais scrutins de l'AN une fois le pipeline d'ingestion en production"
              style={{
                fontFamily: "var(--font-mono)", fontSize: 10,
                color: "var(--ink-4)", letterSpacing: "0.04em",
              }}>démo</span>
          )}
        </div>
      ))}
    </div>
  );
}
