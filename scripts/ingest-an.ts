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
import type { ScrutinAnalyse, Theme } from "../src/types";
import {
  type Summary,
  type MinimalAnthropicMessage,
  fallbackSummary,
  extractAnthropicSummary,
} from "./lib/parse-summary";
import { isEligibleScrutin } from "./lib/an-filter";
import { type ParsedScrutinCore, parseRaw } from "./lib/an-parse";

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

// AN organeRef → GroupCode lives in scripts/lib/an-groups.ts (shared with
// resume-ingest.ts; see that file for the rationale on the PO847173 /
// PO872880 UDR merge and the PO840056 non-inscrits exclusion).

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
// ANGroupVote, ANScrutinRaw, parseRaw, and the `n` helper live in
// scripts/lib/an-parse.ts (shared with resume-ingest.ts).

/** The full row shape ingest-an.ts produces: the parseRaw core plus the
 *  LLM-generated titre_pedago / chapeau / contexte / analyse_loi /
 *  points_cles / theme. resume-ingest.ts uses ParsedScrutinCore directly
 *  because its summaries are re-fetched, not freshly generated. */
interface ParsedScrutin extends ParsedScrutinCore {
  titre_pedago: string;
  chapeau: string;
  contexte: string;
  analyse_loi?: ScrutinAnalyse;
  points_cles?: string[];
  theme?: Theme;
}

// ───────────────────────────── corpus filter (V2: SPS + SOR/MOC selected)

// ─────────────────────────────────────────────── titre pédago (LLM optional)

// Neutralization-first system prompt. Sent identically with every call so it
// can be prompt-cached (cache_control on the system block).
const SYSTEM_PROMPT = `Tu reformules des votes solennels de l'Assemblée Nationale française pour une app non-partisane.

Pour chaque scrutin tu dois renvoyer 3 champs :

1. CHAPEAU : "[THÈME] · [DOSSIER]" (max 4 mots, MAJUSCULES, sans ponctuation finale). Ex : "RETRAITES · PLFSS 2024".

2. TITRE_PEDAGO : reformulation FACTUELLE du sujet en 1 phrase de 12 mots maximum, vocabulaire de lycéen.

3. CONTEXTE : **L'EXPLICATION COURTE ET PUNCHY**, en **30 à 50 mots maximum**, en **2 phrases courtes** :
   a. **Phrase 1 = ce que la loi fait** (mécanisme + qui est touché + chiffre clé).
   b. **Phrase 2 = "Concrètement : ..."** ou **"Par exemple : ..."** — un cas tangible pour un lycéen.

   Pas plus, pas moins. Si tu commences à dépasser 50 mots, COUPE — l'utilisateur lit ça sur un téléphone, en 5 secondes, entre deux swipes. Mieux vaut une phrase qui claque qu'un paragraphe complet.

   Le CONTEXTE doit contenir au moins UN chiffre exact ET au moins UN nom propre ou groupe identifié. NON NÉGOCIABLE. Si l'info manque après recherche, dis "Détails techniques non publiquement disponibles" en UNE phrase.

   **MARKUP DES POINTS CLÉS — OBLIGATOIRE.** Mets en gras avec la syntaxe markdown ** ... ** (deux astérisques avant, deux après) **EXACTEMENT 2 à 3** informations clés : chiffres précis (ex : **64 ans**, **2 milliards €**), mécanismes nommés (ex : **parquet spécialisé**), ou groupes identifiés (ex : **18 millions d'actifs**). Pas plus de 3 — il faut que ça pop, pas que tout soit en gras.

   **INTERDICTIONS STRICTES sur le CONTEXTE** :
   - **AUCUNE balise HTML ou XML** : pas de "<cite>", "<a>", "<b>", etc. Texte brut + markdown gras uniquement.
   - **AUCUN marqueur de citation** comme "[1]", "[source]", "(d'après Le Monde)".
   - PAS de résultat du vote ("Vote : 396 oui", "Adoptée par 320 voix", "Rejetée à l'unanimité") — calculé ailleurs dans l'app.
   - PAS de qui a voté quoi ("La majorité a voté pour", "Le RN s'est opposé").
   - PAS de framing émotionnel ("réforme courageuse", "scandale", "majeur", "important").

═══════════ RÈGLES DE NEUTRALISATION (NON NÉGOCIABLES) ═══════════

Tu as accès à l'outil web_search. Tu peux faire 1 à 2 recherches pour trouver des éléments concrets sur le scrutin (chiffres, mécanismes, groupes touchés). MAIS la presse française est politisée, donc :

A. **Tu ne reprends JAMAIS le framing d'une source.** Si Le Monde dit "loi controversée", Le Figaro dit "réforme nécessaire", Mediapart dit "scandale", tu ignores ces qualificatifs et tu gardes uniquement les FAITS sous-jacents (mécanisme + chiffre + qui est touché).

B. **Liste noire de mots interdits dans ta sortie** : controversé, polémique, scandaleux, scandale, important, crucial, majeur, historique, nécessaire, urgent, ambitieux, courageux, brutal, drastique, radical, modeste, timide, attendu, salué, dénoncé, critiqué.

C. **Liste noire de phrases creuses interdites** : "définit les règles", "encadre", "modernise", "renforce le cadre", "vise à améliorer", "événement majeur", "mesure phare", "réforme importante".

D. **Si tu n'as PAS d'élément concret après recherche, dis-le.** Mets un CONTEXTE court et honnête, sans inventer. Mieux vaut "Texte technique modifiant l'ordonnance N° 2023-XX sur la procédure devant les chambres sociales" que d'inventer un "enjeu majeur pour les Français".

E. **Verbes neutres uniquement** : "permet", "oblige à", "interdit", "augmente de X à Y", "réduit de X à Y", "crée", "supprime", "transfère à". Pas de "réforme", "moderniser", "améliorer".

═══════════ VOIX : EXPLIQUE COMME À UN LYCÉEN DE 17 ANS ═══════════

Ton lecteur cible est un lycéen de 1ère/Terminale, intelligent mais qui n'a JAMAIS suivi un cours de droit, d'éco ou de finances publiques. Il ne sait pas ce qu'est :
- un PLFSS, un PLF, un cavalier législatif, un décret en Conseil d'État
- un trimestre cotisé, l'IFI, la CSG, l'AME, l'APL
- la commission mixte paritaire, le 49.3, l'article 40

Règles de voix :
F. **Pas d'acronyme nu**. Mauvais : "Réforme du PLFSS". Bon : "Budget annuel de la Sécurité sociale (PLFSS)" la première fois, "PLFSS" ensuite si tu y reviens. Si l'acronyme n'apporte rien, supprime-le carrément.
G. **Pas de jargon juridique sans traduction.** Mauvais : "Habilite le gouvernement à légiférer par ordonnances". Bon : "Autorise le gouvernement à écrire la loi tout seul, sans vote des députés, pendant 18 mois".
H. **Concret avant abstrait.** Mauvais : "Module les seuils de revenus du CITE". Bon : "Permet aux familles gagnant moins de 35 000 € par an de toucher l'aide à la rénovation énergétique".
I. **Compte en € et en personnes, pas en pourcentages du PIB.** Mauvais : "0,3 point de PIB". Bon : "environ 8 milliards € par an" ou "l'équivalent du budget annuel de la justice".
J. **Le test du couloir** : si tu lis ta phrase à voix haute à un lycéen dans un couloir et qu'il dit "ah ok j'ai compris", c'est bon. S'il dit "c'est quoi X ?", reformule.

═══════════ EXEMPLES AVANT/APRÈS ═══════════

❌ MAUVAIS (creux, copié de la presse) :
{
  "chapeau": "JEUX OLYMPIQUES · LOI 2030",
  "titre_pedago": "Cadre législatif pour organiser les Jeux Olympiques 2030.",
  "contexte": "La France accueillera les Jeux Olympiques en 2030. Cette loi définit les règles, pouvoirs et obligations des organisateurs pour préparer cet événement international majeur."
}
Pourquoi c'est mauvais : "définit les règles" et "événement international majeur" ne disent rien. Aucun chiffre, aucun mécanisme, aucun groupe précis touché.

✅ BON (concret, court, 30-50 mots, 2 phrases) :
{
  "chapeau": "JO 2030 · ALPES",
  "titre_pedago": "Donner pouvoirs spéciaux aux JO d'hiver 2030 dans les Alpes.",
  "contexte": "La loi crée un comité d'organisation qui peut **exproprier des terrains** et contourner les règles environnementales dans **6 communes des Alpes** jusqu'en 2031, pour **2 milliards d'euros publics**. Concrètement : à Briançon, l'État peut acquérir un terrain de force pour construire une piste, sans étude d'impact complète."
}
~45 mots, 2 phrases, 3 éléments en gras. Lecture en 5 secondes.

❌ MAUVAIS (framing de presse partisane) :
{
  "contexte": "Réforme controversée des retraites jugée brutale par les syndicats et nécessaire par le gouvernement, qui suscite de fortes mobilisations dans tout le pays."
}

✅ BON (faits sous le framing, 30-50 mots, 2 phrases) :
{
  "contexte": "La loi recule l'âge légal de départ à la retraite de **62 à 64 ans** pour les **18 millions de personnes nées après 1968**, avec **43 ans de cotisations requis dès 2027**. Concrètement : quelqu'un né en 1972 qui voulait partir en 2034 devra attendre 2036."
}

❌ MAUVAIS (jargon administratif incompréhensible pour un lycéen) :
{
  "chapeau": "PLFSS · 2025",
  "titre_pedago": "Adopter le PLFSS 2025 modifiant l'assiette de la CSG-CRDS.",
  "contexte": "Réforme paramétrique de l'assiette de la CSG-CRDS sur les revenus du capital mobilier, alignée sur la trajectoire de retour à l'équilibre des comptes sociaux."
}
Pourquoi c'est mauvais : un lycéen ne sait pas ce qu'est le PLFSS, la CSG-CRDS, une assiette, un revenu du capital mobilier, ni "les comptes sociaux".

✅ BON (mêmes faits, voix lycéen, 30-50 mots, 2 phrases) :
{
  "chapeau": "BUDGET SÉCU · 2025",
  "titre_pedago": "Augmenter de 2 points l'impôt sur les revenus boursiers (CSG-CRDS).",
  "contexte": "L'impôt sur les intérêts boursiers et plus-values passe de **17,2% à 19,2%** pour les **4 millions de foyers français** qui détiennent des actions ou de l'assurance-vie. Concrètement : sur 1000€ de plus-value, tu paies 192€ d'impôt au lieu de 172€."
}

═══════════ 4ème CHAMP : ANALYSE STRUCTURÉE ═══════════

En plus des 3 champs ci-dessus, tu produis aussi une ANALYSE structurée — un breakdown factuel en 6 listes, qui répond aux 4 questions naturelles d'un citoyen : QUOI, POUR QUI, QUAND, EXCEPTIONS.

Format :
{
  "mesures_principales": [...],   // 3 à 5 bullets : ce que la loi crée / interdit / modifie. Chaque bullet en 1 phrase courte avec 1-2 chiffres en **gras**.
  "concernes_positifs": [...],     // 1 à 4 bullets : personnes/secteurs avec impact positif (qui gagne quoi). Format : "[groupe] : [ce que ça change pour eux]".
  "concernes_negatifs": [...],     // 1 à 4 bullets : personnes/secteurs avec impact négatif (qui perd quoi). Même format.
  "concernes_neutres": [...],      // 0 à 3 bullets : impact mixte ou à surveiller. Tableau vide [] si rien à dire.
  "calendrier": [...],             // 1 à 4 bullets : "Entrée en vigueur : [date]", échéances intermédiaires si applicable.
  "exceptions": [...]              // 0 à 3 bullets : exemptions, dérogations, périodes transitoires. Tableau vide [] si la loi n'en a pas.
}

Règles ANALYSE :
- **PUREMENT FACTUEL** — pas de "juste / injuste", "ambitieux / timide". Que des faits sourcés.
- **Markup ** ... ** ** autorisé et encouragé pour les chiffres/mécanismes clés dans CHAQUE bullet.
- **Toutes les mêmes interdictions que pour le CONTEXTE** : pas de HTML/XML, pas de marqueurs de citation, pas de résultat du vote, pas de framing émotionnel.
- Si tu n'as pas d'info concrète pour une catégorie, **tableau vide []** plutôt que d'inventer.
- Pour concernes_negatifs : sois honnête. Une loi crée toujours des "perdants" (même administrativement). Si tu n'en mets pas, c'est suspect.

═══════════ 5ème CHAMP : POINTS_CLES (RÉSUMÉ RECTO) ═══════════

En plus, tu produis 3 points-clés ULTRA-COURTS affichés directement sous le titre, sur le recto de la carte. Objectif : permettre à un lycéen de voter pour/contre en 5 secondes sans flipper la carte. Ce sont les 3 facettes les plus saillantes du texte de loi.

Format :
{
  "points_cles": ["bullet 1", "bullet 2", "bullet 3"]
}

Règles strictes :
- **EXACTEMENT 3 bullets**, pas 2 pas 4.
- **7 mots maximum par bullet.** Tu comptes les mots AVANT de répondre. Si tu dépasses, coupe. Les mots type "de", "à", "le", "des" comptent comme des mots.
- Chaque bullet décrit UNE facette différente du texte : un chiffre, un mécanisme, ou un public touché. Pas de redondance entre les 3.
- Pas de phrase complète obligatoire — un fragment télégraphique est OK (ex : "Âge légal : 62 → 64 ans").
- Mêmes interdictions que CONTEXTE/ANALYSE : pas de framing émotionnel, pas de jargon non traduit, pas de HTML/XML, pas de marqueurs de citation, pas de résultat du vote.
- Ne pas paraphraser le titre_pedago ; ces 3 points-clés DOIVENT ajouter de l'info.

Exemples :

❌ MAUVAIS (verbeux, dépasse 7 mots, paraphrase le titre) :
["La loi recule l'âge légal de départ à 64 ans pour tous", "Cela concerne environ 18 millions de Français nés après 1968", "Des exceptions sont prévues pour les carrières longues et la pénibilité"]

✅ BON (3 facettes distinctes, ≤ 7 mots chacun, télégraphique) :
["Âge légal : 62 → 64 ans", "18 millions d'actifs nés après 1968", "Carrières longues et pénibilité exemptées"]

✅ BON pour la rétention administrative :
["Rétention max : 90 → 210 jours", "Étendue aux suspects de terrorisme", "Surveillance possible après libération"]

✅ BON pour un budget de la Sécu :
["Déficit prévu : 14 milliards € en 2026", "Hausse cotisation employeurs +0,3 point", "Gel pensions retraite jusqu'en juillet"]

═══════════ 6ème CHAMP : THEME (BUCKET POUR DIVERSITÉ DU DECK) ═══════════

Tu classes le scrutin dans EXACTEMENT UNE des catégories suivantes (chaîne exacte, sans accent ni modification) :

- "pouvoir-achat"   → salaires, prix, énergie, logement, aides au revenu
- "retraites"       → âge, cotisations, pensions, régimes spéciaux
- "immigration"     → titres de séjour, naturalisation, asile, intégration, AME
- "sécurité"        → police, justice pénale, terrorisme, renseignement, prisons
- "écologie"        → climat, biodiversité, agriculture, énergies, transports
- "santé"           → hôpital, médecine, médicaments, Sécu (volet soins)
- "école"           → éducation, université, formation professionnelle
- "fiscalité"       → impôts, taxes, niches fiscales, budget de l'État
- "institutions"    → constitution, mode de scrutin, libertés publiques, médias
- "international"   → diplomatie, défense, Europe, résolutions étrangères
- "autre"           → seulement si rien ne colle (à éviter au maximum)

Règle : choisis la catégorie DOMINANTE. Une loi sur l'âge de la retraite ET son financement → "retraites" (plus saillant que "fiscalité"). Une motion de censure sur la politique migratoire → "immigration" (sujet de fond, pas "institutions").

═══════════ FORMAT DE SORTIE ═══════════

Tu réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans texte avant ou après :
{
  "chapeau": "...",
  "titre_pedago": "...",
  "contexte": "...",
  "theme": "...",
  "points_cles": ["...", "...", "..."],
  "analyse_loi": {
    "mesures_principales": [...],
    "concernes_positifs": [...],
    "concernes_negatifs": [...],
    "concernes_neutres": [...],
    "calendrier": [...],
    "exceptions": [...]
  }
}`;

function buildUserMessage(titreBrut: string, dossierTitre: string, numero: number): string {
  return `Numéro de scrutin : ${numero}
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
}

function buildRequestParams(scrutin: { titre_brut: string; dossier_titre: string; numero: number }): Record<string, unknown> {
  return {
    model: "claude-haiku-4-5",
    // 4096 instead of 2048: the analyse field adds 6 string[] arrays with
    // multiple bullets each. Total output now lands around 600-900 tokens
    // including the 4-field wrapper JSON. 4096 leaves plenty of headroom.
    max_tokens: 4096,
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
        // Haiku 4.5 doesn't support programmatic tool calling; web_search must
        // be declared as direct-caller only. Without this, batch returns 400
        // with "does not support programmatic tool calling".
        allowed_callers: ["direct"],
      },
    ],
    messages: [{ role: "user", content: buildUserMessage(scrutin.titre_brut, scrutin.dossier_titre, scrutin.numero) }],
  };
}


// ─────────────────────────────────────────────────────── Batches API client

const COMMON_HEADERS = () => ({
  "content-type": "application/json",
  "x-api-key": ANTHROPIC_KEY!,
  "anthropic-version": "2023-06-01",
});

async function submitBatch(scrutins: ParsedScrutin[]): Promise<string> {
  const requests = scrutins.map((s) => ({
    custom_id: s.id, // e.g. "VTANR5L17V1234"
    params: buildRequestParams(s),
  }));
  const r = await fetch("https://api.anthropic.com/v1/messages/batches", {
    method: "POST",
    headers: COMMON_HEADERS(),
    body: JSON.stringify({ requests }),
  });
  if (!r.ok) throw new Error(`Batch submit failed: ${r.status} ${await r.text()}`);
  const json = (await r.json()) as { id: string };
  return json.id;
}

interface BatchStatus {
  processing_status: "in_progress" | "canceling" | "ended";
  request_counts: { processing: number; succeeded: number; errored: number; canceled: number; expired: number };
}

async function pollBatch(batchId: string): Promise<BatchStatus> {
  // Poll every 15s — typical batch completes in 2-10 min for 46 items.
  while (true) {
    const r = await fetch(`https://api.anthropic.com/v1/messages/batches/${batchId}`, {
      headers: COMMON_HEADERS(),
    });
    if (!r.ok) throw new Error(`Batch poll failed: ${r.status} ${await r.text()}`);
    const json = (await r.json()) as BatchStatus;
    const c = json.request_counts;
    console.log(`  status: ${json.processing_status} · processing=${c.processing} succeeded=${c.succeeded} errored=${c.errored}`);
    if (json.processing_status === "ended") return json;
    await new Promise((res) => setTimeout(res, 15000));
  }
}

interface BatchResultLine {
  custom_id: string;
  result:
    | { type: "succeeded"; message: MinimalAnthropicMessage }
    // Empirically, Anthropic wraps batch errors as
    //   { type: "errored", error: { type: "error", error: { type, message } } }
    // — the inner `error.error` is where the user-facing fields live. We type
    // the outer loosely and probe both shapes when logging.
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

async function fetchBatchResults(batchId: string): Promise<Map<string, Summary>> {
  const r = await fetch(`https://api.anthropic.com/v1/messages/batches/${batchId}/results`, {
    headers: COMMON_HEADERS(),
  });
  if (!r.ok) throw new Error(`Batch results failed: ${r.status} ${await r.text()}`);
  const text = await r.text();
  const out = new Map<string, Summary>();
  let okCount = 0;
  let errCount = 0;
  let firstErrorLine: string | null = null;
  for (const line of text.split("\n").filter((l) => l.trim())) {
    const result = JSON.parse(line) as BatchResultLine;
    if (result.result.type === "succeeded") {
      try {
        out.set(result.custom_id, extractAnthropicSummary(result.result.message));
        okCount++;
      } catch (e) {
        console.error(`  ✕ ${result.custom_id} parse: ${(e as Error).message}`);
        errCount++;
      }
    } else if (result.result.type === "errored") {
      const err = result.result.error;
      // Anthropic wraps the user-facing error one level deeper:
      // result.error.error.{type,message}
      const inner = err?.error;
      const detail = inner?.message ?? err?.message ?? inner?.type ?? err?.type ?? JSON.stringify(result.result);
      console.error(`  ✕ ${result.custom_id}: ${detail}`);
      if (!firstErrorLine) firstErrorLine = line;
      errCount++;
    } else {
      console.error(`  ✕ ${result.custom_id}: ${result.result.type}`);
      errCount++;
    }
  }
  console.log(`  parsed ${okCount} summaries, ${errCount} failed`);
  if (errCount > 0 && firstErrorLine) {
    // Surface the raw first error line in full so we can debug shape mismatches.
    console.error("\n— Raw first error result (for debugging) —");
    console.error(firstErrorLine);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────── orchestrator

async function main(): Promise<void> {
  await ensureBulk();

  const files = (await fs.readdir(JSON_DIR)).filter(f => f.endsWith(".json"));
  console.log(`◯ Scanning ${files.length} scrutin files…`);

  const allEligible: Awaited<ReturnType<typeof parseRaw>>[] = [];
  let spsCount = 0;
  let otherCount = 0;
  for (const f of files) {
    const raw = JSON.parse(await fs.readFile(path.join(JSON_DIR, f), "utf-8"));
    const s = raw.scrutin ?? raw;
    if (!isEligibleScrutin(s)) continue;
    if (s.typeVote?.codeTypeVote === "SPS") spsCount++; else otherCount++;
    allEligible.push(parseRaw(s));
  }
  console.log(`◯ Found ${allEligible.length} eligible scrutins (${spsCount} SPS + ${otherCount} ordinaires/motions/résolutions)`);

  // Cost-controlled test mode: INGEST_LIMIT=N processes only the first N
  // scrutins. Useful to validate prompt/UI changes for a few cents instead of
  // the full batch. Unset (or empty) → "all" (no limit). Set but invalid
  // (non-numeric, "0", negative) → falls back to 1, NOT "all": the safer
  // interpretation of a typo like `INGEST_LIMIT=abcd` is to keep cost near
  // zero, not silently run the full batch on a user who typed wrong.
  const limitRaw = process.env.INGEST_LIMIT;
  const limit = limitRaw ? Math.max(1, parseInt(limitRaw, 10) || 0) : undefined;
  const solennels = limit ? allEligible.slice(0, limit) : allEligible;
  if (limit) {
    console.log(`⚠ INGEST_LIMIT=${limit} — processing only the first ${solennels.length}/${allEligible.length} scrutins (test mode)`);
  }

  if (!ANTHROPIC_KEY) {
    console.warn("⚠ ANTHROPIC_API_KEY not set — using fallback summaries (re-run later with key to upgrade)");
  }

  const enriched: ParsedScrutin[] = [];

  if (!ANTHROPIC_KEY) {
    // Fallback path: no LLM, just truncated summaries.
    for (const s of solennels) {
      const fb = fallbackSummary(s.titre_brut, s.dossier_titre);
      enriched.push({ ...s, ...fb });
    }
  } else {
    // LLM path: submit one Batches API job for the whole eligible set.
    // 50% off all tokens, runs server-side concurrently, no rate-limit juggling.
    // Typical completion: a few minutes; scales linearly with batch size.
    console.log(`↑ Submitting batch of ${solennels.length} requests (Haiku 4.5 + web_search, 50% off via Batches API)…`);
    const batchId = await submitBatch(solennels as ParsedScrutin[]);
    console.log(`✓ Batch ${batchId} submitted. Polling every 15s…`);
    await pollBatch(batchId);
    console.log(`↓ Fetching results…`);
    const results = await fetchBatchResults(batchId);

    for (const s of solennels) {
      const summary = results.get(s.id);
      if (summary) {
        enriched.push({ ...s, ...summary } as ParsedScrutin);
        console.log(`  ✓ ${s.numero} · ${summary.chapeau} — ${summary.titre_pedago}`);
      } else {
        const fb = fallbackSummary(s.titre_brut, s.dossier_titre);
        enriched.push({ ...s, ...fb } as ParsedScrutin);
        console.log(`  ⚠ ${s.numero}: using fallback (LLM result missing)`);
      }
    }
  }

  console.log(`↑ Upserting ${enriched.length} scrutins to Supabase…`);
  const sb = createClient(SUPABASE_URL!, SUPABASE_KEY!);
  // Wipe demo fixtures first to avoid mixed state. We identify them as the
  // rows whose url_an_officielle is empty (fixture marker).
  const { error: delErr } = await sb.from("scrutins").delete().eq("url_an_officielle", "");
  if (delErr) console.warn("⚠ Could not delete demo rows:", delErr.message);

  // `ingere_le` has `default now()` in migration 0001, but the default only
  // applies on INSERT — on UPSERT/UPDATE the column keeps its old value.
  // Without setting it explicitly, re-ingestion of existing scrutins leaves
  // `ingere_le` at the original date, and the FreshnessBanner banner reports
  // a stale "MAJ il y a X jours" even right after a re-ingest. Stamp it now.
  // (Cast back to ParsedScrutin[] because the existing fall-back `as`
  // casts below assume that type; ParsedScrutin doesn't carry ingere_le
  // in the interface but Supabase accepts the extra field at runtime.)
  const ingestedAt = new Date().toISOString();
  const enrichedWithTimestamp = enriched.map(
    (s) => ({ ...s, ingere_le: ingestedAt })
  ) as ParsedScrutin[];

  // Upsert in chunks to stay under PostgREST limits.
  const CHUNK = 100;
  let analyseLoiDropped = false;
  let pointsClesDropped = false;
  let themeDropped = false;
  for (let i = 0; i < enrichedWithTimestamp.length; i += CHUNK) {
    let chunk = enrichedWithTimestamp.slice(i, i + CHUNK);
    if (analyseLoiDropped) {
      chunk = chunk.map(({ analyse_loi: _drop, ...rest }) => rest as ParsedScrutin);
    }
    if (pointsClesDropped) {
      chunk = chunk.map(({ points_cles: _drop, ...rest }) => rest as ParsedScrutin);
    }
    if (themeDropped) {
      chunk = chunk.map(({ theme: _drop, ...rest }) => rest as ParsedScrutin);
    }
    let { error } = await sb.from("scrutins").upsert(chunk);

    // Defensive retry per missing-column case. The user may have applied
    // some but not all migrations; rather than lose the whole paid-for
    // batch we drop the offending field and retry.
    if (error && error.code === "PGRST204" && /analyse_loi/i.test(error.message ?? "")) {
      console.warn(
        "⚠ `analyse_loi` column missing in DB — migration 0003 not yet applied.\n" +
        "  Falling back to upsert WITHOUT the analyse_loi field so the rest of\n" +
        "  this run is not lost. Apply supabase/migrations/0003_add_analyse.sql\n" +
        "  then re-run to populate analyse_loi.",
      );
      analyseLoiDropped = true;
      chunk = chunk.map(({ analyse_loi: _drop, ...rest }) => rest as ParsedScrutin);
      ({ error } = await sb.from("scrutins").upsert(chunk));
    }
    if (error && error.code === "PGRST204" && /points_cles/i.test(error.message ?? "")) {
      console.warn(
        "⚠ `points_cles` column missing in DB — migration 0004 not yet applied.\n" +
        "  Falling back to upsert WITHOUT the points_cles field so the rest of\n" +
        "  this run is not lost. Apply supabase/migrations/0004_add_points_cles.sql\n" +
        "  then re-run to populate points_cles.",
      );
      pointsClesDropped = true;
      chunk = chunk.map(({ points_cles: _drop, ...rest }) => rest as ParsedScrutin);
      ({ error } = await sb.from("scrutins").upsert(chunk));
    }
    if (error && error.code === "PGRST204" && /theme/i.test(error.message ?? "")) {
      console.warn(
        "⚠ `theme` column missing in DB — migration 0005 not yet applied.\n" +
        "  Falling back to upsert WITHOUT the theme field so the rest of\n" +
        "  this run is not lost. Apply supabase/migrations/0005_add_theme.sql\n" +
        "  then re-run to populate theme.",
      );
      themeDropped = true;
      chunk = chunk.map(({ theme: _drop, ...rest }) => rest as ParsedScrutin);
      ({ error } = await sb.from("scrutins").upsert(chunk));
    }

    if (error) {
      console.error(`✕ Chunk ${i}-${i + chunk.length} failed:`, error);
      process.exit(1);
    }
  }
  const notes: string[] = [];
  if (analyseLoiDropped) notes.push("analyse_loi dropped — apply migration 0003");
  if (pointsClesDropped) notes.push("points_cles dropped — apply migration 0004");
  if (themeDropped) notes.push("theme dropped — apply migration 0005");
  const note = notes.length > 0 ? `\n  (${notes.join("; ")} and re-run)` : "";
  console.log(`✓ Done. ${enriched.length} scrutins in scrutins table.${note}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
