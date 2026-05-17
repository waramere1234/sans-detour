// scripts/lib/parse-summary.ts
//
// Shared LLM-summary parsing helpers used by both `scripts/ingest-an.ts`
// (initial batch) and `scripts/resume-ingest.ts` (failed-batch recovery).
// Before session 82 these lived duplicated in both scripts — divergence
// risk (e.g. a fix in one branch silently leaving the other broken).
import {
  normalizeTheme,
  MAX_POINTS_CLES_BULLETS, MAX_WORDS_PER_BULLET,
  type ScrutinAnalyse, type Theme,
} from "../../src/types";

export interface Summary {
  chapeau: string;
  titre_pedago: string;
  contexte: string;
  analyse_loi?: ScrutinAnalyse;
  points_cles?: string[];
  theme?: Theme;
}

export function asStringArray(v: unknown): string[] {
  // Also drop empty / whitespace-only strings so Card.tsx ColoredSection
  // doesn't render blank <li> bullets when the LLM emits an empty key
  // (rare but observed). normalizePointsCles already does the same filter
  // for points_cles — keeping the two analyse-loi siblings consistent.
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
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

// MAX_POINTS_CLES_BULLETS + MAX_WORDS_PER_BULLET live in src/types so the
// ingest cap (this function), the Card.tsx render slice, and the Methode
// §07 documentation prose share a single source of truth (cross-project
// import direction: scripts can import from src; src cannot import from
// scripts, which would pull script-only deps into the front bundle).
// Cap each bullet at MAX_WORDS_PER_BULLET words and keep at most
// MAX_POINTS_CLES_BULLETS. Drop empties and trim. Hard cap defends the
// UI from a model that ignored the prompt constraint.
export function normalizePointsCles(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const cleaned = v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, MAX_POINTS_CLES_BULLETS)
    .map((s) => {
      const w = s.split(/\s+/);
      return w.length <= MAX_WORDS_PER_BULLET
        ? s
        : w.slice(0, MAX_WORDS_PER_BULLET).join(" ") + "…";
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

/** One line of the JSONL stream Anthropic returns from the Batches API
 *  results endpoint. `custom_id` is the per-request key the script set on
 *  submission (we use the scrutin uid). The `errored` shape mirrors what
 *  Anthropic actually sends — the inner `error.error` is where the
 *  user-facing fields live. Both ingest scripts decode this; the loose
 *  typing on `errored` lets each consumer probe the depth it cares about. */
export interface BatchResultLine {
  custom_id: string;
  result:
    | { type: "succeeded"; message: MinimalAnthropicMessage }
    | {
        type: "errored";
        error?: {
          type?: string;
          message?: string;
          error?: { type?: string; message?: string };
        };
      }
    | { type: "canceled" }
    | { type: "expired" };
}

/** Minimal Anthropic message shape that `extractAnthropicSummary` inspects.
 *  Each script defines its own full Anthropic response type with extra
 *  per-block variants (thinking, server_tool_use, etc.); this lib only needs
 *  the content array (text blocks) and the stop_reason for error reporting. */
export interface MinimalAnthropicMessage {
  content: Array<{ type: string; text?: string }>;
  stop_reason: string;
}

/** Extract a Summary from a successful Anthropic batch message.
 *
 *  Flow (session 95 extracted from both ingest scripts):
 *  1. Concatenate every `type === "text"` block (Anthropic interleaves
 *     thinking + server_tool_use + text blocks for web_search runs).
 *  2. Match the first balanced `{...}` JSON object in the concatenation.
 *  3. Sanitize control chars (LLM output often has literal newlines inside
 *     string values) and JSON.parse.
 *  4. Whitelist chapeau / titre_pedago / contexte / analyse_loi /
 *     points_cles / theme — anything else is dropped (a hallucinated
 *     "erreur" key would otherwise break the Postgres upsert).
 *  5. Throw on missing chapeau or titre_pedago — the caller in both
 *     scripts catches and substitutes a fallback summary.
 *
 *  The error messages are tuned to surface enough context to debug a
 *  failing batch chunk: stop_reason + block types if no text block,
 *  first 300 chars of the combined text if no JSON, list of stray keys
 *  if the model emitted unexpected fields. */
export function extractAnthropicSummary(message: MinimalAnthropicMessage): Summary {
  const textBlocks = message.content.filter(
    (b): b is { type: "text"; text: string } =>
      b.type === "text" && typeof b.text === "string",
  );
  if (textBlocks.length === 0) {
    const blockTypes = message.content.map((b) => b.type).join(",");
    throw new Error(
      `No text block. stop_reason=${message.stop_reason}, blocks=[${blockTypes}]`,
    );
  }
  const combined = textBlocks.map((b) => b.text).join("\n");
  const m = combined.match(/\{[\s\S]*\}/);
  if (!m) {
    throw new Error(`No JSON in response. text=${combined.slice(0, 300)}`);
  }
  const safe = sanitizeJsonControlChars(m[0]);
  const raw = JSON.parse(safe) as Record<string, unknown>;

  const chapeau = typeof raw.chapeau === "string" ? raw.chapeau.trim() : "";
  const titre_pedago = typeof raw.titre_pedago === "string" ? raw.titre_pedago.trim() : "";
  const contexte = typeof raw.contexte === "string" ? raw.contexte.trim() : "";
  if (!chapeau || !titre_pedago) {
    const expected = ["chapeau", "titre_pedago", "contexte", "analyse_loi", "points_cles", "theme"];
    const stray = Object.keys(raw).filter((k) => !expected.includes(k));
    throw new Error(
      `Missing required fields (chapeau or titre_pedago). Stray keys: [${stray.join(",")}]`,
    );
  }
  return {
    chapeau,
    titre_pedago,
    contexte,
    analyse_loi: normalizeAnalyse(raw.analyse_loi),
    points_cles: normalizePointsCles(raw.points_cles),
    theme: normalizeTheme(raw.theme),
  };
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
