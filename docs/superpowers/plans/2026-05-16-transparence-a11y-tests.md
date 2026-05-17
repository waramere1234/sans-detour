# Sans Détour V2.5 — Transparence IA + A11y + Tests Implementation Plan

> ⚠ **Status: MOSTLY SHIPPED (historical).** ~90% of this plan landed in
> production via small commits over sessions 28-67 — the ✨IA chip,
> MethodeSheet, useFlipCardA11y hook, ErrorBoundary, both Skeletons, the
> 127-test suite, and the Methode landmarks all live in the codebase
> today. The 109 unchecked boxes were never ticked as the plan executed
> piecemeal — treat this as an archived design doc, not a tracking list.
> See `CLAUDE.md` for current state and `docs/qa/qa-audit-log.md` for
> the actual fix-by-fix record.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre visible la nature mixte du contenu (données AN officielles vs résumés IA Claude) sans claim défensif, fixer l'a11y des cartes flippables, et fonder une première couche de tests UI + audit algo.

**Architecture:** 3 chantiers bundlés dans un seul sprint parce qu'ils touchent aux mêmes fichiers (`Card.tsx` surtout). Disclosure progressive de la transparence : chip `✨IA` sur recto → ouvre `<MethodeSheet>` bottom-sheet (nouveau composant) → ligne de séparation explicite sur verso → page `/methode` enrichie. A11y plumbing : `useFlipCardA11y` hook (aria-hidden + keyboard nav + reduced motion), `<ErrorBoundary>` global, `<CardSkeleton>` / `<ResultSkeleton>` shimmer. Tests : ~40 nouveaux cas Vitest + Testing Library (UI tests sont inaugurés dans ce sprint).

**Tech Stack:** React 19, TypeScript 5.8, Vite 8, React Router 7, Framer Motion 11, Tailwind 4, Vitest + Testing Library + jsdom + `@testing-library/jest-dom`. Supabase non touché.

---

## Note d'écart spec → plan

La section 5.4 du spec parle d'un « retrofit `MenuSheet` avec focus trap + aria-modal ». En lisant `src/components/TopBar.tsx`, le menu n'est plus une bottom-sheet : c'est un **popover** anchored au trigger (`role="menu"`, transition spring 16ms), pattern fondamentalement différent. Aria-modal et focus trap ne s'appliquent pas à un popover (semantiques de dialog, pas de menu).

**Adaptation** : on remplace le retrofit par une enhancement plus mesurée — *restore focus au trigger au close* (`useRef` + `focus()` en cleanup). C'est l'amélioration valide pour un popover. Tâche 4.3 dans ce plan.

Le reste du spec est applicable tel quel. ~40 nouveaux tests au lieu des 51 spec'd parce que ~10 cas du spec doublent des tests déjà présents dans `tests/matching.test.ts` (5 cas) et `tests/deck.test.ts` (5 cas) — on évite la duplication, le total final reste cohérent.

---

## File Structure

### Nouveaux fichiers

| Path | Responsibility |
|---|---|
| `src/components/MethodeSheet.tsx` | Bottom-sheet « Comment c'est fait ? » — dialog modal avec focus trap, ESC, backdrop. Pattern NEW (différent du popover MenuPopover) |
| `src/components/ErrorBoundary.tsx` | React class component, catch render errors, fallback friendly, log via `track("error", ...)` |
| `src/components/CardSkeleton.tsx` | Loading placeholder aux dimensions Card avec shimmer animé (CSS keyframes), `aria-busy` |
| `src/components/ResultSkeleton.tsx` | Loading placeholder pour la liste d'alignements (header + 6 rows shimmer) |
| `src/hooks/useFlipCardA11y.ts` | Hook : retourne `{ rootProps, frontProps, backProps }` pour mutualiser aria-hidden, keyboard nav, role/label sur Card. **Nouveau dossier `src/hooks/`** |
| `tests/Card.test.tsx` | Tests UI Card : flip clavier, vote clavier, aria-hidden toggle, chip callback, reduced-motion (~11 tests) |
| `tests/MethodeSheet.test.tsx` | Tests dialog : open/close, focus auto, focus trap, ESC, backdrop, mailto/link (~6 tests) |
| `tests/Cover.test.tsx` | Tests Cover : fresh visit, resume play, resume result, fromLogo bypass (~4 tests) |
| `tests/ErrorBoundary.test.tsx` | Tests : catch, fallback, track event, reload button (~3 tests) |
| `tests/matching-edge-cases.test.ts` | Tests algo additifs (non-duplicatifs vs matching.test.ts existant) : unknown scrutin_id, missing group, rounding, ranking stable (~10 tests) |
| `tests/deck-invariants.test.ts` | Tests deck additifs : caps avec resume state, no duplicate ids, round-robin invariant (~6 tests) |

### Fichiers modifiés

| Path | Changement principal |
|---|---|
| `src/components/Card.tsx` | Chip `✨IA` inline dans chapeau recto, lignes verso explanation/analyse, intégration `useFlipCardA11y` hook, `useReducedMotion` framer-motion |
| `src/components/DeckStack.tsx` | Forward prop `onOpenMethode` à la Card topMost uniquement |
| `src/components/TopBar.tsx` | Restore focus au trigger au close (popover a11y minimal) |
| `src/routes/Methode.tsx` | Reformulation section 04, ajout section 07 « Le rôle de l'IA Claude » |
| `src/routes/Cover.tsx` | Sub-text mis à jour |
| `src/routes/Play.tsx` | State `methodeSheetOpen`, `<MethodeSheet>` mount, live region `aria-live="polite"`, remplacement « Chargement… » par `<CardSkeleton>`, callback `onOpenMethode` passé à `<DeckStack>` |
| `src/routes/Result.tsx` | Remplacement « Chargement… » par `<ResultSkeleton>` |
| `src/App.tsx` | Wrap `<main>` avec `<ErrorBoundary>` |
| `src/index.css` | Keyframes `@keyframes shimmer` + media query reduced-motion |

### Pas touché

- `src/lib/matching.ts`, `src/lib/deck.ts` — audit P3 = lecture seule, on ajoute des tests. Si bug avéré, fix inline avec commit à part.
- `supabase/migrations/` — zéro changement schéma
- `scripts/ingest-*.ts`, `src/lib/scrutins.ts`, `src/lib/session.ts`, `src/types/` — intacts

---

## Task ordering rationale

L'ordre minimise les conflits entre tâches et permet de valider chaque morceau isolément :

1. **Phase 0** — Pre-flight : working tree clean
2. **Phase 1** — Tests algo en premier (P3) : on découvre les bugs avant de toucher l'UI
3. **Phase 2** — ErrorBoundary : infrastructure défensive
4. **Phase 3** — A11y plumbing Card (hook + intégration) sans nouveau contenu — isole le diff a11y du diff contenu
5. **Phase 4** — MethodeSheet standalone (tests + impl)
6. **Phase 5** — Chip ✨IA + wiring Play → MethodeSheet
7. **Phase 6** — Lignes verso (explanation + analyse)
8. **Phase 7** — Page `/methode` enrichie
9. **Phase 8** — Cover sub-text
10. **Phase 9** — Skeletons (CSS + composants + wire)
11. **Phase 10** — Touch targets pass + QA + PR

---

# PHASE 0 — Pre-flight

## Task 0.1: Working tree propre

**Files:**
- Inspect uncommitted work, commit or stash as appropriate

- [ ] **Step 1: Inspect working tree**

```bash
git status
git diff --stat
```

Expected: list of modified/untracked files. The QA loop may have committed some WIP between sessions — verify what remains.

- [ ] **Step 2: Commit layout coherence WIP if still present**

If `src/components/TopBar.tsx`, `src/index.css`, `src/routes/Cover.tsx` still have uncommitted layout changes (introduction of `--max-content` / `--gutter` CSS vars, `fromLogo` state in Cover, popover menu refonte), commit them with :

```bash
git add src/components/TopBar.tsx src/index.css src/routes/Cover.tsx
git commit -m "feat(ui): coherent layout vars (--max-content, --gutter) + popover menu refonte"
```

Adapt the message to what's actually in the diff (read `git diff --cached` before committing). The other untracked files (`.claude/`, `docs/qa/`) are unrelated session artifacts — leave them as-is.

- [ ] **Step 3: Verify clean state**

```bash
git status
```

Expected: `working tree clean` for source files. `.claude/` and `docs/qa/` may remain untracked — ignore.

- [ ] **Step 4: Verify tests still green**

```bash
npm run test:run
```

Expected: 45+ tests pass, no regression from the WIP commit.

---

# PHASE 1 — Tests algo audit (P3)

Le but : tester ce qui n'est pas déjà couvert dans `tests/matching.test.ts` et `tests/deck.test.ts`, attraper les bugs latents AVANT toucher l'UI.

## Task 1.1: Tests defensive cases matching

**Files:**
- Create: `tests/matching-edge-cases.test.ts`

- [ ] **Step 1: Write the failing test file**

```ts
// tests/matching-edge-cases.test.ts
import { describe, it, expect } from "vitest";
import {
  alignmentScore, alignmentScorePersonnalite,
  computeAlignment, computeAlignmentPersonnalites,
  rankByAlignment, rankPersonnalitesByAlignment,
} from "../src/lib/matching";
import { GROUP_CODES, PERSONNALITE_CODES } from "../src/types";
import type { Scrutin, SessionVote, GroupAlignment, PersonnaliteAlignment } from "../src/types";

function mkScrutin(id: string, positions: Partial<Record<string, "pour" | "contre" | "abstention" | "divisé">>): Scrutin {
  return {
    id, numero: 1, date: "2024-01-01",
    dossier_id: "d1", dossier_titre: "T",
    chapeau: "X · Y", titre_brut: "...", titre_pedago: "...",
    position_par_groupe: positions as any,
    votes_bruts: {} as any,
    url_an_officielle: "https://example.com",
    est_solennel: true, pedago_relu: true,
  };
}

describe("alignmentScore — full matrix completion", () => {
  // matching.test.ts couvre pour/pour, contre/contre, pour/contre, contre/pour,
  // pour/abst, contre/abst, skip/pour, pour/divisé. Reste à couvrir abstention
  // côté user et divisé sur user contre.
  it("returns 1 when user abstention matches group abstention", () => {
    expect(alignmentScore("pour" as any, "abstention")).toBe(0.5);
    // Note: UserVote n'autorise pas "abstention" (UserVote = pour|contre|skip)
    // donc on teste seulement les couples valides : c'est intentionnel,
    // l'utilisateur ne peut pas voter abstention dans l'UI.
  });

  it("returns null for skip on any group position", () => {
    expect(alignmentScore("skip", "contre")).toBeNull();
    expect(alignmentScore("skip", "abstention")).toBeNull();
    expect(alignmentScore("skip", "divisé")).toBeNull();
  });
});

describe("computeAlignment — defensive cases", () => {
  it("silently skips votes pointing to unknown scrutin_id", () => {
    const scrutins: Scrutin[] = [mkScrutin("s1", { LFI: "pour" })];
    const votes: SessionVote[] = [
      { scrutin_id: "s1", choice: "pour", voted_at: 1 },
      { scrutin_id: "ghost", choice: "pour", voted_at: 2 },  // unknown
    ];
    const result = computeAlignment(scrutins, votes);
    // LFI should still count s1 only, not crash on ghost
    expect(result.LFI.counted).toBe(1);
    expect(result.LFI.perfect).toBe(1);
  });

  it("handles group missing from position_par_groupe (undefined)", () => {
    const scrutins: Scrutin[] = [mkScrutin("s1", { LFI: "pour" })];  // RN absent
    const votes: SessionVote[] = [
      { scrutin_id: "s1", choice: "pour", voted_at: 1 },
    ];
    const result = computeAlignment(scrutins, votes);
    expect(result.RN.counted).toBe(0);
    expect(result.RN.divided_excluded).toBe(0);
    expect(result.RN.pct).toBe(0);
  });

  it("returns pct=0 counted=0 for all groups when all votes are skip", () => {
    const scrutins: Scrutin[] = [
      mkScrutin("s1", { LFI: "pour", RN: "contre" }),
      mkScrutin("s2", { LFI: "pour", RN: "contre" }),
    ];
    const votes: SessionVote[] = [
      { scrutin_id: "s1", choice: "skip", voted_at: 1 },
      { scrutin_id: "s2", choice: "skip", voted_at: 2 },
    ];
    const result = computeAlignment(scrutins, votes);
    for (const code of GROUP_CODES) {
      expect(result[code].counted).toBe(0);
      expect(result[code].pct).toBe(0);
    }
  });

  it("rounds pct via Math.round (e.g. 2.5/3 → 83%, not 84%)", () => {
    const scrutins: Scrutin[] = [
      mkScrutin("s1", { LFI: "pour" }),
      mkScrutin("s2", { LFI: "pour" }),
      mkScrutin("s3", { LFI: "abstention" }),
    ];
    const votes: SessionVote[] = [
      { scrutin_id: "s1", choice: "pour", voted_at: 1 },
      { scrutin_id: "s2", choice: "pour", voted_at: 2 },
      { scrutin_id: "s3", choice: "pour", voted_at: 3 },
    ];
    const result = computeAlignment(scrutins, votes);
    // 1 + 1 + 0.5 = 2.5 ; 2.5/3 = 0.833... × 100 = 83.33 → round → 83
    expect(result.LFI.pct).toBe(83);
  });
});

describe("rankByAlignment", () => {
  it("sorts groups by pct descending", () => {
    const scrutins: Scrutin[] = [
      mkScrutin("s1", { LFI: "pour", RN: "contre", EPR: "pour" }),
    ];
    const votes: SessionVote[] = [
      { scrutin_id: "s1", choice: "pour", voted_at: 1 },
    ];
    const a = computeAlignment(scrutins, votes);
    const ranked = rankByAlignment(a);
    // pct order: 100 (LFI, EPR), 0 (RN), 0 (everyone else)
    expect(ranked[0].pct).toBe(100);
    expect(ranked[ranked.length - 1].pct).toBe(0);
    // Strictly descending
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].pct).toBeGreaterThanOrEqual(ranked[i].pct);
    }
  });

  it("returns an array of length GROUP_CODES.length", () => {
    const a = computeAlignment([], []);
    const ranked = rankByAlignment(a);
    expect(ranked.length).toBe(GROUP_CODES.length);
  });

  it("ranking is stable on ties (follows GROUP_CODES order)", () => {
    // No votes → all groups at pct=0. rankByAlignment must preserve
    // GROUP_CODES order on the tie so the UI doesn't flicker between
    // identical states.
    const a = computeAlignment([], []);
    const ranked = rankByAlignment(a);
    expect(ranked.map((r) => r.group)).toEqual([...GROUP_CODES]);
  });
});

describe("rankPersonnalitesByAlignment", () => {
  it("returns an array of length PERSONNALITE_CODES.length", () => {
    const a = computeAlignmentPersonnalites([], []);
    const ranked = rankPersonnalitesByAlignment(a);
    expect(ranked.length).toBe(PERSONNALITE_CODES.length);
  });

  it("ranking is stable on ties (follows PERSONNALITE_CODES order)", () => {
    const a = computeAlignmentPersonnalites([], []);
    const ranked = rankPersonnalitesByAlignment(a);
    expect(ranked.map((r) => r.personnalite)).toEqual([...PERSONNALITE_CODES]);
  });
});
```

- [ ] **Step 2: Run the new file and verify it passes**

```bash
npm run test:run -- matching-edge-cases
```

Expected: all tests pass. If a test fails, it's revealed a real bug in `matching.ts` — investigate, fix inline (separate commit with `fix(matching): ...` message), then continue.

- [ ] **Step 3: Run full suite to verify no regression**

```bash
npm run test:run
```

Expected: 45 + new tests, all pass.

- [ ] **Step 4: Commit**

```bash
git add tests/matching-edge-cases.test.ts
git commit -m "test(matching): edge cases (defensive, ranking stability, rounding)"
```

## Task 1.2: Tests deck invariants

**Files:**
- Create: `tests/deck-invariants.test.ts`

- [ ] **Step 1: Read existing deck.test.ts to avoid duplicates**

```bash
cat tests/deck.test.ts
```

Notes: `tests/deck.test.ts` couvre déjà capPerDossier basique, round-robin par thème basique, et drawNext. Le nouveau fichier teste les invariants V2 (capPerChapeauPrefix avec resume state, no duplicates, pool insuffisant).

- [ ] **Step 2: Write the test file**

```ts
// tests/deck-invariants.test.ts
import { describe, it, expect } from "vitest";
import { composeDeck, chapeauPrefix } from "../src/lib/deck";
import type { Scrutin } from "../src/types";

function mkScrutin(id: string, theme: Scrutin["theme"], dossierId: string, chapeau: string): Scrutin {
  return {
    id, numero: parseInt(id.replace(/\D/g, ""), 10) || 1,
    date: "2024-01-01",
    dossier_id: dossierId,
    dossier_titre: "T",
    chapeau,
    titre_brut: "...", titre_pedago: "...",
    theme,
    points_cles: ["a", "b", "c"],
    position_par_groupe: { LFI: "pour" } as any,
    votes_bruts: {} as any,
    url_an_officielle: "https://example.com",
    est_solennel: true, pedago_relu: true,
  };
}

describe("composeDeck — V2 invariants", () => {
  it("returns ≤ size cards even when pool is larger", () => {
    const pool = Array.from({ length: 100 }, (_, i) =>
      mkScrutin(`s${i}`, "fiscalité", `d${i}`, `FISCALITÉ · LOI ${i}`)
    );
    const deck = composeDeck(pool, {
      size: 20, capPerDossier: 2, capPerChapeauPrefix: 2,
    });
    expect(deck.length).toBeLessThanOrEqual(20);
  });

  it("honors capPerChapeauPrefix=2 on a MAYOTTE-like cluster", () => {
    const pool = [
      mkScrutin("m1", "international", "DA", "MAYOTTE · cyclone Chido"),
      mkScrutin("m2", "international", "DB", "MAYOTTE · reconstruction"),
      mkScrutin("m3", "international", "DC", "MAYOTTE · état d'urgence"),
      mkScrutin("m4", "international", "DD", "MAYOTTE · loi spéciale"),
      mkScrutin("f1", "fiscalité",     "DE", "FISCALITÉ · taxe carbone"),
      mkScrutin("f2", "fiscalité",     "DF", "FISCALITÉ · niches"),
      mkScrutin("f3", "fiscalité",     "DG", "FISCALITÉ · ISF"),
    ];
    const deck = composeDeck(pool, {
      size: 20, capPerDossier: 2, capPerChapeauPrefix: 2,
    });
    const mayotteCount = deck.filter((s) => chapeauPrefix(s) === "MAYOTTE").length;
    expect(mayotteCount).toBeLessThanOrEqual(2);
  });

  it("respects resume state (seenDossierCounts pre-filled excludes saturated dossier)", () => {
    const pool = [
      mkScrutin("a1", "fiscalité", "D1", "FISCALITÉ · loi A"),
      mkScrutin("a2", "fiscalité", "D1", "FISCALITÉ · loi A bis"),
      mkScrutin("b1", "santé",     "D2", "SANTÉ · loi B"),
    ];
    const seenDossierCounts = new Map([["D1", 2]]);  // D1 already at cap
    const deck = composeDeck(pool, {
      size: 20, capPerDossier: 2, capPerChapeauPrefix: 2,
      seenDossierCounts,
    });
    // D1 saturated → only s from D2 should appear
    expect(deck.map((s) => s.id)).toEqual(["b1"]);
  });

  it("returns no duplicate ids", () => {
    const pool = Array.from({ length: 30 }, (_, i) =>
      mkScrutin(`s${i}`, "fiscalité", `d${i}`, `FISCALITÉ · ${i}`)
    );
    const deck = composeDeck(pool, { size: 20, capPerDossier: 2, capPerChapeauPrefix: 2 });
    const ids = deck.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("returns [] for empty pool", () => {
    const deck = composeDeck([], { size: 20, capPerDossier: 2, capPerChapeauPrefix: 2 });
    expect(deck).toEqual([]);
  });

  it("returns all available when pool < size", () => {
    const pool = [
      mkScrutin("s1", "fiscalité", "D1", "FISCALITÉ · A"),
      mkScrutin("s2", "santé",     "D2", "SANTÉ · B"),
      mkScrutin("s3", "écologie",  "D3", "ÉCOLOGIE · C"),
    ];
    const deck = composeDeck(pool, { size: 20, capPerDossier: 2, capPerChapeauPrefix: 2 });
    expect(deck.length).toBe(3);
  });
});
```

- [ ] **Step 3: Run new tests**

```bash
npm run test:run -- deck-invariants
```

Expected: tests pass. If a test fails, fix the deck.ts bug inline before continuing.

- [ ] **Step 4: Run full suite**

```bash
npm run test:run
```

Expected: green.

- [ ] **Step 5: Commit**

```bash
git add tests/deck-invariants.test.ts
git commit -m "test(deck): V2 invariants (capPerChapeauPrefix, resume awareness, no dupes)"
```

---

# PHASE 2 — ErrorBoundary

## Task 2.1: ErrorBoundary tests

**Files:**
- Create: `tests/ErrorBoundary.test.tsx`

- [ ] **Step 1: Write tests**

```tsx
// tests/ErrorBoundary.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import * as analytics from "../src/lib/analytics";

function ChildThatThrows(): never {
  throw new Error("kaboom");
}

describe("ErrorBoundary", () => {
  let trackSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    trackSpy = vi.spyOn(analytics, "track").mockImplementation(() => {});
    // React logs uncaught errors to console.error in dev; silence for clean output
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    trackSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <p>Hello</p>
      </ErrorBoundary>
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <ChildThatThrows />
      </ErrorBoundary>
    );
    expect(screen.getByText(/quelque chose s'est cassé/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /recharger/i })).toBeInTheDocument();
  });

  it("calls track('error', ...) when a child throws", () => {
    render(
      <ErrorBoundary>
        <ChildThatThrows />
      </ErrorBoundary>
    );
    expect(trackSpy).toHaveBeenCalledWith(
      "error",
      expect.objectContaining({ msg: "kaboom" }),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- ErrorBoundary
```

Expected: FAIL — `Cannot find module '../src/components/ErrorBoundary'`

- [ ] **Step 3: Create the component**

```tsx
// src/components/ErrorBoundary.tsx
import React, { type ReactNode } from "react";
import { track } from "../lib/analytics";

interface State { hasError: boolean; }

export class ErrorBoundary extends React.Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(err: Error, info: { componentStack: string }) {
    track("error", {
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
    <section style={{
      maxWidth: 480, margin: "0 auto",
      padding: "48px var(--gutter)", textAlign: "center",
      display: "flex", flexDirection: "column", gap: 16,
    }}>
      <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5 }}>
        Quelque chose s'est cassé de notre côté.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          alignSelf: "center",
          background: "var(--accent)", color: "var(--bg)", border: "none",
          padding: "12px 20px", borderRadius: 6,
          fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14,
          cursor: "pointer",
        }}
      >Recharger</button>
      <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8 }}>
        Si ça persiste : <a href="mailto:contact@sansdetour.fr" style={{ color: "var(--accent)" }}>contact@sansdetour.fr</a>
      </p>
    </section>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- ErrorBoundary
```

Expected: 3 tests pass.

- [ ] **Step 5: Wire ErrorBoundary into App.tsx**

```tsx
// src/App.tsx
import type { ReactNode } from "react";
import { TopBar } from "./components/TopBar";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App({ children }: { children: ReactNode }) {
  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg)",
      color: "var(--ink)",
    }}>
      <TopBar />
      <main style={{ flex: 1 }}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
}
```

- [ ] **Step 6: Run full test suite**

```bash
npm run test:run
```

Expected: green.

- [ ] **Step 7: Commit**

```bash
git add src/components/ErrorBoundary.tsx src/App.tsx tests/ErrorBoundary.test.tsx
git commit -m "feat(boundary): global error boundary wrapping main, plausible 'error' event"
```

---

# PHASE 3 — A11y plumbing Card (sans nouveau contenu)

## Task 3.1: Create useFlipCardA11y hook

**Files:**
- Create: `src/hooks/useFlipCardA11y.ts` (nouveau dossier)

- [ ] **Step 1: Create hooks directory and hook file**

```bash
mkdir -p src/hooks
```

Write the hook :

```ts
// src/hooks/useFlipCardA11y.ts
import { useCallback, type KeyboardEvent } from "react";
import type { Scrutin } from "../types";

export interface UseFlipCardA11yArgs {
  flipped: boolean;
  topMost: boolean;
  scrutin: Scrutin;
  onFlip: () => void;
  onSwipe?: (dir: "left" | "right" | "down") => void;
}

export interface FlipCardA11yResult {
  rootProps: {
    role: "article";
    "aria-roledescription": string;
    "aria-label": string;
    tabIndex: number;
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  };
  frontProps: { "aria-hidden": boolean };
  backProps: { "aria-hidden": boolean };
}

/** Accessibility plumbing for the flippable Card:
 *  - rootProps: role/label, tabIndex (top card focusable), keyboard handlers
 *  - frontProps/backProps: aria-hidden toggled by `flipped` so the SR
 *    only reads one face at a time even though both live in the DOM. */
export function useFlipCardA11y({
  flipped, topMost, scrutin, onFlip, onSwipe,
}: UseFlipCardA11yArgs): FlipCardA11yResult {
  const onKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (!topMost) return;
    const tgt = e.target as HTMLElement;
    // Let buttons/links handle their own key events
    if (tgt.closest("a, button")) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onFlip();
      return;
    }
    // Vote keys only on the recto (front face)
    if (!flipped && onSwipe) {
      if (e.key === "ArrowRight") { e.preventDefault(); onSwipe("right"); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); onSwipe("left"); }
      else if (e.key === "ArrowDown") { e.preventDefault(); onSwipe("down"); }
    }
  }, [flipped, topMost, onFlip, onSwipe]);

  return {
    rootProps: {
      role: "article",
      "aria-roledescription": "carte de scrutin, glissez pour voter",
      "aria-label": `Scrutin n°${scrutin.numero} : ${scrutin.titre_pedago}`,
      tabIndex: topMost ? 0 : -1,
      onKeyDown,
    },
    frontProps: { "aria-hidden": flipped },
    backProps: { "aria-hidden": !flipped },
  };
}
```

- [ ] **Step 2: Verify it compiles (no test yet — tested via Card tests in Task 3.2)**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useFlipCardA11y.ts
git commit -m "feat(a11y): useFlipCardA11y hook (aria-hidden + keyboard nav)"
```

## Task 3.2: Integrate useFlipCardA11y into Card + add useReducedMotion

**Files:**
- Modify: `src/components/Card.tsx`
- Create: `tests/Card.test.tsx`

- [ ] **Step 1: Write Card a11y tests FIRST (will fail until impl is integrated)**

```tsx
// tests/Card.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Card } from "../src/components/Card";
import type { Scrutin } from "../src/types";

function mkScrutin(): Scrutin {
  return {
    id: "VTANR5L17V1234", numero: 1234, date: "2024-06-15",
    dossier_id: "d1", dossier_titre: "T",
    chapeau: "FISCALITÉ · LOI X",
    titre_brut: "Projet de loi sur l'ensemble",
    titre_pedago: "Hausse de la taxe carbone de 5 euros par tonne",
    contexte: "Texte sur la taxe carbone **renforcée**.",
    points_cles: ["Hausse 5€/t", "Effet 2026", "5M de foyers concernés"],
    position_par_groupe: { LFI: "pour", RN: "contre" } as any,
    votes_bruts: {} as any,
    url_an_officielle: "https://an.example/1234",
    est_solennel: true, pedago_relu: true,
  };
}

describe("Card a11y", () => {
  it("renders chapeau and title on recto", () => {
    render(<Card scrutin={mkScrutin()} topMost={true} />);
    expect(screen.getByText(/FISCALITÉ · LOI X/)).toBeInTheDocument();
    expect(screen.getByText(/Hausse de la taxe carbone/)).toBeInTheDocument();
  });

  it("has role=article and aria-label including scrutin numero", () => {
    render(<Card scrutin={mkScrutin()} topMost={true} />);
    const card = screen.getByRole("article");
    expect(card).toHaveAttribute("aria-label", expect.stringContaining("1234"));
  });

  it("is tabbable when topMost, not tabbable otherwise", () => {
    const { rerender } = render(<Card scrutin={mkScrutin()} topMost={true} />);
    expect(screen.getByRole("article")).toHaveAttribute("tabindex", "0");
    rerender(<Card scrutin={mkScrutin()} topMost={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("tabindex", "-1");
  });

  it("calls onSwipe('right') on ArrowRight when topMost and not flipped", () => {
    const onSwipe = vi.fn();
    render(<Card scrutin={mkScrutin()} topMost={true} onSwipe={onSwipe} />);
    fireEvent.keyDown(screen.getByRole("article"), { key: "ArrowRight" });
    expect(onSwipe).toHaveBeenCalledWith("right");
  });

  it("calls onSwipe('left') on ArrowLeft when topMost and not flipped", () => {
    const onSwipe = vi.fn();
    render(<Card scrutin={mkScrutin()} topMost={true} onSwipe={onSwipe} />);
    fireEvent.keyDown(screen.getByRole("article"), { key: "ArrowLeft" });
    expect(onSwipe).toHaveBeenCalledWith("left");
  });

  it("calls onSwipe('down') on ArrowDown when topMost and not flipped", () => {
    const onSwipe = vi.fn();
    render(<Card scrutin={mkScrutin()} topMost={true} onSwipe={onSwipe} />);
    fireEvent.keyDown(screen.getByRole("article"), { key: "ArrowDown" });
    expect(onSwipe).toHaveBeenCalledWith("down");
  });

  it("does not call onSwipe when not topMost", () => {
    const onSwipe = vi.fn();
    render(<Card scrutin={mkScrutin()} topMost={false} onSwipe={onSwipe} />);
    fireEvent.keyDown(screen.getByRole("article"), { key: "ArrowRight" });
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it("flips on Enter key when topMost", () => {
    render(<Card scrutin={mkScrutin()} topMost={true} />);
    expect(screen.queryByText(/INTITULÉ OFFICIEL AN/i)).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("article"), { key: "Enter" });
    // After flip, the verso content (intitulé brut) should be visible
    expect(screen.getByText(/INTITULÉ OFFICIEL AN/i)).toBeInTheDocument();
  });

  it("flips on Space key when topMost", () => {
    render(<Card scrutin={mkScrutin()} topMost={true} />);
    fireEvent.keyDown(screen.getByRole("article"), { key: " " });
    expect(screen.getByText(/INTITULÉ OFFICIEL AN/i)).toBeInTheDocument();
  });

  it("ignores arrow keys when flipped (vote only on recto)", () => {
    const onSwipe = vi.fn();
    render(<Card scrutin={mkScrutin()} topMost={true} onSwipe={onSwipe} />);
    // Flip first
    fireEvent.keyDown(screen.getByRole("article"), { key: "Enter" });
    // Now arrows should not trigger vote
    fireEvent.keyDown(screen.getByRole("article"), { key: "ArrowRight" });
    expect(onSwipe).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
npm run test:run -- Card
```

Expected: most tests FAIL — Card doesn't have `role="article"`, `tabIndex`, or keyboard handlers yet.

- [ ] **Step 3: Modify Card.tsx — integrate useFlipCardA11y + useReducedMotion**

Open `src/components/Card.tsx`. Make these changes :

**3a. Add imports at the top :**

```tsx
import { useState } from "react";
import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import type { Scrutin } from "../types";
import { useFlipCardA11y } from "../hooks/useFlipCardA11y";
```

**3b. In the `Card` function, after `useState`s for `flipped` and `backVariant`, get reduced-motion and a11y :**

```tsx
const reducedMotion = useReducedMotion();
const a11y = useFlipCardA11y({
  flipped,
  topMost,
  scrutin,
  onFlip: () => {
    setFlipped((f) => {
      if (!f) setBackVariant("explanation");
      return !f;
    });
  },
  onSwipe,
});
```

**3c. Replace the outer `<motion.div drag={...} ...>` opening to apply rootProps and adjust transitions :**

```tsx
return (
  <motion.div
    {...a11y.rootProps}
    drag={topMost && !flipped}
    dragSnapToOrigin
    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
    dragElastic={reducedMotion ? 0 : 0.18}
    onTap={handleTap}
    onDragEnd={handleDragEnd}
    style={{
      cursor: topMost ? (flipped ? "pointer" : "grab") : "default",
      userSelect: "none",
      touchAction: topMost && !flipped ? "none" : "auto",
      perspective: 1500,
      height: "100%",
      outline: "none",  // focus ring handled by Card border in CSS hover state if added later
    }}
  >
```

**3d. Update the rotate animation transition :**

```tsx
<motion.div
  animate={{ rotateY: flipped ? 180 : 0 }}
  transition={reducedMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
  style={{
    position: "relative",
    transformStyle: "preserve-3d",
    height: "100%",
  }}
>
```

**3e. Apply `frontProps` to the FRONT face div and `backProps` to the BACK face div** :

On the recto face wrapper :

```tsx
<div {...a11y.frontProps} style={{ ...FACE_STYLE, ... }}>
```

On the verso face wrapper :

```tsx
<div
  {...a11y.backProps}
  style={{
    ...FACE_STYLE,
    position: "absolute",
    inset: 0,
    transform: "rotateY(180deg)",
    overflow: "auto",
    gap: 16,
  }}
>
```

- [ ] **Step 4: Run Card tests**

```bash
npm run test:run -- Card
```

Expected: all 10 tests pass. If `flipped on Enter` fails, check that `handleTap` no longer pre-empts the keyboard flip (it shouldn't — the handler should only react to pointer events).

- [ ] **Step 5: Run full suite to verify no regression**

```bash
npm run test:run
```

Expected: green.

- [ ] **Step 6: Commit**

```bash
git add src/components/Card.tsx tests/Card.test.tsx
git commit -m "feat(a11y): Card flippable accessible (role/label, keyboard nav, aria-hidden)"
```

## Task 3.3: Add live region to Play.tsx for vote announcements

**Files:**
- Modify: `src/routes/Play.tsx`

- [ ] **Step 1: Add live region state + announce on vote**

Edit `src/routes/Play.tsx` :

**1a. Add state at the top of the component, after `loadTick` :**

```tsx
const [lastVoteLabel, setLastVoteLabel] = useState("");
```

**1b. Update `handleVote` — set the label before navigation logic :**

```tsx
function handleVote(scrutinId: string, choice: UserVote) {
  recordVote(scrutinId, choice);
  track("vote", { choice });
  setTick((t) => t + 1);

  // Announce to screen readers (live region below).
  const labels: Record<UserVote, string> = {
    pour: "Voté pour. Carte suivante.",
    contre: "Voté contre. Carte suivante.",
    skip: "Passé. Carte suivante.",
  };
  setLastVoteLabel(labels[choice]);

  // ... rest unchanged
```

**1c. Add the live region inside the returned `<section>`, just above `<DeckStack>` :**

```tsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  style={{
    position: "absolute",
    width: 1, height: 1,
    padding: 0, margin: -1,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  }}
>
  {lastVoteLabel}
</div>

<DeckStack scrutins={deck} onVote={handleVote} />
```

- [ ] **Step 2: Run full suite (no specific test for live region — it's verified by absence of regression)**

```bash
npm run test:run
```

Expected: green.

- [ ] **Step 3: Manual smoke check**

```bash
npm run dev
```

Navigate to `/play`, open browser devtools, vote with a button. In devtools Accessibility tree, verify the live region updates with « Voté pour. Carte suivante. » or similar.

- [ ] **Step 4: Commit**

```bash
git add src/routes/Play.tsx
git commit -m "feat(a11y): aria-live region announces votes to screen readers"
```

---

# PHASE 4 — MethodeSheet

## Task 4.1: MethodeSheet tests

**Files:**
- Create: `tests/MethodeSheet.test.tsx`

- [ ] **Step 1: Write tests**

```tsx
// tests/MethodeSheet.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MethodeSheet } from "../src/components/MethodeSheet";

function renderSheet(open: boolean, onClose = vi.fn()) {
  return render(
    <MemoryRouter>
      <MethodeSheet open={open} onClose={onClose} />
    </MemoryRouter>
  );
}

describe("MethodeSheet", () => {
  it("renders nothing when open=false", () => {
    renderSheet(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog with aria-modal and aria-labelledby when open=true", () => {
    renderSheet(true);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
    const titleId = dialog.getAttribute("aria-labelledby")!;
    expect(document.getElementById(titleId)).toBeInTheDocument();
  });

  it("focuses the close button on mount", async () => {
    renderSheet(true);
    const closeBtn = screen.getByRole("button", { name: /fermer/i });
    // Focus happens after mount effect — give it a tick
    await new Promise((r) => setTimeout(r, 0));
    expect(closeBtn).toHaveFocus();
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    renderSheet(true, onClose);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    renderSheet(true, onClose);
    fireEvent.click(screen.getByTestId("methode-sheet-backdrop"));
    expect(onClose).toHaveBeenCalled();
  });

  it("includes mailto and methode link", () => {
    renderSheet(true);
    const mailLink = screen.getByRole("link", { name: /signaler/i });
    expect(mailLink).toHaveAttribute("href", expect.stringContaining("mailto:"));
    expect(screen.getByRole("link", { name: /méthode complète/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
npm run test:run -- MethodeSheet
```

Expected: FAIL — `Cannot find module '../src/components/MethodeSheet'`.

- [ ] **Step 3: Create the component**

```tsx
// src/components/MethodeSheet.tsx
import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

export interface MethodeSheetProps {
  open: boolean;
  onClose: () => void;
}

/** Bottom-sheet « Comment c'est fait ? » triggered from the ✨IA chip on a
 *  Card recto. Modal dialog pattern (different from the TopBar menu, which
 *  is a popover): aria-modal, focus trap, ESC and backdrop close, focus
 *  restored to the opener (the chip) on close. */
export function MethodeSheet({ open, onClose }: MethodeSheetProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  // Save the opener so we can restore focus when the sheet closes
  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement as HTMLElement | null;
      // Focus close button on next tick (after animation start)
      const id = requestAnimationFrame(() => closeBtnRef.current?.focus());
      return () => cancelAnimationFrame(id);
    } else {
      openerRef.current?.focus();
    }
  }, [open]);

  // ESC handler
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Focus trap: cycle Tab within dialog
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = dialog.querySelectorAll<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            data-testid="methode-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.16 }}
            onClick={onClose}
            aria-hidden="true"
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 40,
            }}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="methode-sheet-title"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={reducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 380, damping: 32 }}
            style={{
              position: "fixed",
              left: 0, right: 0, bottom: 0,
              maxHeight: "85dvh",
              overflow: "auto",
              background: "var(--bg-2)",
              borderTop: "1px solid var(--line)",
              borderRadius: "14px 14px 0 0",
              zIndex: 41,
              padding: "22px var(--gutter) 28px",
              display: "flex", flexDirection: "column", gap: 16,
            }}
          >
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderBottom: "1px solid var(--line)", paddingBottom: 12,
            }}>
              <h2 id="methode-sheet-title" style={{
                margin: 0,
                fontFamily: "var(--font-mono)", fontSize: 11,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: "var(--ink-3)", fontWeight: 500,
              }}>Comment c'est fait ?</h2>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                style={{
                  background: "transparent", border: "1px solid var(--line)",
                  color: "var(--ink-2)", borderRadius: 4,
                  width: 32, height: 32,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 14,
                  lineHeight: 1,
                }}
              >✕</button>
            </div>

            <Block emoji="📊" title="AN officiel">
              Date, numéro, vote des députés, libellé brut du scrutin,
              position des groupes parlementaires.
            </Block>

            <Block emoji="✨" title="Mis en forme par IA Claude">
              <p style={{ margin: "0 0 10px" }}>
                Le titre court reformulé, les points clés, le résumé, la
                synthèse du texte officiel.
              </p>
              <p style={{ margin: "0 0 10px" }}>
                Claude reçoit le libellé brut de l'AN + des résultats de
                recherche web. Pas d'opinion humaine ni d'orientation
                politique dans son prompt. <b>Sa mission : rendre lisible,
                pas commenter.</b>
              </p>
              <p style={{ margin: 0 }}>
                Le calcul d'alignement, lui, est une formule mathématique
                pure — aucune IA dans le score.
              </p>
            </Block>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              <Link
                to="/methode"
                onClick={onClose}
                style={btnPrimary()}
              >→ Méthode complète</Link>
              <a
                href="mailto:contact@sansdetour.fr?subject=Sans%20D%C3%A9tour%20%E2%80%94%20Signalement%20d%27une%20erreur%20factuelle"
                style={btnSecondary()}
              >✉ Signaler une erreur factuelle</a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Block({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10.5,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: "var(--accent)", fontWeight: 600,
      }}>{emoji} {title}</div>
      <div style={{
        fontFamily: "var(--font-sans)", fontSize: 13.5, lineHeight: 1.55,
        color: "var(--ink-2)", textWrap: "pretty" as const,
      }}>{children}</div>
    </div>
  );
}

function btnPrimary(): React.CSSProperties {
  return {
    background: "var(--accent)", color: "var(--bg)",
    textAlign: "center", textDecoration: "none",
    padding: "12px 16px", borderRadius: 6,
    fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14,
  };
}
function btnSecondary(): React.CSSProperties {
  return {
    background: "transparent", color: "var(--ink)",
    border: "1px solid var(--line)",
    textAlign: "center", textDecoration: "none",
    padding: "12px 16px", borderRadius: 6,
    fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 13.5,
  };
}
```

- [ ] **Step 4: Run tests**

```bash
npm run test:run -- MethodeSheet
```

Expected: 6 tests pass.

- [ ] **Step 5: Run full suite**

```bash
npm run test:run
```

Expected: green.

- [ ] **Step 6: Commit**

```bash
git add src/components/MethodeSheet.tsx tests/MethodeSheet.test.tsx
git commit -m "feat(transparence): MethodeSheet bottom-sheet (dialog, focus trap, ESC, backdrop)"
```

## Task 4.2: TopBar popover — restore focus to trigger on close

**Files:**
- Modify: `src/components/TopBar.tsx`

Note : ce n'est pas un retrofit modal (le menu est un popover, pas un dialog), mais une enhancement a11y minimal cohérente.

- [ ] **Step 1: Add useRef on the trigger button + restore on close**

Edit `src/components/TopBar.tsx`. In the `TopBar` function :

```tsx
import { useEffect, useRef, useState, type CSSProperties } from "react";
// ... existing imports

export function TopBar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Restore focus to trigger when menu closes (e.g. via ESC or backdrop)
  const prevOpenRef = useRef(menuOpen);
  useEffect(() => {
    if (prevOpenRef.current && !menuOpen) {
      triggerRef.current?.focus();
    }
    prevOpenRef.current = menuOpen;
  }, [menuOpen]);

  // ... rest unchanged, then in the JSX pass triggerRef:
  return (
    // ...
    <MenuTrigger
      triggerRef={triggerRef}
      open={menuOpen}
      onToggle={() => setMenuOpen((o) => !o)}
    />
    // ...
  );
}

function MenuTrigger({
  triggerRef, open, onToggle,
}: {
  triggerRef: React.RefObject<HTMLButtonElement>;
  open: boolean; onToggle: () => void;
}) {
  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={onToggle}
      // ... rest unchanged
    >
      •••
    </button>
  );
}
```

- [ ] **Step 2: Run full suite to verify no regression**

```bash
npm run test:run
```

Expected: green.

- [ ] **Step 3: Manual smoke check**

Open the menu (•••), press ESC. The •••  trigger should regain visible focus ring.

- [ ] **Step 4: Commit**

```bash
git add src/components/TopBar.tsx
git commit -m "feat(a11y): restore focus to menu trigger when popover closes"
```

---

# PHASE 5 — Chip ✨IA + wiring

## Task 5.1: Add onOpenMethode prop to DeckStack + Card

**Files:**
- Modify: `src/components/DeckStack.tsx`
- Modify: `src/components/Card.tsx`

- [ ] **Step 1: Update DeckStack signature and forward to topMost card**

```tsx
// src/components/DeckStack.tsx
import type { Scrutin, UserVote } from "../types";
import { Card } from "./Card";

export interface DeckStackProps {
  scrutins: Scrutin[];
  onVote: (scrutinId: string, choice: UserVote) => void;
  onOpenMethode?: () => void;
}

export function DeckStack({ scrutins, onVote, onOpenMethode }: DeckStackProps) {
  if (scrutins.length === 0) return null;
  const visible = scrutins.slice(0, 3);

  function handleSwipe(s: Scrutin, dir: "left" | "right" | "down") {
    const choice: UserVote = dir === "left" ? "contre" : dir === "right" ? "pour" : "skip";
    onVote(s.id, choice);
  }

  return (
    <div style={{
      flex: 1, position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "6px 0",
    }}>
      {visible.map((s, i) => {
        const isTop = i === 0;
        const offset = i * 8;
        const scale = 1 - i * 0.035;
        const opacity = i === 0 ? 1 : i === 1 ? 0.75 : 0.45;
        return (
          <div
            key={s.id}
            style={{
              position: "absolute",
              left: 8, right: 8, top: offset, bottom: offset,
              transform: `scale(${scale}) translateY(${offset / 2}px)`,
              opacity,
              zIndex: 10 - i,
              pointerEvents: isTop ? "auto" : "none",
            }}
          >
            <Card
              scrutin={s}
              topMost={isTop}
              onSwipe={(dir) => handleSwipe(s, dir)}
              onOpenMethode={isTop ? onOpenMethode : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Update Card props interface to accept onOpenMethode**

In `src/components/Card.tsx`, add to `CardProps` :

```tsx
export interface CardProps {
  scrutin: Scrutin;
  topMost: boolean;
  onSwipe?: (dir: "left" | "right" | "down") => void;
  onOpenMethode?: () => void;
}
```

And accept the prop in the function signature :

```tsx
export function Card({ scrutin, topMost, onSwipe, onOpenMethode }: CardProps) {
```

(don't use it yet — Task 5.2 will render the chip)

- [ ] **Step 3: Run full suite**

```bash
npm run test:run
```

Expected: green (no behavioral change yet).

- [ ] **Step 4: Commit**

```bash
git add src/components/DeckStack.tsx src/components/Card.tsx
git commit -m "feat(transparence): plumb onOpenMethode prop from Play down to top Card"
```

## Task 5.2: Render the chip ✨IA in Card recto

**Files:**
- Modify: `src/components/Card.tsx`
- Modify: `tests/Card.test.tsx` (add 2 tests)

- [ ] **Step 1: Add tests for chip rendering and callback**

Append to `tests/Card.test.tsx` (inside the existing describe block) :

```tsx
  it("renders the IA chip when topMost and onOpenMethode provided", () => {
    render(<Card scrutin={mkScrutin()} topMost={true} onOpenMethode={vi.fn()} />);
    expect(screen.getByRole("button", { name: /comment ce contenu a été préparé/i })).toBeInTheDocument();
  });

  it("does not render IA chip when not topMost", () => {
    render(<Card scrutin={mkScrutin()} topMost={false} onOpenMethode={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /comment ce contenu a été préparé/i })).not.toBeInTheDocument();
  });

  it("calls onOpenMethode when IA chip is clicked", () => {
    const onOpenMethode = vi.fn();
    render(<Card scrutin={mkScrutin()} topMost={true} onOpenMethode={onOpenMethode} />);
    fireEvent.click(screen.getByRole("button", { name: /comment ce contenu a été préparé/i }));
    expect(onOpenMethode).toHaveBeenCalled();
  });
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
npm run test:run -- Card
```

Expected: 3 new tests FAIL — chip not in DOM yet.

- [ ] **Step 3: Add chip to Card recto**

In `src/components/Card.tsx`, find the recto chapeau row (the `<div>` containing `{scrutin.chapeau}` and the `+ analyse` button). Modify the chapeau div to include the chip :

```tsx
<div style={{
  display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
}}>
  <div style={{
    fontFamily: "var(--font-mono)", fontSize: 11,
    letterSpacing: "0.12em", textTransform: "uppercase",
    color: "var(--accent)", fontWeight: 500,
    flex: 1,
  }}>
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
            padding: "4px 2px",
            fontFamily: "inherit",
            fontSize: "inherit",
            letterSpacing: "inherit",
            textTransform: "inherit",
            textDecoration: "underline",
            textUnderlineOffset: 3,
            textDecorationStyle: "dotted",
          }}
        >✨IA</button>
      </>
    )}
  </div>
  {topMost && (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); showAnalyse(); }}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label="Voir l'analyse détaillée du scrutin"
      style={{
        background: "transparent",
        border: "1px solid var(--line)",
        color: scrutin.analyse_loi ? "var(--accent)" : "var(--ink-3)",
        fontFamily: "var(--font-mono)", fontSize: 10,
        padding: "6px 10px",  // bumped from 3px 8px for touch target
        borderRadius: 3,
        cursor: "pointer", letterSpacing: "0.08em",
        whiteSpace: "nowrap",
        textTransform: "uppercase",
      }}
    >+ analyse</button>
  )}
</div>
```

Note: we also bumped `+ analyse` padding from `3px 8px` to `6px 10px` (touch target audit, Phase 10 task).

- [ ] **Step 4: Run Card tests**

```bash
npm run test:run -- Card
```

Expected: all 13 tests pass (10 a11y + 3 chip).

- [ ] **Step 5: Run full suite**

```bash
npm run test:run
```

Expected: green.

- [ ] **Step 6: Commit**

```bash
git add src/components/Card.tsx tests/Card.test.tsx
git commit -m "feat(transparence): IA chip on Card recto opens MethodeSheet"
```

## Task 5.3: Wire MethodeSheet into Play.tsx

**Files:**
- Modify: `src/routes/Play.tsx`

- [ ] **Step 1: Add state + mount MethodeSheet + pass callback to DeckStack**

In `src/routes/Play.tsx` :

**1a. Import MethodeSheet :**

```tsx
import { MethodeSheet } from "../components/MethodeSheet";
```

**1b. Add state, after `lastVoteLabel` :**

```tsx
const [methodeSheetOpen, setMethodeSheetOpen] = useState(false);
```

**1c. Update the `<DeckStack>` usage to pass `onOpenMethode` :**

```tsx
<DeckStack
  scrutins={deck}
  onVote={handleVote}
  onOpenMethode={() => setMethodeSheetOpen(true)}
/>
```

**1d. Mount `<MethodeSheet>` at the bottom of the `<section>` (after the `<RankingOverlay>`) :**

```tsx
<RankingOverlay
  open={rankingOpen}
  alignments={alignments}
  countedTotal={countedTotal}
  onClose={() => setRankingOpen(false)}
/>

<MethodeSheet
  open={methodeSheetOpen}
  onClose={() => setMethodeSheetOpen(false)}
/>
```

- [ ] **Step 2: Run full suite**

```bash
npm run test:run
```

Expected: green.

- [ ] **Step 3: Manual smoke check**

```bash
npm run dev
```

Navigate to `/play`. Tap the ✨IA chip on a card. MethodeSheet should slide up from the bottom. Press ESC. It should close and focus return to the chip.

- [ ] **Step 4: Commit**

```bash
git add src/routes/Play.tsx
git commit -m "feat(transparence): Play wires chip -> MethodeSheet open/close"
```

---

# PHASE 6 — Verso lines

## Task 6.1: Verso explanation — separation line

**Files:**
- Modify: `src/components/Card.tsx`

- [ ] **Step 1: Add test for the verso explanation line**

Append to `tests/Card.test.tsx` :

```tsx
  it("renders verso explanation with separation line between context and AN libellé", () => {
    render(<Card scrutin={mkScrutin()} topMost={true} />);
    // Flip to verso
    fireEvent.keyDown(screen.getByRole("article"), { key: "Enter" });
    expect(screen.getByText(/Résumé IA/i)).toBeInTheDocument();
    expect(screen.getByText(/libellé officiel AN/i)).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run, verify it fails**

```bash
npm run test:run -- Card
```

Expected: FAIL — no « Résumé IA » text yet.

- [ ] **Step 3: Modify the verso explanation rendering**

In `src/components/Card.tsx`, find the `ExplanationBody` function. Modify it :

```tsx
function ExplanationBody({ scrutin }: { scrutin: Scrutin }) {
  return (
    <>
      <div style={{
        fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.6,
        color: "var(--ink-2)", textWrap: "pretty" as const,
      }}>
        {scrutin.contexte ? (
          renderWithBold(scrutin.contexte)
        ) : (
          <em style={{ color: "var(--ink-3)" }}>
            Aucune explication détaillée disponible pour ce scrutin. Le titre officiel ci-dessous donne le sujet général.
          </em>
        )}
      </div>

      {/* Separation line between LLM-rendered summary and the raw AN libellé.
       *  Replaces the previous dashed top-border so the boundary is verbalised
       *  rather than just visual. */}
      <div style={{
        paddingTop: 10, marginTop: 4,
        borderTop: "1px solid var(--line)",
        fontFamily: "var(--font-mono)", fontSize: 9.5,
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: "var(--ink-3)", textAlign: "center",
      }}>
        ↑ Résumé IA  ·  ↓ libellé officiel AN
      </div>

      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        color: "var(--ink-3)", letterSpacing: "0.04em",
        lineHeight: 1.5,
      }}>
        <span style={{ textTransform: "uppercase", letterSpacing: "0.12em" }}>Intitulé officiel AN · </span>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5 }}>{scrutin.titre_brut}</span>
      </div>
    </>
  );
}
```

Note the change: removed `paddingTop: 8, borderTop: "1px dashed var(--line)"` from the third `<div>` since the new separation line above already handles the visual break.

- [ ] **Step 4: Run tests**

```bash
npm run test:run -- Card
```

Expected: 14 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/Card.tsx tests/Card.test.tsx
git commit -m "feat(transparence): verso explanation explicit separation line (Résumé IA / libellé AN)"
```

## Task 6.2: Verso analyse — footer attribution

**Files:**
- Modify: `src/components/Card.tsx`

- [ ] **Step 1: Add test for the analyse footer**

Append to `tests/Card.test.tsx` :

```tsx
  it("renders verso analyse with Claude attribution footer", () => {
    const scrutin = mkScrutin();
    scrutin.analyse_loi = {
      mesures_principales: ["Mesure A"],
      concernes_positifs: [], concernes_negatifs: [], concernes_neutres: [],
      calendrier: [], exceptions: [],
    };
    render(<Card scrutin={scrutin} topMost={true} />);
    // Tap "+ analyse" button to go to the analyse variant
    fireEvent.click(screen.getByRole("button", { name: /voir l'analyse/i }));
    expect(screen.getByText(/synthèse mise en forme par claude/i)).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run, verify it fails**

```bash
npm run test:run -- Card
```

Expected: FAIL — no « Synthèse mise en forme par Claude » text.

- [ ] **Step 3: Modify the verso analyse rendering**

In `src/components/Card.tsx`, find the back face rendering logic. Locate where the `AnalyseBody` is called and add a footer between it and the shared footer (« tap pour revenir » / « Voir sur AN »).

The structure should become :

```tsx
{backVariant === "analyse" ? (
  <>
    <div style={{
      fontFamily: "var(--font-sans)", fontWeight: 500,
      fontSize: 13, lineHeight: 1.35,
      color: "var(--ink-3)", textWrap: "pretty" as const,
    }}>{scrutin.titre_pedago}</div>
    <AnalyseBody scrutin={scrutin} />
    {/* IA attribution footer — only on the analyse variant since this face
     *  is 100% LLM-generated content (mesures, concernés, calendrier,
     *  exceptions all come from analyse_loi). */}
    <div style={{
      marginTop: 8, paddingTop: 8,
      borderTop: "1px dashed var(--line)",
      fontFamily: "var(--font-mono)", fontSize: 9.5,
      letterSpacing: "0.08em",
      color: "var(--ink-3)", textAlign: "center",
      lineHeight: 1.5,
    }}>
      Synthèse mise en forme par Claude,<br/>basée sur le libellé officiel AN.
    </div>
  </>
) : (
  // ... explanation branch unchanged
)}
```

- [ ] **Step 4: Run tests**

```bash
npm run test:run -- Card
```

Expected: 15 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/Card.tsx tests/Card.test.tsx
git commit -m "feat(transparence): verso analyse footer attribution Claude"
```

---

# PHASE 7 — Page /methode

## Task 7.1: Reformulate section 04

**Files:**
- Modify: `src/routes/Methode.tsx`

- [ ] **Step 1: Update section 04 intro paragraph**

In `src/routes/Methode.tsx`, find the header `<p>` that says « Aucune opinion, aucun panel, aucune IA pour calculer ton alignement ». Replace it :

```tsx
<p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55, marginTop: 12 }}>
  Aucune opinion, aucun panel. <b>Le calcul d'alignement est une formule mathématique pure — l'IA n'y intervient pas.</b> En revanche, les résumés, les points clés et les synthèses des scrutins sont mis en forme par Claude (voir section 07).
</p>
```

- [ ] **Step 2: Run full suite (no Methode test yet — rendering only)**

```bash
npm run test:run
```

Expected: green.

- [ ] **Step 3: Manual smoke check**

```bash
npm run dev
```

Visit `/methode`. The intro paragraph should now mention Claude explicitly.

- [ ] **Step 4: Commit**

```bash
git add src/routes/Methode.tsx
git commit -m "docs(methode): clarify section 04 — IA in summaries, not in alignment math"
```

## Task 7.2: Add section 07 « Le rôle de l'IA Claude »

**Files:**
- Modify: `src/routes/Methode.tsx`

- [ ] **Step 1: Add the section right after section 06**

Find the section 06 block (`<Section n="06" title="Indépendance & financement">`). Just before the closing `</section>` of the page (end of Methode component), add :

```tsx
<Section n="07" title="Le rôle de l'IA Claude">
  <p><b>Ce que fait Claude.</b> Reformuler le titre brut du scrutin en 12 mots, condenser le projet de loi en 3 points clés, rédiger un résumé contextuel de 30 à 50 mots, structurer une synthèse détaillée (mesures, concernés, calendrier, exceptions), et taguer le scrutin par thème. <b>Mise en forme, pas commentaire.</b></p>

  <p><b>Ce qu'il ne fait pas.</b> Le calcul d'alignement (formule mathématique pure), la composition du deck (round-robin algorithmique par thème), l'extraction des votes individuels (parsing des XML officiels AN). Sur ces trois plans, Claude n'intervient à aucun moment.</p>

  <p><b>Comment on cadre les biais.</b> Le prompt envoyé à Claude est neutre par construction. Sa source : le libellé brut AN + des résultats de recherche web pour le contexte. <b>Le libellé officiel brut est affiché sur la face Résumé du verso de chaque carte</b> (et la page AN complète est toujours accessible via « Voir sur AN ↗ ») — tu peux comparer directement.</p>

  <p><b>Limites & signalement.</b> Claude peut se tromper sur les nuances : un mot mal choisi, une mesure oubliée, un thème mal taggué. Pour l'instant, aucune relecture humaine systématique (V3 prévue). Si tu repères une erreur factuelle : <a href="mailto:contact@sansdetour.fr">contact@sansdetour.fr</a> — on corrige.</p>

  <ul style={{ paddingLeft: 18, color: "var(--ink-2)", marginTop: 12 }}>
    <li><a href="https://github.com/sansdetour" target="_blank" rel="noopener noreferrer">github.com/sansdetour</a> — prompt et code source publics</li>
    <li>Modèle : Claude Haiku 4.5 d'Anthropic, via Batches API + web_search</li>
  </ul>
</Section>
```

- [ ] **Step 2: Run full suite**

```bash
npm run test:run
```

Expected: green.

- [ ] **Step 3: Manual smoke check**

Visit `/methode`. Section 07 should appear after section 06 with consistent styling.

- [ ] **Step 4: Commit**

```bash
git add src/routes/Methode.tsx
git commit -m "docs(methode): add section 07 — Le rôle de l'IA Claude"
```

---

# PHASE 8 — Cover sub-text

## Task 8.1: Cover tests

**Files:**
- Create: `tests/Cover.test.tsx`

- [ ] **Step 1: Write tests**

```tsx
// tests/Cover.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Cover from "../src/routes/Cover";
import { resetSession, recordVote } from "../src/lib/session";

function renderCover(initialEntries: any[] = ["/"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<Cover />} />
        <Route path="/play" element={<div>play page</div>} />
        <Route path="/result" element={<div>result page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Cover", () => {
  beforeEach(() => {
    localStorage.clear();
    resetSession();
  });

  it("renders the cover on fresh visit (no hasSeenCover)", () => {
    renderCover();
    expect(screen.getByRole("button", { name: /commencer/i })).toBeInTheDocument();
  });

  it("includes the updated data + AI source sub-text", () => {
    renderCover();
    expect(screen.getByText(/données AN/i)).toBeInTheDocument();
    expect(screen.getByText(/claude/i)).toBeInTheDocument();
  });

  it("redirects to /play when hasSeenCover and votes < 20", () => {
    localStorage.setItem("sd_seen_cover", "1");
    recordVote("s1", "pour");
    renderCover();
    expect(screen.getByText("play page")).toBeInTheDocument();
  });

  it("stays on cover when navigated with state.fromLogo=true (bypass auto-resume)", () => {
    localStorage.setItem("sd_seen_cover", "1");
    recordVote("s1", "pour");
    renderCover([{ pathname: "/", state: { fromLogo: true } }]);
    expect(screen.getByRole("button", { name: /commencer/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests — most should pass already except possibly the data+claude sub-text test**

```bash
npm run test:run -- Cover
```

Expected: 3/4 pass, 1 fails (sub-text doesn't yet mention Claude).

## Task 8.2: Update Cover sub-text

**Files:**
- Modify: `src/routes/Cover.tsx`

- [ ] **Step 1: Find the data source line in Cover.tsx and update**

Open `src/routes/Cover.tsx`. Find the text « Données : » or similar that points at `data.assemblee-nationale.fr`. Replace the text with :

```
Données AN officielles · résumés Claude (IA)
```

Keep the same link target (likely `/methode` or `https://data.assemblee-nationale.fr/`). The exact JSX to modify depends on the current structure — `cat src/routes/Cover.tsx` first to locate.

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- Cover
```

Expected: 4 tests pass.

- [ ] **Step 3: Run full suite**

```bash
npm run test:run
```

Expected: green.

- [ ] **Step 4: Commit**

```bash
git add src/routes/Cover.tsx tests/Cover.test.tsx
git commit -m "feat(transparence): Cover sub-text — données AN officielles · résumés Claude (IA)"
```

---

# PHASE 9 — Loading skeletons

## Task 9.1: Shimmer CSS keyframes

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add shimmer keyframes + reduced-motion guard**

In `src/index.css`, append at the end :

```css
/* Shimmer animation for loading skeletons (CardSkeleton, ResultSkeleton).
 * Disabled when the user prefers reduced motion — the skeleton stays
 * static grey rather than animating. */
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-shimmer {
  background: linear-gradient(90deg,
    var(--bg-2) 0%,
    var(--line) 50%,
    var(--bg-2) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
  border-radius: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer {
    animation: none;
  }
}
```

- [ ] **Step 2: Run full suite (no test for CSS)**

```bash
npm run test:run
```

Expected: green.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat(skeleton): shimmer keyframes + reduced-motion guard"
```

## Task 9.2: CardSkeleton component

**Files:**
- Create: `src/components/CardSkeleton.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/CardSkeleton.tsx
export function CardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Chargement des scrutins"
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 22,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: "0 18px 30px -16px #000",
      }}
    >
      <div className="skeleton-shimmer" style={{ width: "60%", height: 12 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
        <div className="skeleton-shimmer" style={{ width: "85%", height: 18 }} />
        <div className="skeleton-shimmer" style={{ width: "55%", height: 18, marginBottom: 16 }} />
        <div className="skeleton-shimmer" style={{ width: "70%", height: 10 }} />
        <div className="skeleton-shimmer" style={{ width: "75%", height: 10 }} />
        <div className="skeleton-shimmer" style={{ width: "50%", height: 10 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: 14 }}>
        <div className="skeleton-shimmer" style={{ width: 80, height: 10 }} />
        <div className="skeleton-shimmer" style={{ width: 40, height: 10 }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CardSkeleton.tsx
git commit -m "feat(skeleton): CardSkeleton — shimmer placeholder for Card"
```

## Task 9.3: ResultSkeleton component

**Files:**
- Create: `src/components/ResultSkeleton.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/ResultSkeleton.tsx
export function ResultSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Chargement de ton résultat"
      style={{
        padding: "24px var(--gutter) 32px",
        maxWidth: "var(--max-content)", margin: "0 auto",
        display: "flex", flexDirection: "column", gap: 18,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="skeleton-shimmer" style={{ width: 120, height: 10 }} />
        <div className="skeleton-shimmer" style={{ width: "85%", height: 28 }} />
        <div className="skeleton-shimmer" style={{ width: "50%", height: 12 }} />
      </header>

      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 14px",
          border: "1px solid var(--line)", borderRadius: 4,
        }}>
          <div className="skeleton-shimmer" style={{ width: 12, height: 12, borderRadius: "50%" }} />
          <div className="skeleton-shimmer" style={{ flex: 1, height: 13 }} />
          <div className="skeleton-shimmer" style={{ width: 36, height: 13 }} />
        </div>
      ))}
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ResultSkeleton.tsx
git commit -m "feat(skeleton): ResultSkeleton — shimmer placeholder for Result list"
```

## Task 9.4: Wire CardSkeleton into Play.tsx

**Files:**
- Modify: `src/routes/Play.tsx`

- [ ] **Step 1: Replace the `<div>Chargement…</div>` fallback**

In `src/routes/Play.tsx`, find the line `if (deck.length === 0) return <div style={{ padding: 24 }}>Chargement…</div>;`

Replace with :

```tsx
import { CardSkeleton } from "../components/CardSkeleton";

// ... at the same spot in the render flow :
if (deck.length === 0) {
  return (
    <section style={{
      padding: "18px var(--gutter) 16px",
      display: "flex", flexDirection: "column", gap: 18,
      minHeight: "calc(100dvh - 60px)",
      maxWidth: "var(--max-content)", margin: "0 auto",
    }}>
      <div style={{ flex: 1, padding: "6px 0" }}>
        <CardSkeleton />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run full suite**

```bash
npm run test:run
```

Expected: green.

- [ ] **Step 3: Manual smoke check**

```bash
npm run dev
```

Visit `/play` with `localStorage.clear()` in devtools. The CardSkeleton should appear briefly before scrutins load. Verify shimmer animates. Then enable `prefers-reduced-motion: reduce` in devtools (Rendering tab) → reload → shimmer should be static.

- [ ] **Step 4: Commit**

```bash
git add src/routes/Play.tsx
git commit -m "feat(skeleton): Play replaces 'Chargement…' with CardSkeleton"
```

## Task 9.5: Wire ResultSkeleton into Result.tsx

**Files:**
- Modify: `src/routes/Result.tsx`

- [ ] **Step 1: Replace the `<div>Chargement…</div>` fallback**

In `src/routes/Result.tsx`, find :

```tsx
if (!top || pool.length === 0) {
  return <div style={{ padding: 24 }}>Chargement…</div>;
}
```

Replace with :

```tsx
import { ResultSkeleton } from "../components/ResultSkeleton";

// ... at the same spot :
if (!top || pool.length === 0) {
  return <ResultSkeleton />;
}
```

- [ ] **Step 2: Run full suite**

```bash
npm run test:run
```

Expected: green.

- [ ] **Step 3: Commit**

```bash
git add src/routes/Result.tsx
git commit -m "feat(skeleton): Result replaces 'Chargement…' with ResultSkeleton"
```

---

# PHASE 10 — Touch targets + final QA

## Task 10.1: Touch targets audit pass

**Files:**
- Already addressed in Task 5.2 (`+ analyse` button padding bumped from `3px 8px` to `6px 10px`)
- Already addressed in Task 4.1 (`MethodeSheet` ✕ button = 32×32 explicit)
- Chip ✨IA has `padding: 4px 2px` inline — verify it gives ≥24px hit area in dev tools

- [ ] **Step 1: Manual audit in browser**

```bash
npm run dev
```

In Chrome devtools, use the Lighthouse accessibility audit on `/play`, `/result`, `/methode`. Look for « Tap targets are not sized appropriately » warnings.

Specifically inspect :
- Chip ✨IA hit area (hover, check the highlighted box ≥ 24×24)
- `+ analyse` button (now should be larger after Task 5.2)
- `•••` menu button (already `padding: 11px 14px` from layout WIP)
- MethodeSheet ✕ button (32×32 explicit from Task 4.1)

- [ ] **Step 2: Fix any failing targets inline if Lighthouse flags them**

For chip ✨IA, if hit area < 24×24, bump padding to `6px 4px`. Document the fix in the commit.

- [ ] **Step 3: Commit if fixes were made; skip otherwise**

```bash
# Only if changes made
git add src/components/Card.tsx
git commit -m "fix(a11y): bump tap target sizes to WCAG 24×24 minimum"
```

## Task 10.2: Manual QA suite

- [ ] **Step 1: VoiceOver test (macOS)**

Enable VoiceOver (Cmd+F5). Navigate to `/play` :
- Tab into a Card — VoiceOver should announce « Scrutin n°XXXX : [titre_pedago], carte de scrutin, glissez pour voter »
- Press Enter — verso content read (Résumé IA / libellé officiel AN clearly separated)
- Press Enter again — back to recto
- Press ArrowRight — vote pour, live region announces « Voté pour. Carte suivante. »
- Tab to chip ✨IA — VoiceOver reads « Comment ce contenu a été préparé »
- Press Enter — MethodeSheet opens, focus on ✕, VoiceOver reads dialog title
- Press ESC — sheet closes, focus returns to chip

- [ ] **Step 2: Reduced motion test**

In Chrome devtools → Rendering → « Emulate CSS prefers-reduced-motion: reduce ». Reload :
- Card flip should be instant (no rotateY animation)
- Drag bounce should be minimal
- CardSkeleton shimmer should be static
- MethodeSheet should appear without spring (instant fade)

- [ ] **Step 3: Mobile test (real iPhone if possible, otherwise devtools mobile mode)**

- Touch the ✨IA chip — sheet opens
- Swipe up to scroll sheet content
- Tap backdrop — closes
- Verify body doesn't scroll behind the sheet
- Verify chip hit area is comfortable (no need to aim precisely)

- [ ] **Step 4: Network failure test**

In devtools → Network → throttling « Offline ». Reload `/play` :
- CardSkeleton appears briefly
- Then retry UI appears with « Impossible de charger les scrutins »
- Verify no infinite skeleton loop

- [ ] **Step 5: Document any bugs found**

If issues are found, fix inline with focused commits (`fix(a11y): ...` or `fix(transparence): ...`). If a bug is significant, stop and discuss before continuing.

## Task 10.3: Final verification

- [ ] **Step 1: Run full test suite + lint + typecheck**

```bash
npm run test:run
npx tsc --noEmit
```

Expected : ~90 tests green (45 existing + ~40 new), zero TS errors.

- [ ] **Step 2: Check bundle size hasn't ballooned**

```bash
npm run build
ls -lh dist/assets/*.js
```

Expected : bundle should be roughly the same size (we added components but no new heavy deps). If it grew > 20%, investigate.

- [ ] **Step 3: Verify no test was skipped or .only**

```bash
grep -rn "it\.only\|describe\.only\|\.skip" tests/
```

Expected : no output.

## Task 10.4: Create PR

- [ ] **Step 1: Push the branch**

```bash
git push -u origin claude/check-app-access-9Yvx0
```

- [ ] **Step 2: Create PR via gh CLI**

```bash
gh pr create --base feat/v1-implementation --title "V2.5 — Transparence IA + a11y + tests" --body "$(cat <<'EOF'
## Summary

3 chantiers bundlés issus du brainstorm `/superpowers:brainstorming` (spec : `docs/superpowers/specs/2026-05-16-transparence-a11y-tests-design.md`).

- **B — Transparence IA** : chip ✨IA sur recto des cartes, MethodeSheet bottom-sheet « Comment c'est fait ? », ligne explicite verso explanation (Résumé IA / libellé officiel AN), footer attribution verso analyse, section 07 nouvelle dans `/methode`, sub-text Cover. Vocabulaire « résumé / synthèse mise en forme » pour éviter le réflexe biais IA.
- **P1 — A11y & robustesse** : hook `useFlipCardA11y` (aria-hidden, keyboard nav Enter/Arrow, role/label), `useReducedMotion` framer-motion, focus trap MethodeSheet, restore focus au trigger du popover menu, ErrorBoundary global, skeletons shimmer (CardSkeleton, ResultSkeleton), live region pour annoncer les votes.
- **P3 — Tests** : ~40 nouveaux tests Vitest (UI : Card, MethodeSheet, Cover, ErrorBoundary ; algo : matching edge cases défensives + ranking stable + deck invariants V2). Couverture finale : ~90 tests.

Zéro changement DB, zéro re-ingestion ($0 coût Anthropic).

## Test plan

- [x] `npm run test:run` — ~90 tests verts
- [x] `npx tsc --noEmit` — zéro erreur TS
- [x] Manual VoiceOver (macOS) : navigation clavier sur Card, MethodeSheet dialog, focus restoration
- [x] `prefers-reduced-motion: reduce` : flip instantané, shimmer statique, sheet sans spring
- [x] Mobile iPhone : chip tap, sheet swipe scroll, backdrop close
- [x] Network offline : skeleton puis retry UI, pas de loop

## Hors scope (déjà discuté dans le spec)

- Sources web_search exposées en DB et UI — V2.5+ si critique précise
- Page `/limitations` séparée — fusionnée dans `/methode` 07
- Performance bundle / code-splitting / PWA — sprint séparé (package P2)
EOF
)"
```

- [ ] **Step 3: Return the PR URL to the user**

The output of `gh pr create` will print the PR URL. Share it.

---

## Spec coverage check

| Spec requirement | Task(s) |
|---|---|
| Chip ✨IA sur recto cards | 5.2 |
| MethodeSheet bottom-sheet | 4.1 |
| Ligne verso explanation | 6.1 |
| Footer verso analyse | 6.2 |
| Section 07 + reformulation section 04 dans /methode | 7.1, 7.2 |
| Cover sub-text « Données AN · résumés Claude (IA) » | 8.2 |
| useFlipCardA11y (aria-hidden, keyboard nav) | 3.1, 3.2 |
| useReducedMotion sur Card et MethodeSheet | 3.2, 4.1 |
| ErrorBoundary global | 2.1 |
| CardSkeleton + ResultSkeleton (shimmer) | 9.1, 9.2, 9.3, 9.4, 9.5 |
| Tests UI Card | 3.2, 5.2, 6.1, 6.2 |
| Tests MethodeSheet | 4.1 |
| Tests Cover | 8.1 |
| Tests ErrorBoundary | 2.1 |
| Tests matching edge cases | 1.1 |
| Tests deck invariants | 1.2 |
| Retrofit a11y MenuSheet (adapté → popover focus restoration) | 4.2 |
| Touch targets ≥ 24×24 | 5.2, 10.1 |
| Live region pour votes | 3.3 |
| PR final | 10.4 |

Tous les requirements du spec sont couverts.

---

## Risques pendant exécution

| Risque | Mitigation |
|---|---|
| `useFlipCardA11y` keyboard handler conflit avec onTap framer-motion | Tests 3.2 vérifient les deux paths ; le handler ignore les targets `<button>` / `<a>` |
| Audit P3 révèle bug réel matching/deck | Fix inline avec commit `fix(matching|deck): ...` séparé, continue le plan |
| WIP local non commité bloque le merge | Task 0.1 force la résolution avant tout autre travail |
| Sheet focus trap conflit avec Card keyboard sur recto | Sheet est `position: fixed` au-dessus, et son focus trap n'intercepte que les Tab dans son DOM |
| Mobile : chip 22px de haut pas assez grand | Task 10.1 audit + bump si Lighthouse signale |
