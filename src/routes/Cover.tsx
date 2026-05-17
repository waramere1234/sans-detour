// src/routes/Cover.tsx
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Wordmark } from "../components/Wordmark";
import { FreshnessBanner } from "../components/FreshnessBanner";
import { useFreshnessOnce } from "../hooks/useFreshnessOnce";
import { hasSeenCover, loadSession, markCoverSeen, resetSession } from "../lib/session";
import { track } from "../lib/analytics";
import { FROM_LOGO_STATE, type LocationStateFromLogo } from "../lib/nav-state";
import { mailto } from "../lib/contact";
import { ROUTES } from "../lib/routes";
import { TARGET, MIN_FOR_RANKING, LEGISLATURE_LABEL, VIEW_RESULT_LABEL } from "../types";

export default function Cover() {
  const navigate = useNavigate();
  const location = useLocation();
  // Freshness fetch + once-per-mount guard live in the useFreshnessOnce
  // hook (session 99). The hook fires unconditionally on mount; if the
  // useEffect below decides to redirect, the in-flight fetch lands on an
  // unmounted component (React 18+ no-warn, no-leak) — wasted call but
  // negligible cost compared to the dedup with Methode.tsx.
  const info = useFreshnessOnce();

  useEffect(() => {
    // Explicit nav from the TopBar wordmark passes { fromLogo: true } so
    // the user lands on the home screen instead of being bounced back to
    // their in-progress deck. Fresh app opens have no state and keep the
    // auto-resume behavior.
    const fromLogo = (location.state as LocationStateFromLogo)?.fromLogo === true;
    if (!fromLogo && hasSeenCover()) {
      const s = loadSession();
      const votes = s?.votes.length ?? 0;
      if (votes >= TARGET) navigate(ROUTES.result, { replace: true });
      else navigate(ROUTES.play, { replace: true });
    }
  }, [navigate, location.state]);

  const session = loadSession();
  const votesCount = session?.votes.length ?? 0;
  const hasInProgress = votesCount > 0 && votesCount < TARGET;
  const hasCompleted = votesCount >= TARGET;
  const remainingVotes = TARGET - votesCount;
  const canSeePartialResult = votesCount >= MIN_FOR_RANKING;

  function start() {
    // Only flip the cover-seen flag the first time — subsequent revisits
    // (TopBar wordmark) don't need to re-write localStorage. Important on
    // Safari private mode where setItem can throw (caught by saveSession
    // try/catch, but skipping the call is cleaner).
    if (!hasSeenCover()) markCoverSeen();
    if (hasCompleted) {
      track("cover_result_revisit");
      navigate(ROUTES.result);
      return;
    }
    track(hasInProgress ? "cover_resumed" : "cover_started");
    navigate(ROUTES.play);
  }

  function restart() {
    const ok = window.confirm(
      votesCount === 1
        ? "Recommencer à zéro ? Ton vote en cours sera perdu."
        : `Recommencer à zéro ? Tes ${votesCount} votes en cours seront perdus.`,
    );
    if (!ok) return;
    // resetSession only clears the session key — the cover-seen flag is
    // already "true" since the user is interacting with the in-progress UI
    // (which only renders for hasInProgress = users who've seen Cover).
    // No need to re-mark.
    resetSession();
    track("cover_restarted");
    navigate(ROUTES.play);
  }

  return (
    <section style={{
      padding: "32px var(--gutter)",
      display: "flex",
      flexDirection: "column",
      gap: 24,
      maxWidth: "var(--max-content)",
      margin: "0 auto",
      // Same dvh minus safe-area pattern as App.tsx — body padding takes
      // the notch + home indicator, the section fills the remaining
      // visible area so the "Commencer" CTA stays above the fold on
      // iPhone X+ PWA. fallback 0px = identical to "100dvh" on non-notched.
      minHeight:
        "calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))",
    }}>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        paddingBottom: 18,
        borderBottom: "1px solid var(--line)",
      }}>
        <Link
          to={ROUTES.cover}
          // `replace` because this is a self-link (Cover is at "/"). Without
          // it, every click pushes an extra history entry — a user clicking
          // the wordmark 3× would then press back 3× to escape the same
          // page. The state mutation (fromLogo: true) still triggers
          // Cover's effect, just without polluting the back-stack.
          replace
          state={FROM_LOGO_STATE}
          aria-label="Accueil"
          // aria-current="page" because Cover IS at "/" — without it, SR
          // users have no way to know the wordmark link is a self-link
          // (visually it looks like a navigation affordance, semantically
          // it's a "you are here" marker). Matches the pattern applied to
          // TopBar MenuLink in session 66.
          aria-current="page"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Wordmark />
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
          }}>{LEGISLATURE_LABEL} — TON ALIGNEMENT RÉEL</span>
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
            <span>{hasCompleted ? VIEW_RESULT_LABEL : hasInProgress ? "Reprendre" : "Commencer"}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>
              {hasCompleted
                ? `${votesCount}/${TARGET} terminés`
                : hasInProgress
                  ? `${votesCount}/${TARGET} · ${remainingVotes} restant${remainingVotes !== 1 ? "s" : ""}`
                  : `≈ 5 min · ${TARGET} votes`}
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
                  to={ROUTES.result}
                  onClick={() => track("cover_partial_result")}
                  // textDecoration:underline so the link isn't identified by
                  // color alone (WCAG 1.4.1) — color-blind / high-contrast
                  // users get the underline as a non-color cue. Pattern
                  // mirrors the sibling "Recommencer à zéro" button below.
                  style={{
                    color: "var(--ink-2)",
                    textDecoration: "underline",
                    textDecorationColor: "var(--ink-4)",
                    textUnderlineOffset: 3,
                  }}
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
            inline here. aria-label avoids an unlabeled "navigation"
            landmark in SR rotors alongside the Cover header. */}
        <nav
          aria-label="Liens secondaires"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 18,
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            letterSpacing: "0.06em",
            color: "var(--ink-3)",
          }}>
          {/* underline so the 3 links aren't visually indistinguishable
              from regular text (parent + child both at var(--ink-3), no
              other affordance). Same pattern as the "Voir mon résultat
              partiel" + "Recommencer à zéro" links above (session 65). */}
          {(() => {
            const linkStyle = {
              color: "inherit",
              textDecoration: "underline" as const,
              textDecorationColor: "var(--ink-4)",
              textUnderlineOffset: 3,
            };
            return (
              <>
                <Link to={ROUTES.methode} onClick={() => track("cover_footer_nav", { target: "methode" })} style={linkStyle}>Méthode &amp; sources</Link>
                <Link to={ROUTES.legal} onClick={() => track("cover_footer_nav", { target: "legal" })} style={linkStyle}>Mentions légales</Link>
                <a href={mailto()} onClick={() => track("cover_footer_nav", { target: "contact" })} style={linkStyle}>Contact</a>
              </>
            );
          })()}
        </nav>
      </div>
    </section>
  );
}
