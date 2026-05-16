// src/routes/Cover.tsx
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "../components/Wordmark";
import { FreshnessBanner } from "../components/FreshnessBanner";
import { fetchFreshness } from "../lib/scrutins";
import { hasSeenCover, loadSession, markCoverSeen, resetSession } from "../lib/session";
import { track } from "../lib/analytics";
import type { FreshnessInfo } from "../types";

const TARGET = 20;

export default function Cover() {
  const navigate = useNavigate();
  const location = useLocation();
  const [info, setInfo] = useState<FreshnessInfo | null>(null);
  // Guard so a wordmark re-click (which mutates location.state and re-runs
  // this effect) doesn't fire a fresh Supabase round-trip every time.
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Explicit nav from the TopBar wordmark passes { fromLogo: true } so
    // the user lands on the home screen instead of being bounced back to
    // their in-progress deck. Fresh app opens have no state and keep the
    // auto-resume behavior.
    const fromLogo = (location.state as { fromLogo?: boolean } | null)?.fromLogo === true;
    if (!fromLogo && hasSeenCover()) {
      const s = loadSession();
      const votes = s?.votes.length ?? 0;
      if (votes >= TARGET) navigate("/result", { replace: true });
      else navigate("/play", { replace: true });
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchFreshness().then(setInfo).catch(() => {});
  }, [navigate, location.state]);

  const session = loadSession();
  const votesCount = session?.votes.length ?? 0;
  const hasInProgress = votesCount > 0 && votesCount < TARGET;
  const hasCompleted = votesCount >= TARGET;
  const remainingVotes = TARGET - votesCount;
  const canSeePartialResult = votesCount >= 5;

  function start() {
    markCoverSeen();
    if (hasCompleted) {
      track("cover_result_revisit");
      navigate("/result");
      return;
    }
    track(hasInProgress ? "cover_resumed" : "cover_started");
    navigate("/play");
  }

  function restart() {
    const ok = window.confirm(
      `Recommencer à zéro ? Tes ${votesCount} votes en cours seront perdus.`,
    );
    if (!ok) return;
    // resetSession only clears the session key — the cover-seen flag is
    // already "true" since the user is interacting with the in-progress UI
    // (which only renders for hasInProgress = users who've seen Cover).
    // No need to re-mark.
    resetSession();
    track("cover_restarted");
    navigate("/play");
  }

  return (
    <section style={{
      padding: "32px var(--gutter)",
      display: "flex",
      flexDirection: "column",
      gap: 24,
      maxWidth: "var(--max-content)",
      margin: "0 auto",
      minHeight: "100dvh",
    }}>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        paddingBottom: 18,
        borderBottom: "1px solid var(--line)",
      }}>
        <Link
          to="/"
          state={{ fromLogo: true }}
          aria-label="Accueil"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Wordmark size={14} />
        </Link>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9.5,
          color: "var(--ink-3)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          textAlign: "right",
          lineHeight: 1.5,
        }}>
          Données AN officielles<br /><span style={{ color: "var(--ink-2)", fontWeight: 500 }}>résumés Claude (IA)</span>
        </span>
      </header>

      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 32,
        padding: "16px 0",
      }}>
        <div>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10.5,
            color: "var(--accent)", fontWeight: 500,
            letterSpacing: "0.12em", textTransform: "uppercase",
          }}>17e LÉGISLATURE — TON ALIGNEMENT RÉEL</span>
          <h1 style={{
            fontFamily: "var(--font-sans)", fontWeight: 700,
            fontSize: 38, lineHeight: 1.05, letterSpacing: "-0.022em",
            margin: "14px 0 0", color: "var(--ink)",
          }}>
            Pas les programmes.
            <br />
            <span style={{ color: "var(--accent)" }}>Les vrais votes</span>
            <span style={{ color: "var(--accent)" }}>.</span>
          </h1>
          <p style={{
            fontSize: 15, lineHeight: 1.55,
            color: "var(--ink-2)", letterSpacing: "-0.005em",
            maxWidth: "32ch", marginTop: 24,
          }}>
            Découvre avec quels partis tu es vraiment aligné. On ne regarde pas les programmes — on regarde ce que les députés ont effectivement voté à l'Assemblée Nationale.
          </p>
        </div>

        {info && <FreshnessBanner info={info} />}

        {/* Swipe-gesture legend — purely visual for touch/mouse users.
          aria-hidden because SR users will use the labelled button fallback
          on /play, not gestures. Reading "leftwards arrow Contre / downwards
          arrow Je passe / rightwards arrow Pour" adds noise without value. */}
        <div
          aria-hidden="true"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            borderTop: "1px solid var(--line)",
            paddingTop: 16,
          }}
        >
          {[
            { lbl: "Contre", arr: "←", color: "var(--contre)" },
            { lbl: "Je passe", arr: "↓", color: "var(--ink-2)" },
            { lbl: "Pour", arr: "→", color: "var(--pour)" },
          ].map(g => (
            <div key={g.lbl} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: g.color }}>{g.arr}</span>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 10,
                letterSpacing: "0.08em", textTransform: "uppercase",
                color: "var(--ink-3)",
              }}>{g.lbl}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            onClick={start}
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: "-0.01em",
              padding: "18px",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <span>{hasCompleted ? "Voir mon résultat" : hasInProgress ? "Reprendre" : "Commencer"}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>
              {hasCompleted
                ? `${votesCount}/${TARGET} terminés`
                : hasInProgress
                  ? `${votesCount}/${TARGET} · ${remainingVotes} restant${remainingVotes > 1 ? "s" : ""}`
                  : "≈ 5 min · 20 votes"}
              <span aria-hidden="true"> →</span>
            </span>
          </button>

          {hasInProgress && (
            <div style={{
              display: "flex", flexWrap: "wrap",
              justifyContent: "center", gap: 18,
              paddingTop: 4,
              fontFamily: "var(--font-mono)", fontSize: 11,
              letterSpacing: "0.04em",
              color: "var(--ink-3)",
            }}>
              {canSeePartialResult && (
                <Link
                  to="/result"
                  onClick={() => track("cover_partial_result")}
                  style={{ color: "var(--ink-2)", textDecoration: "none" }}
                >
                  Voir mon résultat partiel
                </Link>
              )}
              <button
                type="button"
                onClick={restart}
                style={{
                  background: "transparent", border: "none",
                  padding: 0, cursor: "pointer",
                  font: "inherit", color: "inherit", letterSpacing: "inherit",
                  textDecoration: "underline",
                  textDecorationColor: "var(--ink-4)",
                  textUnderlineOffset: 3,
                }}
              >
                Recommencer à zéro
              </button>
            </div>
          )}
        </div>

        {/* Discreet secondary nav for the Cover only — the TopBar (and its
            menu sheet) is hidden on this route because the Cover already
            shows a wordmark in its header, so we surface the same links
            inline here. */}
        <nav style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 18,
          fontFamily: "var(--font-mono)",
          fontSize: 10.5,
          letterSpacing: "0.06em",
          color: "var(--ink-3)",
        }}>
          <Link to="/methode" onClick={() => track("cover_footer_nav", { target: "methode" })} style={{ color: "inherit", textDecoration: "none" }}>Méthode &amp; sources</Link>
          <Link to="/legal" onClick={() => track("cover_footer_nav", { target: "legal" })} style={{ color: "inherit", textDecoration: "none" }}>Mentions légales</Link>
          <a href="mailto:contact@sansdetour.fr" onClick={() => track("cover_footer_nav", { target: "contact" })} style={{ color: "inherit", textDecoration: "none" }}>Contact</a>
        </nav>
      </div>
    </section>
  );
}
