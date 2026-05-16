// src/routes/Legal.tsx
import { Link } from "react-router-dom";
import { Wordmark } from "../components/Wordmark";

export default function Legal() {
  return (
    <section style={{ maxWidth: 640, margin: "0 auto", padding: "24px var(--gutter) 48px" }}>
      {/* 3-column grid centers the wordmark without needing an invisible
        spacer. Same pattern as Methode.tsx. */}
      <nav style={{
        display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "baseline",
        paddingBottom: 14, borderBottom: "1px solid var(--line)",
      }}>
        <Link to="/" style={{ color: "var(--ink-2)", fontFamily: "var(--font-mono)", fontSize: 11, textDecoration: "none", justifySelf: "start" }}>
          <span aria-hidden="true">‹ </span>Retour
        </Link>
        <Link to="/" state={{ fromLogo: true }} aria-label="Accueil" style={{ textDecoration: "none", color: "inherit", justifySelf: "center" }}>
          <Wordmark size={14} />
        </Link>
      </nav>

      <h1 style={{
        fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 24,
        margin: "32px 0 18px",
      }}>Mentions légales</h1>

      <div style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6 }}>
        <p><strong>Éditeur</strong> — [Nom complet · à compléter]<br/>
        Adresse : [adresse postale]<br/>
        Email : <a href="mailto:contact@sansdetour.fr">contact@sansdetour.fr</a></p>

        <p><strong>Hébergeur</strong> — Vercel Inc.<br/>
        340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>

        <p><strong>Données personnelles</strong> — Sans Détour ne collecte aucune donnée personnelle. Aucune inscription, aucun cookie de tracking. Toutes les interactions sont stockées localement dans le navigateur (localStorage). Aucune donnée n'est transmise à un serveur Sans Détour.</p>

        <p><strong>Analytics</strong> — Plausible (analytics anonymisés sans cookies, conformes RGPD).</p>

        <p><strong>Indépendance</strong> — Sans Détour est un projet indépendant. Aucune affiliation politique, médiatique ou institutionnelle.</p>

        <p><strong>Sources des données</strong> — Open data officiel de l'Assemblée Nationale (<a href="https://data.assemblee-nationale.fr/" target="_blank" rel="noopener noreferrer">data.assemblee-nationale.fr</a>), licence Etalab 2.0.</p>

        <p><strong>Code source</strong> — Open source sous licence MIT, disponible sur <a href="https://github.com/sansdetour" target="_blank" rel="noopener noreferrer">github.com/sansdetour</a>.</p>
      </div>
    </section>
  );
}
