declare global {
  interface Window { plausible?: (event: string, options?: { props?: Record<string, string | number> }) => void; }
}

export function track(event: string, props?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  window.plausible?.(event, props ? { props } : undefined);
}
