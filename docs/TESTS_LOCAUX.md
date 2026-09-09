# Tests locaux — START

Ce guide décrit l'installation et la validation locale du frontend et du backend Supabase. Toutes les commandes indiquées à la racine partent du dossier `start/`.

## 1. Prérequis

- Node.js et npm ;
- Docker Desktop installé et démarré ;
- dépendances du projet installées.

Vérifier Docker avant de lancer Supabase :

```bash
docker --version
docker info
```

Si Docker Desktop affiche `Docker Engine stopped`, le démarrer ou le relancer avant de continuer.

## 2. Démarrer Supabase local

Depuis la racine du projet :

```bash
npx supabase start --workdir backend
```

Depuis le dossier `frontend/`, le chemin doit pointer vers le dossier parent :

```bash
npx supabase start --workdir ../backend
```

La commande `npx supabase status --workdir backend` affiche notamment :

- l'URL locale de l'API, généralement `http://127.0.0.1:54321` ;
- Supabase Studio, généralement `http://127.0.0.1:54323` ;
- Mailpit, généralement `http://127.0.0.1:54324` ;
- une clé `Publishable` locale.

La mention `Not linked` est normale pour un environnement local non relié à un projet Supabase distant. Certains services optionnels peuvent être arrêtés sans empêcher les tests PostgreSQL.

## 3. Configurer le frontend

Créer ou compléter `frontend/.env.local` :

```dotenv
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=VOTRE_CLE_PUBLISHABLE_LOCALE
VITE_DATA_SOURCE=supabase
```

Utiliser uniquement la clé `Publishable`. Ne jamais placer les clés `Secret`, `service_role`, S3 Access Key ou S3 Secret Key dans un fichier frontend, dans Git ou dans une capture destinée à être partagée.

## 4. Rejouer et tester la base

Après l'ajout ou la modification d'une migration, respecter cet ordre :

```bash
npx supabase db reset --workdir backend
npx supabase test db --workdir backend
```

Le reset recrée la base locale, rejoue toutes les migrations et applique le seed. Lancer les tests avant le reset testerait encore l'ancien schéma.

Depuis `frontend/` :

```bash
npx supabase db reset --workdir ../backend
npx supabase test db --workdir ../backend
```

Résultat de référence au 8 septembre 2026 : 8 fichiers pgTAP et 92 tests réussis. Ce nombre est informatif ; toute nouvelle tranche peut ajouter des tests.

## 5. Valider le frontend

Depuis `frontend/` :

```bash
npm run test:run
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

### Tests d’intégration Supabase réels

La suite `frontend/integration` crée et supprime ses propres utilisateurs et données. Elle refuse explicitement toute URL autre que `localhost` ou `127.0.0.1`.

Après `supabase start` et `supabase db reset`, exporter `SUPABASE_TEST_URL`, `SUPABASE_TEST_PUBLISHABLE_KEY` et `SUPABASE_TEST_SECRET_KEY` depuis `supabase status -o json`, puis lancer :

```bash
npm run test:integration
```

La CI réalise automatiquement cette extraction avec les clés éphémères de son instance locale. Ne jamais fournir les clés d’un projet distant à cette commande.

Pour démarrer l'application :

```bash
npm run dev
```

Vite affiche l'adresse exacte, généralement `http://127.0.0.1:5173`.

## 6. Recette du dépôt d'annonce

1. Créer un compte professionnel depuis le frontend local.
2. Si la confirmation d'e-mail est active, ouvrir Mailpit et utiliser le lien reçu.
3. Accorder un abonnement local de test. Le script `backend/supabase/scripts/grant_test_subscription.sql` est réservé à Supabase Studio et exige actuellement un compte Google professionnel. Remplacer uniquement la constante d'e-mail avant son exécution, sans transformer ce script en migration.
4. Ouvrir `/publier` et vérifier les cinq étapes : catégorie, informations, localisation, photos et prévisualisation.
5. Ajouter une image JPEG, PNG, WebP ou AVIF de moins de 8 Mio.
6. Soumettre l'annonce.
7. Dans Supabase Studio, vérifier :
   - une ligne dans `listings` avec le statut `pending` ;
   - les valeurs spécifiques dans `listing_field_values` si la catégorie en propose ;
   - les métadonnées dans `listing_images` ;
   - le fichier dans le bucket privé `listing-images` ;
   - l'annonce dans l'espace professionnel du frontend.

Une fonctionnalité ne passe dans `TERMINÉ` qu'après réussite de cette recette et des tests automatisés associés.

## 7. Erreurs courantes

### `failed to change workdir`

La commande est lancée depuis le mauvais dossier. Depuis la racine, utiliser `--workdir backend`. Depuis `frontend/`, utiliser `--workdir ../backend`.

### `failed to inspect service`

Vérifier que Docker Desktop est installé, que son moteur fonctionne et que `supabase start` a été exécuté avant `db reset`.

### Un test utilise encore l'ancien SQL

Exécuter `db reset` avant de relancer `test db` afin d'appliquer les nouvelles migrations.

## 8. Arrêter l'environnement local

Depuis la racine :

```bash
npx supabase stop --workdir backend
```

Depuis `frontend/` :

```bash
npx supabase stop --workdir ../backend
```
