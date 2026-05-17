// src/lib/contact.ts
//
// Centralised contact address — referenced from ErrorBoundary, TopBar
// menu, Cover footer, Methode sections 06 + 07, and MethodeSheet. Before
// this constant, the literal `contact@sansdetour.fr` lived in 6 sites;
// changing the address (or fronting a contact form one day) forced six
// edits with drift risk.

export const CONTACT_EMAIL = "contact@sansdetour.fr";

/** Build a `mailto:` href, optionally with a pre-filled subject line.
 *  Subject is `encodeURIComponent`-ed so spaces, accents, and `:` survive
 *  the URL — Safari and Gmail both decode `%20` / `%C3%A9` correctly. */
export function mailto(subject?: string): string {
  if (!subject) return `mailto:${CONTACT_EMAIL}`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
