import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DeckStack } from "../components/DeckStack";
import { CardSkeleton } from "../components/CardSkeleton";
import { ChipTop1 } from "../components/ChipTop1";
import { RankingOverlay } from "../components/RankingOverlay";
import { MethodeSheet } from "../components/MethodeSheet";
import { fetchScrutins } from "../lib/scrutins";
import { composeDeck, drawNext, chapeauPrefix } from "../lib/deck";
import { computeAlignment, rankByAlignment } from "../lib/matching";
import { getOrCreateSession, recordVote, loadSession } from "../lib/session";
import { track } from "../lib/analytics";
import type { Scrutin, UserVote, GroupCode, GroupAlignment } from "../types";
import { GROUP_CODES } from "../types";

const TARGET = 20;
const MIN_FOR_LIVE = 5;
const CAP_PER_DOSSIER = 2;
const CAP_PER_CHAPEAU_PREFIX = 2;

export default function Play() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [pool, setPool] = useState<Scrutin[]>([]);
  const [poolLoaded, setPoolLoaded] = useState(false);
  const [deck, setDeck] = useState<Scrutin[]>([]);
  const [refinementMode, setRefinementMode] = useState(false);
  const [rankingOpen, setRankingOpen] = useState(false);
  const [tick, setTick] = useState(0); // force re-render after recordVote
  const [loadError, setLoadError] = useState(false);
  const [loadTick, setLoadTick] = useState(0);
  const [lastVoteLabel, setLastVoteLabel] = useState("");
  const [methodeSheetOpen, setMethodeSheetOpen] = useState(false);

  // Initial deck composition
  useEffect(() => {
    // Guard: if user lands on /play with a complete session and isn't in
    // refinement mode, send them to /result rather than starting a fresh deck.
    const existing = loadSession();
    const isAffinement = params.get("affinement") === "1";
    if (existing && existing.votes.length >= TARGET && !isAffinement) {
      navigate("/result", { replace: true });
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
    setRefinementMode(params.get("affinement") === "1");
  }, [params]);

  const session = loadSession();
  const cardsSeenSet = useMemo(
    () => new Set(session?.cards_seen ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, tick],
  );
  const seenDossierCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const id of session?.cards_seen ?? []) {
      const sc = pool.find((s) => s.id === id);
      if (sc) m.set(sc.dossier_id, (m.get(sc.dossier_id) ?? 0) + 1);
    }
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, pool, tick]);
  const seenPrefixCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const id of session?.cards_seen ?? []) {
      const sc = pool.find((s) => s.id === id);
      if (sc) {
        const pref = chapeauPrefix(sc);
        m.set(pref, (m.get(pref) ?? 0) + 1);
      }
    }
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, pool, tick]);

  const alignments: Record<GroupCode, GroupAlignment> = useMemo(
    () => computeAlignment(pool, session?.votes ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pool, session, tick],
  );
  const countedTotal = Math.max(...GROUP_CODES.map((c) => alignments[c].counted), 0);
  const showLiveScore = countedTotal >= MIN_FOR_LIVE;
  const ranked = rankByAlignment(alignments);
  const top1 = ranked[0];

  function handleVote(scrutinId: string, choice: UserVote) {
    recordVote(scrutinId, choice);
    track("vote", { choice });
    setTick((t) => t + 1);

    const labels: Record<UserVote, string> = {
      pour: "Voté pour. Carte suivante.",
      contre: "Voté contre. Carte suivante.",
      skip: "Passé. Carte suivante.",
    };
    setLastVoteLabel(labels[choice]);

    const remaining = deck.slice(1);
    if (remaining.length === 0) {
      if ((session?.votes.length ?? 0) + 1 >= TARGET) {
        navigate("/result");
        return;
      }
      // The memoised counts above are stale at this point — `recordVote`
      // just ran but the memo deps haven't recomputed yet. Build a fresh
      // copy that includes the scrutin we just voted on so drawNext can't
      // pick another card from the same dossier/sujet and bust the caps.
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
      if (!next) navigate("/result");
    } else {
      setDeck(remaining);
    }

    if ((session?.votes.length ?? 0) + 1 === TARGET && !refinementMode) {
      navigate("/result");
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
          onClick={() => navigate("/result")}
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
      <section style={{
        padding: "18px var(--gutter) 16px",
        display: "flex", flexDirection: "column", gap: 18,
        minHeight: "calc(100dvh - 60px)",
        maxWidth: "var(--max-content)", margin: "0 auto",
      }}>
        <div style={{ flex: 1, padding: "6px 0" }}>
          <CardSkeleton />
        </div>
      </section>
    );
  }

  const progress = (session?.cards_seen.length ?? 0) + 1;

  return (
    <section
      style={{
        padding: "18px var(--gutter) 16px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        minHeight: "calc(100dvh - 60px)",
        maxWidth: "var(--max-content)",
        margin: "0 auto",
      }}
    >
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
            onClick={() => navigate("/result")}
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
          aria-label="Voter contre ce scrutin"
          style={btnFallback("var(--contre)")}
        >
          <span aria-hidden="true">← </span>Contre
        </button>
        <button
          type="button"
          onClick={() => handleVote(deck[0].id, "skip")}
          aria-label="Passer ce scrutin sans voter"
          style={btnFallback("var(--ink-2)")}
        >
          <span aria-hidden="true">↓ </span>Je passe
        </button>
        <button
          type="button"
          onClick={() => handleVote(deck[0].id, "pour")}
          aria-label="Voter pour ce scrutin"
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
