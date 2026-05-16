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
