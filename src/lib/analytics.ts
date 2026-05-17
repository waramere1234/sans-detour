import { PROD_HOSTNAME } from "../types";

declare global {
  interface Window { plausible?: (event: string, options?: { props?: Record<string, string | number> }) => void; }
}

/** Plausible's <script data-domain="..."> tag is loaded for every
 *  origin (dev localhost, Vercel preview URLs, prod). Without this hostname
 *  gate, every dev session and every preview deploy would report events
 *  against the prod domain's dashboard. Allowed hostnames are the prod
 *  domain (apex + www variant) — extend this set if we add real staging
 *  later. Other hostnames (localhost, *.vercel.app preview, custom forks)
 *  no-op.
 *
 *  Derived from PROD_HOSTNAME (src/types) so a rebrand updates the
 *  canonical URL + the runtime gate atomically — previously the apex
 *  was duplicated as an inline "sansdetour.fr" literal. */
export const ANALYTICS_HOSTS: ReadonlySet<string> = new Set([
  PROD_HOSTNAME,
  `www.${PROD_HOSTNAME}`,
]);

/** All event names the app fires. Runtime-backed (rather than a type-only
 *  union) so the test suite can iterate the canonical list — adding a new
 *  event to the array auto-extends the test coverage instead of having to
 *  remember to also add it to a parallel hardcoded array. The `as const` +
 *  derived union still makes a typo (`track("vote_clicked")`) a TS error. */
export const ANALYTICS_EVENTS = [
  "cover_started",
  "cover_resumed",
  "cover_restarted",
  "cover_partial_result",
  "cover_result_revisit",
  "cover_footer_nav",
  "topbar_nav",
  "result_reached",
  "result_refaire",
  "share_clicked",
  "personnalites_revealed",
  "affinement_clicked",
  "methode_toc_click",
  "vote",
  "error",
] as const;
export type AnalyticsEvent = typeof ANALYTICS_EVENTS[number];

export function track(event: AnalyticsEvent, props?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  if (!ANALYTICS_HOSTS.has(window.location.hostname)) return;
  window.plausible?.(event, props ? { props } : undefined);
}
