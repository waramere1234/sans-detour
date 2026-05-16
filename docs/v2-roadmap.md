# Sans Détour — V2 Roadmap

> Status: **en cours**. Focus 2027 (présidentielle). Les chantiers sont
> additifs : on garde le principe "swipe sur votes réels", on n'ajoute pas
> de programmes ni de déclarations.

---

## Feature 1 — Corpus élargi + thématisation ✅ (livré et en prod)

**Objectif atteint** : passer de 46 SPS à ~100 votes en gardant le principe "1 carte = 1 vote réel à l'AN".

### Filtre d'ingestion final (`scripts/ingest-an.ts` · `isEligibleScrutin`)

**Inclus** :
- Tous les scrutins solennels (SPS) qui ne sont pas des amendements.
- Scrutins ordinaires dont le titre contient "sur l'ensemble" → vote final d'une loi.
- **Motions de censure** et **motions référendaires** (signal politique fort, rares).
- Propositions de résolution (Palestine, Ukraine, Mercosur, etc.) — hors amendements.

**Exclus** :
- Tout titre contenant `amendement` ou `à l'article` (sous-clauses, trop bruyantes à présenter).
- **Motions de rejet préalable et de renvoi en commission** (procédurales — discriminent "majorité vs opposition" plutôt que gauche/droite).

### Thématisation

Colonne `theme` (migration `0005_add_theme.sql`), valeurs dans `THEMES` (`src/types/index.ts`) :
> pouvoir-achat · retraites · immigration · sécurité · écologie · santé · école · fiscalité · institutions · international · autre

Tagué par le même LLM lors de l'ingestion (1 champ de plus dans le JSON). Validation post-LLM dans `normalizeTheme` : tout label hors enum collapse vers `autre`.

### Composition de deck (`src/lib/deck.ts`)

Trois caps cumulatifs sur le tirage de 20 cartes :
1. **Round-robin par thème** — l'ordre des thèmes est mélangé par session, on pioche un scrutin de chaque thème avant de revenir au premier.
2. **`capPerDossier = 2`** (V1) — max 2 cartes par dossier législatif.
3. **`capPerChapeauPrefix = 2`** (V2) — max 2 cartes partageant le préfixe de chapeau (le segment avant " · "). Catche les clusters style UKRAINE / MAYOTTE / MOTION CENSURE où plusieurs scrutins distincts portent sur le même sujet politique mais ont des `dossier_id` STANDALONE différents.

Les compteurs des trois caps sont resume-aware via `seenDossierCounts` et `seenChapeauPrefixCounts` — un reload mi-session ne casse pas la contrainte.

### Front (`src/lib/scrutins.ts`)

`fetchScrutins` filtre désormais sur **`points_cles IS NOT NULL`** : exclut les ~8% de rows en fallback (LLM call échoué, pas de contexte, pas d'analyse) qui ne sont pas votables. Le filtre `est_solennel = true` a été retiré (le filtrage qualité est à l'ingestion).

### Outils annexes

- `scripts/resume-ingest.ts` : récupération d'un batch déjà payé chez Anthropic en cas d'échec d'upsert. Re-parse la cache AN locale, applique le filtre courant, merge avec les summaries existantes, upsert + delete des rows désormais inéligibles. Coût : 0$ Anthropic.

### État Supabase post-ingestion (mai 2026)

- **100 scrutins** en base (post-resserrage du filtre), dont **92 votables** (avec points_cles) — les 8 fallback sont en DB mais exclus du front.
- Distribution thématique : `institutions` 27% · `sécurité` 15% · `international` 13% · `santé` 12% · `fiscalité` 7% · `écologie` 5% · `pouvoir-achat` 3% · `autre` 8% · `retraites` 1% · `immigration` 1% · `école` 0%.
- **Limite structurelle** : retraites/immigration/école sous-représentés. C'est la réalité de la 17ᵉ législature (dissolutions, gouvernements courts → peu de lois finalisées sur ces sujets). Non corrigible sans rompre le principe "vote réel".

### Reste à faire (cosmétique, non bloquant)

- ~7 chapeaux mal formés ("LA MOTION DE…", "L'ARTICLE UNIQUE DE…", "PROJET DE LOI") — 3 options : laisser / patcher SQL / re-ingestion avec prompt renforcé.

---

## Feature 2 — Personnalités présidentielles ✅ (livré et en prod)

**Objectif atteint** : exposer un alignement utilisateur ↔ personnalité connue, en plus du V1 utilisateur ↔ groupe parlementaire. Toujours sur des votes effectifs uniquement.

### Personnalités indexées (8)

| # | Personnalité | acteurRef | Groupe | Couverture (sur 100 scrutins) |
|---|---|---|---|---:|
| 1 | Mathilde Panot | PA720892 | LFI | 78 |
| 2 | Manuel Bompard | PA793444 | LFI | 70 |
| 3 | Cyrielle Chatelain | PA794008 | ECO | 67 |
| 4 | Marine Le Pen | PA720614 | RN | 58 |
| 5 | Éric Ciotti | PA330240 | UDR | 56 |
| 6 | Gabriel Attal | PA722190 | EPR | 52 |
| 7 | Olivier Faure | PA609332 | SOC | 50 |
| 8 | Laurent Wauquiez | PA267285 | DR | 50 |

Distribution : 2 LFI · 1 ECO · 1 SOC · 1 EPR · 1 DR · 1 UDR · 1 RN.

### Exclus par contrainte structurelle

- **Mélenchon / Philippe / Glucksmann** : ne siègent pas dans la 17ᵉ (national, mairie, eurodéputé).
- **Bardella** : élu député en 2024, démissionné avant siège (mandat européen conservé). 0 vote AN.
- **Tondelier** : secrétaire nationale EELV + conseillère régionale, jamais députée. ECO représenté par Chatelain.
- **Darmanin** : ministre sur quasi-totalité du mandat (suppléant siège), 3 votes effectifs uniquement — trop fin pour produire un signal.

### Schema

- Migration `0006_add_votes_personnalites.sql` ajoute `votes_personnalites jsonb` à `scrutins`.
- Format : `{ "le_pen": "pour", "faure": "contre", "chatelain": "abstention", "attal": "non_dispo", ... }`.
- Valeurs possibles : `pour` · `contre` · `abstention` · `absent` (sur le mandat mais n'a pas voté) · `non_dispo` (pas député à cette date).

### Ingestion

- `scripts/ingest-personnalites.ts` : lit le cache local des scrutins, scanne `decompteNominatif.pours/contres/abstentions/nonVotants` pour les 8 acteurRefs hardcodés, patche les 100 lignes via `.update().eq()` par batch de 20 (pas `.upsert()` — INSERT sans NOT NULL violation).
- Coût Anthropic : 0$.

### Algorithme

- `matching.ts` : `computeAlignmentPersonnalites` + `rankPersonnalitesByAlignment`. Même formule que les groupes (pour=1, contre=-1, abstention=0), mais avec deux compteurs d'exclusion (`absent_excluded`, `non_dispo_excluded`) — la non-disponibilité n'écrase pas le %.

### UI

- `src/components/PersonnaliteRow.tsx` : ligne avec dot de couleur parti, barre de progression, % + nombre comparable. Auto-dim à `counted < 3` quand l'échantillon est trop fin pour le user.
- `src/routes/Result.tsx` : toggle "Voir les personnalités" sous les groupes, dépliable. Note de transparence sur les exclus.

## Feature 3 — Ton député (à venir)

Champ code postal optionnel sur la cover → ligne d'alignement avec son député local. Quick win qui exploite l'infra individual-votes déjà en place (extension du même pipeline `votes_personnalites` que la feature 2, mais pour TOUS les députés au lieu des 8 personnalités).

---

## Idée parking — Pré-vote sur dossiers à venir

> Conservée en réserve : intéressante mais hors scope du sprint 2027 actuel
> (focus features 1-3 ci-dessus). À reprendre après la présidentielle ou si
> les métriques V1 montrent une forte demande de "boucle de retour".

### Idée

Permettre à l'utilisateur de **pré-voter** sur des projets de loi **avant** que l'Assemblée Nationale ne se prononce. Quand l'AN vote réellement (semaines/mois plus tard), l'app affiche un **verdict** comparant la position de l'utilisateur à celle des groupes parlementaires.

### Pourquoi c'est puissant

| Mécanisme | Effet |
|---|---|
| Pré-vote *avant* connaître la position des partis | Mesure d'alignement plus honnête (intuition pure, pas mimétisme) |
| Verdict différé quand l'AN vote enfin | Boucle de retour, raison de revenir sur l'app |
| Hook notification ("ton vote sur X est tombé") | Excuse pour ramener l'utilisateur 2-4 semaines plus tard |
| Apprentissage continu | L'utilisateur voit si ses intuitions matchent vraiment ses partis "alignés" |

Le V1 actuel répond à : *"avec qui je suis aligné aujourd'hui ?"*
La V2 ajoute : *"mes intuitions sont-elles cohérentes avec mes affinités ?"*

### Les 6 pièges identifiés

1. **Beaucoup de dossiers n'ont jamais d'SPS final.** Sur ~300 dossiers déposés par législature, ~50-80 finissent en vote solennel. Les autres meurent en commission, sont passés en 49.3, retirés, ou enterrés par motion de rejet. → UI claire pour ces cas : *"Ce dossier n'a pas été soumis au vote solennel"*.

2. **Le contenu d'un projet de loi évolue entre dépôt et vote.** Un texte en commission en juin peut être méconnaissable en novembre. → Afficher les deux versions (titre initial vs titre final) côte à côte sur le verdict.

3. **Plusieurs SPS par dossier** (1ère lecture, 2ème lecture, CMP, lecture définitive). Lequel résout le pré-vote ? → Reco : **lecture définitive** ou **CMP** (`texte de la commission mixte paritaire`).

4. **Storage / perte de pré-votes.** localStorage perdu = pré-votes perdus. Avec un pré-vote en juin et verdict en novembre, risque réel. → Reco MVP : **localStorage** suffit, message clair. Passer à Supabase Auth seulement si la feature performe.

5. **Notification de retour.** Push PWA = conversion faible (~5-10%). Email = compte requis. → Reco MVP : **in-app only** (bannière sur la cover quand verdicts en attente). Push si la feature décolle.

6. **Quels dossiers proposer ?** ~30-50 dossiers en cours à tout moment, beaucoup techniques. → Heuristique : filtrer ceux **inscrits à l'ordre du jour** de la séance publique (donc proches d'un vote), via `data.assemblee-nationale.fr`. ~5-15 actifs à la fois.

### Shape MVP

```
[Cover] → [Play 20 votes] → [Result] → [NEW: section "Vote en avant"]
                                              ↓
                                    Liste 5-15 dossiers à venir
                                              ↓
                                    Swipe pour/contre/abstention
                                              ↓
                                    "Verdict ici dans X semaines"

[Retour user 3 semaines plus tard]
                                              ↓
                              Cover détecte verdicts en attente → bannière
                                              ↓
                                    [NEW: /verdicts] page récap
                                    "Tu avais voté POUR le PL X.
                                     L'AN a voté CONTRE.
                                     Ton alignement EPR : 47% → 44%."
```

### Tech à ajouter

1. **Ingestion dossiers** (en plus des scrutins). Source : `Dossiers_Legislatifs.json.zip` sur data.assemblee-nationale.fr.
2. **Filtrage "à voter prochainement"** — calendrier ordre du jour AN.
3. **Schema localStorage** : `prevotes: [{dossier_ref, choice, voted_at, dossier_titre_snapshot}]`.
4. **Job de résolution** : à chaque ingestion de nouveau SPS, matcher `dossier_ref` avec les `prevotes` non résolus → marquer "à montrer".
5. **UI** : liste dossiers actifs, page `/verdicts`, bannière sur Cover.
6. **Plausible events** : `prevote_cast`, `verdict_viewed`.

### Effort estimé

~5-8 jours de dev pour une implémentation propre (ingestion dossiers + UI pré-vote + UI verdicts + job de résolution + tests).

---

## Autres idées V2 (à prioriser plus tard)

- **Section "En ce moment à l'AN"** — flux d'actualité des dossiers en cours, indépendant du test d'alignement. Source : page `/dyn/17/dossiers`.
- **Filtrage thématique** — pouvoir refaire le test sur des thèmes (économie / écologie / immigration / etc.) si suffisamment de scrutins par thème.
- **Historique de session** — voir ses anciens résultats (nécessite Supabase Auth).
- **Intégration motions de censure** (22 MOC) si on veut élargir la matière. ⚠️ Risque : discrimine surtout "gouvernement vs opposition" plutôt que gauche vs droite. Test à faire avant intégration permanente.

---

## Notes liées au V1 (non bloquantes pour V2)

- Le pipeline d'ingestion actuel (`scripts/ingest-an.ts`, Haiku 4.5 + Batches API + web_search) sera réutilisé tel quel pour résumer les dossiers à venir — il suffira de passer le payload du dossier (titre + exposé des motifs si dispo) au lieu du titre du scrutin.
- La fonction `composeDeck` peut être adaptée pour produire un "deck de pré-vote" filtré par statut "à voter".
- L'UI Card (avec son flip 3D) marchera telle quelle, juste avec une mention "PRÉ-VOTE" sur la carte au lieu de la date du scrutin.
