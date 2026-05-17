// scripts/lib/parse-summary.ts
//
// Shared LLM-summary parsing helpers used by both `scripts/ingest-an.ts`
// (initial batch) and `scripts/resume-ingest.ts` (failed-batch recovery).
// Before session 82 these lived duplicated in both scripts — divergence
// risk (e.g. a fix in one branch silently leaving the other broken).
import type { ScrutinAnalyse, Theme } from "../../src/types";

export interface Summary {
  chapeau: string;
  titre_pedago: string;
  contexte: string;
  analyse_loi?: ScrutinAnalyse;
  points_cles?: string[];
  theme?: Theme;
}

export function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export function normalizeAnalyse(a: unknown): ScrutinAnalyse | undefined {
  if (!a || typeof a !== "object") return undefined;
  const o = a as Record<string, unknown>;
  return {
    mesures_principales: asStringArray(o.mesures_principales),
    concernes_positifs: asStringArray(o.concernes_positifs),
    concernes_negatifs: asStringArray(o.concernes_negatifs),
    concernes_neutres: asStringArray(o.concernes_neutres),
    calendrier: asStringArray(o.calendrier),
    exceptions: asStringArray(o.exceptions),
  };
}

// Cap each bullet at 7 words and keep at most 3. Drop empties and trim.
// Hard cap defends the UI from a model that ignored the prompt constraint.
export function normalizePointsCles(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const cleaned = v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 3)
    .map((s) => {
      const w = s.split(/\s+/);
      return w.length <= 7 ? s : w.slice(0, 7).join(" ") + "…";
    });
  return cleaned.length > 0 ? cleaned : undefined;
}

// Walk the JSON text byte-by-byte; when inside a string literal, escape any
// literal control char (\n, \t, \r, etc.) so JSON.parse won't reject the
// long-form LLM output that frequently contains raw newlines inside values.
export function sanitizeJsonControlChars(json: string): string {
  let out = "";
  let inString = false;
  let escapeNext = false;
  for (let i = 0; i < json.length; i++) {
    const c = json[i];
    if (escapeNext) { out += c; escapeNext = false; continue; }
    if (c === "\\") { out += c; escapeNext = true; continue; }
    if (c === '"') { inString = !inString; out += c; continue; }
    if (inString) {
      const code = c.charCodeAt(0);
      if (code === 0x0a) { out += "\\n"; continue; }
      if (code === 0x0d) { out += "\\r"; continue; }
      if (code === 0x09) { out += "\\t"; continue; }
      if (code < 0x20) { out += "\\u" + code.toString(16).padStart(4, "0"); continue; }
    }
    out += c;
  }
  return out;
}

// Best-effort summary when the LLM call fails or is skipped. Truncate the
// raw libellé to ~12 words for titre_pedago, derive a 3-word eyebrow from
// dossier title, use the dossier title (trimmed to 25 words) as contexte.
export function fallbackSummary(titreBrut: string, dossierTitre: string): Summary {
  const words = titreBrut.split(/\s+/).filter(Boolean);
  const titre_pedago = words.slice(0, 14).join(" ") + (words.length > 14 ? "…" : "");
  const dossierWords = (dossierTitre || "scrutin").split(/\s+/).filter(Boolean).slice(0, 3);
  const chapeau = dossierWords.join(" ").toUpperCase().replace(/[.,;:!?]+$/, "");
  const ctxWords = (dossierTitre || "").split(/\s+/).filter(Boolean);
  const contexte = ctxWords.length > 0
    ? ctxWords.slice(0, 25).join(" ") + (ctxWords.length > 25 ? "…" : "")
    : "";
  return { chapeau, titre_pedago, contexte };
}
