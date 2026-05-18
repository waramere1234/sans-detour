// src/lib/contact.ts
//
// Centralised contact address — referenced from ErrorBoundary, TopBar
// menu, Cover footer, Methode sections 06 + 07, and MethodeSheet. Before
// this constant, the literal `contact@sansdetour.fr` lived in 6 sites;
// changing the address (or fronting a contact form one day) forced six
// edits with drift risk.

import { BRAND_NAME, PROD_HOSTNAME, MAILTO_SCHEME } from "../types";

/** Local-part of the contact mailbox. The full address composes
 *  `${CONTACT_EMAIL_LOCAL}@${PROD_HOSTNAME}` so a domain rebrand
 *  updates the email alongside the canonical URL. The local part is
 *  expected to stay "contact" through brand transitions. */
const CONTACT_EMAIL_LOCAL = "contact";
export const CONTACT_EMAIL = `${CONTACT_EMAIL_LOCAL}@${PROD_HOSTNAME}`;

/** Pre-filled subject for the "Signaler une erreur factuelle" mailto in
 *  MethodeSheet. Composed from BRAND_NAME so a rebrand propagates to
 *  the subject line via one edit. Previously inlined identically in
 *  MethodeSheet.tsx and tests/contact.test.ts — a copy-paste mismatch
 *  (typo, extra space) would have shipped without notice. */
export const ERROR_REPORT_SUBJECT = `${BRAND_NAME} — Signalement d'une erreur factuelle`;

/** Build a `mailto:` href, optionally with a pre-filled subject line.
 *  Subject is `encodeURIComponent`-ed so spaces, accents, and `:` survive
 *  the URL — Safari and Gmail both decode `%20` / `%C3%A9` correctly. */
export function mailto(subject?: string): string {
  if (!subject) return `${MAILTO_SCHEME}${CONTACT_EMAIL}`;
  return `${MAILTO_SCHEME}${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
