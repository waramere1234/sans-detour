// src/routes/Legal.tsx
import { Link } from "react-router-dom";
import { Wordmark } from "../components/Wordmark";

export default function Legal() {
  return (
    <section style={{ maxWidth: 640, margin: "0 auto", padding: "24px 22px 48px" }}>
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        paddingBottom: 14, borderBottom: "1px solid var(--line)",
      }}>
        <Link to="/" style={{ color: "var(--ink-2)", fontFamily: "var(--font-mono)", fontSize: 11, textDecoration: "none" }}>‹ Retour</Link>
        <Wordmark size={14} />
        <span style={{ visibility: "hidden" }}>‹</span>
      </nav>

      <h1 style={{
        fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 24,
        margin: "32px 0 18px",
      }}>Mentions légales</h1>

      <div style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6 }}>
        <p><b>Éditeur</b> — [Nom complet · à compléter]<br/>
        Adresse : [adresse postale]<br/>
        Email : <a href="mailto:contact@sansdetour.fr">contact@sansdetour.fr</a></p>

        <p><b>Hébergeur</b> — Vercel Inc.<br/>
        340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>

        <p><b>Données personnelles</b> — Sans Détour ne collecte aucune donnée personnelle. Aucune inscription, aucun cookie de tracking. Toutes les interactions sont stockées localement dans le navigateur (localStorage). Aucune donnée n'est transmise à un serveur Sans Détour.</p>

        <p><b>Analytics</b> — Plausible (analytics anonymisés sans cookies, conformes RGPD).</p>

        <p><b>Indépendance</b> — Sans Détour est un projet indépendant. Aucune affiliation politique, médiatique ou institutionnelle.</p>

        <p><b>Sources des données</b> — Open data officiel de l'Assemblée Nationale (<a href="https://data.assemblee-nationale.fr/" target="_blank" rel="noopener noreferrer">data.assemblee-nationale.fr</a>), licence Etalab 2.0.</p>

        <p><b>Code source</b> — Open source sous licence MIT, disponible sur <a href="https://github.com/sansdetour" target="_blank" rel="noopener noreferrer">github.com/sansdetour</a>.</p>
      </div>
    </section>
  );
}
