# Spec — Transparence IA + A11y + Tests (V2.5)

> ⚠ **Status: MOSTLY SHIPPED (historical).** The 18 unchecked boxes
> below were never ticked as features landed via the plan
> (`docs/superpowers/plans/2026-05-16-transparence-a11y-tests.md`) and
> the audit log (`docs/qa/qa-audit-log.md`). The ✨IA chip, MethodeSheet,
> useFlipCardA11y hook, ErrorBoundary, both Skeletons and the 127-test
> suite are live. Treat this as an archived design doc, not a tracking
> list — see CLAUDE.md for current state.

> **Date** : 2026-05-16
> **Branche cible** : `claude/check-app-access-9Yvx0` (puis merge vers `feat/v1-implementation`)
> **Effort estimé** : ~7-9 jours dev solo
> **Bundle** : 3 chantiers livrés ensemble (B + P1 + P3) car ils touchent aux mêmes fichiers

---

## 1. Pourquoi

L'app Sans Détour mélange deux natures de contenu sur chaque carte :

- **Données AN officielles** : `titre_brut`, `date`, `numéro`, `votes_bruts`, `position_par_groupe`, `url_an_officielle`, `votes_personnalites`
- **Mis en forme par IA Claude** : `titre_pedago`, `chapeau`, `points_cles`, `contexte`, `analyse_loi`, `theme`

Aujourd'hui rien dans l'UI ne signale cette distinction. Résultat : un utilisateur sceptique peut suspecter du biais IA, alors même que Claude ne fait pas d'opinion (il reformule du libellé officiel). La page `/methode` actuelle aggrave le malentendu en disant textuellement « *aucune IA pour calculer ton alignement* » — vrai pour le score, faux pour les textes affichés.

**Objectif** : rendre la nature de chaque contenu visible et la méthodologie auditable, sans claim défensif. Le pari pédagogique : afficher en permanence le libellé brut AN à côté du résumé IA permet à l'utilisateur de comparer lui-même — la transparence factuelle est plus crédible qu'un claim de neutralité.

Cible prioritaire : **utilisateur grand public**. Pas le journaliste, pas l'universitaire — ils ont déjà accès à GitHub et à `data.assemblee-nationale.fr`.

**Trois chantiers parallèles**, regroupés parce qu'on touche aux mêmes fichiers (`Card.tsx`, `Methode.tsx`, structure DOM des cartes) :

- **B** — Transparence IA (disclosure progressive : chip recto + lignes verso + page méthode enrichie)
- **P1** — A11y & robustesse UI (flip cartes accessibles, reduced-motion, error boundary, loading skeletons)
- **P3** — Tests UI + audit algo (Card, MethodeSheet, Cover, ErrorBoundary + edge cases matching/deck)

---

## 2. Scope

### Inclus

1. Chip `✨IA` sur le recto des cartes, cliquable, ouvre un bottom-sheet
2. Bottom-sheet `MethodeSheet` (nouveau composant, calque sur `MenuSheet` existant)
3. Ligne explicite sur le verso `explanation` séparant résumé IA et libellé officiel AN
4. Footer attribution sur le verso `analyse`
5. Section `07` dans `/methode` + reformulation section `04`
6. Sub-text Cover : « Données AN officielles · résumés Claude (IA) »
7. Plumbing a11y des cartes flippables (aria-hidden, keyboard nav, focus management)
8. Hook `useReducedMotion()` framer-motion dans Card et MethodeSheet
9. `ErrorBoundary` global wrapping `<main>` dans App.tsx
10. `CardSkeleton` et `ResultSkeleton` (shimmer animé, désactivable reduced-motion)
11. ~51 tests Vitest nouveaux (UI + algo edge cases)
12. Retrofit a11y minor de `MenuSheet` existant (focus trap, aria-modal) pour cohérence

### Exclus (out of scope)

- **Sources web_search en DB** — pas de migration `0007`, pas de re-ingestion Claude. Renvoyé en V2.5 si critique précise.
- **Page `/limitations` séparée** — la franchise sur les limites est intégrée dans `/methode` section 07.
- **Système de signalement intégré** — bouton « Signaler une erreur » = simple `mailto:` (MVP).
- **i18n EN** — pas dans ce sprint.
- **Performance bundle / code-splitting / PWA** — package P2, sprint séparé.
- **Polish layout cohérent (--max-content / --gutter)** — WIP local non commité, à finaliser et commiter **avant** d'attaquer ce spec.

### Pré-requis avant implémentation

L'utilisateur a en local du WIP non commité sur `TopBar.tsx`, `Cover.tsx`, `index.css` etc. (variables `--max-content`, `--gutter`, fix bounce-back du wordmark). Ce WIP doit être **commité et mergé sur la branche de spec avant** de commencer pour éviter les conflits sur les fichiers touchés.

---

## 3. Architecture

### Nouveaux fichiers

| Fichier | Rôle |
|---|---|
| `src/components/MethodeSheet.tsx` | Bottom-sheet « Comment c'est fait ? » — calque sur MenuSheet, props `{ open, onClose }` |
| `src/components/ErrorBoundary.tsx` | Class component React, wrap `<main>`, fallback friendly + Plausible event |
| `src/components/CardSkeleton.tsx` | Placeholder shimmer aux dimensions Card, reduced-motion aware |
| `src/components/ResultSkeleton.tsx` | Placeholder shimmer pour la liste d'alignements |
| `src/hooks/useFlipCardA11y.ts` | Hook qui mutualise aria-hidden, focus, keyboard nav du flip |
| `src/lib/analytics.ts` (helper) | Ajoute `trackEvent(name, props)` si absent — utilise Plausible custom events |
| `tests/Card.test.tsx` | ~8 cas (rendu, flip clavier, vote clavier, aria-hidden, chip callback, reduced-motion) |
| `tests/MethodeSheet.test.tsx` | ~6 cas (aria-modal, focus auto, focus trap, ESC, backdrop, mailto/link) |
| `tests/Cover.test.tsx` | ~4 cas (fresh, resume play, resume result, fromLogo) |
| `tests/ErrorBoundary.test.tsx` | ~3 cas (catch render, trackEvent, recharger) |
| `tests/matching-edge-cases.test.ts` | ~12 cas (matrice alignmentScore, computeAlignment vide/skip/divisé, personnalités non_dispo/absent, ranking stable) |
| `tests/deck-invariants.test.ts` | ~8 cas (caps, round-robin, resume awareness, pool insuffisant) |

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `src/components/Card.tsx` | Chip ✨IA inline dans chapeau, lignes verso, intégration `useFlipCardA11y`, `useReducedMotion` |
| `src/routes/Methode.tsx` | Section 07 nouvelle, reformulation section 04 |
| `src/routes/Cover.tsx` | Sub-text mis à jour |
| `src/routes/Play.tsx` | `<CardSkeleton>` au loading, state `methodeSheetOpen`, `<MethodeSheet>` monté, live region `aria-live` |
| `src/routes/Result.tsx` | `<ResultSkeleton>` au loading |
| `src/components/DeckStack.tsx` | Forward prop `onOpenMethode` à la Card du top uniquement |
| `src/components/TopBar.tsx` | Retrofit a11y léger `MenuSheet` (focus trap + aria-modal) — ~15min |
| `src/App.tsx` | Wrap `<main>` avec `<ErrorBoundary>` |
| `src/index.css` | Keyframes `@keyframes shimmer` pour skeletons |

### Pas touché

- `src/lib/matching.ts` et `src/lib/deck.ts` — audit P3 ajoute des tests, ne modifie la logique sauf si bug avéré (et alors fix inline avec note dans le PR)
- `supabase/migrations/` — zéro changement schéma
- `scripts/ingest-*.ts` — intacts
- `src/types/` — aucun nouveau type DB ; éventuellement un `MethodeSheetProps` local

### Pattern de montage `MethodeSheet` (option A retenue)

```
Play.tsx
├── const [methodeSheetOpen, setMethodeSheetOpen] = useState(false)
├── <DeckStack onOpenMethode={() => setMethodeSheetOpen(true)} ... />
│   └── (forward au Card topMost uniquement)
│       └── Card propage à <ChipIA onClick={onOpenMethode}>
└── <MethodeSheet open={methodeSheetOpen} onClose={...} />
```

State local. Pas de context React. Si plus tard on veut ouvrir depuis Cover ou Menu, on refactorise vers context — YAGNI maintenant.

---

## 4. Composants & data flow

### 4.1 `<MethodeSheet>`

```tsx
interface MethodeSheetProps {
  open: boolean;
  onClose: () => void;
}
```

Reproduit le pattern `MenuSheet` du TopBar (AnimatePresence + motion.div spring depuis le bas, backdrop, ESC handler). **Ajoute** : focus trap, aria-modal, aria-labelledby, body scroll lock.

**Contenu (texte exact)** :

```
COMMENT C'EST FAIT ?                          ✕

📊 AN OFFICIEL
Date, numéro, vote des députés, libellé brut
du scrutin, position des groupes parlementaires.

✨ MIS EN FORME PAR IA CLAUDE
Le titre court reformulé, les points clés, le
résumé, la synthèse du texte officiel.

Claude reçoit le libellé brut de l'AN + des
résultats de recherche web. Pas d'opinion humaine
ni d'orientation politique dans son prompt.
Sa mission : rendre lisible, pas commenter.

Le calcul d'alignement, lui, est une formule
mathématique pure — aucune IA dans le score.

[→ Méthode complète]
[✉ Signaler une erreur factuelle]
```

**Layout** : titre uppercase mono accent · bouton ✕ haut-droite · 2 blocs avec emoji+titre+texte · 2 boutons full-width en bas (link react-router pour méthode, anchor mailto pour signaler).

**Styles** : reprend `--bg-2` background, `--line` border, polices et tailles existantes.

### 4.2 `<Card>` — modifications

**Recto — chip inline dans la ligne chapeau** :

```tsx
<div style={{ display: "flex", justifyContent: "space-between" }}>
  <div style={{ flex: 1, fontFamily: "var(--font-mono)", ... }}>
    {scrutin.chapeau}
    {topMost && onOpenMethode && (
      <>
        {" · "}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenMethode(); }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Comment ce contenu a été préparé"
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            opacity: 0.7,
            cursor: "pointer",
            padding: "4px 2px",  // hit area
            fontFamily: "inherit",
            fontSize: "inherit",
            letterSpacing: "inherit",
            textDecoration: "underline",
            textUnderlineOffset: 3,
            textDecorationStyle: "dotted",
          }}
        >✨IA</button>
      </>
    )}
  </div>
  {topMost && <button>+ analyse</button>}
</div>
```

Hit area : padding interne donne ~24px de hauteur. `e.stopPropagation()` empêche le tap de déclencher le flip de la carte. `onPointerDown` empêche framer-motion drag de capturer le geste.

**Verso `explanation` — ligne de séparation explicite** :

Remplace la `border-top: 1px dashed var(--line)` actuelle au-dessus de l'intitulé officiel :

```tsx
<div style={{
  paddingTop: 10, marginTop: 4,
  borderTop: "1px solid var(--line)",
  fontFamily: "var(--font-mono)", fontSize: 9.5,
  letterSpacing: "0.1em", textTransform: "uppercase",
  color: "var(--ink-3)", textAlign: "center",
}}>
  ↑ Résumé IA  ·  ↓ libellé officiel AN
</div>
<div>
  <span style={{ ...mono uppercase ... }}>Intitulé officiel AN · </span>
  <span>{scrutin.titre_brut}</span>
</div>
```

**Verso `analyse` — footer attribution** :

Inséré juste avant le footer existant « tap pour revenir / Voir sur AN » :

```tsx
<div style={{
  marginTop: 8, paddingTop: 8,
  borderTop: "1px dashed var(--line)",
  fontFamily: "var(--font-mono)", fontSize: 9.5,
  letterSpacing: "0.08em",
  color: "var(--ink-3)", textAlign: "center",
  lineHeight: 1.5,
}}>
  Synthèse mise en forme par Claude, basée sur<br/>
  le libellé officiel AN — voir lien ci-dessous.
</div>
```

### 4.3 `<Methode>` — modifications

**Section 04 (existante) — reformulation du paragraphe d'intro** :

```diff
- <p>Aucune opinion, aucun panel, aucune IA pour calculer ton alignement.
-    Juste les votes officiels de l'Assemblée Nationale, et une formule
-    de comparaison qu'on pose ici noir sur blanc.</p>
+ <p>Aucune opinion, aucun panel. <b>Le calcul d'alignement est une
+    formule mathématique pure — l'IA n'y intervient pas.</b> En revanche,
+    les résumés, les points clés et les synthèses des scrutins sont
+    mis en forme par Claude (voir section 07).</p>
```

**Section 07 nouvelle — `Le rôle de l'IA Claude`** (~4 paragraphes courts) :

```
07 — Le rôle de l'IA Claude

CE QUE FAIT CLAUDE
Reformule le titre brut du scrutin en 12 mots, condense
le projet de loi en 3 points clés, rédige un résumé
contextuel de 30 à 50 mots, structure une synthèse
détaillée (mesures, concernés, calendrier, exceptions),
et tague le scrutin par thème. Mise en forme, pas
commentaire.

CE QU'IL NE FAIT PAS
Le calcul d'alignement (formule mathématique pure),
la composition du deck (round-robin algorithmique par
thème), l'extraction des votes individuels (parsing
des XML officiels AN). Sur ces trois plans, Claude
n'intervient à aucun moment.

COMMENT ON CADRE LES BIAIS
Le prompt envoyé à Claude est neutre par construction
(disponible publiquement sur GitHub, lien ci-dessous).
Sa source : le libellé brut AN + des résultats de
recherche web pour le contexte. **Le libellé officiel
brut est affiché sur la face Résumé du verso** (et la
page AN complète est toujours accessible via Voir sur
AN ↗) — tu peux comparer directement.

LIMITES & SIGNALEMENT
Claude peut se tromper sur les nuances : un mot mal
choisi, une mesure oubliée, un thème mal taggué. Pour
l'instant aucune relecture humaine systématique (V3
prévue). Si tu repères une erreur factuelle :
contact@sansdetour.fr — on corrige et on publie le
patch dans le log GitHub.
```

Avec lien actif vers le repo et vers le prompt (`scripts/ingest-an.ts`).

### 4.4 `<Cover>` — sub-text

Ligne sous le FreshnessBanner (ou équivalent) :

```diff
- Données : data.assemblée-nationale.fr
+ Données AN officielles · résumés Claude (IA)
```

Cliquable → vers `/methode`. Style identique à la version actuelle.

### 4.5 Data flow

```
Play.tsx
├── useState: methodeSheetOpen
├── useState: lastVoteLabel (string, pour live region "Voté pour")
│
├── <DeckStack
│      scrutins={scrutins}
│      onSwipe={handleVote}
│      onOpenMethode={() => setMethodeSheetOpen(true)}
│   />
│   └── propage onOpenMethode au Card topMost uniquement
│       └── <Card ... onOpenMethode={onOpenMethode}>
│           └── <ChipIA onClick={onOpenMethode}>
│
├── <div role="status" aria-live="polite" className="sr-only">
│     {lastVoteLabel}
│   </div>
│
└── <MethodeSheet
       open={methodeSheetOpen}
       onClose={() => setMethodeSheetOpen(false)}
   />
```

`handleVote` met à jour `lastVoteLabel` (par ex. « Voté pour. Carte suivante. »). Le live region force le SR à annoncer le résultat sans changer le focus.

---

## 5. A11y plumbing

### 5.1 Flip a11y — `useFlipCardA11y`

Hook qui retourne `{ frontProps, backProps, rootProps }` pour mutualiser la logique :

```ts
function useFlipCardA11y({
  flipped,
  topMost,
  scrutin,
  onFlip,
  onSwipe,
}: Args) {
  return {
    rootProps: {
      role: "article",
      "aria-roledescription": "carte de scrutin, glissez pour voter",
      "aria-label": `Scrutin n°${scrutin.numero} : ${scrutin.titre_pedago}`,
      tabIndex: topMost ? 0 : -1,
      onKeyDown: (e: KeyboardEvent) => {
        if (!topMost) return;
        const tgt = e.target as HTMLElement;
        if (tgt.closest("a, button")) return; // laisse les boutons gérer
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onFlip();
          return;
        }
        if (!flipped) {
          if (e.key === "ArrowRight") { e.preventDefault(); onSwipe("right"); }
          else if (e.key === "ArrowLeft") { e.preventDefault(); onSwipe("left"); }
          else if (e.key === "ArrowDown") { e.preventDefault(); onSwipe("down"); }
        }
      },
    },
    frontProps: { "aria-hidden": flipped },
    backProps: { "aria-hidden": !flipped },
  };
}
```

### 5.2 Reduced-motion

Dans `Card.tsx` :

```tsx
import { useReducedMotion } from "framer-motion";
const reducedMotion = useReducedMotion();

<motion.div
  animate={{ rotateY: flipped ? 180 : 0 }}
  transition={reducedMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
  ...
>
```

Et sur le drag :
```tsx
<motion.div
  drag={topMost && !flipped && !methodeSheetOpen}
  dragElastic={reducedMotion ? 0 : 0.18}
  ...
```

Dans `MethodeSheet.tsx` : remplacer le spring par fade opacity 80ms quand reducedMotion.

Dans `CardSkeleton.tsx` : `animation: shimmer 1.4s linear infinite` désactivé via media query CSS `@media (prefers-reduced-motion: reduce) { animation: none; }` — pas besoin de hook.

### 5.3 `MethodeSheet` a11y

```tsx
<motion.div
  role="dialog"
  aria-modal="true"
  aria-labelledby="methode-sheet-title"
  ...
>
  <button ref={closeBtnRef} onClick={onClose} aria-label="Fermer">✕</button>
  <h2 id="methode-sheet-title">Comment c'est fait ?</h2>
  ...
</motion.div>
```

**Focus management** :
- Au mount (open=true) : `closeBtnRef.current?.focus()`
- Focus trap : handler keydown sur le dialog, intercepte `Tab` et `Shift+Tab` pour boucler dans les focusables internes
- Au unmount : `openerElement?.focus()` (référence stockée au open via `document.activeElement`)

**Body scroll lock** : `useEffect` qui set `document.body.style.overflow = "hidden"` pendant open, restaure au cleanup. Pattern déjà appliqué dans `RankingOverlay` post-QA session 1.

### 5.4 Retrofit `MenuSheet`

Mêmes ajouts (aria-modal, aria-labelledby, focus auto sur ✕, focus trap, restoration au close). ~15 minutes en réutilisant les hooks/utils de MethodeSheet.

### 5.5 Touch targets

Audit pass durant l'implémentation, viser hit area ≥ 24×24 :

- Chip ✨IA : padding 4px verticaux × 2px horizontaux + ligne mono 11px = ~22px de haut, OK avec contour invisible
- Bouton `+ analyse` : passer de `padding: 3px 8px` à `padding: 6px 10px`
- Bouton ✕ MethodeSheet : 32×32 explicite via padding
- Liens footer carte (lien AN) : inchangé

---

## 6. Error handling & loading states

### 6.1 `<ErrorBoundary>`

```tsx
interface State { hasError: boolean; }
class ErrorBoundary extends React.Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(err: Error, info: { componentStack: string }) {
    trackEvent("error", {
      msg: err.message,
      stack: info.componentStack.slice(0, 200),
    });
  }
  render() {
    if (this.state.hasError) return <ErrorFallback />;
    return this.props.children;
  }
}

function ErrorFallback() {
  return (
    <section style={{ maxWidth: 480, margin: "0 auto", padding: "48px var(--gutter)", textAlign: "center" }}>
      <p style={{ fontSize: 14, color: "var(--ink-2)" }}>
        Quelque chose s'est cassé de notre côté.
      </p>
      <button onClick={() => window.location.reload()}>Recharger</button>
      <p style={{ marginTop: 16, fontSize: 12, color: "var(--ink-3)" }}>
        Si ça persiste : <a href="mailto:contact@sansdetour.fr">contact@sansdetour.fr</a>
      </p>
    </section>
  );
}
```

Wrap dans `App.tsx` :

```tsx
<main style={{ flex: 1 }}>
  <ErrorBoundary>{children}</ErrorBoundary>
</main>
```

### 6.2 `<CardSkeleton>` (shimmer animé)

```tsx
export function CardSkeleton() {
  return (
    <div className="card-skeleton" aria-busy="true" aria-label="Chargement des scrutins">
      <div className="sk-chapeau" />
      <div className="sk-title-1" />
      <div className="sk-title-2" />
      <div className="sk-bullet" />
      <div className="sk-bullet" />
      <div className="sk-bullet short" />
      <div className="sk-footer" />
    </div>
  );
}
```

CSS dans `index.css` :

```css
.card-skeleton {
  background: var(--bg-2);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 22px;
  height: 100%;
  /* Dimensions identiques à .card */
}
.card-skeleton > div {
  background: linear-gradient(90deg,
    var(--bg-2) 0%, var(--line) 50%, var(--bg-2) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
  height: 12px;
  border-radius: 4px;
  margin-bottom: 14px;
}
.sk-chapeau { width: 60%; }
.sk-title-1 { width: 80%; height: 18px; margin-top: 24px; }
.sk-title-2 { width: 55%; height: 18px; }
.sk-bullet { width: 70%; }
.sk-bullet.short { width: 50%; }
.sk-footer { width: 100%; margin-top: auto; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .card-skeleton > div { animation: none; }
}
```

Usage dans `Play.tsx` :

```tsx
{loading ? (
  <div className="deck-area">
    <CardSkeleton />
  </div>
) : loadError ? (
  <RetryUI ... />
) : (
  <DeckStack ... />
)}
```

### 6.3 `<ResultSkeleton>`

Header + 6 row-skeletons (dot + nom + barre + %). Même shimmer mécanique.

### 6.4 Existing retry handlers (non touchés)

- `Result.tsx` `loadError` + retry — préservé tel quel
- `Play.tsx` même pattern — préservé tel quel
- `RankingOverlay` body scroll lock — préservé tel quel

---

## 7. Stratégie de tests

### 7.1 Tests UI (~24 cas)

#### `tests/Card.test.tsx`

```ts
describe("Card", () => {
  it("renders chapeau, chip IA, title and 3 bullets on recto");
  it("flips to explanation on Enter when topMost");
  it("flips to explanation on Space when topMost");
  it("ignores keys when not topMost (tabIndex=-1)");
  it("calls onSwipe('right') on ArrowRight (recto only)");
  it("calls onSwipe('left') on ArrowLeft (recto only)");
  it("calls onSwipe('down') on ArrowDown (recto only)");
  it("ignores arrow keys when flipped");
  it("toggles aria-hidden between faces on flip");
  it("calls onOpenMethode when chip IA clicked");
  it("respects prefers-reduced-motion (matchMedia mock → duration 0)");
});
```

#### `tests/MethodeSheet.test.tsx`

```ts
describe("MethodeSheet", () => {
  it("renders nothing when open=false");
  it("renders dialog with aria-modal and aria-labelledby when open=true");
  it("focuses close button on mount");
  it("calls onClose on ESC keypress");
  it("calls onClose on backdrop click");
  it("traps focus within sheet on Tab cycle");
});
```

#### `tests/Cover.test.tsx`

```ts
describe("Cover", () => {
  it("renders wordmark and CTA on fresh visit");
  it("redirects to /play when hasSeenCover and votes < 20");
  it("redirects to /result when hasSeenCover and votes >= 20");
  it("stays on cover when location.state.fromLogo=true despite hasSeenCover");
});
```

#### `tests/ErrorBoundary.test.tsx`

```ts
describe("ErrorBoundary", () => {
  it("renders children when no error");
  it("renders fallback when child throws");
  it("calls trackEvent('error', ...) when child throws");
});
```

### 7.2 Tests algo (~27 cas)

#### `tests/matching-edge-cases.test.ts`

```ts
describe("alignmentScore", () => {
  it("returns null for skip");
  it("returns null for divisé group");
  it("returns 1 for pour/pour, contre/contre, abstention/abstention");
  it("returns 0.5 for abstention paired with pour or contre");
  it("returns 0 for pour/contre and contre/pour");
});

describe("computeAlignment", () => {
  it("returns pct=0 counted=0 for all groups when no votes");
  it("returns pct=0 counted=0 when all votes are skip");
  it("increments divided_excluded when group is divisé");
  it("rounds pct correctly (3 perfect + 1 partial + 1 conflict → 70%)");
  it("silently skips votes pointing to unknown scrutin_id");
  it("handles group missing from position_par_groupe (undefined)");
});

describe("computeAlignmentPersonnalites", () => {
  it("excludes non_dispo from counted but tracks in non_dispo_excluded");
  it("excludes absent from counted but tracks in absent_excluded");
  it("returns pct=0 counted=0 when personality has 0 effective votes");
  it("computes correctly for mixed votes with exclusions");
});

describe("rankByAlignment", () => {
  it("sorts groups by pct descending");
  it("stable on ties (follows GROUP_CODES order)");
});

describe("rankPersonnalitesByAlignment", () => {
  it("sorts personalities by pct descending");
  it("stable on ties (follows PERSONNALITE_CODES order)");
});
```

#### `tests/deck-invariants.test.ts`

```ts
describe("composeDeck invariants", () => {
  it("returns ≤ 20 cards even with larger pool");
  it("honors capPerDossier=2 on 1000 synthetic scrutins");
  it("honors capPerChapeauPrefix=2 (MAYOTTE cluster simulation)");
  it("round-robin: deck contains ≥1 card per theme in first N cards");
  it("respects resume state (seenDossierCounts pre-filled)");
  it("returns all available when pool < 20");
  it("returns [] for empty pool");
  it("returns no duplicate ids");
});
```

### 7.3 Couverture finale

- **Avant** : 45 tests
- **Après** : ~96 tests (45 existants intacts + ~51 nouveaux)
- **Runtime** : < 5s sur Mac M1
- **Lcov %** : pas de cible — tester ce qui compte, pas chasser la métrique

### 7.4 Bug catch potentiel

L'audit peut révéler 0 à 2 bugs réels dans matching ou deck. **Stratégie** : fix inline pendant l'implémentation P3, mentionné dans le PR. Si bug critique inattendu, on s'arrête et on en parle.

---

## 8. Ordre d'implémentation suggéré

L'ordre minimise les conflits et permet de valider chaque morceau isolément :

1. **Pre-spec — commit du WIP local** (TopBar / Cover / index.css en cours) → branche propre
2. **P3 algo audit d'abord** : `matching-edge-cases.test.ts` + `deck-invariants.test.ts` → catch bugs avant tout refactor UI
3. **`ErrorBoundary` + helper `trackEvent`** → infra défensive en place
4. **`useFlipCardA11y` hook + retrofit Card** (a11y plumbing seul, sans nouveau contenu) → `Card.test.tsx`
5. **`MethodeSheet` standalone** + retrofit `MenuSheet` (focus trap) → `MethodeSheet.test.tsx`
6. **Chip ✨IA dans Card recto** + wiring Play → MethodeSheet ouverture
7. **Lignes verso** (explanation séparation + analyse footer)
8. **`Methode.tsx` section 04 reformulée + section 07 nouvelle**
9. **Cover sub-text update** + `Cover.test.tsx`
10. **`CardSkeleton` + `ResultSkeleton`** → remplacer "Chargement…" partout
11. **Pass touch targets** (chip, + analyse, ✕)
12. **Manual QA** : tester avec lecteur d'écran (VoiceOver mac), tester `prefers-reduced-motion` activé, tester sur mobile iPhone réel
13. **PR avec checklist QA dans la description**

---

## 9. Critères d'acceptation

### Fonctionnels

- [ ] Sur recto carte topMost : chip `✨IA` visible, cliquable, ouvre MethodeSheet
- [ ] MethodeSheet : 2 blocs (AN officiel / Mis en forme par IA Claude) + 2 boutons (Méthode complète / Signaler erreur)
- [ ] Verso `explanation` : ligne « ↑ Résumé IA · ↓ libellé officiel AN » entre contexte et intitulé
- [ ] Verso `analyse` : footer attribution Claude
- [ ] Page `/methode` : section 04 reformulée, section 07 nouvelle
- [ ] Cover : sub-text « Données AN officielles · résumés Claude (IA) »
- [ ] Skeletons shimmer affichés pendant fetch initial sur Play et Result

### A11y

- [ ] Carte topMost focusable au clavier ; Enter/Space flip ; ←/→/↓ voter sur recto uniquement
- [ ] `aria-hidden` toggle correct sur les deux faces selon `flipped`
- [ ] MethodeSheet : `role="dialog"`, `aria-modal="true"`, focus auto sur ✕, focus trap fonctionnel, ESC ferme, focus restauré au close
- [ ] MenuSheet : mêmes garanties après retrofit
- [ ] `prefers-reduced-motion: reduce` : flip instantané, drag sans bounce, shimmer désactivé, sheet sans spring
- [ ] Live region annonce les votes
- [ ] Touch targets ≥ 24×24 sur boutons interactifs

### Robustesse

- [ ] ErrorBoundary wraps `<main>` ; child throw → fallback rendu, Plausible event firé
- [ ] CardSkeleton et ResultSkeleton n'introduisent pas de layout shift quand le vrai contenu arrive

### Tests

- [ ] Vitest : 96+ tests passent ; runtime < 5s
- [ ] Pas de régression sur les 45 tests existants

---

## 10. Risques & inconnues

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| `useFlipCardA11y` complexe (Tab dans buttons internes + arrow keys sur root) | Moyenne | Bug ergonomique | Tests clavier exhaustifs (Card.test.tsx) |
| Audit P3 révèle bug dans matching.ts | Faible | Élevé (chiffres faux affichés) | Fix inline + note dans PR + redéploiement |
| Focus trap MethodeSheet conflit avec MenuSheet (si on ouvre l'un dans l'autre) | Très faible | Cosmétique | UI ne le permet pas (l'un est dans Play, l'autre dans TopBar) — non-blockant |
| Layout shift entre skeleton et content | Faible | Cosmétique | Skeleton dimensions identiques à Card (testé visuellement) |
| WIP non commité de l'utilisateur en conflit avec nos modifs Cover/TopBar | Moyenne | Élevé (rebases pénibles) | **Pré-requis** : commit le WIP d'abord |

---

## 11. Hors scope (déjà discuté)

- Sources `web_search` exposées en DB et UI — V2.5+ si critique précise
- Page `/limitations` séparée — fusionnée dans `/methode` 07
- Signalement intégré (endpoint + workflow modération) — `mailto:` suffit MVP
- Performance bundle / code-splitting / PWA — package P2, sprint séparé
- Polish layout WIP en cours — commit avant de démarrer

---

## 12. Suivi

Une fois ce spec validé, étape suivante : invocation du skill `superpowers:writing-plans` pour générer un plan d'implémentation détaillé étape par étape (avec checkpoints, commandes de vérification, et critères de passage de phase).
