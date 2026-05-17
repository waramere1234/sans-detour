// src/lib/routes.ts
//
// Centralised route-path constants. Before this lib, the 5 route literals
// ("/", "/play", "/result", "/methode", "/legal") plus the `?affinement=1`
// variant were inlined at 41+ sites across main.tsx (Route definitions),
// the route components (navigate calls + Link `to`), and TopBar
// (location.pathname comparisons). A rename — say `/play` → `/swipe` —
// would force 41 careful edits; a typo at any one of them silently 404s.
//
// The `as const` annotation gives each value a literal-string type so
// `<Route path={ROUTES.play}>` and `navigate(ROUTES.play)` both type as
// `"/play"` rather than widened `string`.

export const ROUTES = {
  cover: "/",
  play: "/play",
  result: "/result",
  methode: "/methode",
  legal: "/legal",
} as const;

/** Query-parameter key + value that flips Play.tsx into refinement mode.
 *  Exported so the routes.ts composition + the Play.tsx `params.get(...)`
 *  reads share one source of truth — previously the strings lived inline
 *  at 3 sites (PLAY_AFFINEMENT + 2 reads), so renaming the parameter
 *  ("affinement" → "refinement") would have left the parsing reads
 *  stuck on the old key while the navigation target switched. */
export const AFFINEMENT_PARAM = "affinement";
export const AFFINEMENT_VALUE = "1";

/** Play route with the refinement-mode query parameter — Result's
 *  "Continuer à affiner" CTA navigates here after the user completes a
 *  20-vote session. Kept separate from ROUTES.play so a future
 *  switch from query param to a hash or sub-route is a single edit. */
export const PLAY_AFFINEMENT = `${ROUTES.play}?${AFFINEMENT_PARAM}=${AFFINEMENT_VALUE}` as const;

/** True iff the URLSearchParams carry the refinement-mode flag. Wraps the
 *  param/value pair so callers don't re-implement the comparison and can't
 *  drift out of sync when the param name changes. */
export function isAffinementMode(params: URLSearchParams): boolean {
  return params.get(AFFINEMENT_PARAM) === AFFINEMENT_VALUE;
}

/** Union of all valid path values, useful for TS-narrowed comparisons
 *  like `location.pathname === ROUTES.methode`. */
export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
