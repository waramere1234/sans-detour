// src/components/AuditTrail.tsx
import {
  anScrutinViewAriaLabel,
  DEMO_DATA_LABEL_PREFIX, DEMO_FALLBACK_SHORT_LABEL,
  DEMO_FALLBACK_TITLE_SUFFIX, DEMO_FALLBACK_ARIA_SUFFIX,
  AUDIT_GLYPH_ALIGNED, AUDIT_GLYPH_PARTIAL, AUDIT_GLYPH_OPPOSED, AUDIT_GLYPH_DIVIDED,
  AUDIT_TRAIL_HEADER_PARTY_NAME_PREFIX, AUDIT_TRAIL_HEADING_ID_PREFIX,
  EXTERNAL_LINK_TARGET, EXTERNAL_LINK_REL,
  AUDIT_TRAIL_LABEL_DIVIDED, AUDIT_TRAIL_LABEL_ALIGNED,
  AUDIT_TRAIL_LABEL_PARTIAL, AUDIT_TRAIL_LABEL_OPPOSED,
  auditTrailChipNoun, AN_LINK_SHORT_LABEL,
  type GroupAlignment, type Scrutin, type SessionVote,
} from "../types";
import { alignmentScore } from "../lib/matching";
import { getParty } from "../lib/parties";
import { extractConcrete } from "../lib/text-cleanup";

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
      // Per-row icons are derived from AUDIT_GLYPH_* (chip glyphs)
      // via .trimEnd() — the chip-vs-row split is purely a cadence
      // difference (chip has trailing space for inline glue; row icon
      // is standalone). Deriving keeps the 2 surfaces in sync so a
      // future glyph swap propagates to both via one edit.
      if (score === null) { icon = AUDIT_GLYPH_DIVIDED.trimEnd(); color = "var(--ink-4)"; label = AUDIT_TRAIL_LABEL_DIVIDED; }
      else if (score === 1) { icon = AUDIT_GLYPH_ALIGNED.trimEnd(); color = "var(--pour)"; label = AUDIT_TRAIL_LABEL_ALIGNED; }
      else if (score === 0.5) { icon = AUDIT_GLYPH_PARTIAL.trimEnd(); color = "var(--warn)"; label = AUDIT_TRAIL_LABEL_PARTIAL; }
      else { icon = AUDIT_GLYPH_OPPOSED.trimEnd(); color = "var(--contre)"; label = AUDIT_TRAIL_LABEL_OPPOSED; }
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
      aria-labelledby={`${AUDIT_TRAIL_HEADING_ID_PREFIX}${alignment.group}`}
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
        id={`${AUDIT_TRAIL_HEADING_ID_PREFIX}${alignment.group}`}
        style={{
          fontFamily: "var(--font-sans)", fontWeight: 600,
          fontSize: 14, color: "var(--ink)",
          margin: "0 0 4px",
        }}
      >
        {alignment.group} <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>{AUDIT_TRAIL_HEADER_PARTY_NAME_PREFIX}{partyName}</span>
      </h3>

      {/* Breakdown chips */}
      <div style={{
        display: "flex", gap: 14, marginBottom: 12, flexWrap: "wrap",
        paddingBottom: 10, borderBottom: "1px solid var(--line)",
      }}>
        <span><span style={{ color: "var(--pour)" }}><span aria-hidden="true">{AUDIT_GLYPH_ALIGNED}</span>{alignment.perfect}</span> {auditTrailChipNoun(alignment.perfect, "aligned")}</span>
        <span><span style={{ color: "var(--warn)" }}><span aria-hidden="true">{AUDIT_GLYPH_PARTIAL}</span>{alignment.partial}</span> {auditTrailChipNoun(alignment.partial, "partial")}</span>
        <span><span style={{ color: "var(--contre)" }}><span aria-hidden="true">{AUDIT_GLYPH_OPPOSED}</span>{alignment.conflict}</span> {auditTrailChipNoun(alignment.conflict, "opposed")}</span>
        <span style={{ color: "var(--ink-3)" }}><span aria-hidden="true">{AUDIT_GLYPH_DIVIDED}</span>{alignment.divided_excluded} {auditTrailChipNoun(alignment.divided_excluded, "divided")}</span>
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
                target={EXTERNAL_LINK_TARGET}
                rel={EXTERNAL_LINK_REL}
                aria-label={anScrutinViewAriaLabel(r.sc.numero)}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: "var(--ink-3)", letterSpacing: "0.04em", textDecoration: "none",
                }}><span aria-hidden="true">{AN_LINK_SHORT_LABEL}</span></a>
            ) : (
              <span
                title={`${DEMO_DATA_LABEL_PREFIX}${DEMO_FALLBACK_TITLE_SUFFIX}`}
                aria-label={`${DEMO_DATA_LABEL_PREFIX}${DEMO_FALLBACK_ARIA_SUFFIX}`}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: "var(--ink-4)", letterSpacing: "0.04em",
                }}>{DEMO_FALLBACK_SHORT_LABEL}</span>
            )}
          </div>
        );
      })}
    </section>
  );
}

