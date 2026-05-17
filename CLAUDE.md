# Sans Détour — context for Claude Code

> Une nouvelle session Claude lit ce fichier au démarrage et y trouve
> l'essentiel : ce qu'est le projet, sa stack, ses décisions de design,
> son état actuel, et ce qui reste à faire. Garde ce fichier à jour à
> chaque feature livrée — c'est notre mémoire partagée entre sessions.

## Concept

App mobile-first qui mesure l'**alignement réel** entre l'utilisateur et
les groupes parlementaires (puis les personnalités présidentielles en V2),
basé **uniquement sur les votes effectifs à l'Assemblée Nationale** — pas
les programmes, pas les déclarations, pas les sondages.

Tagline : « Pas les programmes. Les vrais votes. »

Focus 2027 (présidentielle). La partie européenne viendra plus tard.

## Stack

- **Front** : React 19 + Vite 8 + React Router 7 + TypeScript 5.8
  + Tailwind 4 + Framer Motion 11
- **Back** : Supabase (Postgres + edge functions)
- **IA** : Anthropic Claude Haiku 4.5 via Batches API + web_search (ingestion uniquement, pas en runtime)
- **Tests** : Vitest + Testing Library
- **Déploiement** : Vercel (auto-deploy depuis `feat/v1-implementation` en prod)
- **Repo GitHub** : `waramere1234/sans-detour`

## Routes

- `/` **Cover** — page d'accueil avec wordmark, baseline, lien data AN, bouton Commencer
- `/play` — deck de 20 cartes à swiper (cœur de l'app)
- `/result` — alignement par groupe + (V2) toggle "Voir les personnalités"
- `/methode` et `/legal` — pages secondaires

## Données

### Schema Supabase (`scrutins`)

Une seule table. Colonnes :

| Colonne | Type | Description |
|---|---|---|
| `id` | text PK | ex `VTANR5L17V1234` |
| `numero` | int | numéro AN du scrutin |
| `date` | date | date du scrutin |
| `dossier_id`, `dossier_titre` | text | dossier législatif (vide → `STANDALONE-...`) |
| `chapeau` | text | « THÈME · DOSSIER » (généré LLM) |
| `titre_brut` | text | libellé officiel AN |
| `titre_pedago` | text | reformulation 12 mots (LLM) |
| `contexte` | text | 30-50 mots, 2 phrases, avec `**bold**` |
| `analyse_loi` | jsonb | 6 listes : mesures, gagnants, perdants, neutres, calendrier, exceptions |
| `points_cles` | jsonb | exactement 3 bullets ≤ 7 mots (affichés en recto) |
| `theme` | text | bucket V2 pour diversité (voir liste) |
| `votes_personnalites` | jsonb | `{ "le_pen": "pour", "faure": "contre", ... }` (V2) |
| `position_par_groupe` | jsonb | `{ "RN": "contre", "EPR": "pour", "LFI": "divisé", ... }` |
| `votes_bruts` | jsonb | breakdown pour/contre/abst/absent par groupe |
| `url_an_officielle` | text | URL `assemblee-nationale.fr/dyn/17/scrutins/N` |
| `est_solennel` | bool | true si SPS, info factuelle uniquement |
| `pedago_relu` | bool | toujours false pour l'instant (V3 : audit humain) |

Migrations dans `supabase/migrations/0001..0006_*.sql`. Toutes appliquées sur le projet `sans-detour-prod` (ref `rnhkvzqerbrvrlpstxgx`).

### État actuel

- **100 scrutins** en base, 92 votables (8 fallback exclus par filtre front)
- **8 personnalités** indexées avec leur acteurRef

## Personnalités V2 (`src/lib/personnalites.ts`)

| Code | Nom | Groupe | acteurRef | Note |
|---|---|---|---|---|
| `le_pen` | Marine Le Pen | RN | PA720614 | |
| `faure` | Olivier Faure | SOC | PA609332 | |
| `chatelain` | Cyrielle Chatelain | ECO | PA794008 | présidente groupe ECO |
| `wauquiez` | Laurent Wauquiez | DR | PA267285 | président groupe DR |
| `attal` | Gabriel Attal | EPR | PA722190 | |
| `ciotti` | Éric Ciotti | UDR | PA330240 | |
| `bompard` | Manuel Bompard | LFI | PA793444 | |
| `panot` | Mathilde Panot | LFI | PA720892 | présidente groupe LFI |

**Exclus par contrainte structurelle** : Mélenchon (pas député), Philippe
(mairie), Glucksmann (MEP), Bardella (élu 2024 mais démissionné avant
siège), Tondelier (jamais députée), Darmanin (ministre 95% du temps,
3 votes effectifs uniquement).

## Filtre d'ingestion (`scripts/ingest-an.ts` — `isEligibleScrutin`)

**Garde** :
- SPS qui ne sont pas des amendements
- SOR avec « sur l'ensemble » dans le titre (vote final d'une loi)
- Motions de censure + référendaires
- Propositions de résolution (hors amendements)

**Drop** :
- Tout titre contenant `\bamendements?\b` ou `\bà l'article\b`
- Motions de rejet préalable / renvoi en commission (procédurales)

## Thèmes (`src/types/index.ts`)

```
pouvoir-achat · retraites · immigration · sécurité · écologie · santé
école · fiscalité · institutions · international · autre
```

Tagués par le LLM lors de l'ingestion. `normalizeTheme` valide contre l'enum
(tout label hors liste → `autre`).

## Composition de deck (`src/lib/deck.ts` — `composeDeck`)

Trois caps cumulatifs sur 20 cartes :

1. **Round-robin par thème** — ordre des thèmes mélangé par session,
   pioche un scrutin de chaque thème avant de revenir au premier.
2. **`capPerDossier = 2`** — max 2 cartes par dossier législatif.
3. **`capPerChapeauPrefix = 2`** — max 2 cartes partageant le préfixe
   chapeau (texte avant ` · `). Catche les clusters UKRAINE/MAYOTTE/MOTION
   CENSURE où plusieurs scrutins distincts portent sur le même sujet mais
   ont des dossier_id STANDALONE différents.

Les trois caps sont resume-aware via `seenDossierCounts` /
`seenChapeauPrefixCounts` pour qu'un reload mi-session respecte la
contrainte.

## Algorithme de matching (`src/lib/matching.ts`)

Score par scrutin : `1 - |SCALE[user] - SCALE[group]| / 2`
avec `SCALE = { pour: 1, abstention: 0, contre: -1 }`.

Donne 1 (parfait), 0.5 (partiel sur abstention), ou 0 (conflit).

Exclus du compteur :
- User a skip → `null`
- Groupe `divisé` → `null`
- Personnalité `absent` ou `non_dispo` → `null`

`computeAlignment` agrège par groupe ; `computeAlignmentPersonnalites`
fait la même chose pour les 8 personnalités.

## UI

### Navigation

- **TopBar** sticky (`src/components/TopBar.tsx`) sur Play/Result/Methode/Legal :
  wordmark à gauche (clickable → home), bouton `•••` à droite qui ouvre un
  popover ancré (avec petite flèche pointant vers le trigger, close sur
  backdrop/escape) listant : Mon résultat (N), Méthode & sources, Mentions
  légales, Contact, version.
- **Cover** garde son propre header riche (wordmark + data source) ; pas de
  TopBar dessus. Liens méthode/légal/contact accessibles via une nav row
  discrète sous « Commencer ».
- **MethodeSheet** (déclenché par la chip « ✨IA » sur la carte) reste un
  vrai bottom-sheet (slide-up, focus trap, aria-modal) — à ne pas confondre
  avec le popover du TopBar.

### Card (`src/components/Card.tsx`)

- Recto : chapeau + chip ✨IA (ouvre MethodeSheet) + titre_pedago + 3
  points_cles + footer date/numéro.
- Verso unifié (commit `9cb7e6c` a fusionné les anciennes variantes
  explanation/analyse) : contexte + sections analyse_loi (mesures, concernés,
  calendrier, exceptions) si présentes + séparateur "Synthèse IA / texte
  officiel AN" + intitulé brut AN + footer (tap pour revenir + lien AN).
- `stripVoteResult` ne matche que `:` (pas `.`) pour ne pas tronquer le
  contexte sur « ...sans vote. Une motion... »

## Conventions

### Commits

Style Conventional Commits, scope français, message anglais.
Exemple :
```
feat(deck): cap per chapeau prefix to break MAYOTTE/UKRAINE-style clusters

Adds capPerChapeauPrefix to composeDeck (and drawNext for refinement
mode). The chapeau prefix proxies a political subject; capping at 2
prevents a 20-card session from seeing 3+ scrutins on the same topic...
```

Pas de mention du modèle dans les commits/PR (Claude Code 1M context, etc.).

### Branches

- `feat/v1-implementation` = **branche prod** (Vercel auto-deploy)
- `claude/check-app-access-9Yvx0` = branche de travail V2 actuelle

### Tests

`npm run test:run` (Vitest, ~126 tests aujourd'hui couvrant matching / deck / session / parties / personnalites / analytics / Card / Cover / MethodeSheet / ErrorBoundary / FreshnessBanner / compute-positions / sanity / deck-invariants, doivent rester verts à chaque commit).

### Commandes utiles

```bash
npm run dev                       # dev local, port 5173
npm run build                     # build de prod
npm run test:run                  # tests Vitest
npm run ingest:an                 # ingestion AN (Haiku 4.5 + Batches API, ~$0.20-0.30, 2-10min)
npx tsx scripts/resume-ingest.ts  # récupération d'un batch failed
npx tsx scripts/ingest-personnalites.ts  # injection votes personnalités
```

## Roadmap

- ✅ V1 (livré)
- ✅ V2 P1 — Corpus élargi + thématisation (~100 scrutins)
- ✅ V2 P2 — Personnalités présidentielles (8 figures)
- ✅ V2 UX — Refonte menu (TopBar wordmark + bouton `•••` ouvrant un popover ancré ; MethodeSheet bottom-sheet reste séparé, déclenché par la chip ✨IA des cartes)
- ⏳ **V2 P3 — Ton député** : code postal optionnel sur Cover → ligne
  d'alignement avec son député local. Quick win (~2 jours) qui exploite
  l'infra `votes_personnalites` déjà en place mais pour TOUS les députés
  (pas que les 8 personnalités).
- 🟡 V2 transparence (en partie livré) :
  - ✅ Disclaimer "généré par IA" sur cartes — chip ✨IA sur le recto ouvre
    MethodeSheet, footer "Synthèse mise en forme par Claude" sur le verso,
    séparateur "↑ Synthèse IA · ↓ texte officiel AN".
  - ⏳ Liens vers sources web_search (citations stripées par `stripCitations`
    aujourd'hui — pourrait être surfacé dans MethodeSheet).
  - ⏳ Page `/limitations` dédiée (le contenu existe en partie dans `/methode`
    §07 "Le rôle de l'IA Claude").
- ⏳ V3 — pré-vote sur dossiers à venir (cf v2-roadmap.md, "idée parking")

## Décisions de design importantes

1. **On garde le principe « 1 carte = 1 vote réel »** — pas de programmes,
   pas de déclarations. Les cartes engagements sont pour V3+.
2. **Pas de cartes sans description** côté front — filtre
   `points_cles IS NOT NULL` exclut les fallback du LLM.
3. **Round-robin par thème** prime sur le tri aléatoire pur — garantit
   diversité même avec un pool déséquilibré.
4. **Ministres en gouvernement = non_dispo** — leur suppléant siège, leurs
   votes n'existent pas en pratique. C'est pourquoi Darmanin est exclu.
5. **Pas de recommendation explicite de candidat** — l'app montre des
   alignements, pas des conseils de vote. Critique pour la neutralité.

## Limitations connues

- **Retraites / immigration / école sous-représentés** dans le corpus (1
  carte chacun) — réalité de la 17e législature (dissolutions, gouvernements
  courts → peu de lois finalisées sur ces thèmes). Non corrigible sans
  rompre le principe « vote réel ».
- **7 chapeaux mal formés** (« LA MOTION DE… », « PROJET DE LOI »…) — le
  LLM n'a pas respecté le format `THÈME · DOSSIER` sur ces cas. Cosmétique,
  pas bloquant.

## Workflow Claude Code en local

Quand tu es dans une session Claude Code locale sur ce repo :
- Tu peux éditer les fichiers directement, plus besoin de git pull
- Les changements apparaissent en live dans VS Code (badges M/A)
- Tu commits et push toi-même quand tu valides, ou demande à Claude
- Pour pousser en prod : merger sur `feat/v1-implementation`
