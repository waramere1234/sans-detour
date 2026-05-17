import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { fetchScrutins } from "../lib/scrutins";
import {
  computeAlignment, rankByAlignment,
  computeAlignmentPersonnalites, rankPersonnalitesByAlignment,
} from "../lib/matching";
import { loadSession, resetSession, forgetCover } from "../lib/session";
import { PartyRow } from "../components/PartyRow";
import { ResultSkeleton } from "../components/ResultSkeleton";
import { PersonnaliteRow } from "../components/PersonnaliteRow";
import { AuditTrail } from "../components/AuditTrail";
import { RetryError, RETRY_FETCH_FAILED_MESSAGE } from "../components/RetryError";
import { getPartyColorVar, getParty } from "../lib/parties";
import { composeShareText, performShare } from "../lib/share";
import { track } from "../lib/analytics";
import { ROUTES, PLAY_AFFINEMENT } from "../lib/routes";
import {
  TARGET,
  SHARE_LABEL, REFAIRE_LABEL, CONTINUE_REFINE_LABEL, CONTINUE_TEST_LABEL_PREFIX,
  refaireConfirmMessage, PERSONNALITES_TOGGLE_LABEL,
  resultEyebrowText, resultHeaderBodyLineText,
  resultPersonnalitesIndexedCountText, continueTestRemainingSuffix,
  RESULT_TOP_LEAD,
  type Scrutin, type GroupCode,
} from "../types";

export default function Result() {
  // All hooks at the top so the call order is uniform and easy to scan.
  const navigate = useNavigate();
  const [pool, setPool] = useState<Scrutin[]>([]);
  const [poolLoaded, setPoolLoaded] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<GroupCode | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loadTick, setLoadTick] = useState(0);
  const [showPersonnalites, setShowPersonnalites] = useState(false);
  const reportedRef = useRef(false);
  // Mirror reportedRef's once-per-mount pattern for the personalities reveal
  // event. Without it, a user toggling the disclosure 5× counted as 5 reveals
  // — inflated the metric and was inconsistent with `result_reached`.
  const personnalitesReportedRef = useRef(false);

  useEffect(() => {
    setLoadError(false);
    setPoolLoaded(false);
    fetchScrutins()
      .then((p) => {
        setPool(p);
        setPoolLoaded(true);
      })
      .catch(() => setLoadError(true));
  }, [loadTick]);

  const session = loadSession();

  // No useMemo here — `session` is a fresh object reference every render
  // (loadSession reads from localStorage), so memoising on [pool, session]
  // would recompute every render anyway. Computing inline is the same
  // cost without the false-promise wrapper. ~220 ops per call — negligible.
  const alignments = computeAlignment(pool, session?.votes ?? []);
  const ranked = rankByAlignment(alignments);
  const top = ranked[0];

  const personnaliteAlignments = computeAlignmentPersonnalites(pool, session?.votes ?? []);
  const rankedPersonnalites = rankPersonnalitesByAlignment(personnaliteAlignments);
  // Hide personalities the user has zero comparable data on (e.g. when the
  // session's 20 scrutins all predate Bardella's mandate).
  const personnalitesWithData = rankedPersonnalites.filter((p) => p.counted > 0);
  const skips = (session?.votes.filter(v => v.choice === "skip").length) ?? 0;
  const total = session?.votes.length ?? 0;
  const isPartial = total < TARGET;
  const remaining = Math.max(0, TARGET - total);

  useEffect(() => {
    // Don't fire the analytics ping when the 0-votes guard below is about
    // to <Navigate /> away — would pollute "result_reached" with empty
    // sessions. Stable dep `top?.group` so the effect doesn't re-run on
    // every render (top is recomputed each cycle as a fresh object).
    const hasVotes = (session?.votes.length ?? 0) > 0;
    if (top && hasVotes && !reportedRef.current) {
      reportedRef.current = true;
      track("result_reached", { counted: top.counted, top: top.group });
    }
  }, [top?.group, session?.votes.length]);

  // Guard against URL-typed `/result` with no session or no votes — without
  // this, the page renders "Tu es surtout aligné avec LFI (0%)" (first
  // group in GROUP_CODES order, all pcts at 0). Misleading. Using
  // <Navigate> here (instead of useEffect+navigate) prevents the
  // misleading content from flashing before the redirect.
  if (!session || session.votes.length === 0) {
    return <Navigate to={ROUTES.cover} replace />;
  }

  if (loadError) {
    return (
      <RetryError
        message={RETRY_FETCH_FAILED_MESSAGE}
        onRetry={() => setLoadTick((t) => t + 1)}
      />
    );
  }
  // Loaded but empty: Supabase returned zero rows (or every row was
  // filtered out). The "Chargement…" fallback below would otherwise show
  // forever, leaving the user stuck. Surface the same retry UI as Play.tsx.
  if (poolLoaded && pool.length === 0) {
    return (
      <RetryError
        message="Impossible de calculer ton alignement : aucun scrutin disponible. Réessaie dans quelques minutes."
        onRetry={() => setLoadTick((t) => t + 1)}
      />
    );
  }
  if (!top || pool.length === 0) {
    return <ResultSkeleton />;
  }

  function refaire() {
    // Confirm before wiping: refaire clears both the session AND the
    // cover-seen flag, so a tap on this tertiary button below 19 other
    // ones loses 20 votes and forces the user back through the Cover.
    // The Cover restart() (src/routes/Cover.tsx) has the same guard for
    // the in-progress case; this is the symmetric guard for the
    // completed/post-result case.
    const ok = window.confirm(refaireConfirmMessage(total));
    if (!ok) return;
    // Track AFTER the confirm passes so a cancelled confirm doesn't
    // inflate the metric. Mirrors Cover.tsx restart() which fires
    // `cover_restarted` post-confirm — without this, the symmetric
    // "refaire from Result" action was invisible to analytics.
    track("result_refaire");
    resetSession();
    forgetCover();
    navigate(ROUTES.cover);
  }

  async function share() {
    track("share_clicked");
    const text = composeShareText({ ranked, isPartial, total, target: TARGET });
    // Explicit `window.location.origin` — the bare `location` read used to
    // resolve to the global window.location at runtime, but a future
    // refactor adding `const location = useLocation()` (react-router) would
    // silently change the meaning (react-router's location has no .origin
    // → shareUrl becomes "undefined"). Be explicit so the global stays
    // unambiguous.
    const shareUrl = window.location.origin;
    // performShare handles the navigator.share → clipboard → prompt
    // fallback chain + the AbortError consent invariant.
    await performShare(text, shareUrl);
  }

  return (
    <section style={{
      padding: "24px var(--gutter) 32px",
      maxWidth: "var(--max-content)", margin: "0 auto",
      display: "flex", flexDirection: "column", gap: 18,
    }}>
      <header>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10.5,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: isPartial ? "var(--accent)" : "var(--ink-3)",
        }}>{resultEyebrowText(isPartial, total, TARGET)}</span>
        <h1 style={{
          fontFamily: "var(--font-sans)", fontWeight: 700,
          fontSize: 28, lineHeight: 1.15, letterSpacing: "-0.022em",
          margin: "10px 0 0", color: "var(--ink)",
        }}>
          {RESULT_TOP_LEAD}{" "}
          <span style={{ color: getPartyColorVar(top.group) }}>{getParty(top.group).name}</span>
          {" "}({top.pct}%)
          <span style={{ color: "var(--accent)" }}>.</span>
        </h1>
        <p style={{
          fontSize: 13, color: "var(--ink-2)",
          margin: "10px 0 0", letterSpacing: "-0.005em",
        }}>{resultHeaderBodyLineText(total, top.counted, skips)}</p>
      </header>

      <div>
        {/* Visually-hidden h2 so SR users navigating by headings find the
          parties list (otherwise h1 → h2 personnalités jumps over the
          main content of the page). */}
        <h2 className="sr-only">
          Alignement par groupe parlementaire
        </h2>
        {ranked.map(a => {
          const panelId = `audit-trail-${a.group}`;
          return (
            <div key={a.group}>
              <PartyRow
                alignment={a}
                expanded={expandedGroup === a.group}
                controlsId={panelId}
                onClick={() => setExpandedGroup(expandedGroup === a.group ? null : a.group)}
              />
              {expandedGroup === a.group && (
                <AuditTrail
                  id={panelId}
                  alignment={a}
                  scrutins={pool}
                  votes={session?.votes ?? []}
                />
              )}
            </div>
          );
        })}
      </div>

      {personnalitesWithData.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            onClick={() => {
              const next = !showPersonnalites;
              setShowPersonnalites(next);
              if (next && !personnalitesReportedRef.current) {
                personnalitesReportedRef.current = true;
                track("personnalites_revealed");
              }
            }}
            style={togglePersonnalitesBtn(showPersonnalites)}
            aria-expanded={showPersonnalites}
            // Only set aria-controls when the panel is mounted (line 283-ish,
            // gated on `showPersonnalites`). Pointing at a non-existent id is
            // undefined per WAI-ARIA and triggers warnings in some SR/devtool
            // combos — same fix session 87 applied to PartyRow.
            aria-controls={showPersonnalites ? "personnalites-panel" : undefined}
          >
            <span><span aria-hidden="true">{showPersonnalites ? "▾" : "▸"} </span>{PERSONNALITES_TOGGLE_LABEL}</span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10.5,
              color: "var(--ink-3)", letterSpacing: "0.04em",
            }}>{resultPersonnalitesIndexedCountText(personnalitesWithData.length)}</span>
          </button>

          {showPersonnalites && (
            <div id="personnalites-panel">
              <h2 style={{
                margin: "0 0 6px",
                fontFamily: "var(--font-mono)", fontSize: 10.5,
                color: "var(--ink-3)", letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}>
                Alignement avec figures du mandat
              </h2>
              {personnalitesWithData.map((p) => (
                <PersonnaliteRow key={p.personnalite} alignment={p} />
              ))}
              <p style={{
                margin: "10px 0 0",
                fontFamily: "var(--font-mono)", fontSize: 10,
                color: "var(--ink-3)", lineHeight: 1.5,
              }}>
                Basé uniquement sur leurs votes effectifs à l'Assemblée Nationale.
                Mélenchon, Philippe, Glucksmann, Tondelier ne siègent pas dans la
                17ᵉ législature ; Bardella, élu en 2024, a démissionné avant de
                siéger ; Darmanin est ministre sur la quasi-totalité du mandat
                (son suppléant vote à sa place). Aucun d'eux n'est mesuré ici.
              </p>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {isPartial && (
          <button type="button"
            onClick={() => navigate(ROUTES.play)}
            style={btnPrimary()}><span aria-hidden="true">→ </span>{CONTINUE_TEST_LABEL_PREFIX} ({remaining} {continueTestRemainingSuffix(remaining)})</button>
        )}
        <button type="button"
          onClick={share}
          style={isPartial ? btnSecondary() : btnPrimary()}><span aria-hidden="true">📤 </span>{SHARE_LABEL}</button>
        {!isPartial && (
          <button type="button"
            onClick={() => { track("affinement_clicked"); navigate(PLAY_AFFINEMENT); }}
            style={btnSecondary()}><span aria-hidden="true">↻ </span>{CONTINUE_REFINE_LABEL}</button>
        )}
        <button type="button" onClick={refaire} style={btnTertiary()}><span aria-hidden="true">↻ </span>{REFAIRE_LABEL}</button>
      </div>
    </section>
  );
}

function btnPrimary(): CSSProperties {
  return {
    background: "var(--accent)", color: "var(--bg)", border: "none",
    padding: "14px 16px", borderRadius: 6,
    fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, cursor: "pointer",
  };
}
function btnSecondary(): CSSProperties {
  return {
    background: "transparent", color: "var(--ink)",
    border: "1px solid var(--line)", padding: "12px 16px", borderRadius: 6,
    fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 14, cursor: "pointer",
  };
}
function btnTertiary(): CSSProperties {
  return {
    background: "transparent", color: "var(--ink-3)", border: "none",
    padding: "10px 16px",
    fontFamily: "var(--font-mono)", fontSize: 12, cursor: "pointer",
    letterSpacing: "0.04em",
  };
}
function togglePersonnalitesBtn(open: boolean): CSSProperties {
  return {
    background: open ? "var(--bg-2)" : "transparent",
    color: "var(--ink)",
    border: `1px solid var(--line)`,
    borderRadius: 4,
    padding: "10px 14px",
    fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500,
    cursor: "pointer",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    gap: 12,
    letterSpacing: "-0.005em",
  };
}
