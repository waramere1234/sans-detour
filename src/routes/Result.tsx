import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { fetchScrutins } from "../lib/scrutins";
import { computeAlignment, rankByAlignment } from "../lib/matching";
import { loadSession, resetSession } from "../lib/session";
import { PartyRow } from "../components/PartyRow";
import { AuditTrail } from "../components/AuditTrail";
import { getParty, getPartyColorVar } from "../lib/parties";
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

  if (!top || pool.length === 0) {
    return <div style={{ padding: 24 }}>Chargement…</div>;
  }

  function refaire() {
    resetSession();
    localStorage.removeItem("sd_seen_cover");  // re-show cover
    navigate("/");
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
          color: "var(--ink-3)",
        }}>RÉSULTAT · 17e LÉGISLATURE</span>
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
        <button type="button"
          onClick={() => alert("Partage — voir Task 5.4")}
          style={btnPrimary()}>📤 Partager mon résultat</button>
        <button type="button"
          onClick={() => navigate("/play?affinement=1")}
          style={btnSecondary()}>↻ Continuer à affiner</button>
        <button type="button" onClick={refaire} style={btnTertiary()}>↻ Refaire</button>
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
