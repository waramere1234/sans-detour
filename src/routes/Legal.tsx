// src/routes/Legal.tsx
import { ReadingPageHeader } from "../components/ReadingPageHeader";
import { CONTACT_EMAIL, mailto } from "../lib/contact";
import {
  AN_OPEN_DATA_URL, AN_OPEN_DATA_HOSTNAME,
  GITHUB_REPO_URL, GITHUB_REPO_DISPLAY,
  READING_PAGE_SECTION_PADDING,
  externalLinkLabel, MENU_LEGAL_LABEL,
  LEGAL_RGPD_HEADING_EDITEUR, LEGAL_RGPD_HEADING_HEBERGEUR,
  LEGAL_RGPD_HEADING_DONNEES_PERSONNELLES, LEGAL_RGPD_HEADING_ANALYTICS,
  LEGAL_RGPD_HEADING_INDEPENDANCE, LEGAL_RGPD_HEADING_SOURCES_DONNEES,
  LEGAL_RGPD_HEADING_CODE_SOURCE,
  LEGAL_HEBERGEUR_NAME, LEGAL_HEBERGEUR_ADDRESS,
  LEGAL_ANALYTICS_DESCRIPTION, LEGAL_DATA_LICENSE_LABEL,
  LEGAL_PERSONAL_DATA_BODY,
  LEGAL_INDEPENDANCE_BODY,
} from "../types";

export default function Legal() {
  return (
    <section style={{ maxWidth: 640, margin: "0 auto", padding: READING_PAGE_SECTION_PADDING }}>
      <ReadingPageHeader />

      <h1 style={{
        fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 24,
        margin: "32px 0 18px",
      }}>{MENU_LEGAL_LABEL}</h1>

      <div style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6 }}>
        {/* TODO production-blocker · "[à compléter]" placeholders must be
          replaced with real legal identity before ship. Visible to users
          today — deploying as-is means RGPD non-compliance on the editor
          identity line. Do NOT remove this comment until both square-
          bracket placeholders below are real values. (Previously referenced
          SHIP-V1.md §4 "Mentions légales" — that section never existed:
          §4 is "Déploiement Vercel". The reference is now intrinsic to
          this file so it can't drift again.) */}
        <p><strong>{LEGAL_RGPD_HEADING_EDITEUR}</strong> — [Nom complet · à compléter]<br/>
        Adresse : [adresse postale]<br/>
        Email : <a href={mailto()}>{CONTACT_EMAIL}</a></p>

        <p><strong>{LEGAL_RGPD_HEADING_HEBERGEUR}</strong> — {LEGAL_HEBERGEUR_NAME}<br/>
        {LEGAL_HEBERGEUR_ADDRESS}</p>

        <p><strong>{LEGAL_RGPD_HEADING_DONNEES_PERSONNELLES}</strong> — {LEGAL_PERSONAL_DATA_BODY}</p>

        <p><strong>{LEGAL_RGPD_HEADING_ANALYTICS}</strong> — {LEGAL_ANALYTICS_DESCRIPTION}</p>

        <p><strong>{LEGAL_RGPD_HEADING_INDEPENDANCE}</strong> — {LEGAL_INDEPENDANCE_BODY}</p>

        <p><strong>{LEGAL_RGPD_HEADING_SOURCES_DONNEES}</strong> — Open data officiel de l'Assemblée Nationale (<a href={AN_OPEN_DATA_URL} target="_blank" rel="noopener noreferrer" aria-label={externalLinkLabel(AN_OPEN_DATA_HOSTNAME)}>{AN_OPEN_DATA_HOSTNAME}</a>), {LEGAL_DATA_LICENSE_LABEL}.</p>

        {/* TODO production-blocker · same broken github.com/sansdetour
            link as Methode §06 + §07 (real repo is private at
            waramere1234/sans-detour per CLAUDE.md). AND no LICENSE.md
            exists in the repo despite the "MIT" claim — once the repo
            is published, also add LICENSE.md before exposing this link
            (RGPD/legal cleanliness). Drop this <p> entirely if the open-
            source path is deferred. */}
        <p><strong>{LEGAL_RGPD_HEADING_CODE_SOURCE}</strong> — Open source sous licence MIT, disponible sur <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" aria-label={externalLinkLabel(GITHUB_REPO_DISPLAY)}>{GITHUB_REPO_DISPLAY}</a>.</p>
      </div>
    </section>
  );
}
