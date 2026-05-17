# SHIP V1 — checklist de mise en prod

Cette checklist couvre tout ce qui reste à faire **côté utilisateur** pour mettre Sans Détour V1 en production. Le code est prêt (build clean, suite Vitest verte sur la branche `feat/v1-implementation`).

---

## 1. Données réelles dans Supabase (15 min)

Tu as déjà la table `scrutins` créée et seed avec ~100 scrutins (92 votables, 8 fallback exclus par filtre front — cf. CLAUDE.md). Pour avoir des cartes lisibles avec contextes pédagos, relance l'ingestion avec le nouveau code (Haiku 4.5 + Batches API + prompt voix-lycéen).

```bash
# Charger les variables d'env dans ton shell (si pas encore en mémoire)
export SUPABASE_URL="https://TON-PROJET.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJ..."
export ANTHROPIC_API_KEY="sk-ant-api03-..."

npm run ingest:an
```

**Attendu** : ~2-10 min de batch, ~$0.20-0.30 de coût Anthropic, ~100 cartes rafraîchies (upsert idempotent, ne recharge pas les rows déjà à jour).

**Vérification** : `npm run dev`, ouvre `/play`, tap sur une carte pour voir le flip 3D et les détails. Le contexte doit être concret (chiffres / dates / mécanismes), pas de "définit les règles" / "événement majeur".

---

## 2. Icônes PWA (10 min) — production-blocker

3 fichiers à placer dans `public/icons/` (le manifest les référence déjà, et `index.html` aussi pour favicon `<link rel="icon">` / apple-touch-icon / og:image / twitter:image — TODO production-blocker en commentaire dans les deux fichiers) :

- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
- `maskable-512.png` (512×512, garde le contenu important dans les 80% centraux)

**Outil recommandé** : [maskable.app/editor](https://maskable.app/editor)
**Couleur de fond** : `#1d1f24` (cohérent avec le theme color du manifest)
**Base** : le wordmark "sans/détour" — soit recréé dans l'outil, soit screenshot du composant `Wordmark.tsx`.

Sans ces 3 fichiers : icône blanc à l'install PWA (iOS + Chrome), preview vide sur Slack / WhatsApp / Telegram (og:image 404), apple-touch-icon 404 à l'Ajout à l'écran d'accueil. Visible en prod — pas optionnel.

---

## 3. Push sur GitHub (5 min)

```bash
# Crée le repo si pas déjà fait
gh repo create sansdetour/web --public --source=. --push

# Ou pousse manuellement sur un repo existant
git push -u origin feat/v1-implementation
```

⚠️ Avant de pousser : vérifie que `.env.local` n'est pas commité (`git status` doit pas le mentionner — il est dans `.gitignore`).

---

## 4. Déploiement Vercel (10 min)

1. Va sur [vercel.com/new](https://vercel.com/new)
2. **Import** ton repo GitHub
3. Framework auto-détecté : **Vite**
4. **Settings → Environment Variables**, ajoute les 2 variables côté client (cf `.env.local.example`) :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   Pas besoin de `SUPABASE_SERVICE_ROLE_KEY` ni de `ANTHROPIC_API_KEY` côté Vercel runtime : `api/share-card.ts` ne tape pas Supabase (juste Satori + une font), et l'ingestion Anthropic tourne localement / sur GitHub Actions (cf §6), pas en prod.
5. **Deploy**

**Vérification** : ouvre `https://TON-PROJET.vercel.app/` → la cover doit charger les vraies données Supabase. Test rapide :
- Faire 5 votes → voir le chip Top1 apparaître
- Tap sur une carte → voir le flip 3D
- Aller jusqu'à 20 votes → voir le ranking final
- Test de l'edge share-card : `https://TON-PROJET.vercel.app/api/share-card.svg?t=EPR:42,RN:35,LFI:28&fmt=square` → doit renvoyer un SVG (le path `.png` n'existe plus, V1 abandon resvg-wasm pour SVG pur)

---

## 5. Domaine `sansdetour.fr` — prérequis pour SEO + analytics (~10€/an)

Plusieurs fichiers du repo référencent déjà `sansdetour.fr` :
- `index.html` : `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`, `data-domain` Plausible
- `src/lib/analytics.ts` : `ANALYTICS_HOSTS = ["sansdetour.fr", "www.sansdetour.fr"]`

Tant que le domaine n'est pas en place :
- Google indexe `*.vercel.app` mais la canonical pointe vers une URL 404 → SEO fragmenté.
- Plausible no-op silencieusement quand l'user visite `*.vercel.app` → analytics zéro.

Étapes :
1. Achète `sansdetour.fr` chez OVH, Cloudflare Registrar, ou Gandi (~10€/an)
2. Vercel → Project → **Settings → Domains** → Add `sansdetour.fr`
3. Suis les instructions Vercel pour configurer les DNS (CNAME ou A record)

Si tu décides de rester sur `*.vercel.app` plus longtemps : update `index.html` canonical / og / plausible data-domain + `ANALYTICS_HOSTS` pour pointer la vraie URL live.

---

## 6. Cron weekly d'ingestion (optionnel)

Pour que les nouvelles lois s'ajoutent automatiquement à l'app sans intervention manuelle, deux options :

**Option A — GitHub Actions** (gratuit) :

Créer `.github/workflows/ingest.yml` :

```yaml
name: Ingest AN scrutins
on:
  schedule:
    - cron: '0 4 * * 1'  # Lundi 04:00 UTC
  workflow_dispatch:
jobs:
  ingest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run ingest:an
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

Configure les secrets dans GitHub → Settings → Secrets and variables → Actions.

**Option B — manuelle** : tu lances `npm run ingest:an` quand tu y penses (chaque mois suffit, l'AN ne vote pas 50 SPS par semaine).

---

## 7. Smoke test final + tag release

Une fois en prod, fais une session complète sur ton téléphone (vrai mobile, pas DevTools) :
- Cover → Commencer
- 20 swipes (mélange gauche/droite/bas) ; sur une carte au passage, tap pour tester le flip 3D recto/verso
- Result → "Voir les personnalités" déplie la section figures
- Test "Continuer à affiner" → revenir sur Play
- Test "Partager" → la share sheet native du téléphone s'ouvre avec le texte du résultat + l'URL ; `Result.tsx share()` utilise `navigator.share` directement, ne fetch pas l'endpoint share-card
- Test endpoint share-card (séparément, pas via le bouton) : `curl https://TON-PROJET.vercel.app/api/share-card.svg?t=EPR:42,RN:35,LFI:28` → réponse `Content-Type: image/svg+xml`
- Test "Refaire" → retour à la cover
- Test menu TopBar `•••` (popover) → Méthode & sources, Mentions légales, Mon résultat, Contact (le footer secondary nav a été remplacé par ce menu depuis le commit 5040874)

Si tout marche :

```bash
git tag v1.0.0 -m "Sans Détour V1 — première mise en production"
git push --tags
```

---

## Roadmap V2

État des features V2 (cf. [docs/v2-roadmap.md](docs/v2-roadmap.md)) :
- **P1 — Corpus élargi + thématisation** : ✅ livré (100 scrutins, deck round-robin par thème).
- **P2 — Personnalités présidentielles** : ✅ livré (8 figures indexées, toggle "Voir les personnalités" sur /result).
- **P3 — Ton député (code postal → alignement député local)** : à démarrer, ~2 jours de dev, exploite l'infra `votes_personnalites` déjà en place.
- **Idée parking — pré-vote sur dossiers à venir** : intéressante mais hors scope sprint 2027 ; à reprendre après la présidentielle ou si les métriques V1 montrent une demande de boucle de retour.
