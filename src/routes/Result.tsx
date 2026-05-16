import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { fetchScrutins } from "../lib/scrutins";
import {
  computeAlignment, rankByAlignment,
  computeAlignmentPersonnalites, rankPersonnalitesByAlignment,
} from "../lib/matching";
import { loadSession, resetSession } from "../lib/session";
import { PartyRow } from "../components/PartyRow";
import { PersonnaliteRow } from "../components/PersonnaliteRow";
import { AuditTrail } from "../components/AuditTrail";
import { getParty, getPartyColorVar } from "../lib/parties";
import { track } from "../lib/analytics";
import type { Scrutin, GroupCode } from "../types";

export default function Result() {
  const navigate = useNavigate();
  const [pool, setPool] = useState<Scrutin[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<GroupCode | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loadTick, setLoadTick] = useState(0);

  useEffect(() => {
    setLoadError(false);
    fetchScrutins()
      .then(setPool)
      .catch(() => setLoadError(true));
  }, [loadTick]);

  const session = loadSession();
  const alignments = useMemo(
    () => computeAlignment(pool, session?.votes ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pool, session],
  );
  const ranked = rankByAlignment(alignments);
  const top = ranked[0];

  const personnaliteAlignments = useMemo(
    () => computeAlignmentPersonnalites(pool, session?.votes ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pool, session],
  );
  const rankedPersonnalites = rankPersonnalitesByAlignment(personnaliteAlignments);
  // Hide personalities the user has zero comparable data on (e.g. when the
  // session's 20 scrutins all predate Bardella's mandate).
  const personnalitesWithData = rankedPersonnalites.filter((p) => p.counted > 0);
  const [showPersonnalites, setShowPersonnalites] = useState(false);
  const skips = (session?.votes.filter(v => v.choice === "skip").length) ?? 0;
  const total = session?.votes.length ?? 0;
  const TARGET = 20;
  const isPartial = total < TARGET;
  const remaining = Math.max(0, TARGET - total);

  const reportedRef = useRef(false);
  useEffect(() => {
    if (top && !reportedRef.current) {
      reportedRef.current = true;
      track("result_reached", { counted: top.counted, top: top.group });
    }
  }, [top]);

  if (loadError) {
    return (
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12, maxWidth: 480, margin: "0 auto" }}>
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
  if (!top || pool.length === 0) {
    return <div style={{ padding: 24 }}>Chargement…</div>;
  }

  function refaire() {
    resetSession();
    localStorage.removeItem("sd_seen_cover");  // re-show cover
    navigate("/");
  }

  async function share() {
    track("share_clicked");
    const top6 = ranked.slice(0, 6);
    const summary = top6
      .map((a, i) => `${i + 1}. ${getParty(a.group).short} ${a.pct}%`)
      .join(" · ");
    const lead = isPartial
      ? `Mes affinités politiques réelles (résultat partiel ${total}/${TARGET}), basées sur les vrais votes de l'AN`
      : `Mes affinités politiques réelles, basées sur les vrais votes de l'AN`;
    const text = `${lead} : ${summary}`;
    const shareUrl = location.origin;

    if (navigator.share) {
      try {
        await navigator.share({ text, url: shareUrl });
        return;
      } catch {
        // user cancelled or share unavailable — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
    } catch {
      window.prompt("Copie ton résultat :", `${text}\n${shareUrl}`);
    }
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
        }}>{isPartial ? `RÉSULTAT PARTIEL · ${total}/${TARGET}` : "RÉSULTAT · 17e LÉGISLATURE"}</span>
        <h1 style={{
          fontFamily: "var(--font-sans)", fontWeight: 700,
          fontSize: 28, lineHeight: 1.15, letterSpacing: "-0.022em",
          margin: "10px 0 0", color: "var(--ink)",
        }}>
          Tu es surtout aligné avec{" "}
          <span style={{ color: getPartyColorVar(top.group) }}>{getParty(top.group).name}</span>
          {" "}({top.pct}%)
          <span style={{ color: "var(--accent)" }}>.</span>
        </h1>
        <p style={{
          fontSize: 13, color: "var(--ink-2)",
          margin: "10px 0 0", letterSpacing: "-0.005em",
        }}>{total} scrutins · {top.counted} comptés · {skips} skip</p>
      </header>

      <div>
        {ranked.map(a => (
          <div key={a.group}>
            <PartyRow
              alignment={a}
              expanded={expandedGroup === a.group}
              onClick={() => setExpandedGroup(expandedGroup === a.group ? null : a.group)}
            />
            {expandedGroup === a.group && (
              <AuditTrail
                alignment={a}
                scrutins={pool}
                votes={session?.votes ?? []}
              />
            )}
          </div>
        ))}
      </div>

      {personnalitesWithData.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            onClick={() => {
              const next = !showPersonnalites;
              setShowPersonnalites(next);
              if (next) track("personnalites_revealed");
            }}
            style={togglePersonnalitesBtn(showPersonnalites)}
            aria-expanded={showPersonnalites}
          >
            <span>{showPersonnalites ? "▾" : "▸"} Voir les personnalités</span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10.5,
              color: "var(--ink-3)", letterSpacing: "0.04em",
            }}>{personnalitesWithData.length} indexées</span>
          </button>

          {showPersonnalites && (
            <div>
              <p style={{
                margin: "0 0 6px",
                fontFamily: "var(--font-mono)", fontSize: 10.5,
                color: "var(--ink-3)", letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                Alignement avec figures du mandat
              </p>
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
            onClick={() => navigate("/play")}
            style={btnPrimary()}>→ Continuer le test ({remaining} {remaining === 1 ? "vote restant" : "votes restants"})</button>
        )}
        <button type="button"
          onClick={share}
          style={isPartial ? btnSecondary() : btnPrimary()}>📤 Partager mon résultat</button>
        {!isPartial && (
          <button type="button"
            onClick={() => { track("affinement_clicked"); navigate("/play?affinement=1"); }}
            style={btnSecondary()}>↻ Continuer à affiner</button>
        )}
        <button type="button" onClick={refaire} style={btnTertiary()}>↻ Refaire depuis le début</button>
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
