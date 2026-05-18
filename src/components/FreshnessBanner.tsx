// src/components/FreshnessBanner.tsx
import { MIDDLE_DOT_SEPARATOR, type FreshnessInfo } from "../types";

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

/** Tone-driven title rendered in the banner header. Both strings are
 *  pinned by .getByText(...) assertions in tests/FreshnessBanner.test.tsx
 *  — exporting them lets the test round-trip via the const instead of
 *  re-typing the literal, so a rewording propagates from one edit. */
export const FRESHNESS_OK_TITLE = "Données à jour";
export const FRESHNESS_STALE_TITLE = "Synchronisation en retard";

/** Natural-language phrasing for the past=0 / next=0 boundary cases —
 *  "0 j" reads awkwardly, so we promote to these short phrases. Pinned
 *  by 4 test assertions in FreshnessBanner.test.tsx (today × 2 sites,
 *  imminent × 2 sites). */
export const FRESHNESS_TODAY_PHRASE = "MAJ aujourd'hui";
export const FRESHNESS_IMMINENT_PHRASE = "sync imminente";

/** Compose the "MAJ il y a N jour(s)" past-phrase rendered below the
 *  title. Pulls the plural rule + boundary handling out of the inline
 *  ternary so the test suite can round-trip via the helper instead of
 *  asserting `/MAJ il y a 1 jour\b/` against a parallel hardcoded
 *  template. Centralised so a future rewording ("dernière MAJ il y a…")
 *  touches one site. */
export function freshnessPastPhrase(past: number): string {
  if (past === 0) return FRESHNESS_TODAY_PHRASE;
  return `MAJ il y a ${past} jour${past !== 1 ? "s" : ""}`;
}

/** Compose the "prochaine sync dans N jour(s)" next-phrase. Same drift-
 *  fix pattern as freshnessPastPhrase. */
export function freshnessNextPhrase(next: number): string {
  if (next === 0) return FRESHNESS_IMMINENT_PHRASE;
  return `prochaine sync dans ${next} jour${next !== 1 ? "s" : ""}`;
}

/** Compose the "N scrutin(s)" total-scrutins phrase rendered as the
 *  first segment of the banner body line ("{N} scrutin(s) · {past} ·
 *  {next}"). Pinned by 2 test regex literals — extracting the helper
 *  lets tests round-trip via `freshnessTotalScrutinsPhrase(N)` instead
 *  of regex partial matches. The session 83 plural-rule fix (the body
 *  line was hardcoded "scrutins" until then) lives inside this helper
 *  as the load-bearing invariant. */
export function freshnessTotalScrutinsPhrase(total: number): string {
  return `${total} scrutin${total !== 1 ? "s" : ""}`;
}

export function FreshnessBanner({ info }: { info: FreshnessInfo }) {
  const past = pastDays(info.last_sync_at);
  const next = diffDays(info.next_sync_eta);
  const stale = past > STALE_AFTER_DAYS;
  const tone = stale ? {
    border: "var(--line)",
    background: "transparent",
    dot: "var(--ink-3)",
    title: FRESHNESS_STALE_TITLE,
  } : {
    border: "var(--accent-line)",
    background: "var(--accent-soft)",
    dot: "var(--accent)",
    title: FRESHNESS_OK_TITLE,
  };
  const pastPhrase = freshnessPastPhrase(past);
  const nextPhrase = freshnessNextPhrase(next);
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
          {freshnessTotalScrutinsPhrase(info.total_scrutins)}{MIDDLE_DOT_SEPARATOR}{pastPhrase}{MIDDLE_DOT_SEPARATOR}{nextPhrase}
        </div>
      </div>
    </div>
  );
}
