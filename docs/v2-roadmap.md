# Sans Détour — V2 Roadmap

> Status: **idéation**. À démarrer une fois V1 en prod et premières métriques d'usage.
> Date d'enregistrement : 2026-05-11.

---

## Feature phare V2 : Pré-vote sur dossiers à venir

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
- **Comparaison avec ton député** — entrer son code postal → savoir comment SON député a voté vs son propre alignement.
- **Filtrage thématique** — pouvoir refaire le test sur des thèmes (économie / écologie / immigration / etc.) si suffisamment de scrutins par thème.
- **Historique de session** — voir ses anciens résultats (nécessite Supabase Auth).
- **Intégration motions de censure** (22 MOC) si on veut élargir la matière. ⚠️ Risque : discrimine surtout "gouvernement vs opposition" plutôt que gauche vs droite. Test à faire avant intégration permanente.

---

## Notes liées au V1 (non bloquantes pour V2)

- Le pipeline d'ingestion actuel (`scripts/ingest-an.ts`, Haiku 4.5 + Batches API + web_search) sera réutilisé tel quel pour résumer les dossiers à venir — il suffira de passer le payload du dossier (titre + exposé des motifs si dispo) au lieu du titre du scrutin.
- La fonction `composeDeck` peut être adaptée pour produire un "deck de pré-vote" filtré par statut "à voter".
- L'UI Card (avec son flip 3D) marchera telle quelle, juste avec une mention "PRÉ-VOTE" sur la carte au lieu de la date du scrutin.
