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
import { THEMES } from "../src/types";
import type { GroupCode, GroupPosition, GroupVoteBreakdown, Theme } from "../src/types";

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
  analyse_loi?: ScrutinAnalyse;
  points_cles?: string[];
  theme?: Theme;
  position_par_groupe: Record<GroupCode, GroupPosition>;
  votes_bruts: Record<GroupCode, GroupVoteBreakdown>;
  est_solennel: boolean;
  url_an_officielle: string;
  pedago_relu: boolean;
}

// ───────────────────────────── corpus filter (V2: SPS + SOR/MOC selected)

/** Keep a scrutin if it's a solennel (SPS) OR a non-procedural ordinary vote:
 *  final vote on a whole text ("sur l'ensemble"), a motion (censure / rejet /
 *  renvoi / référendaire), or a proposition de résolution. Other ordinary
 *  scrutins (amendment-level, sub-clause votes) are dropped to keep the deck
 *  legible. */
function isEligibleScrutin(raw: ANScrutinRaw): boolean {
  const code = raw.typeVote?.codeTypeVote;
  if (code === "SPS") return true;
  const titre = raw.objet?.libelle ?? "";
  if (/sur l'ensemble/i.test(titre)) return true;
  if (/\bmotion (de censure|référendaire|de rejet|de renvoi)\b/i.test(titre)) return true;
  if (/proposition de résolution/i.test(titre)) return true;
  return false;
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

interface Summary {
  chapeau: string;
  titre_pedago: string;
  contexte: string;
  analyse_loi?: ScrutinAnalyse;
  points_cles?: string[];
  theme?: Theme;
}

interface ScrutinAnalyse {
  mesures_principales: string[];
  concernes_positifs: string[];
  concernes_negatifs: string[];
  concernes_neutres: string[];
  calendrier: string[];
  exceptions: string[];
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

function extractSummaryFromMessage(message: AnthropicResponse): Summary {
  const textBlocks = message.content.filter(
    (b): b is { type: "text"; text: string } => b.type === "text",
  );
  if (textBlocks.length === 0) {
    throw new Error(`No text block. stop_reason=${message.stop_reason}, blocks=${message.content.map((b) => b.type).join(",")}`);
  }
  const combined = textBlocks.map((b) => b.text).join("\n");
  const m = combined.match(/\{[\s\S]*\}/);
  if (!m) {
    throw new Error(`No JSON in response. text=${combined.slice(0, 300)}`);
  }
  // JSON.parse rejects raw control characters (newlines, tabs, etc.) inside
  // string literals — even though they're common in LLM output when the model
  // formats long text. Sanitize: replace literal control chars INSIDE string
  // values with their escaped form so JSON.parse accepts them.
  const safe = sanitizeJsonControlChars(m[0]);
  const raw = JSON.parse(safe) as Record<string, unknown>;

  // Whitelist the expected fields. Without this, a model that hallucinates
  // an extra key like "erreur" leaks it into the upsert payload and Postgres
  // rejects the whole chunk. Throw if essential fields are missing — the
  // orchestrator catches and substitutes a fallback summary.
  const chapeau = typeof raw.chapeau === "string" ? raw.chapeau.trim() : "";
  const titre_pedago = typeof raw.titre_pedago === "string" ? raw.titre_pedago.trim() : "";
  const contexte = typeof raw.contexte === "string" ? raw.contexte.trim() : "";
  if (!chapeau || !titre_pedago) {
    const stray = Object.keys(raw).filter((k) => !["chapeau","titre_pedago","contexte","analyse_loi","points_cles","theme"].includes(k));
    throw new Error(`Missing required fields (chapeau or titre_pedago). Stray keys: [${stray.join(",")}]`);
  }
  return {
    chapeau,
    titre_pedago,
    contexte,
    analyse_loi: raw.analyse_loi ? normalizeAnalyse(raw.analyse_loi as Partial<ScrutinAnalyse>) : undefined,
    points_cles: normalizePointsCles(raw.points_cles),
    theme: normalizeTheme(raw.theme),
  };
}

// Validate against the THEMES enum; anything off-list collapses to "autre" so
// a misbehaving model can never inject an arbitrary bucket label into the DB.
function normalizeTheme(v: unknown): Theme | undefined {
  if (typeof v !== "string") return undefined;
  const lower = v.trim().toLowerCase();
  return (THEMES as readonly string[]).includes(lower) ? (lower as Theme) : "autre";
}

// Cap each bullet at 7 words and keep at most 3. Drop empties and trims.
// Hard cap defends the UI from a model that ignored the prompt constraint.
function normalizePointsCles(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const cleaned = v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 3)
    .map((s) => {
      const words = s.split(/\s+/);
      return words.length <= 7 ? s : words.slice(0, 7).join(" ") + "…";
    });
  return cleaned.length > 0 ? cleaned : undefined;
}

/** Walk the JSON text byte-by-byte; when inside a string literal, escape any
 *  literal control char (\n, \t, \r, etc.) so JSON.parse won't reject. */
function sanitizeJsonControlChars(json: string): string {
  let out = "";
  let inString = false;
  let escapeNext = false;
  for (let i = 0; i < json.length; i++) {
    const c = json[i];
    if (escapeNext) {
      out += c;
      escapeNext = false;
      continue;
    }
    if (c === "\\") {
      out += c;
      escapeNext = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      out += c;
      continue;
    }
    if (inString) {
      const code = c.charCodeAt(0);
      if (code === 0x0a) { out += "\\n"; continue; }
      if (code === 0x0d) { out += "\\r"; continue; }
      if (code === 0x09) { out += "\\t"; continue; }
      if (code < 0x20) {
        out += "\\u" + code.toString(16).padStart(4, "0");
        continue;
      }
    }
    out += c;
  }
  return out;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function normalizeAnalyse(a: Partial<ScrutinAnalyse> | undefined | null): ScrutinAnalyse | undefined {
  if (!a || typeof a !== "object") return undefined;
  return {
    mesures_principales: asStringArray(a.mesures_principales),
    concernes_positifs: asStringArray(a.concernes_positifs),
    concernes_negatifs: asStringArray(a.concernes_negatifs),
    concernes_neutres: asStringArray(a.concernes_neutres),
    calendrier: asStringArray(a.calendrier),
    exceptions: asStringArray(a.exceptions),
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
    | { type: "succeeded"; message: AnthropicResponse }
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
        out.set(result.custom_id, extractSummaryFromMessage(result.result.message));
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
  // the full batch. Drops to "all" when unset or invalid.
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

  // Upsert in chunks to stay under PostgREST limits.
  const CHUNK = 100;
  let analyseLoiDropped = false;
  let pointsClesDropped = false;
  let themeDropped = false;
  for (let i = 0; i < enriched.length; i += CHUNK) {
    let chunk = enriched.slice(i, i + CHUNK);
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
