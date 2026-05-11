# SHIP V1 — checklist de mise en prod

Cette checklist couvre tout ce qui reste à faire **côté utilisateur** pour mettre Sans Détour V1 en production. Le code est prêt (build clean, 33/33 tests, branche `feat/v1-implementation`).

---

## 1. Données réelles dans Supabase (15 min)

Tu as déjà la table `scrutins` créée et seed avec 46 scrutins (certains en fallback). Pour avoir des cartes lisibles avec contextes pédagos, relance l'ingestion avec le nouveau code (Haiku 4.5 + Batches API + prompt voix-lycéen).

```bash
# Charger les variables d'env dans ton shell (si pas encore en mémoire)
export SUPABASE_URL="https://TON-PROJET.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJ..."
export ANTHROPIC_API_KEY="sk-ant-api03-..."

npm run ingest:an
```

**Attendu** : ~2-10 min de batch, ~$0.20-0.30 de coût Anthropic, 46 cartes rafraîchies.

**Vérification** : `npm run dev`, ouvre `/play`, tap sur une carte pour voir le flip 3D et les détails. Le contexte doit être concret (chiffres / dates / mécanismes), pas de "définit les règles" / "événement majeur".

---

## 2. Icônes PWA (10 min) — optionnel pour le ship initial

3 fichiers à placer dans `public/icons/` (le manifest les référence déjà) :

- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
- `maskable-512.png` (512×512, garde le contenu important dans les 80% centraux)

**Outil recommandé** : [maskable.app/editor](https://maskable.app/editor)
**Couleur de fond** : `#1d1f24` (cohérent avec le theme color du manifest)
**Base** : le wordmark "sans/détour" — soit recréé dans l'outil, soit screenshot du composant `Wordmark.tsx`.

Sans icônes, l'app marche mais les utilisateurs qui font "Ajouter à l'écran d'accueil" verront un icône par défaut.

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
4. **Settings → Environment Variables**, ajoute les 4 variables (cf `.env.local.example`) :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` *(pour l'edge function share-card)*
   - `ANTHROPIC_API_KEY` *(pas utilisé en prod runtime, mais peut servir si tu ajoutes une edge function plus tard)*
5. **Deploy**

**Vérification** : ouvre `https://TON-PROJET.vercel.app/` → la cover doit charger les vraies données Supabase. Test rapide :
- Faire 5 votes → voir le chip Top1 apparaître
- Tap sur une carte → voir le flip 3D
- Aller jusqu'à 20 votes → voir le ranking final
- Test de l'edge share-card : `https://TON-PROJET.vercel.app/api/share-card.png?t=EPR:42,RN:35,LFI:28&fmt=square` → doit renvoyer un PNG

---

## 5. Domaine `sansdetour.fr` (optionnel, ~10€/an)

Si tu veux un vrai domaine :

1. Achète `sansdetour.fr` chez OVH, Cloudflare Registrar, ou Gandi (~10€/an)
2. Vercel → Project → **Settings → Domains** → Add `sansdetour.fr`
3. Suis les instructions Vercel pour configurer les DNS (CNAME ou A record)

Pas urgent — Vercel donne une URL gratuite `xxx.vercel.app` qui marche très bien pour partager.

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
- 20 swipes (mélange gauche/droite/bas)
- Result → tester le flip 3D sur une carte (sur la page Result il n'y a pas de cartes, c'est sur Play)
- Test "Continuer à affiner" → revenir sur Play
- Test "Partager" → vérifier que le PNG share-card s'ouvre
- Test "Refaire" → retour à la cover
- Test footer : Méthode, Mentions légales, Mon résultat

Si tout marche :

```bash
git tag v1.0.0 -m "Sans Détour V1 — première mise en production"
git push --tags
```

---

## Roadmap V2

L'idée du pré-vote sur dossiers à venir est documentée dans [docs/v2-roadmap.md](docs/v2-roadmap.md). À démarrer une fois V1 en prod et premières métriques d'usage en main.
