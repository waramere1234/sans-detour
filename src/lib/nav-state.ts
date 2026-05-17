// src/lib/nav-state.ts
//
// Shared navigation-state payloads passed via react-router `<Link state>` /
// `navigate(..., { state })`. Centralising the literals lets readers see all
// state contracts in one place and prevents drift when the field name (or
// the read-side cast in Cover.tsx) is refactored.

/** State payload signalling "the user explicitly clicked the wordmark/logo
 *  to come home" — distinguishes intentional return from a back-button
 *  navigation. Cover.tsx reads this to skip its auto-resume redirect so the
 *  user actually lands on the home screen instead of being bounced back to
 *  their in-progress deck. Set by:
 *  - TopBar wordmark link (every non-Cover route)
 *  - Cover wordmark self-link (re-anchors the page without bouncing)
 *  - Methode + Legal wordmark links in their page headers */
export const FROM_LOGO_STATE = { fromLogo: true } as const;

/** Shape returned by `useLocation().state` when FROM_LOGO_STATE was set —
 *  used by the Cover effect to type-narrow `location.state` before checking
 *  the flag. The optional + null union mirrors react-router's actual runtime
 *  shape (state can be null on the initial route). */
export type LocationStateFromLogo = { fromLogo?: boolean } | null;
