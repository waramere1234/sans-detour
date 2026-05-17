import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Wordmark } from "../components/Wordmark";
import { FreshnessBanner } from "../components/FreshnessBanner";
import { fetchFreshness } from "../lib/scrutins";
import { track } from "../lib/analytics";
import { FROM_LOGO_STATE } from "../lib/nav-state";
import { TARGET, MIN_FOR_RANKING, type FreshnessInfo } from "../types";

export default function Methode() {
  const [info, setInfo] = useState<FreshnessInfo | null>(null);
  const location = useLocation();
  // Match Cover.tsx's fetchedRef pattern (session 70): only mark fetched
  // on success so a transient failure doesn't kill the banner for the
  // rest of the session, and so React StrictMode's intentional double-
  // invoke in dev doesn't fire two redundant Supabase round-trips.
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchFreshness()
      .then((freshness) => { fetchedRef.current = true; setInfo(freshness); })
      .catch(() => {});
  }, []);

  // SPA hash scroll : when user lands on `/methode#methode-07` directly,
  // the browser's native anchor jump happens BEFORE React mounts the
  // Section elements — so the target id doesn't exist yet and the scroll
  // is a no-op. Run our own scrollIntoView after mount as a fallback.
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    // "instant" is explicit (vs "auto" which inherits from CSS
    // scroll-behavior and could be smooth or instant depending on the
    // page). Deep-link jumps should land predictably.
    el.scrollIntoView({ behavior: "instant", block: "start" });
    // Also move focus so keyboard Tab continues from the section heading,
    // not from the TOC link that was clicked. Sections have tabIndex=-1
    // which makes them programmatically focusable.
    el.focus({ preventScroll: true });
  }, [location.hash]);

  return (
    <section style={{ maxWidth: 720, margin: "0 auto", padding: "24px var(--gutter) 48px" }}>
      {/* 3-column grid keeps the wordmark centered without needing an
        invisible placeholder span. Left col = back link (justify start),
        center = wordmark (justify center), right col = empty (1fr) so
        the geometry is balanced. aria-label distinguishes this landmark
        from the Sommaire <nav> below for SR users navigating by landmarks. */}
      <nav
        aria-label="En-tête de la page"
        style={{
          display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "baseline",
          paddingBottom: 14, borderBottom: "1px solid var(--line)",
        }}>
        <Link to="/" style={{ color: "var(--ink-2)", fontFamily: "var(--font-mono)", fontSize: 11, textDecoration: "none", justifySelf: "start" }}>
          <span aria-hidden="true">‹ </span>Retour
        </Link>
        <Link to="/" state={FROM_LOGO_STATE} aria-label="Accueil" style={{ textDecoration: "none", color: "inherit", justifySelf: "center" }}>
          <Wordmark />
        </Link>
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
          Aucune opinion, aucun panel. <strong>Le calcul d'alignement est une formule mathématique pure — l'IA n'y intervient pas.</strong> En revanche, les résumés, les points clés et les synthèses des scrutins sont mis en forme par Claude (voir <a href="#methode-07" style={{ color: "var(--accent)" }}>section 07</a>).
        </p>
      </header>

      {info && <div style={{ marginTop: 18 }}><FreshnessBanner info={info} /></div>}

      {/* Sommaire — la page fait 7 sections, sans nav rapide l'user doit
        scroller pour trouver une partie précise. Les ancres `#methode-NN`
        existent déjà (cf. Section component) ; on les expose ici. */}
      <nav
        aria-label="Sommaire de la méthode"
        style={{
          marginTop: 24, padding: "12px 14px",
          border: "1px solid var(--line)", borderRadius: 6,
          background: "var(--bg-2)",
          display: "flex", flexWrap: "wrap", gap: "6px 14px",
          fontFamily: "var(--font-mono)", fontSize: 11.5,
          letterSpacing: "0.04em",
        }}
      >
        {[
          ["01", "Données"],
          ["02", "Scrutins"],
          ["03", "Position d'un groupe"],
          ["04", "Calcul"],
          ["05", "Confidentialité"],
          ["06", "Indépendance"],
          ["07", "IA Claude"],
        ].map(([n, label]) => (
          <a
            key={n}
            href={`#methode-${n}`}
            onClick={() => track("methode_toc_click", { section: n })}
            style={{
              color: "var(--ink-2)", textDecoration: "none",
              display: "inline-flex", alignItems: "baseline", gap: 4,
            }}
          >
            <span style={{ color: "var(--accent)" }}>{n}</span>
            {label}
          </a>
        ))}
      </nav>

      <Section n="01" title="D'où viennent les données">
        <p>Les votes proviennent de <strong>l'open data officiel de l'Assemblée Nationale</strong>, exposé sur <code>data.assemblee-nationale.fr</code>. Ce sont les mêmes fichiers que ceux utilisés par les médias de référence et le service interne de l'AN. Aucune retranscription manuelle, aucune source secondaire.</p>
        <p>Mise à jour automatisée toutes les semaines.</p>
      </Section>

      <Section n="02" title="Quels scrutins on garde">
        <p>On garde les <strong>scrutins solennels</strong> (SPS), les <strong>votes finaux sur l'ensemble d'une loi</strong> (SOR), les <strong>motions de censure</strong>, les <strong>motions référendaires</strong> et les <strong>propositions de résolution</strong>. On exclut les amendements, les votes en commission et les motions procédurales (rejet préalable, renvoi).</p>
        <p>Pour chaque session, on en tire <strong>{TARGET}</strong> en équilibrant les thèmes (santé, immigration, fiscalité…) plutôt qu'au hasard pur, avec deux garde-fous : <strong>jamais plus de 2 scrutins du même dossier législatif</strong> et <strong>jamais plus de 2 scrutins du même sujet</strong> (pour ne pas avoir 8 votes retraite de suite ni 3 votes Mayotte d'affilée).</p>
      </Section>

      <Section n="03" title="Comment on définit la position d'un groupe">
        <p>Un groupe parlementaire compte plusieurs dizaines de députés qui ne votent pas toujours pareil. Pour résumer en une position unique :</p>
        <Formula>
          si ≥ 70% des votants effectifs du groupe → pour / contre / abstention<br/>
          sinon → groupe divisé<br/>
          (absents et non-votants exclus du calcul)
        </Formula>
        <p>Un scrutin sur lequel un groupe est <strong>divisé</strong> ne compte pas pour ce groupe — pas pour toi non plus, dans cette comparaison.</p>
      </Section>

      <Section n="04" title="Comment on calcule ton alignement">
        <p>Pour chaque groupe, on compare ce que tu as voté à ce que ce groupe a voté, scrutin par scrutin :</p>
        <Formula>
          Score par scrutin :<br/>
          &nbsp;&nbsp;+1 si ton vote = position du groupe<br/>
          &nbsp;&nbsp;+0,5 si l'un des deux s'abstient et l'autre vote<br/>
          &nbsp;&nbsp;0 si désaccord net (pour vs contre)<br/>
          <br/>
          Somme des scores ÷ nombre de scrutins comptés × 100 = % affiché
        </Formula>
        <p>Le ranking apparaît à partir du <strong>{MIN_FOR_RANKING}<sup>e</sup> scrutin compté</strong> — en dessous, les pourcentages bougent trop pour signifier quoi que ce soit.</p>
      </Section>

      <Section n="05" title="Ce qu'on ne fait pas avec tes données">
        <p>Pas de compte utilisateur, pas de cookie de tracking, pas d'analytics nominatifs, pas de POST.</p>
        <p>Tes votes vivent dans le <code>localStorage</code> de ton navigateur. Si tu vides ton cache, ils disparaissent. C'est volontaire : on n'a aucun moyen technique de savoir comment tu as voté ni qui tu es.</p>
      </Section>

      <Section n="06" title="Indépendance & financement">
        <p>Sans Détour est un projet <strong>indépendant</strong>. Aucune affiliation parti / média / institution.</p>
        <p>Hébergement sur fonds personnels. Pas d'annonceur, pas de sponsor, pas de don accepté pendant les 6 mois précédant un scrutin national.</p>
        <ul style={{ paddingLeft: 18, color: "var(--ink-2)" }}>
          <li><a href="https://data.assemblee-nationale.fr/" target="_blank" rel="noopener noreferrer" aria-label="data.assemblee-nationale.fr (nouvel onglet)">data.assemblee-nationale.fr</a> — open data officiel</li>
          {/* TODO production-blocker · github.com/sansdetour is a 404 today
              (real repo is private at waramere1234/sans-detour per CLAUDE.md)
              AND no LICENSE file exists despite the "MIT" claim. Either
              publish under the sansdetour org with a LICENSE.md, or drop
              this bullet until the repo is public. Same TODO in §07 below
              and in Legal.tsx — keep them in sync. */}
          <li><a href="https://github.com/sansdetour" target="_blank" rel="noopener noreferrer" aria-label="github.com/sansdetour (nouvel onglet)">github.com/sansdetour</a> — code source MIT</li>
          <li><a href="mailto:contact@sansdetour.fr">contact@sansdetour.fr</a> — signaler une erreur</li>
        </ul>
      </Section>

      <Section n="07" title="Le rôle de l'IA Claude">
        <p><strong>Ce que fait Claude.</strong> Reformuler le titre brut du scrutin en 12 mots, condenser le projet de loi en 3 points clés, rédiger un résumé contextuel de 30 à 50 mots, structurer une synthèse détaillée (mesures, concernés, calendrier, exceptions), et taguer le scrutin par thème. <strong>Mise en forme, pas commentaire.</strong></p>

        <p><strong>Ce qu'il ne fait pas.</strong> Le calcul d'alignement (formule mathématique pure), la composition du deck (round-robin algorithmique par thème), l'extraction des votes individuels (parsing des XML officiels AN). Sur ces trois plans, Claude n'intervient à aucun moment.</p>

        <p><strong>Comment on cadre les biais.</strong> Le prompt envoyé à Claude est neutre par construction. Sa source : le libellé brut AN + des résultats de recherche web pour le contexte. <strong>Le libellé officiel brut est affiché sur la face Résumé du verso de chaque carte</strong> (et la page AN complète est toujours accessible via « Voir sur AN ↗ ») — tu peux comparer directement.</p>

        <p><strong>Limites & signalement.</strong> Claude peut se tromper sur les nuances : un mot mal choisi, une mesure oubliée, un thème mal taggué. Pour l'instant, aucune relecture humaine systématique (V3 prévue). Si tu repères une erreur factuelle : <a href="mailto:contact@sansdetour.fr">contact@sansdetour.fr</a> — on corrige.</p>

        <ul style={{ paddingLeft: 18, color: "var(--ink-2)", marginTop: 12 }}>
          {/* TODO production-blocker · same broken github.com/sansdetour
              link as §06 above. The "prompt et code source publics" claim
              is aspirational until the repo is published. */}
          <li><a href="https://github.com/sansdetour" target="_blank" rel="noopener noreferrer" aria-label="github.com/sansdetour (nouvel onglet)">github.com/sansdetour</a> — prompt et code source publics</li>
          <li>Modèle : Claude Haiku 4.5 d'Anthropic, via Batches API + web_search</li>
        </ul>
      </Section>
    </section>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  const headingId = `methode-heading-${n}`;
  return (
    // id is `methode-NN` so cross-section references (e.g. "voir section 07"
    // in §04 intro) can use `<a href="#methode-07">` to deep-link. Without an
    // anchor target the text reads as if it were a link but does nothing on
    // click — broken affordance on a transparency-focused page.
    //
    // role="region" + aria-labelledby promotes the section to a proper SR
    // landmark — VoiceOver rotor / NVDA Insert+R now lists the 7 sections
    // with their titles (else they were anonymous divs in the landmark
    // tree, indistinguishable from each other).
    <div
      id={`methode-${n}`}
      role="region"
      aria-labelledby={headingId}
      // tabIndex=-1 makes the div programmatically focusable so browsers
      // move focus to it after an in-page anchor jump (`<a href="#methode-07">`).
      // Without it, focus stays on the link and keyboard Tab continues from
      // the §04 paragraph instead of the §07 heading — scroll moves but
      // focus doesn't follow.
      tabIndex={-1}
      className="methode-section"
      // scrollMarginTop = TopBar height (~52px sticky) + 12px breathing,
      // PLUS env(safe-area-inset-top) because the TopBar sits below the
      // notch on iOS PWA (cf. session 61 fix in TopBar.tsx). Without the
      // env() term, anchor jumps on iPhone X+ PWA land the heading visually
      // under the TopBar (heading lost behind the bar).
      // (outline:none + focus-visible ring live in index.css under
      // .methode-section so the suppression and the keyboard ring stay
      // in sync — pure inline outline:none would also hide the keyboard
      // focus indicator.)
      style={{
        marginTop: 32,
        paddingTop: 24,
        borderTop: "1px solid var(--line)",
        scrollMarginTop: "calc(64px + env(safe-area-inset-top, 0px))",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 11,
          letterSpacing: "0.12em", color: "var(--accent)", fontWeight: 500,
        }}>{n}</span>
        <h2
          id={headingId}
          style={{
            fontFamily: "var(--font-sans)", fontWeight: 600,
            fontSize: 18, letterSpacing: "-0.012em", margin: 0,
          }}
        >{title}</h2>
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
