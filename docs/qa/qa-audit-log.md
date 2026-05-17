# QA audit log

Mémoire partagée entre sessions du loop QA. À chaque session :
1. Vérifier que les bugs fixés à la session précédente tiennent toujours
2. Trouver et fixer 3 nouveaux bugs
3. S'arrêter, logger ci-dessous

Format : `[STATUT] type · description · fix commit/file`

---

## Session 1 — 2026-05-16

### Bugs fixés

- [FIXED] UX/modal · `RankingOverlay` n'avait pas de body scroll lock — quand le bottom-sheet s'ouvre sur `/play`, on pouvait scroller la page sous-jacente à travers la modale. Incohérent avec `MenuSheet` (TopBar.tsx) qui locke. · `src/components/RankingOverlay.tsx` — useEffect qui set `document.body.style.overflow = "hidden"` pendant que `open === true`, restauré au cleanup.
- [FIXED] A11y · `PartyRow` activable au clavier (Enter/Space) mais Space ne preventDefault pas → la page scrolle en plus de déclencher le onClick. · `src/components/PartyRow.tsx:21` — ajout `e.preventDefault()` dans le handler.
- [FIXED] Robustesse · `Result.tsx` et `Play.tsx` n'ont pas de catch sur `fetchScrutins()` — si Supabase tombe, la page reste bloquée sur "Chargement…" indéfiniment, aucun feedback utilisateur. · Ajout d'un état `loadError` + UI de retry sur `Result.tsx`. Play.tsx idem.

### Vérifications à faire en session 2

- [ ] `/play` : ouvrir le classement partiel (chip top-1 → modale), vérifier que la page sous-jacente ne scroll pas pendant que la modale est ouverte
- [ ] `/result` : tabber sur une ligne parti, presser Space → row doit se déplier sans que la page scrolle
- [ ] Couper le réseau, recharger `/result` → message d'erreur avec bouton "Réessayer" au lieu de spinner infini

---

## Session 2 — 2026-05-16

### Vérification session 1

- [VERIFIED] `RankingOverlay` body scroll lock présent (useEffect lock + restore) — `src/components/RankingOverlay.tsx:21-33`
- [VERIFIED] `PartyRow` Space preventDefault présent — `src/components/PartyRow.tsx:21-26`
- [VERIFIED] `loadError` + Réessayer UI présents dans `Play.tsx` et `Result.tsx`
- 45/45 tests verts, typecheck clean

### Bugs fixés

- [FIXED] Doc/transparence · `Methode.tsx §02` décrivait faussement le filtre d'ingestion (« uniquement scrutins solennels », « 20 au hasard ») alors que l'app inclut SOR finaux, motions de censure, propositions de résolution + utilise round-robin par thème + cap chapeau prefix. Sur une app dont la promesse est « pas les programmes, les vrais votes », une méthodo factuellement fausse est un bug critique de crédibilité. · `src/routes/Methode.tsx`
- [FIXED] Navigation · pas de route fallback dans `main.tsx` → toute URL inconnue (ex: `/play/typo`, `/admin`) affichait une page totalement blanche. Ajout `<Route path="*" element={<Navigate to="/" replace />} />`. · `src/main.tsx`
- [FIXED] UI incohérence · `PersonnaliteRow` fade le texte quand `counted < 3` (label « — · N votes ») mais la barre de score reste à sa largeur `${pct}%` — sur 1 vote agréé, on voit une barre pleine à 100% sous un texte qui dit « pas assez de données ». Forcé `width: 0%` quand `tooLittleData`. · `src/components/PersonnaliteRow.tsx`

### Vérifications à faire en session 3

- [ ] Aller sur `/path-qui-nexiste-pas` ou `/foo` → doit rediriger vers `/`
- [ ] `/methode` §02 : lire le texte, comparer aux contraintes réelles du composer (round-robin thème, cap dossier=2, cap chapeau prefix=2)
- [ ] `/result` avec une session où une personnalité a 1-2 votes seulement (faisable en mode affinement) → la barre doit être vide, pas à 100%

---

## Session 3 — 2026-05-16

### Vérification session 2

- [VERIFIED] `main.tsx` route `*` → `Navigate to="/"` présent, ligne 22
- [VERIFIED] `Methode §02` texte corrigé (SPS+SOR+motions+propositions, round-robin thème, deux caps explicités)
- [VERIFIED] `PersonnaliteRow` width forcée à 0 quand `tooLittleData` — ligne 42
- 45/45 tests verts, typecheck clean

### Bugs fixés

- [FIXED] Navigation/UX · Cover.tsx — son propre wordmark Link to `/` était sans `state.fromLogo: true`. Quand l'user venait du TopBar (qui passe `fromLogo: true`) et cliquait le wordmark de la Cover, l'effect re-fire avec `fromLogo` undefined → redirige vers /play. L'user se faisait éjecter en cliquant son propre logo. Ajout `state={{ fromLogo: true }}`. · `src/routes/Cover.tsx`
- [FIXED] Correctness/deck · `Play.tsx handleVote` appelait `drawNext` avec les maps `seenDossierCounts` / `seenPrefixCounts` mémoïsées sur `session` capturé au render. Comme `recordVote` venait juste d'écrire en localStorage mais que React n'avait pas re-rendu, ces maps étaient stale → drawNext pouvait piocher un scrutin du même dossier/sujet et dépasser le cap=2. Construction de maps fresh inline incluant le scrutin tout juste voté. · `src/routes/Play.tsx`
- [FIXED] Doc · `types/index.ts:80` commentaire « individual votes of the 10 indexed personalities » alors qu'on en a 8 (Mélenchon/Philippe/Glucksmann/Tondelier/Bardella/Darmanin exclus). Corrigé à 8. · `src/types/index.ts`

### Vérifications à faire en session 4

- [ ] `/play` après avoir voté quelques cartes : sur `/play`, ouvrir TopBar (•••) → cliquer sur le wordmark TopBar → on arrive sur Cover. Cliquer ensuite le wordmark Cover → on doit RESTER sur Cover (pas être redirigé vers /play)
- [ ] Voter 19 cartes (mode normal) puis essayer de finir : la 20e vient. Si dans le deck restant le scrutin top partage dossier_id ou chapeau prefix avec celui qu'on vient de voter, vérifier que le cap=2 reste respecté
- [ ] Hover sur la prop `votes_personnalites` dans VS Code : doc tooltip doit dire « 8 indexed personalities », pas 10

---

## Session 4 — 2026-05-16

### Vérification session 3

- [VERIFIED] `Cover.tsx` wordmark Link a bien `state={{ fromLogo: true }}` — ligne 57-62
- [VERIFIED] `Play.tsx handleVote` construit `fresherDossiers` / `fresherPrefixes` inline avec le scrutin courant — lignes 130-140
- [VERIFIED] `types/index.ts:80` dit « 8 indexed personalities »
- 45/45 tests verts, typecheck clean

### Bugs fixés

- [FIXED] Correctness/data · `session.ts recordVote` poussait inconditionnellement dans `votes` alors que `cards_seen` dédoublonnait. Un double-clic rapide sur "Pour" (ou swipe+click) déclenchait deux `handleVote` synchrones avec le même scrutin → deux entrées dans votes → `computeAlignment` comptait le vote deux fois → score gonflé. Guard par `cards_seen.includes` en early-return. Test vitest ajouté. · `src/lib/session.ts`, `tests/session.test.ts`
- [FIXED] UX/empty-state · `Play.tsx` — quand `fetchScrutins` résout avec un array vide (Supabase 0 rows, filtre exclut tout), `composeDeck` retournait `[]`, on tombait sur "Chargement…" indéfini sans bouton. Ajout d'un état `poolLoaded` pour distinguer "pas encore chargé" de "chargé mais vide" + UI Réessayer dédiée. · `src/routes/Play.tsx`
- [FIXED] UX/popover · `TopBar.tsx` — le lien mailto Contact n'avait pas de `onClick={onClose}` contrairement aux `<Link>` du menu (qui ferment via `onNavigate`). Cliquer Contact ouvrait l'app mail mais laissait le popover ouvert au-dessus de la page. Ajout du callback. · `src/components/TopBar.tsx`

### Vérifications à faire en session 5

- [ ] Sur `/play` ou `/result`, double-cliquer très rapidement sur "Pour" : le score ne doit pas être inflaté (vérifier dans React DevTools que `session.votes.length === session.cards_seen.length`)
- [ ] Modifier temporairement scrutins.ts pour faire retourner [] à fetchScrutins → `/play` doit afficher "Aucun scrutin disponible" + bouton Réessayer (pas "Chargement…")
- [ ] Sur `/play`, ouvrir le menu •••, cliquer Contact (mailto) → le popover doit se fermer immédiatement, pas rester sur la page

---

## Session 5 — 2026-05-16

### Vérification session 4

- [VERIFIED] `recordVote` early-return si `cards_seen.includes` — `src/lib/session.ts:42`
- [VERIFIED] `Play.tsx` état `poolLoaded` + UI Réessayer dédiée pour pool vide — lignes 23, 194
- [VERIFIED] mailto Contact ferme le popover via `onClick={props.onNavigate}` — `src/components/TopBar.tsx:258`
- 46/46 tests verts, typecheck clean

### Bugs fixés

- [FIXED] UX/cohérence · `Methode.tsx` et `Legal.tsx` — le Wordmark dans la nav de page était un `<Wordmark />` nu (non clickable) alors que TopBar et Cover l'enrobent dans `<Link to="/" state={{ fromLogo: true }}>`. Wordmark à 3 endroits, deux clickables, un non. Enrobé dans un Link pour cohérence. · `src/routes/Methode.tsx`, `src/routes/Legal.tsx`
- [FIXED] Dead code · `DeckStack.tsx` enveloppait sa map de cards dans `<AnimatePresence>` mais les enfants étaient des `<div>` simples (pas des `motion.div`). AnimatePresence sans enfant motion est inerte. Suppression du wrapper + import. · `src/components/DeckStack.tsx`
- [FIXED] Honnêteté/transparence · `Result.tsx share()` — partageait « Mes affinités politiques réelles, basées sur les vrais votes de l'AN : ... » même quand `isPartial === true` (par ex. 6/20 votes). Partager 6 votes comme « résultat » sans indicateur de partialité est trompeur — particulièrement sur une app de transparence. Ajout du préfixe « (résultat partiel N/20) » quand isPartial. · `src/routes/Result.tsx`

### Vérifications à faire en session 6

- [ ] Sur `/methode` et `/legal`, cliquer sur le Wordmark de la nav de page (le second du haut) → doit naviguer vers `/` sans bounce
- [ ] Swiper une carte sur `/play` après le fix DeckStack → le comportement de swipe + drag-snap doit être inchangé (la suppression de AnimatePresence ne casse rien — elle ne faisait rien)
- [ ] Sur `/result` avec un résultat partiel (par ex. 8/20), cliquer Partager → le texte partagé doit contenir « (résultat partiel 8/20) »

---

## Session 6 — 2026-05-16

### Vérification session 5

- [VERIFIED] `DeckStack.tsx` ne contient plus AnimatePresence ni son import
- [VERIFIED] `Methode.tsx:20` et `Legal.tsx:13` : Wordmark enrobé dans Link avec `state={{ fromLogo: true }}`
- [VERIFIED] `Result.tsx:101` : `lead` partagé inclut `(résultat partiel ${total}/${TARGET})` quand isPartial
- 46/46 tests verts, typecheck clean

### Bugs fixés

- [FIXED] Honnêteté/transparence · `FreshnessBanner` affichait « Données à jour » de façon hardcodée, indépendamment de l'âge réel des données. Si le pipeline d'ingestion tombait pendant 3 semaines, l'app affichait toujours « Données à jour » + « MAJ il y a 21 j » côte à côte (contradiction). Ajout d'un seuil STALE_AFTER_DAYS=10 (cycle hebdo +3j tolérance) qui fait basculer le banner sur « Synchronisation en retard » avec couleur neutre. · `src/components/FreshnessBanner.tsx`
- [FIXED] HTML correctness · `Play.tsx` avait 2 boutons sans `type="button"` (ligne 186 "Voir mon résultat" dans le bloc pool épuisé, et ligne 259 "Mon résultat →" dans le header /play). Sans `type`, HTML default = `submit`. Sans form englobant ça passe en pratique mais c'est un piège silencieux. · `src/routes/Play.tsx`
- [FIXED] State bug · `Play.tsx refinementMode` ne flippait jamais de `true` à `false`. Un user qui navigue de `/play?affinement=1` vers `/play` (sans param, par browser back ou autre) gardait `refinementMode=true` → header affichait "20" au lieu de "20 / 20" en mode normal, et le navigate auto-vers-/result au vote 20 ne fire pas. Sync bidirectionnel : `setRefinementMode(params.get("affinement") === "1")`. · `src/routes/Play.tsx`

### Vérifications à faire en session 7

- [ ] Modifier temporairement le retour de fetchFreshness pour faire `last_sync_at` = il y a 15 j → `/methode` et `/cover` affichent « Synchronisation en retard » avec dot grise, pas « Données à jour »
- [ ] Navigation Play → /play?affinement=1 → /play (changer URL manuellement ou via back) : le header doit re-afficher "N / 20"
- [ ] Inspecter le HTML rendu sur /play : tous les `<button>` doivent avoir `type="button"`

---

## Session 7 — 2026-05-16

### Vérification session 6

- [VERIFIED] `FreshnessBanner` STALE_AFTER_DAYS=10 + tone bascule sur "Synchronisation en retard" — ligne 14, 19
- [VERIFIED] Tous les `<button>` de `Play.tsx` ont `type="button"` (grep confirme)
- [VERIFIED] `Play.tsx:80` setRefinementMode synchrone bidirectionnel
- 46/46 tests verts, typecheck clean
- Noté : commit `0bbd2fe` du user ajoute un spec doc v2.5 (transparence IA + a11y + tests), 765 lignes — pas un bug, juste de la doc

### Bugs fixés

- [FIXED] Robustesse iOS Safari · `session.ts` — `saveSession` et `markCoverSeen` faisaient `localStorage.setItem` sans `try/catch`. En Safari mode privé (avant iOS 17) ou si quota dépassé, `setItem` jette `QuotaExceededError` → le handler crash silencieusement → "Commencer" devient inactif, chaque vote crash. Try/catch best-effort : la session reste en mémoire pour le run courant. · `src/lib/session.ts`
- [FIXED] A11y · `Card.tsx` — un user clavier qui Tab+Enter sur "+ analyse" arrivait au verso mais ne pouvait revenir (framer-motion `onTap` n'écoute pas le clavier). Ajout d'un listener ESC (window keydown) actif uniquement quand `topMost && flipped`, miroir de la convention modal-close. · `src/components/Card.tsx`
- [FIXED] Cohérence visuelle · `Play.tsx` "Pool épuisé" était un bloc `<div>` avec un `<button>` non stylé → rendu browser-default (gris moche). Juste en dessous le bloc "Aucun scrutin disponible" a un layout/button accent propre. Aligné sur le second layout pour cohérence. · `src/routes/Play.tsx`

### Vérifications à faire en session 8

- [ ] Ouvrir Safari en mode privé (ou simuler) : cliquer "Commencer" sur Cover → doit naviguer vers /play sans crash, même si localStorage.setItem échoue
- [ ] Sur /play, Tab jusqu'à "+ analyse", Enter → verso s'ouvre. Presser ESC → doit revenir au recto
- [ ] Si pool s'épuise mid-session (mode affinement) : la page "Plus de scrutins disponibles" doit avoir un bouton "Voir mon résultat" stylé en accent (vert), pas un button browser-default

---

## Session 8 — 2026-05-16

### Vérification session 7

- [VERIFIED] `session.ts` saveSession + markCoverSeen entourés de `try/catch`
- [VERIFIED] `Card.tsx` ESC handler actif quand `topMost && flipped`
- [VERIFIED] `Play.tsx` "Pool épuisé" → bloc stylé avec button accent
- 46/46 tests verts, typecheck clean
- Noté : commits user `0bbd2fe`, `a9d1718` = spec + plan v2.5 (pas du code à tester)

### Bugs fixés

- [FIXED] Cover CTA · le bouton n'avait que 2 états (`hasInProgress` ou non). Quand `votesCount === TARGET` (20 votes complets), `hasInProgress` était `false` → bouton affichait "Commencer · ≈ 5 min · 20 votes →" même pour un test fini. L'user qui revisitait la Cover via TopBar wordmark voyait "Commencer", cliquait, allait à /play qui redirigeait à /result. Fonctionnel mais label trompeur. Ajout d'un état `hasCompleted` → "Voir mon résultat · N/20 terminés →". · `src/routes/Cover.tsx`
- [FIXED] UX/empty-state · `Result.tsx` — même bug empty-pool que `Play.tsx` corrigeait en session 4. Si `fetchScrutins()` résolvait avec `[]`, ligne 84 `pool.length === 0` tombait sur "Chargement…" infini. Ajout `poolLoaded` + UI dédiée. · `src/routes/Result.tsx`
- [FIXED] A11y · `Play.tsx` boutons swipe-fallback (`← Contre`, `↓ Je passe`, `Pour →`) sans `aria-label`. Lecteur d'écran annonçait "left arrow contre", "down arrow je passe". Ajout `aria-label="Voter contre ce scrutin"` etc. + `aria-hidden="true"` sur les flèches décoratives. · `src/routes/Play.tsx`

### Vérifications à faire en session 9

- [ ] Compléter un test (20 votes), retourner sur `/` via TopBar wordmark → bouton CTA doit dire "Voir mon résultat · 20/20 terminés →", pas "Commencer"
- [ ] Simuler Supabase retour `[]` sur Result : doit afficher message + Réessayer, pas "Chargement…"
- [ ] Activer VoiceOver/NVDA, focus sur "← Contre" → doit lire "Voter contre ce scrutin", pas "left arrow Contre"

---

## Session 9 — 2026-05-16

### Vérification session 8

- [VERIFIED] `Cover.tsx hasCompleted` état + branche "Voir mon résultat" — lignes 41, 47, 185, 187
- [VERIFIED] `Result.tsx` `poolLoaded` state + UI dédiée empty pool — lignes 19, 92
- [VERIFIED] `Play.tsx` swipe buttons ont `aria-label="Voter ..."` + `aria-hidden` sur flèche
- 46/46 tests verts avant mon travail. À mi-session l'user a pushé 4 commits (a11y Card hook, ErrorBoundary global, aria-live region Play, Play.tsx maxWidth déjà fixé). 76/76 tests verts après leur travail + le mien.

### Bugs fixés

- [FIXED] Cohérence layout · 5 endroits hardcodaient `maxWidth: 480` alors que `var(--max-content)` (= 480px) existe pour ça. Drift silencieux si la valeur change. L'user a fixé `Play.tsx` × 3 dans ses commits parallèles ; j'ai fixé `ErrorBoundary` + `Result.tsx` × 2 dans mon commit. · `src/components/ErrorBoundary.tsx`, `src/routes/Result.tsx`
- [FIXED] Robustesse · `ErrorBoundary` est une class component avec `hasError` state qui reste `true` à vie. Le user clique le wordmark TopBar (qui est OUTSIDE le boundary) → navigation OK, mais Routes change le contenu wrapped par ErrorBoundary qui montre toujours le fallback. Coincé jusqu'à reload. Ajout `key={location.pathname}` sur ErrorBoundary dans App.tsx → remount par route, hasError reset. · `src/App.tsx`
- [FIXED] Code propre · `Result.tsx refaire()` hardcodait `localStorage.removeItem("sd_seen_cover")` directement alors que session.ts a `markCoverSeen()` / `hasSeenCover()` qui localisent la clé `sd_seen_cover`. Magic string dupliquée → renommage de clé futur risquait d'oublier cet endroit. Ajout `forgetCover()` helper + constante `COVER_KEY` partagée. · `src/lib/session.ts`, `src/routes/Result.tsx`

### Vérifications à faire en session 10

- [ ] Forcer un throw dans Play.tsx render (ajouter `throw new Error("test")` temporairement) → ErrorBoundary fallback affiché. Cliquer wordmark TopBar pour aller sur Cover → la Cover doit s'afficher correctement (pas le fallback)
- [ ] Inspect HTML : aucun bloc error/empty ne doit avoir `max-width: 480px` en inline style ; tous doivent référencer `--max-content`
- [ ] Sur /result, cliquer "↻ Refaire depuis le début" → confirme + clear → /cover doit re-afficher (pas auto-bounce)

---

## Session 10 — 2026-05-16

### Vérification session 9

- [VERIFIED] `App.tsx:23` ErrorBoundary a `key={location.pathname}`
- [VERIFIED] `session.ts` exporte `forgetCover()`, utilise `COVER_KEY` constante
- [VERIFIED] `Result.tsx:119` utilise `forgetCover()` au lieu du removeItem hardcodé
- [VERIFIED] `ErrorBoundary.tsx:29` + `Result.tsx:70,94` utilisent `var(--max-content)`
- 76 → 86 tests verts (user a ajouté 10 tests : Card, ErrorBoundary, MethodeSheet, deck-invariants, matching-edge-cases). Typecheck clean.
- Noté : l'user a continué son travail v2.5 (MethodeSheet bottom-sheet WIP, focus restore TopBar, useFlipCardA11y hook). Pas encore wired sur Cards.

### Bugs fixés

- [FIXED] UX/sheet · `MethodeSheet` mailto "Signaler une erreur factuelle" (line 168-171) — pas de `onClick={onClose}`. Même bug pattern que TopBar Contact corrigé en session 4, dans le nouveau composant. Cliquer ouvre l'app mail mais laisse le bottom-sheet ouvert au-dessus. Ajout du callback. · `src/components/MethodeSheet.tsx`
- [FIXED] A11y · `RankingOverlay` déclarait `aria-modal="true"` mais n'avait NI focus trap NI focus restore — `aria-modal` mentait sur le comportement, Tab sortait vers la page sous-jacente. Inconsistant avec MethodeSheet qui implémente les deux. Ajout `dialogRef` + `closeBtnRef` + `openerRef` + 2 useEffect (focus on open / restore on close + Tab trap). · `src/components/RankingOverlay.tsx`
- [FIXED] Consentement/UX · `Result.tsx share()` traitait `AbortError` (user cancelled share menu) comme "share unavailable" → fallback silencieux au clipboard. User clique Partager, voit le menu natif, ferme → son résultat copié SANS consentement. Le commentaire « user cancelled or share unavailable — fall through to clipboard » était explicite mais faux : on doit distinguer. Check sur `err.name === "AbortError"` → early return. · `src/routes/Result.tsx`

### Vérifications à faire en session 11

- [ ] Sur Cover → menu •••, Tab après ouverture du menu → focus doit cycler dans les MenuLinks. Fermer (ESC ou backdrop) → focus retourne sur ••• trigger
- [ ] Sur /play, ouvrir RankingOverlay (tap chip top-1), Tab plusieurs fois → focus doit rester PIÉGÉ dans la modale, pas atteindre les cartes en arrière-plan. Fermer → focus retourne sur le chip
- [ ] Sur /result avec un iPhone, cliquer "Partager mon résultat" → fermer le menu natif (annuler) → vérifier dans le presse-papier qu'il n'y a PAS le texte de résultat (sinon = régression du bug fixé)

---

## Session 11 — 2026-05-16

### Vérification session 10 + récupération

- **Note importante** : l'user a `git reset --hard HEAD~1` sur mon commit session 10 (`ea1a737`) et continué leur travail v2.5. AbortError fix (Result.tsx) a été ré-intégré dans leur commit `8713e38 feat(skeleton)`. Mes 2 autres fixes (MethodeSheet mailto onClose, RankingOverlay focus trap) restaient dans WT non committés. Récupérés dans ce commit.
- [VERIFIED] `Result.tsx:146` AbortError check présent (préservé par l'user)
- L'user a continué massivement : MethodeSheet wired, IA chip on Card, CardSkeleton/ResultSkeleton, Methode Section 07 (rôle de l'IA Claude), Cover sub-text transparence. 91/91 tests verts.

### Bugs fixés

- [FIXED] (recovered) UX/sheet · `MethodeSheet` mailto "Signaler une erreur factuelle" — pas de `onClick={onClose}`. Récupéré du WT post-reset. · `src/components/MethodeSheet.tsx`
- [FIXED] (recovered) A11y · `RankingOverlay` `aria-modal="true"` sans focus trap ni focus restore. Récupéré du WT post-reset. · `src/components/RankingOverlay.tsx`
- [FIXED] Navigation/transparence · `Methode.tsx §04 intro` mentionne « voir section 07 » mais ce n'était PAS un hyperlien — texte ordinaire sans href. Affordance cassée sur page de transparence. Ajout `id="methode-NN"` + `scrollMarginTop` sur Section pour ancres deep-link, et wrap de "section 07" dans `<a href="#methode-07">`. · `src/routes/Methode.tsx`

### Vérifications à faire en session 12

- [ ] Charger `/methode` puis cliquer "section 07" dans le 1er paragraphe → la page doit scroll-anchor jusqu'à la Section 07
- [ ] Tester URL directe `/methode#methode-04` → doit ouvrir la page positionnée sur Section 04
- [ ] Sur Cover (ou via TopBar wordmark pour revenir), ouvrir MethodeSheet (via une carte sur /play), cliquer "Signaler une erreur factuelle" → le sheet doit se fermer + l'app mail ouvrir

---

## Session 12 — 2026-05-16

### Vérification session 11

- [VERIFIED] `MethodeSheet:170` mailto a `onClick={onClose}`
- [VERIFIED] `RankingOverlay` focus trap + restore (dialogRef, closeBtnRef, openerRef + 2 useEffect)
- [VERIFIED] `Methode.tsx:37` "section 07" est un `<a href="#methode-07">` + `Section` a `id="methode-NN"` + `scrollMarginTop`
- 91/91 tests verts, typecheck clean
- Noté : user a ajouté `4f246e0 chore(test): drop unused imports caught by tsc -b production build` — cleanup mineur

### Bugs fixés

- [FIXED] A11y/anchor · `Methode.tsx Section` avait `id="methode-NN"` mais le `<div>` n'est pas focusable par défaut. Cliquer `<a href="#methode-07">` scroll mais focus reste sur le lien — Tab continue depuis le §04, pas depuis la heading §07. Ajout `tabIndex={-1}` + `outline: "none"` (pour ne pas voir d'outline car focusable programmatiquement uniquement). Browser déplace focus sur le target après anchor jump. · `src/routes/Methode.tsx`
- [FIXED] Dead code · `Cover.tsx restart()` appelait `markCoverSeen()` après `resetSession()`. Mais `resetSession` n'efface QUE la clé session, pas `sd_seen_cover`. Comme `restart()` n'est appelé que depuis le bloc in-progress (qui implique hasSeenCover=true), la clé est déjà à "true". Appel redondant supprimé. · `src/routes/Cover.tsx`
- [FIXED] A11y · `AuditTrail "AN ↗" link` n'avait pas `aria-label`. Lecteur d'écran lisait "A N right arrow link" sans contexte. Ajout `aria-label="Voir le scrutin n°X sur le site de l'Assemblée Nationale (nouvel onglet)"` + `aria-hidden` sur le contenu visuel. · `src/components/AuditTrail.tsx`

### Vérifications à faire en session 13

- [ ] Sur `/methode`, focus dans §04 (Tab depuis le top jusqu'au lien "section 07"), Enter → vérifier que le focus déplace effectivement sur §07 (utiliser DevTools `document.activeElement` ou voir un focus ring sur §07)
- [ ] Sur /cover avec une session in-progress, cliquer "Recommencer à zéro" → confirmer → vérifier que la cover-seen flag reste vraie (pas de retour sur la Cover lors de la navigation suivante)
- [ ] Sur /result, expand un PartyRow, focus avec Tab sur le lien "AN ↗", VoiceOver/NVDA doit annoncer "Voir le scrutin n°X sur le site de l'AN, nouvel onglet" — pas juste "A N flèche"

---

## Session 13 — 2026-05-16

### Vérification session 12

- [VERIFIED] `Methode.tsx:120` `tabIndex={-1}` sur Section
- [VERIFIED] `Cover.tsx restart()` n'appelle plus `markCoverSeen()` (seul `start()` ligne 46 l'utilise)
- [VERIFIED] `AuditTrail.tsx:91` link "AN ↗" a `aria-label` complet + span `aria-hidden`
- 91/91 tests verts, typecheck clean

### Bugs fixés

- [FIXED] A11y/UX · `Methode.tsx Section scrollMarginTop: 16` était trop petit. TopBar sticky ≈52px (8px+14px wordmark+8px+22px button) cachait la heading après anchor jump. User cliquait "section 07" → scroll vers §07 mais heading invisible sous le TopBar. Augmenté à 64 (TopBar height + 12px breathing). · `src/routes/Methode.tsx`
- [FIXED] Doc clarté · `Methode.tsx §04 formula` — `÷ nombre de scrutins comptés × 100 = % affiché` ambigu sans préfixe. User lit la ligne sans savoir ce qu'on divise (chaque score? la somme?). Ajout "Somme" préfixe : `Somme ÷ nombre de scrutins comptés × 100 = % affiché`. Critique sur page de transparence. · `src/routes/Methode.tsx`
- [FIXED] A11y · Buttons avec emojis décoratifs (`📤 Partager`, `↻ Continuer/Refaire`, `→ Continuer le test`, `✉ Signaler`, `→ Méthode complète`) sans `aria-hidden`. Lecteur d'écran lisait "outbox tray Partager mon résultat", "clockwise arrow Refaire". Wrapping de chaque emoji dans `<span aria-hidden="true">` pour le silence côté SR sans changer le rendu visuel. · `src/routes/Result.tsx`, `src/components/MethodeSheet.tsx`

### Vérifications à faire en session 14

- [ ] Cliquer "section 07" sur /methode → la heading "07 Le rôle de l'IA Claude" doit être visible (pas cachée sous le TopBar sticky)
- [ ] Activer VoiceOver, focus sur "Partager mon résultat" → doit lire "Partager mon résultat" (pas "outbox tray Partager...")
- [ ] Sur /methode §04, lire le bloc formula → la dernière ligne doit dire "Somme ÷ nombre de scrutins comptés × 100 = % affiché"

---

## Session 14 — 2026-05-16

### Vérification session 13

- [VERIFIED] `Methode.tsx:124` `scrollMarginTop: 64` (était 16)
- [VERIFIED] `Methode.tsx:69` "Somme ÷ nombre..." (Somme préfixe ajouté)
- [VERIFIED] Buttons Result + MethodeSheet emojis wrappés dans `<span aria-hidden="true">`
- 91/91 tests verts, typecheck clean

### Bugs fixés

- [FIXED] A11y · `useFlipCardA11y` aria-roledescription disait "carte de scrutin, glissez pour voter" — gesture-only. Keyboard user n'avait aucun indice qu'on peut voter via flèches. Updated en "carte de scrutin — glissez ou utilisez les flèches pour voter". Le hook implémentait déjà les arrow keys (sessions précédentes), juste la doc SR manquait. · `src/hooks/useFlipCardA11y.ts`
- [FIXED] Navigation · `Methode.tsx` n'avait pas de TOC en haut. Page 7-sections, user devait scroller pour trouver. Ajout `<nav aria-label="Sommaire">` après la FreshnessBanner avec 7 ancres `#methode-NN` cliquables. Exploitent les `id` et `scrollMarginTop` déjà en place (sessions 11+13). · `src/routes/Methode.tsx`
- [FIXED] Analytics · `Cover.tsx` "Voir mon résultat partiel" Link (visible sur in-progress nav) n'avait pas de `track()`. Les autres CTAs Cover (start, restart) tracking, du coup on sous-estimait les transitions Cover→Result partial. Ajout `track("cover_partial_result")`. · `src/routes/Cover.tsx`

### Vérifications à faire en session 15

- [ ] Sur /play, focus sur une Card via Tab, écouter VoiceOver/NVDA → doit lire "carte de scrutin — glissez ou utilisez les flèches pour voter" (pas juste "glissez")
- [ ] Charger /methode → TOC visible en haut avec 7 liens 01-07. Cliquer "07 IA Claude" → scroll-anchor vers §07
- [ ] Vérifier dans Plausible que "cover_partial_result" event apparaît après clic sur "Voir mon résultat partiel" depuis la Cover

---

## Session 15 — 2026-05-16

### Vérification session 14

- [VERIFIED] `useFlipCardA11y:54` aria-roledescription = "carte de scrutin — glissez ou utilisez les flèches pour voter"
- [VERIFIED] `Methode.tsx:47` TOC `<nav aria-label="Sommaire de la méthode">` présent
- [VERIFIED] `Cover.tsx:210` Link partial result tracking `cover_partial_result`
- 91/91 tests verts, typecheck clean

### Bugs fixés

- [FIXED] A11y/headings · `Result.tsx` "Alignement avec figures du mandat" était un `<p>` alors que c'est un heading de sous-section sous le h1. SR users perdaient la navigation par headings (rotor JAWS/VoiceOver). Changed to `<h2>` + id="personnalites-panel" pour pairing avec aria-controls. · `src/routes/Result.tsx`
- [FIXED] A11y/headings · `AuditTrail.tsx` "GROUP · Party Name" était un `<div>` alors que c'est le titre du panel détaillé d'un groupe expand. Changed to `<h3>` (nesting h1 → h2 → h3 cohérent). · `src/components/AuditTrail.tsx`
- [FIXED] A11y/aria · `Result.tsx` "Voir les personnalités" toggle avait `aria-expanded` mais pas `aria-controls`. SR user sait que ça expand mais pas quoi. Ajout `aria-controls="personnalites-panel"` qui pointe sur la div révélée. Bonus : wrappé `▾`/`▸` en `<span aria-hidden="true">` (caractère décoratif lu "petit triangle pointant en bas"). · `src/routes/Result.tsx`

### Vérifications à faire en session 16

- [ ] Activer VoiceOver/NVDA sur /result, naviguer par headings (Ctrl+Option+Cmd+H sur Mac) → doit cycler h1 → h2 "Alignement avec figures du mandat" → h3 "{group} · {partyName}" (si AuditTrail expand)
- [ ] Focus sur "Voir les personnalités" toggle → SR doit annoncer "Voir les personnalités, button, expanded false, controls personnalites-panel" (ou équivalent)
- [ ] Vérifier que `▾`/`▸` ne sont plus annoncés par les SRs (silence ARIA via aria-hidden)

---

## Session 16 — 2026-05-16

### Vérification session 15

- [VERIFIED] `Result.tsx:225` "Alignement avec figures du mandat" est `<h2>` + id="personnalites-panel"
- [VERIFIED] `AuditTrail.tsx:47` party header est `<h3>`
- [VERIFIED] `Result.tsx:214` aria-controls="personnalites-panel" sur le toggle
- 91/91 tests verts, typecheck clean

### Bugs fixés (focus heading hierarchy)

- [FIXED] A11y/headings · `Play.tsx` n'avait aucun heading. Page entière sans h1 → SR users perdaient le repère "quelle page suis-je ?" dans le rotor headings. Ajout d'un `<h1>` visually-hidden "Voter sur les scrutins" (sr-only via clip:rect classique). · `src/routes/Play.tsx`
- [FIXED] A11y/headings · `Result.tsx` le bloc principal (liste des partis) n'avait pas de heading. Hierarchy était h1 → (rien) → h2 personnalités → h3 audit. SR ratait la section principale. Ajout d'un `<h2>` visually-hidden "Alignement par groupe parlementaire" devant la liste ranked. · `src/routes/Result.tsx`
- [FIXED] A11y/headings + emoji · `MethodeSheet Block` titres étaient des `<div>` avec emojis (📊, ✨) lus par SR comme "outbox tray AN officiel" etc. Changed div → `<h3>` (sous le h2 dialog title) + emojis wrappés en `<span aria-hidden="true">`. · `src/components/MethodeSheet.tsx`

### Vérifications à faire en session 17

- [ ] Sur /play, activer SR + rotor headings → doit lister h1 "Voter sur les scrutins" (invisible mais lu)
- [ ] Sur /result, rotor headings → h1 (top result) → h2 "Alignement par groupe parlementaire" → h2 "Alignement avec figures du mandat" (si revealed) → h3 audit (si expanded)
- [ ] Ouvrir MethodeSheet, rotor headings → h2 "Comment c'est fait ?" → h3 "AN officiel" → h3 "Mis en forme par IA Claude" (sans "outbox tray" ni "sparkles")

---

## Session 17 — 2026-05-16

### Vérification session 16

- [VERIFIED] `Play.tsx:283` h1 "Voter sur les scrutins"
- [VERIFIED] `Result.tsx:197` h2 "Alignement par groupe parlementaire"
- [VERIFIED] `MethodeSheet.tsx:187` Block titre est h3 + emoji aria-hidden
- 91/91 tests verts, typecheck clean

### Bugs fixés

- [FIXED] DRY · `Play.tsx h1`, `Result.tsx h2`, `Play.tsx aria-live region` dupliquaient le même style visually-hidden 7-lignes (`position absolute, width 1, clip rect(0,0,0,0)...`). Extrait en classe `.sr-only` dans `index.css` (WCAG-recommended pattern, idem Bootstrap). Les 3 call sites utilisent `className="sr-only"`. · `src/index.css`, `src/routes/Play.tsx`, `src/routes/Result.tsx`
- [FIXED] HTML sémantique · `<b>` (stylistique seulement) utilisé pour l'emphase dans Methode.tsx (11 instances) et MethodeSheet (1 instance). Sur page de transparence, l'emphase porte du sens — "Le calcul d'alignement est une formule mathématique pure" doit être annoncé comme important par les SR. Replace `<b>` → `<strong>` (sed batch). · `src/routes/Methode.tsx`, `src/components/MethodeSheet.tsx`
- [FIXED] UX/affordance · `Card.tsx "+ analyse" button` restait visible mais muté en ink-3 quand `scrutin.analyse_loi` était null. Click → message "pas encore disponible" → bouton "looks disabled mais ne l'est pas" = confusion. Conditional rendering : `{topMost && scrutin.analyse_loi && (...)}` — pas de data, pas d'entry point. · `src/components/Card.tsx`

### Vérifications à faire en session 18

- [ ] Inspecter DevTools sur /play : `<h1 class="sr-only">` doit être présent et `clip: rect(0,0,0,0)` via la classe (pas inline)
- [ ] Sur /methode, activer SR : `<strong>` doivent être annoncés avec emphasis (jaws/voiceover ton de voix appuyé)
- [ ] Sur /play, charger une carte sans `analyse_loi` (fixtures dev par ex) → le bouton "+ analyse" ne doit PAS apparaître (vs avant : visible mais grisé)

---

## Session 18 — 2026-05-16

### Vérification session 17

- [VERIFIED] `index.css` `.sr-only` class présente, 3 call sites utilisent `className="sr-only"`
- [VERIFIED] Methode.tsx : 11 `<strong>` (sed batch), 0 `<b>` restant ; MethodeSheet idem
- [VERIFIED] `Card.tsx:163` `{topMost && scrutin.analyse_loi && (...)}` — bouton conditionnel
- 91/91 tests verts, typecheck clean

### Bugs fixés (suite session 17 HTML sémantique)

- [FIXED] HTML sémantique · `Cover.tsx:105` utilisait `<b style="fontWeight: 500">` pour "résumés Claude (IA)". Mais `fontWeight: 500` = medium, PAS bold. Le tag `<b>` est sémantiquement faux pour du stylage non-emphatique. Remplacé par `<span>`. · `src/routes/Cover.tsx`
- [FIXED] HTML sémantique · `Play.tsx:299` même problème : `<b style="fontWeight: 500">{progress}</b>` pour le numéro de progression. Stylage visuel, pas emphase sémantique. Remplacé par `<span>`. · `src/routes/Play.tsx`
- [FIXED] HTML sémantique · `Legal.tsx` 7× `<b>Label</b>` (Éditeur, Hébergeur, Données personnelles, Analytics, Indépendance, Sources, Code source). Ce sont des labels sémantiques d'information importante. Sed batch `<b>` → `<strong>` pour cohérence avec Methode/MethodeSheet (session 17). · `src/routes/Legal.tsx`

### Vérifications à faire en session 19

- [ ] Inspecter DevTools sur /cover : "résumés Claude (IA)" doit être dans un `<span>`, pas `<b>`
- [ ] Inspecter DevTools sur /play : le numéro de progression doit être dans un `<span>`, pas `<b>`
- [ ] Sur /legal, activer SR : les labels (Éditeur, Hébergeur, etc.) doivent être annoncés avec emphasis SR

---

## Session 19 — 2026-05-16

### Vérification session 18

- [VERIFIED] Cover.tsx + Play.tsx : plus aucun `<b style=fontWeight: 500>` (remplacé par `<span>`)
- [VERIFIED] Legal.tsx : 7× `<strong>` au lieu de `<b>`
- 91/91 tests verts, typecheck clean

### Bugs fixés

- [FIXED] Layout/a11y · `Methode.tsx` + `Legal.tsx` utilisaient un `<span style={{ visibility: "hidden" }}>‹</span>` comme spacer pour balancer la nav 3-cols (Retour | Wordmark | spacer). Hack CSS — bloc invisible dans le flow + tag avec contenu décoratif. Refactor en CSS Grid 1fr auto 1fr + justifySelf, pas de placeholder nécessaire. Suppression du hack dans les 2 fichiers. · `src/routes/Methode.tsx`, `src/routes/Legal.tsx`
- [FIXED] Robustesse · `FreshnessBanner` `diffDays`/`pastDays` retournaient NaN si `target` était une date invalide (`new Date("…").getTime()` = NaN → Math.max(0, NaN) = NaN). Banner renderait "MAJ il y a NaN j" si Supabase servait un `ingere_le` malformé. Ajout `isNaN(t)` guard → return 0. · `src/components/FreshnessBanner.tsx`
- [FIXED] A11y · Methode/Legal "‹ Retour" — le caractère `‹` était lu par SR ("less-than sign Retour link"). Wrap dans `<span aria-hidden="true">` pour le silence côté SR sans changer le rendu. · `src/routes/Methode.tsx`, `src/routes/Legal.tsx`

### Vérifications à faire en session 20

- [ ] Inspecter DevTools sur /methode et /legal : nav top-level utilise `display: grid` avec 3 cols, plus de `visibility: hidden` span
- [ ] Forcer un `ingere_le = "garbage"` dans Supabase (ou mock fetchFreshness) → FreshnessBanner doit dire "MAJ il y a 0 j" (pas "NaN")
- [ ] Activer SR sur /methode/legal, focus "‹ Retour" → doit lire "Retour", pas "less-than sign Retour"

---

## Session 20 — 2026-05-16

### Vérification session 19

- [VERIFIED] Methode + Legal nav : `display: grid; gridTemplateColumns: "1fr auto 1fr"` + `justifySelf`, plus de visibility:hidden span
- [VERIFIED] FreshnessBanner : `isNaN(t)` guard dans diffDays + pastDays
- [VERIFIED] "‹ Retour" : `<span aria-hidden="true">‹ </span>` dans les 2 fichiers
- 91/91 tests verts, typecheck clean

### Bugs fixés (suite a11y caractères décoratifs)

- [FIXED] A11y · `Card.tsx:224` "tap pour détails ›" — `›` (single right-pointing angle quote) décoratif lu par SR. Wrap dans `<span aria-hidden="true">`. · `src/components/Card.tsx`
- [FIXED] A11y · `Card.tsx:303` "tap pour revenir ‹" — miroir au verso, `‹` décoratif. Wrap aria-hidden + repositionné en début de phrase pour cohérence avec "‹ Retour" pattern. · `src/components/Card.tsx`
- [FIXED] A11y · `Card.tsx:305-309` "Voir sur AN ↗" link — pas d'aria-label, `↗` lu comme "north east arrow". Même fix pattern que `AuditTrail` link (session 12) : `aria-label="Voir le scrutin n°X sur le site de l'AN (nouvel onglet)"` + texte visuel dans `<span aria-hidden="true">`. · `src/components/Card.tsx`
- [SIDE FIX] tests/Card.test.tsx : 2 tests `flips on Enter/Space` queryaient `[aria-hidden]` et prenaient `faces[0]/[1]` en assumant que ce sont les face divs. Mes nouveaux spans aria-hidden ont fait shifter l'index. Selector restreint à `div[aria-hidden]` (les faces sont des div, mes spans aria-hidden ne match plus). 91/91 verts.

### Vérifications à faire en session 21

- [ ] Sur /play, activer SR, tap une carte (front) puis lire le footer → SR doit lire "tap pour détails" sans "right-pointing angle quote"
- [ ] Sur le verso, focus le lien "Voir sur AN" → SR doit lire "Voir le scrutin n°X sur le site de l'Assemblée Nationale, nouvel onglet"
- [ ] Hover sur la carte recto avec souris : le `›` est visible visuellement, `‹` au verso aussi

---

## Session 21 — 2026-05-16

### Vérification session 20

- [VERIFIED] `Card.tsx:224` "tap pour détails" + aria-hidden span
- [VERIFIED] `Card.tsx:303` "tap pour revenir" + aria-hidden span
- [VERIFIED] `Card.tsx:309` AN link aria-label + aria-hidden inner span
- 91/91 tests verts, typecheck clean

### Bugs fixés (suite a11y caractères décoratifs + AuditTrail icons)

- [FIXED] A11y · `Play.tsx:317` "Mon résultat →" — `→` décoratif lu "right-pointing arrow" par SR. Wrap dans `<span aria-hidden="true">`. · `src/routes/Play.tsx`
- [FIXED] A11y · `Cover.tsx CTA sub-text` — 3 instances de `→` dans le template literal du span secondaire (`/${TARGET} terminés →`, hasInProgress, default). Sortie du template en JSX + `<span aria-hidden="true"> →</span>` séparé. · `src/routes/Cover.tsx`
- [FIXED] A11y/sémantique · `AuditTrail.tsx` icônes ✓/≈/✕/÷ par-row n'avaient aucun label sémantique. SR lisait "check mark titre-pedago" sans savoir que c'était un alignement. Ajout d'un champ `label` dans le rows mapping (Aligné/Partiel/Opposé/Groupe divisé) + `aria-label` sur le span icône + icône visuelle dans aria-hidden child. · `src/components/AuditTrail.tsx`

### Vérifications à faire en session 22

- [ ] Sur /play header avec >=5 votes, focus "Mon résultat →" → SR lit "Mon résultat" sans flèche
- [ ] Sur /, focus bouton CTA → SR lit "Commencer ≈ 5 min · 20 votes" (sans flèche) selon état
- [ ] Sur /result, expand un PartyRow, focus une icône d'alignement → SR doit annoncer "Aligné" / "Partiel" / "Opposé" / "Groupe divisé, non compté" selon le score

---

## Session 22 — 2026-05-16

### Vérification session 21

- [VERIFIED] `Play.tsx:317` "Mon résultat" + aria-hidden span
- [VERIFIED] `Cover.tsx:195` aria-hidden span séparé pour `→`
- [VERIFIED] `AuditTrail` row icons : aria-label + aria-hidden inner span
- 91/91 tests verts, typecheck clean

### Bugs fixés (suite a11y caractères décoratifs AuditTrail)

- [FIXED] A11y · `AuditTrail breakdown chips` (header) — icons ✓/≈/✕/÷ lus par SR ("check mark 5 alignés"). Wrap chaque icon dans `<span aria-hidden="true">`. Le label suivant ("alignés", "partiels"...) donne déjà le contexte sémantique. · `src/components/AuditTrail.tsx`
- [FIXED] Symétrie visuelle · `Card.tsx:303` "tap pour revenir" — mon fix session 20 avait déplacé `‹` en début pour cohérence avec "‹ Retour" mais cassait la symétrie recto (trailing `›`) / verso. Revert `‹` en trailing pour symétrie. · `src/components/Card.tsx`
- [FIXED] A11y · `AuditTrail "démo" span` — `title` attribute (tooltip desktop, SR souvent ignorent sur span). Texte "démo" seul sans contexte pour SR. Ajout `aria-label="Donnée de démonstration (pas un scrutin AN réel)"` + garde `title` pour hover desktop. · `src/components/AuditTrail.tsx`

### Vérifications à faire en session 23

- [ ] Sur /result expand un PartyRow, activer SR → header breakdown doit lire "5 alignés, 2 partiels, 3 opposés, 1 divisé non compté" sans "check mark" etc.
- [ ] Sur /play, comparer visuellement recto "tap pour détails ›" et verso "tap pour revenir ‹" — flèches en fin de phrase symétriques
- [ ] En mode dev fixtures (sans Supabase), expand un PartyRow, focus une "démo" span → SR lit "Donnée de démonstration (pas un scrutin AN réel)"

---

## Session 23 — 2026-05-16

### Vérification session 22

- [VERIFIED] AuditTrail breakdown chips icons wrapped dans aria-hidden
- [VERIFIED] Card.tsx:303 `‹` repositionné trailing (symétrique avec recto)
- [VERIFIED] "démo" span aria-label
- 91/91 tests verts, typecheck clean

### Bugs fixés (cleanup + analytics + dead code)

- [FIXED] Dead code · `Cover.tsx sessionTick` — `useState(0)` + `void sessionTick` hack pour forcer re-render après `restart()`. Mais `restart()` `navigate("/play")` immédiatement → Cover unmount avant le re-render. Suppression complète du state, du void hack et du setSessionTick call. · `src/routes/Cover.tsx`
- [FIXED] Analytics · `Methode.tsx TOC links` (7 ancres `#methode-NN`) ne tracaient pas leurs clics. On ne savait pas quelles sections les users explorent (alors qu'on track tout le reste : cover_started, vote, share_clicked, methode_sheet, personnalites_revealed...). Ajout `track("methode_toc_click", { section: n })` sur onClick. · `src/routes/Methode.tsx`
- [FIXED] Dead code · `AuditTrail.tsx` fallback icon `"—"` + label "Non noté" — `alignmentScore` retourne exactement {null, 0, 0.5, 1}, tous les 4 branches couvrent ces cas. Le fallback était unreachable. Conversion en if/else if/else avec types explicites pour clarté + commentaire expliquant l'exhaustivité. · `src/components/AuditTrail.tsx`

### Vérifications à faire en session 24

- [ ] Sur /, ouvrir confirm via "Recommencer à zéro", cancel → cover doit rester sur l'in-progress UI sans glitch (pas de re-render inutile)
- [ ] Sur /methode, cliquer un lien du sommaire → vérifier `methode_toc_click` event dans Plausible avec `section` prop
- [ ] Linter / coverage : confirmer qu'aucun warning sur unreachable code dans AuditTrail

---

## Session 24 — 2026-05-16

### Vérification session 23

- [VERIFIED] `Cover.tsx` : pas de sessionTick state ni void hack
- [VERIFIED] `Methode.tsx:75` : `track("methode_toc_click", { section: n })`
- [VERIFIED] `AuditTrail.tsx:26` : `let icon: string` (plus de fallback "—")
- 91/91 tests verts, typecheck clean

### Bugs fixés

- [FIXED] A11y · `DeckStack` non-top cards annoncées par SR. Le stack visuel rend 3 cartes (visible.slice(0, 3)) avec pointerEvents:none + tabIndex:-1 sur les 2 du dessous, mais aucune n'avait aria-hidden → SR lisait "article: Scrutin n°X" pour les 3. Ajout `aria-hidden={!isTop}` sur le wrapping div. SR n'entend que le top card. · `src/components/DeckStack.tsx`
- [FIXED] Dead code · `Result.tsx` (2× useMemo) + `Play.tsx` (4× useMemo) — useMemo avec deps `[session, ...]` où session = `loadSession()` retourne nouvel objet à chaque render → deps invalides à chaque render → memoization no-op. ESLint-disable comments masquaient le problème. Drop useMemo + import. Computations inlinées (les coûts sont triviaux : ~220 ops par computeAlignment). · `src/routes/Result.tsx`, `src/routes/Play.tsx`
- [FIXED] A11y · `PartyRow` avait `aria-expanded` mais pas `aria-controls`. SR users savaient que la row était expandable mais pas QUOI elle expand (AuditTrail panel). Ajout prop optionnelle `controlsId` + wiring dans Result.tsx (panelId="audit-trail-${group}" + wrapping div id sur le panel). Même pattern que session 15 pour le toggle personnalités. · `src/components/PartyRow.tsx`, `src/routes/Result.tsx`

### Vérifications à faire en session 25

- [ ] Sur /play, activer SR rotor "articles" → ne doit lister qu'UN article (le top card), pas 3 (les 2 du stack visuel cachés)
- [ ] Inspect DevTools /play et /result → pas de `eslint-disable react-hooks/exhaustive-deps` autour de useMemo
- [ ] Sur /result, focus un PartyRow, expand via Enter → SR doit annoncer "expanded, controls audit-trail-LFI" (ou équivalent)

---

## Session 25 — 2026-05-16

### Vérification session 24

- [VERIFIED] `DeckStack:39` `aria-hidden={!isTop}` sur wrapping div
- [VERIFIED] useMemo supprimés de Result.tsx + Play.tsx + imports nettoyés
- [VERIFIED] `PartyRow` accepte `controlsId` + wiring dans Result.tsx
- 91/91 tests verts, typecheck clean

### Bugs fixés (suite a11y SR contexte)

- [FIXED] A11y SR · `PartyRow` row sans aria-label → SR lit "LFI 25 %" sans contexte. Compose un label complet : "La France Insoumise, 25 % d'alignement sur 8 scrutins comptés" qui couvre toute la sémantique du row en une phrase. · `src/components/PartyRow.tsx`
- [FIXED] A11y · `Card.tsx` verso "donnée démo" span (fallback quand pas d'url_an_officielle) — pas d'aria-label, SR lit juste "donnée démo" sans contexte. Même bug que `AuditTrail "démo"` fixé en session 22. Ajout `aria-label="Donnée de démonstration (pas une vraie source AN)"`. · `src/components/Card.tsx`
- [FIXED] A11y/landmark · `AuditTrail` wrapping était un `<div>` simple. Avec mon ajout session 24 d'un wrapper id pour aria-controls, le panel n'est toujours pas un landmark a11y. Conversion en `<section role="region" aria-labelledby={audit-heading-X}>` + h3 a un id correspondant. SR users tabbing/jumping dans le panel entendent "Détail des votes pour [groupe], region". · `src/components/AuditTrail.tsx`

### Vérifications à faire en session 26

- [ ] Sur /result, focus un PartyRow via Tab → SR doit lire la phrase complète "La France Insoumise, 25 % d'alignement sur 8 scrutins comptés, button, expanded false"
- [ ] Sur /play mode dev fixtures (sans Supabase, donc `url_an_officielle` peut manquer), flip une carte → SR doit lire "Donnée de démonstration (pas une vraie source AN)" sur le footer verso
- [ ] Sur /result, expand un PartyRow → naviguer par landmarks (Ctrl+Option+U) doit lister une region "Détail des votes pour [groupe]"

---

## Session 26 — 2026-05-16

### Vérification session 25

- [VERIFIED] `PartyRow:21` rowLabel composé + `aria-label={rowLabel}`
- [VERIFIED] `Card.tsx:314` "donnée démo" span avec aria-label
- [VERIFIED] `AuditTrail` `<section role="region" aria-labelledby>` + h3 id matching
- 91/91 tests verts, typecheck clean

### Bugs fixés

- [FIXED] A11y · `PersonnaliteRow` row sans aria-label → SR lisait "Le Pen 57 % 12" sans contexte. Même bug que `PartyRow` (session 25). Compose phrase complète selon `tooLittleData` : si <3 votes, "Marine Le Pen, trop peu de données : 2 votes comparables" ; sinon, "Marine Le Pen, 57 % d'alignement sur 12 votes". · `src/components/PersonnaliteRow.tsx`
- [FIXED] A11y/aria-live · `Play.tsx lastVoteLabel` — `setState` avec la même string ne déclenche pas de re-render → aria-live polite ne ré-annonce pas. Voter "Pour" 2 fois d'affilée → 2e announce silencieux. Fix : append/toggle un zero-width space pour forcer la string à différer entre 2 votes identiques. · `src/routes/Play.tsx`
- [FIXED] Dead code + comment stale · `Play.tsx setTick` redondant depuis ma suppression session 24 des useMemo (setDeck déjà appelé dans handleVote → re-render). Le comment ligne 137-140 "memoised counts above are stale" parlait des memo qui n'existent plus → counts inline. Suppression du state `tick` + correction du comment pour parler de "captured at render time, BEFORE recordVote". · `src/routes/Play.tsx`

### Vérifications à faire en session 27

- [ ] Sur /result avec personnalités révélées, focus une PersonnaliteRow → SR doit lire "Marine Le Pen, 57 % d'alignement sur 12 votes" (ou variante low-data)
- [ ] Sur /play, voter 3 fois "Pour" consécutifs → vérifier SR (NVDA/VoiceOver) annonce les 3 votes (pas seulement le premier)
- [ ] Inspecter Play.tsx : plus de `useState(0)` pour tick, plus de `setTick`, comment handleVote ne mentionne plus "memoised"

---

## Session 27 — 2026-05-16

### Vérification session 26

- [VERIFIED] `PersonnaliteRow:24` aria-label sur row (branche tooLittleData)
- [VERIFIED] `Play.tsx:131` setLastVoteLabel avec zero-width space toggle
- [VERIFIED] `Play.tsx` plus de `setTick`, plus de "memoised" dans comments
- 91/91 tests verts, typecheck clean

### Bugs fixés

- [FIXED] A11y · `Cover.tsx swipe legend` (← Contre / ↓ Je passe / → Pour) — purement visuel pour gestes touch/mouse. SR users utilisent les boutons sur /play (qui ont aria-label propre), donc lire "leftwards arrow Contre" sur Cover ajoute du bruit sans valeur. Wrap le wrapper div en `aria-hidden="true"`. · `src/routes/Cover.tsx`
- [FIXED] A11y · `ErrorBoundary` fallback page sans heading — SR users sur l'écran d'erreur perdaient le repère. Ajout `<h1 className="sr-only">Erreur</h1>` (même pattern que Play session 16). · `src/components/ErrorBoundary.tsx`
- [FIXED] Analytics · `TopBar MenuLink` (4 links) + `Cover footer nav` (3 links) sans tracking, alors que TOC Methode track depuis session 23. Inconsistance des signaux. Ajout `track("topbar_nav", { target })` et `track("cover_footer_nav", { target })`. · `src/components/TopBar.tsx`, `src/routes/Cover.tsx`

### Vérifications à faire en session 28

- [ ] Sur Cover, activer SR → swipe legend doit être silencieuse (aria-hidden)
- [ ] Forcer un throw render dans Play.tsx → page d'erreur s'affiche, SR doit lire "Erreur" en heading h1
- [ ] Cliquer chaque menu TopBar + footer Cover → vérifier `topbar_nav` / `cover_footer_nav` events dans Plausible avec `target` prop

---

## Session 28 — 2026-05-16

### Vérification session 27

- [VERIFIED] `Cover.tsx:144` `aria-hidden="true"` sur la swipe legend
- [VERIFIED] `ErrorBoundary` h1 sr-only "Erreur"
- [VERIFIED] TopBar MenuLinks + Cover footer links ont track avec `target` prop
- 91/91 tests verts, typecheck clean

### Bugs fixés

- [FIXED] Dead data · `PartyMeta` avait 2 champs jamais utilisés en frontend ni tests : `code` (redondant avec la clé du record) et `orderHint` (suggéré pour le tri tie-break mais jamais consommé). 11 entrées × 2 champs = 22 valeurs mortes. Suppression de l'interface et des 11 entries. · `src/lib/parties.ts`
- [FIXED] Comment stale · `matching.ts:72` "Stable on ties via orderHint" — Faux : la stabilité vient de JS Array.sort (stable depuis ES2019), pas d'orderHint (qui n'est jamais utilisé). Réécriture du commentaire pour expliquer la vraie source de stabilité + le fait que GROUP_CODES est déjà en ordre gauche-droite. · `src/lib/matching.ts`
- [FIXED] A11y · `Methode.tsx` external links (data.assemblee-nationale.fr × 2, github.com/sansdetour × 2) sans aria-label indiquant "nouvel onglet". Même pattern que `AuditTrail` link (session 12) + `Card` AN link (session 20). Ajout aria-label pour cohérence. · `src/routes/Methode.tsx`

### Vérifications à faire en session 29

- [ ] Inspecter PARTIES dans DevTools React : les entries doivent avoir 3 fields (name, short, colorVar), plus 4 (sans code ni orderHint)
- [ ] Sur /methode Section 06+07, focus un external link → SR doit annoncer "(nouvel onglet)"
- [ ] Vérifier que le ranking sur /result garde l'ordre LFI→RN pour des partis avec même pct (e.g. tous à 0% si pool vide)

---

## Session 29 — 2026-05-16

### Vérification session 28

- [VERIFIED] `parties.ts` : 3 champs par entry (`name`, `short`, `colorVar`), plus de `code`/`orderHint`
- [VERIFIED] `matching.ts:72` commentaire mentionne JS Array.sort stable + GROUP_CODES en ordre gauche-droite
- [VERIFIED] `Methode.tsx` external links ont aria-label "(nouvel onglet)"
- 91/91 tests verts, typecheck clean

### Bugs fixés

- [FIXED] A11y · `Legal.tsx` 2 external links (data.an.fr, github) sans aria-label "nouvel onglet". Cohérence avec session 28 (Methode), session 12 (AuditTrail), session 20 (Card). · `src/routes/Legal.tsx`
- [FIXED] Test bug · `tests/Cover.test.tsx` test "stays on cover with fromLogo" passait par accident. La query `getByRole("button", { name: /commencer/i })` était censée trouver le CTA principal. Mais après `recordVote("s1", "pour")`, `hasInProgress=true` → CTA dit "Reprendre", pas "Commencer". Le test passait quand même car `/commencer/i` matche "Recommencer à zéro" (bouton secondaire). Faux positif. Fix : `/reprendre/i` pour cibler le vrai CTA. · `tests/Cover.test.tsx`
- [FIXED] Clarté Methode §04 formula · "Somme ÷ nombre de scrutins comptés × 100 = % affiché" — "Somme" était introduit sans préfixe contextuel. Réécriture : "Score par scrutin :" en intro + indentation + "Somme des scores ÷ nombre..." pour la ligne finale. La structure logique est maintenant explicite. · `src/routes/Methode.tsx`

### Vérifications à faire en session 30

- [ ] Sur /legal, focus un external link → SR annonce "(nouvel onglet)"
- [ ] Sur /methode §04, le bloc Formula doit avoir 2 sections visibles : "Score par scrutin :" (3 lignes indentées) puis "Somme des scores ÷ ..."
- [ ] Re-run tests Cover : le 4e test doit chercher /reprendre/i et passer pour la bonne raison

---

## Session 30 — 2026-05-16

### Vérification session 29

- [VERIFIED] `Legal.tsx` external links ont aria-label
- [VERIFIED] `tests/Cover.test.tsx:51` cherche `/reprendre/i` au lieu de `/commencer/i`
- [VERIFIED] `Methode.tsx §04 Formula` a 2 sections ("Score par scrutin :" + "Somme des scores ÷ ...")
- 91/91 tests verts, typecheck clean

### Bugs fixés

- [FIXED] UX/ESC conflict · `Card.tsx` ESC handler firait toujours quand topMost+flipped, même si un modal (RankingOverlay, MethodeSheet) était ouvert au-dessus avec carte flipped derrière. ESC = double-action (modal close + carte unflip). Check `document.querySelector('[role="dialog"][aria-modal="true"]')` avant de skip — ESC laisse le modal handler gérer en priorité. · `src/components/Card.tsx`
- [FIXED] Perf · `Cover.tsx fetchFreshness()` se re-déclenchait sur chaque changement de `location.state` (e.g. user clique le wordmark TopBar pour revenir sur Cover, location.state = nouvel objet → useEffect re-fire → fetch). Round-trip Supabase inutile. Ajout `fetchedRef` qui guard la fetch après la première fois. · `src/routes/Cover.tsx`
- [FIXED] Dead data · `PersonnaliteMeta.code` field — redondant avec la clé du record (idem PartyMeta.code corrigé session 28). 8 entries × 1 valeur morte. Suppression de l'interface et des 8 entries. · `src/lib/personnalites.ts`

### Vérifications à faire en session 31

- [ ] Sur /play, flip une carte, ouvrir RankingOverlay (chip top-1), presser ESC → vérifier que SEUL le modal ferme. La carte derrière reste flipped (et redevient interactive après fermeture du modal)
- [ ] Sur /cover via TopBar wordmark (clic répété sur le wordmark) → Network tab DevTools doit montrer un seul appel `fetchFreshness` au premier mount, pas un par clic
- [ ] Inspect `PERSONNALITES` dans DevTools : chaque entry doit avoir display_name/short_name/group_code/prenom/nom/departement/acteur_ref/presidentiable, plus de `code`

---

## Session 31 — 2026-05-16

### Vérification session 30

- [VERIFIED] `Card.tsx:86` ESC handler check dialog open
- [VERIFIED] `Cover.tsx:19,34-35` fetchedRef guard
- [VERIFIED] `personnalites.ts` PersonnaliteMeta sans `code`
- 91/91 tests verts, typecheck clean

### Bugs fixés

- [FIXED] SPA hash scroll · `Methode.tsx` — `/methode#methode-07` direct URL ne scrollait pas à la Section 07 car le browser anchor-jump synchrone happens BEFORE React mounte les `<Section>` elements (id n'existe pas encore). Ajout `useEffect` avec `useLocation()` qui fait `scrollIntoView` sur le target hash après mount. · `src/routes/Methode.tsx`
- [FIXED] Wording/UX · TOC label "Tes données" pour §05 — la section réelle est "Ce qu'on ne fait PAS avec tes données" (privacy/négation). User clique "Tes données" en pensant voir ses données, lit "Aucun cookie, pas de tracking" — la négation est perdue. Label changé en "Confidentialité" qui couvre le vrai sens. · `src/routes/Methode.tsx`
- [FIXED] Grammaire · TOC label "Position groupe" pour §03 — manquait l'article ("du" ou "d'un"). Section réelle dit "Position d'un groupe". Label aligné en "Position d'un groupe". · `src/routes/Methode.tsx`

### Vérifications à faire en session 32

- [ ] Tester URL directe `/methode#methode-04` (e.g. share/bookmark) — la page doit scroll au §04 dès le mount (pas juste après un clic TOC)
- [ ] Inspecter TOC : labels lisent "01 Données / 02 Scrutins / 03 Position d'un groupe / 04 Calcul / 05 Confidentialité / 06 Indépendance / 07 IA Claude"
- [ ] Tab dans le TOC → focus visible sur les links, clic ou Enter scroll vers la section

---

## Session 32 — 2026-05-16

### Vérification session 31

- [VERIFIED] `Methode.tsx` `useLocation()` + useEffect hash scroll
- [VERIFIED] TOC labels updated (Confidentialité, Position d'un groupe)
- 91/91 tests verts, typecheck clean

### Bugs fixés (HTML / PWA / partage)

- [FIXED] PWA standard · `index.html` n'avait que `apple-mobile-web-app-capable` (déprécié en iOS Safari 17+). La spec W3C standard est `mobile-web-app-capable` (Chrome, iOS 17+). Ajout du standard + garde la version Apple legacy pour back-compat iOS < 17. · `index.html`
- [FIXED] Partage social · `index.html` n'avait pas d'Open Graph ni Twitter card meta. Partager l'URL sur Twitter/FB/Slack/WhatsApp → bare URL preview. Sur app dont la promesse est le partage des résultats (et même viralité visée), critique. Ajout og: title/description/type/url/image/locale + twitter:card/title/description/image. · `index.html`
- [FIXED] Fallback `<noscript>` · `index.html` user avec JS désactivé voyait page blanche (SPA). Ajout d'un fallback explicite expliquant que JS est requis + assure qu'aucune donnée n'est envoyée (cohérent avec promesse privacy). · `index.html`

### Vérifications à faire en session 33

- [ ] Tester URL directe sur Twitter Card Validator (cards-dev.twitter.com) — preview doit afficher titre + description + image
- [ ] Désactiver JS dans DevTools, reload `/` — message "JavaScript requis" doit s'afficher (pas page blanche)
- [ ] iOS Safari 17+ : tester "Add to Home Screen" — l'app doit toujours fonctionner en standalone mode (les 2 meta tags doivent être respectés)

---

## Session 33 — 2026-05-16

### Vérification session 32

- [VERIFIED] index.html : `mobile-web-app-capable` + `apple-mobile-web-app-capable`
- [VERIFIED] Open Graph + Twitter card meta tags présents
- [VERIFIED] `<noscript>` fallback avec message JS requis
- 91/91 tests verts, typecheck clean, build OK

### Bugs fixés (a11y + SEO + branding)

- [FIXED] A11y · `Card.tsx style outline: "none"` supprimait le focus indicator browser default (qui était moche sur un card full-height) mais sans remplacement → keyboard user qui Tab sur Card n'a aucun feedback visuel. Ajout règle CSS `[role="article"]:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }` dans index.css. focus-visible ne fire qu'au clavier, pas au pointer (donc pas de ring sur drag/tap). · `src/index.css`
- [FIXED] SEO + branding · `index.html <title>` était juste "Sans Détour". Browser tab + résultats Google manquaient la tagline. Updated à "Sans Détour — Pas les programmes, les vrais votes" (53 chars, sous la limite SEO de 60). · `index.html`
- [FIXED] SEO best practice · pas de `public/robots.txt`. Search engines crawl OK par défaut mais c'est best practice de spécifier explicitement + référencer le sitemap (futur). Ajout `User-agent: * / Allow: /` + Sitemap URL. · `public/robots.txt`

### Vérifications à faire en session 34

- [ ] Sur /play, Tab vers une Card → focus ring accent visible autour du contour (pas avec souris)
- [ ] Reload page, regarder browser tab title → doit dire "Sans Détour — Pas les programmes, les vrais votes"
- [ ] GET https://sansdetour.fr/robots.txt → 200 OK avec contenu

---

## Session 34 — 2026-05-16

### Vérification session 33

- [VERIFIED] `index.css:67` règle focus-visible sur `[role="article"]`
- [VERIFIED] `<title>` inclut la tagline
- [VERIFIED] `public/robots.txt` créé
- 91/91 tests verts, typecheck clean

### Bugs fixés (a11y focus + perf bundle + dead code)

- [FIXED] A11y · `Methode.tsx useEffect` hash scroll faisait `scrollIntoView` mais ne `focus()` pas l'élément cible. Keyboard user qui clique TOC link reste avec focus sur le LINK, pas sur la section atteinte. Tab continue depuis le link au lieu de la heading. Ajout `el.focus({ preventScroll: true })` après le scroll. · `src/routes/Methode.tsx`
- [FIXED] Perf · main bundle = 642 KB (warning Vite > 500 KB). `Methode` + `Legal` sont des reading pages rarement visitées. Lazy load via `React.lazy()` + `Suspense fallback={null}` dans main.tsx → split en chunks séparés. Mesure : main passé à 579 KB + Methode 10 KB + Wordmark 50 KB en chunks séparés. ~63 KB économisés au premier paint critical path. · `src/main.tsx`
- [FIXED] Dead data · `PersonnaliteMeta.presidentiable` field — commenté "Currently informational" depuis le départ, jamais consommé en frontend ni en scripts. Idem `code` (session 30). Suppression de l'interface field et des 8 valeurs `presidentiable: true/false` dans les entries. · `src/lib/personnalites.ts`

### Vérifications à faire en session 35

- [ ] Sur /methode, cliquer un TOC link → vérifier (Tab après) que focus est sur la section heading, pas sur le link cliqué
- [ ] Network tab DevTools : naviguer Cover → Méthode doit déclencher un chunk JS séparé ("Methode-*.js")
- [ ] Inspecter PERSONNALITES : entries n'ont plus `presidentiable`

---

## Session 35 — 2026-05-16

### Vérification session 34

- [VERIFIED] `Methode.tsx:28` `el.focus({ preventScroll: true })` après scroll
- [VERIFIED] `main.tsx` Methode + Legal en lazy() (chunks séparés)
- [VERIFIED] PersonnaliteMeta sans `presidentiable`
- 91/91 tests verts, typecheck clean

### Bugs fixés

- [FIXED] CSS specificity · `Card.tsx` avait `outline: "none"` inline qui trumpait la règle CSS `[role="article"]:focus-visible { outline: 2px... }` ajoutée en session 33. Le focus indicator ne s'affichait jamais (inline > class). Solution : supprimer l'inline, déplacer la suppression dans une règle CSS `:focus:not(:focus-visible)` qui ne touche pas le ring keyboard. Cascade cohérente. · `src/components/Card.tsx`, `src/index.css`
- [FIXED] UX/loading · `main.tsx Suspense fallback={null}` affichait page blanche pendant le chunk lazy Methode/Legal load (~50-100ms sur connexion rapide, plusieurs secondes sur 3G). Ajout d'un `<RouteLoader>` minimal qui réserve l'espace de layout avec un "Chargement…" discret. · `src/main.tsx`
- [FIXED] PWA · `manifest.webmanifest` n'avait pas de field `id`. Sans id explicite, certains browsers traitent l'app comme une nouvelle instance si l'URL change (e.g. www. vs apex). Ajout `id: "/"` pour fixer l'identité PWA. · `public/manifest.webmanifest`

### Vérifications à faire en session 36

- [ ] Sur /play, Tab vers Card → focus ring accent visible (avec souris pas de ring)
- [ ] Slow 3G simulation sur Network tab, naviguer vers /methode → "Chargement…" affiché avant la page (pas blank)
- [ ] Inspecter manifest.webmanifest : a `id: "/"`

---

## Session 36 — 2026-05-16

### Vérification session 35

- [VERIFIED] `Card.tsx` plus d'inline `outline: "none"`, règle CSS dans index.css gère les 2 états (focus / focus-visible)
- [VERIFIED] `main.tsx` Suspense fallback = `<RouteLoader />` (plus null)
- [VERIFIED] `manifest.webmanifest:2` a `"id": "/"`
- Note : user a changé `--accent` de bleu république (D2) à orange signal (D3) — design board 04. Mes session 35 changes préservés.
- 91/91 tests verts, typecheck clean

### Bugs fixés

- [FIXED] BCP-47 lang inconsistency · `manifest.webmanifest` disait `"lang": "fr-FR"`, `index.html` disait `<html lang="fr">`. fr-FR (France) plus précis que fr (générique). Aligné sur fr-FR dans HTML. · `index.html`
- [FIXED] Test correctness · `tests/matching-edge-cases.test.ts:24` description "returns 1 when user abstention matches group abstention" ne matchait pas l'assertion `alignmentScore("pour" as any, "abstention") === 0.5`. Le `as any` était dead code (`"pour"` est valid UserVote). Description corrigée + cast retiré. · `tests/matching-edge-cases.test.ts`
- [FIXED] Perf micro · `Cover.tsx start()` appelait `markCoverSeen()` unconditionnel à chaque clic CTA, même quand user revisite (hasSeenCover déjà true). Inutile localStorage.setItem. Guard `if (!hasSeenCover()) markCoverSeen()`. Important sur Safari private mode où setItem peut throw (caught par session 7 try/catch, mais skip est plus propre). · `src/routes/Cover.tsx`

### Vérifications à faire en session 37

- [ ] Inspect `<html>` tag : `lang="fr-FR"` (matche manifest)
- [ ] Re-run `tests/matching-edge-cases.test.ts` : 1er test description et assertion alignées
- [ ] DevTools Application > Local Storage : cliquer CTA sur Cover revisitée (avec sd_seen_cover déjà "true") → pas de write event localStorage

---

## Session 37 — 2026-05-16

### Vérification session 36

- [VERIFIED] `<html lang="fr-FR">` matche manifest
- [VERIFIED] `tests/matching-edge-cases.test.ts:24` description et assertion alignées
- [VERIFIED] `Cover.tsx:51` guard `if (!hasSeenCover()) markCoverSeen()`
- 91/91 tests verts, typecheck clean

### Bugs fixés

- [FIXED] DRY/cleanup · `AuditTrail` wrapping double — Result.tsx enveloppait `<div id={panelId}>` autour de `<AuditTrail>` qui rend déjà `<section role="region" aria-labelledby>`. Deux levels de wrapping pour 1 logical container. Ajout d'une prop `id?` à AuditTrail qui place l'id sur la section directement. Result.tsx simplifié, plus un seul élément a11y wrapper. · `src/components/AuditTrail.tsx`, `src/routes/Result.tsx`
- [FIXED] A11y · `RouteLoader` (Suspense fallback ajouté session 35) affichait "Chargement…" sans `role="status"` ni `aria-live`. SR users ne savaient pas que c'était un loading transitoire vs la destination. Ajout `role="status"` + `aria-live="polite"`. · `src/main.tsx`
- [FIXED] CSS redondance · `@media (prefers-reduced-motion: reduce) { .skeleton-shimmer { animation: none } }` redondant — la règle wildcard `*, *::before, *::after { animation-duration: 0.01ms !important }` plus haut neutralisait déjà l'animation. Suppression de la règle dupliquée + commentaire pour justifier. · `src/index.css`

### Vérifications à faire en session 38

- [ ] Inspect DOM sur /result avec un PartyRow expanded : un seul `<section role="region" id="audit-trail-X">`, plus de div wrapper supplémentaire
- [ ] Slow 3G + nav vers /methode : VoiceOver doit annoncer "status, Chargement…" pendant le chunk load (pas juste lire silencieusement)
- [ ] Activer prefers-reduced-motion dans DevTools : CardSkeleton/ResultSkeleton shimmer doit être instantané ou statique (pas en boucle)

---

## Session 38 — 2026-05-16

### Vérification session 37

- [VERIFIED] `AuditTrail` accepte prop `id?` + placé sur le `<section>`, Result.tsx ne wrap plus
- [VERIFIED] `RouteLoader` a `role="status"` + `aria-live="polite"`
- [VERIFIED] `.skeleton-shimmer` @media reduced-motion supprimé
- 91/91 tests verts, typecheck clean

### Bugs fixés (refactor DRY + edge case 0-votes)

- [FIXED] DRY · `TARGET = 20` dupliqué dans Cover.tsx, Play.tsx, Result.tsx. Centralisation dans `types/index.ts` comme export `TARGET`. Tous les call sites updated. · `src/types/index.ts`, `src/routes/Cover.tsx`, `src/routes/Play.tsx`, `src/routes/Result.tsx`
- [FIXED] DRY · 3 magic numbers identiques pour le seuil "ranking utile" (5 votes) : `MIN_FOR_LIVE` (Play), `MIN_FOR_RESULT_LINK` (TopBar), littéral `5` dans canSeePartialResult (Cover). Centralisation comme export `MIN_FOR_RANKING` dans types/index.ts. · `src/types/index.ts`, `src/components/TopBar.tsx`, `src/routes/Cover.tsx`, `src/routes/Play.tsx`
- [FIXED] Edge case · `Result.tsx` URL directe `/result` sans session affichait "Tu es surtout aligné avec La France Insoumise (0%)" (premier groupe par GROUP_CODES order, tous pct=0). Misleading. Ajout useEffect guard : si session && votes.length === 0, navigate("/") replace. · `src/routes/Result.tsx`

### Vérifications à faire en session 39

- [ ] Modifier `TARGET = 20` → `21` dans types/index.ts → vérifier que Cover/Play/Result affichent tous "/21" (et pas un mix)
- [ ] Vider la session (DevTools → localStorage clear), naviguer directement à `/result` → doit rediriger vers `/`
- [ ] Aucune référence à `MIN_FOR_LIVE` ou `MIN_FOR_RESULT_LINK` dans le code (replacés par `MIN_FOR_RANKING`)

---

## Session 39 — 2026-05-16

### Vérification session 38

- [VERIFIED] `TARGET` + `MIN_FOR_RANKING` exportés depuis `types/index.ts`
- [VERIFIED] `MIN_FOR_LIVE` / `MIN_FOR_RESULT_LINK` éliminés
- [VERIFIED] `Result.tsx:44` 0-votes guard (mais incomplet — fixé en session 39)
- 91/91 tests verts, typecheck clean

### Bugs fixés

- [FIXED] Edge case complet · `Result.tsx` mon useEffect session 38 vérifiait `session && session.votes.length === 0` mais oubliait le cas `session === null` (URL `/result` direct sans session du tout). Plus, useEffect → flash de la page misleading avant navigate. Remplacé par early-return `<Navigate to="/" replace />` qui couvre les 2 cas et empêche le flash. · `src/routes/Result.tsx`
- [FIXED] Pluralization · `Result.tsx:188` `{skips} skip` toujours au singulier. Pour `skips > 1` should be "skips". Cohérence avec les autres pluriels du codebase (`restant${... > 1 ? "s" : ""}` dans Cover). Ajout `{skips > 1 ? "s" : ""}`. · `src/routes/Result.tsx`
- [FIXED] Import consolidation · `Cover.tsx`, `Play.tsx`, `Result.tsx` avaient 2 imports séparés depuis `../types` (un `import { value }` + un `import type { Type }`). TypeScript supporte `import { value, type Type }` mixé. Consolidation pour réduire la duplication d'import lines. · `src/routes/Cover.tsx`, `src/routes/Play.tsx`, `src/routes/Result.tsx`

### Vérifications à faire en session 40

- [ ] Tester URL `/result` sans aucune session (localStorage clear) → doit rediriger immédiatement vers `/` sans flash de page misleading
- [ ] Sur /result avec 3 skips → header affiche "20 scrutins · 17 comptés · 3 skips" (pluriel)
- [ ] Inspecter top de Cover/Play/Result : un seul `import` line depuis `../types`

---

## Session 40 — 2026-05-16

### Vérification session 39

- [VERIFIED] `Result.tsx:71` `<Navigate to="/" replace />` early return
- [VERIFIED] `Result.tsx:187` skip pluralization `{skips > 1 ? "s" : ""}`
- [VERIFIED] Imports consolidés Cover/Play/Result depuis `../types`
- 91/91 tests verts, typecheck clean

### Bugs fixés

- [FIXED] Analytics pollution · `Result.tsx result_reached` track firait même quand `<Navigate>` redirige (useEffect schedule s'exécute après render mais avant que Navigate prenne effet). Pollue analytics avec sessions vides. Guard ajouté `hasVotes` check + deps stable `[top?.group, session?.votes.length]` au lieu de `[top]` (qui change de ref chaque render). · `src/routes/Result.tsx`
- [FIXED] Hook ordering · `Result.tsx` avait `useState(showPersonnalites)` et `useRef(reportedRef)` entre des computations (style non-conventionnel). Tous les hooks regroupés en haut maintenant, suivis des computations, puis des guards. Plus lisible. · `src/routes/Result.tsx`
- [FIXED] Ship blocker flagged · `Legal.tsx` lignes 28-29 contiennent `[Nom complet · à compléter]` + `[adresse postale]` visibles en production. SHIP-V1.md §4 le flag mais aucun commentaire dans le code. Ajout d'un commentaire TODO production-blocker explicite au-dessus pour qu'un futur dev ne déploie pas par mégarde. · `src/routes/Legal.tsx`

### Vérifications à faire en session 41

- [ ] Visiter `/result` sans session → vérifier Plausible : pas d'event "result_reached" envoyé
- [ ] Inspect `src/routes/Result.tsx` : tous les hooks (useState, useRef, useEffect) sont avant `const session = loadSession()`
- [ ] grep `[Nom complet` dans src/ → fichier flag avec TODO production-blocker comment au-dessus

---

## Session 41 — 2026-05-16

### Vérification session 40

- [VERIFIED] `Result.tsx:64` `hasVotes` guard dans le track useEffect
- [VERIFIED] hooks regroupés en haut de Result.tsx
- [VERIFIED] `Legal.tsx:28` TODO production-blocker comment au-dessus des placeholders
- 91/91 tests verts, typecheck clean

### Bugs fixés

- [FIXED] Ship blocker flagged · `index.html og:image` + `twitter:image` pointent vers `/icons/icon-512.png` qui n'existe pas (SHIP-V1.md §2 "Icônes PWA" TODO). Partage social = preview cassée actuellement. Flag avec TODO production-blocker comment, cohérent avec Legal session 40. Visible en code review. · `index.html`
- [FIXED] A11y · `AuditTrail` row icon span avait `aria-label` mais pas `role="img"`. SR users qui naviguent par "images" (rotor JAWS/VoiceOver) ne trouvaient pas l'icône d'alignement. Ajout `role="img"` pour la rendre indexable. · `src/components/AuditTrail.tsx`
- [FIXED] API explicite · `Methode.tsx useEffect scrollIntoView` utilisait `behavior: "auto"` — auto hérite du CSS `scroll-behavior` (smooth ou instant selon contexte). Pour un deep-link, comportement prévisible attendu. Changé à `behavior: "instant"` (API moderne, Chrome 105+, Safari 16+, Firefox 121+). · `src/routes/Methode.tsx`

### Vérifications à faire en session 42

- [ ] grep `og:image` dans index.html → TODO production-blocker comment au-dessus
- [ ] Sur /result, expand un PartyRow → SR doit pouvoir naviguer par "image" pour trouver les icônes d'alignement avec leur label
- [ ] Tester `/methode#methode-05` direct URL → scroll doit être instantané (pas smooth) vers la Section 05

---

## Session 42 — 2026-05-16

### Vérification session 41

- [VERIFIED] index.html og:image avec TODO production-blocker comment
- [VERIFIED] `AuditTrail:94` `role="img"` sur span icône
- [VERIFIED] `Methode.tsx:27` `behavior: "instant"`
- 91/91 tests verts, typecheck clean

### Bugs fixés (wording + pluralization)

- [FIXED] Wording · `FreshnessBanner` "MAJ il y a 0 j" / "prochaine sync dans 0 j" awkward (synchronisé aujourd'hui). Promote en langage naturel : "MAJ aujourd'hui" si past=0, "sync imminente" si next=0. Plus pluriel correct sur "jour"/"jours". · `src/components/FreshnessBanner.tsx`
- [FIXED] French plural rule · `> 1 ? "s" : ""` était utilisé dans 2 endroits (Cover sub-text restants, Result skip). En français, le pluriel s'applique pour 0 aussi ("0 votes restants", "0 skips"). Règle correcte : `!== 1 ? "s" : ""`. · `src/routes/Cover.tsx`, `src/routes/Result.tsx`
- [FIXED] Confirm dialog grammar · `Cover.tsx restart()` confirm text disait "Tes ${votesCount} votes en cours seront perdus" qui ne s'accorde pas pour votesCount=1 ("Tes 1 votes"). Branche explicite : "Ton 1 vote en cours sera perdu" vs "Tes N votes en cours seront perdus". · `src/routes/Cover.tsx`

### Vérifications à faire en session 43

- [ ] Mock fetchFreshness avec `last_sync_at = today`, `next_sync_eta = today` → banner doit dire "MAJ aujourd'hui · sync imminente"
- [ ] Sur Result avec 0 skips → "20 scrutins · 20 comptés · 0 skips" (pluriel)
- [ ] Sur Cover avec 1 vote en cours, cliquer "Recommencer à zéro" → confirm dit "Ton 1 vote en cours sera perdu" (pas "Tes 1 votes")

---

## Session 43 — 2026-05-16

### Vérification session 42

- [VERIFIED] FreshnessBanner phrases naturelles pour past=0 / next=0
- [VERIFIED] Plural rule `!== 1` dans Cover sub-text + Result skip
- [VERIFIED] Cover restart confirm branche singular/plural
- 91/91 tests verts, typecheck clean

### Bugs fixés (DRY drift + wording)

- [FIXED] DRY drift · `Cover.tsx:205` hardcodait `"≈ 5 min · 20 votes"` alors que TARGET = 20 est centralisé dans types/index.ts (session 38). Si TARGET change, Cover affiche encore "20 votes" → drift. Template literal avec `${TARGET}`. · `src/routes/Cover.tsx`
- [FIXED] DRY drift · `Methode.tsx:114` hardcodait "Pour chaque session, on en tire **20**...". Même drift. Le commentaire dans `types/index.ts:5` le flag déjà ("Methode page copy '20 votes'"). Import TARGET + `{TARGET}` interpolation. · `src/routes/Methode.tsx`
- [FIXED] Wording · `Cover.tsx restart()` confirm singular branche disait "Ton 1 vote en cours sera perdu" — le "1" est redondant en français singulier ("Ton vote" suffit). Plus naturel. · `src/routes/Cover.tsx`

### Vérifications à faire en session 44

- [ ] Modifier `TARGET = 21` dans types/index.ts temporairement → Cover sub-text default doit dire "≈ 5 min · 21 votes" ET Methode §02 doit dire "Pour chaque session, on en tire 21"
- [ ] Cover restart sur 1 vote → confirm doit dire "Ton vote en cours sera perdu" (sans le "1")

---

## Session 44 — 2026-05-16

### Vérification session 43

- [VERIFIED] Cover sub-text `${TARGET} votes`
- [VERIFIED] Methode §02 `<strong>{TARGET}</strong>`
- [VERIFIED] Cover restart singular branche sans "1" redondant
- 91/91 tests verts, typecheck clean

### Bugs fixés (perf + ranking edge case + a11y)

- [FIXED] Perf · `fetchFreshness` faisait 2 round-trips Supabase séquentiels (lastSync puis count). Indépendants. `Promise.all` divise le temps par 2 sur cold load (banner Cover/Methode apparaît plus vite). · `src/lib/scrutins.ts`
- [FIXED] Ranking edge case · `rankPersonnalitesByAlignment` ne dépriorisait pas tooLittleData. Une personnalité avec 100 % sur 1 vote rank au-dessus d'une avec 85 % sur 20 votes — visuellement #1 mais peu significatif. Sort en deux passes : d'abord par `counted < 3 ? 1 : 0` (low-data au bottom), puis par pct. · `src/lib/matching.ts`
- [FIXED] A11y · `Methode.tsx Section` avait `outline: "none"` inline supprimant le focus indicator inconditionnellement. Keyboard user qui Tab depuis TOC vers section n'avait aucun feedback. Pattern Card (sessions 33+35) reproduit : suppression inline → class `.methode-section` + règle CSS `:focus:not(:focus-visible)` + `:focus-visible { outline: 2px solid accent }`. · `src/routes/Methode.tsx`, `src/index.css`

### Vérifications à faire en session 45

- [ ] Slow 3G + load /cover → FreshnessBanner apparaît plus vite qu'avant (Promise.all)
- [ ] Mock une personnalité avec counted=1 pct=100 + une autre counted=20 pct=80 → ranking doit avoir la deuxième en premier
- [ ] Sur /methode, Tab sur lien TOC, Enter → section atteinte doit avoir focus ring accent visible

---

## Session 45 — 2026-05-16

### Vérification session 44

- [VERIFIED] `scrutins.ts fetchFreshness` utilise `Promise.all([lastSyncQuery, countQuery])`
- [VERIFIED] `matching.ts rankPersonnalitesByAlignment` two-pass sort low-data → bottom
- [VERIFIED] `Methode.tsx Section` utilise `className="methode-section"` + règles CSS `index.css`
- 91/91 tests verts, typecheck clean

### Bugs fixés (DRY drift + layout + a11y)

- [FIXED] DRY drift · `LOW_DATA_THRESHOLD = 3` dupliqué : ajouté session 44 dans `matching.ts` (const local) ET déjà littéral `counted < 3` dans `PersonnaliteRow.tsx:13`. Centralisé dans `types/index.ts` avec JSDoc rappelant que la valeur sert à la fois au tri et à l'affichage (doivent rester en sync). Imports dans les deux call sites. · `src/types/index.ts`, `src/lib/matching.ts`, `src/components/PersonnaliteRow.tsx`
- [FIXED] DRY drift · `Play.tsx` `<section>` style dupliqué entre skeleton path (deck.length===0) et main path (rendering deck). Même 6 propriétés : padding, flex, gap, minHeight, maxWidth, margin. Si on tweak la layout, on doit penser à modifier les 2 endroits. Extrait en const `playSectionStyle` module-level. · `src/routes/Play.tsx`
- [FIXED] Layout shift · `Play.tsx` skeleton path rendait `<CardSkeleton />` seul, sans header. Au load, quand la real route render, la chip de progression `(1 / 20)` apparaît d'un coup, poussant CardSkeleton + bouton row vers le bas de ~32 px (border + padding). Visible sur cold load lent. Ajout d'un placeholder header `aria-hidden` qui mime le footprint de la vraie chip pour préserver l'espace + `aria-busy="true"` sur la section pour signaler le loading aux SR. · `src/routes/Play.tsx`

### Vérifications à faire en session 46

- [ ] grep `LOW_DATA_THRESHOLD` dans src/ → 3 occurrences (1 def dans types, 1 import dans matching, 1 import dans PersonnaliteRow), zéro littéral `< 3` lié à counted
- [ ] grep `padding: "18px var(--gutter)` dans `src/routes/Play.tsx` → 0 résultat (extrait en const)
- [ ] Slow 3G + load /play → la chip de progression placeholder est visible pendant le skeleton, et au moment où le deck render, ni CardSkeleton ni la button row ne sautent verticalement

---

## Session 46 — 2026-05-16

### Vérification session 45

- [VERIFIED] `LOW_DATA_THRESHOLD` centralisé dans `types/index.ts`, 0 littéral `< 3` restant, 2 imports propres (matching + PersonnaliteRow)
- [VERIFIED] `Play.tsx` `playSectionStyle` const, utilisée par skeleton path + main path, aucun style inline `padding: "18px var(--gutter)`
- [VERIFIED] `Play.tsx` skeleton path a un placeholder header `aria-hidden` + section `aria-busy="true"`
- 91/91 tests verts, typecheck clean

### Bugs fixés (defensive + silent failures)

- [FIXED] Edge-case · `loadSession` cast `JSON.parse(raw) as SessionState` sans valider la shape. Si localStorage contient un JSON valide mais pas une session (`{}`, `"null"`, payload d'un vieux schéma, ou édition manuelle de localStorage), le cast ment et les appelants crashent à `session.votes.length` / `session.cards_seen.includes()`. Ajout d'une validation minimale : `Array.isArray(cards_seen)` ET `Array.isArray(votes)` sinon return null (= "corrupt session, treat as no session"). · `src/lib/session.ts`
- [FIXED] Type-safety · `drawNext` (mode affinement) acceptait `capPerChapeauPrefix?: number` et `seenChapeauPrefixCounts?: Map` comme deux optionnels indépendants. Si caller passe le cap mais oublie la Map (silent contract drift), `undefined?.get() ?? 0` retourne toujours 0, donc `0 >= cap` ne déclenche jamais → cap silencieusement bypassed. Pattern de composeDeck copié : default à `new Map()` localement quand le cap est défini, ce qui rend la fonction self-healing. · `src/lib/deck.ts`
- [FIXED] Silent failure · `fetchFreshness` vérifie `lastSyncRes.error` mais pas `countRes.error`. Si la count query échoue (permissions Supabase, network glitch, RLS), countRes.count est null, et le banner rend silencieusement "0 scrutins · MAJ aujourd'hui · sync imminente" — ment sur l'état de la base. Throw sur `countRes.error` comme on le fait pour lastSync. Le banner disparaîtra (`info` reste null) au lieu de mentir. · `src/lib/scrutins.ts`

### Vérifications à faire en session 47

- [ ] DevTools console : `localStorage.setItem('sd_session_v1', '{}')` puis recharger `/play` → ne doit pas crasher, comportement = pas de session (Cover redirect)
- [ ] DevTools console : `localStorage.setItem('sd_session_v1', '"null"')` → idem, pas de crash
- [ ] grep `seenChapeauPrefixCounts\?\.` dans `src/lib/deck.ts` → 0 résultat (plus de optional chaining sur la Map)
- [ ] Mocker `supabase.from('scrutins').select(...count: 'exact'...)` pour retourner `{ error: { message: 'forbidden' } }` → fetchFreshness throw, banner pas rendu

---

## Session 47 — 2026-05-16

### Vérification session 46

- [VERIFIED] `loadSession` valide `Array.isArray(cards_seen) && Array.isArray(votes)` après JSON.parse (`session.ts:39-40`)
- [VERIFIED] `drawNext` n'utilise plus de optional chaining sur `seenChapeauPrefixCounts` — default à `new Map()` localement quand le cap est set (`deck.ts:132-134`)
- [VERIFIED] `fetchFreshness` throw sur `countRes.error` (`scrutins.ts:49`)
- 91/91 tests verts, typecheck clean

### Bugs fixés (DRY drift + UX retry + analytics inflation)

- [FIXED] DRY drift · `Methode.tsx §04` hardcodait `<strong>5e scrutin compté</strong>` alors que `MIN_FOR_RANKING = 5` est centralisé dans `types/index.ts` et déjà importé par Cover/Play/TopBar. Même drift que session 43 avec TARGET. Import + interpolation `{MIN_FOR_RANKING}<sup>e</sup>` pour préserver l'exposant typographique. · `src/routes/Methode.tsx`
- [FIXED] UX silent failure · `Cover.tsx` posait `fetchedRef.current = true` AVANT d'await `fetchFreshness()`. Si la fetch échoue (blip Supabase, offline tick), le ref reste `true` et le banner ne réessaie jamais pour le reste de la session, même si l'user clique sur le wordmark pour revenir sur `/`. Fix : set le ref dans `.then` (only on success) — un échec laisse le ref `false` donc le prochain run de l'effect (state mutation via wordmark click) retente. · `src/routes/Cover.tsx`
- [FIXED] Analytics inflation · `Result.tsx personnalites_revealed` firait sur CHAQUE toggle open du disclosure (un user qui ouvre/ferme/ouvre = 2 events). Incohérent avec `result_reached` qui utilise `reportedRef.current` pour fire 1× par mount. Ajout `personnalitesReportedRef` symétrique → 1 event max par session. · `src/routes/Result.tsx`

### Vérifications à faire en session 48

- [ ] grep `5e scrutin\|5 scrutins compt` dans `src/` → 0 résultat (plus de littéral hardcodé)
- [ ] DevTools Network : block `*supabase*` puis charger `/` → après échec, cliquer wordmark dans le TopBar d'une autre page pour re-fire Cover → debrancher block → la banner doit apparaître au second retour (retry effectif)
- [ ] Plausible dashboard : sur une session avec toggle personnalités 3× ouvert/fermé → `personnalites_revealed` count = 1, pas 3

---

## Session 48 — 2026-05-16

### Vérification session 47

- [VERIFIED] `Methode.tsx:8` import `MIN_FOR_RANKING`, ligne 137 utilise `{MIN_FOR_RANKING}<sup>e</sup>`, 0 littéral "5e scrutin" restant
- [VERIFIED] `Cover.tsx:41` `fetchedRef.current = true` à l'intérieur du `.then` (post-succès)
- [VERIFIED] `Result.tsx:30,236,237` `personnalitesReportedRef` symétrique à `reportedRef`
- 91/91 tests verts, typecheck clean

### Bugs fixés (false promise + dead deps + identity drift)

- [FIXED] False promise · `public/robots.txt` annonçait `Sitemap: https://sansdetour.fr/sitemap.xml` mais aucun fichier sitemap.xml n'existait (et aucun build step ne le génère). Chaque crawler qui parsait robots.txt récupérait un 404 sur l'URL annoncée. Comment-out avec TODO production-blocker (cohérent avec `index.html og:image` + `Legal.tsx` placeholders) jusqu'à ce que la génération soit réellement câblée. · `public/robots.txt`
- [FIXED] Dead deps · `@resvg/resvg-wasm` est listé dans `dependencies` (^2.6.2) mais zéro import en runtime — la seule trace est le commentaire de `api/share-card.ts:5` qui explique qu'on a abandonné resvg pour shipper du SVG pur. Le script `prebuild` copiait `index_bg.wasm` dans `public/resvg.wasm` (≈1 MB) servi à chaque client pour rien. Drop la dep, le prebuild, et le fichier wasm physique. Lockfile resynchronisé via `npm install`. · `package.json`, `public/resvg.wasm`
- [FIXED] Identity drift · `api/share-card.ts:23 ACCENT = "#7eb6ff"` était le bleu D2 (république) archivé. L'app est passée orange D3 (`oklch(0.76 0.16 55)`) session 36, mais le serveur de share images est resté bleu : chaque user qui partage son alignement diffuse une image avec un accent qui ne correspond pas à l'app. Remplacé par `#ed9846` (sRGB approx du D3) + commentaire pointant le CSS var de référence. · `api/share-card.ts`

### Vérifications à faire en session 49

- [ ] curl `https://sansdetour.fr/robots.txt` → ne contient plus de ligne `Sitemap:` active (commentée)
- [ ] grep `@resvg\|resvg-wasm\|prebuild` dans package.json + ls `public/resvg.wasm` → tout absent
- [ ] curl `https://sansdetour.fr/api/share-card?t=RN:57,EPR:48,LFI:42,DR:30,SOC:25` → SVG retourné avec `<text fill="#ed9846">` (ou équivalent dans le rendu satori) pas `#7eb6ff`

---

## Session 49 — 2026-05-16

### Vérification session 48

- [VERIFIED] `public/robots.txt:11` `Sitemap:` commenté avec TODO production-blocker
- [VERIFIED] `package.json` zéro mention de `resvg-wasm` ou `prebuild` ; `public/resvg.wasm` absent du disque ; lockfile resynced
- [VERIFIED] `api/share-card.ts:27` `ACCENT = "#ed9846"` avec commentaire pointant `oklch(0.76 0.16 55)`
- 93/93 tests verts, typecheck clean (2 nouveaux tests apparus entre sessions, sans rapport avec mes fix)

### Bugs fixés (dead config dans la zone session 48)

- [FIXED] Dead config · `.gitignore` ligne `public/resvg.wasm` ignorait un fichier qui n'est plus généré (session 48 a retiré le `prebuild` step + le wasm). Le `.gitignore` parlait d'un cas impossible. Suppression. · `.gitignore`
- [FIXED] Documentation drift · `.env.local.example` déclarait `VITE_PLAUSIBLE_DOMAIN=sansdetour.fr` mais aucun code ne lit cette variable — `index.html:34` hardcode `data-domain="sansdetour.fr"` directement sur la balise `<script>` Plausible. Un dev qui mettait la variable à `staging.sansdetour.fr` aurait pensé re-router ses events, alors qu'ils continuaient à polluer prod. Remplacé la déclaration par une note explicite qui dit où le domaine vit vraiment. · `.env.local.example`
- [FIXED] Content-Type mismatch · `vercel.json` rewrite `/api/share-card.png → /api/share-card` était un leftover du path PNG abandonné (cf. comment `api/share-card.ts:5`). L'endpoint sert exclusivement `Content-Type: image/svg+xml` ; un GET sur `.png` renvoyait du SVG avec une extension PNG — certains scrapers OG (WhatsApp, Slack) refusent l'image quand le Content-Type ne matche pas l'extension annoncée. Drop la rewrite, garder uniquement `.svg`. · `vercel.json`

### Vérifications à faire en session 50

- [ ] grep `resvg` dans `.gitignore` → 0 résultat
- [ ] grep `VITE_PLAUSIBLE_DOMAIN` dans repo (hors docs/qa et MEMORY) → 0 résultat (ou seulement la note explicative dans .env.local.example)
- [ ] `curl -I https://sansdetour.fr/api/share-card.png` → 404 (ou rewrite vers /index.html selon le catch-all), plus de SVG-as-PNG ; `.svg` doit toujours marcher

---

## Session 50 — 2026-05-16

### Vérification session 49

- [VERIFIED] `.gitignore` ne contient plus `public/resvg.wasm`
- [VERIFIED] `.env.local.example` ne déclare plus `VITE_PLAUSIBLE_DOMAIN=` ; remplacé par une note explicite pointant vers `index.html`
- [VERIFIED] `vercel.json` ne référence plus `/api/share-card.png` (rewrite supprimée)
- 93/93 tests verts, typecheck clean

### Bugs fixés (stale docs + DRY drift sur types)

- [FIXED] Stale docs · `SHIP-V1.md` annonçait "33/33 tests" (en réalité 93), "PNG share-card" (l'endpoint sert SVG only depuis l'abandon de resvg-wasm pré-V1, cf `api/share-card.ts:5`) et listait `SUPABASE_SERVICE_ROLE_KEY` + `ANTHROPIC_API_KEY` comme env vars Vercel "pour l'edge function share-card" — faux : `api/share-card.ts` ne tape pas Supabase (juste Satori + font), et Anthropic ne tourne pas en prod. Cleanup en 3 endroits : compte de tests, instructions Vercel env (réduit de 4 à 2 vars), smoke test mentionne `.svg`. · `SHIP-V1.md`
- [FIXED] DRY drift · `ScrutinAnalyse` était re-déclaré localement dans `scripts/ingest-an.ts:435` ET `scripts/resume-ingest.ts:158`, en parallèle de la définition canonique dans `src/types/index.ts:127`. 3 copies du même type → drift garanti si on ajoute un champ (ex: `sources` pour citations). Les 2 scripts importent maintenant `ScrutinAnalyse` depuis `../src/types` (tsx résout fine vers la source). · `scripts/ingest-an.ts`, `scripts/resume-ingest.ts`
- [FIXED] Stale JSDoc · `src/types/index.ts:124` JSDoc de `ScrutinAnalyse` décrivait "exposed via the '+ analyse' bottom-sheet on the card". Le refactor `9cb7e6c` (refactor card) a supprimé à la fois le bouton + analyse et le bottom-sheet d'analyse — tout est maintenant rendu inline dans le verso unifié. JSDoc réécrit pour pointer Card.tsx et le commit de réf. · `src/types/index.ts`

### Vérifications à faire en session 51

- [ ] grep `33/33 tests\|PNG share-card\|share-card.png` dans SHIP-V1.md → 0 résultat
- [ ] grep `interface ScrutinAnalyse` dans repo (hors src/types et docs/qa) → 0 résultat
- [ ] grep `+ analyse.*bottom-sheet` dans src/ → 0 résultat

---

## Session 51 — 2026-05-16

### Vérification session 50

- [VERIFIED] `SHIP-V1.md` ne mentionne plus "33/33 tests", "PNG share-card" ni "share-card.png"
- [VERIFIED] `interface ScrutinAnalyse` n'existe que dans `src/types/index.ts:129` (canonical) — scripts importent depuis types
- [VERIFIED] `src/types/index.ts` JSDoc de `ScrutinAnalyse` ne référence plus le "+ analyse bottom-sheet" supprimé
- 93/93 tests verts, typecheck clean

### Bugs fixés (stale doc refs post-refactors)

- [FIXED] Broken doc ref · `Legal.tsx:30` TODO comment pointait vers `SHIP-V1.md §4 "Mentions légales (10 min)"` — cette section n'a jamais existé : `SHIP-V1.md §4` est "Déploiement Vercel". Comment ré-écrit pour être intrinsèque au fichier (plus de risque de drift externe) + note historique explicite. · `src/routes/Legal.tsx`
- [FIXED] Incomplete prod-blocker flag · Session 41 avait flagué `og:image` + `twitter:image` avec TODO production-blocker mais pas `<link rel="apple-touch-icon">` (index.html:17) ni les 3 entrées `icons[]` de `manifest.webmanifest` — tous référencent `/icons/*.png` qui 404 aujourd'hui (pas de dossier `public/icons/`). Symptômes invisibles dans le code mais : icône blanc sur iOS "Ajouter à l'écran d'accueil", preview vide WhatsApp/Slack/Telegram, install PWA avec icône par défaut. TODO étendu en index.html + ajouté dans manifest (via clé `_comment` non-standard mais valide JSON). · `index.html`, `public/manifest.webmanifest`
- [FIXED] CLAUDE.md stale post-refactor · La section UI décrivait (a) le menu TopBar comme un "bottom-sheet" alors que c'est un popover ancré (avec petite flèche), et (b) la Card avec 2 verso variants `explanation` / `analyse` — fusionnés en verso unifié par commit `9cb7e6c`. La doc mentait sur 2 patterns d'UI dont les contributeurs futurs (humains ou Claude) auraient suivi le mauvais modèle mental. Réécriture pour refléter l'état réel + mention du commit de référence. · `CLAUDE.md`

### Vérifications à faire en session 52

- [ ] grep `SHIP-V1.md §4 .Mentions légales` dans `src/` → 0 résultat
- [ ] grep `apple-touch-icon` + lire le bloc TODO juste au-dessus dans `index.html` → mentionne explicitement apple-touch-icon (pas juste og/twitter)
- [ ] grep `variant.*explanation\|backVariant\|bottom-sheet` dans `CLAUDE.md` → 0 résultat (sauf la mention explicite de MethodeSheet comme vrai bottom-sheet)

---

## Session 52 — 2026-05-16

### Vérification session 51

- [VERIFIED] `Legal.tsx:33` comment historique mentionne explicitement que SHIP-V1 §4 ≠ "Mentions légales" (commentaire intrinsèque, plus de drift externe possible)
- [VERIFIED] `index.html` bloc TODO production-blocker liste explicitement apple-touch-icon + og:image + twitter:image + manifest icons[]
- [VERIFIED] `CLAUDE.md` UI section : zéro mention de "variant explanation/analyse" ; TopBar décrit comme popover, MethodeSheet identifié comme vrai bottom-sheet
- 93/93 tests verts, typecheck clean

### Bugs fixés (3 migrations SQL avec docs périmées)

- [FIXED] Migration 0002 stale spec · `0002_add_contexte.sql` documentait le contexte comme "One sentence, ≤ 25 words" — réalité (ingest-an.ts SYSTEM_PROMPT ligne 249) : 30-50 mots en 2 phrases courtes, dont une "Concrètement : …" / "Par exemple : …" obligatoire, avec un chiffre + un nom propre, et **bold** markdown pour 2-3 fragments-clés. Spec widened pre-V1, jamais répercutée dans la migration. Comment ré-écrit avec le spec actuel + pointeur vers `extractConcrete` qui consomme la 2e phrase dans AuditTrail. · `supabase/migrations/0002_add_contexte.sql`
- [FIXED] Migration 0003 stale UI ref · `0003_add_analyse.sql` disait "Powers the '+ analyse' card overlay". Le refactor `9cb7e6c` a supprimé le bouton "+ analyse" et l'overlay associé : `analyse_loi` est rendu inline dans le verso unifié de la Card. Comment corrigé, ref au commit de fusion ajoutée pour l'archéologie. · `supabase/migrations/0003_add_analyse.sql`
- [FIXED] Migration 0006 shape example faux · `0006_add_votes_personnalites.sql` montrait un shape `{ "le_pen": "pour", "bardella": "contre", ..., "tondelier": "absent", "wauquiez": "non_dispo", ... }` — bardella + tondelier sont **exclus structurellement** de PERSONNALITE_CODES (cf. JSDoc src/types/index.ts:50), Wauquiez est président du groupe DR et n'a jamais été ministre donc jamais "non_dispo". L'exemple aurait induit en erreur tout dev essayant de comprendre les valeurs valides. Réécrit avec les 8 vraies clés + bloc explicite listant les exclus structurels. · `supabase/migrations/0006_add_votes_personnalites.sql`

### Vérifications à faire en session 53

- [ ] grep `One sentence, ≤ 25 words` dans `supabase/migrations/` → 0 résultat
- [ ] grep `+ analyse.*overlay\|+ analyse.*card overlay` dans `supabase/migrations/` → 0 résultat
- [ ] grep `bardella\|tondelier\|wauquiez.*non_dispo` dans `supabase/migrations/0006_add_votes_personnalites.sql` → seulement dans la note d'exclusion explicite, pas dans l'exemple Shape

---

## Session 53 — 2026-05-16

### Vérification session 52

- [VERIFIED] `0002_add_contexte.sql` ne contient plus "One sentence, ≤ 25 words" ; spec étendu à 30-50 mots / 2 phrases
- [VERIFIED] `0003_add_analyse.sql` ne mentionne "+ analyse" qu'avec la note historique "merged into the verso by commit 9cb7e6c"
- [VERIFIED] `0006_add_votes_personnalites.sql` Shape example n'utilise plus bardella/tondelier ; exclusion explicite ajoutée dans une note
- 93/93 tests verts (avant l'ajout de cette session), typecheck clean

### Bugs fixés (coverage gaps sur code défensif récent)

- [FIXED] Coverage gap · `rankPersonnalitesByAlignment` two-pass sort (low-data → bottom) ajouté session 44/45, jamais testé. Un refactor qui casserait la première passe (qui pushe les `counted < LOW_DATA_THRESHOLD` au bas) laisserait passer une régression : un score 100%-on-1-vote remonterait en tête au-dessus d'un 60%-on-20-votes meaningful. 2 tests ajoutés (low-data → bottom + tri par pct dans la bucket regular). · `tests/matching-edge-cases.test.ts`
- [FIXED] Coverage gap · `loadSession` shape validation (Array.isArray sur cards_seen + votes) ajouté session 46, jamais testé. Si un dev simplifie le guard à `if (!parsed) return null;`, une localStorage corrompue (`{}`, `"null"`, payload partiel) crasherait l'app sur `session.votes.length` sans signal en CI. 5 tests ajoutés (malformed JSON, `{}`, `"null"`, votes non-array, cards_seen manquant). · `tests/session.test.ts`
- [FIXED] Coverage gap · `drawNext` avec `capPerChapeauPrefix` + default-empty Map ajouté session 46, jamais testé. Le path "cap respecté quand la Map sature" + le contrat "Map omise ≠ cap bypassed silencieusement" tous deux non couverts. 2 tests ajoutés pour ces 2 branches. · `tests/deck.test.ts`

### Vérifications à faire en session 54

- [ ] `npm run test:run` → 102 tests verts (était 93)
- [ ] Modifier temporairement `LOW_DATA_THRESHOLD` à 0 dans types/index.ts → le test "pushes low-data personnalités to the bottom" doit échouer (preuve que le test détecte la régression)
- [ ] Modifier temporairement `loadSession` pour skipper le `Array.isArray` check → 5 tests session 53 doivent échouer

---

## Session 54 — 2026-05-16

### Vérification session 53

- [VERIFIED] 102 tests verts (avant l'ajout de cette session) — 9 tests session-53 ajoutés bien présents
- [VERIFIED] `tests/matching-edge-cases.test.ts` contient "pushes low-data personnalités to the bottom"
- [VERIFIED] `tests/session.test.ts` contient "cards_seen is missing" + 4 autres shape-validation
- [VERIFIED] `tests/deck.test.ts` contient "seenChapeauPrefixCounts saturates"

### Bugs fixés (a11y WCAG + coverage + SEO)

- [FIXED] A11y WCAG 2.5.3 "Label in Name" · Sur `/play`, le bouton "Je passe" avait `aria-label="Passer ce scrutin sans voter"` — la chaîne ne contient pas le texte visible "Je passe". Voice control (macOS / Windows) qui matche par accessible name ne trouvait pas la cible quand l'user dit "Click Je passe". Aligné avec le pattern `"TEXTE — verbose"` pour les 3 boutons (Contre / Je passe / Pour) — l'accessible name commence maintenant par le texte visible, le verbose suit pour les SR users qui ont besoin de contexte. · `src/routes/Play.tsx`
- [FIXED] Coverage gap · Le registre `PERSONNALITES` (src/lib/personnalites.ts) n'avait aucun test, contrairement à `PARTIES` qui en a un. Un dev qui ajoute une personnalité à `PERSONNALITE_CODES` sans entrée dans `PERSONNALITES` aurait un crash runtime sur `getPersonnalite(code).display_name` (undefined.display_name) — aucun signal CI. 6 tests ajoutés : entrée par code, champs non-vides, group_code ∈ GroupCode, acteur_ref unique + format `PA\d+`, getPersonnalite, display_name contient prenom+nom. · `tests/personnalites.test.ts` (nouveau)
- [FIXED] SEO · `index.html` n'avait pas de `<link rel="canonical">`. Sans canonical, Google peut indexer les preview URLs Vercel (`*.vercel.app/*`) comme alternatives à la prod — fragmente le PageRank, pollue les SERP avec des URLs éphémères. Canonical fixé sur `https://sansdetour.fr/` avec commentaire qui explique la limite SPA (routes /play, /result, etc. partagent ce canonical en l'absence de SSR ou de mise à jour côté client). · `index.html`

### Vérifications à faire en session 55

- [ ] grep `aria-label="Voter (contre\|pour)\|aria-label="Passer ce scrutin` dans src/routes/Play.tsx → 0 résultat (tous remplacés par le pattern "TEXTE — verbose")
- [ ] `npm run test:run` → 108 tests verts (était 102), `tests/personnalites.test.ts` présent
- [ ] curl https://sansdetour.fr/ | grep canonical → `<link rel="canonical" href="https://sansdetour.fr/" />`

---

## Session 55 — 2026-05-16

### Vérification session 54

- [VERIFIED] `src/routes/Play.tsx` : 3 aria-labels pattern "TEXTE — verbose" (Contre / Je passe / Pour)
- [VERIFIED] `tests/personnalites.test.ts` existe et tourne (6 cas, parmi les 108)
- [VERIFIED] `index.html:12` `<link rel="canonical" href="https://sansdetour.fr/" />` présent avec commentaire SPA-limit

### Bugs fixés (UX edge case + a11y landmarks + WCAG label-in-name)

- [FIXED] UX edge case · `/play?affinement=1` sans session précédente complète gardait quand même `refinementMode=true`, donc le header dropait le " / TARGET" suffix → user débarquait sur une session vide avec "1" sans target visible. Affinement n'a de sens qu'après 20 votes terminés. Garde ajouté : `isAffinement && (!existing || existing.votes.length < TARGET)` → strip le flag, redirect `/play` propre. · `src/routes/Play.tsx`
- [FIXED] A11y multiple unlabeled `<nav>` landmarks · `Methode.tsx:40`, `Legal.tsx:10`, `Cover.tsx:260` rendaient tous des `<nav>` sans aria-label. SR users naviguant par landmarks (VO rotor, NVDA Insert+F7) voyaient plusieurs entrées "navigation" indistinguables (en plus de la nav "Sommaire de la méthode" qui, elle, était labelée). aria-label ajoutés : "En-tête de la page" sur Methode + Legal, "Liens secondaires" sur Cover. · `src/routes/Methode.tsx`, `src/routes/Legal.tsx`, `src/routes/Cover.tsx`
- [FIXED] WCAG 2.5.3 "Label in Name" · La chip "✨IA" sur le recto Card avait `aria-label="Comment ce contenu a été préparé"` — l'accessible name ne contenait pas le texte visible "IA". Voice control "Click IA" ratait la cible. Aligné avec le pattern session 54 : `"IA — comment ce contenu a été préparé"` + emoji ✨ wrappée dans `<span aria-hidden="true">` pour que SR ne lisent pas "sparkles IA" → "comment ce contenu…". · `src/components/Card.tsx`

### Vérifications à faire en session 56

- [ ] DevTools localStorage clear puis URL directe `/play?affinement=1` → doit rediriger vers `/play` (sans flag), header montre "1 / 20" pas "1" tout seul
- [ ] VoiceOver / NVDA sur /methode + landmarks rotor → 3 nav labelés distincts : "En-tête de la page", "Sommaire de la méthode", "Menu principal" (quand popover TopBar ouvert)
- [ ] Inspect Card recto → bouton chip avec aria-label="IA — …" et `<span aria-hidden="true">✨</span>` autour de l'emoji

---

## Session 56 — 2026-05-16

### Vérification session 55

- [VERIFIED] `Play.tsx:74` guard `isAffinement && (!existing || existing.votes.length < TARGET)` en place
- [VERIFIED] `aria-label="En-tête de la page"` dans Methode + Legal ; `aria-label="Liens secondaires"` dans Cover ; chacune des 3 routes a 1 match
- [VERIFIED] `Card.tsx:118` `aria-label="IA — comment ce contenu a été préparé"`

### Bugs fixés (typed env + regex defense + analytics gate)

- [FIXED] Type-safety · `src/vite-env.d.ts` ne contenait que la `reference vite/client` mais ne déclarait pas `ImportMetaEnv`. Un typo sur `import.meta.env.VITE_SUPABBASE_URL` résolverait silencieusement à `undefined` → `supabase.ts` fallback aux fixtures dev en prod. Augmentation typée ajoutée pour les 2 clés client (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Server-only secrets explicitement absents pour éviter qu'on les lise depuis le bundle client (Vite les inlinerait, fuite). · `src/vite-env.d.ts`
- [FIXED] Regex defense · `AuditTrail.extractConcrete` matchait `(?:Concrètement|Par exemple)\s*:?\s*` — colon optionnel mais zéro fallback comma. Le SYSTEM_PROMPT impose le colon, mais une drift LLM ("Concrètement, la loi...") faisait surfacer un bullet "*, Mme Le Pen vote..." avec virgule en tête (trim+strip trailing dot ne récupère pas un leading comma). Pattern étendu en `\s*[:,]?\s*`. · `src/components/AuditTrail.tsx`
- [FIXED] Analytics pollution · `analytics.ts track()` appelait `window.plausible?.(...)` sans gate sur hostname. Le script Plausible est servi pour TOUS les origins (dev localhost, *.vercel.app previews, prod) avec `data-domain="sansdetour.fr"` hardcoded dans index.html — chaque dev session ou preview deploy pollut le dashboard prod. Gate ajouté sur `ANALYTICS_HOSTS = Set(["sansdetour.fr", "www.sansdetour.fr"])` : non-prod hostnames no-op proprement. Les tests qui spyent `track` ne sont pas affectés (le gate est en aval du spy). · `src/lib/analytics.ts`

### Vérifications à faire en session 57

- [ ] DevTools console sur localhost → essayer `import.meta.env.VITE_SUPABBASE_URL` (typo) ; si VITE_TYPED → tsc devrait flag en build, sinon `undefined` à runtime (validation manuelle)
- [ ] Mocker un contexte "Concrètement, la loi fait X. Cette mesure…" puis ouvrir Result → AuditTrail bullet doit dire "la loi fait X" (pas ", la loi fait X")
- [ ] DevTools sur `localhost:5173` → faire un vote → DevTools Network → aucun event `event=vote` envoyé à `plausible.io` (le script peut se charger, mais `track()` no-op)

---

## Session 57 — 2026-05-16

### Vérification session 56

- [VERIFIED] `src/vite-env.d.ts` déclare `ImportMetaEnv` avec `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` typés en `string | undefined`
- [VERIFIED] `AuditTrail.tsx:152` regex avec `[:,]?` (colon OR comma fallback)
- [VERIFIED] `analytics.ts:12,16` `ANALYTICS_HOSTS` Set + gate hostname

### Bugs fixés (iOS PWA + coverage + stale doc)

- [FIXED] iOS PWA safe-area · Le manifest déclare `display: "standalone"` et index.html déclare `apple-mobile-web-app-status-bar-style="black-translucent"` (= content sous status bar), mais le viewport n'avait pas `viewport-fit=cover` ni les `env(safe-area-inset-*)` dans CSS. Sur iPhone X+ installé en PWA, TopBar wordmark était caché sous le notch, et le bottom row de boutons Contre/Je passe/Pour passait sous le home indicator. Fix : `viewport-fit=cover` ajouté + 4 paddings `env(safe-area-inset-*, 0)` sur body. Fallback `0` neutralise sur les devices non-notched. · `index.html`, `src/index.css`
- [FIXED] Coverage gap · `ANALYTICS_HOSTS` gate (session 56) sans test. Un dev qui supprime ou élargit le Set re-pollue le dashboard prod silencieusement (aucun signal CI). Ajout `tests/analytics.test.ts` (7 cas) : prod hostname appelle plausible, www. variant appelle plausible, localhost no-op, *.vercel.app no-op, fork no-op, props envelope shape, no-props case. · `tests/analytics.test.ts` (nouveau)
- [FIXED] Stale doc · `.env.local.example` note Plausible disait "un build de staging pousserait ses events vers le compte prod" — plus vrai depuis session 56 (le hostname gate empêche). Note réécrite pour refléter la double couche de protection (data-domain hardcoded + ANALYTICS_HOSTS allow-list) et pointer les 2 endroits à éditer si on bascule sur un autre domaine. · `.env.local.example`

### Vérifications à faire en session 58

- [ ] Inspecter `index.html` viewport meta → contient `viewport-fit=cover`
- [ ] Sur iPhone X+ Simulator (Safari → Add to Home Screen) → ouvrir l'app, vérifier que TopBar/Cover header n'est pas coupé par le notch et que les boutons en bas ne sont pas masqués par le home indicator
- [ ] `npm run test:run` → 115 tests verts (était 108)

---

## Session 58 — 2026-05-17

### Vérification session 57

- [VERIFIED] `index.html:11` `viewport-fit=cover` présent dans le meta viewport
- [VERIFIED] `src/index.css:68-71` 4 paddings `env(safe-area-inset-*, 0)` sur body
- [VERIFIED] `tests/analytics.test.ts` existe et tourne (7 cas, 115 tests total)
- [VERIFIED] `.env.local.example` note Plausible mentionne maintenant l'allow-list `ANALYTICS_HOSTS`

### Bugs fixés (stale docs — 3 doc artifacts)

- [FIXED] `docs/v2-roadmap.md` triple-ref · Heading `## Feature 3 — Ton député (à venir)` dupliqué littéralement lignes 107 et 111 (probable conflit de merge non résolu), + 3e mention "Comparaison avec ton député" ligne 192 dans la section "Autres idées V2" qui décrit exactement la même feature. Cleanup en 2 endroits : 1 seule section Feature 3 enrichie avec la note sur l'infra `votes_personnalites`, suppression du bullet redondant. · `docs/v2-roadmap.md`
- [FIXED] `SHIP-V1.md §7` smoke test items obsolètes · (a) "Result → tester le flip 3D sur une carte (sur la page Result il n'y a pas de cartes, c'est sur Play)" — sentence qui se contredit elle-même, le flip 3D a lieu sur les cartes Play. Reformulé pour préciser que le tap-pour-flip se fait pendant les 20 swipes. (b) "Test footer : Méthode, Mentions légales, Mon résultat" — le footer secondary nav a été remplacé par le menu TopBar `•••` au commit `5040874`. Reformulé pour pointer vers le popover TopBar + ajout du lien Contact qui existe dans le menu. · `SHIP-V1.md`
- [FIXED] `SHIP-V1.md §Roadmap V2` description mensongère · "L'idée du pré-vote sur dossiers à venir est documentée dans docs/v2-roadmap.md" — le pré-vote est en réalité dans la section "Idée parking" de v2-roadmap, archivée hors scope sprint 2027. Les vraies V2 features sont P1 (livré) + P2 (livré) + P3 ton député (à venir). SHIP-V1 framing remplacé par un récap d'état des 4 chantiers V2. · `SHIP-V1.md`

### Vérifications à faire en session 59

- [ ] grep `## Feature 3` dans `docs/v2-roadmap.md` → 1 seul résultat
- [ ] grep `footer.*Mentions légales\|tester le flip 3D sur une carte` dans `SHIP-V1.md` → 0 résultat
- [ ] grep `pré-vote sur dossiers à venir est documentée` dans `SHIP-V1.md` → 0 résultat (la section parle des 4 chantiers V2 maintenant, pas du parking)

---

## Session 59 — 2026-05-17

### Vérification session 58

- [VERIFIED] `docs/v2-roadmap.md` : 1 seul `## Feature 3` (dedupé)
- [VERIFIED] `SHIP-V1.md` : 0 mention "footer" pour secondary nav ou "tester le flip 3D sur une carte" (item-by-item smoke test reformulé)
- [VERIFIED] `SHIP-V1.md` : 0 mention "pré-vote sur dossiers à venir est documentée" ; § Roadmap V2 récapitule P1/P2/P3 + parking
- 115/115 tests verts, typecheck clean

### Bugs fixés (CLAUDE.md drift au fil des sessions)

- [FIXED] Stale test count · `CLAUDE.md` ligne 190 disait "Vitest, 45 tests aujourd'hui" — un dev qui regardait CLAUDE.md voyait 45, la suite en a en réalité 115 (sessions 53-57 ont ajouté +22 tests : matching low-data, session shape-validation, drawNext prefix cap, personnalites registry, analytics hostname gate). Réécrit avec ~115 + breakdown des domaines couverts. · `CLAUDE.md`
- [FIXED] Stale cost claim · `CLAUDE.md` ligne 198 annonçait `npm run ingest:an` à "~$1.50, 10min" — figure pré-V2 (probablement Sonnet 3.x sans Batches). Pipeline actuel = Haiku 4.5 + Batches API → ~$0.20-0.30 (cf. SHIP-V1 §1) selon les ~250K tokens utiles, 5-7x moins cher. Aligné sur la valeur SHIP-V1 + ajout du modèle pour traçabilité. · `CLAUDE.md`
- [FIXED] Stale UI ref · `CLAUDE.md` ligne 208 Roadmap disait "V2 UX — Refonte menu (TopBar + bottom-sheet)". Session 51 avait corrigé "bottom-sheet → popover" dans la section UI principale mais avait raté la mention dans la Roadmap section. Réécrit pour distinguer le popover ancré du TopBar du vrai bottom-sheet MethodeSheet (déclenché par chip ✨IA). · `CLAUDE.md`

### Vérifications à faire en session 60

- [ ] grep `45 tests\|45.tests aujourd'hui` dans `CLAUDE.md` → 0 résultat
- [ ] grep `\$1.50` dans `CLAUDE.md` → 0 résultat (le coût aligné avec SHIP-V1)
- [ ] grep `Refonte menu (TopBar + bottom-sheet)` dans `CLAUDE.md` → 0 résultat (popover ancré explicite)

---

## Session 60 — 2026-05-17

### Vérification session 59

- [VERIFIED] `CLAUDE.md` : 0 mention "45 tests", "$1.50", ou "Refonte menu (TopBar + bottom-sheet)"
- 115/115 tests verts, typecheck clean

### Bugs fixés (open-source claims + tagline punctuation + corpus count)

- [FIXED] User-facing 404 + missing LICENSE · 3 endroits (Methode §06 ligne 153, Methode §07 ligne 168, Legal "Code source" ligne 54) liaient vers `https://github.com/sansdetour` — repo qui n'existe pas (le vrai repo est privé à `waramere1234/sans-detour` per CLAUDE.md). AND aucun `LICENSE` file dans la repo malgré la claim "code source MIT" → potentielle non-compliance légale. Flag les 3 endroits avec TODO production-blocker (cohérent avec le pattern Legal placeholders + index.html icons + robots.txt sitemap). Décision à faire avant ship : publier sous l'org sansdetour + ajouter LICENSE.md, ou drop ces bullets. · `src/routes/Methode.tsx`, `src/routes/Legal.tsx`
- [FIXED] Tagline punctuation drift · `<title>` disait "Sans Détour — Pas les programmes, les vrais votes" (virgule, sans point final) — divergeait de la forme canonique "Pas les programmes. Les vrais votes." utilisée partout ailleurs : Cover hero, meta description, og:description, twitter:description, manifest description. Le title est ce qui s'affiche dans l'onglet navigateur ET dans le snippet Google — devait matcher. Aligné. · `index.html`
- [FIXED] Stale corpus count · `SHIP-V1.md §1` ligne 9 disait "seed avec 46 scrutins" et ligne 20 "46 cartes rafraîchies" — chiffres V1 baseline. Le corpus actuel est ~100 scrutins (92 votables, 8 fallback) per CLAUDE.md. Aligné sur 100 + mention du filtre fallback + note que l'upsert est idempotent. · `SHIP-V1.md`

### Vérifications à faire en session 61

- [ ] grep `github.com/sansdetour` dans `src/` → toujours présent (TODO production-blocker à côté) ; vérifier que chaque occurrence a un commentaire TODO juste au-dessus
- [ ] grep `Pas les programmes, les vrais votes` dans `index.html` → 0 résultat (la version comma-no-period n'existe plus)
- [ ] grep `46 scrutins\|46 cartes` dans `SHIP-V1.md` → 0 résultat

---

## Session 61 — 2026-05-17

### Vérification session 60

- [VERIFIED] `src/routes/{Methode,Legal}.tsx` : `github.com/sansdetour` toujours linké mais TODO production-blocker juste au-dessus de chaque occurrence (3 sites)
- [VERIFIED] `index.html` `<title>` aligné sur "Pas les programmes. Les vrais votes."
- [VERIFIED] `SHIP-V1.md` : 0 mention "46 scrutins" / "46 cartes"
- 115/115 tests verts (avant session 61), typecheck clean

### Bugs fixés (security headers + iOS PWA sticky + coverage gap)

- [FIXED] Sécurité prod · `vercel.json` n'avait aucun security header explicite. Vercel sert HTTPS + HSTS par défaut mais pas X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. Sans X-Frame-Options, un site malveillant peut iframer sansdetour.fr dans un overlay et faire du clickjacking sur les boutons de vote. Ajout des 4 headers standards via `headers[].source: "/(.*)"` (applique à toutes les routes). Permissions-Policy bloque cam/mic/geo/payment/usb que l'app n'utilise jamais. · `vercel.json`
- [FIXED] iOS PWA TopBar sticky · Session 57 avait ajouté `viewport-fit=cover` + body padding `env(safe-area-inset-*)`. Le body padding protège les éléments en flow normal (Cover header, Methode/Legal headers) mais PAS la sticky position du TopBar : `position: sticky; top: 0` colle l'élément à y=0 de la viewport (notch zone) au scroll, masquant le wordmark et le bouton ••• sous le notch iPhone X+. Fix : `top: env(safe-area-inset-top, 0px)` sur TopBar — pré-scroll ET post-scroll restent cohérents en dessous du notch. · `src/components/TopBar.tsx`
- [FIXED] Coverage gap · `FreshnessBanner` accumule 3 branches non-testées : tone switch fresh/stale (session 44 a ajouté `STALE_AFTER_DAYS = 10`), natural-language phrasing pour past=0 ("MAJ aujourd'hui") et next=0 ("sync imminente") (session 42), French plural rule `!== 1`. Plus le fallback NaN-safe sur date malformée. Une régression sur l'un de ces branches passait CI silencieusement. 8 tests ajoutés dans `tests/FreshnessBanner.test.tsx` (nouveau). · `tests/FreshnessBanner.test.tsx`

### Vérifications à faire en session 62

- [ ] curl -I https://sansdetour.fr/ | grep -i "x-frame-options\|referrer-policy" → présents
- [ ] Sur iPhone X+ Simulator (PWA standalone), scroller dans `/play` → TopBar reste en-dessous du notch, jamais masqué par lui
- [ ] `npm run test:run` → 123 tests verts (était 115)

---

## Session 62 — 2026-05-17

### Vérification session 61

- [VERIFIED] `vercel.json` `headers[]` contient X-Frame-Options DENY + Permissions-Policy
- [VERIFIED] `src/components/TopBar.tsx:46` `top: "env(safe-area-inset-top, 0px)"` sur sticky
- [VERIFIED] `tests/FreshnessBanner.test.tsx` existe (72 lignes, 8 tests)
- 123/123 tests verts, typecheck clean

### Bugs fixés (dead casts + contradictory docs + iOS PWA overflow)

- [FIXED] Dead casts · `src/lib/supabase.ts:4-5` utilisait `as string | undefined` sur `import.meta.env.VITE_SUPABASE_*`. Depuis l'augmentation typed `ImportMetaEnv` session 56, ces deux clés sont déjà typées `string | undefined` au niveau du module. Les casts étaient des no-ops déclaratifs. Drop + commentaire pointant vers `src/vite-env.d.ts`. · `src/lib/supabase.ts`
- [FIXED] Contradiction docs · `SHIP-V1.md §2` ligne 26 disait "Icônes PWA (10 min) — **optionnel pour le ship initial**", mais index.html + manifest.webmanifest flaggent les 3 entrées `/icons/*.png` comme TODO production-blocker (sessions 41+51+57). Optionnel + production-blocker s'excluent. Aligné sur prod-blocker + énuméré les symptômes visibles (icône blanc PWA install, preview vide WhatsApp/Slack/Telegram, apple-touch-icon 404). · `SHIP-V1.md`
- [FIXED] iOS PWA layout overflow · Session 57 a ajouté `body { padding: env(safe-area-inset-*) }` (notch + home indicator zones). Session 61 a fixé `TopBar { top: env(safe-area-inset-top) }`. Mais `App.tsx` outer + `Cover.tsx` section gardent `minHeight: 100dvh` — `100dvh` couvre toute la viewport (notch zones incluses), donc l'élément demande la taille totale dans un body dont le contenu est déjà rétréci par les paddings → ~81px d'overflow sur iPhone 13 PWA, CTA Commencer / boutons Play sous le fold. Fix : `calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))` sur les deux. Fallback `0px` = identique à `100dvh` sur non-notched. · `src/App.tsx`, `src/routes/Cover.tsx`

### Vérifications à faire en session 63

- [ ] grep `as string | undefined` dans src/ → 0 résultat
- [ ] grep `optionnel pour le ship initial` dans `SHIP-V1.md` → 0 résultat
- [ ] Sur iPhone X+ Simulator (PWA), `/` → CTA Commencer visible sans scroll ; `/play` → 3 boutons (Contre/Je passe/Pour) visibles sans scroll
- [ ] `npm run test:run` → 123 tests verts (stable)

---

## Session 63 — 2026-05-17

### Vérification session 62

- [VERIFIED] `src/lib/supabase.ts` : 0 cast `as string | undefined` (juste un commentaire historique)
- [VERIFIED] `SHIP-V1.md` : 0 mention "optionnel pour le ship initial"
- [VERIFIED] `src/App.tsx:22` + `src/routes/Cover.tsx:98` utilisent `calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))`
- 123/123 tests verts, typecheck clean

### Bugs fixés (3 follow-ups iOS PWA safe-area — gaps post sessions 57+61+62)

- [FIXED] Play.tsx overflow · `playSectionStyle.minHeight: calc(100dvh - 60px)` ne soustrayait pas les safe-areas. Sur iPhone 13 PWA (47+34=81px safe), la section overflowait son parent (App outer = 100dvh - 81) de 21px → button row Contre/Je passe/Pour glissait sous le fold. Aligné sur le pattern App+Cover de session 62 : `calc(100dvh - 60px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))`. · `src/routes/Play.tsx`
- [FIXED] Methode anchor jump iPhone PWA · `Section scrollMarginTop: 64` (= TopBar 52 + 12 breathing) suffisait sur non-notched. Mais session 61 a fait TopBar sticky à `top: env(safe-area-inset-top)`, donc post-scroll le TopBar pinote à viewport y=47 (notch) + height 53 = y=100 sur iPhone 13. scrollMarginTop=64 lande le heading à y=64, masqué sous TopBar. Fix : `calc(64px + env(safe-area-inset-top, 0px))` → y=64+47=111, juste en-dessous du TopBar à y=100. · `src/routes/Methode.tsx`
- [FIXED] Bottom-sheets sous home indicator · `RankingOverlay` et `MethodeSheet` ont tous deux `position: fixed; bottom: 0` — le bord inférieur du sheet est à viewport y=100dvh, ce qui chevauche le home indicator iPhone X+ (~34px). Le dernier élément (PartyRow / bouton CTA) passe sous l'indicator, semi-masqué et difficile à tapper. Fix : `padding-bottom: calc(<existing>px + env(safe-area-inset-bottom, 0px))` sur les deux sheets — le contenu interne respecte l'indicator, le fond du sheet continue à border edge-to-edge. · `src/components/RankingOverlay.tsx`, `src/components/MethodeSheet.tsx`

### Vérifications à faire en session 64

- [ ] grep `minHeight.*100dvh - 60px"$` dans src/ → 0 résultat (le `"$` exclu la version avec env())
- [ ] grep `scrollMarginTop: 64\b` dans src/ → 0 résultat
- [ ] iPhone X+ Simulator (PWA) : ouvrir RankingOverlay sur /play (chip Top1 → 5+ votes), vérifier que la dernière PartyRow + le close button ne sont pas masqués par le home indicator

---

## Session 64 — 2026-05-17

### Vérification session 63

- [VERIFIED] `Play.tsx playSectionStyle.minHeight` utilise `env(safe-area-inset-*)`
- [VERIFIED] `Methode.tsx Section scrollMarginTop` est en calc avec `env(safe-area-inset-top)`
- [VERIFIED] `RankingOverlay` + `MethodeSheet` ont `calc(<n>px + env(safe-area-inset-bottom, 0px))` sur padding-bottom
- 123/123 tests verts, typecheck clean

### Bugs fixés (3 a11y — useReducedMotion + role=region)

- [FIXED] `TopBar MenuPopover` n'utilisait pas `useReducedMotion`. Les transitions `duration: 0.12` (backdrop) + `0.16 + ease` (popover slide) jouaient toujours, même avec `prefers-reduced-motion: reduce`. Card.tsx + MethodeSheet.tsx l'utilisaient déjà — gap d'inconstance. Hook ajouté + transitions gated. Le wildcard CSS `*` dans index.css ne catch pas les animations JS Framer Motion, donc le hook est nécessaire. · `src/components/TopBar.tsx`
- [FIXED] `RankingOverlay` même bug · `transition={{ type: "spring", damping: 30, stiffness: 280 }}` sur le sheet slide-up + backdrop fade non-gated. Hook ajouté, spring → `duration: 0` sous reduced-motion, backdrop → `duration: 0.16 ? 0`. · `src/components/RankingOverlay.tsx`
- [FIXED] Methode `Section` sans role+labelledby · La page Methode contient 7 sections (§01..§07). Le composant Section les rendait comme `<div tabIndex=-1>` — anonyme dans les SR landmarks. VoiceOver rotor / NVDA Insert+R listait des landmarks sans étiquette. Ajout `role="region"` + `aria-labelledby` pointant vers le h2 (nouveau id `methode-heading-NN`). Les 7 sections sont maintenant identifiables individuellement dans le rotor. · `src/routes/Methode.tsx`

### Vérifications à faire en session 65

- [ ] DevTools → `prefers-reduced-motion: reduce` (Emulate Vision Deficiencies), ouvrir le menu TopBar `•••` → animation pratiquement instantanée
- [ ] Idem pour RankingOverlay (chip Top1 sur /play après 5 votes)
- [ ] VO rotor sur /methode → 7 entrées "region" labelées avec titre de section (ex: "D'où viennent les données", "Quels scrutins on garde", etc.)

---

## Session 65 — 2026-05-17

### Vérification session 64

- [VERIFIED] `useReducedMotion` importé+utilisé dans Card, MethodeSheet, RankingOverlay, TopBar (4 sites)
- [VERIFIED] `Methode.tsx Section` a `role="region"` + `aria-labelledby={headingId}` pointant vers le h2 (nouveau `id="methode-heading-NN"`)
- 123/123 tests verts, typecheck clean

### Bugs fixés (WCAG 1.4.1 + favicon + user memory stale)

- [FIXED] WCAG 1.4.1 "Use of Color" · `Cover.tsx` lien "Voir mon résultat partiel" était stylé `color: var(--ink-2); textDecoration: "none"` sur un parent `var(--ink-3)` — la couleur est l'UNIQUE indicateur que c'est un lien. Pour les color-blind / high-contrast / low-vision users, indistinguable d'un text. Pattern miroir du sibling "Recommencer à zéro" appliqué : underline + textUnderlineOffset 3 + textDecorationColor var(--ink-4). Cohérent visuellement avec l'autre lien discret du footer. · `src/routes/Cover.tsx`
- [FIXED] Favicon manquant · `index.html` n'avait pas de `<link rel="icon">` et `public/favicon.ico` n'existe pas → browser fait 404 sur `/favicon.ico`, fallback à l'icône générique. Ajout `<link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">` (réutilise l'asset PWA, pas besoin d'un fichier séparé) + TODO production-blocker étendu pour couvrir favicon avec les autres icons. · `index.html`
- [FIXED] User memory stale · `~/.claude/projects/.../memory/project_sans-detour-v1-shipped.md` était figé à l'état post-2026-05-11 V1 (46 scrutins, "Plausible à installer", "Legal à étoffer", PNG share-card en V1.1). Depuis : V2 P1+P2 shippés, ~100 scrutins, 8 personnalités, Plausible installé+gated, Legal écrit, 123 tests, 65 sessions QA, iOS PWA safe-area chain, security headers, etc. Future sessions Claude lisant ce fichier avaient une mauvaise base de raisonnement. Réécrit avec l'état réel + liste des 4 production-blockers + roadmap V2 P3. Index MEMORY.md mis à jour. · `~/.claude/projects/-Users-boz-Documents-GitHub-sans-detour/memory/project_sans-detour-v1-shipped.md`, `MEMORY.md`

### Vérifications à faire en session 66

- [ ] DevTools Vision Deficiencies → "Achromatopsie" sur Cover hasInProgress → "Voir mon résultat partiel" reste identifiable comme lien (underline)
- [ ] curl https://sansdetour.fr/favicon.ico → réponse (404 maintenant tant que les icons ne sont pas créés, mais le `<link rel="icon">` indique au browser de fetcher icon-192.png à la place — quand le fichier existera, le browser le trouvera)
- [ ] Nouveau Claude session sur ce repo lisant la memory → comprend l'état V2 actuel, pas V1 figé

---

## Session 66 — 2026-05-17

### Vérification session 65

- [VERIFIED] `Cover.tsx:244` "Voir mon résultat partiel" link a `textDecoration: "underline"` + `textDecorationColor: var(--ink-4)`
- [VERIFIED] `index.html:42` `<link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">` présent
- [VERIFIED] User memory réécrite avec état V2 + MEMORY.md index mis à jour
- 123/123 tests verts, typecheck clean

### Bugs fixés (WCAG 1.4.1 sweep + aria-current)

- [FIXED] Cover footer 3 nav links · Session 65 a fixé "Voir mon résultat partiel" mais a raté les 3 siblings dans le footer secondary nav (`Méthode & sources`, `Mentions légales`, `Contact`). Tous 3 ont `color: "inherit"` (= parent var(--ink-3)) + `textDecoration: "none"` → indistinguables de plain text, même cue color manquant. linkStyle commun extrait pour les 3 avec underline + ink-4. · `src/routes/Cover.tsx`
- [FIXED] CSS global pour bare `<a>` · Tailwind preflight reset `text-decoration: inherit` sur `<a>` → tous les `<a>` sans inline textDecoration (Methode "voir section 07", Methode §06+§07 external/mailto links, ErrorBoundary contact link) rendent sans underline → WCAG 1.4.1 sur ~6 liens. Règle CSS globale ajoutée : `a { text-decoration: underline; text-decoration-color: currentColor; text-underline-offset: 3px; }`. Inline `textDecoration: "none"` continue à win pour Wordmark Link, TOC accent-number anchors, TopBar MenuLink (qui ont leur propre affordance). · `src/index.css`
- [FIXED] aria-current TopBar menu · TopBar `MenuPopover` rendait 4 destinations (Mon résultat / Méthode & sources / Mentions légales / Contact) sans aucune indication de la page courante. Un user sur `/methode` ouvrant le menu voyait 4 liens équivalents. Prop `current?: boolean` ajoutée à MenuLink → `aria-current="page"` sur le Link interne quand actif, + ton visuel ink-3 (au lieu de ink) pour signaler la position. Wired pour `/methode` et `/legal` (Mon résultat est déjà hidden sur /result, Contact est mailto). · `src/components/TopBar.tsx`

### Vérifications à faire en session 67

- [ ] grep `textDecoration: "none"` dans Cover footer → 0 résultat (les 3 utilisent linkStyle commun avec underline)
- [ ] Sur `/methode`, ouvrir TopBar menu `•••` → "Méthode & sources" en ink-3 (au lieu de ink), DevTools attribute `aria-current="page"` sur ce Link
- [ ] Sur `/methode`, inspecter `<a href="#methode-07">section 07` → underline visible (CSS rule globale), couleur accent (currentColor)

---

## Session 67 — 2026-05-17

### Vérification session 66

- [VERIFIED] `Cover.tsx:292+` `linkStyle` partagé sur les 3 footer links avec textDecoration: underline
- [VERIFIED] `src/index.css:85+` règle globale `a { text-decoration: underline; ... }`
- [VERIFIED] `TopBar.tsx` `MenuLink` accepte prop `current` qui set `aria-current="page"` + ink-3 visuel
- 123/123 tests verts, typecheck clean

### Bugs fixés (Cover wordmark + CLAUDE.md status + Wordmark prop cleanup)

- [FIXED] Cover Wordmark self-link sans aria-current · Cover est à pathname `/`, et le wordmark dans son header pointe vers `<Link to="/">` — un click ne navigue nulle part visuellement, mais SR users entendent un lien "Accueil" sans signal qu'on est DÉJÀ dessus. `aria-current="page"` ajouté (même pattern que TopBar MenuLink session 66). Le Link reste cliquable pour cohérence (state.fromLogo re-trigger l'effect), mais l'a11y est honnête maintenant. · `src/routes/Cover.tsx`
- [FIXED] CLAUDE.md V2 transparence status drift · La ligne 213 listait 3 items en TODO ("disclaimer 'généré par IA' sur cartes, liens vers sources web_search, page `/limitations`") avec un indicateur 🟡, mais le 1er item est shipped : chip ✨IA + MethodeSheet + footer "Synthèse mise en forme par Claude" + séparateur "↑ Synthèse IA / ↓ AN" sur le verso. Future Claude session aurait re-implémenté un truc déjà en place. Section restructurée en 3 sub-bullets ✅ / ⏳ / ⏳ avec pointeurs vers ce qui existe déjà. · `CLAUDE.md`
- [FIXED] Wordmark `size={14}` redondant · 4 call sites (TopBar, Cover, Methode, Legal) passaient `size={14}` qui est exactement la valeur default du composant. Lecture noise sans information ajoutée — si un dev veut un autre size, il l'ajoutera. Drop sur les 4. · `src/components/TopBar.tsx`, `src/routes/Cover.tsx`, `src/routes/Methode.tsx`, `src/routes/Legal.tsx`

### Vérifications à faire en session 68

- [ ] Sur `/` (Cover), inspecter le wordmark Link → `aria-current="page"` présent
- [ ] grep `Wordmark size=` dans `src/` → 0 résultat
- [ ] grep `V2 transparence (optionnel)` dans `CLAUDE.md` → 0 résultat (remplacé par "en partie livré")

---

## Session 68 — 2026-05-17

### Vérification session 67

- [VERIFIED] `Cover.tsx:116` `aria-current="page"` sur le Wordmark Link (self-link sur "/")
- [VERIFIED] `grep "Wordmark size="` retourne 0 (4 sites cleaned : TopBar, Cover, Methode, Legal)
- [VERIFIED] `CLAUDE.md` "V2 transparence" décomposée en ✅/⏳/⏳ sub-bullets
- 123/123 tests verts, typecheck clean

### Bugs fixés (3 drifts docs autour de sansdetour.fr + favicon)

- [FIXED] SHIP-V1 §5 framing trompeur · "Domaine sansdetour.fr (optionnel, ~10€/an) ... Pas urgent — Vercel donne une URL gratuite `xxx.vercel.app` qui marche très bien" — mais le repo référence déjà `sansdetour.fr` partout : `<link rel="canonical">`, og:url, og:image, twitter:image, Plausible `data-domain`, ANALYTICS_HOSTS allow-list. Tant que le domaine n'est pas en place : SEO fragmenté (canonical pointe vers 404) + analytics no-op silencieux. Section §5 réécrite : "prérequis pour SEO + analytics", énumère les fichiers concernés et propose le chemin alternatif (rester sur `*.vercel.app` mais reflect partout dans le code). · `SHIP-V1.md`
- [FIXED] SHIP-V1 §2 enum manifest favicon · La ligne 28 énumérait les références icons dans index.html comme "og:image / twitter:image / apple-touch-icon" — mais session 65 a ajouté `<link rel="icon">` à ce groupe. Énumération complétée avec "favicon `<link rel="icon">` /". · `SHIP-V1.md`
- [FIXED] manifest._comment enum favicon · Même drift que SHIP-V1 §2 — le `_comment` JSON listait "(apple-touch-icon, og:image, twitter:image)" sans le favicon link. Ajout "favicon link, " en tête de la liste. Le manifest reste un JSON valide (vérifié avec node -e JSON.parse). · `public/manifest.webmanifest`

### Vérifications à faire en session 69

- [ ] grep `Pas urgent\|optionnel.*sansdetour` dans `SHIP-V1.md` → 0 résultat
- [ ] grep `favicon` dans `SHIP-V1.md` `public/manifest.webmanifest` → 1+ résultat chacun (la mention dans l'enum)
- [ ] node -e "JSON.parse(require('fs').readFileSync('public/manifest.webmanifest','utf8'))" → pas d'erreur (JSON valide)

---

## Session 69 — 2026-05-17

### Vérification session 68

- [VERIFIED] `SHIP-V1.md §5` reframé en "prérequis pour SEO + analytics" avec énumération des fichiers concernés
- [VERIFIED] `SHIP-V1.md §2` et `manifest._comment` listent maintenant favicon avec apple-touch-icon / og:image / twitter:image
- [VERIFIED] `node -e JSON.parse(manifest.webmanifest)` valide
- 123/123 tests verts, typecheck clean

### Bugs fixés (robots.txt /api/ + dead padding override + localStorage throw defense)

- [FIXED] robots.txt stale + /api/ exposed · Le comment disait "no API endpoints today" mais `/api/share-card` existe + servit (vercel.json rewrites + api/share-card.ts). Crawlers indexaient cette URL → compute waste (Satori regenerate SVG à chaque hit) + indexation polluante. Ajout `Disallow: /api/` + comment réécrit pour expliquer que share-card est on-demand SVG. · `public/robots.txt`
- [FIXED] CSS shorthand property collision · `TopBar.tsx` `MenuPopover` footer div avait `paddingTop: 8` (line 232) suivi de `padding: "10px 10px 4px"` (line 235). En CSS-in-JS comme en CSS plain, la shorthand `padding` déclarée APRÈS écrase les longhand individuels — le `paddingTop: 8` ne rendait jamais (10px du shorthand gagnait). Drop le longhand mort + commentaire qui explique pourquoi 10px est la valeur réelle. · `src/components/TopBar.tsx`
- [FIXED] localStorage throw defense · `loadSession` et `hasSeenCover` faisaient `localStorage.getItem(...)` sans try/catch. localStorage peut throw au READ (pas que au write) dans : iframes sandboxés, Safari blocked-storage privacy mode pré-iOS 17, sandboxes site-isolation, certains browser extensions. Sans guard, App + Cover crash à first render dans ces contextes. saveSession avait déjà un try/catch — pair les read avec un try/catch retournant null/false pour symétrie. · `src/lib/session.ts`

### Vérifications à faire en session 70

- [ ] curl https://sansdetour.fr/robots.txt | grep "Disallow: /api/" → présent
- [ ] grep `paddingTop: 8` dans `src/components/TopBar.tsx` → 0 résultat
- [ ] DevTools console : `Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked") } })` puis recharger `/` → app rend la Cover (loadSession + hasSeenCover catch et retournent null/false)

---

## Session 70 — 2026-05-17

### Vérification session 69

- [VERIFIED] `public/robots.txt:8` `Disallow: /api/` présent
- [VERIFIED] `src/components/TopBar.tsx` plus de `paddingTop: 8` mort (juste un commentaire historique)
- [VERIFIED] `src/lib/session.ts` `loadSession` et `hasSeenCover` ont try/catch sur localStorage access
- 123/123 tests verts, typecheck clean

### Bugs fixés (defense symétrie + coverage + DB freshness)

- [FIXED] `resetSession` sans try/catch · Session 69 a ajouté try/catch sur `loadSession` + `hasSeenCover`. `resetSession` (clear le session key au "Recommencer à zéro" / "Refaire depuis le début") restait nu — un throw `localStorage.removeItem` (Safari blocked-storage, sandboxed iframe) crashait le click handler, navigate() ne s'exécutait jamais. Try/catch ajouté pour symétrie complète avec saveSession/loadSession/hasSeenCover/markCoverSeen/forgetCover. · `src/lib/session.ts`
- [FIXED] Coverage gap throw defense · Les try/catch sessions 69 + 70 n'avaient aucun test. 3 tests ajoutés dans `tests/session.test.ts` avec `vi.spyOn(Storage.prototype, "getItem"/"removeItem")` mockés pour throw : loadSession retourne null, hasSeenCover retourne false, resetSession swallow le throw. · `tests/session.test.ts`
- [FIXED] `ingere_le` ne refresh pas sur UPDATE · Migration 0001 `ingere_le timestamptz not null default now()` — le default s'applique seulement à l'INSERT. Sur un re-run d'ingest qui UPDATE des rows existantes, `ingere_le` reste à la date originale. `fetchFreshness` retourne le max ingere_le → FreshnessBanner ment ("MAJ il y a 30 jours" alors qu'on vient juste de re-ingest). Fix script-side : stamp `ingere_le: new Date().toISOString()` sur le payload `enriched` dans `ingest-an.ts` + `rows` dans `resume-ingest.ts`. · `scripts/ingest-an.ts`, `scripts/resume-ingest.ts`

### Vérifications à faire en session 71

- [ ] grep `localStorage.removeItem(KEY);$` dans `src/lib/session.ts` → 0 résultat (wrapper try/catch ajouté)
- [ ] `npm run test:run` → 126 tests verts (était 123)
- [ ] Mocker une re-ingest qui n'INSERT aucune row (toutes UPDATE) → fetchFreshness retourne `last_sync_at` = maintenant, pas la date originale

---

## Session 71 — 2026-05-17

### Vérification session 70

- [VERIFIED] `src/lib/session.ts resetSession` a try/catch
- [VERIFIED] `tests/session.test.ts` contient 3 tests "localStorage throw defenses"
- [VERIFIED] `scripts/ingest-an.ts` + `scripts/resume-ingest.ts` stamp `ingere_le: ingestedAt` sur les payloads
- 126/126 tests verts, typecheck clean (project + scripts isolation)

### Bugs fixés (drift counts dans 3 docs + type cleanup)

- [FIXED] `CLAUDE.md` ligne 190 test count drift · "~115 tests aujourd'hui" — stale post sessions 61 (+8 FreshnessBanner) et 70 (+3 throw defense). Aligné sur ~126 + coverage list complétée avec FreshnessBanner, compute-positions, sanity, deck-invariants (4 fichiers manquants à l'enum). · `CLAUDE.md`
- [FIXED] User memory test+session count · `~/.claude/projects/.../memory/{MEMORY.md, project_sans-detour-v1-shipped.md}` disaient "123 tests" + "65 sessions QA" — sessions 66-70 ont ajouté 3 tests + 5 sessions. Aligné à 126 tests + 70 sessions + 210+ fixes. Le content des 4 production-blockers reste inchangé (toujours valide). · MEMORY.md + project_sans-detour-v1-shipped.md
- [FIXED] `tests/Cover.test.tsx initialEntries: any[]` typed · Le helper `renderCover` avait `any[]` pour son param `initialEntries`. Importé le type `InitialEntry` de react-router-dom et utilisé pour typer le param strictement. Pas de bug runtime mais fait disparaître un faux trou de typage. · `tests/Cover.test.tsx`

### Vérifications à faire en session 72

- [ ] grep `~115 tests\|123 tests` dans `CLAUDE.md` + memory/ → 0 résultat
- [ ] grep `any\[\]` dans `tests/Cover.test.tsx` → 0 résultat
- [ ] cat MEMORY.md → mentionne "126 tests" (pas 123)

---

## Session 72 — 2026-05-17

### Vérification session 71

- [VERIFIED] `CLAUDE.md` "~126 tests" + coverage list complète (FreshnessBanner, compute-positions, sanity, deck-invariants ajoutés)
- [VERIFIED] User memory : 126 tests, 70 sessions, 210+ fixes
- [VERIFIED] `tests/Cover.test.tsx initialEntries: InitialEntry[]` (importé de react-router-dom)
- 126/126 tests verts, typecheck clean

### Bugs fixés (env var docs + 2 ingere_le sweep siblings ratés session 70)

- [FIXED] `.env.local.example` undocumented env vars · `INGEST_LIMIT` (test mode pour ingest-an.ts) et `BATCH_ID` (requis par resume-ingest.ts) étaient utilisés dans les scripts mais absents de l'example. Un dev qui veut tester ingest sur quelques scrutins ou récupérer un batch failed devait lire le code script. 2 sections commentées ajoutées avec exemples de valeurs. · `.env.local.example`
- [FIXED] `ingest-personnalites.ts` ingere_le sibling raté · Session 70 a fixé `ingere_le: ingestedAt` sur ingest-an.ts + resume-ingest.ts (les 2 sites upsert principaux), mais `ingest-personnalites.ts` UPDATE-only (V2 P2 patch column) avait le même bug : update `votes_personnalites` ne refresh pas `ingere_le` → FreshnessBanner ment après un patch personnalites. Fix : ajouter `ingere_le: patchedAt` au payload UPDATE. · `scripts/ingest-personnalites.ts`
- [FIXED] `seed-supabase.ts` ingere_le sibling raté · Même pattern manqué session 70. seed-supabase upsert les dev-fixtures.json mais ne stamp pas `ingere_le` — un dev qui seed sa Supabase locale et regarde FreshnessBanner verrait une date originale (du JSON, qui n'existe pas) au lieu de l'instant du seed. Fix : map les rows avec `ingere_le: seededAt` avant l'upsert + cast typed (au lieu de `as any[]`). · `scripts/seed-supabase.ts`

### Vérifications à faire en session 73

- [ ] grep `INGEST_LIMIT` dans `.env.local.example` → 1 résultat
- [ ] grep `ingere_le` dans `scripts/` → 4 sites (ingest-an, resume-ingest, ingest-personnalites, seed-supabase) tous avec stamping explicite
- [ ] Mock un re-run de `npx tsx scripts/ingest-personnalites.ts` → FreshnessBanner doit afficher la date du jour

---

## Session 73 — 2026-05-17

### Vérification session 72

- [VERIFIED] `.env.local.example` mentionne `INGEST_LIMIT` + `BATCH_ID`
- [VERIFIED] `scripts/ingest-personnalites.ts` UPDATE inclut `ingere_le: patchedAt`
- [VERIFIED] `scripts/seed-supabase.ts` upsert avec `ingere_le: seededAt`
- 126/126 tests verts, typecheck clean

### Bugs fixés (3 stale doc drifts)

- [FIXED] `types/index.ts:87` stale contexte comment · Le comment disait "1-line stake/context, ≤ 25 words" — session 52 a updated `supabase/migrations/0002_add_contexte.sql` pour refléter la vraie spec ("30-50 mots, 2 phrases courtes, 'Concrètement: …' obligatoire") mais a raté le comment dans le type interface. Un dev qui implémente quelque chose dépendant du contexte aurait le mauvais modèle mental. Aligné + pointeur vers la migration pour les détails. · `src/types/index.ts`
- [FIXED] `SHIP-V1.md §7` test "Partager" mensonger · L'instruction disait "Test 'Partager' → vérifier que le SVG share-card s'ouvre (l'endpoint `/api/share-card` retourne `image/svg+xml`)". Mais `Result.tsx share()` utilise `navigator.share({text, url})` directement — ne fetch pas l'endpoint share-card. Le bouton Partager ouvre la share sheet native iOS/Android avec du texte. Reformulé en 2 items : (a) test native share sheet, (b) test endpoint via curl séparé. · `SHIP-V1.md`
- [FIXED] CLAUDE.md "Commandes utiles" sans `npm run seed` · Le script `seed` existe dans package.json (seed Supabase locale avec dev-fixtures.json) mais n'était pas listé dans la doc dev. Ajouté + clarifié les 2 autres scripts npx (BATCH_ID requis pour resume-ingest, ingest-personnalites = V2 P2). · `CLAUDE.md`

### Vérifications à faire en session 74

- [ ] grep `≤ 25 words\|1-line stake` dans `src/types/index.ts` → 0 résultat
- [ ] grep `vérifier que le SVG share-card s'ouvre` dans `SHIP-V1.md` → 0 résultat
- [ ] grep `npm run seed` dans `CLAUDE.md` → 1 résultat (dans Commandes utiles)

---

## Session 74 — 2026-05-17

### Vérification session 73

- [VERIFIED] `src/types/index.ts:87` comment contexte aligné sur "30-50 words, 2 short sentences"
- [VERIFIED] `SHIP-V1.md §7` : 0 mention "vérifier que le SVG share-card s'ouvre" (test Partager reformulé)
- [VERIFIED] `CLAUDE.md` Commandes utiles inclut `npm run seed`
- 126/126 tests verts, typecheck clean

### Bugs fixés (coverage + DRY drift + history hygiene)

- [FIXED] Coverage gap · `tests/Cover.test.tsx` ne testait que les redirections vers `/play` (hasInProgress) et l'état "stay on cover" (fromLogo). La branche hasCompleted → `/result` (votes >= TARGET) n'avait aucun test. Une régression sur ce path enverrait un user qui a terminé son test vers /play (deck vide → écran "Plus de scrutins disponibles"). Test ajouté avec 20 recordVote → expect "result page". · `tests/Cover.test.tsx`
- [FIXED] DRY drift · `scripts/resume-ingest.ts:159-163` déclarait `const THEMES = [...]` localement (11 valeurs) + `type Theme = typeof THEMES[number]` — duplication du `src/types/index.ts:29`. Même pattern de drift que ScrutinAnalyse (session 50). Si un thème est ajouté en src/types, resume-ingest le mapperait silencieusement vers "autre". Import depuis src/types maintenant ; suppression du bloc local. · `scripts/resume-ingest.ts`
- [FIXED] Browser history pollution · Cover.tsx wordmark Link self-link `<Link to="/" state={{ fromLogo: true }}>` poussait une entrée history à chaque click. Un user cliquant 3× sur le wordmark devait presser back 3× pour échapper la Cover. `replace` ajouté — la mutation state.fromLogo continue à trigger l'effect (visible refresh), mais sans polluer la back-stack. · `src/routes/Cover.tsx`

### Vérifications à faire en session 75

- [ ] `npm run test:run` → 127 tests verts (était 126)
- [ ] grep `const THEMES` dans `scripts/resume-ingest.ts` → 0 résultat (importé maintenant)
- [ ] Sur Cover, cliquer le wordmark 3× → DevTools Application > History : pas d'entrées supplémentaires accumulées

---

## Session 75 — 2026-05-17

### Vérification session 74

- [VERIFIED] `tests/Cover.test.tsx` contient 5 tests (incluant hasCompleted → /result)
- [VERIFIED] `scripts/resume-ingest.ts` n'a plus de `const THEMES` local — importe depuis `src/types`
- [VERIFIED] `src/routes/Cover.tsx` Wordmark Link a `replace`
- 127/127 tests verts, typecheck clean

### Bugs fixés (DRY drift + 2 docs/fixtures stale)

- [FIXED] `normalizeTheme` dupliqué · La fonction 4-line `normalizeTheme(v) → Theme | undefined` était implémentée à l'identique dans `scripts/ingest-an.ts:536` et `scripts/resume-ingest.ts:196`. Si on change la logique de fallback (ex: pour collapser vers "international" au lieu de "autre" sur certains hints), il faudrait éditer 2 endroits — drift garanti. Extracted dans `src/types/index.ts` à côté de THEMES + Theme (cohérent — c'est de la validation enum). Les 2 scripts importent maintenant. · `src/types/index.ts`, `scripts/ingest-an.ts`, `scripts/resume-ingest.ts`
- [FIXED] `supabase/functions/ingest-scrutins/README.md` stale corpus + filter · README disait "Solennel filter: scrutin.typeVote.codeTypeVote === 'SPS' (yields 46 entries as of 2026-05)" — pré-V2 P1. La règle V2 inclut SPS + SOR sur l'ensemble + motions + résolutions (~100 scrutins). Si la function edge est jamais réécrite, le dev utiliserait le mauvais filter. Reformulé "Eligibility filter" + pointeur vers `isEligibleScrutin` comme source canonical. · `supabase/functions/ingest-scrutins/README.md`
- [FIXED] `dev-fixtures.json pedago_relu: true` × 20 · Toutes les 20 dev fixtures claim `pedago_relu: true` (audited human-reviewed) mais c'est faux : (a) ce sont des données synthétiques sans audit humain, (b) CLAUDE.md schema doc dit "toujours false pour l'instant (V3 : audit humain)", (c) migration default = false, (d) ingest scripts force false. Drift sémantique. `sed` bulk replace true→false sur les 20. JSON valide. · `supabase/seed/dev-fixtures.json`

### Vérifications à faire en session 76

- [ ] grep `function normalizeTheme` dans `scripts/` → 0 résultat (importé maintenant)
- [ ] grep `SPS.*yields 46 entries` dans `supabase/functions/` → 0 résultat
- [ ] grep `"pedago_relu": true` dans `supabase/seed/` → 0 résultat
- [ ] `npm run test:run` → 127 tests verts (stable)

---

## Session 76 — 2026-05-17

### Vérification session 75

- [VERIFIED] `src/types/index.ts:40` exporte `normalizeTheme`; scripts l'importent (zéro `function normalizeTheme` local)
- [VERIFIED] `supabase/functions/ingest-scrutins/README.md` ne dit plus "yields 46 entries"
- [VERIFIED] `supabase/seed/dev-fixtures.json` : 0 occurrences `pedago_relu: true`
- 127/127 tests verts, typecheck clean

### Bugs fixés (Methode doc + tests pedago_relu drift + CLAUDE.md count)

- [FIXED] `Methode §02` énumération incomplète · "On garde les scrutins solennels (SPS), les votes finaux sur l'ensemble d'une loi (SOR), les motions de censure et les propositions de résolution" — manquait `motions référendaires` qui est dans `isEligibleScrutin` (scripts/ingest-an.ts:181, et CLAUDE.md "Filtre d'ingestion" le mentionne). User lisait Methode et pensait que les motions référendaires étaient exclues. Ajouté entre motions de censure et propositions de résolution. · `src/routes/Methode.tsx`
- [FIXED] Tests mocks `pedago_relu: true` drift · Session 75 a fixé les dev-fixtures à `pedago_relu: false` (consistent avec project state). Mais les test mocks (Card, deck, deck-invariants, matching, matching-edge-cases) restaient à `true`. Drift de l'invariant "toujours false pour l'instant". `sed` bulk replace true→false sur les 5 test files. · `tests/*.test.{ts,tsx}`
- [FIXED] CLAUDE.md test count drift · "~126 tests" — session 74 a ajouté 1 (Cover hasCompleted) → 127. Aligné. · `CLAUDE.md`

### Vérifications à faire en session 77

- [ ] grep `motions référendaires` dans `src/routes/Methode.tsx` → 1 résultat
- [ ] grep `pedago_relu: true` dans `tests/` → 0 résultat
- [ ] grep `~126 tests` dans `CLAUDE.md` → 0 résultat

---

## Session 77 — 2026-05-17

### Vérification session 76

- [VERIFIED] `Methode §02` énumère 5 catégories incluant "motions référendaires"
- [VERIFIED] Zéro `pedago_relu: true` dans `tests/`
- [VERIFIED] `CLAUDE.md` "~127 tests"
- 127/127 tests verts, typecheck clean

### Bugs fixés (test DRY drift + 2 plan docs obsolètes)

- [FIXED] `tests/Cover.test.tsx:49` hardcoded `i <= 20` · Le commentaire et l'`it()` description parlent de "TARGET" mais la boucle utilise le littéral 20. Si TARGET passe à 21 dans `types/index.ts`, le test enregistrerait 20 votes seulement → `votes >= TARGET=21` faux → pas de redirect vers /result → assertion échoue. Drift silencieux. Import `TARGET` + boucle `i <= TARGET`. · `tests/Cover.test.tsx`
- [FIXED] `docs/superpowers/plans/2026-05-09-sans-detour-v1.md` plan obsolète · 136 cases unchecked, 0 cochées — mais V1 a shippé en prod 2026-05-11 et toutes les features y sont. Le plan était une exploration design, pas un tracker. Un futur dev (humain ou Claude) qui lit ça pense que tout reste à faire. Banner "Status: SHIPPED (historical)" ajouté au-dessus, avec pointeurs vers CLAUDE.md et qa-audit-log pour l'état réel. · `docs/superpowers/plans/2026-05-09-sans-detour-v1.md`
- [FIXED] `docs/superpowers/plans/2026-05-16-transparence-a11y-tests.md` plan obsolète · Même problème pour le V2.5 plan : 6/115 cases cochées mais ~90% des features (chip IA, MethodeSheet, useFlipCardA11y, ErrorBoundary, Skeletons, 127 tests, Methode landmarks) sont live. Banner "Status: MOSTLY SHIPPED" ajouté avec pointeurs vers le state actuel. · `docs/superpowers/plans/2026-05-16-transparence-a11y-tests.md`

### Vérifications à faire en session 78

- [ ] Modifier temporairement `TARGET = 21` dans `types/index.ts` → `npm run test:run` doit toujours passer (Cover test utilise la constante maintenant)
- [ ] head des 2 plans dans docs/superpowers/plans/ → banner "SHIPPED" / "MOSTLY SHIPPED" visible

---

## Session 78 — 2026-05-17

### Vérification session 77

- [VERIFIED] `tests/Cover.test.tsx:52` utilise `i <= TARGET` (constante importée)
- [VERIFIED] V1 plan banner "Status: SHIPPED" + V2.5 plan banner "Status: MOSTLY SHIPPED"
- 127/127 tests verts, typecheck clean

### Bugs fixés (spec doc obsolete + 2 French plural agreement)

- [FIXED] `docs/superpowers/specs/2026-05-16-transparence-a11y-tests-design.md` plan-pair obsolete · La spec parente du plan V2.5 (session 77) avait elle aussi 18/0 cases cochées mais reflète des features mostly shipped. Future lecteur lirait une spec qui semble pas implémentée. Banner "Status: MOSTLY SHIPPED" ajouté, pointeurs vers plan + qa-log + CLAUDE.md pour l'état réel. · `docs/superpowers/specs/...`
- [FIXED] French plural mismatch `AuditTrail` · La chip breakdown disait "{N} divisé non comptés" — `divisé` singulier collé à `comptés` pluriel. Avec divided_excluded = 2, render "2 divisé non comptés" — grammaire cassée. Plural rule `!== 1 ? "s" : ""` appliquée aux deux adjectifs : "divisé/divisés" + "compté/comptés". · `src/components/AuditTrail.tsx`
- [FIXED] French plural mismatch `Result.tsx` header · "{total} scrutins · {top.counted} comptés · {skips} skip{s}" — `skip` avait déjà la règle (session 42), mais `scrutins` et `comptés` étaient hardcodés pluriels. Avec total = 1 (user qui a voté une fois), render "1 scrutins · 1 comptés" — faux. Plural rule appliquée aux 2 mots. · `src/routes/Result.tsx`

### Vérifications à faire en session 79

- [ ] DevTools localStorage : forcer une session à 1 seul vote sur un scrutin où top.counted = 1 → Result header dit "1 scrutin · 1 compté · 0 skips"
- [ ] AuditTrail breakdown chip avec divided_excluded = 1 → "1 divisé non compté" (singulier sur les 2 adjectifs)
- [ ] head de la spec V2.5 → banner "MOSTLY SHIPPED" visible

---

## Session 79 — 2026-05-17

### Vérification session 78

- [VERIFIED] V2.5 spec doc a banner "MOSTLY SHIPPED"
- [VERIFIED] `AuditTrail.tsx` `divided_excluded` plural rule appliquée sur `divisé/compté`
- [VERIFIED] `Result.tsx` header plural rule appliquée sur `scrutin/compté`
- 127/127 tests verts, typecheck clean

### Bugs fixés (sweep plural agreement + coverage gap)

- [FIXED] AuditTrail breakdown chips × 3 plural drift · Session 78 a fixé "{N} divisé non comptés" mais raté les 3 chips sibling juste au-dessus : "{N} alignés", "{N} partiels", "{N} opposés". Avec perfect=1 → "1 alignés" cassé. Plural rule appliquée aux 3 adjectifs (sweep complet maintenant). · `src/components/AuditTrail.tsx`
- [FIXED] Result.tsx "indexées" plural · `{personnalitesWithData.length} indexées` — avec 1 seule personality ayant `counted > 0` (rare mais possible : user vote 5x sur des scrutins où seul Le Pen a voté), render "1 indexées" — drift agreement. Plural rule appliquée. · `src/routes/Result.tsx`
- [FIXED] Coverage gap `normalizeTheme` · Session 75 a extracted `normalizeTheme` de scripts vers `src/types/index.ts` mais sans test. Si on refactor la fallback "autre" ou le case-folding, régression silencieuse — les 2 scripts ingest dépendent de cette fonction pour garder le DB propre des labels arbitraires. 5 tests ajoutés (`tests/themes.test.ts`) couvrant : non-string → undefined, valid theme → canonical, lowercase+trim, unknown → "autre", autre idempotent. · `tests/themes.test.ts` (nouveau)

### Vérifications à faire en session 80

- [ ] grep `partiels\b\|opposés\b\|alignés\b` dans `src/components/AuditTrail.tsx` → 0 résultat (singulier dans le code, plural ajouté via rule)
- [ ] grep `indexées\b` dans `src/routes/Result.tsx` → 0 résultat (singulier dans le code)
- [ ] `npm run test:run` → 132 tests verts (était 127)

---

## Session 80 — 2026-05-17

### Vérification session 79

- [VERIFIED] `AuditTrail.tsx` : aligné/partiel/opposé avec plural rule (sweep complet avec session 78)
- [VERIFIED] `Result.tsx` indexée plural rule
- [VERIFIED] `tests/themes.test.ts` existe, 5 cas
- 132/132 tests verts, typecheck clean

### Bugs fixés (3 count drifts + coverage gap)

- [FIXED] CLAUDE.md test count drift · "~127 tests" stale post session 79 (+5 themes.test.ts → 132). Coverage list ne mentionnait pas "themes". Aligné sur ~132 + "themes" ajouté entre `analytics` et `Card`. · `CLAUDE.md`
- [FIXED] User memory drifts · `MEMORY.md` + `project_sans-detour-v1-shipped.md` disaient "126 tests / 70 sessions / 210+ fixes" — sessions 71-79 ont ajouté 6 tests, 10 sessions, 30+ fixes. Aligné sur 132 / 80 / 240+. Coverage list inclut maintenant "themes". · `~/.claude/.../memory/{MEMORY.md, project_sans-detour-v1-shipped.md}` (hors repo)
- [FIXED] `tests/parties.test.ts` coverage gap · 3 tests seulement, contre 6 dans `tests/personnalites.test.ts` (pattern symétrique). Manquait : non-empty short label sur chaque entrée, colorVar unique cross-groups, getPartyColorVar wrap pattern. 3 tests ajoutés pour aligner les 2 registries sur le même niveau de coverage. · `tests/parties.test.ts`

### Vérifications à faire en session 81

- [ ] grep `~127 tests` dans `CLAUDE.md` → 0 résultat
- [ ] cat MEMORY.md → mentionne "132 tests"
- [ ] grep -c "it(" tests/parties.test.ts → 6 (était 3)

---

## Session 81 — 2026-05-17

### Vérification session 80

- [VERIFIED] `CLAUDE.md` "~132 tests" + "themes" dans coverage
- [VERIFIED] User memory "132 tests"
- [VERIFIED] `tests/parties.test.ts` 6 cas
- 135/135 tests verts, typecheck clean

### Bugs fixés (3 stale items)

- [FIXED] `SHIP-V1.md §1` "ne recharge pas les rows déjà à jour" stale post session 70 · L'ingere_le est maintenant stampé à chaque upsert (chaque row touchée même si autres colonnes inchangées). Le wording disait "ne recharge pas" — faux. Reformulé en "idempotent sur le contenu — chaque row est touchée pour rafraîchir `ingere_le`, mais les autres colonnes ne changent que si le LLM produit du contenu différent". · `SHIP-V1.md`
- [FIXED] Plural rule pattern drift · 2 patterns équivalents coexistaient : `=== 1 ? "" : "s"` (ancien, PartyRow + PersonnaliteRow) vs `!== 1 ? "s" : ""` (nouveau, sessions 42+, dans FreshnessBanner, AuditTrail, Cover, Result). Normalisé sur le nouveau pattern partout pour cohérence. · `src/components/PartyRow.tsx`, `src/components/PersonnaliteRow.tsx`
- [FIXED] `api/share-card.ts` 500 error sans Content-Type explicite · Le success path set `image/svg+xml`, mais le catch block return `new Response(body, { status: 500 })` sans Content-Type → défaut platform-dependant (octet-stream sur certains, text/html sur d'autres). Ajout explicite `Content-Type: text/plain; charset=utf-8` pour cohérence cross-platform et interprétation correcte par curl/scrapers. · `api/share-card.ts`

### Vérifications à faire en session 82

- [ ] grep `=== 1 ? ""` dans `src/components/` → 0 résultat (tout normalisé sur `!== 1 ? "s" : ""`)
- [ ] grep `ne recharge pas` dans `SHIP-V1.md` → 0 résultat
- [ ] curl -I `/api/share-card?t=invalid` retournant 500 → Content-Type: text/plain

---

## Session 82 — 2026-05-17

### Vérification session 81

- [VERIFIED] `grep '=== 1 ? ""' src/` → 0 résultat (plural pattern normalisé sur `!== 1 ? "s" : ""`)
- [VERIFIED] `grep "ne recharge pas" SHIP-V1.md` → 0 résultat (wording corrigé)
- [VERIFIED] `api/share-card.ts` 500 path a `Content-Type: text/plain; charset=utf-8` explicite
- 135/135 tests verts, typecheck clean

### Bugs fixés (script dedup + schema doc drift + dead prop)

- [FIXED] `scripts/ingest-an.ts` + `scripts/resume-ingest.ts` dupliquent 5 helpers · `Summary`, `asStringArray`, `normalizeAnalyse`, `normalizePointsCles`, `sanitizeJsonControlChars`, `fallbackSummary` étaient copiés byte-for-byte entre les 2 scripts (session 75 avait dedup `normalizeTheme` uniquement). Divergence risk déjà réalisé session 70 : un fix dans ingest-an a laissé silencieusement resume-ingest cassé sur `ingere_le`, il a fallu 2 commits pour rattraper. Extraction dans `scripts/lib/parse-summary.ts` (nouveau, ~85 lignes), les 2 scripts importent depuis là. La signature `normalizeAnalyse(unknown)` (resume-ingest) remplace `(Partial<ScrutinAnalyse>)` (ingest-an) — plus défensive, équivalente en sortie. · `scripts/lib/parse-summary.ts` (nouveau), `scripts/ingest-an.ts`, `scripts/resume-ingest.ts`
- [FIXED] `CLAUDE.md` schema table manque `ingere_le` · La colonne existe depuis migration 0001 (`ingere_le timestamptz not null default now()`), est stampée explicitement à chaque upsert par les 4 scripts (ingest-an, resume-ingest, ingest-personnalites, seed-supabase — cf. sessions 70+72), et est lue par `FreshnessBanner` pour afficher la fraîcheur. Mais le tableau Schema Supabase listait 17 colonnes sans elle → un futur lecteur (humain ou Claude) se demande d'où vient ce timestamp. Row ajoutée avec note sur le pattern stamp-explicite (le default ne fire qu'à l'INSERT). · `CLAUDE.md`
- [FIXED] `Wordmark.tsx` prop `className` morte · La prop était déclarée dans `WordmarkProps` et destructurée (`className = ""`), composée dans le template (`'sd-wordmark ${className}'`), mais aucun des 4 call sites (TopBar, Cover, Legal, Methode) ne la passe. Dead API surface depuis le début. Drop : prop retirée du type, destructuring simplifié, className figé sur `"sd-wordmark"`. · `src/components/Wordmark.tsx`

### Vérifications à faire en session 83

- [ ] `ls scripts/lib/` → `parse-summary.ts` présent
- [ ] grep `^function (asStringArray|normalizeAnalyse|fallbackSummary|sanitizeJsonControlChars)` scripts/ingest-an.ts scripts/resume-ingest.ts → 0 résultat (toutes import depuis lib)
- [ ] grep `ingere_le` CLAUDE.md → row présente dans tableau Schema
- [ ] grep `className\?` src/components/Wordmark.tsx → 0 résultat (prop morte retirée)

---

## Session 83 — 2026-05-17

### Vérification session 82

- [VERIFIED] `scripts/lib/parse-summary.ts` présent, 5 helpers exportés
- [VERIFIED] grep des `function asStringArray|normalizeAnalyse|fallbackSummary|sanitizeJsonControlChars|normalizePointsCles` dans les 2 scripts → 0 résultat (tout déplacé)
- [VERIFIED] `CLAUDE.md` ligne 61 : row `ingere_le` ajoutée au tableau Schema
- [VERIFIED] `src/components/Wordmark.tsx` : prop `className?` retirée, `className="sd-wordmark"` literal
- 135/135 tests verts (avant les fixes de cette session), typecheck clean

### Bugs fixés (plural drift + dateparse crash + missing Content-Type)

- [FIXED] `FreshnessBanner.tsx:68` plural "scrutins" hardcoded · Le compteur disait `{total_scrutins} scrutins` — avec une Supabase fraîchement seedée à 1 row, render "1 scrutins · MAJ aujourd'hui · sync imminente" — drift agreement, même pattern que sessions 78-81 sur d'autres composants. Application de la règle `!== 1 ? "s" : ""` + test ajouté (`tests/FreshnessBanner.test.tsx` "singularises 'scrutin' when total_scrutins is 1"). · `src/components/FreshnessBanner.tsx`, `tests/FreshnessBanner.test.tsx`
- [FIXED] `src/lib/scrutins.ts:54` crash sur `ingere_le` malformé · `new Date(new Date(lastSync).getTime() + 7 * 86400_000).toISOString()` — si `ingere_le` est invalide (manuellement édité côté DB), `new Date("garbage").getTime()` = NaN, puis `new Date(NaN).toISOString()` THROW RangeError "Invalid time value". `fetchFreshness` rejette → Cover n'affiche jamais le banner même si toutes les autres données sont propres. Guard ajouté : si `lastSyncMs` est NaN, fallback `Date.now()` pour le calcul de `next_sync_eta`. FreshnessBanner défend déjà l'affichage côté display (session 76, `diffDays`/`pastDays` retournent 0 sur NaN). · `src/lib/scrutins.ts`
- [FIXED] `api/share-card.ts:56` 400 path sans Content-Type explicite · Session 81 a fixé la 500 path pour mêmes raisons (cohérence cross-platform, octet-stream sur certains hosts, text/html sur d'autres). Le sibling 400 ("Missing t param") avait le même defect — un client qui tape `/api/share-card.svg` sans `?t=` reçoit une 400 dont le Content-Type dépend de la platform. Ajout explicite `text/plain; charset=utf-8`. · `api/share-card.ts`

### Vérifications à faire en session 84

- [ ] DevTools : forcer `total_scrutins = 1` dans `FreshnessBanner` props → render "1 scrutin · …" (sans "s")
- [ ] DevTools : mocker `fetchFreshness` avec `lastSyncRes.data[0].ingere_le = "garbage"` → no throw, banner affiche "MAJ aujourd'hui" + "prochaine sync dans 7 jours"
- [ ] `curl -i /api/share-card.svg` (sans `?t=`) → 400 + `Content-Type: text/plain; charset=utf-8`
- [ ] grep `~132 tests` CLAUDE.md → 0 résultat (aligné sur ~136)

---

## Session 84 — 2026-05-17

### Vérification session 83

- [VERIFIED] `FreshnessBanner.tsx:68` plural rule appliquée — `scrutin{!== 1 ? "s" : ""}`
- [VERIFIED] `src/lib/scrutins.ts` : guard isNaN sur lastSyncMs + fallback Date.now()
- [VERIFIED] `api/share-card.ts` : 400 path a `Content-Type: text/plain; charset=utf-8` explicite
- [VERIFIED] CLAUDE.md ligne 191 : "~136 tests" (drift résolue)
- 136/136 tests verts, typecheck clean

### Bugs fixés (implicit global + missing clamp + plural drift)

- [FIXED] `Result.tsx:149` ambiguous `location.origin` access · `const shareUrl = location.origin` — `location` n'est jamais importé. Au runtime, JS résout vers le global `window.location.origin` (les browser globals sont implicites sur le scope). Mais c'est fragile : un futur refactor qui ajoute `const location = useLocation()` (react-router) changerait silencieusement le sens — l'objet location de react-router n'a PAS de `.origin`, donc shareUrl deviendrait `undefined`, et `navigator.share({url: undefined})` échouerait sans message clair. Préfixé explicitement `window.location.origin` pour fixer la lecture. · `src/routes/Result.tsx`
- [FIXED] `api/share-card.ts` `parseTopParam` sans clamp · `parseInt(pctStr, 10)` accepte n'importe quel entier — un URL malformé `?t=RN:-50,LFI:200` rendait des barres "-50%" et "200%" sur la share card. Les vrais pcts viennent de `Math.round((sum / counted) * 100)` ∈ [0, 100]. Clamp ajouté `Math.max(0, Math.min(100, pct))` au moment de la map. NaN reste NaN à travers Math.min/max (propagation NaN), donc le filter `!isNaN(b.pct)` continue d'exclure les pcts invalides. · `api/share-card.ts`
- [FIXED] `RankingOverlay.tsx:118` "comptés" hardcoded plural · Le chip header disait `Classement partiel · {countedTotal} comptés` — avec un user qui a 1 seul vote comparable (rare mais possible quand 4 votes/5 sont sur des scrutins où le groupe est divisé), render "1 comptés" — drift agreement. Même pattern que sessions 78-83. Plural rule `!== 1 ? "s" : ""` appliquée. · `src/components/RankingOverlay.tsx`

### Vérifications à faire en session 85

- [ ] grep `\blocation\.origin\b` src/routes/Result.tsx → 1 résultat (avec `window.` préfixe)
- [ ] curl `/api/share-card.svg?t=RN:-50,LFI:200` → SVG avec "0%" et "100%" rendus (pcts clampés), pas "-50%" / "200%"
- [ ] grep `comptés\b` src/components/RankingOverlay.tsx → 0 résultat (singulier ou avec plural rule, jamais hardcoded)

---

## Session 85 — 2026-05-17

### Vérification session 84

- [VERIFIED] `src/routes/Result.tsx:155` : `window.location.origin` (préfixé explicitement)
- [VERIFIED] `api/share-card.ts:24` : `Math.max(0, Math.min(100, pct))` clamp en place
- [VERIFIED] `src/components/RankingOverlay.tsx:118` : `compté{countedTotal !== 1 ? "s" : ""}` plural rule
- 136/136 tests verts (avant les fixes de cette session), typecheck clean

### Bugs fixés (skeleton layout shift + test coverage gap + empty-string filter)

- [FIXED] `ResultSkeleton.tsx:18` hardcoded `length: 6` rows · Le squelette de chargement de /result rendait 6 placeholder rows alors que `Result.tsx` ligne 212 fait `ranked.map()` sur tous les `GROUP_CODES` (11). Lors du remplissage, 5 nouvelles rows apparaissaient et poussaient les boutons "Refaire", "Partager", "Continuer à affiner" ~250px vers le bas — CLS visible. Aligné sur `GROUP_CODES.length` (11) pour que le skeleton occupe la même hauteur que le rendu final. · `src/components/ResultSkeleton.tsx`
- [FIXED] `tests/session.test.ts` coverage gap symétrique · Le bloc "localStorage throw defenses" testait 3 chemins (loadSession getItem, hasSeenCover getItem, resetSession removeItem) mais pas les 3 siblings : `saveSession` (setItem, Safari private mode quota=0), `markCoverSeen` (setItem), `forgetCover` (removeItem). Sans tests, supprimer le try/catch dans n'importe lequel de ces 3 wrappers slipperait silencieusement par CI — même risk class que la session 46 (la première à attraper ce throw défense). Ajout de 3 tests symétriques + mock `Storage.prototype.setItem`. · `tests/session.test.ts`
- [FIXED] `scripts/lib/parse-summary.ts` `asStringArray` ne filtrait pas les chaînes vides · Si le LLM émet `mesures_principales: [""]` ou `["mesure 1", "  ", "mesure 2"]` (rare mais observé sur Haiku 4.5 quand un sous-thème ne s'applique pas), Card.tsx ColoredSection rendait un `<li>` vide ou whitespace-only. `normalizePointsCles` (siblng dans le même fichier) filtre déjà `.filter((s) => s.length > 0)` après `trim()` — alignement des 2 helpers pour cohérence. Bloque aussi les chaînes whitespace-only via le double filter `trim()` + `length > 0`. · `scripts/lib/parse-summary.ts`

### Vérifications à faire en session 86

- [ ] grep `length: 6` src/components/ResultSkeleton.tsx → 0 résultat
- [ ] grep `length: GROUP_CODES.length` src/components/ResultSkeleton.tsx → 1 résultat
- [ ] grep -c "it(" tests/session.test.ts → 14 (était 11)
- [ ] grep `~136 tests` CLAUDE.md → 0 résultat (aligné sur ~139)
- [ ] DevTools : injecter scrutin avec `analyse_loi.mesures_principales = [""]` → Card verso n'affiche pas la section "Mesures" (length filtered to 0)

---

## Session 86 — 2026-05-17

### Vérification session 85

- [VERIFIED] `src/components/ResultSkeleton.tsx` : `length: GROUP_CODES.length` (anchored sur 11)
- [VERIFIED] `tests/session.test.ts` : 17 `it()` total (était 14, +3 throw defense tests)
- [VERIFIED] `scripts/lib/parse-summary.ts` `asStringArray` : 2 `.filter((s) => s.length > 0)` (lignes 27 + 50)
- [VERIFIED] CLAUDE.md ligne 191 : "~139 tests"
- 139/139 tests verts, typecheck clean

### Bugs fixés (plural defensive + script env consistency + doc drift)

- [FIXED] `PersonnaliteRow.tsx:20` aria-label hardcoded "votes" plural · Le label SR disait `${alignment.pct} % d'alignement sur ${alignment.counted} votes` — pluriel hardcodé. Bug défensif : avec `LOW_DATA_THRESHOLD = 3` actuel, ce branche n'est atteinte que si `counted >= 3` (toujours pluriel correct), mais si un futur PR baisse le seuil (LOW_DATA_THRESHOLD=1 pour exposer les votes ultra-rares), `counted === 1` rendrait "1 votes" — agreement cassé. Application de la règle `vote${counted !== 1 ? "s" : ""}` pour cohérence avec les 6 autres occurrences déjà fixées sessions 78-84. · `src/components/PersonnaliteRow.tsx`
- [FIXED] `scripts/seed-supabase.ts` env handling inconsistent · 4 scripts ingest dans `scripts/` ; 3 utilisent `const SUPABASE_URL = process.env.SUPABASE_URL;` (typage honnête `string | undefined`, narrowed après la garde), mais `seed-supabase.ts` utilisait `const url = process.env.SUPABASE_URL!;` (non-null assertion misleading + lowercase identifier). Alignement sur la convention SHOUTY_CASE + sans `!` pour cohérence cross-scripts (un dev qui copie-colle entre scripts ne devrait pas avoir à choisir entre 2 patterns). · `scripts/seed-supabase.ts`
- [FIXED] `src/types/index.ts:103` commentaire "4-axis breakdown" stale · Le commentaire datait du design original pre-V1 (4 sections : mesures + concernés [3] = 4 axes). La structure actuelle (migration 0003 + interface `ScrutinAnalyse` ligne 144-151) a 6 listes : mesures_principales, concernes_positifs/negatifs/neutres, calendrier, exceptions. CLAUDE.md ligne 52 dit "6 listes" (correct), 0003.sql dit "Six string[]" (correct) — types/index.ts:103 était l'outlier. Comment réécrit avec énumération explicite des 6 listes. · `src/types/index.ts`

### Vérifications à faire en session 87

- [ ] grep `${alignment.counted} votes\b` src/components/PersonnaliteRow.tsx → 0 résultat (toutes les occurrences passent par la règle plural)
- [ ] grep `process.env.SUPABASE_URL!` scripts/ → 0 résultat (les 4 scripts utilisent la même forme sans `!`)
- [ ] grep `4-axis breakdown` src/types/index.ts → 0 résultat (remplacé par "6-list breakdown")

---

## Session 87 — 2026-05-17

### Vérification session 86

- [VERIFIED] `src/components/PersonnaliteRow.tsx` : 3 occurrences avec règle plural `vote${counted !== 1 ? "s" : ""}` (lignes 19, 20, 59) ; aucune hardcoded "votes"
- [VERIFIED] `scripts/` : 4 scripts utilisent `const SUPABASE_URL = process.env.SUPABASE_URL;` (sans `!`) — pattern uniforme
- [VERIFIED] `src/types/index.ts:103` : "structured 6-list breakdown" avec énumération explicite des 6 listes
- 139/139 tests verts, typecheck clean

### Bugs fixés (no-confirm data loss + zero test coverage + invalid aria-controls)

- [FIXED] `Result.tsx refaire()` data loss sans confirmation · Le bouton "Refaire depuis le début" (tertiaire, en bas de Result) appelait `resetSession() + forgetCover() + navigate("/")` directement, sans `window.confirm()`. Un tap accidentel après 20 votes effaçait toute la session + forçait le retour à Cover. Cover.tsx restart() a déjà ce guard pour le cas in-progress (sessions 1-19 votes) — ajout du guard symétrique pour le cas completed (20 votes + résultat). Message confirm utilise `total` + règle plural sur "vote". · `src/routes/Result.tsx`
- [FIXED] `scripts/lib/parse-summary.ts` zero test coverage · Les 5 helpers (asStringArray, normalizeAnalyse, normalizePointsCles, sanitizeJsonControlChars, fallbackSummary) sont critiques : utilisés par les 2 scripts ingest pour parser les sorties LLM avant upsert Supabase. Une régression silencieuse (loosening du filter empty-strings session 85, retrait de la propagation NaN session 84) slipperait par CI. Fichier `tests/parse-summary.test.ts` ajouté avec 24 tests couvrant : array vs non-array, empty filter, trim, 6-list normalization, points_cles cap-à-3 + ellipsis-à-7-mots, control char escape (newline/tab/CR/u0001), fallback chapeau/titre/contexte. · `tests/parse-summary.test.ts` (nouveau)
- [FIXED] `PartyRow.tsx` aria-controls vers DOM inexistant · `aria-controls={interactive ? controlsId : undefined}` set l'attribut DÈS que la row est interactive, même quand `expanded = false`. Mais le panel AuditTrail (id={panelId}) n'est rendu dans `Result.tsx` que sous condition `expandedGroup === a.group`. Donc aria-controls pointait vers un id absent du DOM 90% du temps. Per WAI-ARIA c'est undefined behavior (browsers tolèrent, mais devtools/SR peuvent warning). Fix : conditionner sur `interactive && expanded`. Quand collapsed, aria-expanded suffit ; quand expanded, aria-controls renvoie vers le panel qui existe alors. · `src/components/PartyRow.tsx`

### Vérifications à faire en session 88

- [ ] DevTools : tap sur "Refaire depuis le début" → confirm dialog "Tes 20 votes et ton résultat seront perdus." ; cancel → reste sur Result, vote intact ; OK → retour Cover propre
- [ ] grep -c "it(" tests/parse-summary.test.ts → 24
- [ ] grep `~139 tests` CLAUDE.md → 0 résultat (aligné sur ~163)
- [ ] DevTools : sur Result, inspect une PartyRow collapsée → pas d'`aria-controls` ; tap pour expand → `aria-controls="audit-trail-XXX"` apparaît, et l'AuditTrail panel existe bien avec cet id

---

## Session 88 — 2026-05-17

### Vérification session 87

- [VERIFIED] `Result.tsx:140-141` : `window.confirm()` avec plural rule sur "vote" pour `refaire()`
- [VERIFIED] `tests/parse-summary.test.ts` : 24 `it()` tests
- [VERIFIED] `src/components/PartyRow.tsx:40` : `aria-controls={interactive && expanded ? controlsId : undefined}`
- [VERIFIED] CLAUDE.md ligne 191 : "~163 tests"
- 163/163 tests verts, typecheck clean

### Bugs fixés (test coverage gap + npm script consistency + analytics double-fire)

- [FIXED] `tests/FreshnessBanner.test.tsx` missing symmetric test pour next_sync_eta malformé · Session 83 a ajouté un test pour `last_sync_at` malformé (validating `pastDays` returns 0 sur NaN). Mais le sibling `next_sync_eta` (via `diffDays`, même guard NaN) était untested. Si un futur refactor retire le `isNaN()` dans `diffDays`, la régression slipperait. Test symétrique ajouté pour `next_sync_eta = "not-a-date"` → expect "sync imminente" (diffDays → 0 → promotion). · `tests/FreshnessBanner.test.tsx`
- [FIXED] `package.json` aliases manquants pour 2/5 scripts · `seed`, `ingest:an`, `debug:batch` ont des aliases npm ; `resume-ingest` et `ingest-personnalites` n'en avaient pas, documentés en `npx tsx scripts/...` dans CLAUDE.md. Inconsistance dev-experience : un dev qui copie-colle une commande entre scripts a 2 patterns à mémoriser. Aliases ajoutés (`ingest:resume`, `ingest:personnalites`) + CLAUDE.md mis à jour vers la forme npm run. · `package.json`, `CLAUDE.md`
- [FIXED] `Play.tsx handleVote` fire analytics + side effects sur double-tap · `recordVote` était idempotent (guard à session.ts:78 sur `cards_seen.includes`) MAIS retournait void — donc `handleVote` continuait à fire `track("vote")`, `setLastVoteLabel` (re-announce), et `setDeck(deck.slice(1))` même sur un double-tap où aucun nouveau vote n'a été enregistré. Refactor : `recordVote` retourne `boolean` (true = nouveau, false = doublon). `handleVote` gate le reste sur la return value. Effets : pas de double-track, pas de re-announce aria-live, pas de re-trigger des side effects de deck advance. Test ajouté pour le retour bool. · `src/lib/session.ts`, `src/routes/Play.tsx`, `tests/session.test.ts`

### Vérifications à faire en session 89

- [ ] grep -c "it(" tests/FreshnessBanner.test.tsx → 10 (était 9)
- [ ] grep `ingest:resume\|ingest:personnalites` package.json → 2 résultats
- [ ] grep `npx tsx scripts/resume-ingest\|npx tsx scripts/ingest-personnalites` CLAUDE.md → 0 résultat (remplacé par `npm run ingest:*`)
- [ ] grep `recordVote.*boolean\|recordVote.*: boolean` src/lib/session.ts → 1 résultat (signature avec return type)

---

## Session 89 — 2026-05-17

### Vérification session 88

- [VERIFIED] `tests/FreshnessBanner.test.tsx` : 10 `it()` (test symétrique malformed `next_sync_eta` ajouté)
- [VERIFIED] `package.json` : `ingest:resume` + `ingest:personnalites` aliases présents
- [VERIFIED] `CLAUDE.md` : `npm run ingest:resume` + `npm run ingest:personnalites` (plus de `npx tsx`)
- [VERIFIED] `src/lib/session.ts` : `recordVote(...): boolean` signature avec return type
- 165/165 tests verts, typecheck clean

### Bugs fixés (StrictMode dup-fetch + analytics gap + zero coverage)

- [FIXED] `Methode.tsx fetchFreshness` no `fetchedRef` dedup · Cover.tsx a un `fetchedRef = useRef(false)` qui gate fetchFreshness pour éviter les double-fires en React StrictMode dev (et les re-fires sur location.state changes). Methode.tsx n'avait pas le même pattern — son useEffect avec deps `[]` fire 2x en StrictMode dev → 2 Supabase round-trips par mount. Cosmétique en prod (effet fire une fois), mais inconsistance. Ajout du même pattern : `fetchedRef.current = true` set uniquement on success (sans cleanup of failure path, comme Cover). · `src/routes/Methode.tsx`
- [FIXED] `Result.tsx refaire()` missing track call · Cover.tsx `restart()` fire `track("cover_restarted")` après le confirm. Mais Result.tsx `refaire()` (action analogue : reset + forgot cover + navigate) ne firait AUCUN analytics event. Une asymétrie de tracking — les utilisateurs qui font le restart depuis Result étaient invisibles dans Plausible. Ajout de `track("result_refaire")` AFTER le confirm (avant le reset, comme Cover). · `src/routes/Result.tsx`
- [FIXED] `ChipTop1.tsx` zero test coverage · Composant petit (24 lignes) mais critique : c'est le seul affordance visuel pour ouvrir RankingOverlay sur /play, et il render le top-1 group + pct live. Aucun test = une régression sur l'aria-label (utilisée par SR), le type="button" (form submission risk), ou le label/pct render slipperait. Ajout de `tests/ChipTop1.test.tsx` avec 4 tests : render label+pct, onTap callback, aria-label include full party name + pct, type="button". · `tests/ChipTop1.test.tsx` (nouveau)

### Vérifications à faire en session 90

- [ ] grep `fetchedRef` src/routes/Methode.tsx → 3 résultats (déclaration + check + set on success)
- [ ] grep `track("result_refaire")` src/routes/Result.tsx → 1 résultat
- [ ] `ls tests/ChipTop1.test.tsx` → présent, 4 tests
- [ ] grep `~165 tests` CLAUDE.md → 0 résultat (aligné sur ~169)

---

## Session 90 — 2026-05-17

### Vérification session 89

- [VERIFIED] `src/routes/Methode.tsx` : 4 occurrences `fetchedRef` (decl + check + set + branch return)
- [VERIFIED] `src/routes/Result.tsx:148` : `track("result_refaire")` après le confirm
- [VERIFIED] `tests/ChipTop1.test.tsx` présent
- [VERIFIED] CLAUDE.md "~169 tests"
- 169/169 tests verts, typecheck clean

### Bugs fixés (typecheck gap exposes latent bug + doc drift + DRY)

- [FIXED] `tsconfig.node.json` n'incluait pas `scripts/` ni `api/` · Le tsconfig.node.json ne couvrait que `vite.config.ts`. Donc les 5 scripts dans `scripts/` (ingest-an, resume-ingest, ingest-personnalites, seed-supabase, debug-batch) + `api/share-card.ts` n'étaient pas typechecked par `tsc -b`. Seul `scripts/lib/parse-summary.ts` était couvert (via import depuis tests/). Extension du `include` à `["vite.config.ts", "scripts/**/*.ts", "api/**/*.ts"]` a immédiatement exposé un bug latent : `scripts/ingest-an.ts:153` référençait `Theme` sans l'importer (régression silencieuse de session 82 quand `Theme` a été retiré du import block dans le dedup). Ajout de `Theme` au type import — `tsc -b` passe maintenant. · `tsconfig.node.json`, `scripts/ingest-an.ts`
- [FIXED] `scripts/seed-supabase.ts` missing file header doc · Les 5 autres scripts (ingest-an, resume-ingest, ingest-personnalites, debug-batch, lib/parse-summary) ont tous un header `// scripts/X.ts\n//\n// Description...\n//\n// Usage:...`. seed-supabase.ts sautait directement aux imports — inconsistance ; un dev qui découvre `scripts/` ne sait pas ce que fait seed sans lire le code. Ajout du header avec description (dev fixture seed), usage (`npm run seed`), et note sur ingere_le stamp pattern. · `scripts/seed-supabase.ts`
- [FIXED] `{ fromLogo: true }` literal dupliqué 4 sites · TopBar.tsx:63, Cover.tsx:115, Legal.tsx:20, Methode.tsx:60 utilisaient tous le même literal `state={{ fromLogo: true }}`. Cover.tsx:24 lisait via cast inline `(location.state as { fromLogo?: boolean } | null)`. 5 sites couplés au même contrat de shape — un refactor du nom du field ("fromLogo" → "fromHome") forcerait 5 edits. Extraction dans `src/lib/nav-state.ts` : `FROM_LOGO_STATE` const + `LocationStateFromLogo` type. 4 sites set use la const, 1 site read use le type — single source of truth. · `src/lib/nav-state.ts` (nouveau), `src/components/TopBar.tsx`, `src/routes/Cover.tsx`, `src/routes/Legal.tsx`, `src/routes/Methode.tsx`

### Vérifications à faire en session 91

- [ ] `npx tsc -b` propre (scripts/ + api/ maintenant typechecked)
- [ ] grep `^// scripts/seed-supabase.ts` scripts/seed-supabase.ts → 1 résultat (header présent)
- [ ] grep `{ fromLogo: true }` src/ → 0 résultat (literal retiré, remplacé par FROM_LOGO_STATE)
- [ ] grep `FROM_LOGO_STATE` src/ → ≥5 résultats (4 sets + 1 def)

---

## Session 91 — 2026-05-17

### Vérification session 90

- [VERIFIED] `npx tsc -b` clean
- [VERIFIED] `scripts/seed-supabase.ts` ligne 1 : `// scripts/seed-supabase.ts` header
- [VERIFIED] `{ fromLogo: true }` literal seulement dans `src/lib/nav-state.ts` (const def + comment)
- [VERIFIED] 10 résultats `FROM_LOGO_STATE` (def + type + 4 sets + 4 imports)
- 169/169 tests verts, typecheck clean

### Bugs fixés (doc drift + spec recommendation + DRY)

- [FIXED] `scripts/ingest-an.ts` INGEST_LIMIT comment dérive · Le commentaire disait `Drops to "all" when unset or invalid`. Mais le code `limit = limitRaw ? Math.max(1, parseInt(limitRaw, 10) || 0) : undefined` fait : unset → undefined (= "all"), MAIS invalid → Math.max(1, NaN||0) = 1 (pas "all"). Le code's behavior est la fail-safe correcte (un typo `INGEST_LIMIT=abcd` ne devrait PAS lancer le full batch et brûler $0.30 silencieusement). Donc le doc est faux, pas le code. Re-écriture du commentaire pour expliciter : unset → all, set+invalid → 1 (safer interpretation of typo). · `scripts/ingest-an.ts`
- [FIXED] `public/manifest.webmanifest` icons sans `purpose: "any"` explicite · Spec PWA recommande l'attribut purpose sur chaque icon ; quand omis, default vaut "any" mais certains validators/installers (PWABuilder, Lighthouse PWA audit) signalent warning. Les 2 icons non-maskable (icon-192, icon-512) avaient purpose implicit ; le 3e (maskable-512) l'avait explicit. Maintenant les 3 ont purpose explicit. · `public/manifest.webmanifest`
- [FIXED] `mailto:contact@sansdetour.fr` literal dupliqué 7 sites · ErrorBoundary, TopBar, Cover footer, Legal éditeur, Methode §06 + §07, MethodeSheet — 7 références hardcodées au même email. Un changement d'adresse (ou switch vers contact form un jour) forcerait 7 edits. MethodeSheet en plus avait le subject pre-rempli `%20%C3%A9...` (URL-encoded à la main) — fragile et illisible. Extraction dans `src/lib/contact.ts` : `CONTACT_EMAIL` const + helper `mailto(subject?)` qui gère l'encodeURIComponent du subject. 7 sites migrés vers `mailto()` ou `mailto("subject text")`. · `src/lib/contact.ts` (nouveau), 6 fichiers modifiés

### Vérifications à faire en session 92

- [ ] grep `unset or invalid` scripts/ingest-an.ts → 0 résultat (wording corrigé)
- [ ] grep `purpose` public/manifest.webmanifest → 3 résultats (1 par icon)
- [ ] grep `mailto:contact@sansdetour.fr` src/ → 0 résultat (literal éliminé)
- [ ] grep `mailto(` src/ → ≥7 résultats (1 def + 1 helper + 6+ call sites)

---

## Session 92 — 2026-05-17

### Vérification session 91

- [VERIFIED] `grep "unset or invalid" scripts/ingest-an.ts` → 0 résultat (commentaire réécrit)
- [VERIFIED] `grep -c purpose public/manifest.webmanifest` → 3 résultats
- [VERIFIED] `grep "mailto:contact@sansdetour" src/` → 0 résultat (sauf doc dans contact.ts)
- [VERIFIED] 8 occurrences `mailto(` dans src/ (def + 7 sites)
- 169/169 tests verts, typecheck clean

### Bugs fixés (citation strip dedup + 3 new lib test files)

- [FIXED] `AuditTrail.tsx extractConcrete` strip citations moins robuste que `Card.tsx stripCitations` · Card avait 4 passes (wrapped tag strip, orphan tag strip, whitespace collapse, trim) ; AuditTrail avait 2 (wrapped + orphan) puis se contentait du trim sentence-level. Donc une LLM output avec un `<cite ...>` orphelin (cut mid-token) leakerait des tags dans le bullet AuditTrail. Extraction dans `src/lib/text-cleanup.ts` : `stripCitations`, `stripVoteResult`, `stripBoldMarkers`. Card.tsx + AuditTrail.tsx importent tous depuis là — lockstep behavior. · `src/lib/text-cleanup.ts` (nouveau), `src/components/Card.tsx`, `src/components/AuditTrail.tsx`
- [FIXED] `src/lib/contact.ts` (session 91) zero test coverage · Le `mailto(subject?)` helper fait `encodeURIComponent(subject)` — une régression silencieuse (e.g. quelqu'un qui retire l'encoding) ferait que les subjects avec accents français (`Sans Détour — …`) génèrent des URLs cassées sur Gmail/Safari. 6 tests ajoutés (bare mailto, simple subject, spaces, French accents + em dash, special chars `& : =`, canonical address match). · `tests/contact.test.ts` (nouveau)
- [FIXED] `src/lib/nav-state.ts` (session 90) zero test coverage · `FROM_LOGO_STATE` est lu via cast `as LocationStateFromLogo` dans Cover. Le test pin la shape (fromLogo: true), la compatibilité const ↔ read type (sans cast), et la stable-identity (même reference cross-render — requis pour la stabilité des deps `useEffect([location.state])`). + 9 tests dans `tests/text-cleanup.test.ts` pour stripCitations / stripVoteResult / stripBoldMarkers (orphan tag, false-positive prevention, unbalanced markers). · `tests/nav-state.test.ts` (nouveau), `tests/text-cleanup.test.ts` (nouveau)

### Vérifications à faire en session 93

- [ ] `ls src/lib/text-cleanup.ts` → présent ; 3 exports (stripCitations, stripVoteResult, stripBoldMarkers)
- [ ] grep `stripCitations\|stripVoteResult\|stripBoldMarkers` src/components/ → uniquement les imports depuis text-cleanup, aucun inline copy
- [ ] `ls tests/contact.test.ts tests/nav-state.test.ts tests/text-cleanup.test.ts` → 3 fichiers présents
- [ ] grep `~169 tests` CLAUDE.md → 0 résultat (aligné sur ~193)

---

## Session 93 — 2026-05-17

### Vérification session 92

- [VERIFIED] `src/lib/text-cleanup.ts` présent avec 3 exports (stripCitations, stripVoteResult, stripBoldMarkers)
- [VERIFIED] `src/components/{Card,AuditTrail}.tsx` importent depuis `../lib/text-cleanup` ; aucune copie inline
- [VERIFIED] 3 nouveaux test files présents
- [VERIFIED] CLAUDE.md "~193 tests"
- 193/193 tests verts, typecheck clean

### Bugs fixés (3 a11y patterns invariants — aria-haspopup + aria-controls)

- [FIXED] `ChipTop1` button manquait `aria-haspopup="dialog"` · Le chip ouvre `RankingOverlay` (`role="dialog" aria-modal="true"`). Sans aria-haspopup, les SR users ne savent pas qu'une popup va s'ouvrir avant qu'ils n'activent. TopBar `MenuTrigger` a déjà `aria-haspopup="menu"` — applique le même pattern aux 2 autres triggers modaux. · `src/components/ChipTop1.tsx`, `tests/ChipTop1.test.tsx`
- [FIXED] `Card.tsx` ✨IA chip manquait `aria-haspopup="dialog"` · Le chip ouvre `MethodeSheet` (`role="dialog" aria-modal="true"`). Même defect que ChipTop1. Ajout de l'attribut + test dans `tests/Card.test.tsx`. · `src/components/Card.tsx`, `tests/Card.test.tsx`
- [FIXED] `Result.tsx` "Voir les personnalités" toggle aria-controls vers DOM inexistant · Le bouton avait `aria-controls="personnalites-panel"` toujours set, mais le panel `<div id="personnalites-panel">` n'est rendu que sous condition `showPersonnalites === true` (line 273). Quand collapsed, aria-controls pointait vers un id absent du DOM — même defect que session 87 a fixé sur PartyRow. Conditionner sur `showPersonnalites ? "personnalites-panel" : undefined`. · `src/routes/Result.tsx`

### Vérifications à faire en session 94

- [ ] grep `aria-haspopup` src/components/ src/routes/ → 3 résultats (TopBar trigger + ChipTop1 + Card IA chip, tous 3 valides)
- [ ] grep `aria-controls.*personnalites-panel` src/routes/Result.tsx → 1 résultat (conditionnel sur showPersonnalites)
- [ ] grep -c "it(" tests/ChipTop1.test.tsx → 5 (était 4)
- [ ] grep -c "it(" tests/Card.test.tsx → 19 (était 18)

---

## Session 94 — 2026-05-17

### Vérification session 93

- [VERIFIED] 3 `aria-haspopup` dans src/components/ (TopBar `menu`, ChipTop1 `dialog`, Card IA chip `dialog`)
- [VERIFIED] `Result.tsx:268` aria-controls conditionnel sur showPersonnalites
- [VERIFIED] tests/ChipTop1.test.tsx 5 `it()`, tests/Card.test.tsx 19 `it()`
- 195/195 tests verts, typecheck clean

### Bugs fixés (drift-risk extraction + 18 test cases + doc realign)

- [FIXED] `isEligibleScrutin` dupliqué entre `scripts/ingest-an.ts` + `scripts/resume-ingest.ts` · Le commentaire dans resume-ingest.ts disait littéralement "MUST stay in sync with scripts/ingest-an.ts isEligibleScrutin" — admission explicite du risk de drift. Cette fonction décide quels scrutins entrent dans le deck (et donc combien on paie Anthropic). Une divergence silencieuse changerait le coût de l'ingestion ET le contenu vu par l'utilisateur. Extraction dans `scripts/lib/an-filter.ts` avec interface minimale `ANScrutinForFilter` (juste `typeVote.codeTypeVote` + `objet.libelle` — pas besoin du full ANScrutinRaw). 2 scripts importent depuis là. · `scripts/lib/an-filter.ts` (nouveau), `scripts/ingest-an.ts`, `scripts/resume-ingest.ts`
- [FIXED] `isEligibleScrutin` zero test coverage · La fonction couvre 6 branches : drop amendements, drop "à l'article", keep SPS, keep "sur l'ensemble", keep motions (censure + référendaire seulement), keep propositions de résolution. Une régression sur n'importe quelle branche slipperait par CI. Ajout de `tests/an-filter.test.ts` avec 18 tests organisés par branche : amendment exclusions (5 cases incl. amendement-on-SPS, case-insensitive, à l'article), SPS auto-keep, sur-l'ensemble, motion censure/référendaire (incl. rejet/renvoi en commission stay out), proposition de résolution (incl. amendment-on-proposition wins), defaults (no rule, missing fields). · `tests/an-filter.test.ts` (nouveau)
- [FIXED] `CLAUDE.md` ligne 88 référence stale `scripts/ingest-an.ts — isEligibleScrutin` · Après l'extraction, la doc pointait toujours vers l'ancien location. Mise à jour vers `scripts/lib/an-filter.ts — isEligibleScrutin`. · `CLAUDE.md`

### Vérifications à faire en session 95

- [ ] grep `function isEligibleScrutin` scripts/ → 1 résultat (scripts/lib/an-filter.ts seulement)
- [ ] `ls tests/an-filter.test.ts` → présent, 18 tests
- [ ] grep `scripts/lib/an-filter` CLAUDE.md → 1 résultat (ligne 88 mise à jour)
- [ ] grep `~195 tests` CLAUDE.md → 0 résultat (aligné sur ~213)

---

## Session 95 — 2026-05-17

### Vérification session 94

- [VERIFIED] `function isEligibleScrutin` présent uniquement dans `scripts/lib/an-filter.ts`
- [VERIFIED] `tests/an-filter.test.ts` 18 tests
- [VERIFIED] CLAUDE.md ligne 88 pointe vers `scripts/lib/an-filter.ts`
- [VERIFIED] CLAUDE.md "~213 tests"
- 213/213 tests verts, typecheck clean

### Bugs fixés (extractAnthropicSummary dedup + GROUP_MAPPING dedup + tests)

- [FIXED] `extractAnthropicSummary` logique dupliquée · `ingest-an.ts extractSummaryFromMessage` (40 lignes, line 459) et `resume-ingest.ts extractSummary` (18 lignes, line 153) faisaient le même travail : filter text blocks, find JSON, sanitize, parse, validate, normalize. Différences cosmétiques uniquement (verbosité des messages d'erreur). Extraction dans `scripts/lib/parse-summary.ts` avec interface `MinimalAnthropicMessage` (juste `content[]` + `stop_reason` — pas besoin des per-block variants thinking/server_tool_use/etc. que chaque script définissait à part). Error messages tunés pour rester utiles au debug : stop_reason + block types, premiers 300 chars du combined text, list des stray keys. · `scripts/lib/parse-summary.ts`, `scripts/ingest-an.ts`, `scripts/resume-ingest.ts`
- [FIXED] `GROUP_MAPPING` dupliqué identiquement entre les 2 scripts · 13 entrées chacune, kept in sync à la main. Une drift (e.g. nouvel organeRef ajouté à un script et pas l'autre) ferait que recovery flow route les votes au mauvais group. Extraction dans `scripts/lib/an-groups.ts` avec doc inline (rationale UDR merge PO847173/PO872880, exclusion PO840056 non-inscrits). 2 scripts importent depuis là. · `scripts/lib/an-groups.ts` (nouveau), 2 scripts modifiés
- [FIXED] `extractAnthropicSummary` 0 test coverage · Ajout de 10 tests dans `tests/parse-summary.test.ts` : happy path single-block, multi-block concatenation, ignore non-text blocks (thinking/tool_use), error paths (no text → list stop_reason + block types, no JSON, missing chapeau → list stray keys), control char sanitization (literal newline inside string), normalization pipeline (asStringArray empty filter, normalizePointsCles ellipsis truncation, normalizeTheme lowercase + enum validation), trimming. + drop unused `normalizeTheme` import dans ingest-an.ts (caught par `tsc -b` quand le include étendu en session 94 a pris effet). · `tests/parse-summary.test.ts`

### Vérifications à faire en session 96

- [ ] grep `function extractSummary\|extractSummaryFromMessage` scripts/ → 0 résultat (tout passe par extractAnthropicSummary depuis parse-summary.ts)
- [ ] `ls scripts/lib/an-groups.ts` → présent ; 1 export `GROUP_MAPPING`
- [ ] grep `GROUP_MAPPING:` scripts/ingest-an.ts scripts/resume-ingest.ts → 0 résultat (les déclarations sont retirées, seuls les imports restent)
- [ ] grep -c "it(" tests/parse-summary.test.ts → 34 (était 24, +10 pour extractAnthropicSummary)

---

## Session 96 — 2026-05-17

### Vérification session 95

- [VERIFIED] `function extractSummary` / `extractSummaryFromMessage` → 0 résultat dans scripts/ (tout passe par extractAnthropicSummary)
- [VERIFIED] `scripts/lib/an-groups.ts` présent ; export GROUP_MAPPING
- [VERIFIED] aucune déclaration `GROUP_MAPPING:` dans les 2 scripts (juste les imports)
- [VERIFIED] tests/parse-summary.test.ts a 35 `it(` (24 base + 10 extractAnthropicSummary + 1 dans la nouvelle describe)
- 223/223 tests verts, typecheck clean

### Bugs fixés (AN parse dedup — types + parseRaw + tests)

- [FIXED] `ANScrutinRaw` + `ANGroupVote` types dupliqués · Les 2 scripts inlinaient le même envelope shape. `ingest-an.ts`'s `ANGroupVote` avait 2 fields extra (`nombreMembresGroupe`, `vote.positionMajoritaire`) que le parser ne lit JAMAIS — code dead. Extraction dans `scripts/lib/an-parse.ts` avec interface minimale (juste les fields que parseRaw consomme : organeRef + vote.decompteVoix). · `scripts/lib/an-parse.ts` (nouveau)
- [FIXED] `parseRaw` + `n` helper dupliqués identiquement · Même corps de fonction (vote breakdown, UDR merge defensive, dossier_id fallback), différait uniquement par le return-type annotation : ingest-an retournait `Omit<ParsedScrutin, ...>`, resume-ingest retournait `ParsedRaw`. Les 2 produisaient la même shape runtime. Extraction de `parseRaw` + helper `n` + nouveau type `ParsedScrutinCore` (single source of truth pour le shape). ingest-an redéfinit `ParsedScrutin extends ParsedScrutinCore` pour ajouter les champs LLM (titre_pedago, chapeau, contexte, analyse_loi, points_cles, theme). resume-ingest fait `type ParsedRaw = ParsedScrutinCore` (alias). · `scripts/ingest-an.ts`, `scripts/resume-ingest.ts`
- [FIXED] `parseRaw` 0 test coverage · La fonction critique qui transforme JSON AN brut en rows DB n'avait aucun test. Ajout de `tests/an-parse.test.ts` avec 17 cas : shape (id/numero/titre_brut/est_solennel/url_an_officielle/pedago_relu), dossier handling (présent / null / libelle fallback), vote breakdown (RN mapping, unknown organeRef, non-inscrits PO840056 = null, UDR merge defensive PO847173+PO872880, absent = nonVotants + nonVotantsVolontaires, coerce missing/garbage counts to 0), position_par_groupe (pour à ≥70%, divisé sinon). · `tests/an-parse.test.ts` (nouveau)

### Vérifications à faire en session 97

- [ ] `ls scripts/lib/an-parse.ts` → présent ; exports `ANScrutinRaw`, `ANGroupVote`, `ParsedScrutinCore`, `parseRaw`
- [ ] grep `^interface ANScrutinRaw\|^interface ANGroupVote\|^function parseRaw\|^function n\(` scripts/ingest-an.ts scripts/resume-ingest.ts → 0 résultat (tout déplacé)
- [ ] grep `~223 tests` CLAUDE.md → 0 résultat (aligné sur ~240)
- [ ] grep `nombreMembresGroupe\|positionMajoritaire` scripts/ → 0 résultat (dead fields retirés via la dedup)

---

## Session 97 — 2026-05-17

### Vérification session 96

- [VERIFIED] `scripts/lib/an-parse.ts` présent avec exports complets
- [VERIFIED] 0 résultat pour `^interface ANScrutinRaw|^interface ANGroupVote|^function parseRaw|^function n(` dans les 2 scripts
- [VERIFIED] `nombreMembresGroupe` / `positionMajoritaire` n'apparaissent plus que dans des commentaires lib (pas dans le code consommé)
- [VERIFIED] CLAUDE.md "~240 tests"
- 240/240 tests verts, typecheck clean

### Bugs fixés (cache + scan + BatchResultLine dedup)

- [FIXED] `CACHE_DIR` + `JSON_DIR` hardcodés à 3 sites · `/tmp/sd-an-cache` figé dans ingest-an.ts (CACHE_DIR + JSON_DIR), resume-ingest.ts (JSON_DIR direct), ingest-personnalites.ts (SCRUTINS_JSON_DIR direct). Un futur move (e.g. vers `~/.cache/sans-detour`) demanderait 3 edits. Extraction dans `scripts/lib/an-cache.ts` avec `CACHE_DIR` + `JSON_DIR` exportés. Les 3 scripts importent depuis là (ingest-personnalites garde son own scan loop car elle lit decompteNominatif, pas decompteVoix — incompatible avec le shared iterEligibleScrutins). · `scripts/lib/an-cache.ts` (nouveau), 3 scripts modifiés
- [FIXED] `iterEligibleScrutins` scan-loop dupliquée entre ingest-an + resume-ingest · Les 2 scripts faisaient le même chain : `fs.readdir(JSON_DIR).filter(.json)` → `JSON.parse` → `raw.scrutin ?? raw` unwrap → `isEligibleScrutin` filter → `parseRaw`. ingest-an pushait vers array + comptait SPS, resume-ingest construisait Map<id, parsed>. Extraction comme async generator (yields `{raw, parsed}`) qui laisse la collection strategy au caller — clean dedup sans imposer une shape. Imports `isEligibleScrutin` + `parseRaw` éliminés des 2 scripts (transitifs via an-cache.ts). · `scripts/lib/an-cache.ts`, `scripts/ingest-an.ts`, `scripts/resume-ingest.ts`
- [FIXED] `BatchResultLine` interface dupliquée · ingest-an avait la version riche (typed `error` field avec nested `error.error` per Anthropic batch shape) ; resume-ingest avait `error?: unknown` (loose). Risk : un fix sur l'error-shape ne se propage pas. Extraction dans `parse-summary.ts` avec la version riche (loose `error?: unknown` était strict subset → safe migration). 2 scripts importent depuis là. Drop aussi imports inutiles fs + path dans resume-ingest (caught par tsc -b puisque iterEligibleScrutins est dans an-cache.ts). · `scripts/lib/parse-summary.ts`, `scripts/ingest-an.ts`, `scripts/resume-ingest.ts`

### Vérifications à faire en session 98

- [ ] `ls scripts/lib/an-cache.ts` → présent ; exports `CACHE_DIR`, `JSON_DIR`, `iterEligibleScrutins`
- [ ] grep `JSON_DIR = path.join` scripts/*.ts → 0 résultat (les 3 scripts importent depuis an-cache.ts)
- [ ] grep `interface BatchResultLine` scripts/ingest-an.ts scripts/resume-ingest.ts → 0 résultat (déplacée vers parse-summary.ts)
- [ ] `npx tsc -b` propre + 240/240 tests verts

---

## Session 98 — 2026-05-17

### Vérification session 97

- [VERIFIED] `scripts/lib/an-cache.ts` présent avec les exports attendus
- [VERIFIED] 0 résultat pour `JSON_DIR = path.join` dans scripts/*.ts (tout via imports)
- [VERIFIED] 0 résultat pour `interface BatchResultLine` dans les 2 scripts (déplacée vers parse-summary.ts)
- [VERIFIED] tsc -b clean, 240/240 tests verts
- 240/240 tests verts, typecheck clean

### Bugs fixés (modal a11y refactor — hook + tests + selector defense)

- [FIXED] `MethodeSheet` + `RankingOverlay` dupliquaient les 4 useEffects modal-a11y · ESC handler, body scroll lock, focus on open / restore on close (via requestAnimationFrame), Tab focus trap — 8 effects identiques répartis sur les 2 composants. Extraction `src/hooks/useModalA11y.ts` (return `{dialogRef, closeBtnRef}`). 2 composants consomment maintenant : `const { dialogRef, closeBtnRef } = useModalA11y({ open, onClose });`. Drop des imports `useEffect` + `useRef` dans les 2 composants (caught par tsc -b). · `src/hooks/useModalA11y.ts` (nouveau), `src/components/MethodeSheet.tsx`, `src/components/RankingOverlay.tsx`
- [FIXED] `useModalA11y` 0 test coverage à l'extraction · 11 tests dans `tests/useModalA11y.test.tsx` couvrant les 4 contracts : body scroll lock (set hidden on open, restore on close, no-op on closed), Escape handler (calls onClose, ignores other keys, no-op on closed), focus on open (close button focused after RAF via waitFor — jsdom RAF nuance), focus trap (cycle Tab last→first, Shift+Tab first→last, no-op mid-cycle, INCLUDES `input` form elements). · `tests/useModalA11y.test.tsx` (nouveau)
- [FIXED] Focus-trap selector missing `input, select, textarea` · L'ancien selector `'a, button, [tabindex]:not([tabindex="-1"])'` ne matchait que ces 3 types. Aucune modal actuelle n'a de form input, mais une future modal avec un input verrait ses inputs ECHAPPER le focus trap (Tab les passerait, atteindrait le browser chrome). Defensive fix dans le selector du hook : `'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'`. Test inclus pour pin le comportement (input compté dans focusables.length). · `src/hooks/useModalA11y.ts` (line 81)

### Vérifications à faire en session 99

- [ ] `ls src/hooks/useModalA11y.ts` → présent ; exports `useModalA11y`
- [ ] grep `useModalA11y` src/components/ → 2 résultats (MethodeSheet + RankingOverlay imports + uses)
- [ ] grep `'a, button, \\[tabindex\\]:not' src/ → 0 résultat (vieux selector éliminé)
- [ ] grep `~240 tests` CLAUDE.md → 0 résultat (aligné sur ~251)

---

## Session 99 — 2026-05-17

### Vérification session 98

- [VERIFIED] `src/hooks/useModalA11y.ts` présent
- [VERIFIED] `useModalA11y` consommé dans MethodeSheet + RankingOverlay (6 grep hits : imports + uses + comments)
- [VERIFIED] 0 résultat pour `'a, button, [tabindex]:not'` (vieux selector éliminé)
- [VERIFIED] CLAUDE.md "~251 tests"
- 251/251 tests verts, typecheck clean

### Bugs fixés (typed event union + useFreshnessOnce + tests)

- [FIXED] `track(event: string, ...)` signature trop permissive · Une typo `track("vote_clicked")` au lieu de `track("vote")` compilerait sans erreur (string accepte tout), et Plausible recevrait un événement mal orthographié — métrique silencieusement cassée jusqu'à ce qu'on regarde le dashboard. Remplacement de `string` par une union `AnalyticsEvent` listant les 15 événements existants. TS catche maintenant les typos au call site. 18 call sites compilent toujours (toutes les chaînes existantes sont dans l'union). · `src/lib/analytics.ts`
- [FIXED] `useFreshnessOnce` hook extraction · Cover.tsx + Methode.tsx dupliquaient le même pattern : `useState<FreshnessInfo | null>(null)` + `useRef(false)` (fetchedRef) + useEffect qui fire fetchFreshness une fois et set ref sur succès. ~12 lignes × 2 fichiers. Extraction `src/hooks/useFreshnessOnce.ts` qui retourne `FreshnessInfo | null`. Methode passe de 12 lignes à 1 appel ; Cover garde son useEffect de redirect mais déplace le fetch hors de l'effet (trade-off : 1 fetch redondant quand la redirection auto-fire, harmless mais wasted Supabase call dans cet edge case). · `src/hooks/useFreshnessOnce.ts` (nouveau), `src/routes/Cover.tsx`, `src/routes/Methode.tsx`
- [FIXED] `useFreshnessOnce` + `AnalyticsEvent` zero test coverage · 3 nouveaux tests dans `tests/useFreshnessOnce.test.tsx` (initial null, resolves to FreshnessInfo shape, stable reference sur re-render — proxy pour StrictMode double-invoke guard) + 2 tests dans `tests/analytics.test.ts` (accepts all 15 documented events without cast, rejects typo at compile time via `@ts-expect-error`). Le test `@ts-expect-error` est lui-même la garde : si la signature widens back to `string`, l'unused-directive ferait fail le build vitest. · `tests/useFreshnessOnce.test.tsx` (nouveau), `tests/analytics.test.ts`

### Vérifications à faire en session 100

- [ ] grep `AnalyticsEvent` src/ → exports + 1 usage dans `track()` signature
- [ ] `ls src/hooks/useFreshnessOnce.ts` → présent
- [ ] grep `fetchedRef` src/routes/ → 0 résultat (les 2 consumers passent par le hook)
- [ ] grep `~251 tests` CLAUDE.md → 0 résultat (aligné sur ~256)

---

## Session 100 — 2026-05-17

### Vérification session 99

- [VERIFIED] `AnalyticsEvent` exporté + utilisé dans `track()` signature
- [VERIFIED] `src/hooks/useFreshnessOnce.ts` présent
- [VERIFIED] 0 résultat pour `fetchedRef` dans src/routes/ (les 2 consumers passent par le hook)
- [VERIFIED] CLAUDE.md "~256 tests"
- 256/256 tests verts, typecheck clean

### Bugs fixés (extractConcrete extraction + tests + PartyRow/PersonnaliteRow coverage)

- [FIXED] `extractConcrete` enfoui dans AuditTrail.tsx · 40 lignes de text-processing pur (sentence-boundary regex avec `(?=\.\s+[A-Z]|\.?$)`, comma-fallback pour les drifts LLM `Concrètement, …` au lieu de `Concrètement :`) vivaient inline dans AuditTrail comme fonction non-exportée. Pas le bon home — son cousin stripCitations vit déjà dans `src/lib/text-cleanup.ts`. Déplacé là, AuditTrail importe maintenant `extractConcrete` depuis le lib (et drop les 2 imports stripCitations/stripBoldMarkers individuels — ils sont déjà utilisés par extractConcrete). · `src/lib/text-cleanup.ts`, `src/components/AuditTrail.tsx`
- [FIXED] `extractConcrete` 0 test coverage · La fonction a plusieurs edge cases non-évidents : sentence-boundary regex (period+space+capital ou fin de string), comma-fallback (LLM drift), citation strip via stripCitations partagé (orphan tags), bold strip, trim de période finale. 10 tests ajoutés dans `tests/text-cleanup.test.ts` couvrant : undefined/empty input, no marker, "Concrètement :" + "Par exemple :", comma-fallback drift, case-insensitive, citation strip, bold strip, trailing period trim, first match wins. · `tests/text-cleanup.test.ts`
- [FIXED] `PartyRow` + `PersonnaliteRow` 0 dedicated test coverage · Les 2 composants accumulent 8+ sessions d'invariants (SR-friendly aria-label session 25, plural rule session 81, aria-controls gating session 87, LOW_DATA_THRESHOLD path session 86). Refactor silencieux régressait. Ajout `tests/PartyRow.test.tsx` (16 tests : rendering, plural rule, interactive behavior, aria-expanded/aria-controls gating) + `tests/PersonnaliteRow.test.tsx` (7 tests : normal path, tooLittleData path, plural rule pour vote/comparable). · `tests/PartyRow.test.tsx` (nouveau), `tests/PersonnaliteRow.test.tsx` (nouveau)

### Vérifications à faire en session 101

- [ ] `ls tests/PartyRow.test.tsx tests/PersonnaliteRow.test.tsx` → 2 fichiers présents
- [ ] grep `export function extractConcrete` src/lib/text-cleanup.ts → 1 résultat (moved here)
- [ ] grep `function extractConcrete` src/components/AuditTrail.tsx → 0 résultat (removed)
- [ ] grep `~256 tests` CLAUDE.md → 0 résultat (aligné sur ~287)

---

## Session 101 — 2026-05-17

### Vérification session 100

- [VERIFIED] `tests/PartyRow.test.tsx` + `tests/PersonnaliteRow.test.tsx` présents
- [VERIFIED] `extractConcrete` exporté depuis `src/lib/text-cleanup.ts`, absent de AuditTrail.tsx
- [VERIFIED] CLAUDE.md "~287 tests"
- 287/287 tests verts, typecheck clean

### Bugs fixés (test drift cleanup — fromLogo literal + 2 missing test files)

- [FIXED] `tests/Cover.test.tsx:61` literal `{ fromLogo: true }` au lieu de `FROM_LOGO_STATE` · Session 90 a extrait le const dans `src/lib/nav-state.ts` ; les 4 call sites src/ utilisent le const. Mais le test Cover, écrit avant session 90, gardait le literal. Un futur rename du field (e.g. `fromLogo` → `fromHome`) casserait silencieusement le test (literal stale, le runtime n'aurait plus de match). Replace par l'import + usage du const → maintenant un rename casse le test ET la prod ensemble. · `tests/Cover.test.tsx`
- [FIXED] `useFlipCardA11y` hook 0 test direct · Les 2 autres hooks (useModalA11y session 98, useFreshnessOnce session 99) ont des fichiers de test dédiés. useFlipCardA11y était couvert uniquement indirectement via Card.test.tsx (où le hook est passé via Card component). Ajout `tests/useFlipCardA11y.test.tsx` avec 13 tests directs : rootProps (role/aria-label/tabIndex topMost vs !topMost), aria-hidden faces (flipped flag), keyboard handler (Enter/Space → onFlip, Arrow*→onSwipe avec direction, Arrow ignored on flipped, all ignored on !topMost). · `tests/useFlipCardA11y.test.tsx` (nouveau)
- [FIXED] `Wordmark` 0 test · Composant petit mais render-critical (every secondary route header — TopBar, Cover hero, Methode + Legal page headers). Session 81 a stripped le prop `className` mort ; sans test, une régression (réintroduction du prop, casser le `size`→`fontSize` conversion, casse du `.sd-slash` ou `.sd-caret` selector hook) slipperait. 7 tests : text content, default size 14px, custom size, `.sd-wordmark` class, `.sd-slash` span, aria-hidden `.sd-caret`, no interactive role. · `tests/Wordmark.test.tsx` (nouveau)

### Vérifications à faire en session 102

- [ ] grep `{ fromLogo: true }` tests/ → 0 résultat (literal éliminé du test)
- [ ] `ls tests/useFlipCardA11y.test.tsx tests/Wordmark.test.tsx` → 2 fichiers présents
- [ ] grep -c "it(" tests/useFlipCardA11y.test.tsx → 13
- [ ] grep `~287 tests` CLAUDE.md → 0 résultat (aligné sur ~305)

---

## Session 102 — 2026-05-17

### Vérification session 101

- [VERIFIED] 0 résultat pour `{ fromLogo: true }` literal dans tests/ (nav-state.test.ts a juste un comment ref)
- [VERIFIED] tests/useFlipCardA11y.test.tsx + tests/Wordmark.test.tsx présents
- [VERIFIED] CLAUDE.md "~305 tests"
- 305/305 tests verts, typecheck clean

### Bugs fixés (env dedup — Supabase 4× + Anthropic 3× + tests)

- [FIXED] `requireSupabaseEnv` + `requireSupabaseClient` dédupliqués sur 4 scripts · ingest-an.ts, resume-ingest.ts, seed-supabase.ts, ingest-personnalites.ts inlinaient tous le pattern `process.env.SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` + guard + `createClient(URL!, KEY!)`. Le `!` non-null assertion était nécessaire dans 3 des 4 scripts parce que `createClient` était à l'intérieur d'un async `main()` où TS ne carry pas le narrowing depuis le module scope (verified session 89). Extraction dans `scripts/lib/env.ts` : `requireSupabaseEnv()` retourne `{url: string, key: string}` narrowed, `requireSupabaseClient()` enchaîne avec `createClient`. Les 4 scripts simplifiés ; aucun `!` restant. · `scripts/lib/env.ts` (nouveau), `scripts/{ingest-an,resume-ingest,seed-supabase,ingest-personnalites}.ts`
- [FIXED] `requireAnthropicEnv` dédupliqué sur 3 scripts · `process.env.ANTHROPIC_API_KEY` + guard `if (!ANTHROPIC_KEY) { console.error; process.exit(1) }` dans resume-ingest.ts + debug-batch.ts (ingest-an.ts garde sa lecture top-level parce que la clé est optionnelle — le fallback path sans Anthropic est valide pour ce script). Extraction de `requireAnthropicEnv()` dans le même module env.ts. · `scripts/lib/env.ts`, `scripts/resume-ingest.ts`, `scripts/debug-batch.ts`
- [FIXED] `env.ts` 0 test à l'extraction · 7 tests dans `tests/env.test.ts` couvrant les 3 helpers : success-path (URL+KEY set → narrowed string return), compile-time narrow assertion (assigning to `string` without `!`), failure paths (URL missing, KEY missing, ANTHROPIC missing → process.exit(1) + console.error contenant la variable manquante), requireSupabaseClient retourne un objet avec `.from()` chainable (smoke test sans network). · `tests/env.test.ts` (nouveau)

### Vérifications à faire en session 103

- [ ] grep `process.env.SUPABASE_URL\\b` scripts/ → uniquement dans lib/env.ts (la déclaration extracted)
- [ ] grep `createClient(SUPABASE` scripts/ → 0 résultat (tout passe par requireSupabaseClient)
- [ ] grep `SUPABASE_URL!` scripts/ → 0 résultat (no more `!` assertions)
- [ ] grep `~305 tests` CLAUDE.md → 0 résultat (aligné sur ~312)

---

## Session 103 — 2026-05-17

### Vérification session 102

- [VERIFIED] `process.env.SUPABASE_URL` apparaît uniquement dans scripts/lib/env.ts (declaration + JSDoc) ; les 4 ingest scripts utilisent maintenant requireSupabaseClient()
- [VERIFIED] 0 résultat pour `createClient(SUPABASE` hors lib/env.ts
- [VERIFIED] 0 résultat pour `SUPABASE_URL!` (le helper retourne narrowed string)
- [VERIFIED] CLAUDE.md "~312 tests"
- 312/312 tests verts, typecheck clean

### Bugs fixés (residual `!` cleanup + 2 session test gaps)

- [FIXED] `ANTHROPIC_KEY!` non-null assertions résiduelles · Session 102 a remplacé `process.env.ANTHROPIC_API_KEY` par `requireAnthropicEnv()` dans resume-ingest.ts + debug-batch.ts, mais 3 sites d'appel (`"x-api-key": ANTHROPIC_KEY!`) gardaient le `!` redondant — le helper retourne déjà `string` narrowed. Drop les 3 `!` (resume-ingest.ts:64, debug-batch.ts:27 + :41). ingest-an.ts garde son `ANTHROPIC_KEY!` parce qu'il lit toujours `process.env.ANTHROPIC_API_KEY` directement (optionnel — fallback path valide sans la clé). · `scripts/resume-ingest.ts`, `scripts/debug-batch.ts`
- [FIXED] `newSession` shape testée uniquement par uniqueness · Le test `newSession produces unique ids` (session 46) couvrait l'unicité du session_id mais pas les invariants de shape (cards_seen=[], votes=[], started_at numeric). Un downstream change à SessionState (rename de field, ajout de required field sans default) slipperait. Ajout `newSession returns the canonical empty-session shape` qui pin les 5 fields. · `tests/session.test.ts`
- [FIXED] `getOrCreateSession` 0 test dedicated · Helper utilisé par Play.tsx:85 pour garantir une session avant compose deck. Le branching (loadSession existing → return; else newSession + saveSession + return) n'avait aucune couverture. 4 tests ajoutés : creates new + persists, returns existing, idempotent on repeated calls, preserves votes across calls. · `tests/session.test.ts`

### Vérifications à faire en session 104

- [ ] grep `ANTHROPIC_KEY!` scripts/ → 1 résultat seulement (ingest-an.ts ligne 339 — le seul fichier où c'est optionnel)
- [ ] grep "describe.*getOrCreateSession" tests/session.test.ts → 1 résultat
- [ ] grep "canonical empty-session shape" tests/session.test.ts → 1 résultat
- [ ] grep `~312 tests` CLAUDE.md → 0 résultat (aligné sur ~317)

---

## Session 104 — 2026-05-17

### Vérification session 103

- [VERIFIED] 1 résultat pour `ANTHROPIC_KEY!` dans scripts/ (uniquement ingest-an.ts:339, intentionnel)
- [VERIFIED] describe + canonical shape tests présents dans tests/session.test.ts
- [VERIFIED] CLAUDE.md "~317 tests"
- 317/317 tests verts, typecheck clean

### Bugs fixés (route literals → ROUTES const, 41+ sites, plus tests)

- [FIXED] Route paths hardcodés à 41+ sites · `/`, `/play`, `/result`, `/methode`, `/legal` inlinés dans main.tsx (Route definitions × 6), Cover.tsx (navigate × 5 + Link × 4), Result.tsx (navigate × 3 + Navigate × 1), Play.tsx (navigate × 7), TopBar.tsx (Link × 4 + pathname comparisons × 3), Methode.tsx + Legal.tsx (Link × 4), MethodeSheet.tsx (Link × 1). Un rename `/play` → `/swipe` aurait demandé 41 edits avec typo silencieuse possible à chaque site. Extraction dans `src/lib/routes.ts` : const `ROUTES = { cover, play, result, methode, legal } as const` + type `RoutePath` (union literal). Tous les sites migrés. · `src/lib/routes.ts` (nouveau), 7 fichiers src/ modifiés
- [FIXED] `?affinement=1` query string hardcodé 2 fois · Cover.tsx + Result.tsx avaient le literal `"/play?affinement=1"` dupliqué. Extraction comme `PLAY_AFFINEMENT = `${ROUTES.play}?affinement=1` as const` qui compose depuis ROUTES.play — un rename `/play` propage automatiquement vers le PLAY_AFFINEMENT. Result.tsx migré (Cover ne contenait pas ce literal en fait — c'était Result + le useEffect Play qui lisait params.get). · `src/lib/routes.ts`, `src/routes/Result.tsx`
- [FIXED] `ROUTES` + `PLAY_AFFINEMENT` 0 test à l'extraction · 6 tests dans `tests/routes.test.ts` : pin l'objet shape (cover/play/result/methode/legal), chaque valeur commence par `/`, type compat avec `RoutePath` union, PLAY_AFFINEMENT composé depuis ROUTES.play (rename-safe), query string `?affinement=1` documenté comme la convention canonique. · `tests/routes.test.ts` (nouveau)

### Vérifications à faire en session 105

- [ ] grep `"/play"\|"/result"\|"/methode"\|"/legal"` src/ (hors lib/routes.ts) → 0 résultat
- [ ] grep `"/?affinement=1"` src/ → 0 résultat (uniquement PLAY_AFFINEMENT const)
- [ ] grep -c "it(" tests/routes.test.ts → 6
- [ ] grep `~317 tests` CLAUDE.md → 0 résultat (aligné sur ~323)

---

## Session 105 — 2026-05-17

### Vérification session 104

- [VERIFIED] 0 résultat pour route literals dans src/ (hors lib/routes.ts)
- [VERIFIED] PLAY_AFFINEMENT utilisé partout (pas de `?affinement=1` literal)
- [VERIFIED] tests/routes.test.ts a 6 `it()`
- [VERIFIED] CLAUDE.md "~323 tests"
- 323/323 tests verts, typecheck clean

### Bugs fixés (2 component test gaps + test-route literal drift)

- [FIXED] `AuditTrail` 0 test coverage · Composant substantiel (per-group breakdown panel sur /result) avec : filtering des votes (skip excluded), mapping score → icon/color/label (4 branches : divisé null, perfect=1, partial=0.5, conflict=0), aria-labelledby region landmark, AN link vs "démo" fallback span pour url_an_officielle empty, breakdown chips avec plural rule (sessions 78-83). 16 tests ajoutés couvrant chacune de ces invariants. · `tests/AuditTrail.test.tsx` (nouveau)
- [FIXED] `DeckStack` 0 test coverage · Composant petit mais logic-heavy (top-3 slice du deck, swipe direction → UserVote mapping, aria-hidden sur non-top wrappers, onOpenMethode forwarding au top card seulement). 7 tests : empty deck → null, ≤3 cards rendered, aria-hidden patterns, ArrowLeft/Right/Down → contre/pour/skip, IA chip rendered seulement sur top card. · `tests/DeckStack.test.tsx` (nouveau)
- [FIXED] `tests/Cover.test.tsx:17-18` Route paths hardcodés · Le mock router contenait encore les literals `<Route path="/play">` + `<Route path="/result">` après l'extraction ROUTES en session 104. Même drift que session 101 a fixé pour `{ fromLogo: true }` — un rename `/play` → `/swipe` casserait le mock silencieusement. Imports ROUTES + migration des 3 sites (Route paths + l'initial entry `pathname`). · `tests/Cover.test.tsx`

### Vérifications à faire en session 106

- [ ] `ls tests/AuditTrail.test.tsx tests/DeckStack.test.tsx` → 2 fichiers présents
- [ ] grep `"/play"\|"/result"` tests/Cover.test.tsx → 0 résultat (ROUTES const partout)
- [ ] grep `~323 tests` CLAUDE.md → 0 résultat (aligné sur ~344)
- [ ] grep -c "it(" tests/AuditTrail.test.tsx → 16

---

## Session 106 — 2026-05-17

### Vérification session 105

- [VERIFIED] tests/AuditTrail.test.tsx + tests/DeckStack.test.tsx présents
- [VERIFIED] tests/Cover.test.tsx : 0 résultat pour `/play`/`/result` literals
- [VERIFIED] CLAUDE.md "~344 tests"
- 344/344 tests verts, typecheck clean

### Bugs fixés (3 route + integration test gaps)

- [FIXED] `TopBar` 0 test coverage · Composant nav substantiel : route-aware rendering (caché sur Cover, visible sur les 4 autres routes), popover menu (aria-haspopup="menu", aria-expanded, ESC close, auto-close sur navigation, focus-restore au trigger), MIN_FOR_RANKING gate sur "Mon résultat" link, aria-current="page" sur le route actuel. 13 tests dans `tests/TopBar.test.tsx` couvrant les 4 sections (route gating, menu popover, MIN_FOR_RANKING threshold, aria-current per-route). · `tests/TopBar.test.tsx` (nouveau)
- [FIXED] `RankingOverlay` 0 test coverage · useModalA11y est testé directement (session 98), mais l'intégration au component-level (alignments → rankByAlignment → PartyRow rendering, plural rule sur "compté" du header chip, dialog surface avec aria-modal+aria-label) ne l'était pas. 8 tests : visibility (open=false → nothing rendered, open=true → role=dialog aria-modal), header chip plural rule, alignment rows (11 GROUP_CODES, ranked by pct descending), close interactions (button + Escape). · `tests/RankingOverlay.test.tsx` (nouveau)
- [FIXED] `Methode` SPA hash deep-link useEffect untested · Le hash deep-link `/methode#methode-07` scroll + focus le section après mount (workaround pour la native anchor jump qui fire avant React mount). Comportement non-trivial + le choix `behavior: "instant"` documenté inline. 9 tests dans `tests/Methode.test.tsx` : section structure (7 régions avec ids `methode-NN`), Sommaire anchor links, hash deep-link (calls scrollIntoView avec behavior=instant, no-op sans hash, no-op sur id absent, moves focus avec preventScroll), references AN + Claude (transparency requirement). · `tests/Methode.test.tsx` (nouveau)

### Vérifications à faire en session 107

- [ ] `ls tests/TopBar.test.tsx tests/RankingOverlay.test.tsx tests/Methode.test.tsx` → 3 fichiers présents
- [ ] grep `~344 tests` CLAUDE.md → 0 résultat (aligné sur ~374)
- [ ] grep "useModalA11y" tests/RankingOverlay.test.tsx → 1 résultat (comment qui pointe vers le hook test)

---

## Session 107 — 2026-05-17

### Vérification session 106

- [VERIFIED] `tests/TopBar.test.tsx` + `tests/RankingOverlay.test.tsx` + `tests/Methode.test.tsx` présents
- [VERIFIED] CLAUDE.md "~374 tests"
- [VERIFIED] `tests/RankingOverlay.test.tsx` contient le comment pointant vers useModalA11y (session 98)
- 374/374 tests verts, typecheck clean

### Bugs fixés (extractVotesFromScrutin → lib/an-personnalites + 0 test → 15 tests)

- [FIXED] `extractVotesFromScrutin` + `asArr` + types AN nominatifs inline dans `scripts/ingest-personnalites.ts` · La fonction critique du pipeline V2 personnalités (qui transforme l'arbre `decompteNominatif` AN en un record `{ le_pen: "pour", panot: "contre", ... }`) vivait inline aux lignes 39-97 du script, non exportable, non testable. Même refactor que sessions 94-97 ont fait pour `isEligibleScrutin` / `parseRaw` / `iterEligibleScrutins`. Extraction dans `scripts/lib/an-personnalites.ts` avec les interfaces `ANVotant` / `ANNominatif` / `ANGroup` / `ANScrutinForPersonnalites` exportées, `asArr<T>` exporté, `extractVotesFromScrutin` exporté. Le script consume-side passe à `import { extractVotesFromScrutin, type ANScrutinForPersonnalites } from "./lib/an-personnalites"` et drop les 60 lignes inline. · `scripts/lib/an-personnalites.ts` (nouveau), `scripts/ingest-personnalites.ts`
- [FIXED] `extractVotesFromScrutin` 0 test coverage · La fonction gère 5 catégories de votes (`pours` / `contres` / `abstentions` / `nonVotants` / `nonVotantsVolontaires`) + un défaut `non_dispo` pour les personnalités absentes du scrutin + la coercion `asArr` qui normalise les listes serialisées en bare-object par l'AN bulk download. Aucun test ne pinait ces invariants — un refactor LLM aurait pu silently mapper `nonVotantsVolontaires` à autre chose que "absent" sans détection. 15 tests ajoutés couvrant : `asArr` (undefined → [], array → unchanged, bare object → wrapped, empty array), défaut `non_dispo` (scrutin vide + scrutin avec decompteNominatif absent), les 5 buckets mappés (pours→pour, contres→contre, abstentions→abstention, nonVotants→absent, nonVotantsVolontaires→absent), acteurRef inconnu silently skippé, single-voter coercion (votant + groupe en bare-object), merge multi-groupes. · `tests/an-personnalites.test.ts` (nouveau)
- [FIXED] Comportement `nonVotants` vs `nonVotantsVolontaires` non documenté · Les deux buckets représentent en réalité deux états différents côté AN : `nonVotants` (absent pour raison médicale/personnelle) vs `nonVotantsVolontaires` (refus délibéré de voter / abstention par refus). Le code les collapse tous les deux en `"absent"` car le matching algorithm de l'app les traite identiquement (exclus du denominator). C'était un fact-of-life du code non écrit nulle part — un futur dev pourrait penser que c'est un bug et tenter de splitter. Documenté dans le JSDoc de `extractVotesFromScrutin` (raison du collapse) + dans le comment du test (`nonVotantsVolontaires → "absent" (same as nonVotants)`). · `scripts/lib/an-personnalites.ts`, `tests/an-personnalites.test.ts`

### Vérifications à faire en session 108

- [ ] `ls scripts/lib/an-personnalites.ts tests/an-personnalites.test.ts` → 2 fichiers présents
- [ ] grep "interface ANVotant\|interface ANNominatif\|interface ANGroup\|interface ANScrutin\b\|function asArr\|function extractVotesFromScrutin" scripts/ingest-personnalites.ts → 0 résultat (toutes les définitions sont parties dans lib/)
- [ ] grep `~374 tests` CLAUDE.md → 0 résultat (aligné sur ~389)
- [ ] grep -c "it(" tests/an-personnalites.test.ts → 15

---

## Session 108 — 2026-05-17

### Vérification session 107

- [VERIFIED] `scripts/lib/an-personnalites.ts` + `tests/an-personnalites.test.ts` présents
- [VERIFIED] 0 inline def (interface AN*, function asArr, function extractVotesFromScrutin) dans `scripts/ingest-personnalites.ts`
- [VERIFIED] CLAUDE.md "~389 tests"
- [VERIFIED] 15 `it()` dans `tests/an-personnalites.test.ts`
- 389/389 tests verts, typecheck clean

### Bugs fixés (3 drift risks: literals dupliqués + 1 test gap critique)

- [FIXED] `tests/an-personnalites.test.ts` hardcodait 8 acteurRefs (`PA720614`, `PA609332`, …) dupliqués depuis `src/lib/personnalites.ts` PERSONNALITES · Même drift pattern que les sessions 90 / 101 / 104 / 105 ont fixé (FROM_LOGO_STATE, route literals, test route literals). Si l'AN republie un député avec un nouveau PA id (déjà arrivé : `acteur_ref` field comment dit "Verified May 2026" — vérification manuelle nécessaire à chaque republication), la table PERSONNALITES serait corrigée mais les tests passeraient toujours avec les literals stale, masquant un mismatch en prod. Fix : `const REF_LE_PEN = PERSONNALITES.le_pen.acteur_ref` (× 8) — un rename touche la table et les tests via une seule edit. · `tests/an-personnalites.test.ts`
- [FIXED] Storage keys `"sd_session_v1"` et `"sd_seen_cover"` dupliqués 8× dans les tests · `src/lib/session.ts` déclarait `const KEY = "sd_session_v1"` et `const COVER_KEY = "sd_seen_cover"` en private au module, mais `tests/session.test.ts` les hardcodait 5× (loadSession malformed-JSON guards) et `tests/Cover.test.tsx` 3× (hasSeenCover branches). Une migration `sd_session_v1 → sd_session_v2` aurait silencieusement laissé les tests écrire sur la clé obsolète pendant que la prod lirait la nouvelle. Fix : export `SESSION_STORAGE_KEY` et `COVER_STORAGE_KEY` depuis session.ts (les private const KEY/COVER_KEY restent en alias pour minimiser la diff), migration des 8 sites tests vers les imports. · `src/lib/session.ts`, `tests/session.test.ts`, `tests/Cover.test.tsx`
- [FIXED] `src/lib/scrutins.ts` (fetchScrutins + fetchFreshness) 0 test dedicated · Module consommé par Cover (FreshnessBanner via useFreshnessOnce) et Play/Result (deck source), avec 2 branches de fallback critiques : (a) supabase=null → retourne les dev-fixtures.json (essentiel pour dev/test sans env), (b) malformed `ingere_le` → fall back à un now-anchored sync ETA (sans ce guard, `new Date("garbage").toISOString()` throw RangeError et la banner disparait). 7 tests ajoutés : fetchScrutins fallback (returns fixtures, 20 entries, every scrutin a la shape consumée), fetchFreshness fallback (total_scrutins match fixture count, last_sync_at parseable ISO, next_sync_eta = last + 7d à ±1s près, formats ISO 8601 conformes). Mock module-level `vi.mock("../src/lib/supabase", () => ({ supabase: null }))` pour pin la branche fallback malgré la présence de `.env.local` qui chargerait le client vivant — sinon les tests seraient non-déterministes (hit la prod DB). · `tests/scrutins.test.ts` (nouveau)

### Vérifications à faire en session 109

- [ ] grep `"PA[0-9]\{6\}"` tests/an-personnalites.test.ts → 1 résultat seulement (le "PA999999" unknown-ref intentionnel)
- [ ] grep `"sd_session_v1\|sd_seen_cover"` tests/ → 0 résultat (literals exportés depuis session.ts)
- [ ] `ls tests/scrutins.test.ts` → présent
- [ ] grep `~389 tests` CLAUDE.md → 0 résultat (aligné sur ~396)

---

## Session 109 — 2026-05-17

### Vérification session 108

- [VERIFIED] tests/an-personnalites.test.ts : 1 PA…literal (le PA999999 unknown-ref intentionnel)
- [VERIFIED] 0 occurrence des storage keys `sd_session_v1` / `sd_seen_cover` en literal dans tests/
- [VERIFIED] tests/scrutins.test.ts présent
- [VERIFIED] CLAUDE.md "~396 tests"
- 396/396 tests verts, typecheck clean

### Bugs fixés (drift cap literals + 2 component test gaps)

- [FIXED] `CAP_PER_DOSSIER = 2` et `CAP_PER_CHAPEAU_PREFIX = 2` dupliqués entre `src/routes/Play.tsx` (private consts × 2) et tests deck (~10 occurrences du literal `2` dans tests/deck.test.ts + 6 dans tests/deck-invariants.test.ts) · Même drift pattern que sessions 90 / 101 / 104 / 105 / 108 ont fixé (FROM_LOGO_STATE, route literals, storage keys). Un bump V3 à `CAP_PER_DOSSIER = 3` dans Play.tsx aurait silencieusement laissé les tests valider l'ancienne policy "max 2 par dossier" pendant que la prod permettait 3 — masquant un changement intentionnel par un test qui passe. Fix : `export const DEFAULT_CAP_PER_DOSSIER = 2` + `export const DEFAULT_CAP_PER_CHAPEAU_PREFIX = 2` depuis `src/lib/deck.ts` (lib sémantiquement propriétaire des caps, pas Play.tsx). Play.tsx + tests deck/deck-invariants migrés vers les imports. · `src/lib/deck.ts`, `src/routes/Play.tsx`, `tests/deck.test.ts`, `tests/deck-invariants.test.ts`
- [FIXED] `src/components/CardSkeleton.tsx` + `src/components/ResultSkeleton.tsx` 0 test coverage · Les deux skeletons rendus pendant les chargements de Play (CardSkeleton) et Result (ResultSkeleton) ont des invariants a11y critiques : aria-busy="true" + aria-label en français pour que l'AT annonce le loading state (silent skeleton = pire UX possible). ResultSkeleton a en plus une invariant non-évidente (row count anchored sur GROUP_CODES.length pour éviter un CLS de 250px quand la real list de 11 rows remplace 6 skeleton rows — documenté en commentaire source mais 0 test). 7 tests ajoutés dans `tests/Skeleton.test.tsx` : aria-busy présent, aria-label français, shimmer placeholders rendus (pas un div vide), row count match GROUP_CODES.length. · `tests/Skeleton.test.tsx` (nouveau)
- [FIXED] `src/routes/Legal.tsx` 0 test coverage · Sibling de Methode.tsx (qui a eu ses tests en session 106). Owns : page title + sections RGPD (éditeur/hébergeur/données perso/analytics/sources), wordmark+Retour Links pointant `ROUTES.cover` (rename-safe), mailto via `CONTACT_EMAIL`, AN data link avec rel="noopener", deux production-blocker placeholders (`[à compléter]` + `github.com/sansdetour`) flaggés TODO dans la source mais sans test pour bloquer un PR qui les drop sans vraie value. 9 tests : page title, nav landmark aria-label, Retour + Wordmark Links pointent ROUTES.cover, sections RGPD présentes, mailto compose `mailto:${CONTACT_EMAIL}` via la lib (pas un literal), AN link a target=_blank + rel=noopener, Vercel hébergeur block présent. Les 2 derniers tests pinent l'état actuel des placeholders pour qu'un PR "ship" les remplace au lieu de les supprimer silencieusement. · `tests/Legal.test.tsx` (nouveau)

### Vérifications à faire en session 110

- [ ] grep -n `"capPerDossier: 2\b\|capPerChapeauPrefix: 2\b"` tests/deck.test.ts tests/deck-invariants.test.ts → 1 résultat seulement (le comment "// `capPerChapeauPrefix: 2` without the map…" historique en l.191)
- [ ] grep `DEFAULT_CAP_PER_DOSSIER\|DEFAULT_CAP_PER_CHAPEAU_PREFIX` src/ tests/ → résultats dans deck.ts (déclaration) + Play.tsx + 2 tests
- [ ] `ls tests/Skeleton.test.tsx tests/Legal.test.tsx` → 2 fichiers présents
- [ ] grep `~396 tests` CLAUDE.md → 0 résultat (aligné sur ~412)

---

## Session 110 — 2026-05-17

### Vérification session 109

- [VERIFIED] 1 résultat seulement pour `capPerDossier: 2\b|capPerChapeauPrefix: 2\b` (un comment historique en tests/deck.test.ts:191)
- [VERIFIED] 29 occurrences de `DEFAULT_CAP_PER_DOSSIER|DEFAULT_CAP_PER_CHAPEAU_PREFIX` dans src/ + tests/ (déclaration + Play.tsx + 2 fichiers tests deck)
- [VERIFIED] `tests/Skeleton.test.tsx` + `tests/Legal.test.tsx` présents
- [VERIFIED] CLAUDE.md "~412 tests"
- 412/412 tests verts, typecheck clean

### Bugs fixés (analytics drift × 2 + parseTopParam test gap)

- [FIXED] `ANALYTICS_HOSTS` private const dans `src/lib/analytics.ts`, dupliqué 5× en literals dans `tests/analytics.test.ts` · Même drift pattern que sessions 90/101/104/105/108/109. Un rebrand `sansdetour.fr → sansdetour.com` laisserait le gate prod mis-à-jour mais les tests passeraient toujours avec l'ancien hostname (le test ferait `setHostname("sansdetour.fr")` et constaterait que ce n'est PLUS un hôte autorisé — un faux positif vert). Fix : export `ANALYTICS_HOSTS: ReadonlySet<string>` depuis analytics.ts, tests itèrent `for (const host of ANALYTICS_HOSTS)` au lieu de hardcoder, plus un test dédié qui pin la composition actuelle ("includes apex + www") pour ne pas perdre la coverage si on enlève un hôte sans le vouloir. · `src/lib/analytics.ts`, `tests/analytics.test.ts`
- [FIXED] `AnalyticsEvent` type-only union avec une copie literal parallèle de 15 events dans `tests/analytics.test.ts` · Le test "accepts every documented event" hardcodait les 15 strings du union, ce qui pouvait passer ✓ même quand on ajoutait un 16e event à la union sans étendre le tableau du test — l'event silently uncovered. Fix : convertir le union en runtime-backed const tuple : `export const ANALYTICS_EVENTS = [...] as const` + `export type AnalyticsEvent = typeof ANALYTICS_EVENTS[number]`. Le test itère désormais `for (const e of ANALYTICS_EVENTS)` — ajouter un event au tuple étend automatiquement la couverture. Compile-time : la dérivation `typeof [...][number]` garde l'enforcement contre les typos (un `track("vote_clicked")` reste un TS error). · `src/lib/analytics.ts`, `tests/analytics.test.ts`
- [FIXED] `parseTopParam` dans `api/share-card.ts` 0 test coverage · Le parser du paramètre `?t=RN:57,LFI:30,EPR:22` qui défend la share card SVG contre les inputs malformés (negative pcts, NaN, missing colons, leading/trailing commas) vivait inline dans le handler aux côtés de `satori` import — non-testable sans dragger Satori + 50KB de TTF dans le test setup. Une régression silencieuse aurait shipped une image "-50% RN" ou "Code:NaN" à des centaines d'utilisateurs sans détection. Fix : extract dans `api/_lib/parse-top.ts` (le préfixe `_` est la convention Vercel pour exclure du deploy comme route). Handler garde l'exact même import + même comportement. 12 tests dans `tests/parse-top.test.ts` : null/empty → [], single/multi bar parsing, clamp [0,100] (-50 → 0, 200 → 100), boundary values, malformed drops (NaN pct, empty code, no-colon orphan, trailing comma). · `api/_lib/parse-top.ts` (nouveau), `api/share-card.ts`, `tests/parse-top.test.ts` (nouveau)

### Vérifications à faire en session 111

- [ ] grep `"sansdetour\.fr"` tests/analytics.test.ts → max 1 résultat (le test "ANALYTICS_HOSTS includes apex + www" qui pin l'état actuel)
- [ ] grep `ANALYTICS_HOSTS\|ANALYTICS_EVENTS` src/ tests/ → résultats dans analytics.ts + analytics.test.ts (consumers)
- [ ] `ls api/_lib/parse-top.ts tests/parse-top.test.ts` → 2 fichiers présents
- [ ] grep `~412 tests` CLAUDE.md → 0 résultat (aligné sur ~424)

---

## Session 111 — 2026-05-17

### Vérification session 110

- [VERIFIED] tests/analytics.test.ts contient 2 `sansdetour.fr` mais les deux dans le pin-shape test (`ANALYTICS_HOSTS.has(...)`) — non-drift
- [VERIFIED] 19 occurrences de ANALYTICS_HOSTS/EVENTS diffusées
- [VERIFIED] api/_lib/parse-top.ts + tests/parse-top.test.ts présents
- [VERIFIED] CLAUDE.md "~424 tests"
- 424/424 tests verts, typecheck clean

### Bugs fixés (App.tsx coverage gap + STALE_AFTER_DAYS drift + GROUP_MAPPING shape)

- [FIXED] `src/App.tsx` 0 test coverage · L'App shell mounte TopBar + ErrorBoundary autour de chaque route avec `<ErrorBoundary key={location.pathname}>` — le `key` prop est l'invariant critique qui remount la boundary à chaque navigation, sinon un crash sur /play laisserait la fallback affichée même après navigation vers /result (documenté dans le commentaire source mais 0 test). Sans test, supprimer accidentellement la `key` prop dans un refactor casserait silencieusement la récupération multi-routes. 4 tests dans `tests/App.test.tsx` : children rendus inside <main>, TopBar mounted sur /play, ErrorBoundary trappe les crashes route-level, l'isolation route-par-route (un App séparé pour /result mount le healthy child même si /play crashed dans un autre render). · `tests/App.test.tsx` (nouveau)
- [FIXED] `STALE_AFTER_DAYS = 10` private const dans `src/components/FreshnessBanner.tsx`, dupliqué implicitement dans les tests (test "switches to stale tone title when past > 10 days" + `mk(15, 0)` hardcoded) · Si la cadence sync change (par exemple weekly+slack → 14j, ou bi-weekly → 20j), le const update mais les tests passent toujours avec leur literal 15 — soit en testant l'ancienne policy (faux positif vert), soit en cassant correctement si 15 < nouvelle threshold (vrai négatif). Pas safe dans le sens "rename-safe". Fix : export `STALE_AFTER_DAYS`, tests utilisent `mk(STALE_AFTER_DAYS, 4)` (boundary fresh) et `mk(STALE_AFTER_DAYS + 1, 0)` (just over) — un bump propage automatiquement aux tests + ils testent toujours le bon boundary. · `src/components/FreshnessBanner.tsx`, `tests/FreshnessBanner.test.tsx`
- [FIXED] `GROUP_MAPPING` (13 entrées AN organeRef → GroupCode) avait seulement 3 entrées testées indirectement via `parseRaw` · Une faute de frappe comme `PO845470: "HOR"` → `"DR"` ou la suppression accidentelle d'une entrée non-couverte (UDR-PO872880, GDR, DEM, etc.) passerait toute la suite. Fix : `tests/an-groups.test.ts` (nouveau) — 13 tests pinent chaque entrée explicite + 3 tests d'invariants globaux : (a) le nombre total d'entrées (no surprise add/drop), (b) tous les targets non-null sont des GroupCode valides, (c) UDR est le seul code reach par 2 organeRefs (PO847173 + PO872880, reconstitution 2025-09). Toute édition d'une entrée surface ici plutôt que masquer la régression dans la pipeline d'ingestion. · `tests/an-groups.test.ts` (nouveau)

### Vérifications à faire en session 112

- [ ] `ls tests/App.test.tsx tests/an-groups.test.ts` → 2 fichiers présents
- [ ] grep `STALE_AFTER_DAYS` src/ tests/ → résultats dans FreshnessBanner.tsx (déclaration export) + FreshnessBanner.test.tsx (import + 2 usages)
- [ ] grep -c "PO[0-9]\{6\}" tests/an-groups.test.ts → 13 (toutes les entrées pinées)
- [ ] grep `~424 tests` CLAUDE.md → 0 résultat (aligné sur ~444)

---

## Session 112 — 2026-05-17

### Vérification session 111

- [VERIFIED] tests/App.test.tsx + tests/an-groups.test.ts présents
- [VERIFIED] STALE_AFTER_DAYS diffused 7× (export, comment, usage source, import test, 2 boundary usages)
- [VERIFIED] 16 occurrences PO… dans an-groups test (13 entries pinées + 3 mentions dans comments)
- [VERIFIED] CLAUDE.md "~444 tests"
- 444/444 tests verts, typecheck clean

### Bugs fixés (affinement query param drift + Cover restart() + Cover analytics)

- [FIXED] `?affinement=1` query param strings dupliqués 3× · `"affinement"` (param name) + `"1"` (value) dans `src/lib/routes.ts` (composition `PLAY_AFFINEMENT`) + `src/routes/Play.tsx` (deux reads `params.get("affinement") === "1"` aux lignes 72 et 125). Un rename à `?refinement=1` aurait propagé via PLAY_AFFINEMENT (la nav cible Result→Play) mais laissé les reads de Play.tsx sur l'ancien nom — résultat : la nav vers refinement passe MAIS Play.tsx ne reconnaît plus le flag et redirect immédiatement au Result vide. Bug silencieux jusqu'au runtime. Fix : export `AFFINEMENT_PARAM = "affinement"` + `AFFINEMENT_VALUE = "1"` + helper `isAffinementMode(params: URLSearchParams): boolean` depuis routes.ts. PLAY_AFFINEMENT composé via les consts. Play.tsx migre les 2 reads vers `isAffinementMode(params)`. 5 nouveaux tests dans `tests/routes.test.ts` qui pinent la composition + le contrat de l'helper (true sur ?affinement=1, false sur ?affinement=0/=true/=vide/absent, rename-safe via const-built URLSearchParams). · `src/lib/routes.ts`, `src/routes/Play.tsx`, `tests/routes.test.ts`
- [FIXED] Cover.tsx `restart()` flow 0 test coverage · Le flow critique "Recommencer à zéro" (visible quand hasInProgress=true) faisait : window.confirm(plural-rule) → if cancel return → resetSession + track("cover_restarted") + navigate(ROUTES.play). 0 test. Un refactor qui (a) drop le confirm, (b) inverse l'ordre track-avant-confirm, (c) casse la plural rule sur votesCount===1, (d) skip resetSession en cas de cancel → tous silencieux. 6 tests ajoutés : bouton rendu si hasInProgress, confirm appelé avant destroy, singulier ("Ton vote en cours") sur 1 vote, pluriel ("Tes 3 votes en cours") sur N votes, confirm OK → session wiped + analytics fired, confirm cancel → session preserved + 0 analytics. · `tests/Cover.test.tsx`
- [FIXED] Cover.tsx analytics events `cover_started` / `cover_resumed` / `cover_footer_nav × 3` 0 verifications · Cover fire 6+ events (cover_started, cover_resumed, cover_result_revisit, cover_partial_result, cover_footer_nav avec 3 targets distincts, cover_restarted), tous lus par le dashboard Plausible — une régression silencieuse qui change la chaine d'événement (par exemple un refactor qui renomme `cover_started` → `start_clicked` pour cohérence) casserait le funnel sans test. 5 tests ajoutés : start() fresh fires `cover_started` (et NON `cover_resumed`), start() resume fires `cover_resumed`, cover_footer_nav avec target=methode/legal/contact sur les 3 liens du footer. · `tests/Cover.test.tsx`

### Vérifications à faire en session 113

- [ ] grep `params.get("affinement")` src/ → 0 résultat (tous migrés vers isAffinementMode)
- [ ] grep `isAffinementMode\|AFFINEMENT_PARAM\|AFFINEMENT_VALUE` src/ tests/ → résultats dans routes.ts + Play.tsx + routes.test.ts
- [ ] grep -c "describe" tests/Cover.test.tsx → 4 describes (Cover original + 3 nouveaux ajoutés)
- [ ] grep `~444 tests` CLAUDE.md → 0 résultat (aligné sur ~459)

---

## Session 113 — 2026-05-17

### Vérification session 112

- [VERIFIED] 0 résultat pour `params.get("affinement")` dans src/ — toutes les reads migrées vers `isAffinementMode(params)`
- [VERIFIED] 25 occurrences de `isAffinementMode|AFFINEMENT_PARAM|AFFINEMENT_VALUE` diffusées
- [VERIFIED] tests/Cover.test.tsx contient 4 describes (original + start analytics + restart flow + footer nav)
- [VERIFIED] CLAUDE.md "~459 tests"
- 459/459 tests verts, typecheck clean

### Bugs fixés (METHODE_SECTIONS extraction + 2 analytics test gaps)

- [FIXED] Section ids `["01"..."07"]` + labels dupliqués 4× dans `src/routes/Methode.tsx` + tests · Le tableau `[["01", "Données"], ["02", "Scrutins"], …]` était inliné dans la Sommaire JSX (lignes 90-97 originales) ; les 7 `<Section n="01" title="…">` éléments le redupliquaient (lignes 114-160) ; `tests/Methode.test.tsx` hardcodait `["01"..."07"]` deux fois (lignes 32 et 43). Ajouter une section 08 à la Sommaire SANS la matching `<Section n="08">` body en bas silently 404s le lien TOC en prod (le tests ne checke pas la cardinality round-trip). Fix : export `METHODE_SECTIONS` (const tuple `[id, label]`) depuis Methode.tsx + helper type `MethodeSectionId`. Sommaire itère le const. Tests itèrent aussi → adding a new section auto-extend the existing assertions + le nouveau test "exactly 7 sections" pin le count pour signaler des add/drop accidentels. · `src/routes/Methode.tsx`, `tests/Methode.test.tsx`
- [FIXED] Methode `methode_toc_click` analytics — 0 vérification · Le track fire un event par lien TOC cliqué avec `{ section: n }` props, lu par le dashboard Plausible pour mesurer quels sections les users consultent le plus. Régression silencieuse possible : un refactor qui drop le `onClick={() => track(...)}` casserait la metric sans casser le rendering. Test ajouté itère `METHODE_SECTIONS` et fire un click par TOC link (scopé à `<nav aria-label="Sommaire">` pour éviter le faux positif via le cross-section anchor `<a href="#methode-07">section 07</a>` dans l'intro qui n'a PAS d'onClick — bug initial du test fix séparément, voir bug ↓). · `tests/Methode.test.tsx`
- [FIXED] TopBar `topbar_nav` analytics × 4 targets — 0 vérification · TopBar menu fire `topbar_nav` avec `{ target: "result"|"methode"|"legal"|"contact" }` sur chacun des 4 menuitems, drives the Plausible "menu engagement" funnel. 0 test du call site. 4 tests ajoutés : un par target (Méthode / Legal / Contact / Mon résultat). Le dernier est gated sur `votes >= MIN_FOR_RANKING` (lien "Mon résultat" hidden sinon), donc le test seed la session avec MIN_FOR_RANKING votes avant d'ouvrir le menu — pattern aligné avec les tests existants de session 106. · `tests/TopBar.test.tsx`

### Bug bonus (test scoping)

- [FIXED] (en passant) Mon premier draft du test methode_toc_click utilisait `screen.getAllByRole("link").find(a => a.getAttribute("href") === "#methode-01")` qui matchait 8 anchors (7 TOC + 1 cross-section dans l'intro) et le `.find()` retournait le PREMIER en DOM order — c'est-à-dire le cross-section anchor de l'intro (`<a href="#methode-07">section 07</a>`), qui n'a PAS d'onClick. Test failed avec "track called 0 times". Découvert via un debug test temporaire. Fix : scoper à `screen.getByRole("navigation", { name: /Sommaire/ })` puis `.querySelectorAll("a")` à l'intérieur — exclut l'intro cross-link tout en couvrant les 7 TOC links. · `tests/Methode.test.tsx`

### Vérifications à faire en session 114

- [ ] grep `METHODE_SECTIONS` src/ tests/ → résultats dans Methode.tsx (déclaration + usage) + Methode.test.tsx (import + iterations)
- [ ] grep `'["01", "Données"]'` src/ tests/ → max 1 résultat (la déclaration `METHODE_SECTIONS`)
- [ ] grep `topbar_nav\|methode_toc_click` tests/TopBar.test.tsx tests/Methode.test.tsx → résultats dans chacun des deux fichiers
- [ ] grep `~459 tests` CLAUDE.md → 0 résultat (aligné sur ~465)

---

## Session 114 — 2026-05-17

### Vérification session 113

- [VERIFIED] METHODE_SECTIONS diffused : déclaration + usage dans Methode.tsx, import + iterations dans Methode.test.tsx
- [VERIFIED] 1 occurrence seulement de `["01", "Données"]` dans src/ (la déclaration)
- [VERIFIED] tests/TopBar.test.tsx contient le describe topbar_nav, tests/Methode.test.tsx contient le describe methode_toc_click
- [VERIFIED] CLAUDE.md "~465 tests"
- 465/465 tests verts, typecheck clean

### Bugs fixés (useFreshnessOnce silent-fail + Cover remaining analytics + Methode round-trip)

- [FIXED] `useFreshnessOnce` silent-failure contract jamais testé · Le `.catch(() => {})` dans le hook swallow une rejection de `fetchFreshness()` — par contrat la banner ne rend pas (graceful degradation). Documenté dans le commentaire source mais 0 test. Supprimer le catch (crash de Cover au premier blip réseau) ou changer son comportement (par exemple setError(true)) passerait CI vert. 1 test ajouté : mock `fetchFreshness` pour rejeter, render le hook via une harness, vérifier que `info` reste null + que `fetchFreshness` a été appelé exactement 1 fois. · `tests/useFreshnessOnce.test.tsx`
- [FIXED] Cover.tsx 2 analytics events restants non testés · `cover_result_revisit` fire dans `start()` quand `hasCompleted = true` (user revient après avoir fini 20 votes et clique "Voir mon résultat") ; `cover_partial_result` fire sur le link "Voir mon résultat partiel" gated sur `canSeePartialResult = votes >= MIN_FOR_RANKING`. Bug initial du draft : j'ai d'abord testé `cover_result_revisit` en attendant que l'auto-resume effect le fire automatiquement, mais l'event ne fire QUE dans `start()` — pas dans l'effect. Correction : fromLogo state bypass l'effect, puis fireEvent.click sur le bouton "Voir mon résultat". 4 tests ajoutés : cover_result_revisit fired via click (pas via effect), pas fired sur fresh visit, cover_partial_result fired sur le link click, partial-result link absent below MIN_FOR_RANKING. · `tests/Cover.test.tsx`
- [FIXED] Methode "no orphan Section body" round-trip guard manquant · La test existante "renders one numbered section per METHODE_SECTIONS entry" itère METHODE_SECTIONS et vérifie chaque id rendu — catche un body manquant. Mais le REVERSE direction (ajouter un `<Section n="08">` JSX sans `["08", "..."]` dans METHODE_SECTIONS) passait silently : la section rend OK, juste pas dans la TOC. Le user voit le contenu mais ne peut pas y naviguer via l'index. 1 test ajouté : count des `[role="region"][id^="methode-"]` landmarks et asserts === METHODE_SECTIONS.length — un body orphelin surface immédiatement. · `tests/Methode.test.tsx`

### Vérifications à faire en session 115

- [ ] grep `mockRejectedValueOnce.*fetchFreshness` tests/useFreshnessOnce.test.tsx → 1 résultat
- [ ] grep `cover_result_revisit\|cover_partial_result` tests/Cover.test.tsx → 4+ résultats (les nouveaux tests)
- [ ] grep `no orphan Section body` tests/Methode.test.tsx → 1 résultat (le commentaire du nouveau test)
- [ ] grep `~465 tests` CLAUDE.md → 0 résultat (aligné sur ~471)

---

## Session 115 — 2026-05-17

### Vérification session 114

- [VERIFIED] 1 occurrence de `mockRejectedValueOnce` dans `tests/useFreshnessOnce.test.tsx` (le silent-fail test)
- [VERIFIED] 8 occurrences de `cover_result_revisit|cover_partial_result` dans `tests/Cover.test.tsx`
- [VERIFIED] le test "no orphan body" (légèrement différent du wording checklist mais same intent) présent dans `tests/Methode.test.tsx`
- [VERIFIED] CLAUDE.md "~471 tests"
- 471/471 tests verts, typecheck clean

### Bugs fixés (composeShareText extraction + THRESHOLD export + flip-card a/button guard)

- [FIXED] `share()` text composition inline dans `src/routes/Result.tsx` · La logique pure (top-6 mapping, numérotation `${i+1}.`, séparateur ` · `, partial-vs-complete lead branch) vivait inline dans le handler async. Untestable sans orchestrer le full Result component + navigator.share + clipboard + prompt chain. Fix : extract dans `src/lib/share.ts` avec `composeShareText({ ranked, isPartial, total, target })` + const exporté `SHARE_TOP_N = 6` (anti-magic-number). Result.tsx import + appelle. 10 tests dans `tests/share.test.ts` : numbered format, ` : ` séparateur entre lead et summary, short-label not full-name, partial-vs-complete lead branches, SHARE_TOP_N truncation (11-group ranking → cut à 6), shorter ranked list passes through. · `src/lib/share.ts` (nouveau), `src/routes/Result.tsx`, `tests/share.test.ts` (nouveau)
- [FIXED] `THRESHOLD = 0.70` private dans `src/lib/compute-positions.ts` · La const documente l'invariant Methode §03 ("≥70% des votants effectifs"), mais les tests hardcodaient `70` / `7` comme valeurs boundary 8 fois. Un futur bump à 0.75 (par exemple "stricter consensus") aurait laissé les tests passer silently : `pour: 70` avec THRESHOLD=0.75 retourne "divisé" (cassant le test "returns pour at threshold") MAIS le boundary test `pour: 7, contre: 2, abstention: 1` (= 70%) aurait CONTINUÉ à retourner "divisé" sans message d'erreur clair sur l'intent ("70% boundary inclusive"). Fix : export `THRESHOLD`, tests dérivent les inputs (par exemple `pour = THRESHOLD * 100`) + 2 tests new : "boundary inclusive (≥, not >)" derived from THRESHOLD + "just below THRESHOLD is divisé" + "THRESHOLD is the canonical 0.70" pin-the-value (déliberate bump via this test edit). · `src/lib/compute-positions.ts`, `tests/compute-positions.test.ts`
- [FIXED] `useFlipCardA11y` keyboard guard `if (tgt.closest("a, button")) return;` untested · Sans ce guard, Enter sur le bouton ✨IA embarqué dans le recto déclencherait DEUX actions : (1) le onClick du bouton (open MethodeSheet), (2) le onFlip du card (flip to verso). Quand le modal ferme, la card est verso au lieu de recto — bug UX silent. Pareil pour ArrowRight sur le link AN dans le verso. Le guard existe depuis longtemps mais 0 test. 2 tests ajoutés : Enter sur un inner <button> n'appelle PAS onFlip, ArrowRight sur un inner <a> n'appelle PAS onSwipe. · `tests/useFlipCardA11y.test.tsx`

### Vérifications à faire en session 116

- [ ] grep `composeShareText\|SHARE_TOP_N` src/ tests/ → résultats dans share.ts + Result.tsx + share.test.ts
- [ ] grep `^export const THRESHOLD` src/lib/compute-positions.ts → 1 résultat
- [ ] grep `inner <button>\|inner <a>` tests/useFlipCardA11y.test.tsx → 2 résultats (les 2 nouveaux tests)
- [ ] grep `~471 tests` CLAUDE.md → 0 résultat (aligné sur ~482)

---

## Session 116 — 2026-05-17

### Vérification session 115

- [VERIFIED] 24 occurrences de `composeShareText|SHARE_TOP_N` dans src/ + tests/
- [VERIFIED] `export const THRESHOLD = 0.70` dans compute-positions.ts
- [VERIFIED] 2 tests `inner <button>` + `inner <a>` dans useFlipCardA11y.test.tsx
- [VERIFIED] CLAUDE.md "~482 tests"
- 482/482 tests verts, typecheck clean

### Bugs fixés (Result.tsx coverage gap × 3 — refaire / personnalites_revealed / affinement+result_reached)

- [FIXED] `Result.tsx` route 0 test file existait · La page principale post-deck (3rd-most-visited route après Cover et Play) avait 5 analytics events tirés inline + le flow refaire() destructif (window.confirm + resetSession + forgetCover + navigate) + un toggle disclosure "Voir les personnalités" avec un once-per-mount guard via `personnalitesReportedRef` — aucun de ces side-effects ni call sites n'avait de test. Création de `tests/Result.test.tsx` avec 3 describe blocks couvrant : (1) refaire() flow, (2) result_reached + affinement_clicked, (3) personnalites_revealed. Pattern : `vi.mock("../src/lib/supabase", () => ({ supabase: null }))` au top pour pin la fallback path (même approche que tests/scrutins.test.ts session 108) + `seedSession(N)` helper pour amorcer la localStorage session avec N votes sur les premiers fixtures, ce qui permet à computeAlignment de retourner un Result réel plutôt que le Skeleton.
- [FIXED] `refaire()` confirm flow + result_refaire analytics 0 test · 6 tests : button rendu après TARGET votes, confirm appelé avant destroy, plural phrasing "Tes 20 votes et ton résultat seront perdus" pin l'invariant text, confirm OK → loadSession()=null + hasSeenCover()=false (symétrique avec Cover.restart qui ne forget pas) + result_refaire fired + navigate to /cover, confirm cancel → tout préservé + 0 analytics + reste sur /result, track-AFTER-confirm ordering (mock.invocationCallOrder) pour pin l'invariant "no inflated metric on cancel". · `tests/Result.test.tsx` (nouveau)
- [FIXED] `personnalites_revealed` once-per-mount guard 0 test · La gate `personnalitesWithData.length > 0` requiert que les fixtures aient un `votes_personnalites` field, mais dev-fixtures.json ne le contient pas (V2 P2 ingest output, pas baked-in). Fix : `vi.spyOn(scrutinsMod, "fetchScrutins").mockResolvedValue(pool)` avec pool synthétique où chaque scrutin a un votes_personnalites complet. 3 tests : fires sur le first toggle-open, NE fire PAS sur les toggles suivants même après 5 clicks (once-per-mount guard via personnalitesReportedRef), NE fire PAS sur un closing toggle. Aussi : 3 tests pour result_reached + affinement_clicked + un test négatif "no affinement on partial". · `tests/Result.test.tsx`

### Vérifications à faire en session 117

- [ ] `ls tests/Result.test.tsx` → présent
- [ ] grep -c "describe" tests/Result.test.tsx → 3 (refaire flow / affinement+result_reached / personnalites_revealed)
- [ ] grep "vi.mock.*supabase.*null" tests/Result.test.tsx → 1 résultat (le pattern fallback-pin)
- [ ] grep `~482 tests` CLAUDE.md → 0 résultat (aligné sur ~494)

---

## Session 117 — 2026-05-17

### Vérification session 116

- [VERIFIED] tests/Result.test.tsx présent
- [VERIFIED] 3 describes dans tests/Result.test.tsx (refaire flow / result_reached+affinement / personnalites_revealed)
- [VERIFIED] 1 résultat pour `vi.mock.*supabase.*null` (le pattern fallback-pin)
- [VERIFIED] CLAUDE.md "~494 tests"
- 494/494 tests verts, typecheck clean

### Bugs fixés (useModalA11y opener-focus restore + vote-feedback extraction + LOW_DATA_THRESHOLD drift)

- [FIXED] `useModalA11y` "restore focus to opener on close" contract tested seulement indirectement · Le hook capture `openerRef.current = document.activeElement` à l'open (next animation frame) puis restore via `openerRef.current?.focus()` au close. Le contrat est testé via MethodeSheet.test.tsx + TopBar.test.tsx ("restores focus to the trigger after close"), mais un refactor qui dropperait `openerRef` aurait fait failer 2 fichiers de tests consumer sans signal clair "ce hook a perdu son contrat". 2 tests directs ajoutés : (1) opener focus → open → close → opener regains focus, (2) edge case opener captured = null (document.body) → close noop without throw. · `tests/useModalA11y.test.tsx`
- [FIXED] Play.tsx aria-live vote-feedback labels + ZWSP alternation inline dans `handleVote` · Les 3 labels ("Voté pour. Carte suivante.", etc.) et la logique non-évidente `prev.endsWith("​") ? "" : "​"` (zero-width-space append/strip pour forcer aria-live="polite" à re-announce sur 2 votes "pour" consécutifs) vivaient inline dans le handler — donc 0 test possible sans rendre Play.tsx. Sans le ZWSP toggle, SR users perdent la confirmation du 2e vote identique. Fix : extract dans `src/lib/vote-feedback.ts` avec `voteLabel(choice)` + `nextVoteLabel(prev, choice)` + const exporté `ZWSP`. Play.tsx import + appelle. 10 tests dans `tests/vote-feedback.test.ts` : 3 base labels pin, ZWSP first call appended, alternation flips on repeat, alternation cross-choice, alternation never produces 2 consecutive identical strings (loop sanity), ZWSP est U+200B 1-char. · `src/lib/vote-feedback.ts` (nouveau), `src/routes/Play.tsx`, `tests/vote-feedback.test.ts` (nouveau)
- [FIXED] `tests/PersonnaliteRow.test.tsx` hardcodait `counted: 1` / `counted: 2` literal boundaries au lieu de dériver de `LOW_DATA_THRESHOLD` · Même drift pattern que sessions 111 (STALE_AFTER_DAYS) et 115 (THRESHOLD). Si LOW_DATA_THRESHOLD bumpe à 5 (par exemple "stricter low-data definition"), counted=2 reste below threshold et le test "renders trop peu de données" passe silently — sans tester le nouveau boundary. Fix : tests dérivent `justBelow = LOW_DATA_THRESHOLD - 1` + 2 nouveaux tests : (a) boundary inclusif au-dessus (counted === LOW_DATA_THRESHOLD → PAS tooLittleData), (b) pin-the-value `expect(LOW_DATA_THRESHOLD).toBe(3)` pour rendre un futur bump délibéré. · `tests/PersonnaliteRow.test.tsx`

### Vérifications à faire en session 118

- [ ] `ls src/lib/vote-feedback.ts tests/vote-feedback.test.ts` → 2 fichiers présents
- [ ] grep `nextVoteLabel\|voteLabel\|ZWSP` src/ tests/ → résultats dans vote-feedback.ts + Play.tsx + vote-feedback.test.ts
- [ ] grep `LOW_DATA_THRESHOLD` tests/PersonnaliteRow.test.tsx → 4+ résultats (l'import + 4 usages)
- [ ] grep `~494 tests` CLAUDE.md → 0 résultat (aligné sur ~507)

---

## Session 118 — 2026-05-17

### Vérification session 117

- [VERIFIED] src/lib/vote-feedback.ts + tests/vote-feedback.test.ts présents
- [VERIFIED] 36 occurrences de `nextVoteLabel|voteLabel|ZWSP` dans src/ + tests/
- [VERIFIED] 13 occurrences de LOW_DATA_THRESHOLD dans tests/PersonnaliteRow.test.tsx
- [VERIFIED] CLAUDE.md "~507 tests"
- 507/507 tests verts, typecheck clean

### Bugs fixés (Cover.test MIN_FOR_RANKING boundary + Methode prose drift × 2 constants)

- [FIXED] `tests/Cover.test.tsx:214` hardcodait `for (let i = 1; i <= 5; i++) recordVote(...)` au lieu de dériver de `MIN_FOR_RANKING` · Même drift pattern que sessions 111 / 115 / 117. Si MIN_FOR_RANKING bumpe à 8 (raise the threshold), le test "fires cover_partial_result on link click" continuerait avec 5 votes — sous le nouveau threshold → canSeePartialResult=false → le lien n'est plus rendu → test fail. La fail est correcte, mais le test SHOULD adapt automatiquement. TopBar.test.tsx avait déjà le bon pattern (`for (let i = 1; i <= MIN_FOR_RANKING; i++)`) depuis session 106. Fix : import + utilisation cohérente. · `tests/Cover.test.tsx`
- [FIXED] `src/routes/Methode.tsx:132` hardcodait "jamais plus de 2 scrutins du même dossier" + "jamais plus de 2 scrutins du même sujet" en literal · Les 2 caps de composition de deck (DEFAULT_CAP_PER_DOSSIER + DEFAULT_CAP_PER_CHAPEAU_PREFIX, exportés en session 109 depuis src/lib/deck.ts) étaient documentés en literal "2" dans la prose user-facing — un bump à 3 dans deck.ts laisserait la Methode disant "jamais plus de 2", mensonge sur la policy effective. Fix : interpolation `{DEFAULT_CAP_PER_DOSSIER}` + `{DEFAULT_CAP_PER_CHAPEAU_PREFIX}` dans le JSX. 2 tests Methode round-trip ajoutés qui asserts que la prose contient le bon literal dérivé du const. · `src/routes/Methode.tsx`, `tests/Methode.test.tsx`
- [FIXED] `src/routes/Methode.tsx:138` hardcodait "si ≥ 70% des votants effectifs" dans le bloc `<Formula>` · `THRESHOLD = 0.70` est exporté depuis src/lib/compute-positions.ts (session 115) — un bump à 0.75 laisserait la Methode disant "≥ 70%" alors que le code applique 75%. Fix : interpolation `{Math.round(THRESHOLD * 100)}%` dans le Formula. 1 test round-trip ajouté. · `src/routes/Methode.tsx`, `tests/Methode.test.tsx`

### Vérifications à faire en session 119

- [ ] grep "for.*<= 5\|for.*<= 4" tests/Cover.test.tsx → 0 résultat (toutes les boundaries dérivent)
- [ ] grep "jamais plus de 2\|≥ 70%" src/routes/Methode.tsx → 0 résultat (toutes interpolées)
- [ ] grep "DEFAULT_CAP_PER_DOSSIER\|THRESHOLD" src/routes/Methode.tsx tests/Methode.test.tsx → 4+ résultats
- [ ] grep `~507 tests` CLAUDE.md → 0 résultat (aligné sur ~510)

---

## Session 119 — 2026-05-17

### Vérification session 118

- [VERIFIED] 0 hardcoded `<= 5` dans tests/Cover.test.tsx (toutes les boundaries dérivent de MIN_FOR_RANKING)
- [VERIFIED] 0 hardcoded "jamais plus de 2" / "≥ 70%" dans src/routes/Methode.tsx (toutes interpolées)
- [VERIFIED] DEFAULT_CAP_PER_DOSSIER + THRESHOLD imports diffusés dans Methode.tsx + tests
- [VERIFIED] CLAUDE.md "~510 tests"
- 510/510 tests verts, typecheck clean

### Bugs fixés (LEGISLATURE_LABEL + MAX_POINTS_CLES_BULLETS extraction + Card render slice consolidation)

- [FIXED] `"17e LÉGISLATURE"` literal dupliqué entre Cover.tsx:144 et Result.tsx:198 · Le label de la législature est référencé sur 2 routes différentes ; la V3 transition vers la 18e légis aurait demandé 2 edits avec drift possible (Cover updated mais Result oublié → headers inconsistants). Fix : `export const LEGISLATURE_LABEL = "17e LÉGISLATURE"` depuis src/types/index.ts. Cover.tsx + Result.tsx interpolent. 2 tests round-trip ajoutés (un par route) qui pin la visibilité du label rendu. · `src/types/index.ts`, `src/routes/Cover.tsx`, `src/routes/Result.tsx`, `tests/Cover.test.tsx`, `tests/Result.test.tsx`
- [FIXED] `MAX_POINTS_CLES_BULLETS = 3` + `MAX_WORDS_PER_BULLET = 7` inline dans `scripts/lib/parse-summary.ts` normalizePointsCles · Les 2 caps LLM (slice(0,3) + length<=7) défendent le DB contre un modèle qui ignore les contraintes du prompt — mais elles étaient des magic numbers inline. Drift surface : la Methode §07 prose hardcodait "3 points clés" (drift entre l'ingest cap et la documentation) ; Card.tsx renderait `points_cles.slice(0, 3)` inline (drift entre l'ingest cap et le render UI). Fix : export `MAX_POINTS_CLES_BULLETS` + `MAX_WORDS_PER_BULLET` depuis `src/types/index.ts` (cross-project source-of-truth ; scripts → src import direction, jamais l'inverse). parse-summary.ts import depuis ../../src/types. · `src/types/index.ts`, `scripts/lib/parse-summary.ts`
- [FIXED] `Card.tsx` `points_cles.slice(0, 3)` + `Methode.tsx` "3 points clés" literal · Card.tsx ligne 162 hardcodait `slice(0, 3)` — si bump à 5 bullets dans parse-summary, la Card render seulement 3 quand même. Methode §07 hardcodait "3 points clés" dans la prose — si bump à 5, la documentation lie aux users. Fix : Card.tsx + Methode.tsx import MAX_POINTS_CLES_BULLETS depuis src/types et interpolent. 1 test Methode round-trip ajouté qui assert que la §07 prose contient `${MAX_POINTS_CLES_BULLETS} points clés`. · `src/components/Card.tsx`, `src/routes/Methode.tsx`, `tests/Methode.test.tsx`

### Vérifications à faire en session 120

- [ ] grep `LEGISLATURE_LABEL` src/ tests/ → 6+ résultats (déclaration + 2 routes + 2 tests + 1 type doc)
- [ ] grep `MAX_POINTS_CLES_BULLETS` src/ scripts/ tests/ → 5+ résultats (déclaration + parse-summary + Card + Methode + tests)
- [ ] grep `"17e LÉGISLATURE"\|slice(0, 3)` src/routes/ src/components/Card.tsx → 0 résultat literal (tous via const)
- [ ] grep `~510 tests` CLAUDE.md → 0 résultat (aligné sur ~513)

---

## Session 120 — 2026-05-17

### Vérification session 119

- [VERIFIED] 11 occurrences de LEGISLATURE_LABEL dans src/ + tests/
- [VERIFIED] 12 occurrences de MAX_POINTS_CLES_BULLETS dans src/ + scripts/ + tests/
- [VERIFIED] 0 literal `"17e LÉGISLATURE"` ou `slice(0, 3)` dans src/routes/ + src/components/Card.tsx
- [VERIFIED] CLAUDE.md "~513 tests"
- 513/513 tests verts, typecheck clean

### Bugs fixés (parse-summary boundary derivation + ANTHROPIC_BATCHES_URL extraction + an-cache shape tests)

- [FIXED] `tests/parse-summary.test.ts` hardcodait `3 bullets` / `7 mots` boundaries en literal · Même drift pattern que sessions 111/115/117/118 (STALE_AFTER_DAYS, THRESHOLD, LOW_DATA_THRESHOLD, MIN_FOR_RANKING). Si MAX_POINTS_CLES_BULLETS bumpe à 5 ou MAX_WORDS_PER_BULLET à 10, les boundary tests passent toujours silently sur les anciens valeurs (`exactly 7 words unchanged` reste vrai car 7 < 10). Fix : tests dérivent les inputs (`MAX_POINTS_CLES_BULLETS + 2` items, `MAX_WORDS_PER_BULLET + 2` words) + un test pin-the-value pour rendre un bump délibéré. · `tests/parse-summary.test.ts`
- [FIXED] `https://api.anthropic.com/v1/messages/batches` dupliqué 6× sur 3 scripts (ingest-an x3, debug-batch x2, resume-ingest x1) · Une migration vers v2 ou un endpoint régional aurait demandé 6 edits + tests. Fix : export `ANTHROPIC_BATCHES_URL` + helpers `anthropicBatchUrl(id)` et `anthropicBatchResultsUrl(id)` depuis `scripts/lib/env.ts`. Les 3 scripts importent + composent. 4 tests dans tests/env.test.ts : base URL pin-the-value, builders deterministic, rename-safe linkage. Side fix : resume-ingest.ts utilisait `BATCH_ID!` sans assertion explicite — le ! est désormais documenté avec un comment lié au pattern ANTHROPIC_KEY narrowing dance. · `scripts/lib/env.ts`, `scripts/ingest-an.ts`, `scripts/debug-batch.ts`, `scripts/resume-ingest.ts`, `tests/env.test.ts`
- [FIXED] `scripts/lib/an-cache.ts` 0 dedicated test · CACHE_DIR + JSON_DIR consts (single source of truth pour le local cache path, read par 3 ingest scripts) + iterEligibleScrutins async generator (walk + filter + parseRaw chain). Le generator résiste au vi.mock("node:fs") en raison de vitest specifier matching complexity — l'iterateur est intégration-testé via les vrai ingest runs, pas testé ici. Mais les consts shape sont pin-able. 4 tests dans `tests/an-cache.test.ts` : CACHE_DIR is /tmp/sd-an-cache pin, JSON_DIR = CACHE_DIR + "/json" round-trip, JSON_DIR is absolute, JSON_DIR basename is "json" (defense contre un rename accidentel de la segment vers "data" qui casserait les 3 ingest scripts qui font fs.readdir(JSON_DIR)). · `tests/an-cache.test.ts` (nouveau)

### Vérifications à faire en session 121

- [ ] grep "https://api\.anthropic\.com/v1/messages/batches" scripts/ → 1 résultat seulement (la déclaration dans env.ts)
- [ ] grep "ANTHROPIC_BATCHES_URL\|anthropicBatchUrl\|anthropicBatchResultsUrl" scripts/ tests/ → 8+ résultats
- [ ] `ls tests/an-cache.test.ts` → présent
- [ ] grep `~513 tests` CLAUDE.md → 0 résultat (aligné sur ~522)

---

## Session 121 — 2026-05-17

### Vérification session 120

- [VERIFIED] 1 occurrence seulement de l'URL Batches dans scripts/ (la déclaration env.ts:63)
- [VERIFIED] 27 occurrences des helpers `ANTHROPIC_BATCHES_URL|anthropicBatchUrl|anthropicBatchResultsUrl` dans scripts/ + tests/
- [VERIFIED] tests/an-cache.test.ts présent
- [VERIFIED] CLAUDE.md "~522 tests"
- 522/522 tests verts, typecheck clean

### Bugs fixés (ANTHROPIC_API_VERSION + AN_OPEN_DATA_URL + RetryError extraction)

- [FIXED] `"anthropic-version": "2023-06-01"` dupliqué 4× sur 3 scripts (ingest-an, debug-batch × 2, resume-ingest) · Même drift pattern que la session 120 sur ANTHROPIC_BATCHES_URL. Un bump à 2024-... aurait demandé 4 edits avec drift possible. Fix : export `ANTHROPIC_API_VERSION = "2023-06-01"` + helper `anthropicHeaders(apiKey)` depuis env.ts qui retourne `{ content-type, x-api-key, anthropic-version }`. Les 3 scripts importent + appellent. ingest-an's COMMON_HEADERS devient `() => anthropicHeaders(ANTHROPIC_KEY!)` avec un comment explicatif sur le `!` (intentional : optional key au module scope, narrowed au call site après la guard). 4 tests : version pin-the-value, headers contiennent les 3 fields, accepte string vide (fallback path), retourne fresh object pas shared ref. · `scripts/lib/env.ts`, `scripts/ingest-an.ts`, `scripts/debug-batch.ts`, `scripts/resume-ingest.ts`, `tests/env.test.ts`
- [FIXED] `https://data.assemblee-nationale.fr/` URL inline 3× dans src/routes (Legal + Methode × 2) + 1× dans scripts/ingest-an.ts (base de l'URL ZIP) · Un futur changement de domaine AN aurait touché 4 sites. Fix : export `AN_OPEN_DATA_URL` depuis `src/types/index.ts`. Legal.tsx + Methode.tsx (2 sites) utilisent `href={AN_OPEN_DATA_URL}`. scripts/ingest-an.ts construit `BULK_URL = ${AN_OPEN_DATA_URL}static/...` au lieu d'inliner. Cross-project import direction respectée : scripts → src/types (jamais inverse). Test Legal.tsx existant migré pour dériver `expect(anLink).toHaveAttribute("href", AN_OPEN_DATA_URL)` au lieu du literal. · `src/types/index.ts`, `src/routes/Legal.tsx`, `src/routes/Methode.tsx`, `scripts/ingest-an.ts`, `tests/Legal.test.tsx`
- [FIXED] Bloc `<div><p>{message}</p><button onClick={retry}>Réessayer</button></div>` dupliqué 4× (Play.tsx 3 branches d'erreur + Result.tsx 2 branches) · 22 lignes de styles identiques répétés avec la même copy "Réessayer" — un changement de background button ou padding devait être édité 4× en lockstep. Fix : extract `src/components/RetryError.tsx` avec props `{ message, onRetry, retryLabel? }`. Le `retryLabel` optionnel sert au cas Play.tsx "Plus de scrutins disponibles" qui navigate au lieu de retry et utilise "Voir mon résultat" comme label. Play.tsx + Result.tsx remplacent les 5 sites par `<RetryError ... />`. 5 tests : message rendered, default "Réessayer", retryLabel override, onClick fires once, type="button". · `src/components/RetryError.tsx` (nouveau), `src/routes/Play.tsx`, `src/routes/Result.tsx`, `tests/RetryError.test.tsx` (nouveau)

### Vérifications à faire en session 122

- [ ] grep `"anthropic-version": "2023-06-01"` scripts/ → 1 résultat seulement (la déclaration env.ts)
- [ ] grep `"https://data\.assemblee-nationale\.fr/"` src/ scripts/ → 1 résultat seulement (la déclaration src/types/index.ts)
- [ ] grep `Impossible de charger les scrutins\|Réessayer` src/routes/ → 0 occurrence des strings literal dans Play.tsx + Result.tsx (toutes passent par RetryError)
- [ ] grep `~522 tests` CLAUDE.md → 0 résultat (aligné sur ~531)

---

## Session 122 — 2026-05-17

### Vérification session 121

- [VERIFIED] 0 inline `"anthropic-version": "2023-06-01"` dans scripts/ (la string passe par anthropicHeaders)
- [VERIFIED] 1 occurrence seulement de `"https://data.assemblee-nationale.fr/"` (la déclaration src/types/index.ts)
- [VERIFIED] 0 literal "Réessayer" dans src/routes/, plus 2 occurrences de "Impossible de charger les scrutins..." en `message=` prop de RetryError (acceptable — drift candidate pour session 122)
- [VERIFIED] CLAUDE.md "~531 tests"
- 531/531 tests verts, typecheck clean

### Bugs fixés (ANTHROPIC_MODEL + RETRY_FETCH_FAILED_MESSAGE + FALLBACK_* boundary consts)

- [FIXED] `model: "claude-haiku-4-5"` magic string inline dans scripts/ingest-an.ts:314 · Le modèle Anthropic Haiku 4.5 est documenté dans CLAUDE.md (V2 P1) et est crucial pour le pricing (Batches = 50% off) + les capacités (web_search supporté). Un upgrade silencieux (haiku-4-6, sonnet, etc.) changerait le coût et les outputs sans être tracké. Fix : export `ANTHROPIC_MODEL = "claude-haiku-4-5"` depuis env.ts ; ingest-an.ts importe + utilise. 1 test pin-the-value pour rendre tout upgrade délibéré. · `scripts/lib/env.ts`, `scripts/ingest-an.ts`, `tests/env.test.ts`
- [FIXED] La string `"Impossible de charger les scrutins. Vérifie ta connexion puis réessaie."` dupliquée 2× (Play.tsx + Result.tsx loadError branches) · Même drift surface que la session 121 sur le bloc UI complet (que j'avais corrigé en extrayant RetryError) — mais le `message=` prop restait identique sur les 2 sites. Une rewording aurait dû être éditée 2× en lockstep. Fix : export `RETRY_FETCH_FAILED_MESSAGE` depuis `src/components/RetryError.tsx` (le component où la prop atterrit). Play.tsx + Result.tsx importent + passent la const. 2 tests : pin-the-value + render-verbatim. · `src/components/RetryError.tsx`, `src/routes/Play.tsx`, `src/routes/Result.tsx`, `tests/RetryError.test.tsx`
- [FIXED] `fallbackSummary` magic numbers `14` (titre_pedago words cap), `25` (contexte words cap), `3` (chapeau eyebrow words) inline · Tests hardcodaient `14` aussi. Une bump à 16 ou 30 propage seulement dans parse-summary.ts et les tests passent silently sur l'ancien cap (input de 20 mots tronque à 16 + ellipsis, mais test attend length=14). Même drift pattern que sessions 111/115/117/118/120. Fix : export `FALLBACK_TITRE_PEDAGO_WORDS = 14`, `FALLBACK_CONTEXTE_WORDS = 25`, `FALLBACK_CHAPEAU_WORDS = 3` depuis parse-summary.ts. Tests dérivent les inputs + 1 nouveau test "truncates contexte at FALLBACK_CONTEXTE_WORDS" (le contexte truncation n'était pas testé du tout) + 1 pin-the-value des 3 const. · `scripts/lib/parse-summary.ts`, `tests/parse-summary.test.ts`

### Vérifications à faire en session 123

- [ ] grep `"claude-haiku-4-5"` scripts/ → 1 résultat seulement (la déclaration env.ts)
- [ ] grep `RETRY_FETCH_FAILED_MESSAGE` src/ tests/ → 6+ résultats
- [ ] grep `FALLBACK_TITRE_PEDAGO_WORDS\|FALLBACK_CONTEXTE_WORDS\|FALLBACK_CHAPEAU_WORDS` scripts/ tests/ → 10+ résultats
- [ ] grep `~531 tests` CLAUDE.md → 0 résultat (aligné sur ~536)

---

## Session 123 — 2026-05-17

### Vérification session 122

- [VERIFIED] 1 occurrence seulement de "claude-haiku-4-5" dans scripts/ (la déclaration env.ts:85)
- [VERIFIED] 11 occurrences de RETRY_FETCH_FAILED_MESSAGE dans src/ + tests/
- [VERIFIED] 26 occurrences de FALLBACK_*_WORDS dans scripts/ + tests/
- [VERIFIED] CLAUDE.md "~536 tests"
- 536/536 tests verts, typecheck clean

### Bugs fixés (3 magic numbers in ingest-an.ts → env.ts consts + bounds tests)

- [FIXED] `max_tokens: 4096` magic inline dans `scripts/ingest-an.ts:318` buildRequestParams · Cap critical pour l'analyse field (6 string[] arrays, ~600-900 tokens observed) — un refactor accidentel à 1024 truncate analyse silently. Fix : export `ANTHROPIC_INGEST_MAX_TOKENS = 4096` depuis env.ts ; ingest-an.ts importe + utilise. 2 tests : pin-the-value à 4096, sanity bound ≥ 2048 pour défendre contre un drop accidentel sous le ceiling typique observé. · `scripts/lib/env.ts`, `scripts/ingest-an.ts`, `tests/env.test.ts`
- [FIXED] `max_uses: 2` magic inline dans le web_search tool config · CLAUDE.md V2 P1 documente "1 à 2 recherches max" pour cost control — une bump à 5 multiplie le per-batch search charge. Fix : export `MAX_WEB_SEARCHES_PER_SCRUTIN = 2`. 2 tests : pin-the-value à 2, sanity bound 1 ≤ N ≤ 5 (défend contre un runaway). · `scripts/lib/env.ts`, `scripts/ingest-an.ts`, `tests/env.test.ts`
- [FIXED] `setTimeout(res, 15000)` polling interval inline dans pollBatch · 15s match l'Anthropic-recommended cadence pour les batches typiques de 2-10min — too aggressive burn la status-endpoint quota, too slow delay l'orchestrator. Une régression à 100ms DoS-erait le status endpoint sur un batch de 5+ min. Fix : export `BATCH_POLL_INTERVAL_MS = 15_000` depuis env.ts. 2 tests : pin-the-value, sanity bound ≥ 1000ms pour défendre contre un DoS accidentel. · `scripts/lib/env.ts`, `scripts/ingest-an.ts`, `tests/env.test.ts`

### Vérifications à faire en session 124

- [ ] grep "max_tokens: 4096\|max_uses: 2\|setTimeout.*15000" scripts/ingest-an.ts → 0 résultat literal (tous via const)
- [ ] grep "ANTHROPIC_INGEST_MAX_TOKENS\|MAX_WEB_SEARCHES_PER_SCRUTIN\|BATCH_POLL_INTERVAL_MS" scripts/ tests/ → 8+ résultats
- [ ] grep `~536 tests` CLAUDE.md → 0 résultat (aligné sur ~542)

---

## Session 124 — 2026-05-17

### Vérification session 123

- [VERIFIED] 0 literal `max_tokens: 4096`, `max_uses: 2`, `setTimeout(..., 15000)` dans scripts/ingest-an.ts (tous via const)
- [VERIFIED] 24 occurrences des 3 tuning consts dans scripts/ + tests/
- [VERIFIED] CLAUDE.md "~542 tests"
- 542/542 tests verts, typecheck clean

### Bugs fixés (CARD_FACE_BOX_SHADOW + WEB_SEARCH_TOOL_VERSION + SUPABASE_UPDATE_BATCH_SIZE)

- [FIXED] `boxShadow: "0 18px 30px -16px #000"` dupliqué identique dans `src/components/Card.tsx:26` et `src/components/CardSkeleton.tsx:15` · CardSkeleton mirror le layout de Card pendant le chargement — un re-design de la shadow (par exemple plus lourd à high density screens) devait être édité 2× en lockstep. Une edit one-sided laisserait le skeleton avec une shadow différente, créant un visuel flash au load. Fix : export `CARD_FACE_BOX_SHADOW` depuis Card.tsx (canonical source) ; CardSkeleton.tsx importe + utilise. 1 test Skeleton round-trip pin la shadow CSS sur le DOM rendu. · `src/components/Card.tsx`, `src/components/CardSkeleton.tsx`, `tests/Skeleton.test.tsx`
- [FIXED] `"web_search_20260209"` magic string inline dans scripts/ingest-an.ts:330 (tool.type) · Anthropic versionne le web_search tool par date suffix (YYYYMMDD) — bumpera en 2026/2027 quand le tool gagne des breaking changes. Une typo (`20260229` au lieu de `20260209` par exemple) silently fail la batch request seulement au runtime. Fix : export `WEB_SEARCH_TOOL_VERSION = "web_search_20260209"` depuis env.ts. 2 tests : pin-the-value + format match `/^web_search_\d{8}$/`. · `scripts/lib/env.ts`, `scripts/ingest-an.ts`, `tests/env.test.ts`
- [FIXED] `const BATCH = 20` magic local dans scripts/ingest-personnalites.ts:89 (parallel UPDATE chunking) · La taille des batches parallèles vers Supabase contrôle la load sur le PostgREST pool (defaults ~10-15). Un bump accidentel à 100 causerait des 503s cascadants sur un ingest de 100 rows. Fix : export `SUPABASE_UPDATE_BATCH_SIZE = 20` depuis env.ts. 2 tests : pin-the-value + sanity bound 1 ≤ N ≤ 50. · `scripts/lib/env.ts`, `scripts/ingest-personnalites.ts`, `tests/env.test.ts`

### Vérifications à faire en session 125

- [ ] grep `"0 18px 30px -16px #000"` src/ → 1 résultat seulement (la déclaration CARD_FACE_BOX_SHADOW dans Card.tsx)
- [ ] grep `"web_search_20260209"` scripts/ → 1 résultat seulement (la déclaration env.ts)
- [ ] grep `const BATCH = 20` scripts/ → 0 résultat (migrated to SUPABASE_UPDATE_BATCH_SIZE)
- [ ] grep `~542 tests` CLAUDE.md → 0 résultat (aligné sur ~547)

---

## Session 125 — 2026-05-17

### Vérification session 124

- [VERIFIED] 1 occurrence seulement de "0 18px 30px -16px #000" dans src/ (CARD_FACE_BOX_SHADOW déclaration)
- [VERIFIED] 1 occurrence seulement de "web_search_20260209" dans scripts/ (env.ts déclaration)
- [VERIFIED] 0 occurrence de `const BATCH = 20` dans scripts/ (migré vers SUPABASE_UPDATE_BATCH_SIZE)
- [VERIFIED] CLAUDE.md "~547 tests"
- 547/547 tests verts, typecheck clean

### Bugs fixés (BRAND_BG + brand colors extraction + MAX_SHARE_CARD_BARS)

- [FIXED] `#1d1f24` brand-background hex dupliqué 4× (api/share-card.ts:13 BG, public/manifest.webmanifest:9 background_color + theme_color, index.html:23 meta theme-color) · Une re-skin (par exemple bump l'OKLCH bg vers une lightness différente) aurait laissé certains des 4 sites stale + créé un visual flash entre la PWA install (manifest background), le tab color (HTML meta), et la share card SVG (Satori). Fix : create `api/_lib/brand-colors.ts` avec `BRAND_BG = "#1d1f24"` + 3 autres colors approximations (BRAND_ACCENT/INK/INK_2 — les autres are share-card-only). share-card.ts importe + utilise. Static files (manifest, index.html) restent inline mais 3 nouveaux tests dans `tests/brand-colors.test.ts` pin la sync : lit le manifest JSON parse + lit l'index.html avec regex, asserts === BRAND_BG. Une drift one-sided (TS changé mais static oublié) surface immédiatement. · `api/_lib/brand-colors.ts` (nouveau), `api/share-card.ts`, `tests/brand-colors.test.ts` (nouveau)
- [FIXED] BRAND_ACCENT / BRAND_INK / BRAND_INK_2 hex approximations encore inline dans `api/share-card.ts` · Même drift surface que BRAND_BG mais ces 3 ne sont utilisées que par la share card SVG (pas par manifest/HTML). Fix : extract en consts dans le même `brand-colors.ts`. share-card.ts garde `const BG = BRAND_BG` etc. comme aliases pour minimiser le diff. 3 tests : shape (6-digit hex), distinct (no accidental dup), BRAND_BG pin-the-value. · `api/_lib/brand-colors.ts`, `api/share-card.ts`
- [FIXED] `bars.slice(0, 8)` inline dans api/share-card.ts (URL input cap) · Le `8` (max bars accepted from `?t=` param) is distinct de `SHARE_TOP_N = 6` dans src/lib/share.ts (natural-language summary cap). The two are intentionally different (SVG fits more rows than tweet preview) but the relationship was undocumented. Fix : export `MAX_SHARE_CARD_BARS = 8` from `api/_lib/parse-top.ts`. share-card.ts importe + utilise. 2 tests : pin-the-value, et un round-trip qui asserts `MAX_SHARE_CARD_BARS >= SHARE_TOP_N` (the SVG must always be able to display everything the text mentions). · `api/_lib/parse-top.ts`, `api/share-card.ts`, `tests/parse-top.test.ts`

### Vérifications à faire en session 126

- [ ] grep `"#1d1f24"` api/ public/ index.html → 4+ résultats avec exactement 3 hors brand-colors.ts (les 2 dans manifest + 1 dans index.html — static files)
- [ ] grep `BRAND_BG\|BRAND_ACCENT\|BRAND_INK\|BRAND_INK_2` api/ tests/ → 8+ résultats
- [ ] grep `MAX_SHARE_CARD_BARS\|SHARE_TOP_N` api/ src/ tests/ → 8+ résultats
- [ ] grep `~547 tests` CLAUDE.md → 0 résultat (aligné sur ~555)

---

## Session 126 — 2026-05-17

### Vérification session 125

- [VERIFIED] 5 occurrences de "#1d1f24" : brand-colors.ts (déclaration) + 2 dans manifest + 2 dans index.html (theme-color meta + noscript body — c'est le 5e site que la session 125 avait raté, fixé en session 126 bug #1)
- [VERIFIED] 25 occurrences des 4 BRAND_* consts dans api/ + tests/
- [VERIFIED] 23 occurrences de MAX_SHARE_CARD_BARS|SHARE_TOP_N dans api/ + src/ + tests/
- [VERIFIED] CLAUDE.md "~555 tests"
- 555/555 tests verts, typecheck clean

### Bugs fixés (noscript bg pin + Plausible data-domain sync + seed-supabase missing catch)

- [FIXED] `index.html:65` noscript body `background: #1d1f24` pas couvert par le brand-colors sync test (session 125) · Le `<noscript>` fallback page (JS désactivé) utilise la même brand bg que la live app, mais le test de session 125 ne pinnait que le `<meta name="theme-color">`. Une re-skin qui bumpe BRAND_BG aurait laissé la noscript page mismatched (visible aux users JS-disabled qui voient une couleur de fond qui ne match plus le tab color). Fix : nouvelle assertion qui extrait le `<noscript>` block via regex puis match `background:\s*#hex` à l'intérieur, asserts === BRAND_BG. · `tests/brand-colors.test.ts`
- [FIXED] `index.html:55` Plausible `data-domain="sansdetour.fr"` non synchronisé avec `ANALYTICS_HOSTS` (session 110) · Le `<script defer data-domain="..." src="https://plausible.io/...">` tag déclare le dashboard target ; `ANALYTICS_HOSTS` est la runtime allow-list dans `track()`. Si on rebrand vers `.com`, mettre à jour seulement un des deux ferait que les events de la prod runtime sont émis mais perdus (ANALYTICS_HOSTS gate les bloque) OU émis vers un dashboard inexistant. Fix : test qui lit index.html, extract le data-domain via regex, et asserts qu'il est member de `ANALYTICS_HOSTS`. · `tests/analytics.test.ts`
- [FIXED] `scripts/seed-supabase.ts:38` `main();` sans `.catch()` handler · Les 4 autres scripts (ingest-an, resume-ingest, debug-batch, ingest-personnalites) ont tous le pattern `main().catch((e) => { console.error(e); process.exit(1); });`. seed-supabase était l'outlier — une rejection silently exit avec code 0 (modulo l'UnhandledPromiseRejectionWarning), masquant les failures depuis npm run seed en CI / dev shells. Fix : ajouter le catch+exit(1) pattern aligné sur les 4 autres scripts. · `scripts/seed-supabase.ts`

### Vérifications à faire en session 127

- [ ] grep "background: #" index.html → 1 résultat (la noscript body, déjà pin via test)
- [ ] grep "data-domain" tests/analytics.test.ts → 1 résultat (le sync test)
- [ ] grep "main()\.catch" scripts/seed-supabase.ts → 1 résultat (l'ajout)
- [ ] grep `~555 tests` CLAUDE.md → 0 résultat (aligné sur ~557)

---

## Session 127 — 2026-05-17

### Vérification session 126

- [VERIFIED] 5 lignes "noscript" dans tests/brand-colors.test.ts (le nouveau pin)
- [VERIFIED] 5 lignes "data-domain" dans tests/analytics.test.ts (le sync test)
- [VERIFIED] seed-supabase.ts a main().catch
- [VERIFIED] CLAUDE.md "~557 tests"
- 557/557 tests verts, typecheck clean

### Bugs fixés (TAGLINE + BRAND_NAME + LEGISLATURE_LABEL_LOWERCASE sync entre TS + static files)

- [FIXED] Tagline `"Pas les programmes. Les vrais votes."` dupliqué 5× dans static files · sites : `index.html` (meta description + og:description prefix + twitter:description + title compound) + `public/manifest.webmanifest` (description). Plus split dans Cover.tsx pour le hero styling. Une rewording aurait demandé 5 edits aux static files en lockstep, plus le source — sinon l'OG preview + le tab title + la PWA manifest divergent. Fix : export `TAGLINE` depuis src/types/index.ts. Les static files restent inline mais 5 tests dans `tests/site-metadata.test.ts` lisent index.html + manifest et asserts chaque field. og:description teste avec `.startsWith(TAGLINE)` (la string est étendue avec marketing copy). · `src/types/index.ts`, `tests/site-metadata.test.ts` (nouveau)
- [FIXED] Brand name `"Sans Détour"` dupliqué 5× dans static files (manifest name + short_name + index.html og:title + twitter:title + title compound) · Même drift surface. Fix : export `BRAND_NAME = "Sans Détour"`. 5 tests pin chaque site. · `src/types/index.ts`, `tests/site-metadata.test.ts`
- [FIXED] `index.html:46` og:description hardcode `"17e législature"` (lowercase) · Drift vs `LEGISLATURE_LABEL = "17e LÉGISLATURE"` (uppercase, exporté session 119). Une V3 transition vers 18e bumperait LEGISLATURE_LABEL mais oublier l'og:description silently laisse les social previews stale (showed dans les WhatsApp/Slack/iMessage thumbnails). Fix : export `LEGISLATURE_LABEL_LOWERCASE = "17e législature"` (sibling const, lowercase variant pour la prose). 1 test pin l'og:description `.toContain(LEGISLATURE_LABEL_LOWERCASE)`. · `src/types/index.ts`, `tests/site-metadata.test.ts`

### Vérifications à faire en session 128

- [ ] `ls tests/site-metadata.test.ts` → présent
- [ ] grep `TAGLINE\|BRAND_NAME\|LEGISLATURE_LABEL_LOWERCASE` src/ tests/ → 10+ résultats
- [ ] grep `~557 tests` CLAUDE.md → 0 résultat (aligné sur ~568)

---

## Session 128 — 2026-05-17

### Vérification session 127

- [VERIFIED] tests/site-metadata.test.ts présent
- [VERIFIED] 31 occurrences de TAGLINE|BRAND_NAME|LEGISLATURE_LABEL_LOWERCASE dans src/ + tests/
- [VERIFIED] CLAUDE.md "~568 tests"
- 568/568 tests verts, typecheck clean

### Bugs fixés (PROD_ORIGIN sync + icon paths sync + Cover h1 TAGLINE round-trip)

- [FIXED] `https://sansdetour.fr/` prod origin hardcoded 4× dans index.html (canonical, og:url, og:image, twitter:image) · Une rebrand vers `.com` aurait laissé certains des 4 sites stale → social previews / canonical / Twitter card pointant vers l'ancien domain. Distinct de ANALYTICS_HOSTS (qui contient apex + www pour le runtime gate de track()). Fix : export `PROD_ORIGIN = "https://sansdetour.fr"` depuis src/types. 4 tests dans site-metadata pin chacun des sites (canonical/og:url asserts === PROD_ORIGIN + "/", og:image/twitter:image asserts startsWith PROD_ORIGIN). · `src/types/index.ts`, `tests/site-metadata.test.ts`
- [FIXED] Icon paths `/icons/icon-192.png` (× 3) et `/icons/icon-512.png` (× 3) dupliquées entre index.html et public/manifest.webmanifest · Le manifest declare les icons canoniques pour PWA install ; index.html les re-référence pour apple-touch-icon, favicon, og:image, twitter:image. Un rename de l'icon dans manifest sans propager à index.html laisse les references HTML 404 (favicon vide dans le tab, OG preview blank). 3 tests dans site-metadata : apple-touch-icon, favicon, et og:image (path relatif après stripping de PROD_ORIGIN) doivent tous être listés dans manifest.icons[].src. · `tests/site-metadata.test.ts`
- [FIXED] Cover.tsx hero `<h1>` tagline split JSX (3 nodes : "Pas les programmes." + `<br/>` + `<span>Les vrais votes</span>` + `<span>.</span>`) sans pin contre TAGLINE · Le split est intentional pour le accent color sur "Les vrais votes" + le final period, mais une copy-paste mistake (mot omis ou swap) aurait silently divergé le hero du tab title / OG description / manifest description qui pin tous contre TAGLINE. Fix : test Cover.tsx asserts `normalize(h1.textContent).replace(/\s/g, "") === normalize(TAGLINE).replace(/\s/g, "")` (whitespace-tolerant compare, le `<br/>` flatten sans introduire d'espace en jsdom). · `tests/Cover.test.tsx`

### Vérifications à faire en session 129

- [ ] grep `PROD_ORIGIN` src/ tests/ → 6+ résultats
- [ ] grep `TAGLINE` tests/Cover.test.tsx → 1+ résultat
- [ ] grep `~568 tests` CLAUDE.md → 0 résultat (aligné sur ~576)

---

## Session 129 — 2026-05-17

### Vérification session 128

- [VERIFIED] 14 occurrences de PROD_ORIGIN dans src/ + tests/
- [VERIFIED] 5 occurrences de TAGLINE dans tests/Cover.test.tsx
- [VERIFIED] CLAUDE.md "~576 tests"
- 576/576 tests verts, typecheck clean

### Bugs fixés (APP_LOCALE + OG_LOCALE derivation + Card date formatting)

- [FIXED] BCP47 locale `"fr-FR"` hardcoded 4× : Card.tsx (2× `toLocaleDateString`), index.html (`<html lang>`), public/manifest.webmanifest (`lang`) · Un futur i18n move (en-US pour diaspora, fr-CA) aurait demandé 4 edits in-lockstep — un site oublié laisserait par exemple les dates Card.tsx en fr-FR pendant que le manifest indique fr-CA, créant des confusions de format. Fix : export `APP_LOCALE = "fr-FR"` depuis src/types. Card.tsx + tests sync utilisent la const. · `src/types/index.ts`, `src/components/Card.tsx`
- [FIXED] `og:locale` content "fr_FR" (avec underscore) hardcodé dans index.html, parallèle de `<html lang="fr-FR">` (avec hyphen) · OG spec utilise l'underscore mais c'est la MEME semantic locale. Un i18n move qui update APP_LOCALE mais oublie og:locale laisse les social previews stale. Fix : export `OG_LOCALE = APP_LOCALE.replace("-", "_")` — derived for-free. 1 test pin la relationship (`expect(OG_LOCALE).toBe(APP_LOCALE.replace(...))`). · `src/types/index.ts`, `tests/site-metadata.test.ts`
- [FIXED] 0 test pin la sync entre html lang + manifest lang + og:locale + APP_LOCALE · Sans ces tests, un drift one-sided passe silently. 3 nouveaux tests dans site-metadata : html lang === APP_LOCALE, manifest.lang === APP_LOCALE, og:locale === OG_LOCALE. · `tests/site-metadata.test.ts`

### Vérifications à faire en session 130

- [ ] grep `APP_LOCALE` src/ tests/ → 6+ résultats (déclaration + Card.tsx + 3 sites pinés via tests)
- [ ] grep `'"fr-FR"'` src/ → 1 résultat seulement (la déclaration APP_LOCALE)
- [ ] grep `OG_LOCALE` src/ tests/ → 4+ résultats
- [ ] grep `~576 tests` CLAUDE.md → 0 résultat (aligné sur ~580)

---

## Session 130 — 2026-05-17

### Vérification session 129

- [VERIFIED] 16 occurrences de APP_LOCALE dans src/ + tests/
- [VERIFIED] 1 occurrence seulement de `"fr-FR"` literal (la déclaration APP_LOCALE)
- [VERIFIED] 7 occurrences de OG_LOCALE
- [VERIFIED] CLAUDE.md "~580 tests"
- 580/580 tests verts, typecheck clean

### Bugs fixés (ERROR_REPORT_SUBJECT + READING_PAGE_MAX_WIDTH + share-card footer derivation)

- [FIXED] `"Sans Détour — Signalement d'une erreur factuelle"` mailto subject dupliqué entre `src/components/MethodeSheet.tsx:123` et `tests/contact.test.ts:34` · Le prefix "Sans Détour" est en réalité BRAND_NAME (session 127) mais le subject était hardcoded en literal. Une rebrand changeant BRAND_NAME laisserait le subject mailto stale, créant une dissonance entre le tab title / OG previews (updated) et l'inbox email subject (stale). Fix : export `ERROR_REPORT_SUBJECT = `${BRAND_NAME} — Signalement…`` depuis src/lib/contact.ts. MethodeSheet + test importent. 1 test pin `ERROR_REPORT_SUBJECT.startsWith(BRAND_NAME)` round-trip. · `src/lib/contact.ts`, `src/components/MethodeSheet.tsx`, `tests/contact.test.ts`
- [FIXED] `maxWidth: 720` literal dupliqué dans `src/main.tsx:27` (RouteLoader) et `src/routes/Methode.tsx:60` · Même width pour les pages de lecture (Methode + lazy-load fallback). Un bump à 760 (pour better line-length) sans propager au RouteLoader créerait un visual flash de width pendant le lazy chunk load. Fix : export `READING_PAGE_MAX_WIDTH = 720` depuis src/types. main.tsx + Methode.tsx importent. 1 test Methode round-trip pin `style.maxWidth === ${N}px`. · `src/types/index.ts`, `src/main.tsx`, `src/routes/Methode.tsx`, `tests/Methode.test.tsx`
- [FIXED] `"sansdetour.fr"` literal hardcoded dans `api/share-card.ts:90` (SVG card footer text) · La share card affiche le hostname comme footer ("Generated by …"). Distinct de PROD_ORIGIN ("https://sansdetour.fr") mais derivable par strip protocol + trailing slash. Une rebrand à `.com` mettrait à jour PROD_ORIGIN mais pas le footer de la share card → les images sociales partagées montreraient le nouveau brand mais le ancien hostname. Fix : `FOOTER_HOSTNAME = PROD_ORIGIN.replace(/^https?:\/\//, "").replace(/\/$/, "")` à module-load. Cross-project import (`../src/types`) — same pattern que scripts/. · `api/share-card.ts`

### Vérifications à faire en session 131

- [ ] grep `ERROR_REPORT_SUBJECT` src/ tests/ → 4+ résultats
- [ ] grep `READING_PAGE_MAX_WIDTH` src/ tests/ → 5+ résultats
- [ ] grep `"sansdetour.fr"` api/ → 0 résultat (literal disparu, derivé via PROD_ORIGIN)
- [ ] grep `~580 tests` CLAUDE.md → 0 résultat (aligné sur ~582)

---

## Session 131 — 2026-05-17

### Vérification session 130

- [VERIFIED] 7 occurrences de ERROR_REPORT_SUBJECT dans src/ + tests/
- [VERIFIED] 8 occurrences de READING_PAGE_MAX_WIDTH
- [VERIFIED] 0 literal `"sansdetour.fr"` dans api/share-card.ts (derivation seulement)
- [VERIFIED] CLAUDE.md "~582 tests"
- 582/582 tests verts, typecheck clean

### Bugs fixés (PROD_HOSTNAME extraction + TopBar/ANALYTICS_HOSTS/CONTACT_EMAIL derivation)

- [FIXED] `src/components/TopBar.tsx:246` displaye `<span>sansdetour.fr</span>` inline (menu footer label) · Une rebrand updating PROD_ORIGIN aurait laissé ce visible label stale (user voit "sansdetour.com" sur le canonical URL mais "sansdetour.fr" en haut du menu). Fix : export `PROD_HOSTNAME = PROD_ORIGIN.replace(/^https?:\/\//, "").replace(/\/$/, "")` depuis src/types. TopBar.tsx importe + utilise. · `src/types/index.ts`, `src/components/TopBar.tsx`
- [FIXED] `ANALYTICS_HOSTS` set hardcodait "sansdetour.fr" + "www.sansdetour.fr" en literals · Drift même surface : rebrand update les sites visibles mais oublie le runtime gate → events émis depuis la nouvelle prod sont bloqués (gate refuse l'apex). Fix : `ANALYTICS_HOSTS = new Set([PROD_HOSTNAME, \`www.${PROD_HOSTNAME}\`])` derived. 1 test analytics pin la derivation depuis PROD_HOSTNAME. · `src/lib/analytics.ts`, `tests/analytics.test.ts`
- [FIXED] `CONTACT_EMAIL = "contact@sansdetour.fr"` literal hardcoded · La domain part suit le rebrand de PROD_ORIGIN ; seul le local-part ("contact") est stable. Fix : `CONTACT_EMAIL = \`${CONTACT_EMAIL_LOCAL}@${PROD_HOSTNAME}\`` avec CONTACT_EMAIL_LOCAL private. 1 test pin `CONTACT_EMAIL.endsWith(`@${PROD_HOSTNAME}`)` round-trip. Aussi : api/share-card.ts FOOTER_HOSTNAME (session 130 derivation locale) remplacé par PROD_HOSTNAME import direct — single source of truth. · `src/lib/contact.ts`, `tests/contact.test.ts`, `api/share-card.ts`

### Vérifications à faire en session 132

- [ ] grep `PROD_HOSTNAME` src/ api/ tests/ → 12+ résultats
- [ ] grep `'"sansdetour\.fr"'` src/ api/ → 0 résultat (toutes derivées)
- [ ] grep `~582 tests` CLAUDE.md → 0 résultat (aligné sur ~586)

---

## Session 132 — 2026-05-17

### Vérification session 131

- [VERIFIED] 31 occurrences de PROD_HOSTNAME dans src/ + api/ + tests/
- [VERIFIED] 0 literal `"sansdetour.fr"` dans src/ + api/ (les 3 hits restants sont des comments)
- [VERIFIED] CLAUDE.md "~586 tests"
- 586/586 tests verts, typecheck clean

### Bugs fixés (DRY share-text lead + performShare extraction + AbortError consent invariant test)

- [FIXED] `composeShareText` ternaire dans src/lib/share.ts dupliquait `"Mes affinités politiques réelles"` + `"basées sur les vrais votes de l'AN"` sur les 2 branches · Seul le parenthétique `(résultat partiel N/M)` differs. Une rewording aurait dû être éditée 2× en lockstep. Fix : extract `LEAD_PREFIX` / `LEAD_SUFFIX` consts privées + compute `partialParen` séparément ; le lead se compose en une expression unique. Tests existants restent verts (le format de sortie est identique). · `src/lib/share.ts`
- [FIXED] `share()` flow inline dans Result.tsx avec le 3-tier fallback (navigator.share → clipboard → window.prompt) untested · Le contract critique "AbortError = user cancel → ne PAS silently fall through to clipboard" était buried dans un one-liner du handler. Un refactor qui drop le `if (...AbortError) return` aurait silently copié le résultat à l'utilisateur qui a explicitement cancelé. Fix : extract `performShare(text, url)` async function dans share.ts retournant `ShareOutcome` ("shared" | "aborted" | "copied" | "prompted"). Result.tsx remplace les ~15 lignes par un seul `await performShare(...)`. · `src/lib/share.ts`, `src/routes/Result.tsx`
- [FIXED] 0 test pin le AbortError consent invariant + les 3 autres fallback branches · 6 tests dans `tests/share.test.ts` : (a) shared on navigator.share resolve, (b) aborted on AbortError + clipboardSpy.not.toHaveBeenCalled (le critical guard), (c) fallthrough sur non-AbortError, (d) fallthrough sur missing navigator.share (Safari < 13), (e) prompt fallback sur clipboard fail, (f) clipboard payload format pin (`text\nurl` newline-joined). · `tests/share.test.ts`

### Vérifications à faire en session 133

- [ ] grep `performShare` src/ tests/ → 4+ résultats
- [ ] grep `"AbortError"` src/ tests/ → 2+ résultats (la check + le test)
- [ ] grep `~586 tests` CLAUDE.md → 0 résultat (aligné sur ~592)

---

## Session 133 — 2026-05-17

### Vérification session 132

- [VERIFIED] 13 occurrences de performShare dans src/ + tests/
- [VERIFIED] 2 occurrences de "AbortError" (la check dans share.ts + le test pin dans share.test.ts)
- [VERIFIED] CLAUDE.md "~592 tests"
- 592/592 tests verts, typecheck clean

### Bugs fixés (data-domain apex pin + SHARE_SOURCE_LINE + VIEW_RESULT_LABEL)

- [FIXED] `tests/analytics.test.ts` data-domain test asserted `ANALYTICS_HOSTS.has(...)` — passing pour apex OR www variant · Plausible's data-domain doit être l'apex specifically (sinon les events sont split entre 2 dashboards). Le test laissait passer la confusion. Fix : assert `data-domain === PROD_HOSTNAME` (apex only) + maintenir l'assertion ANALYTICS_HOSTS membership comme defense secondaire. · `tests/analytics.test.ts`
- [FIXED] `"basées sur les vrais votes de l'AN"` brand line dupliquée entre src/lib/share.ts (private LEAD_SUFFIX) et api/share-card.ts:81 (SVG card body inline) · Rewording aurait demandé 2 edits in-lockstep. Fix : export `SHARE_SOURCE_LINE` depuis src/types/index.ts (DOM-free pour que api/share-card puisse importer sans pull les navigator/window globals de share.ts). share.ts re-exporte pour ergonomic consumer access. share-card.ts importe + utilise. 1 test pin lead.endsWith(SHARE_SOURCE_LINE). · `src/types/index.ts`, `src/lib/share.ts`, `api/share-card.ts`, `tests/share.test.ts`
- [FIXED] `"Voir mon résultat"` CTA label dupliqué entre `src/routes/Cover.tsx:217` (Cover primary CTA quand hasCompleted) et `src/routes/Play.tsx:227` (RetryError retryLabel quand deck exhausted) · Même user-facing string, drift surface si rewording. Fix : export `VIEW_RESULT_LABEL` depuis src/types. Cover.tsx + Play.tsx importent. 1 test Cover pin la CTA primary === VIEW_RESULT_LABEL. · `src/types/index.ts`, `src/routes/Cover.tsx`, `src/routes/Play.tsx`, `tests/Cover.test.tsx`

### Vérifications à faire en session 134

- [ ] grep `SHARE_SOURCE_LINE\|VIEW_RESULT_LABEL` src/ api/ tests/ → 10+ résultats
- [ ] grep "basées sur les vrais votes" src/ api/ → 1 résultat seulement (la déclaration SHARE_SOURCE_LINE)
- [ ] grep `~592 tests` CLAUDE.md → 0 résultat (aligné sur ~594)

---

## Session 134 — 2026-05-17

### Vérification session 133

- [VERIFIED] 18 occurrences de SHARE_SOURCE_LINE|VIEW_RESULT_LABEL dans src/ + api/ + tests/
- [VERIFIED] 1 résultat seulement de "basées sur les vrais votes" (la déclaration SHARE_SOURCE_LINE)
- [VERIFIED] CLAUDE.md "~594 tests"
- 594/594 tests verts, typecheck clean

### Bugs fixés (WORDMARK_HOME_LABEL + PAGE_HEADER_NAV_LABEL + externalLinkLabel helper)

- [FIXED] `aria-label="Accueil"` dupliqué 4× sur les Wordmark Links (Cover, Methode, Legal, TopBar) · Le label sur le SR a11y rotor doit être identique sur chaque route pour que VoiceOver / NVDA users entendent toujours la même destination ("Lien — Accueil"). Une rewording one-sided créerait de la confusion. Fix : export `WORDMARK_HOME_LABEL = "Accueil"` depuis src/types. Les 4 sites importent. · `src/types/index.ts`, `src/routes/Cover.tsx`, `src/routes/Methode.tsx`, `src/routes/Legal.tsx`, `src/components/TopBar.tsx`
- [FIXED] `aria-label="En-tête de la page"` dupliqué 2× (Methode + Legal) sur le nav landmark du header · Le landmark distinguer le header du body Sommaire/back-link nav dans le SR landmarks rotor. Drift surface modeste (2 sites) mais same drift pattern. Fix : export `PAGE_HEADER_NAV_LABEL`. · `src/types/index.ts`, `src/routes/Methode.tsx`, `src/routes/Legal.tsx`
- [FIXED] `" (nouvel onglet)"` suffix dupliqué 5× sur les external links aria-label (Methode × 4 + Legal × 1) — pattern `aria-label="${visible} (nouvel onglet)"` pour data.assemblee-nationale.fr + github.com/sansdetour · Drift surface notable. Fix : export const `EXTERNAL_LINK_SUFFIX` + helper `externalLinkLabel(visibleText)`. Les 5 sites utilisent `externalLinkLabel("...")`. 4 tests nouveaux dans `tests/aria-labels.test.ts` : pin-the-value des 3 consts + composition test du helper + invariant `endsWith(SUFFIX)`. · `src/types/index.ts`, `src/routes/Methode.tsx`, `src/routes/Legal.tsx`, `tests/aria-labels.test.ts` (nouveau)

### Vérifications à faire en session 135

- [ ] grep `WORDMARK_HOME_LABEL\|PAGE_HEADER_NAV_LABEL\|externalLinkLabel` src/ tests/ → 12+ résultats
- [ ] grep `'aria-label="Accueil"\|aria-label="En-tête de la page"\|(nouvel onglet)'` src/ → 0 literals (toutes derivées sauf la déclaration)
- [ ] grep `~594 tests` CLAUDE.md → 0 résultat (aligné sur ~600)

---

## Session 135 — 2026-05-17

### Vérification session 134

- [VERIFIED] 35 occurrences de WORDMARK_HOME_LABEL/PAGE_HEADER_NAV_LABEL/externalLinkLabel dans src/ + tests/
- [VERIFIED] 0 inline literal "Accueil"/"En-tête de la page"/"(nouvel onglet)" dans src/
- [VERIFIED] CLAUDE.md "~600 tests"
- 600/600 tests verts, typecheck clean

### Bugs fixés (GITHUB_REPO_URL + GITHUB_REPO_DISPLAY + AN_OPEN_DATA_HOSTNAME derivation)

- [FIXED] `"https://github.com/sansdetour"` href hardcoded 3× (Legal + Methode × 2) · Production-blocker URL flagged en TODO (real repo private chez waramere1234/sans-detour). Quand l'équipe finit par open-source le repo, l'URL doit être updated en 3 sites. Fix : export `GITHUB_REPO_URL` depuis src/types. Les 3 sites importent. · `src/types/index.ts`, `src/routes/Legal.tsx`, `src/routes/Methode.tsx`
- [FIXED] `"github.com/sansdetour"` visible text dupliqué 3× (comme link text + arg de externalLinkLabel) · Drift surface identique au URL — un rename github.com/<org> demanderait d'updater visible text + href + aria-label séparément. Fix : export `GITHUB_REPO_DISPLAY` derived par strip-protocol depuis GITHUB_REPO_URL (même pattern que PROD_HOSTNAME ← PROD_ORIGIN). 3 sites utilisent `{GITHUB_REPO_DISPLAY}` comme link text + arg du helper. · `src/types/index.ts`, `src/routes/Legal.tsx`, `src/routes/Methode.tsx`
- [FIXED] `"data.assemblee-nationale.fr"` visible text dupliqué 3× (Methode §01 prose `<code>`, Methode §06 link text, Legal Sources link text) · Même drift surface : si l'AN change de domain (ex: data.an.fr), AN_OPEN_DATA_URL update mais les visible texts restent stale. Fix : export `AN_OPEN_DATA_HOSTNAME` derived depuis AN_OPEN_DATA_URL. 3 sites utilisent `{AN_OPEN_DATA_HOSTNAME}`. 6 nouveaux tests dans `tests/aria-labels.test.ts` : derivation regex pin pour les 2 hostnames, pin-the-value des 4 const (URLs + DISPLAYs), no-protocol/no-slash sanity pour AN_OPEN_DATA_HOSTNAME. · `src/types/index.ts`, `src/routes/Legal.tsx`, `src/routes/Methode.tsx`, `tests/aria-labels.test.ts`

### Vérifications à faire en session 136

- [ ] grep `GITHUB_REPO_URL\|GITHUB_REPO_DISPLAY\|AN_OPEN_DATA_HOSTNAME` src/ tests/ → 16+ résultats
- [ ] grep `"https://github\.com/sansdetour"` src/ → 1 résultat seulement (la déclaration)
- [ ] grep `~600 tests` CLAUDE.md → 0 résultat (aligné sur ~606)

---

## Session 136 — 2026-05-17

### Vérification session 135

- [VERIFIED] 32 occurrences de GITHUB_REPO_URL|GITHUB_REPO_DISPLAY|AN_OPEN_DATA_HOSTNAME dans src/ + tests/
- [VERIFIED] 1 occurrence seulement de "https://github.com/sansdetour" (la déclaration)
- [VERIFIED] CLAUDE.md "~606 tests"
- 606/606 tests verts, typecheck clean

### Bugs fixés (ReadingPageHeader extraction + START_LABEL/RESUME_LABEL + BACK_LINK_LABEL)

- [FIXED] 3-col header block (nav + Retour Link + Wordmark Link, ~20 lines) dupliqué entre `src/routes/Methode.tsx` et `src/routes/Legal.tsx` · Un style tweak (border-color, padding bump, layout change) aurait demandé 2 edits in-lockstep. Fix : extract `<ReadingPageHeader />` component dans `src/components/ReadingPageHeader.tsx`. Methode + Legal importent + utilisent. 5 tests dans `tests/ReadingPageHeader.test.tsx` : nav landmark aria-label, Retour link href, Wordmark link href + aria-label, BACK_LINK_LABEL pin, exactement 2 Links rendered. · `src/components/ReadingPageHeader.tsx` (nouveau), `src/routes/Methode.tsx`, `src/routes/Legal.tsx`, `tests/ReadingPageHeader.test.tsx` (nouveau)
- [FIXED] Cover.tsx CTA triplet incomplet : VIEW_RESULT_LABEL exporté (session 133) mais "Reprendre" + "Commencer" toujours inline · L'extraction d'un seul des 3 labels du triplet est asymétrique — une rewording du premier ("Voir mes résultats" au lieu de "Voir mon résultat") devrait propager à la même semantic position des deux autres. Fix : export `START_LABEL = "Commencer"` + `RESUME_LABEL = "Reprendre"` co-localisés avec VIEW_RESULT_LABEL dans src/types. Cover.tsx utilise les 3 consts. 2 tests Cover.test.tsx nouveaux : fresh visit → START_LABEL, in-progress → RESUME_LABEL. · `src/types/index.ts`, `src/routes/Cover.tsx`, `tests/Cover.test.tsx`
- [FIXED] "Retour" + `‹ ` back-link text inline 2× (Methode + Legal headers) · Fixé en tandem avec bug #1 — `BACK_LINK_LABEL = "Retour"` exporté depuis ReadingPageHeader.tsx, utilisé dans le composant + pin-the-value test. · `src/components/ReadingPageHeader.tsx`, `tests/ReadingPageHeader.test.tsx`

### Vérifications à faire en session 137

- [ ] `ls src/components/ReadingPageHeader.tsx tests/ReadingPageHeader.test.tsx` → 2 fichiers présents
- [ ] grep `START_LABEL\|RESUME_LABEL\|VIEW_RESULT_LABEL` src/ tests/ → 10+ résultats
- [ ] grep `~606 tests` CLAUDE.md → 0 résultat (aligné sur ~613)

---

## Session 137 — 2026-05-17

### Vérification session 136

- [VERIFIED] ReadingPageHeader files (component + test) présents
- [VERIFIED] 17 occurrences de START_LABEL|RESUME_LABEL|VIEW_RESULT_LABEL dans src/ + tests/
- [VERIFIED] CLAUDE.md "~613 tests"
- 613/613 tests verts, typecheck clean

### Bugs fixés (Result.tsx CTA labels + READING_PAGE_SECTION_PADDING + label round-trip tests)

- [FIXED] Result.tsx avait 4 button labels inline ("Refaire depuis le début", "Continuer à affiner", "Continuer le test", "Partager mon résultat") tested via regex match · Une rewording aurait demandé d'updater source + tests en lockstep, plus le confirm prompt sur refaire() qui inclut le label en tant que prefix. Fix : export `SHARE_LABEL`, `REFAIRE_LABEL`, `CONTINUE_REFINE_LABEL`, `CONTINUE_TEST_LABEL_PREFIX` depuis src/types. Result.tsx utilise les 4 consts (incluant le confirm prompt template literal). tests/Result.test.tsx migré pour `new RegExp(LABEL)` au lieu de regex literals. 2 tests new round-trip : confirm prompt `.toContain(REFAIRE_LABEL)`, SHARE_LABEL button rendered. · `src/types/index.ts`, `src/routes/Result.tsx`, `tests/Result.test.tsx`
- [FIXED] `"24px var(--gutter) 48px"` padding inline 2× sur les `<section>` wrappers de Methode + Legal · Same reading-page padding pour les 2 routes. Un bump (par exemple "32px var(--gutter) 64px" pour plus d'air) aurait demandé 2 edits in-lockstep. Fix : export `READING_PAGE_SECTION_PADDING` depuis src/types. Methode + Legal importent + utilisent. 1 test Methode round-trip pin `style.padding === READING_PAGE_SECTION_PADDING`. · `src/types/index.ts`, `src/routes/Methode.tsx`, `src/routes/Legal.tsx`, `tests/Methode.test.tsx`
- [FIXED] Tests Result.test.tsx regex literals (`/Refaire depuis le début/`, etc.) hardcodaient les labels en parallèle · Drift surface — une rewording du label source pourrait laisser la regex test stale (ou inversement). Fix : migrer toutes les regex literals vers `new RegExp(LABEL_CONST)` (4 sites × 4 labels). Same drift fix pattern que les sessions précédentes pour STALE_AFTER_DAYS / THRESHOLD / LOW_DATA_THRESHOLD boundaries. · `tests/Result.test.tsx`

### Vérifications à faire en session 138

- [ ] grep `SHARE_LABEL\|REFAIRE_LABEL\|CONTINUE_REFINE_LABEL\|CONTINUE_TEST_LABEL_PREFIX` src/ tests/ → 15+ résultats
- [ ] grep `READING_PAGE_SECTION_PADDING` src/ tests/ → 5+ résultats
- [ ] grep `"24px var..--gutter.. 48px"` src/ → 1 résultat seulement (la déclaration)
- [ ] grep `~613 tests` CLAUDE.md → 0 résultat (aligné sur ~616)

---

## Session 138 — 2026-05-17

### Vérification session 137

- [VERIFIED] 37 occurrences des 4 Result CTA labels dans src/ + tests/
- [VERIFIED] 8 occurrences de READING_PAGE_SECTION_PADDING
- [VERIFIED] 1 résultat seulement du padding literal (la déclaration)
- [VERIFIED] CLAUDE.md "~616 tests"
- 616/616 tests verts, typecheck clean

### Bugs fixés (RESTART_LABEL + VIEW_PARTIAL_RESULT_LABEL + MENU_*_LABEL × 4)

- [FIXED] `"Recommencer à zéro"` Cover restart label dupliqué 3× dans Cover.tsx (button + 2 confirm-prompt branches) + 6× dans tests/Cover.test.tsx (regex literals) · Rewording aurait demandé d'updater source + 2 confirm branches + 6 tests in lockstep. Fix : export `RESTART_LABEL` depuis src/types. Cover.tsx button + confirm template literals utilisent la const ; tests migrent vers `new RegExp(RESTART_LABEL)`. 1 nouveau test confirm prompt `.toMatch(new RegExp(`^${RESTART_LABEL}`))` round-trip. · `src/types/index.ts`, `src/routes/Cover.tsx`, `tests/Cover.test.tsx`
- [FIXED] `"Voir mon résultat partiel"` Cover link label inline + 3 test regex literals · Même drift surface. Fix : export `VIEW_PARTIAL_RESULT_LABEL`. Cover.tsx + tests migrent. · `src/types/index.ts`, `src/routes/Cover.tsx`, `tests/Cover.test.tsx`
- [FIXED] TopBar 4 menu labels (`"Mon résultat"`, `"Méthode & sources"`, `"Mentions légales"`, `"Contact"`) inline comme `label={...}` props + 9+ regex literals dans tests/TopBar.test.tsx · Drift surface notable. Fix : export `MENU_RESULT_LABEL`, `MENU_METHODE_LABEL`, `MENU_LEGAL_LABEL`, `MENU_CONTACT_LABEL` depuis src/types. TopBar utilise les 4 consts. tests migrent vers `new RegExp(LABEL)`. · `src/types/index.ts`, `src/components/TopBar.tsx`, `tests/TopBar.test.tsx`

### Vérifications à faire en session 139

- [ ] grep `RESTART_LABEL\|VIEW_PARTIAL_RESULT_LABEL` src/ tests/ → 10+ résultats
- [ ] grep `MENU_RESULT_LABEL\|MENU_METHODE_LABEL\|MENU_LEGAL_LABEL\|MENU_CONTACT_LABEL` src/ tests/ → 15+ résultats
- [ ] grep `"Recommencer à zéro"\|"Voir mon résultat partiel"` src/ tests/ → 0 inline literals (sauf comments + déclarations)
- [ ] grep `~616 tests` CLAUDE.md → 0 résultat (aligné sur ~617)

---

## Session 139 — 2026-05-17

### Vérification session 138

- [VERIFIED] 22 occurrences de RESTART_LABEL|VIEW_PARTIAL_RESULT_LABEL dans src/ + tests/
- [VERIFIED] 20 occurrences des 4 MENU_*_LABEL dans src/ + tests/
- [VERIFIED] 0 inline literal "Recommencer à zéro"/"Voir mon résultat partiel" hors déclarations
- [VERIFIED] CLAUDE.md "~617 tests"
- 617/617 tests verts, typecheck clean

### Bugs fixés (VOTE_LABEL/ARIA × 3 + voteButtonAriaLabel + MENU_RESULT_LABEL Play.tsx reuse)

- [FIXED] Play.tsx 3 vote buttons avaient leurs visible texts (`"Contre"`, `"Je passe"`, `"Pour"`) inline · Drift surface : une rewording aurait demandé 3 edits parallèles. Fix : export `VOTE_LABEL_CONTRE`/`VOTE_LABEL_SKIP`/`VOTE_LABEL_POUR` depuis src/types. Play.tsx utilise les 3 consts pour le texte visible des boutons. 2 tests pin-the-value + distinct-set dans `tests/aria-labels.test.ts`. · `src/types/index.ts`, `src/routes/Play.tsx`, `tests/aria-labels.test.ts`
- [FIXED] Play.tsx 3 vote buttons avaient leurs `aria-label` inline (`"Contre — voter contre ce scrutin"`, etc.) avec le pattern `${visible} — ${suffix}` dupliqué · Même drift surface, plus le pattern de composition pas factorisé. Fix : export `voteButtonAriaLabel(visible, suffix) → "${visible} — ${suffix}"` helper + 3 consts `VOTE_ARIA_CONTRE`/`SKIP`/`POUR` derived from `voteButtonAriaLabel(VOTE_LABEL_*, "voter contre ce scrutin"/etc.)`. Play.tsx utilise les 3 ARIA consts. 2 tests round-trip : ARIA labels startWith visible labels + helper composition. · `src/types/index.ts`, `src/routes/Play.tsx`, `tests/aria-labels.test.ts`
- [FIXED] Play.tsx line 318 `"Mon résultat"` inline alors que MENU_RESULT_LABEL existait déjà (session 138) · Drift surface : le label avait été extrait session 138 pour TopBar mais Play avait son propre clone literal. Fix : Play.tsx importe MENU_RESULT_LABEL + utilise comme link text. Aucun nouveau test (TopBar tests pinnent déjà la const). · `src/routes/Play.tsx`

### Vérifications à faire en session 140

- [ ] grep `VOTE_LABEL_CONTRE\|VOTE_LABEL_SKIP\|VOTE_LABEL_POUR\|VOTE_ARIA_CONTRE\|VOTE_ARIA_SKIP\|VOTE_ARIA_POUR\|voteButtonAriaLabel` src/ tests/ → 15+ résultats
- [ ] grep `"voter contre ce scrutin"\|"passer ce scrutin sans voter"\|"voter pour ce scrutin"` src/ tests/ → 1-3 résultats seulement (déclarations dans src/types)
- [ ] grep `~617 tests` CLAUDE.md → 0 résultat (aligné sur ~621)

---

## Session 140 — 2026-05-17

### Vérification session 139

- [VERIFIED] 29 occurrences de VOTE_LABEL_*/VOTE_ARIA_*/voteButtonAriaLabel dans src/ + tests/
- [VERIFIED] 3 occurrences seulement des suffixes ARIA dans src/types (déclarations)
- [VERIFIED] CLAUDE.md "~621 tests"
- 621/621 tests verts, typecheck clean

### Bugs fixés (anScrutinViewAriaLabel + SKELETON_*_LOADING_LABEL × 2 + DEMO_DATA_LABEL_PREFIX)

- [FIXED] Le template `\`Voir le scrutin n°${num} sur le site de l'Assemblée Nationale (nouvel onglet)\`` dupliqué 2× (Card.tsx verso footer + AuditTrail.tsx per-row link) · Drift surface : un i18n flip (EN-US, ou simplement raccourcir "site de l'AN") aurait demandé 2 edits in-lockstep ; pire, le suffix "(nouvel onglet)" était hardcodé alors qu'EXTERNAL_LINK_SUFFIX existait depuis session 134. Fix : export `anScrutinViewAriaLabel(numero)` helper depuis src/types qui réutilise EXTERNAL_LINK_SUFFIX en interne. Card + AuditTrail importent + appellent. 3 tests round-trip dans `tests/aria-labels.test.ts` : pin-the-value avec interpolation, interpolation isolated, endsWith EXTERNAL_LINK_SUFFIX. · `src/types/index.ts`, `src/components/Card.tsx`, `src/components/AuditTrail.tsx`, `tests/aria-labels.test.ts`
- [FIXED] `"Chargement des scrutins"` (CardSkeleton) + `"Chargement de ton résultat"` (ResultSkeleton) dupliqués entre les composants et 3 assertions de tests Skeleton.test.tsx (3 `getByLabelText("Chargement...")` literals) · Drift surface : un rewording côté composant aurait laissé les tests rouges + leur regex stale. Fix : export `SKELETON_CARD_LOADING_LABEL` + `SKELETON_RESULT_LOADING_LABEL` depuis src/types. Les 2 composants utilisent. Skeleton.test.tsx migrent les 3 sites vers les consts. 4 tests dans aria-labels.test.ts : pin-the-value × 2, startsWith "Chargement" SR-skim invariant, distinct-set. · `src/types/index.ts`, `src/components/CardSkeleton.tsx`, `src/components/ResultSkeleton.tsx`, `tests/Skeleton.test.tsx`, `tests/aria-labels.test.ts`
- [FIXED] `"Donnée de démonstration"` prefix dupliqué 3× avec des suffixes différents (Card.tsx aria-label `"...(pas une vraie source AN)"`, AuditTrail.tsx title `"...— sera remplacée par les vrais scrutins de l'AN une fois le pipeline d'ingestion en production"`, AuditTrail.tsx aria-label `"...(pas un scrutin AN réel)"`) · Drift surface : le prefix "Donnée de démonstration" est load-bearing pour le screen-reader skim — c'est la première chose qu'un user entend qui indique "ceci est de la fake data". Les suffixes diffèrent légitimement (un est explanatory, deux sont tighter), mais le prefix doit rester aligné aux 3 sites. Fix : export `DEMO_DATA_LABEL_PREFIX = "Donnée de démonstration"` depuis src/types. Les 3 sites utilisent le prefix + composent leur propre suffix inline. 2 tests : pin-the-value + no-trailing-punct (le prefix ne doit pas se terminer par espace/punct car les consumers ajoutent leurs séparateurs). · `src/types/index.ts`, `src/components/Card.tsx`, `src/components/AuditTrail.tsx`, `tests/aria-labels.test.ts`

### Vérifications à faire en session 141

- [ ] grep `anScrutinViewAriaLabel\|SKELETON_CARD_LOADING_LABEL\|SKELETON_RESULT_LOADING_LABEL\|DEMO_DATA_LABEL_PREFIX` src/ tests/ → 15+ résultats
- [ ] grep `"Chargement des scrutins"\|"Chargement de ton résultat"\|"Donnée de démonstration"` src/ tests/ → 3 résultats seulement (les 3 déclarations dans src/types + aria-labels.test.ts pin-the-value)
- [ ] grep `~621 tests` CLAUDE.md → 0 résultat (aligné sur ~630)

---

## Session 141 — 2026-05-17

### Vérification session 140

- [VERIFIED] 42 occurrences des 4 nouveaux exports (anScrutinViewAriaLabel + SKELETON_*_LOADING_LABEL × 2 + DEMO_DATA_LABEL_PREFIX) dans src/ + tests/
- [VERIFIED] 8 occurrences seulement des 3 strings ("Chargement des scrutins"/"Chargement de ton résultat"/"Donnée de démonstration") = 4 déclarations + 3 pin-the-value tests + 2 comments (pas de drift)
- [VERIFIED] CLAUDE.md "~630 tests"
- 630/630 tests verts, typecheck clean

### Bugs fixés (SHARE_LEAD_PREFIX + CLIPBOARD_PROMPT_LABEL + partialResultMarker)

- [FIXED] `LEAD_PREFIX = "Mes affinités politiques réelles"` était file-local dans `src/lib/share.ts` alors que `tests/share.test.ts` pinnait la wording via 2 `.toContain("Mes affinités politiques réelles, basées sur...")` literals · Drift surface : un rewording (ou un i18n flip EN-US) aurait demandé 3 edits in-lockstep (source + 2 test sites). Fix : export `SHARE_LEAD_PREFIX` depuis src/lib/share.ts. Tests utilisent `expect(out).toContain(\`${SHARE_LEAD_PREFIX}, ${SHARE_SOURCE_LINE}\`)` (round-trip) au lieu de littéral. · `src/lib/share.ts`, `tests/share.test.ts`
- [FIXED] `"Copie ton résultat :"` window.prompt label hardcoded dans `src/lib/share.ts` performShare (last-resort branch) + asserté en literal dans `tests/share.test.ts` via `.toHaveBeenCalledWith("Copie ton résultat :", ...)` · Drift surface identique : rewording = 2 edits in-lockstep. Fix : export `CLIPBOARD_PROMPT_LABEL`. Tests utilisent la const. · `src/lib/share.ts`, `tests/share.test.ts`
- [FIXED] Le template `` ` (résultat partiel ${total}/${target})` `` inline dans `composeShareText` était pinné via `.toContain("résultat partiel 7/20")` côté test · Drift surface : rewording du marker (e.g. "(partiel N/M)" plus court) demanderait source + test in-lockstep. Fix : export `partialResultMarker(total, target)` helper qui renvoie le marker complet avec leading space (contract documenté pour clean concatenation). `composeShareText` appelle le helper ; tests utilisent `partialResultMarker(7, 20).trim()`. · `src/lib/share.ts`, `tests/share.test.ts`

### Vérifications à faire en session 142

- [ ] grep `SHARE_LEAD_PREFIX\|CLIPBOARD_PROMPT_LABEL\|partialResultMarker` src/ tests/ → 10+ résultats
- [ ] grep `"Mes affinités politiques réelles"\|"Copie ton résultat :"\|"résultat partiel 7/20"` src/ tests/ → 3-4 résultats seulement (déclarations + pin-the-value)
- [ ] grep `~630 tests` CLAUDE.md → 0 résultat (aligné sur ~635)

---

## Session 142 — 2026-05-17

### Vérification session 141

- [VERIFIED] 26 occurrences des 3 nouveaux exports (SHARE_LEAD_PREFIX|CLIPBOARD_PROMPT_LABEL|partialResultMarker) dans src/ + tests/
- [VERIFIED] 5 occurrences seulement des 3 strings = 2 déclarations + 2 pin-the-value tests + 1 comment (pas de drift)
- [VERIFIED] CLAUDE.md "~635 tests"
- 635/635 tests verts, typecheck clean

### Bugs fixés (FreshnessBanner titles/phrases × 4 consts + 2 helpers + restartConfirmMessage)

- [FIXED] FreshnessBanner tone titles `"Synchronisation en retard"` + `"Données à jour"` étaient inline dans le module + dupliqués comme `.getByText("...")` literals dans tests/FreshnessBanner.test.tsx (2 sites chacun) · Drift surface : un rewording (e.g. "Mise à jour récente" / "Pipeline en retard") aurait demandé 4 edits in-lockstep. Fix : export `FRESHNESS_OK_TITLE` + `FRESHNESS_STALE_TITLE` depuis FreshnessBanner.tsx. Source + tests utilisent les consts. 1 nouveau test pin-the-value. · `src/components/FreshnessBanner.tsx`, `tests/FreshnessBanner.test.tsx`
- [FIXED] Past/Next phrase composition (`"MAJ aujourd'hui"`, `"sync imminente"`, `"MAJ il y a N jour(s)"`, `"prochaine sync dans N jour(s)"`) était inline dans 2 ternaires source + asserté via 5 regex literals dans tests · Drift surface : le plural-rule + le boundary case dupliqués source/tests, plus les 2 phrases canoniques pinnées 4× chacune. Fix : export `FRESHNESS_TODAY_PHRASE` + `FRESHNESS_IMMINENT_PHRASE` + 2 helpers `freshnessPastPhrase(past)` + `freshnessNextPhrase(next)` qui encapsulent boundary + plural rule. Tests round-trip via les helpers/consts. 7 nouveaux tests : boundary x 2 helpers, plural rule x 2 helpers, pin-the-value x 4 consts. · `src/components/FreshnessBanner.tsx`, `tests/FreshnessBanner.test.tsx`
- [FIXED] Cover.tsx restart() confirm prompt avait inline ternary `${RESTART_LABEL} ? Ton vote en cours sera perdu.` / `${RESTART_LABEL} ? Tes ${votesCount} votes en cours seront perdus.` + tests Cover.test.tsx assertaient `expect.stringMatching(/Ton vote en cours sera perdu/)` + `/Tes 3 votes en cours seront perdus/` literals · Drift surface : rewording = 4 edits in-lockstep (source 2 branches + 2 tests). Fix : export `restartConfirmMessage(votesCount)` helper depuis src/types. Cover utilise `window.confirm(restartConfirmMessage(votesCount))`. Tests round-trip via la helper avec `restartConfirmMessage(1)` / `restartConfirmMessage(3)`. 5 nouveaux tests dans aria-labels.test.ts : starts-with-RESTART_LABEL invariant, singular branch, plural branch, edge case votesCount=0 (plural in French), ends-with-period sentence-completion. · `src/types/index.ts`, `src/routes/Cover.tsx`, `tests/Cover.test.tsx`, `tests/aria-labels.test.ts`

### Vérifications à faire en session 143

- [ ] grep `FRESHNESS_OK_TITLE\|FRESHNESS_STALE_TITLE\|FRESHNESS_TODAY_PHRASE\|FRESHNESS_IMMINENT_PHRASE\|freshnessPastPhrase\|freshnessNextPhrase\|restartConfirmMessage` src/ tests/ → 25+ résultats
- [ ] grep `"Synchronisation en retard"\|"Données à jour"\|"MAJ aujourd.hui"\|"sync imminente"\|"Ton vote en cours sera perdu"` src/ tests/ → 5 résultats seulement (déclarations dans les modules)
- [ ] grep `~635 tests` CLAUDE.md → 0 résultat (aligné sur ~646)

---

## Session 143 — 2026-05-17

### Vérification session 142

- [VERIFIED] 63 occurrences des 7 nouveaux exports (FRESHNESS_OK/STALE_TITLE + FRESHNESS_TODAY/IMMINENT_PHRASE + freshnessPastPhrase/NextPhrase + restartConfirmMessage)
- [VERIFIED] 11 occurrences des 5 strings = 4 déclarations + 4 pin-the-value tests + 3 comments (pas de drift)
- [VERIFIED] CLAUDE.md "~646 tests"
- 646/646 tests verts, typecheck clean

### Bugs fixés (refaireConfirmMessage + RANKING_OVERLAY_LABEL + MODAL_CLOSE_LABEL)

- [FIXED] Result.tsx refaire() confirm prompt avait inline template `${REFAIRE_LABEL} ? Tes ${total} vote${total !== 1 ? "s" : ""} et ton résultat seront perdus.` + test assertait `stringMatching(new RegExp(\`Tes ${TARGET} votes et ton résultat\`))` · Drift surface : rewording = source ternary + test regex in lockstep, asymétrique avec restartConfirmMessage (Cover) extrait session 142. Fix : export `refaireConfirmMessage(total)` helper depuis src/types, symétrique à restartConfirmMessage mais avec la loss-phrase qui nomme aussi le résultat ("Ton/Tes vote(s) ET ton résultat seront perdus"). Result.tsx utilise `window.confirm(refaireConfirmMessage(total))`. Test passe `refaireConfirmMessage(TARGET)` directement. 5 nouveaux tests : starts-with-REFAIRE_LABEL invariant, singular branch, plural branch, anti-drift guard "loss-phrase contient 'résultat' contrairement à restartConfirmMessage", ends-with-period. · `src/types/index.ts`, `src/routes/Result.tsx`, `tests/Result.test.tsx`, `tests/aria-labels.test.ts`
- [FIXED] `"Classement partiel"` dupliqué 5× : RankingOverlay aria-label sur le dialog + visible-header prefix avant le `· N comptés` + 3 sites dans tests/RankingOverlay.test.tsx (1 toHaveAttribute + 2 textContent regex literals) · Drift surface : un rewording (ou un i18n flip EN-US) aurait demandé 5 edits in-lockstep. Fix : export `RANKING_OVERLAY_LABEL = "Classement partiel"` depuis src/types. Source + tests utilisent la const ; les regex tests construisent leur RegExp via `new RegExp(\`${RANKING_OVERLAY_LABEL}\`)`. 1 nouveau test pin-the-value dans aria-labels.test.ts. · `src/types/index.ts`, `src/components/RankingOverlay.tsx`, `tests/RankingOverlay.test.tsx`, `tests/aria-labels.test.ts`
- [FIXED] `"Fermer"` close-button label dupliqué 3× : MethodeSheet aria-label (icon button avec "✕" visible) + RankingOverlay visible button text (sans aria-label car le texte est l'accessible name) + tests/RankingOverlay.test.tsx regex match · Drift surface : 2 modals partagent la même semantic "close" mais utilisaient 2 patterns différents (aria-label vs visible text) avec la même string ; un i18n flip aurait demandé 3 edits in-lockstep. Fix : export `MODAL_CLOSE_LABEL = "Fermer"` depuis src/types. MethodeSheet `aria-label={MODAL_CLOSE_LABEL}`, RankingOverlay `>{MODAL_CLOSE_LABEL}<`. Test passe `new RegExp(MODAL_CLOSE_LABEL)`. 2 nouveaux tests : pin-the-value + single-word invariant (l'aria-label de l'icon button doit rester compact). · `src/types/index.ts`, `src/components/MethodeSheet.tsx`, `src/components/RankingOverlay.tsx`, `tests/RankingOverlay.test.tsx`, `tests/aria-labels.test.ts`

### Vérifications à faire en session 144

- [ ] grep `refaireConfirmMessage\|RANKING_OVERLAY_LABEL\|MODAL_CLOSE_LABEL` src/ tests/ → 15+ résultats
- [ ] grep `"Classement partiel"\|>Fermer<\|aria-label="Fermer"\|"Tes .* votes et ton résultat"` src/ tests/ → 1-3 résultats seulement (déclarations dans src/types)
- [ ] grep `~646 tests` CLAUDE.md → 0 résultat (aligné sur ~654)

---

## Session 144 — 2026-05-17

### Vérification session 143

- [VERIFIED] 39 occurrences de refaireConfirmMessage|RANKING_OVERLAY_LABEL|MODAL_CLOSE_LABEL dans src/ + tests/
- [VERIFIED] 2 occurrences seulement de "Classement partiel" (1 déclaration + 1 pin-the-value test) ; 0 occurrence inline de `aria-label="Fermer"` ou `>Fermer<` (toutes via const)
- [VERIFIED] CLAUDE.md "~654 tests"
- 654/654 tests verts, typecheck clean

### Bugs fixés (Cover vote preview reuse VOTE_LABEL_* + CARD_VERSO_SEPARATOR_LABEL + AN_LINK_VISIBLE_LABEL)

- [FIXED] Cover.tsx vote-preview cards lignes 181-184 utilisaient `lbl: "Contre"`, `lbl: "Je passe"`, `lbl: "Pour"` inline alors que `VOTE_LABEL_CONTRE/SKIP/POUR` existaient depuis session 139 pour Play.tsx · Drift surface : la rewording de session 139 sur Play.tsx aurait laissé Cover stale (3 sites parallèles non-migrés). Fix : Cover.tsx importe VOTE_LABEL_CONTRE/SKIP/POUR et utilise les 3 consts dans le preview array. Pas de nouveau test (les TopBar/Play tests pinnent déjà les consts). · `src/routes/Cover.tsx`
- [FIXED] `"↑ Synthèse IA  ·  ↓ texte officiel AN"` separator label dupliqué 3× : 1 site Card.tsx (visible div) + 2 sites tests/Card.test.tsx (regex `/Synthèse IA/i` × 2) · Drift surface : un rewording (e.g. drop des arrows, swap des poles, simplifier en "IA · AN") aurait demandé 3 edits in-lockstep. Fix : export `CARD_VERSO_SEPARATOR_LABEL` depuis src/types. Card.tsx render `{CARD_VERSO_SEPARATOR_LABEL}` ; tests round-trip via regex `new RegExp(CARD_VERSO_SEPARATOR_LABEL.replace(/\s+/g, "\\s+"))` pour survivre la whitespace-normalization de jsdom (double-spaces du `·` collapsés). 2 nouveaux tests : contient les 2 poles (Synthèse IA + texte officiel AN) + contient les 2 arrows (↑ + ↓ pour ordering hint). · `src/types/index.ts`, `src/components/Card.tsx`, `tests/Card.test.tsx`, `tests/aria-labels.test.ts`
- [FIXED] `"Voir sur AN ↗"` visible link text dupliqué 2× : Card.tsx verso footer (link text inside `<a>` element) + Methode.tsx §07 prose (référence citée « Voir sur AN ↗ ») · Drift surface : la prose Methode référence le link text exact ; un rewording de Card aurait laissé la prose stale. Fix : export `AN_LINK_VISIBLE_LABEL = "Voir sur AN ↗"` depuis src/types. Card.tsx + Methode.tsx importent + utilisent. 2 nouveaux tests : pin-the-value + endsWith "↗" arrow invariant (le ↗ signale "opens new tab" visuellement, indépendant d'EXTERNAL_LINK_SUFFIX dans l'aria-label). · `src/types/index.ts`, `src/components/Card.tsx`, `src/routes/Methode.tsx`, `tests/aria-labels.test.ts`

### Vérifications à faire en session 145

- [ ] grep `CARD_VERSO_SEPARATOR_LABEL\|AN_LINK_VISIBLE_LABEL` src/ tests/ → 10+ résultats
- [ ] grep `"↑ Synthèse IA"\|"Voir sur AN ↗"` src/ tests/ → 2-3 résultats seulement (déclarations + pin-the-value)
- [ ] grep `VOTE_LABEL_CONTRE` src/routes/Cover.tsx → 1 résultat (Cover utilise la const)
- [ ] grep `~654 tests` CLAUDE.md → 0 résultat (aligné sur ~658)

---

## Session 145 — 2026-05-17

### Vérification session 144

- [VERIFIED] 23 occurrences de CARD_VERSO_SEPARATOR_LABEL|AN_LINK_VISIBLE_LABEL dans src/ + tests/
- [VERIFIED] 4 occurrences "Voir sur AN ↗" = 1 déclaration + 2 comments + 1 pin-the-value test ; 0 inline literal hors déclaration
- [VERIFIED] Cover.tsx utilise VOTE_LABEL_CONTRE + import + array entry (2 mentions attendues)
- [VERIFIED] CLAUDE.md "~658 tests"
- 658/658 tests verts, typecheck clean

### Bugs fixés (TopBar menu labels × 3 + ErrorBoundary copy × 3 + Cover footer reuse MENU_*_LABEL × 3)

- [FIXED] TopBar.tsx menu trigger aria-labels `"Ouvrir le menu"` + `"Fermer le menu"` dans inline ternary `aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}` + nav aria-label `"Menu principal"`, dupliqués dans tests/TopBar.test.tsx 19× pour /Ouvrir le menu/ + 1× pour /Fermer le menu/ · Drift surface ÉNORME : un rewording aurait demandé 20+ edits in-lockstep. Fix : export `MENU_OPEN_LABEL` + `MENU_CLOSE_LABEL` + `MAIN_MENU_LABEL` depuis src/types. TopBar utilise les 3 consts. tests migrent les 20 sites vers `new RegExp(MENU_OPEN_LABEL)` / `new RegExp(MENU_CLOSE_LABEL)` (replace_all). 5 nouveaux tests dans aria-labels.test.ts : pin-the-value × 3, distinct, common-suffix invariant. · `src/types/index.ts`, `src/components/TopBar.tsx`, `tests/TopBar.test.tsx`, `tests/aria-labels.test.ts`
- [FIXED] ErrorBoundary fallback copy : `"Erreur"` (sr-only h1), `"Quelque chose s'est cassé de notre côté."` (visible p), `"Recharger"` (button) source + 2 test regex literals (`/quelque chose s'est cassé/i`, `/recharger/i`) · Drift surface : rewording = 5 edits in-lockstep (source 3 + tests 2). Fix : export `ERROR_FALLBACK_HEADING` + `ERROR_FALLBACK_MESSAGE` + `ERROR_FALLBACK_RELOAD_LABEL` depuis src/types. ErrorBoundary utilise les 3 consts. Tests round-trip via `new RegExp(ERROR_FALLBACK_MESSAGE.slice(0,30), "i")` + `new RegExp(ERROR_FALLBACK_RELOAD_LABEL, "i")`. 4 nouveaux tests : pin-the-value × 3 + sentence-completion invariant. · `src/types/index.ts`, `src/components/ErrorBoundary.tsx`, `tests/ErrorBoundary.test.tsx`, `tests/aria-labels.test.ts`
- [FIXED] Cover.tsx footer 3 link labels `"Méthode & sources"`, `"Mentions légales"`, `"Contact"` inline alors que `MENU_METHODE_LABEL` + `MENU_LEGAL_LABEL` + `MENU_CONTACT_LABEL` existaient depuis session 138 pour TopBar · Drift surface : symétrique de session 144's Cover vote-preview fix — un rewording session 138 aurait laissé Cover stale. Fix : Cover.tsx importe les 3 MENU_*_LABEL consts + utilise comme link text (drop l'entité `&amp;` JSX, devient `{MENU_METHODE_LABEL}` qui contient le `&` plain). Pas de nouveau test (TopBar tests pinnent déjà les consts). · `src/routes/Cover.tsx`

### Vérifications à faire en session 146

- [ ] grep `MENU_OPEN_LABEL\|MENU_CLOSE_LABEL\|MAIN_MENU_LABEL\|ERROR_FALLBACK_HEADING\|ERROR_FALLBACK_MESSAGE\|ERROR_FALLBACK_RELOAD_LABEL` src/ tests/ → 35+ résultats
- [ ] grep `"Ouvrir le menu"\|"Fermer le menu"\|"Menu principal"\|"Quelque chose s.est cassé"\|"Recharger"` src/ tests/ → 5-7 résultats seulement (déclarations + pin-the-value tests)
- [ ] grep `MENU_METHODE_LABEL` src/routes/Cover.tsx → 1 résultat (Cover utilise la const)
- [ ] grep `~658 tests` CLAUDE.md → 0 résultat (aligné sur ~667)

---

## Session 146 — 2026-05-17

### Vérification session 145

- [VERIFIED] 64 occurrences des 6 nouveaux exports (MENU_OPEN/CLOSE_LABEL + MAIN_MENU_LABEL + ERROR_FALLBACK_HEADING/MESSAGE/RELOAD_LABEL)
- [VERIFIED] 7 occurrences des 5 strings = 3 déclarations + 3 pin-the-value tests + 1 comment (pas de drift) ; 2 sites stale dans App.test.tsx fixed en bug #3
- [VERIFIED] Cover.tsx utilise MENU_METHODE_LABEL (import + usage = 2 mentions)
- [VERIFIED] CLAUDE.md "~667 tests"
- 667/667 tests verts, typecheck clean

### Bugs fixés (PERSONNALITES_TOGGLE_LABEL + Cover.test.tsx const reuse × 5 + test regex cleanup × 5)

- [FIXED] `"Voir les personnalités"` Result.tsx button label dupliqué 7× : 1 source (Result.tsx button text inline) + 6 test regex literals (`name: /Voir les personnalités/`) · Drift surface : rewording = 7 edits in-lockstep. Fix : export `PERSONNALITES_TOGGLE_LABEL` depuis src/types. Result.tsx utilise `{PERSONNALITES_TOGGLE_LABEL}` ; tests/Result.test.tsx 6 sites migrent via replace_all vers `new RegExp(PERSONNALITES_TOGGLE_LABEL)`. 2 nouveaux tests : pin-the-value + startsWith "Voir" (chevron prefix invariant). · `src/types/index.ts`, `src/routes/Result.tsx`, `tests/Result.test.tsx`, `tests/aria-labels.test.ts`
- [FIXED] tests/Cover.test.tsx avait 5 regex literals stale (`/Commencer/`, `/Voir mon résultat/`, `/Méthode/`, `/Mentions légales/`, `/Contact/`) alors que les 5 consts existaient (START_LABEL session 136 + VIEW_RESULT_LABEL session 133 + MENU_METHODE/LEGAL/CONTACT_LABEL session 138) · Drift surface : un rewording d'une des 5 consts laisserait les 5 tests verts mais déconnectés de la source. Fix : tests/Cover.test.tsx importe les 3 MENU_*_LABEL (les autres déjà importés) + migre les 5 regex vers `new RegExp(CONST)`. Pas de nouveau test (les consts étaient déjà pinned via leur own tests). · `tests/Cover.test.tsx`
- [FIXED] 5 sites stale dans tests/App.test.tsx (2× `Quelque chose s'est cassé` + 1× `Ouvrir le menu`), tests/Legal.test.tsx (1× `En-tête de la page` + 1× `Retour` + 1× `Accueil`), tests/TopBar.test.tsx (1× `Accueil`), tests/AuditTrail.test.tsx (1× `Voir le scrutin` template prefix) · Drift cleanup : ces test regexes étaient parallèles aux consts existantes (ERROR_FALLBACK_MESSAGE session 145 + MENU_OPEN_LABEL session 145 + PAGE_HEADER_NAV_LABEL session 134 + BACK_LINK_LABEL session 136 + WORDMARK_HOME_LABEL session 134 + anScrutinViewAriaLabel session 140). Fix : imports ajoutés, regex literals migrés vers `new RegExp(CONST)` ou pattern derived (AuditTrail utilise `anScrutinViewAriaLabel(0).split(" n°")[0]` pour matcher n'importe quel scrutin number). · `tests/App.test.tsx`, `tests/Legal.test.tsx`, `tests/TopBar.test.tsx`, `tests/AuditTrail.test.tsx`

### Vérifications à faire en session 147

- [ ] grep `PERSONNALITES_TOGGLE_LABEL` src/ tests/ → 10+ résultats
- [ ] grep `"Voir les personnalités"` src/ tests/ → 2-3 résultats (déclaration + pin-the-value test)
- [ ] grep `name: /\(Commencer\|Voir mon résultat\|Voir les personnalités\|Quelque chose\|Ouvrir le menu\|Accueil\|En-tête de la page\|Retour\)/` tests/ → 0 résultat (toutes les regex literales migrées vers `new RegExp(CONST)`)
- [ ] grep `~667 tests` CLAUDE.md → 0 résultat (aligné sur ~669)
