// src/components/AuditTrail.tsx
import type { GroupAlignment, Scrutin, SessionVote } from "../types";
import { alignmentScore } from "../lib/matching";
import { getParty } from "../lib/parties";

export interface AuditTrailProps {
  alignment: GroupAlignment;
  scrutins: Scrutin[];
  votes: SessionVote[];
  /** Optional DOM id for the wrapping section — used by callers (Result.tsx)
   *  that need aria-controls pairing with the toggle that opens this panel. */
  id?: string;
}

export function AuditTrail({ alignment, scrutins, votes, id }: AuditTrailProps) {
  const byId = new Map(scrutins.map(s => [s.id, s]));
  const partyName = getParty(alignment.group).name;

  const rows = votes
    .filter(v => v.choice !== "skip")
    .map(v => {
      const sc = byId.get(v.scrutin_id);
      if (!sc) return null;
      const groupPos = sc.position_par_groupe[alignment.group];
      if (!groupPos) return null;
      // alignmentScore returns exactly one of {null, 0, 0.5, 1} — every
      // case mapped below, so no fallback needed.
      const score = alignmentScore(v.choice, groupPos);
      let icon: string;
      let color: string;
      let label: string;
      if (score === null) { icon = "÷"; color = "var(--ink-4)"; label = "Groupe divisé, non compté"; }
      else if (score === 1) { icon = "✓"; color = "var(--pour)"; label = "Aligné"; }
      else if (score === 0.5) { icon = "≈"; color = "var(--warn)"; label = "Partiel"; }
      else { icon = "✕"; color = "var(--contre)"; label = "Opposé"; }
      return { v, sc, groupPos, score, icon, color, label };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    // role=region + aria-labelledby so the audit trail becomes a proper
    // a11y landmark — SR users tabbing/jumping in hear "Détail des votes
    // pour [groupe], region" instead of an unlabeled div.
    <section
      id={id}
      role="region"
      aria-labelledby={`audit-heading-${alignment.group}`}
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--line)",
        borderRadius: 6,
        padding: "12px 14px",
        margin: "4px 0 12px",
        fontSize: 12,
        lineHeight: 1.5,
      }}
    >
      {/* Party full name header. h3 because the AuditTrail panel is a
        deep-detail section under Result.tsx's h1 + future h2 grouping —
        nesting keeps the heading rotor navigable for SR users. */}
      <h3
        id={`audit-heading-${alignment.group}`}
        style={{
          fontFamily: "var(--font-sans)", fontWeight: 600,
          fontSize: 14, color: "var(--ink)",
          margin: "0 0 4px",
        }}
      >
        {alignment.group} <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>· {partyName}</span>
      </h3>

      {/* Breakdown chips */}
      <div style={{
        display: "flex", gap: 14, marginBottom: 12, flexWrap: "wrap",
        paddingBottom: 10, borderBottom: "1px solid var(--line)",
      }}>
        <span><span style={{ color: "var(--pour)" }}><span aria-hidden="true">✓ </span>{alignment.perfect}</span> alignés</span>
        <span><span style={{ color: "var(--warn)" }}><span aria-hidden="true">≈ </span>{alignment.partial}</span> partiels</span>
        <span><span style={{ color: "var(--contre)" }}><span aria-hidden="true">✕ </span>{alignment.conflict}</span> opposés</span>
        <span style={{ color: "var(--ink-3)" }}><span aria-hidden="true">÷ </span>{alignment.divided_excluded} divisé non comptés</span>
      </div>

      {/* Per-scrutin breakdown */}
      {rows.map(r => {
        const concrete = extractConcrete(r.sc.contexte);
        return (
          <div key={r.v.scrutin_id} style={{
            display: "grid",
            gridTemplateColumns: "20px 1fr auto",
            alignItems: "baseline", columnGap: 8, rowGap: 4,
            padding: "10px 0", borderTop: "1px dashed var(--line)",
          }}>
            <span
              role="img"
              aria-label={r.label}
              style={{ color: r.color, fontWeight: 600 }}
            ><span aria-hidden="true">{r.icon}</span></span>

            {/* Title + optional concrete bullet */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ color: "var(--ink)", fontWeight: 500 }}>{r.sc.titre_pedago}</span>
              {concrete && (
                <ul style={{ margin: 0, paddingLeft: 18, color: "var(--ink-2)", fontSize: 11.5, lineHeight: 1.5 }}>
                  <li style={{ textWrap: "pretty" as const }}>{concrete}</li>
                </ul>
              )}
            </div>

            {r.sc.url_an_officielle ? (
              <a
                href={r.sc.url_an_officielle}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Voir le scrutin n°${r.sc.numero} sur le site de l'Assemblée Nationale (nouvel onglet)`}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: "var(--ink-3)", letterSpacing: "0.04em", textDecoration: "none",
                }}><span aria-hidden="true">AN ↗</span></a>
            ) : (
              <span
                title="Donnée de démonstration — sera remplacée par les vrais scrutins de l'AN une fois le pipeline d'ingestion en production"
                aria-label="Donnée de démonstration (pas un scrutin AN réel)"
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: "var(--ink-4)", letterSpacing: "0.04em",
                }}>démo</span>
            )}
          </div>
        );
      })}
    </section>
  );
}

/** Extract the first "Concrètement :" or "Par exemple :" sentence from the
 *  contexte field. Returns null if neither marker is present (fallback data
 *  doesn't have these). Strips Anthropic web_search citation tags, **bold**
 *  markup, and trailing punctuation to keep the bullet visually compact. */
function extractConcrete(contexte?: string): string | null {
  if (!contexte) return null;
  // Strip Anthropic <cite ...> tags first (the LLM injects them when using
  // web_search and they would leak into the bullet text otherwise).
  const cleaned = contexte
    .replace(/<cite[^>]*>([\s\S]*?)<\/cite>/g, "$1")
    .replace(/<\/?cite[^>]*>/g, "");
  // Match "Concrètement :" or "Par exemple :" (or rarely a comma instead of
  // colon if the LLM drifts from its spec — see ingest-an.ts SYSTEM_PROMPT)
  // followed by content up to the next sentence boundary (period followed by
  // space + capital, or end of string). Without the comma fallback, a drifted
  // contexte "Concrètement, la loi…" would surface in the bullet with a
  // leading ", " — the trim/punctuation pass can't recover that.
  const m = cleaned.match(/(?:Concrètement|Par exemple)\s*[:,]?\s*([^]+?)(?=\.\s+[A-Z]|\.?$)/i);
  if (!m) return null;
  const sentence = m[1].trim().replace(/\.$/, "");
  // Strip **bold** markers — the AuditTrail row is dense, no need for emphasis
  return sentence.replace(/\*\*(.+?)\*\*/g, "$1");
}
