// src/components/ReadingPageHeader.tsx
//
// Shared 3-column header used by Methode + Legal: left col is the
// "‹ Retour" back link, center is the Wordmark, right col is empty
// (1fr) so the geometry is balanced and the Wordmark stays centered
// without an invisible spacer span. Before this component, the
// ~10-line block was duplicated identically in both routes — a style
// tweak (border color, padding bump) needed two in-lockstep edits.
//
// aria-label distinguishes this landmark from the TopBar header AND
// the Sommaire <nav> on Methode for SR users navigating by landmarks.

import { Link } from "react-router-dom";
import { Wordmark } from "./Wordmark";
import { FROM_LOGO_STATE } from "../lib/nav-state";
import { ROUTES } from "../lib/routes";
import { PAGE_HEADER_NAV_LABEL, WORDMARK_HOME_LABEL, BACK_ARROW_PREFIX_GLYPH } from "../types";

/** Visible back-link text — matches the Cover/TopBar wordmark Link's
 *  "Accueil" aria-label conceptually, but uses the shorter "‹ Retour"
 *  form because that's what reads natural on reading pages where the
 *  user came from elsewhere. Exported in case a future copy tweak is
 *  needed; the test suite pins the wording. */
export const BACK_LINK_LABEL = "Retour";

export function ReadingPageHeader() {
  return (
    <nav
      aria-label={PAGE_HEADER_NAV_LABEL}
      style={{
        display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "baseline",
        paddingBottom: 14, borderBottom: "1px solid var(--line)",
      }}
    >
      <Link
        to={ROUTES.cover}
        style={{
          color: "var(--ink-2)",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          textDecoration: "none",
          justifySelf: "start",
        }}
      >
        <span aria-hidden="true">{BACK_ARROW_PREFIX_GLYPH}</span>{BACK_LINK_LABEL}
      </Link>
      <Link
        to={ROUTES.cover}
        state={FROM_LOGO_STATE}
        aria-label={WORDMARK_HOME_LABEL}
        style={{ textDecoration: "none", color: "inherit", justifySelf: "center" }}
      >
        <Wordmark />
      </Link>
    </nav>
  );
}
