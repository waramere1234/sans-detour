// src/routes/Legal.tsx
import { ReadingPageHeader } from "../components/ReadingPageHeader";
import { CONTACT_EMAIL, mailto } from "../lib/contact";
import {
  AN_OPEN_DATA_URL, AN_OPEN_DATA_HOSTNAME,
  GITHUB_REPO_URL, GITHUB_REPO_DISPLAY,
  externalLinkLabel,
} from "../types";

export default function Legal() {
  return (
    <section style={{ maxWidth: 640, margin: "0 auto", padding: "24px var(--gutter) 48px" }}>
      <ReadingPageHeader />

      <h1 style={{
        fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 24,
        margin: "32px 0 18px",
      }}>Mentions légales</h1>

      <div style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6 }}>
        {/* TODO production-blocker · "[à compléter]" placeholders must be
          replaced with real legal identity before ship. Visible to users
          today — deploying as-is means RGPD non-compliance on the editor
          identity line. Do NOT remove this comment until both square-
          bracket placeholders below are real values. (Previously referenced
          SHIP-V1.md §4 "Mentions légales" — that section never existed:
          §4 is "Déploiement Vercel". The reference is now intrinsic to
          this file so it can't drift again.) */}
        <p><strong>Éditeur</strong> — [Nom complet · à compléter]<br/>
        Adresse : [adresse postale]<br/>
        Email : <a href={mailto()}>{CONTACT_EMAIL}</a></p>

        <p><strong>Hébergeur</strong> — Vercel Inc.<br/>
        340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>

        <p><strong>Données personnelles</strong> — Sans Détour ne collecte aucune donnée personnelle. Aucune inscription, aucun cookie de tracking. Toutes les interactions sont stockées localement dans le navigateur (localStorage). Aucune donnée n'est transmise à un serveur Sans Détour.</p>

        <p><strong>Analytics</strong> — Plausible (analytics anonymisés sans cookies, conformes RGPD).</p>

        <p><strong>Indépendance</strong> — Sans Détour est un projet indépendant. Aucune affiliation politique, médiatique ou institutionnelle.</p>

        <p><strong>Sources des données</strong> — Open data officiel de l'Assemblée Nationale (<a href={AN_OPEN_DATA_URL} target="_blank" rel="noopener noreferrer" aria-label={externalLinkLabel(AN_OPEN_DATA_HOSTNAME)}>{AN_OPEN_DATA_HOSTNAME}</a>), licence Etalab 2.0.</p>

        {/* TODO production-blocker · same broken github.com/sansdetour
            link as Methode §06 + §07 (real repo is private at
            waramere1234/sans-detour per CLAUDE.md). AND no LICENSE.md
            exists in the repo despite the "MIT" claim — once the repo
            is published, also add LICENSE.md before exposing this link
            (RGPD/legal cleanliness). Drop this <p> entirely if the open-
            source path is deferred. */}
        <p><strong>Code source</strong> — Open source sous licence MIT, disponible sur <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" aria-label={externalLinkLabel(GITHUB_REPO_DISPLAY)}>{GITHUB_REPO_DISPLAY}</a>.</p>
      </div>
    </section>
  );
}
