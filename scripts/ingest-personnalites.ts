// scripts/ingest-personnalites.ts
//
// Indexation V2 — extrait les votes nominatifs des personnalités définies
// dans src/lib/personnalites.ts pour chaque scrutin déjà en base et patche
// la colonne `votes_personnalites` (migration 0006).
//
// Pipeline :
//   1. Construit le map acteurRef → personality code depuis les valeurs
//      hardcodées dans src/lib/personnalites.ts (vérifiées manuellement sur
//      assemblee-nationale.fr/dyn/deputes/<ref>).
//   2. Pour chaque scrutin du cache local /tmp/sd-an-cache/json/, scanne
//      decompteNominatif (pours/contres/abstentions/nonVotants) et trouve
//      les votes des acteurRefs reconnus.
//   3. Upsert la colonne `votes_personnalites` par chunks.
//
// Coût Anthropic : 0$ (aucun appel LLM, ni à l'API AN — uniquement la
// cache locale de scrutins).
//
// Usage :
//   SUPABASE_URL=... \
//   SUPABASE_SERVICE_ROLE_KEY=... \
//   npx tsx scripts/ingest-personnalites.ts

import { promises as fs } from "node:fs";
import path from "node:path";
import { PERSONNALITES } from "../src/lib/personnalites";
import { PERSONNALITE_CODES } from "../src/types";
import type { PersonnaliteCode, PersonnaliteVote } from "../src/types";
import { JSON_DIR } from "./lib/an-cache";
import { requireSupabaseClient } from "./lib/env";

// JSON_DIR lives in scripts/lib/an-cache.ts; this script reads the
// nominative votes (decompteNominatif) which the shared iterEligibleScrutins
// doesn't expose — so we do our own directory walk below, but on the same
// path as the other two scripts.

// ──────────── scan local scrutins for nominative votes ──────────────────

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

/** Extract per-personality vote for one scrutin given the acteurRef map.
 *  Defaults to "non_dispo" for every personality, then upgrades to a real
 *  vote when found in any group's decompteNominatif. */
function extractVotesFromScrutin(
  scrutin: ANScrutin,
  refToCode: Map<string, PersonnaliteCode>,
): Partial<Record<PersonnaliteCode, PersonnaliteVote>> {
  const out: Partial<Record<PersonnaliteCode, PersonnaliteVote>> = {};
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

// ───────────────────────────────────────────────────── orchestrate

async function main(): Promise<void> {
  console.log(`◯ Personnalités indexées :`);
  const refToCode = new Map<string, PersonnaliteCode>();
  for (const code of PERSONNALITE_CODES) {
    const meta = PERSONNALITES[code];
    refToCode.set(meta.acteur_ref, code);
    console.log(`  · ${meta.display_name.padEnd(22)} ${meta.acteur_ref}`);
  }

  const sb = requireSupabaseClient();
  const { data: scrutinsInDb, error: listErr } = await sb.from("scrutins").select("id");
  if (listErr) throw new Error(`Could not list scrutins: ${listErr.message}`);
  const targetIds = new Set((scrutinsInDb ?? []).map((r) => r.id as string));
  console.log(`◯ ${targetIds.size} scrutins en base à patcher`);

  const files = (await fs.readdir(JSON_DIR)).filter((f) => f.endsWith(".json"));
  console.log(`◯ ${files.length} fichiers de scrutins dans le cache local`);

  const updates: Array<{ id: string; votes_personnalites: Partial<Record<PersonnaliteCode, PersonnaliteVote>> }> = [];
  for (const f of files) {
    const raw = JSON.parse(await fs.readFile(path.join(JSON_DIR, f), "utf-8"));
    const scrutin: ANScrutin = raw.scrutin ?? raw;
    if (!targetIds.has(scrutin.uid)) continue;
    const votes = extractVotesFromScrutin(scrutin, refToCode);
    updates.push({ id: scrutin.uid, votes_personnalites: votes });
  }
  console.log(`◯ ${updates.length} payloads votes_personnalites construits`);

  // Patch en base avec UPDATE par id (et NON `.upsert()`).
  //
  // Pourquoi pas upsert : PostgREST .upsert() traduit en
  // `INSERT ... ON CONFLICT DO UPDATE`, et Postgres valide les contraintes
  // NOT NULL du tuple INSÉRÉ avant d'aplanir le conflit. Comme on n'envoie
  // que { id, votes_personnalites }, le `numero NOT NULL` est violé et la
  // requête est rejetée — même quand l'id existe déjà.
  //
  // Le UPDATE explicite n'a pas ce problème : il ne touche que la colonne
  // patché, les autres restent ce qu'elles sont en base.
  //
  // ingere_le est aussi stamped : sans ça, FreshnessBanner rapporte la
  // date d'ingestion ORIGINALE alors que la table a été patchée à
  // l'instant (même fix que session 70 pour ingest-an.ts + resume-ingest.ts).
  console.log(`↑ Patching ${updates.length} rows via UPDATE …`);
  const patchedAt = new Date().toISOString();
  const BATCH = 20;
  let patched = 0;
  for (let i = 0; i < updates.length; i += BATCH) {
    const batch = updates.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map((u) =>
        sb.from("scrutins")
          .update({ votes_personnalites: u.votes_personnalites, ingere_le: patchedAt })
          .eq("id", u.id),
      ),
    );
    for (const r of results) {
      if (r.error) {
        console.error(`✕ UPDATE failed:`, r.error);
        process.exit(1);
      }
    }
    patched += batch.length;
    process.stdout.write(`  ✓ ${patched}/${updates.length}\r`);
  }
  console.log(`\n  ✓ ${patched} rows patched`);

  // Stats finales : par personnalité, combien de votés vs absent vs non_dispo.
  console.log(`\n── Couverture par personnalité :`);
  for (const code of PERSONNALITE_CODES) {
    let real = 0; let absent = 0; let nd = 0;
    let pour = 0; let contre = 0; let abst = 0;
    for (const u of updates) {
      const v = u.votes_personnalites[code];
      if (v === "pour") { real++; pour++; }
      else if (v === "contre") { real++; contre++; }
      else if (v === "abstention") { real++; abst++; }
      else if (v === "absent") absent++;
      else nd++;
    }
    console.log(`  ${code.padEnd(11)} ${String(real).padStart(3)} votés (${pour}P · ${contre}C · ${abst}A) · ${absent} absent · ${nd} non_dispo`);
  }
  console.log(`✓ Done.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
