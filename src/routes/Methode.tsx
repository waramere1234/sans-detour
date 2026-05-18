import { useEffect } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { FreshnessBanner } from "../components/FreshnessBanner";
import { ReadingPageHeader } from "../components/ReadingPageHeader";
import { useFreshnessOnce } from "../hooks/useFreshnessOnce";
import { track } from "../lib/analytics";
import { CONTACT_EMAIL, mailto } from "../lib/contact";
import { DEFAULT_CAP_PER_DOSSIER, DEFAULT_CAP_PER_CHAPEAU_PREFIX } from "../lib/deck";
import { THRESHOLD } from "../lib/compute-positions";
import {
  TARGET, MIN_FOR_RANKING, MAX_POINTS_CLES_BULLETS,
  AN_OPEN_DATA_URL, AN_OPEN_DATA_HOSTNAME,
  GITHUB_REPO_URL, GITHUB_REPO_DISPLAY,
  READING_PAGE_MAX_WIDTH, READING_PAGE_SECTION_PADDING,
  externalLinkLabel, AN_LINK_VISIBLE_LABEL,
  METHODE_SOMMAIRE_NAV_LABEL,
  METHODE_PAGE_EYEBROW, METHODE_PAGE_H1,
  METHODE_S07_HEADING_CE_QUE_FAIT_CLAUDE,
  METHODE_S07_HEADING_CE_QU_IL_NE_FAIT_PAS,
  METHODE_S07_HEADING_CADRE_BIAIS,
  METHODE_S07_HEADING_LIMITES_SIGNALEMENT,
  METHODE_S06_NO_AFFILIATION_PHRASE,
  METHODE_S06_HOSTING_FUNDING_BODY,
  METHODE_S05_NO_TRACKING_PHRASE,
  METHODE_S05_LOCALSTORAGE_EXPLANATION, METHODE_S05_LOCALSTORAGE_TAIL,
  METHODE_S01_UPDATE_CADENCE,
  METHODE_S03_DIVIDED_RULE_BODY, METHODE_S03_DIVIDED_RULE_TAIL,
  METHODE_S03_GROUP_INTRO,
  METHODE_S07_MISE_EN_FORME_CLOSER, METHODE_S07_LIBELLE_BRUT_GUARANTEE,
  METHODE_PAGE_LEAD_INTRO, METHODE_PAGE_LEAD_PURE_MATH,
  METHODE_S04_OPENER, METHODE_S02_EXCLUSIONS_SUFFIX,
  METHODE_S07_MODEL_DISCLOSURE,
  METHODE_S07_CLAUDE_TASKS_PREFIX, METHODE_S07_CLAUDE_TASKS_SUFFIX,
  METHODE_S07_LIMITES_DISCLAIMER_PREFIX, METHODE_S07_LIMITES_DISCLAIMER_SUFFIX,
  METHODE_S07_NE_FAIT_PAS_BODY,
  METHODE_S07_CADRE_BIAIS_PREFIX, METHODE_S07_CADRE_BIAIS_SUFFIX,
  METHODE_S07_AN_LINK_PARENTHETICAL_PREFIX, METHODE_S07_AN_LINK_PARENTHETICAL_SUFFIX,
  METHODE_S06_INDEPENDENCE_OPENER_PREFIX, METHODE_S06_INDEPENDENCE_STRONG,
  METHODE_S06_INDEPENDENCE_OPENER_SUFFIX,
  METHODE_S03_DIVIDED_STRONG_LABEL,
  METHODE_S01_DATA_SOURCE_OPENER_PREFIX, METHODE_S01_DATA_SOURCE_TO_CODE_SEPARATOR,
  METHODE_S02_KEPT_OPENER_PREFIX,
  METHODE_S04_RANK_OPENER_PREFIX, METHODE_S04_RANK_BRIDGE_SEPARATOR,
  METHODE_S05_LOCALSTORAGE_CODE_LABEL,
  METHODE_S02_CAPS_EXAMPLE,
  METHODE_S01_DATA_SOURCE_STRONG, METHODE_S01_DATA_SOURCE_QUALITY_CLAIM,
  METHODE_S04_RANK_NOISE_EXPLANATION,
  METHODE_S01_SAME_FILES_CLAIM,
  METHODE_S02_THEMES_EXAMPLES,
  METHODE_S03_ABSENTS_EXCLUSION,
  METHODE_S02_KEPT_SOLENNELS, METHODE_S02_KEPT_VOTES_FINAUX,
  METHODE_S02_KEPT_CENSURE, METHODE_S02_KEPT_REFERENDAIRES, METHODE_S02_KEPT_PROPOSITIONS,
  METHODE_S04_FORMULA_LINES,
  METHODE_S03_THRESHOLD_RULE_SUFFIX, METHODE_S03_THRESHOLD_RULE_ELSE,
  METHODE_S02_RANDOM_AVOIDANCE, METHODE_S02_GARDE_FOUS_LEAD,
  METHODE_S02_GARDE_FOU_LEAD,
  METHODE_S02_GARDE_FOU_DOSSIER_SUFFIX, METHODE_S02_GARDE_FOU_SUJET_SUFFIX,
  METHODE_S04_RANK_THRESHOLD_SUFFIX,
  METHODE_PAGE_LEAD_TAIL, METHODE_PAGE_LEAD_SECTION_07_REF,
} from "../types";

/** Section ids + short TOC labels. Single source of truth for both the
 *  inline Sommaire above and the test suite (which iterates over this
 *  array to assert section ids + anchor hrefs exist).
 *
 *  Adding section 08 here without also adding a matching `<Section n="08">`
 *  body below silently 404s the TOC link in production — the tests pin
 *  the round-trip (every entry here ↔ every `<Section>` body rendered)
 *  so a forgotten body surfaces before merge. */
export const METHODE_SECTIONS = [
  ["01", "Données"],
  ["02", "Scrutins"],
  ["03", "Position d'un groupe"],
  ["04", "Calcul"],
  ["05", "Confidentialité"],
  ["06", "Indépendance"],
  ["07", "IA Claude"],
] as const satisfies ReadonlyArray<readonly [string, string]>;
export type MethodeSectionId = typeof METHODE_SECTIONS[number][0];

/** Section body titles — the full descriptive h2 rendered by each
 *  `<Section>` (vs METHODE_SECTIONS which has the short TOC nav
 *  labels). 7 titles map 1:1 to the 7 section ids. Centralised so
 *  a rewording propagates from one edit + the tests can iterate
 *  to verify each rendered Section has the canonical body title. */
export const METHODE_SECTION_BODY_TITLES: Record<MethodeSectionId, string> = {
  "01": "D'où viennent les données",
  "02": "Quels scrutins on garde",
  "03": "Comment on définit la position d'un groupe",
  "04": "Comment on calcule ton alignement",
  "05": "Ce qu'on ne fait pas avec tes données",
  "06": "Indépendance & financement",
  "07": "Le rôle de l'IA Claude",
};

/** Methode source-list annotations rendered as " — {annotation}" after
 *  each external-link bullet in §06 + §07. Each describes what the
 *  link is (open data, code source, signalement). Centralised so a
 *  rewording propagates from one edit. */
export const METHODE_LINK_ANNOTATION_OPEN_DATA = "open data officiel";
export const METHODE_LINK_ANNOTATION_CODE_SOURCE_MIT = "code source MIT";
export const METHODE_LINK_ANNOTATION_PROMPT_CODE_PUBLIC = "prompt et code source publics";
export const METHODE_LINK_ANNOTATION_SIGNALER_ERREUR = "signaler une erreur";

export default function Methode() {
  // Freshness fetch + once-per-mount guard live in the useFreshnessOnce
  // hook (session 99), shared with Cover.tsx.
  const info = useFreshnessOnce();
  const location = useLocation();

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
    <section style={{ maxWidth: READING_PAGE_MAX_WIDTH, margin: "0 auto", padding: READING_PAGE_SECTION_PADDING }}>
      <ReadingPageHeader />

      <header style={{ marginTop: 24 }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10.5,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: "var(--ink-3)",
        }}>{METHODE_PAGE_EYEBROW}</span>
        <h1 style={{
          fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 28,
          lineHeight: 1.15, letterSpacing: "-0.022em", margin: "10px 0 0",
        }}>{METHODE_PAGE_H1}<span style={{ color: "var(--accent)" }}>.</span></h1>
        <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55, marginTop: 12 }}>
          {METHODE_PAGE_LEAD_INTRO} <strong>{METHODE_PAGE_LEAD_PURE_MATH}</strong> {METHODE_PAGE_LEAD_TAIL}<a href="#methode-07" style={{ color: "var(--accent)" }}>{METHODE_PAGE_LEAD_SECTION_07_REF}</a>).
        </p>
      </header>

      {info && <div style={{ marginTop: 18 }}><FreshnessBanner info={info} /></div>}

      {/* Sommaire — la page fait 7 sections, sans nav rapide l'user doit
        scroller pour trouver une partie précise. Les ancres `#methode-NN`
        existent déjà (cf. Section component) ; on les expose ici. */}
      <nav
        aria-label={METHODE_SOMMAIRE_NAV_LABEL}
        style={{
          marginTop: 24, padding: "12px 14px",
          border: "1px solid var(--line)", borderRadius: 6,
          background: "var(--bg-2)",
          display: "flex", flexWrap: "wrap", gap: "6px 14px",
          fontFamily: "var(--font-mono)", fontSize: 11.5,
          letterSpacing: "0.04em",
        }}
      >
        {METHODE_SECTIONS.map(([n, label]) => (
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

      <Section n="01" title={METHODE_SECTION_BODY_TITLES["01"]}>
        <p>{METHODE_S01_DATA_SOURCE_OPENER_PREFIX}<strong>{METHODE_S01_DATA_SOURCE_STRONG}</strong>{METHODE_S01_DATA_SOURCE_TO_CODE_SEPARATOR}<code>{AN_OPEN_DATA_HOSTNAME}</code>. {METHODE_S01_SAME_FILES_CLAIM} {METHODE_S01_DATA_SOURCE_QUALITY_CLAIM}</p>
        <p>{METHODE_S01_UPDATE_CADENCE}</p>
      </Section>

      <Section n="02" title={METHODE_SECTION_BODY_TITLES["02"]}>
        <p>{METHODE_S02_KEPT_OPENER_PREFIX}<strong>{METHODE_S02_KEPT_SOLENNELS}</strong> (SPS), les <strong>{METHODE_S02_KEPT_VOTES_FINAUX}</strong> (SOR), les <strong>{METHODE_S02_KEPT_CENSURE}</strong>, les <strong>{METHODE_S02_KEPT_REFERENDAIRES}</strong> et les <strong>{METHODE_S02_KEPT_PROPOSITIONS}</strong>. {METHODE_S02_EXCLUSIONS_SUFFIX}</p>
        <p>Pour chaque session, on en tire <strong>{TARGET}</strong> en équilibrant les thèmes ({METHODE_S02_THEMES_EXAMPLES}) {METHODE_S02_RANDOM_AVOIDANCE}, {METHODE_S02_GARDE_FOUS_LEAD} : <strong>{METHODE_S02_GARDE_FOU_LEAD}{DEFAULT_CAP_PER_DOSSIER}{METHODE_S02_GARDE_FOU_DOSSIER_SUFFIX}</strong> et <strong>{METHODE_S02_GARDE_FOU_LEAD}{DEFAULT_CAP_PER_CHAPEAU_PREFIX}{METHODE_S02_GARDE_FOU_SUJET_SUFFIX}</strong> ({METHODE_S02_CAPS_EXAMPLE}).</p>
      </Section>

      <Section n="03" title={METHODE_SECTION_BODY_TITLES["03"]}>
        <p>{METHODE_S03_GROUP_INTRO}</p>
        <Formula>
          si ≥ {Math.round(THRESHOLD * 100)}{METHODE_S03_THRESHOLD_RULE_SUFFIX}<br/>
          {METHODE_S03_THRESHOLD_RULE_ELSE}<br/>
          {METHODE_S03_ABSENTS_EXCLUSION}
        </Formula>
        <p>{METHODE_S03_DIVIDED_RULE_BODY}<strong>{METHODE_S03_DIVIDED_STRONG_LABEL}</strong>{METHODE_S03_DIVIDED_RULE_TAIL}</p>
      </Section>

      <Section n="04" title={METHODE_SECTION_BODY_TITLES["04"]}>
        <p>{METHODE_S04_OPENER}</p>
        <Formula>
          {METHODE_S04_FORMULA_LINES[0]}<br/>
          &nbsp;&nbsp;{METHODE_S04_FORMULA_LINES[1]}<br/>
          &nbsp;&nbsp;{METHODE_S04_FORMULA_LINES[2]}<br/>
          &nbsp;&nbsp;{METHODE_S04_FORMULA_LINES[3]}<br/>
          <br/>
          {METHODE_S04_FORMULA_LINES[4]}
        </Formula>
        <p>{METHODE_S04_RANK_OPENER_PREFIX}<strong>{MIN_FOR_RANKING}<sup>e</sup>{METHODE_S04_RANK_THRESHOLD_SUFFIX}</strong>{METHODE_S04_RANK_BRIDGE_SEPARATOR}{METHODE_S04_RANK_NOISE_EXPLANATION}.</p>
      </Section>

      <Section n="05" title={METHODE_SECTION_BODY_TITLES["05"]}>
        <p>{METHODE_S05_NO_TRACKING_PHRASE}</p>
        <p>{METHODE_S05_LOCALSTORAGE_EXPLANATION}<code>{METHODE_S05_LOCALSTORAGE_CODE_LABEL}</code>{METHODE_S05_LOCALSTORAGE_TAIL}</p>
      </Section>

      <Section n="06" title={METHODE_SECTION_BODY_TITLES["06"]}>
        <p>{METHODE_S06_INDEPENDENCE_OPENER_PREFIX}<strong>{METHODE_S06_INDEPENDENCE_STRONG}</strong>{METHODE_S06_INDEPENDENCE_OPENER_SUFFIX}{METHODE_S06_NO_AFFILIATION_PHRASE}</p>
        <p>{METHODE_S06_HOSTING_FUNDING_BODY}</p>
        <ul style={{ paddingLeft: 18, color: "var(--ink-2)" }}>
          <li><a href={AN_OPEN_DATA_URL} target="_blank" rel="noopener noreferrer" aria-label={externalLinkLabel(AN_OPEN_DATA_HOSTNAME)}>{AN_OPEN_DATA_HOSTNAME}</a> — {METHODE_LINK_ANNOTATION_OPEN_DATA}</li>
          {/* TODO production-blocker · github.com/sansdetour is a 404 today
              (real repo is private at waramere1234/sans-detour per CLAUDE.md)
              AND no LICENSE file exists despite the "MIT" claim. Either
              publish under the sansdetour org with a LICENSE.md, or drop
              this bullet until the repo is public. Same TODO in §07 below
              and in Legal.tsx — keep them in sync. */}
          <li><a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" aria-label={externalLinkLabel(GITHUB_REPO_DISPLAY)}>{GITHUB_REPO_DISPLAY}</a> — {METHODE_LINK_ANNOTATION_CODE_SOURCE_MIT}</li>
          <li><a href={mailto()}>{CONTACT_EMAIL}</a> — {METHODE_LINK_ANNOTATION_SIGNALER_ERREUR}</li>
        </ul>
      </Section>

      <Section n="07" title={METHODE_SECTION_BODY_TITLES["07"]}>
        <p><strong>{METHODE_S07_HEADING_CE_QUE_FAIT_CLAUDE}</strong> {METHODE_S07_CLAUDE_TASKS_PREFIX}{MAX_POINTS_CLES_BULLETS}{METHODE_S07_CLAUDE_TASKS_SUFFIX} <strong>{METHODE_S07_MISE_EN_FORME_CLOSER}</strong></p>

        <p><strong>{METHODE_S07_HEADING_CE_QU_IL_NE_FAIT_PAS}</strong> {METHODE_S07_NE_FAIT_PAS_BODY}</p>

        <p><strong>{METHODE_S07_HEADING_CADRE_BIAIS}</strong> {METHODE_S07_CADRE_BIAIS_PREFIX}<strong>{METHODE_S07_LIBELLE_BRUT_GUARANTEE}</strong> {METHODE_S07_AN_LINK_PARENTHETICAL_PREFIX}{AN_LINK_VISIBLE_LABEL}{METHODE_S07_AN_LINK_PARENTHETICAL_SUFFIX}{METHODE_S07_CADRE_BIAIS_SUFFIX}</p>

        <p><strong>{METHODE_S07_HEADING_LIMITES_SIGNALEMENT}</strong> {METHODE_S07_LIMITES_DISCLAIMER_PREFIX}<a href={mailto()}>{CONTACT_EMAIL}</a>{METHODE_S07_LIMITES_DISCLAIMER_SUFFIX}</p>

        <ul style={{ paddingLeft: 18, color: "var(--ink-2)", marginTop: 12 }}>
          {/* TODO production-blocker · same broken github.com/sansdetour
              link as §06 above. The "prompt et code source publics" claim
              is aspirational until the repo is published. */}
          <li><a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" aria-label={externalLinkLabel(GITHUB_REPO_DISPLAY)}>{GITHUB_REPO_DISPLAY}</a> — {METHODE_LINK_ANNOTATION_PROMPT_CODE_PUBLIC}</li>
          <li>{METHODE_S07_MODEL_DISCLOSURE}</li>
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
