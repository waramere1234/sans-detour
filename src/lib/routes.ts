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

/** Play route with the refinement-mode query parameter — Result's
 *  "Continuer à affiner" CTA navigates here after the user completes a
 *  20-vote session. Kept separate from ROUTES.play so a future
 *  switch from query param to a hash or sub-route is a single edit. */
export const PLAY_AFFINEMENT = `${ROUTES.play}?affinement=1` as const;

/** Union of all valid path values, useful for TS-narrowed comparisons
 *  like `location.pathname === ROUTES.methode`. */
export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
