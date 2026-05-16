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

export function track(event: string, props?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  if (!ANALYTICS_HOSTS.has(window.location.hostname)) return;
  window.plausible?.(event, props ? { props } : undefined);
}
