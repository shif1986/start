# Back-end — START

Ce document est la référence unique pour le back-end Supabase. Le code se trouve dans `backend/supabase/`, mais **toutes les commandes se lancent depuis la racine du projet**. Il n'est jamais nécessaire d'exécuter `cd backend`.

## 1. Objectif du back-end

Fournir une base PostgreSQL sûre et versionnée pour :

1. les profils et rôles ;
2. les catégories imbriquées ;
3. les champs dynamiques par catégorie ;
4. les annonces et leur workflow de modération ;
5. les images ;
6. les favoris ;
7. les signalements ;
8. la recherche publique filtrée.

Supabase apporte PostgreSQL, Auth, Storage et les fonctions RPC. La migration SQL est la source de vérité : les changements manuels dans Studio ne remplacent jamais une migration.

## 2. Commandes depuis la racine

Docker doit être démarré pour l'environnement Supabase local.

```bash
bun run backend:start
bun run backend:reset
bun run backend:test
bun run backend:stop
```

- `backend:start` démarre les services locaux ;
- `backend:reset` rejoue toutes les migrations puis le seed ;
- `backend:test` lance les tests pgTAP ;
- `backend:stop` arrête proprement les services.

## 3. Organisation des fichiers

```text
backend/
└── supabase/
    ├── config.toml
    ├── migrations/
    │   ├── 202608120001_marketplace_foundation.sql
    │   └── 202608280001_harden_marketplace_foundation.sql
    ├── seed.sql
    └── tests/
        └── database/
            ├── marketplace.test.sql
            └── security.test.sql
```

Chaque évolution de schéma reçoit une nouvelle migration horodatée. Une migration déjà partagée ou déployée ne doit pas être réécrite.

## 4. Modèle de données initial

| Table | Responsabilité |
|---|---|
| `profiles` | identité privée, rôle, type de compte et vérification |
| `profile_contacts` | coordonnées visibles uniquement aux membres authentifiés |
| `public_profiles` | vue publique limitée, sans coordonnées privées |
| `categories` | catégories et sous-catégories |
| `category_fields` | définition des champs dynamiques |
| `category_field_options` | options des champs select/multi-select |
| `listings` | contenu principal et statut d'une annonce |
| `listing_images` | métadonnées et ordre des images |
| `listing_field_values` | valeur JSON d'un champ dynamique |
| `favorites` | relation unique utilisateur/annonce |
| `reports` | signalements et traitement de modération |

Les futures tables `conversations`, `messages`, `reviews`, `notifications`, `plans`, `payments` et `subscriptions` ne doivent être ajoutées qu'avec leur tranche fonctionnelle et leurs tests.

## 5. Workflow d'une annonce

```text
draft → pending → published
              ↘ rejected
published → sold
published → archived
```

- un vendeur crée seulement `draft` ou `pending` ;
- un vendeur peut préparer, soumettre, vendre ou archiver son contenu ;
- seul un modérateur/admin publie, refuse ou active `is_featured` ;
- une annonce `published` possède obligatoirement `published_at` ;
- le propriétaire d'une annonce ne peut jamais être changé par le vendeur.

Ces règles ne sont pas seulement affichées dans React : elles sont protégées par RLS, contraintes et triggers PostgreSQL.

## 6. Sécurité et RLS

Toutes les tables exposées ont RLS activé.

### Visiteur anonyme

- lit les profils publics ;
- lit les catégories actives et leurs champs ;
- lit uniquement les annonces publiées ;
- lit les images associées aux annonces visibles ;
- ne crée ni favori ni signalement.

### Utilisateur authentifié

- modifie uniquement son profil public ;
- ne peut modifier ni son rôle ni son badge vérifié ;
- crée et modifie uniquement ses annonces ;
- gère uniquement ses favoris ;
- crée ses propres signalements ;
- stocke ses images uniquement sous `listing-images/{userId}/{listingId}/...`.

### Modérateur/admin

- gère catégories et champs dynamiques ;
- publie, refuse, suspend ou met en avant une annonce ;
- traite les signalements ;
- modifie rôle et vérification d'un profil selon l'interface administrative future.

La fonction `is_admin()` reconnaît les rôles `moderator` et `admin`. Le nom reste court, mais sa définition est explicite dans la migration.

## 7. Storage

Le bucket public `listing-images` accepte seulement :

- JPEG ;
- PNG ;
- WebP ;
- AVIF ;
- taille maximale : 8 Mio par fichier.

Chemin obligatoire :

```text
listing-images/{userId}/{listingId}/{uuid}.webp
```

Le front-end compresse avant envoi. Le back-end contrôle le type, la taille et le propriétaire du premier segment. La table `listing_images` conserve seulement les métadonnées et l'ordre.

## 8. Contrat de recherche

La fonction RPC `search_listings` accepte :

| Paramètre | Type | Règle |
|---|---|---|
| `search_query` | texte/null | titre et description, sans accent |
| `category_slug` | texte/null | slug exact |
| `city_query` | texte/null | ville partielle, sans accent |
| `min_price` | numeric/null | borne incluse |
| `max_price` | numeric/null | borne incluse |
| `sort_order` | texte | `recent`, `price_asc`, `price_desc` |
| `page_size` | entier | limité côté SQL à 1–100 |
| `page_offset` | entier | minimum 0 |

Elle retourne seulement les annonces publiées, place les annonces à la une en premier et fournit l'image principale ainsi que l'état favori de l'utilisateur courant.

## 9. Ordre de réalisation TDD

Chaque tranche suit : **test pgTAP rouge → migration SQL → reset local → test vert → test RLS par rôle**.

### Tranche B1 — fondation

- [x] tables principales ;
- [x] clés étrangères et contraintes ;
- [x] index catalogue/propriétaire/modération ;
- [x] trigger `updated_at` ;
- [x] création automatique du profil ;
- [x] RLS propriétaire/public/admin ;
- [x] bucket et politiques Storage ;
- [x] RPC de recherche ;
- [ ] tests RLS avec utilisateurs simulés ;
- [ ] tests détaillés des transitions de statut.

### Tranche B2 — fiche et dépôt

- valider la catégorie du champ dynamique par rapport à celle de l'annonce ;
- valider la forme JSON selon `field_type` ;
- ajouter une fonction transactionnelle de soumission ;
- empêcher plus de 20 images par annonce ;
- tester chaque échec avant d'ajouter la règle SQL.

### Tranche B3 — favoris, profil et signalement

- tester les lectures croisées interdites ;
- tester l'unicité des favoris et signalements ;
- ajouter les compteurs via vues ou requêtes agrégées, sans compteur client fiable.

### Tranche B4 — administration

- journal d'audit des actions sensibles ;
- transitions de modération transactionnelles ;
- tests d'impossibilité d'auto-promotion ;
- tests d'accès anonyme, authentifié, modérateur et admin.

## 10. Règles de migration

1. écrire le test qui exprime le nouveau contrat ;
2. créer une nouvelle migration ;
3. exécuter `npm run backend:reset` ;
4. exécuter `npm run backend:test` ;
5. inspecter les warnings PostgreSQL ;
6. régénérer les types TypeScript Supabase avant de modifier le front-end ;
7. ne jamais utiliser la clé `service_role` dans le navigateur ;
8. ne jamais désactiver RLS pour contourner un problème de politique.

## 11. Définition de « terminé »

Une tranche back-end est terminée uniquement quand :

1. la migration repart d'une base vide ;
2. le seed est rejouable sans doublon ;
3. tous les tests pgTAP passent ;
4. chaque table exposée a RLS activé ;
5. les scénarios anonyme, propriétaire, autre utilisateur et admin sont testés ;
6. les entrées invalides échouent avec une règle explicite ;
7. le front-end consomme un contrat typé et documenté dans `FRONTEND.md`.
