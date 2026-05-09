// src/routes/Cover.tsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Wordmark } from "../components/Wordmark";
import { FreshnessBanner } from "../components/FreshnessBanner";
import { fetchFreshness } from "../lib/scrutins";
import { hasSeenCover, markCoverSeen } from "../lib/session";
import type { FreshnessInfo } from "../types";

export default function Cover() {
  const navigate = useNavigate();
  const [info, setInfo] = useState<FreshnessInfo | null>(null);

  useEffect(() => {
    if (hasSeenCover()) {
      navigate("/play", { replace: true });
      return;
    }
    fetchFreshness().then(setInfo).catch(() => {});
  }, [navigate]);

  function start() {
    markCoverSeen();
    navigate("/play");
  }

  return (
    <section style={{
      padding: "32px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 24,
      maxWidth: 480,
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
        <Wordmark size={14} />
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9.5,
          color: "var(--ink-3)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          textAlign: "right",
          lineHeight: 1.5,
        }}>
          Données :<br /><b style={{ color: "var(--ink-2)", fontWeight: 500 }}>data.assemblee-nationale.fr</b>
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

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          borderTop: "1px solid var(--line)",
          paddingTop: 16,
        }}>
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
          <span>Commencer</span>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>≈ 5 min · 20 votes →</span>
        </button>
      </div>
    </section>
  );
}
