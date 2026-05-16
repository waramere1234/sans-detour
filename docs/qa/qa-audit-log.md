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
