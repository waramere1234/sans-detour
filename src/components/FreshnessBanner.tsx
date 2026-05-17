// src/components/FreshnessBanner.tsx
import type { FreshnessInfo } from "../types";

// new Date("…").getTime() returns NaN when the string isn't a valid ISO
// date. Without the isNaN check, the banner ends up rendering "MAJ il y a
// NaN j" if Supabase ever serves a malformed `ingere_le` value. Coerce to
// 0 so the banner stays readable instead of leaking the math glitch.
function diffDays(target: string, base: number = Date.now()): number {
  const t = new Date(target).getTime();
  if (isNaN(t)) return 0;
  return Math.max(0, Math.floor((t - base) / 86400_000));
}
function pastDays(target: string, base: number = Date.now()): number {
  const t = new Date(target).getTime();
  if (isNaN(t)) return 0;
  return Math.max(0, Math.floor((base - t) / 86400_000));
}

/** Sync cadence is weekly (cf. Methode §01). Above this many days, the
 *  pipeline is considered late and we drop the "à jour" framing so the
 *  banner doesn't lie when ingestion has actually stalled.
 *
 *  Exported so the test suite can derive `pastDays > STALE_AFTER_DAYS`
 *  instead of hardcoding `mk(15, …)` against the implicit value `10` —
 *  a future bump to 14 or 20 would otherwise need parallel edits in
 *  source + test, with silent test-passing if forgotten. */
export const STALE_AFTER_DAYS = 10;

export function FreshnessBanner({ info }: { info: FreshnessInfo }) {
  const past = pastDays(info.last_sync_at);
  const next = diffDays(info.next_sync_eta);
  const stale = past > STALE_AFTER_DAYS;
  const tone = stale ? {
    border: "var(--line)",
    background: "transparent",
    dot: "var(--ink-3)",
    title: "Synchronisation en retard",
  } : {
    border: "var(--accent-line)",
    background: "var(--accent-soft)",
    dot: "var(--accent)",
    title: "Données à jour",
  };
  // "0 j" reads awkwardly — promote to natural-language phrasing for the
  // two boundary cases (today + imminent). Same for the past/next plural.
  const pastPhrase = past === 0 ? "MAJ aujourd'hui" : `MAJ il y a ${past} jour${past !== 1 ? "s" : ""}`;
  const nextPhrase = next === 0 ? "sync imminente" : `prochaine sync dans ${next} jour${next !== 1 ? "s" : ""}`;
  return (
    <div
      role="status"
      style={{
        border: `1px solid ${tone.border}`,
        background: tone.background,
        borderRadius: 6,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <span aria-hidden="true" style={{
        width: 8, height: 8, borderRadius: "50%",
        background: tone.dot, flex: "0 0 auto",
      }} />
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)", letterSpacing: "-0.005em" }}>
          {tone.title}
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 11,
          color: "var(--ink-2)", letterSpacing: "0.04em", marginTop: 3,
        }}>
          {info.total_scrutins} scrutin{info.total_scrutins !== 1 ? "s" : ""} · {pastPhrase} · {nextPhrase}
        </div>
      </div>
    </div>
  );
}
