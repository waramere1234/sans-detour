import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { fetchScrutins } from "../lib/scrutins";
import { computeAlignment, rankByAlignment } from "../lib/matching";
import { loadSession, resetSession } from "../lib/session";
import { PartyRow } from "../components/PartyRow";
import { AuditTrail } from "../components/AuditTrail";
import { getParty, getPartyColorVar } from "../lib/parties";
import { track } from "../lib/analytics";
import type { Scrutin, GroupCode } from "../types";

export default function Result() {
  const navigate = useNavigate();
  const [pool, setPool] = useState<Scrutin[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<GroupCode | null>(null);

  useEffect(() => { fetchScrutins().then(setPool); }, []);

  const session = loadSession();
  const alignments = useMemo(
    () => computeAlignment(pool, session?.votes ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pool, session],
  );
  const ranked = rankByAlignment(alignments);
  const top = ranked[0];
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
    const text = `Mes affinités politiques réelles, basées sur les vrais votes de l'AN : ${summary}`;
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
      padding: "24px 22px 32px",
      maxWidth: 480, margin: "0 auto",
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
