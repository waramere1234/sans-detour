// src/components/FreshnessBanner.tsx
import type { FreshnessInfo } from "../types";

function diffDays(target: string, base: number = Date.now()): number {
  return Math.max(0, Math.floor((new Date(target).getTime() - base) / 86400_000));
}
function pastDays(target: string, base: number = Date.now()): number {
  return Math.max(0, Math.floor((base - new Date(target).getTime()) / 86400_000));
}

export function FreshnessBanner({ info }: { info: FreshnessInfo }) {
  const past = pastDays(info.last_sync_at);
  const next = diffDays(info.next_sync_eta);
  return (
    <div
      role="status"
      style={{
        border: "1px solid var(--accent-line)",
        background: "var(--accent-soft)",
        borderRadius: 6,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <span aria-hidden="true" style={{
        width: 8, height: 8, borderRadius: "50%",
        background: "var(--accent)", flex: "0 0 auto",
      }} />
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)", letterSpacing: "-0.005em" }}>
          Données à jour
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 11,
          color: "var(--ink-2)", letterSpacing: "0.04em", marginTop: 3,
        }}>
          {info.total_scrutins} scrutins · MAJ il y a {past} j · prochaine sync dans {next} j
        </div>
      </div>
    </div>
  );
}
