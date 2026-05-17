declare global {
  interface Window { plausible?: (event: string, options?: { props?: Record<string, string | number> }) => void; }
}

// Plausible's <script data-domain="sansdetour.fr"> tag is loaded for every
// origin (dev localhost, Vercel preview URLs, prod). Without this hostname
// gate, every dev session and every preview deploy would report events
// against the prod domain's dashboard. Allowed hostnames are the prod
// domain (with or without www) — extend this set if we add real staging
// later. Other hostnames (localhost, *.vercel.app preview, custom forks)
// no-op.
const ANALYTICS_HOSTS = new Set(["sansdetour.fr", "www.sansdetour.fr"]);

/** All event names the app fires. The union (rather than a plain `string`)
 *  makes typos a TypeScript error: `track("vote_clicked")` would compile
 *  silently as `string`, but Plausible would receive a misspelled event and
 *  the metric would quietly drift. Add new events here before adding the
 *  call site. */
export type AnalyticsEvent =
  | "cover_started"
  | "cover_resumed"
  | "cover_restarted"
  | "cover_partial_result"
  | "cover_result_revisit"
  | "cover_footer_nav"
  | "topbar_nav"
  | "result_reached"
  | "result_refaire"
  | "share_clicked"
  | "personnalites_revealed"
  | "affinement_clicked"
  | "methode_toc_click"
  | "vote"
  | "error";

export function track(event: AnalyticsEvent, props?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  if (!ANALYTICS_HOSTS.has(window.location.hostname)) return;
  window.plausible?.(event, props ? { props } : undefined);
}
