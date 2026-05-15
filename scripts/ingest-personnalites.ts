// scripts/ingest-personnalites.ts
//
// Indexation V2 — extrait les votes nominatifs des 10 personnalités définies
// dans src/lib/personnalites.ts pour chaque scrutin déjà en base et patche la
// colonne `votes_personnalites` (migration 0006).
//
// Pipeline :
//   1. Télécharge le fichier AN AMO20 (acteurs/mandats actifs) si pas en cache.
//   2. Résout l'acteurRef de chaque personnalité par (prenom, nom, [dept]).
//   3. Pour chaque scrutin du cache local /tmp/sd-an-cache/json/, scanne
//      decompteNominatif (pours/contres/abstentions/nonVotants) et trouve
//      les votes des acteurRefs reconnus.
//   4. Upsert la colonne `votes_personnalites` par chunks.
//
// Coût Anthropic : 0$ (aucun appel LLM).
//
// Usage :
//   SUPABASE_URL=... \
//   SUPABASE_SERVICE_ROLE_KEY=... \
//   npx tsx scripts/ingest-personnalites.ts

import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { PERSONNALITES } from "../src/lib/personnalites";
import { PERSONNALITE_CODES } from "../src/types";
import type { PersonnaliteCode, PersonnaliteVote } from "../src/types";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env");
  process.exit(1);
}

const CACHE_DIR = "/tmp/sd-an-cache";
const SCRUTINS_JSON_DIR = path.join(CACHE_DIR, "json");
const ACTEURS_DIR = path.join(CACHE_DIR, "acteurs");
const ACTEURS_ZIP = path.join(CACHE_DIR, "AMO20_acteurs_XVII.json.zip");

// AN open-data 17e legislature: all currently-active deputies with their
// active mandates and organes. Doesn't include Bardella post-July 2024
// (he resigned to be MEP) — handled below via a fallback AMO40 file that
// includes historical mandates.
const ACTEURS_URL_ACTIFS =
  "https://data.assemblee-nationale.fr/static/openData/repository/17/amo/deputes_actifs_mandats_actifs_organes/AMO20_deputes_actifs_mandats_actifs_organes_XVII.json.zip";
const ACTEURS_URL_HISTORIQUE =
  "https://data.assemblee-nationale.fr/static/openData/repository/17/amo/tous_acteurs_mandats_actifs_organes_legislature/AMO30_tous_acteurs_mandats_actifs_organes_XVII.json.zip";

// ──────────────────────────────────────────────────────── helpers

function normalize(s: string | undefined | null): string {
  if (!s) return "";
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")  // strip combining accents
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ─────────────────────────────────────────── 1) télécharger les acteurs

async function downloadIfNeeded(url: string, zipPath: string, label: string): Promise<void> {
  try {
    const st = await fs.stat(zipPath);
    if (st.size > 1024) {
      console.log(`✓ cache hit: ${label} (${(st.size / 1024).toFixed(0)} KB)`);
      return;
    }
  } catch { /* fall through */ }

  console.log(`↓ Downloading ${label}…`);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Download failed (${r.status}) for ${label}: ${url}`);
  const buf = Buffer.from(await r.arrayBuffer());
  await fs.mkdir(path.dirname(zipPath), { recursive: true });
  await fs.writeFile(zipPath, buf);
  console.log(`✓ Saved ${(buf.length / 1024).toFixed(0)} KB`);
}

async function ensureActeursExtracted(): Promise<void> {
  await fs.mkdir(ACTEURS_DIR, { recursive: true });
  // Try active deputies first; fall back to historical if file unavailable.
  let url = ACTEURS_URL_ACTIFS;
  try {
    await downloadIfNeeded(url, ACTEURS_ZIP, "AMO20 (députés actifs 17e)");
  } catch (e) {
    console.warn(`⚠ AMO20 failed, falling back to AMO30: ${(e as Error).message}`);
    url = ACTEURS_URL_HISTORIQUE;
    await downloadIfNeeded(url, ACTEURS_ZIP, "AMO30 (tous mandats actifs 17e)");
  }

  // Re-extract every run to be safe (cheap operation on the local zip).
  execSync(`unzip -oq "${ACTEURS_ZIP}" -d "${ACTEURS_DIR}"`, { stdio: "inherit" });
}

// ───────────────────────────── 2) résoudre les acteurRef par nom

interface ActorParsed {
  uid: string;
  prenom: string;
  nom: string;
  /** Best-effort department label parsed from the actor's elected mandate. */
  departement?: string;
}

interface AMOActor {
  uid?: { "#text"?: string } | string;
  etatCivil?: { ident?: { prenom?: string; nom?: string } };
  mandats?: {
    mandat?: AMOMandat[] | AMOMandat;
  };
}

interface AMOMandat {
  typeOrgane?: string;
  election?: {
    lieu?: {
      numDepartement?: string;
      departement?: string;
    };
  };
}

function extractActor(a: AMOActor): ActorParsed | null {
  const uid = typeof a.uid === "string" ? a.uid : a.uid?.["#text"];
  const prenom = a.etatCivil?.ident?.prenom;
  const nom = a.etatCivil?.ident?.nom;
  if (!uid || !prenom || !nom) return null;
  // Find a député mandate to read the department from.
  const mandats = a.mandats?.mandat;
  const list: AMOMandat[] = Array.isArray(mandats) ? mandats : mandats ? [mandats] : [];
  let dept: string | undefined;
  for (const m of list) {
    if (m.typeOrgane === "ASSEMBLEE" && m.election?.lieu?.departement) {
      dept = m.election.lieu.departement;
      break;
    }
  }
  return { uid, prenom, nom, departement: dept };
}

async function loadAllActors(): Promise<ActorParsed[]> {
  // AMO files unzip to a tree. The actor records can be one file per actor
  // (json/acteur/PA*.json) or a single bundled json. Try both shapes.
  const actors: ActorParsed[] = [];

  // Walk shape A: one file per actor.
  const acteurDir = path.join(ACTEURS_DIR, "json", "acteur");
  try {
    const files = await fs.readdir(acteurDir);
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      const raw = JSON.parse(await fs.readFile(path.join(acteurDir, f), "utf-8"));
      const a = (raw.acteur ?? raw) as AMOActor;
      const parsed = extractActor(a);
      if (parsed) actors.push(parsed);
    }
    if (actors.length > 0) return actors;
  } catch { /* shape A absent, try B */ }

  // Walk shape B: a single bundled json.
  const candidates = await fs.readdir(ACTEURS_DIR);
  for (const f of candidates) {
    if (!f.endsWith(".json")) continue;
    const raw = JSON.parse(await fs.readFile(path.join(ACTEURS_DIR, f), "utf-8"));
    const list: AMOActor[] = raw.export?.acteurs?.acteur ?? raw.acteurs?.acteur ?? [];
    for (const a of list) {
      const parsed = extractActor(a);
      if (parsed) actors.push(parsed);
    }
    if (actors.length > 0) return actors;
  }

  throw new Error(`No actors parsed from ${ACTEURS_DIR}. Check unzip output.`);
}

function resolvePersonnaliteRefs(actors: ActorParsed[]): Map<PersonnaliteCode, string> {
  const refs = new Map<PersonnaliteCode, string>();
  for (const code of PERSONNALITE_CODES) {
    const meta = PERSONNALITES[code];
    if (meta.acteur_ref) { refs.set(code, meta.acteur_ref); continue; }
    const targetPrenom = normalize(meta.prenom);
    const targetNom = normalize(meta.nom);
    const targetDept = normalize(meta.departement);
    const matches = actors.filter((a) =>
      normalize(a.prenom) === targetPrenom && normalize(a.nom) === targetNom,
    );
    let chosen: ActorParsed | undefined;
    if (matches.length === 1) chosen = matches[0];
    else if (matches.length > 1 && targetDept) {
      chosen = matches.find((a) => normalize(a.departement) === targetDept);
    }
    if (chosen) {
      refs.set(code, chosen.uid);
      console.log(`  ✓ ${meta.display_name} → ${chosen.uid}`);
    } else {
      console.warn(`  ✕ ${meta.display_name} unresolved (${matches.length} candidates) — votes will be "non_dispo"`);
    }
  }
  return refs;
}

// ──────────────── 3) scanner les scrutins et trouver les votes nominatifs

interface ANVotant { acteurRef: string }
interface ANNominatif {
  pours?: { votant?: ANVotant[] | ANVotant };
  contres?: { votant?: ANVotant[] | ANVotant };
  abstentions?: { votant?: ANVotant[] | ANVotant };
  nonVotants?: { votant?: ANVotant[] | ANVotant };
  nonVotantsVolontaires?: { votant?: ANVotant[] | ANVotant };
}
interface ANGroup {
  vote?: { decompteNominatif?: ANNominatif };
}
interface ANScrutin {
  uid: string;
  dateScrutin: string;
  ventilationVotes?: { organe?: { groupes?: { groupe?: ANGroup[] | ANGroup } } };
}

function asArr<T>(v: T[] | T | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

/** Extract per-personality vote for one scrutin given the acteurRef map. */
function extractVotesFromScrutin(
  scrutin: ANScrutin,
  refToCode: Map<string, PersonnaliteCode>,
): Partial<Record<PersonnaliteCode, PersonnaliteVote>> {
  const out: Partial<Record<PersonnaliteCode, PersonnaliteVote>> = {};
  // Default everyone to non_dispo; promote to actual vote when found.
  for (const code of PERSONNALITE_CODES) out[code] = "non_dispo";

  const groupes = asArr(scrutin.ventilationVotes?.organe?.groupes?.groupe);
  for (const g of groupes) {
    const dn = g.vote?.decompteNominatif;
    if (!dn) continue;
    for (const v of asArr(dn.pours?.votant)) {
      const code = refToCode.get(v.acteurRef);
      if (code) out[code] = "pour";
    }
    for (const v of asArr(dn.contres?.votant)) {
      const code = refToCode.get(v.acteurRef);
      if (code) out[code] = "contre";
    }
    for (const v of asArr(dn.abstentions?.votant)) {
      const code = refToCode.get(v.acteurRef);
      if (code) out[code] = "abstention";
    }
    for (const v of asArr(dn.nonVotants?.votant)) {
      const code = refToCode.get(v.acteurRef);
      if (code) out[code] = "absent";
    }
    for (const v of asArr(dn.nonVotantsVolontaires?.votant)) {
      const code = refToCode.get(v.acteurRef);
      if (code) out[code] = "absent";
    }
  }
  return out;
}

// ───────────────────────────────────────────────────── 4) orchestrate

async function main(): Promise<void> {
  await ensureActeursExtracted();
  const actors = await loadAllActors();
  console.log(`◯ Loaded ${actors.length} acteurs from AN open data`);

  console.log(`◯ Resolving personality acteurRefs:`);
  const refs = resolvePersonnaliteRefs(actors);
  const refToCode = new Map<string, PersonnaliteCode>();
  for (const [code, ref] of refs) refToCode.set(ref, code);
  console.log(`◯ ${refs.size}/${PERSONNALITE_CODES.length} personalities resolved`);

  // Scan local scrutins cache for nominative votes.
  const sb = createClient(SUPABASE_URL!, SUPABASE_KEY!);
  const { data: scrutinsInDb, error: listErr } = await sb.from("scrutins").select("id");
  if (listErr) throw new Error(`Could not list scrutins: ${listErr.message}`);
  const targetIds = new Set((scrutinsInDb ?? []).map((r) => r.id as string));
  console.log(`◯ ${targetIds.size} scrutins in DB to patch`);

  const files = (await fs.readdir(SCRUTINS_JSON_DIR)).filter((f) => f.endsWith(".json"));
  const updates: Array<{ id: string; votes_personnalites: Partial<Record<PersonnaliteCode, PersonnaliteVote>> }> = [];
  for (const f of files) {
    const raw = JSON.parse(await fs.readFile(path.join(SCRUTINS_JSON_DIR, f), "utf-8"));
    const scrutin: ANScrutin = raw.scrutin ?? raw;
    if (!targetIds.has(scrutin.uid)) continue;
    const votes = extractVotesFromScrutin(scrutin, refToCode);
    updates.push({ id: scrutin.uid, votes_personnalites: votes });
  }
  console.log(`◯ Built ${updates.length} per-scrutin personality vote payloads`);

  // Patch the DB by chunks.
  const CHUNK = 100;
  for (let i = 0; i < updates.length; i += CHUNK) {
    const chunk = updates.slice(i, i + CHUNK);
    const { error } = await sb.from("scrutins").upsert(chunk);
    if (error) {
      console.error(`✕ Chunk ${i}-${i + chunk.length} failed:`, error);
      process.exit(1);
    }
    console.log(`  ✓ chunk ${i}-${i + chunk.length}`);
  }

  // Quick stats: for each personality, how many scrutins have a real vote vs non_dispo.
  console.log(`\n── Per-personality coverage:`);
  for (const code of PERSONNALITE_CODES) {
    let real = 0; let absent = 0; let nd = 0;
    for (const u of updates) {
      const v = u.votes_personnalites[code];
      if (v === "pour" || v === "contre" || v === "abstention") real++;
      else if (v === "absent") absent++;
      else nd++;
    }
    console.log(`  ${code.padEnd(11)} ${real} votés · ${absent} absent · ${nd} non_dispo`);
  }
  console.log(`✓ Done.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
