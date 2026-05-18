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
| `ingere_le` | timestamptz | timestamp d'ingestion stampé explicitement à chaque upsert (le `default now()` ne se déclenche qu'à l'INSERT, pas à l'UPDATE). Lu par `FreshnessBanner` pour afficher « dernière mise à jour il y a N jours ». |

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

## Filtre d'ingestion (`scripts/lib/an-filter.ts` — `isEligibleScrutin`)

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

`npm run test:run` (Vitest, ~1206 tests aujourd'hui couvrant matching / deck / session / parties / personnalites / analytics (incluant Plausible data-domain === PROD_HOSTNAME apex) / themes / App / aria-labels (incluant AN_OPEN_DATA_HOSTNAME + GITHUB_REPO_URL/_DISPLAY + WORDMARK_HOME_LABEL + PAGE_HEADER_NAV_LABEL + externalLinkLabel + VOTE_LABEL/ARIA × 3 + anScrutinViewAriaLabel + SKELETON_CARD/RESULT_LOADING_LABEL + DEMO_DATA_LABEL_PREFIX + restartConfirmMessage + refaireConfirmMessage + RANKING_OVERLAY_LABEL + MODAL_CLOSE_LABEL + CARD_VERSO_SEPARATOR_LABEL + AN_LINK_VISIBLE_LABEL + MENU_OPEN/CLOSE_LABEL + MAIN_MENU_LABEL + ERROR_FALLBACK_* + PERSONNALITES_TOGGLE_LABEL + CARD_AN_LIBELLE_PREFIX_LABEL + METHODE_SOMMAIRE_NAV_LABEL + COVER_SOURCE_ATTRIBUTION_AN/CLAUDE + chipTop1AriaLabel + METHODESHEET_AN/CLAUDE_BLOCK_TITLE + CARD_IA_CHIP_ARIA_LABEL + METHODE_PAGE_EYEBROW/H1 + DEMO_FALLBACK_SHORT_LABEL + AUDIT_TRAIL_LABEL_DIVIDED/ALIGNED/PARTIAL/OPPOSED + partyRowAriaLabel + personnaliteRowAriaLabel + personnaliteRowRightColumnText + freshnessTotalScrutinsPhrase + auditTrailChipNoun/Text + rankingOverlayHeaderText + resultEyebrowText + resultHeaderBodyLineText + resultPersonnalitesIndexedCountText + continueTestRemainingSuffix + coverProgressChipText + RESULT_TOP_LEAD + WORDMARK_TEXT + METHODESHEET_TITLE + METHODESHEET_FULL_METHODE/REPORT_ERROR_LINK_LABEL + RETRY_DEFAULT_LABEL + RESULT_GROUPS_H2 + RESULT_PERSONNALITES_H2 + TOPBAR_VERSION_LABEL + PLAY_DECK_EXHAUSTED_MESSAGE + PLAY_EMPTY_POOL_MESSAGE + COVER_HERO_PARAGRAPH + CARD_FLIP_ROLE_DESCRIPTION + cardAriaLabel + VOTE_FEEDBACK_LABELS + AN_LINK_SHORT_LABEL + NOSCRIPT_HEADING/MESSAGE + ROUTE_LOADER_LABEL + CARD_ANALYSE_TITLE_MESURES/CALENDRIER/EXCEPTIONS + CARD_ANALYSE_CONCERNES_* × 4 + METHODE_S07_HEADING_* × 4 + METHODE_SECTION_BODY_TITLES × 7 + METHODE_LINK_ANNOTATION_* × 4 + LEGAL_RGPD_HEADING_* × 7 + COVER_SECONDARY_NAV_LABEL + LEGAL_HEBERGEUR_NAME/ADDRESS + LEGAL_ANALYTICS_DESCRIPTION + LEGAL_DATA_LICENSE_LABEL + LEGAL_PERSONAL_DATA_BODY + LEGAL_INDEPENDANCE_BODY + METHODE_S06_NO_AFFILIATION_PHRASE + METHODE_S06_HOSTING_FUNDING_BODY + METHODE_S05_NO_TRACKING_PHRASE + METHODE_S05_LOCALSTORAGE_* + METHODE_S01_UPDATE_CADENCE + METHODE_S03_DIVIDED_RULE_* + METHODE_S03_GROUP_INTRO + METHODE_S07_MISE_EN_FORME_CLOSER + METHODE_S07_LIBELLE_BRUT_GUARANTEE + METHODE_PAGE_LEAD_INTRO/PURE_MATH + METHODE_S04_OPENER + METHODE_S02_EXCLUSIONS_SUFFIX + METHODE_S07_MODEL_DISCLOSURE + METHODE_S07_CLAUDE_TASKS_PREFIX/SUFFIX + METHODE_S07_LIMITES_DISCLAIMER_PREFIX/SUFFIX + METHODE_S07_NE_FAIT_PAS_BODY + METHODE_S07_CADRE_BIAIS_PREFIX/SUFFIX + METHODE_S02_CAPS_EXAMPLE + METHODE_S01_DATA_SOURCE_STRONG/QUALITY_CLAIM + METHODE_S04_RANK_NOISE_EXPLANATION + METHODE_S01_SAME_FILES_CLAIM + METHODE_S02_THEMES_EXAMPLES + METHODE_S03_ABSENTS_EXCLUSION + METHODE_S02_KEPT_* × 5 + METHODE_S04_FORMULA_LINES + METHODE_S03_THRESHOLD_RULE_SUFFIX/ELSE + METHODE_S02_RANDOM_AVOIDANCE + METHODE_S02_GARDE_FOUS_LEAD + METHODE_S02_GARDE_FOU_LEAD/DOSSIER_SUFFIX/SUJET_SUFFIX + METHODE_S04_RANK_THRESHOLD_SUFFIX + COVER_EYEBROW_SUFFIX + METHODE_PAGE_LEAD_TAIL + METHODE_PAGE_LEAD_SECTION_07_REF + CARD_VERSO_FLIP_BACK_HINT + CARD_NO_ANALYSE_FALLBACK_BODY + METHODE_S07_AN_LINK_PARENTHETICAL_PREFIX/SUFFIX + TAGLINE_PART_1/2 + METHODE_S06_INDEPENDENCE_OPENER_PREFIX/STRONG/SUFFIX + METHODESHEET_CLAUDE_MISSION_STRONG + PLAY_SR_HEADING + METHODESHEET_AN_BLOCK_BODY + METHODESHEET_CLAUDE_NO_AI_IN_SCORE + METHODESHEET_CLAUDE_TASKS_BODY + METHODESHEET_CLAUDE_PROMPT_NEUTRALITY_BODY + ERROR_FALLBACK_PERSISTENCE_HELP_PREFIX + RESULT_EMPTY_POOL_MESSAGE + LEGAL_SOURCES_DONNEES_OPENER_PREFIX/_LINK_TO_LICENSE_SEPARATOR + LEGAL_CODE_SOURCE_OPENER_PREFIX + METHODE_S03_DIVIDED_STRONG_LABEL + METHODE_S01_DATA_SOURCE_OPENER_PREFIX/_TO_CODE_SEPARATOR + METHODE_S02_KEPT_OPENER_PREFIX + METHODE_S04_RANK_OPENER_PREFIX/_BRIDGE_SEPARATOR + METHODE_S05_LOCALSTORAGE_CODE_LABEL + DEMO_FALLBACK_TITLE_SUFFIX/_ARIA_SUFFIX + RESULT_PERSONNALITES_EXCLUSIONS_NOTE + METHODE_S04_RANK_ORDINAL_MARKER + METHODE_PAGE_LEAD_LINK_CLOSER_SUFFIX + H1_ACCENT_PERIOD + RESULT_H1_PERCENT_WRAPPER_PREFIX/_SUFFIX + CARD_FOOTER_NUMERO_PREFIX/_DATE_SEPARATOR + MIDDLE_DOT_SEPARATOR + SHARE_LEAD_TO_SOURCE_SEPARATOR + SHARE_LEAD_TO_SUMMARY_SEPARATOR + VOTE_GLYPH_CONTRE/_SKIP/_POUR + BUTTON_ICON_RESTART + RESULT_CONTINUE_TEST_PAREN_PREFIX/_SUFFIX + AUDIT_GLYPH_ALIGNED/_PARTIAL/_OPPOSED/_DIVIDED + BUTTON_ARROW_RIGHT_PREFIX + BACK_ARROW_PREFIX_GLYPH/_SUFFIX_GLYPH + BUTTON_ARROW_RIGHT_SUFFIX + BUTTON_ICON_SHARE + BUTTON_ICON_MAIL + CARD_IA_CHIP_GLYPH + SWIPE_LEGEND_ARROW_CONTRE/_SKIP/_POUR + DISCLOSURE_GLYPH_OPEN/_CLOSED + AuditTrail row-icon derivation from AUDIT_GLYPH_*.trimEnd() + MODAL_CLOSE_GLYPH + EXTERNAL_LINK_GLYPH + METHODESHEET_BLOCK_EMOJI_AN/_CLAUDE) / brand-colors (incluant noscript bg sync) / Card / ChipTop1 / Cover (incluant LEGISLATURE_LABEL + TAGLINE h1 round-trip + START/RESUME/VIEW_RESULT CTA + RESTART_LABEL + VIEW_PARTIAL_RESULT_LABEL) / Legal (incluant AN_OPEN_DATA_URL) / Methode (incluant prose const round-trip + MAX_POINTS_CLES_BULLETS + READING_PAGE_MAX_WIDTH + READING_PAGE_SECTION_PADDING) / MethodeSheet / ReadingPageHeader (Methode + Legal shared header) / Result (incluant LEGISLATURE_LABEL + SHARE/REFAIRE/CONTINUE labels) / site-metadata (incluant TAGLINE + BRAND_NAME + LEGISLATURE + PROD_ORIGIN + PROD_HOSTNAME + icons + APP_LOCALE sync) / ErrorBoundary / FreshnessBanner (incluant FRESHNESS_OK/STALE_TITLE + FRESHNESS_TODAY/IMMINENT_PHRASE + freshnessPastPhrase/NextPhrase helpers) / RetryError (incluant RETRY_FETCH_FAILED_MESSAGE) / Skeleton (incluant SKELETON_CARD/RESULT_LOADING_LABEL + CARD_FACE_BOX_SHADOW round-trip) / compute-positions (incluant boundary via THRESHOLD) / sanity / deck-invariants / parse-summary (incluant MAX_POINTS_CLES_BULLETS + FALLBACK_*) / parse-top (incluant MAX_SHARE_CARD_BARS) / contact (incluant ERROR_REPORT_SUBJECT + PROD_HOSTNAME derivation) / nav-state / routes (incluant isAffinementMode) / scrutins / share (incluant performShare fallback chain + AbortError consent + SHARE_SOURCE_LINE + SHARE_LEAD_PREFIX + CLIPBOARD_PROMPT_LABEL + partialResultMarker) / text-cleanup / vote-feedback / an-cache / an-filter / an-groups / an-parse / an-personnalites / env (incluant ANTHROPIC_BATCHES_URL + ANTHROPIC_API_VERSION + ANTHROPIC_MODEL + ingest tuning consts + WEB_SEARCH_TOOL_VERSION + SUPABASE_UPDATE_BATCH_SIZE) / useModalA11y / useFreshnessOnce / useFlipCardA11y / AuditTrail / DeckStack / PartyRow / PersonnaliteRow / RankingOverlay / TopBar (incluant MENU_*_LABEL consts) / Wordmark, doivent rester verts à chaque commit).

### Commandes utiles

```bash
npm run dev                       # dev local, port 5173
npm run build                     # build de prod
npm run test:run                  # tests Vitest
npm run seed                      # seed Supabase locale avec supabase/seed/dev-fixtures.json (20 scrutins V1)
npm run ingest:an                 # ingestion AN (Haiku 4.5 + Batches API, ~$0.20-0.30, 2-10min)
npm run ingest:resume             # récupération d'un batch failed (env BATCH_ID requis)
npm run ingest:personnalites      # injection votes personnalités (V2 P2, parse cache local)
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
