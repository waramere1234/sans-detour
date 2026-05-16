import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Wordmark } from "../components/Wordmark";
import { FreshnessBanner } from "../components/FreshnessBanner";
import { fetchFreshness } from "../lib/scrutins";
import type { FreshnessInfo } from "../types";

export default function Methode() {
  const [info, setInfo] = useState<FreshnessInfo | null>(null);
  useEffect(() => { fetchFreshness().then(setInfo).catch(() => {}); }, []);

  return (
    <section style={{ maxWidth: 720, margin: "0 auto", padding: "24px var(--gutter) 48px" }}>
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        paddingBottom: 14, borderBottom: "1px solid var(--line)",
      }}>
        <Link to="/" style={{ color: "var(--ink-2)", fontFamily: "var(--font-mono)", fontSize: 11, textDecoration: "none" }}>‹ Retour</Link>
        <Link to="/" state={{ fromLogo: true }} aria-label="Accueil" style={{ textDecoration: "none", color: "inherit" }}>
          <Wordmark size={14} />
        </Link>
        <span style={{ visibility: "hidden" }}>‹</span>
      </nav>

      <header style={{ marginTop: 24 }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10.5,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: "var(--ink-3)",
        }}>MÉTHODE & SOURCES</span>
        <h1 style={{
          fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 28,
          lineHeight: 1.15, letterSpacing: "-0.022em", margin: "10px 0 0",
        }}>Comment on calcule, et avec quelles données<span style={{ color: "var(--accent)" }}>.</span></h1>
        <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55, marginTop: 12 }}>
          Aucune opinion, aucun panel. <b>Le calcul d'alignement est une formule mathématique pure — l'IA n'y intervient pas.</b> En revanche, les résumés, les points clés et les synthèses des scrutins sont mis en forme par Claude (voir <a href="#methode-07" style={{ color: "var(--accent)" }}>section 07</a>).
        </p>
      </header>

      {info && <div style={{ marginTop: 18 }}><FreshnessBanner info={info} /></div>}

      <Section n="01" title="D'où viennent les données">
        <p>Les votes proviennent de <b>l'open data officiel de l'Assemblée Nationale</b>, exposé sur <code>data.assemblee-nationale.fr</code>. Ce sont les mêmes fichiers que ceux utilisés par les médias de référence et le service interne de l'AN. Aucune retranscription manuelle, aucune source secondaire.</p>
        <p>Mise à jour automatisée toutes les semaines.</p>
      </Section>

      <Section n="02" title="Quels scrutins on garde">
        <p>On garde les <b>scrutins solennels</b> (SPS), les <b>votes finaux sur l'ensemble d'une loi</b> (SOR), les <b>motions de censure</b> et les <b>propositions de résolution</b>. On exclut les amendements, les votes en commission et les motions procédurales (rejet préalable, renvoi).</p>
        <p>Pour chaque session, on en tire <b>20</b> en équilibrant les thèmes (santé, immigration, fiscalité…) plutôt qu'au hasard pur, avec deux garde-fous : <b>jamais plus de 2 scrutins du même dossier législatif</b> et <b>jamais plus de 2 scrutins du même sujet</b> (pour ne pas avoir 8 votes retraite de suite ni 3 votes Mayotte d'affilée).</p>
      </Section>

      <Section n="03" title="Comment on définit la position d'un groupe">
        <p>Un groupe parlementaire compte plusieurs dizaines de députés qui ne votent pas toujours pareil. Pour résumer en une position unique :</p>
        <Formula>
          si ≥ 70% des votants effectifs du groupe → pour / contre / abstention<br/>
          sinon → groupe divisé<br/>
          (absents et non-votants exclus du calcul)
        </Formula>
        <p>Un scrutin sur lequel un groupe est <b>divisé</b> ne compte pas pour ce groupe — pas pour toi non plus, dans cette comparaison.</p>
      </Section>

      <Section n="04" title="Comment on calcule ton alignement">
        <p>Pour chaque groupe, on compare ce que tu as voté à ce que ce groupe a voté, scrutin par scrutin :</p>
        <Formula>
          +1 si ton vote = position du groupe<br/>
          +0,5 si l'un des deux s'abstient et l'autre vote<br/>
          0 si désaccord net (pour vs contre)<br/>
          ÷ nombre de scrutins comptés × 100 = % affiché
        </Formula>
        <p>Le ranking apparaît à partir du <b>5e scrutin compté</b> — en dessous, les pourcentages bougent trop pour signifier quoi que ce soit.</p>
      </Section>

      <Section n="05" title="Ce qu'on ne fait pas avec tes données">
        <p>Pas de compte utilisateur, pas de cookie de tracking, pas d'analytics nominatifs, pas de POST.</p>
        <p>Tes votes vivent dans le <code>localStorage</code> de ton navigateur. Si tu vides ton cache, ils disparaissent. C'est volontaire : on n'a aucun moyen technique de savoir comment tu as voté ni qui tu es.</p>
      </Section>

      <Section n="06" title="Indépendance & financement">
        <p>Sans Détour est un projet <b>indépendant</b>. Aucune affiliation parti / média / institution.</p>
        <p>Hébergement sur fonds personnels. Pas d'annonceur, pas de sponsor, pas de don accepté pendant les 6 mois précédant un scrutin national.</p>
        <ul style={{ paddingLeft: 18, color: "var(--ink-2)" }}>
          <li><a href="https://data.assemblee-nationale.fr/" target="_blank" rel="noopener noreferrer">data.assemblee-nationale.fr</a> — open data officiel</li>
          <li><a href="https://github.com/sansdetour" target="_blank" rel="noopener noreferrer">github.com/sansdetour</a> — code source MIT</li>
          <li><a href="mailto:contact@sansdetour.fr">contact@sansdetour.fr</a> — signaler une erreur</li>
        </ul>
      </Section>

      <Section n="07" title="Le rôle de l'IA Claude">
        <p><b>Ce que fait Claude.</b> Reformuler le titre brut du scrutin en 12 mots, condenser le projet de loi en 3 points clés, rédiger un résumé contextuel de 30 à 50 mots, structurer une synthèse détaillée (mesures, concernés, calendrier, exceptions), et taguer le scrutin par thème. <b>Mise en forme, pas commentaire.</b></p>

        <p><b>Ce qu'il ne fait pas.</b> Le calcul d'alignement (formule mathématique pure), la composition du deck (round-robin algorithmique par thème), l'extraction des votes individuels (parsing des XML officiels AN). Sur ces trois plans, Claude n'intervient à aucun moment.</p>

        <p><b>Comment on cadre les biais.</b> Le prompt envoyé à Claude est neutre par construction. Sa source : le libellé brut AN + des résultats de recherche web pour le contexte. <b>Le libellé officiel brut est affiché sur la face Résumé du verso de chaque carte</b> (et la page AN complète est toujours accessible via « Voir sur AN ↗ ») — tu peux comparer directement.</p>

        <p><b>Limites & signalement.</b> Claude peut se tromper sur les nuances : un mot mal choisi, une mesure oubliée, un thème mal taggué. Pour l'instant, aucune relecture humaine systématique (V3 prévue). Si tu repères une erreur factuelle : <a href="mailto:contact@sansdetour.fr">contact@sansdetour.fr</a> — on corrige.</p>

        <ul style={{ paddingLeft: 18, color: "var(--ink-2)", marginTop: 12 }}>
          <li><a href="https://github.com/sansdetour" target="_blank" rel="noopener noreferrer">github.com/sansdetour</a> — prompt et code source publics</li>
          <li>Modèle : Claude Haiku 4.5 d'Anthropic, via Batches API + web_search</li>
        </ul>
      </Section>
    </section>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    // id is `methode-NN` so cross-section references (e.g. "voir section 07"
    // in §04 intro) can use `<a href="#methode-07">` to deep-link. Without an
    // anchor target the text reads as if it were a link but does nothing on
    // click — broken affordance on a transparency-focused page.
    <div
      id={`methode-${n}`}
      // tabIndex=-1 makes the div programmatically focusable so browsers
      // move focus to it after an in-page anchor jump (`<a href="#methode-07">`).
      // Without it, focus stays on the link and keyboard Tab continues from
      // the §04 paragraph instead of the §07 heading — scroll moves but
      // focus doesn't follow.
      tabIndex={-1}
      style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--line)", scrollMarginTop: 16, outline: "none" }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 11,
          letterSpacing: "0.12em", color: "var(--accent)", fontWeight: 500,
        }}>{n}</span>
        <h2 style={{
          fontFamily: "var(--font-sans)", fontWeight: 600,
          fontSize: 18, letterSpacing: "-0.012em", margin: 0,
        }}>{title}</h2>
      </div>
      <div style={{ marginTop: 8, color: "var(--ink-2)", fontSize: 13.5, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

function Formula({ children }: { children: ReactNode }) {
  return (
    <div style={{
      background: "var(--bg-2)", border: "1px solid var(--line)",
      borderRadius: 6, padding: "12px 14px", marginTop: 8,
      fontFamily: "var(--font-mono)", fontSize: 13,
      color: "var(--ink)", lineHeight: 1.7,
    }}>{children}</div>
  );
}
