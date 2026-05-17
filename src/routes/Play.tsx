import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DeckStack } from "../components/DeckStack";
import { CardSkeleton } from "../components/CardSkeleton";
import { ChipTop1 } from "../components/ChipTop1";
import { RankingOverlay } from "../components/RankingOverlay";
import { MethodeSheet } from "../components/MethodeSheet";
import { fetchScrutins } from "../lib/scrutins";
import {
  composeDeck, drawNext, chapeauPrefix,
  DEFAULT_CAP_PER_DOSSIER, DEFAULT_CAP_PER_CHAPEAU_PREFIX,
} from "../lib/deck";
import { computeAlignment, rankByAlignment } from "../lib/matching";
import { getOrCreateSession, recordVote, loadSession } from "../lib/session";
import { track } from "../lib/analytics";
import { nextVoteLabel } from "../lib/vote-feedback";
import { ROUTES, isAffinementMode } from "../lib/routes";
import {
  GROUP_CODES, TARGET, MIN_FOR_RANKING,
  type Scrutin, type UserVote, type GroupCode, type GroupAlignment,
} from "../types";

// Caps live in src/lib/deck.ts so a future policy bump (currently 2 each)
// updates the composer + every call site + every test atomically.
const CAP_PER_DOSSIER = DEFAULT_CAP_PER_DOSSIER;
const CAP_PER_CHAPEAU_PREFIX = DEFAULT_CAP_PER_CHAPEAU_PREFIX;

// Shared layout for the Play page section — used by both the loading-skeleton
// return and the real deck return so they don't drift. minHeight uses 100dvh
// minus the 60-px TopBar AND the iOS safe-area insets (notch top + home
// indicator bottom), otherwise the Contre/Je passe/Pour row slid below the
// fold on iPhone 13 PWA — same pattern as App.tsx + Cover.tsx (session 62).
const playSectionStyle: CSSProperties = {
  padding: "18px var(--gutter) 16px",
  display: "flex",
  flexDirection: "column",
  gap: 18,
  minHeight:
    "calc(100dvh - 60px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))",
  maxWidth: "var(--max-content)",
  margin: "0 auto",
};

// Placeholder for the skeleton path that mirrors the progress chip's footprint
// (border + padding + same vertical rhythm). Without it, the bottom buttons
// and CardSkeleton jump 30+ px up at load when the real header renders.
const skeletonHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 10,
  height: 32,
};

export default function Play() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [pool, setPool] = useState<Scrutin[]>([]);
  const [poolLoaded, setPoolLoaded] = useState(false);
  const [deck, setDeck] = useState<Scrutin[]>([]);
  const [refinementMode, setRefinementMode] = useState(false);
  const [rankingOpen, setRankingOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loadTick, setLoadTick] = useState(0);
  const [lastVoteLabel, setLastVoteLabel] = useState("");
  const [methodeSheetOpen, setMethodeSheetOpen] = useState(false);

  // Initial deck composition
  useEffect(() => {
    // Guard: if user lands on /play with a complete session and isn't in
    // refinement mode, send them to /result rather than starting a fresh deck.
    const existing = loadSession();
    const isAffinement = isAffinementMode(params);
    if (existing && existing.votes.length >= TARGET && !isAffinement) {
      navigate(ROUTES.result, { replace: true });
      return;
    }
    // Affinement only makes sense after a completed session — it's the
    // "draw 20 more" action on /result. If the user lands on /play with
    // ?affinement=1 but no completed session (typing the URL, stale link,
    // localStorage cleared), strip the flag so they get a normal "0 / 20"
    // run instead of a refinement-mode header without a target count.
    if (isAffinement && (!existing || existing.votes.length < TARGET)) {
      navigate(ROUTES.play, { replace: true });
      return;
    }
    setLoadError(false);
    setPoolLoaded(false);
    fetchScrutins().then((p) => {
      setPool(p);
      setPoolLoaded(true);
      getOrCreateSession();
      // Resume-aware composition: skip already-seen scrutins so they
      // never reappear, and only request the number of cards still needed.
      const seenIds = new Set(existing?.cards_seen ?? []);
      const seenCounts = new Map<string, number>();
      const seenPrefixCounts = new Map<string, number>();
      for (const id of existing?.cards_seen ?? []) {
        const sc = p.find((x) => x.id === id);
        if (sc) {
          seenCounts.set(sc.dossier_id, (seenCounts.get(sc.dossier_id) ?? 0) + 1);
          const pref = chapeauPrefix(sc);
          seenPrefixCounts.set(pref, (seenPrefixCounts.get(pref) ?? 0) + 1);
        }
      }
      const remainingTarget = isAffinement
        ? TARGET   // affinement mode: keep drawing as long as pool allows
        : Math.max(0, TARGET - seenIds.size);
      setDeck(
        composeDeck(p, {
          size: remainingTarget,
          capPerDossier: CAP_PER_DOSSIER,
          capPerChapeauPrefix: CAP_PER_CHAPEAU_PREFIX,
          excludeIds: seenIds,
          seenDossierCounts: seenCounts,
          seenChapeauPrefixCounts: seenPrefixCounts,
        }),
      );
    }).catch(() => setLoadError(true));
  }, [navigate, params, loadTick]);

  useEffect(() => {
    // Sync both ways: dropping ?affinement=1 must also flip the mode off,
    // otherwise the refinement flag sticks across navigations and the
    // header drops the " / TARGET" suffix even in normal play.
    setRefinementMode(isAffinementMode(params));
  }, [params]);

  const session = loadSession();
  // No useMemo here — `session` (and `tick`) are referentially unstable
  // each render, so the [session, pool, tick] deps invalidate every cycle
  // and the wrapper was a no-op behind eslint-disable comments. Inline
  // these computations: cheap and clearer.
  const cardsSeenSet = new Set(session?.cards_seen ?? []);
  const seenDossierCounts = (() => {
    const m = new Map<string, number>();
    for (const id of session?.cards_seen ?? []) {
      const sc = pool.find((s) => s.id === id);
      if (sc) m.set(sc.dossier_id, (m.get(sc.dossier_id) ?? 0) + 1);
    }
    return m;
  })();
  const seenPrefixCounts = (() => {
    const m = new Map<string, number>();
    for (const id of session?.cards_seen ?? []) {
      const sc = pool.find((s) => s.id === id);
      if (sc) {
        const pref = chapeauPrefix(sc);
        m.set(pref, (m.get(pref) ?? 0) + 1);
      }
    }
    return m;
  })();

  const alignments: Record<GroupCode, GroupAlignment> = computeAlignment(pool, session?.votes ?? []);
  const countedTotal = Math.max(...GROUP_CODES.map((c) => alignments[c].counted), 0);
  const showLiveScore = countedTotal >= MIN_FOR_RANKING;
  const ranked = rankByAlignment(alignments);
  const top1 = ranked[0];

  function handleVote(scrutinId: string, choice: UserVote) {
    // recordVote returns false on a duplicate (fast double-click / swipe-
    // then-click). Gate the rest of the handler so a stray second event
    // doesn't double-fire analytics, re-trigger the aria-live announcement,
    // or short-circuit the deck advance against stale state.
    const recorded = recordVote(scrutinId, choice);
    if (!recorded) return;
    track("vote", { choice });

    // nextVoteLabel handles the zero-width-space alternation so identical
    // consecutive votes (e.g. two "Pour" in a row) still mutate the string —
    // aria-live polite only re-announces on content change.
    setLastVoteLabel((prev) => nextVoteLabel(prev, choice));

    const remaining = deck.slice(1);
    if (remaining.length === 0) {
      if ((session?.votes.length ?? 0) + 1 >= TARGET) {
        navigate(ROUTES.result);
        return;
      }
      // The counts above were captured at render time, BEFORE recordVote
      // updated localStorage. Build a fresh copy that includes the scrutin
      // we just voted on so drawNext can't pick another card from the same
      // dossier/sujet and bust the caps.
      const justVoted = pool.find((s) => s.id === scrutinId);
      const fresherDossiers = new Map(seenDossierCounts);
      const fresherPrefixes = new Map(seenPrefixCounts);
      if (justVoted) {
        fresherDossiers.set(
          justVoted.dossier_id,
          (fresherDossiers.get(justVoted.dossier_id) ?? 0) + 1,
        );
        const pref = chapeauPrefix(justVoted);
        fresherPrefixes.set(pref, (fresherPrefixes.get(pref) ?? 0) + 1);
      }
      const next = drawNext(pool, new Set([...cardsSeenSet, scrutinId]), {
        capPerDossier: CAP_PER_DOSSIER,
        capPerChapeauPrefix: CAP_PER_CHAPEAU_PREFIX,
        seenDossierCounts: fresherDossiers,
        seenChapeauPrefixCounts: fresherPrefixes,
      });
      setDeck(next ? [next] : []);
      if (!next) navigate(ROUTES.result);
    } else {
      setDeck(remaining);
    }

    if ((session?.votes.length ?? 0) + 1 === TARGET && !refinementMode) {
      navigate(ROUTES.result);
    }
  }

  if (loadError) {
    return (
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12, maxWidth: "var(--max-content)", margin: "0 auto" }}>
        <p style={{ color: "var(--ink)", fontSize: 15, lineHeight: 1.5 }}>
          Impossible de charger les scrutins. Vérifie ta connexion puis réessaie.
        </p>
        <button
          type="button"
          onClick={() => setLoadTick((t) => t + 1)}
          style={{
            alignSelf: "flex-start",
            background: "var(--accent)", color: "var(--bg)", border: "none",
            padding: "10px 16px", borderRadius: 6,
            fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }
  if (deck.length === 0 && pool.length > 0) {
    return (
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12, maxWidth: "var(--max-content)", margin: "0 auto" }}>
        <p style={{ color: "var(--ink)", fontSize: 15, lineHeight: 1.5 }}>
          Plus de scrutins disponibles à voter dans ton deck.
        </p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.result)}
          style={{
            alignSelf: "flex-start",
            background: "var(--accent)", color: "var(--bg)", border: "none",
            padding: "10px 16px", borderRadius: 6,
            fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}
        >
          Voir mon résultat
        </button>
      </div>
    );
  }
  // `loaded === true` here means fetchScrutins resolved with an empty array
  // (Supabase has zero matching rows, or every row was filtered out). Without
  // this branch the user would sit on "Chargement…" indefinitely with no
  // recourse — so we surface a real message and let them retry.
  if (deck.length === 0 && poolLoaded) {
    return (
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12, maxWidth: "var(--max-content)", margin: "0 auto" }}>
        <p style={{ color: "var(--ink)", fontSize: 15, lineHeight: 1.5 }}>
          Aucun scrutin disponible pour le moment. Réessaie dans quelques minutes.
        </p>
        <button
          type="button"
          onClick={() => setLoadTick((t) => t + 1)}
          style={{
            alignSelf: "flex-start",
            background: "var(--accent)", color: "var(--bg)", border: "none",
            padding: "10px 16px", borderRadius: 6,
            fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }
  if (deck.length === 0) {
    return (
      <section style={playSectionStyle} aria-busy="true">
        <div aria-hidden="true" style={skeletonHeaderStyle}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--ink-3)",
              letterSpacing: "0.04em",
              border: "1px solid var(--line)",
              padding: "7px 11px",
              borderRadius: 3,
            }}
          >
            … / {TARGET}
          </span>
        </div>
        <div style={{ flex: 1, padding: "6px 0" }}>
          <CardSkeleton />
        </div>
      </section>
    );
  }

  const progress = (session?.cards_seen.length ?? 0) + 1;

  return (
    <section style={playSectionStyle}>
      {/* Visually-hidden h1 so the Play page has a navigable landmark in
        the SR heading rotor — the visible UI is interactive (deck) with
        no on-screen title, but SR users need a way to identify the page. */}
      <h1 className="sr-only">Voter sur les scrutins</h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        {showLiveScore && top1 ? (
          <ChipTop1 topGroup={top1.group} pct={top1.pct} onTap={() => setRankingOpen(true)} />
        ) : (
          <span />
        )}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--ink-2)",
            letterSpacing: "0.04em",
            border: "1px solid var(--line)",
            padding: "7px 11px",
            borderRadius: 3,
          }}
        >
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>{progress}</span>
          {!refinementMode && ` / ${TARGET}`}
        </span>
        {showLiveScore && (
          <button
            type="button"
            onClick={() => navigate(ROUTES.result)}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              border: "1px solid var(--line)",
              color: "var(--ink-2)",
              background: "transparent",
              padding: "7px 11px",
              borderRadius: 3,
              cursor: "pointer",
            }}
          >
            Mon résultat<span aria-hidden="true"> →</span>
          </button>
        )}
      </div>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {lastVoteLabel}
      </div>

      <DeckStack scrutins={deck} onVote={handleVote} onOpenMethode={() => setMethodeSheetOpen(true)} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          paddingTop: 8,
        }}
      >
        <button
          type="button"
          onClick={() => handleVote(deck[0].id, "contre")}
          aria-label="Contre — voter contre ce scrutin"
          style={btnFallback("var(--contre)")}
        >
          <span aria-hidden="true">← </span>Contre
        </button>
        <button
          type="button"
          onClick={() => handleVote(deck[0].id, "skip")}
          aria-label="Je passe — passer ce scrutin sans voter"
          style={btnFallback("var(--ink-2)")}
        >
          <span aria-hidden="true">↓ </span>Je passe
        </button>
        <button
          type="button"
          onClick={() => handleVote(deck[0].id, "pour")}
          aria-label="Pour — voter pour ce scrutin"
          style={btnFallback("var(--pour)")}
        >
          Pour<span aria-hidden="true"> →</span>
        </button>
      </div>

      <RankingOverlay
        open={rankingOpen}
        alignments={alignments}
        countedTotal={countedTotal}
        onClose={() => setRankingOpen(false)}
      />

      <MethodeSheet
        open={methodeSheetOpen}
        onClose={() => setMethodeSheetOpen(false)}
      />
    </section>
  );
}

function btnFallback(color: string): CSSProperties {
  return {
    flex: 1,
    padding: "12px 8px",
    borderRadius: 6,
    background: "transparent",
    border: `1px solid ${color}`,
    color,
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    letterSpacing: "0.04em",
    cursor: "pointer",
  };
}
