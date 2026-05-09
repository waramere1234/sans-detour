// scripts/ingest-an.ts
//
// One-shot bootstrap: download all scrutins of the 17e legislature from
// data.assemblee-nationale.fr, filter to "scrutins publics solennels" (SPS),
// parse + compute group positions + (optionally) generate LLM summaries,
// upsert into Supabase.
//
// Usage:
//   SUPABASE_URL=https://xxx.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
//   [ANTHROPIC_API_KEY=sk-ant-...] \
//   npm run ingest:an
//
// If ANTHROPIC_API_KEY is missing, titre_pedago/chapeau fall back to a
// truncated form of the raw AN libellé. Re-run later with the key set
// to upgrade the rows in place.

import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { computeGroupPosition } from "../src/lib/compute-positions";
import type { GroupCode, GroupPosition, GroupVoteBreakdown } from "../src/types";

// ───────────────────────────────────────────────────────────────── config

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env");
  process.exit(1);
}

const BULK_URL =
  "https://data.assemblee-nationale.fr/static/openData/repository/17/loi/scrutins/Scrutins.json.zip";
const CACHE_DIR = "/tmp/sd-an-cache";
const ZIP_PATH = path.join(CACHE_DIR, "Scrutins.json.zip");
const JSON_DIR = path.join(CACHE_DIR, "json");

/**
 * AN organeRef → internal GroupCode. Triangulated from observed group sizes
 * across the 46 SPS scrutins of the 17e legislature; verified for RN/LFI/ECO
 * via instances/resume pages on assemblee-nationale.fr.
 *
 * PO847173 and PO872880 both correspond to "Union des droites pour la
 * République" — the group was reconstituted around 2025-09 with a new
 * organeRef but the same political identity, so we collapse both to UDR.
 *
 * PO840056 is the non-inscrits pool (~10 deputies) — excluded from the app
 * since it is not a parliamentary group.
 */
const GROUP_MAPPING: Record<string, GroupCode | null> = {
  PO845401: "RN",
  PO845407: "EPR",
  PO845413: "LFI",
  PO845419: "SOC",
  PO845425: "DR",
  PO845439: "ECO",
  PO845454: "DEM",
  PO845470: "HOR",
  PO845485: "LIOT",
  PO845514: "GDR",
  PO847173: "UDR",
  PO872880: "UDR",
  PO840056: null,
};

// ─────────────────────────────────────────────────────── AN bulk download

async function ensureBulk(): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  try {
    const stat = await fs.stat(JSON_DIR);
    if (stat.isDirectory()) {
      const files = await fs.readdir(JSON_DIR);
      if (files.length > 1000) {
        console.log(`✓ AN cache hit: ${files.length} files in ${JSON_DIR}`);
        return;
      }
    }
  } catch {
    // fall through
  }

  console.log(`↓ Downloading ${BULK_URL} …`);
  const r = await fetch(BULK_URL);
  if (!r.ok) throw new Error(`AN download failed: ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  await fs.writeFile(ZIP_PATH, buf);
  console.log(`✓ Saved ${(buf.length / 1024 / 1024).toFixed(1)} MB to ${ZIP_PATH}`);

  console.log(`⊟ Unzipping…`);
  execSync(`unzip -oq "${ZIP_PATH}" -d "${CACHE_DIR}"`, { stdio: "inherit" });
  const files = await fs.readdir(JSON_DIR);
  console.log(`✓ Extracted ${files.length} scrutin files to ${JSON_DIR}`);
}

// ──────────────────────────────────────────────────────── AN scrutin parse

interface ANGroupVote {
  organeRef: string;
  nombreMembresGroupe: string;
  vote: {
    positionMajoritaire: string;
    decompteVoix: {
      nonVotants: string;
      pour: string;
      contre: string;
      abstentions: string;
      nonVotantsVolontaires: string;
    };
  };
}

interface ANScrutinRaw {
  uid: string;
  numero: string;
  dateScrutin: string;
  typeVote: { codeTypeVote: string; libelleTypeVote: string };
  objet: {
    libelle: string;
    dossierLegislatif: { libelle: string; dossierRef: string } | null;
  };
  ventilationVotes: {
    organe: { groupes: { groupe: ANGroupVote[] } };
  };
}

interface ParsedScrutin {
  id: string;
  numero: number;
  date: string;
  dossier_id: string;
  dossier_titre: string;
  titre_brut: string;
  titre_pedago: string;
  chapeau: string;
  contexte: string;
  position_par_groupe: Record<GroupCode, GroupPosition>;
  votes_bruts: Record<GroupCode, GroupVoteBreakdown>;
  est_solennel: boolean;
  url_an_officielle: string;
  pedago_relu: boolean;
}

function n(s: string | null | undefined): number {
  return parseInt(s ?? "0", 10) || 0;
}

function parseRaw(raw: ANScrutinRaw): Omit<ParsedScrutin, "titre_pedago" | "chapeau" | "contexte"> {
  const votes_bruts = {} as Record<GroupCode, GroupVoteBreakdown>;
  const position_par_groupe = {} as Record<GroupCode, GroupPosition>;

  for (const g of raw.ventilationVotes?.organe?.groupes?.groupe ?? []) {
    const code = GROUP_MAPPING[g.organeRef];
    if (!code) continue;
    const dv = g.vote.decompteVoix;
    const breakdown: GroupVoteBreakdown = {
      pour: n(dv.pour),
      contre: n(dv.contre),
      abstention: n(dv.abstentions),
      absent: n(dv.nonVotants) + n(dv.nonVotantsVolontaires),
    };
    // If UDR appears as both PO847173 and PO872880 in the same scrutin
    // (shouldn't happen — they alternate by date — but defensive merge):
    if (votes_bruts[code]) {
      votes_bruts[code] = {
        pour: votes_bruts[code].pour + breakdown.pour,
        contre: votes_bruts[code].contre + breakdown.contre,
        abstention: votes_bruts[code].abstention + breakdown.abstention,
        absent: votes_bruts[code].absent + breakdown.absent,
      };
    } else {
      votes_bruts[code] = breakdown;
    }
    position_par_groupe[code] = computeGroupPosition(votes_bruts[code]);
  }

  const dossier = raw.objet?.dossierLegislatif;
  return {
    id: raw.uid,
    numero: parseInt(raw.numero, 10),
    date: raw.dateScrutin,
    dossier_id: dossier?.dossierRef ?? `STANDALONE-${raw.uid}`,
    dossier_titre: dossier?.libelle ?? raw.objet?.libelle?.slice(0, 120) ?? "Sans dossier",
    titre_brut: raw.objet?.libelle ?? "",
    position_par_groupe,
    votes_bruts,
    est_solennel: raw.typeVote?.codeTypeVote === "SPS",
    url_an_officielle: `https://www.assemblee-nationale.fr/dyn/17/scrutins/${raw.numero}`,
    pedago_relu: false,
  };
}

// ─────────────────────────────────────────────── titre pédago (LLM optional)

// Neutralization-first system prompt. Sent identically with every call so it
// can be prompt-cached (cache_control on the system block).
const SYSTEM_PROMPT = `Tu reformules des votes solennels de l'Assemblée Nationale française pour une app non-partisane.

Pour chaque scrutin tu dois renvoyer 3 champs :

1. CHAPEAU : "[THÈME] · [DOSSIER]" (max 4 mots, MAJUSCULES, sans ponctuation finale). Ex : "RETRAITES · PLFSS 2024".

2. TITRE_PEDAGO : reformulation FACTUELLE du sujet en 1 phrase de 12 mots maximum, vocabulaire de lycéen.

3. CONTEXTE : 1 phrase de 25 mots maximum expliquant l'enjeu CONCRET — qui est touché, ce qui change si la loi passe.
   Le CONTEXTE doit contenir au moins UN élément concret parmi : un chiffre exact, une date, un mécanisme nommé, ou un groupe de personnes nommé.

═══════════ RÈGLES DE NEUTRALISATION (NON NÉGOCIABLES) ═══════════

Tu as accès à l'outil web_search. Tu peux faire 1 à 2 recherches pour trouver des éléments concrets sur le scrutin (chiffres, mécanismes, groupes touchés). MAIS la presse française est politisée, donc :

A. **Tu ne reprends JAMAIS le framing d'une source.** Si Le Monde dit "loi controversée", Le Figaro dit "réforme nécessaire", Mediapart dit "scandale", tu ignores ces qualificatifs et tu gardes uniquement les FAITS sous-jacents (mécanisme + chiffre + qui est touché).

B. **Liste noire de mots interdits dans ta sortie** : controversé, polémique, scandaleux, scandale, important, crucial, majeur, historique, nécessaire, urgent, ambitieux, courageux, brutal, drastique, radical, modeste, timide, attendu, salué, dénoncé, critiqué.

C. **Liste noire de phrases creuses interdites** : "définit les règles", "encadre", "modernise", "renforce le cadre", "vise à améliorer", "événement majeur", "mesure phare", "réforme importante".

D. **Si tu n'as PAS d'élément concret après recherche, dis-le.** Mets un CONTEXTE court et honnête, sans inventer. Mieux vaut "Texte technique modifiant l'ordonnance N° 2023-XX sur la procédure devant les chambres sociales" que d'inventer un "enjeu majeur pour les Français".

E. **Verbes neutres uniquement** : "permet", "oblige à", "interdit", "augmente de X à Y", "réduit de X à Y", "crée", "supprime", "transfère à". Pas de "réforme", "moderniser", "améliorer".

═══════════ EXEMPLES AVANT/APRÈS ═══════════

❌ MAUVAIS (creux, copié de la presse) :
{
  "chapeau": "JEUX OLYMPIQUES · LOI 2030",
  "titre_pedago": "Cadre législatif pour organiser les Jeux Olympiques 2030.",
  "contexte": "La France accueillera les Jeux Olympiques en 2030. Cette loi définit les règles, pouvoirs et obligations des organisateurs pour préparer cet événement international majeur."
}
Pourquoi c'est mauvais : "définit les règles" et "événement international majeur" ne disent rien. Aucun chiffre, aucun mécanisme, aucun groupe précis touché.

✅ BON (concret, vérifiable) :
{
  "chapeau": "JO 2030 · ALPES",
  "titre_pedago": "Donner pouvoirs spéciaux aux JO d'hiver 2030 dans les Alpes.",
  "contexte": "Crée un comité avec pouvoirs d'expropriation et d'exemption environnementale dans 6 communes des Alpes jusqu'en 2031. Coût estimé : 2 milliards € publics."
}
Pourquoi c'est bon : on sait QUI (6 communes), QUAND (jusqu'en 2031), COMBIEN (2 Mds €), et QUEL MÉCANISME (expropriation, exemption environnementale).

❌ MAUVAIS (framing de presse partisane) :
{
  "contexte": "Réforme controversée des retraites jugée brutale par les syndicats et nécessaire par le gouvernement, qui suscite de fortes mobilisations."
}

✅ BON (faits sous le framing) :
{
  "contexte": "Recule l'âge légal de départ de 62 à 64 ans et accélère l'allongement de la durée de cotisation à 43 années dès 2027."
}

═══════════ FORMAT DE SORTIE ═══════════

Tu réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans texte avant ou après :
{"chapeau": "...", "titre_pedago": "...", "contexte": "..."}`;

interface Summary {
  chapeau: string;
  titre_pedago: string;
  contexte: string;
}

interface AnthropicResponse {
  content: Array<
    | { type: "text"; text: string }
    | { type: "thinking"; thinking?: string }
    | { type: "server_tool_use"; name: string; input?: unknown }
    | { type: "web_search_tool_result"; content?: unknown }
    | { type: string; [key: string]: unknown }
  >;
  stop_reason: string;
}

async function summarizeWithLLM(
  titreBrut: string,
  dossierTitre: string,
  numero: number,
): Promise<Summary> {
  const userMessage = `Numéro de scrutin : ${numero}
URL AN : https://www.assemblee-nationale.fr/dyn/17/scrutins/${numero}

Titre brut :
"""
${titreBrut}
"""

Dossier législatif :
"""
${dossierTitre}
"""

Cherche sur le web (1 à 2 recherches max) les détails concrets de ce scrutin : chiffres, mécanismes, groupes touchés. Croise les sources si possible. Puis réponds en JSON strict comme spécifié.`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-7",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      output_config: { effort: "high" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [
        {
          type: "web_search_20260209",
          name: "web_search",
          max_uses: 2,
        },
      ],
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${await r.text()}`);
  const json = (await r.json()) as AnthropicResponse;

  // The model may emit multiple text blocks interleaved with server_tool_use /
  // web_search_tool_result blocks (Opus often writes JSON spanning two text
  // blocks: opening `{...,` then closing `...}`). Concatenate all text blocks
  // and extract the JSON from the combined string.
  const textBlocks = json.content.filter(
    (b): b is { type: "text"; text: string } => b.type === "text",
  );
  if (textBlocks.length === 0) {
    throw new Error(`No text block in response. stop_reason=${json.stop_reason}, blocks=${json.content.map(b => b.type).join(",")}`);
  }
  const combined = textBlocks.map(b => b.text).join("\n");
  // Greedy match from first `{` to last `}` (handles JSON wrapped in code fences too).
  const m = combined.match(/\{[\s\S]*\}/);
  if (!m) {
    throw new Error(`No JSON in LLM response. blocks=${json.content.map(b => b.type).join(",")} text=${combined.slice(0, 300)}`);
  }
  return JSON.parse(m[0]) as Summary;
}

function fallbackSummary(titreBrut: string, dossierTitre: string): Summary {
  // Truncate to ~12 words for titre_pedago, derive a 3-word eyebrow from dossier,
  // and use the trimmed dossier title as a best-effort context line.
  const words = titreBrut.split(/\s+/).filter(Boolean);
  const titre_pedago = words.slice(0, 14).join(" ") + (words.length > 14 ? "…" : "");
  const dossierWords = (dossierTitre || "scrutin").split(/\s+/).filter(Boolean).slice(0, 3);
  const chapeau = dossierWords.join(" ").toUpperCase().replace(/[.,;:!?]+$/, "");
  // Fallback context: the dossier title trimmed to 25 words, or empty.
  const ctxWords = (dossierTitre || "").split(/\s+/).filter(Boolean);
  const contexte = ctxWords.length > 0
    ? ctxWords.slice(0, 25).join(" ") + (ctxWords.length > 25 ? "…" : "")
    : "";
  return { chapeau, titre_pedago, contexte };
}

// ─────────────────────────────────────────────────────────────── orchestrator

async function main(): Promise<void> {
  await ensureBulk();

  const files = (await fs.readdir(JSON_DIR)).filter(f => f.endsWith(".json"));
  console.log(`◯ Scanning ${files.length} scrutin files…`);

  const solennels: Awaited<ReturnType<typeof parseRaw>>[] = [];
  for (const f of files) {
    const raw = JSON.parse(await fs.readFile(path.join(JSON_DIR, f), "utf-8"));
    const s = raw.scrutin ?? raw;
    if (s.typeVote?.codeTypeVote !== "SPS") continue;
    solennels.push(parseRaw(s));
  }
  console.log(`◯ Found ${solennels.length} scrutins solennels (SPS)`);

  if (!ANTHROPIC_KEY) {
    console.warn("⚠ ANTHROPIC_API_KEY not set — using fallback summaries (re-run later with key to upgrade)");
  }

  const enriched: ParsedScrutin[] = [];
  // Web-search calls take ~5-10s each. Run a small number in parallel to keep
  // total runtime sensible (~46 calls × 8s sequential = 6 min; with CONCURRENCY=4
  // we get ~90s). Anthropic Tier 1 allows enough RPM for this.
  const CONCURRENCY = ANTHROPIC_KEY ? 4 : 1;
  let done = 0;
  async function processOne(s: typeof solennels[number]): Promise<void> {
    try {
      const summary = ANTHROPIC_KEY
        ? await summarizeWithLLM(s.titre_brut, s.dossier_titre, s.numero)
        : fallbackSummary(s.titre_brut, s.dossier_titre);
      enriched.push({ ...s, ...summary });
      done++;
      console.log(`  [${done}/${solennels.length}] ${summary.chapeau} — ${summary.titre_pedago}`);
    } catch (e) {
      done++;
      console.error(`  [${done}/${solennels.length}] ✕ scrutin ${s.numero}: ${(e as Error).message}`);
      // Fall back to truncated title so the scrutin still gets ingested
      const fb = fallbackSummary(s.titre_brut, s.dossier_titre);
      enriched.push({ ...s, ...fb });
    }
  }
  // Simple worker pool
  const queue = [...solennels];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) {
      const s = queue.shift();
      if (s) await processOne(s);
    }
  });
  await Promise.all(workers);

  console.log(`↑ Upserting ${enriched.length} scrutins to Supabase…`);
  const sb = createClient(SUPABASE_URL!, SUPABASE_KEY!);
  // Wipe demo fixtures first to avoid mixed state. We identify them as the
  // rows whose url_an_officielle is empty (fixture marker).
  const { error: delErr } = await sb.from("scrutins").delete().eq("url_an_officielle", "");
  if (delErr) console.warn("⚠ Could not delete demo rows:", delErr.message);

  // Upsert in chunks to stay under PostgREST limits.
  const CHUNK = 100;
  for (let i = 0; i < enriched.length; i += CHUNK) {
    const chunk = enriched.slice(i, i + CHUNK);
    const { error } = await sb.from("scrutins").upsert(chunk);
    if (error) {
      console.error(`✕ Chunk ${i}-${i + chunk.length} failed:`, error);
      process.exit(1);
    }
  }
  console.log(`✓ Done. ${enriched.length} solennels in scrutins table.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
