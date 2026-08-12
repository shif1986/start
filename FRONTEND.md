# Front-end — Place

Ce document est la référence unique pour construire l'interface React. Le code se trouve dans `frontend/`, mais **toutes les commandes ci-dessous se lancent depuis la racine du projet**. Il n'est jamais nécessaire d'exécuter `cd frontend`.

## Principes produit confirmés

- Nom : START Réseau Chrétien.

- Marketplace / annuaire d'annonces pour professionnels etparticuliers chrétiens.

- Compte particulier : gratuit.

- Compte professionnel : publication conditionnée à un abonnement.

- Abonnement pro prévu : 7 € / mois ou 84 € / an.

- Authentification : e-mail classique + Google.

- Les visiteurs peuvent parcourir les annonces, mais les coordonnéesprivées (téléphone/e-mail) sont réservées aux particuliers sont passé par creer un compte.

- Carte de France avec recherche par département sur l'accueil et dansle catalogue.

- Paiement prévu avec Stripe et mode de payment Google Pay + mode classique lorsque disponible.

- Identité visuelle : Manrope, #22221E, #F4EFE5, #C7A45D.

## 1. Objectif du front-end

Créer une marketplace (site d'annonce) locale rapide, accessible, dynamique, moderne, avec animation, professionnelle et responsive qui permet à un visiteur de :

1. rechercher une annonce ;
2. filtrer et trier les résultats avec une URL partageable ;
3. consulter une fiche annonce et un profil professionnel ;
4. créer un compte professionel, les professionnels peuvent avoir un access a cet compte pour deposer une annonce apres avoir pris un abonement 7 euro par moi, ou 84 euros par an.
5. créer un compte particulier qui vas etre gratuit, qui permet les client de faire des commentaires et cette compte permet aussi pour prendre contact avec les professionnels, cette a dire qu'ils peuvent voir le numero de telephone et adresse email;
6. les visiteur particulier peuvent voir toute l'annonce sauf pour voir le numero de telephone et adresse email,signaler un souci, et mettre un commentaire il faut creer un compte
7. enregistrer des favoris ;
8. signaler un contenu ;
9. utiliser un dashboard professionnel et, particuliere, selon son rôle, un dashboard de modération, garder l'historique de leur interaction avec le site.
10. tu peux faire l'option pour creer un compte pro ou particulier soit par compte gmail et option classique par n'importe quelle mail

## 2. les pages

- le nom de site est Start reseau chrétien, le site ressemble a cette site vient de theme wordpress que tu peux voir : https://wpdirectorykit.com/theme_preview/classified-ads-directory

- j'ai deja un logo
- font : Manrope
- couleur : #22221E, #F4EFE5, #C7A45D

1. accueil :

- titre : Start reseau chrétien
- description met une correspond - (cette une site d'association chretienne qui accueil les professionnel chretien et particulier chretien de travailler pour le royaume de Dieu)
- il faut une carte geographique pour que les client puisse faire une recherche d'annonce depuis la carte le plan geograpique.
- une gallerie de cards de tout les annonces

2. page annonce et sous page d'abonnement:

- tout un haut une carte goegraphique qui montre la presence d'annonce sur la carte selon le choix client de departement
- un bar de recherche de d'annonce
- filtrer les annonces
- clique sur annonce, permet d'ouvrir le profile de professionnel
- sous page d'abonnement soit expliquer les deux option professionnele 7 euros par mois et 84€ par an. les option classique, permet de creer des annonces, etc...

3. page a propos : te laisse creer avec le style moderne, ou je vais ecrire et mettre une video youtube pour expliquer le vision

4. page Don : tu peux creer une page pour recevoir les dons, par un bouton, tu le garde sur le header

5. page de contact : classique

## 2. Stack retenue

- React 19 + TypeScript strict ;
- Vite pour le développement et le build ;
- React Router pour les routes ;
- TanStack Query pour les données serveur et le cache ;
- React Hook Form + Zod pour les formulaires et leur validation ;
- Supabase JS pour Auth, PostgreSQL, Storage et les appels RPC ;
- Zustand seulement pour un futur état d'interface réellement global ;
- Vitest + Testing Library pour le TDD ;
- CSS en tailwind centralisé au départ, avec variables et composants visuels cohérents.

## 3. Commandes depuis la racine

```bash
npm run setup
npm run install:all
npm run dev
npm run test
npm run test:coverage
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run check
```

Le serveur front-end utilise `http://127.0.0.1:5173`.

## 4. Configuration locale

Copier `frontend/.env.example` vers `frontend/.env.local`, puis renseigner les valeurs retournées par `npm run backend:start` :

```dotenv

VITE_SUPABASE_URL=https://ybfjjuznkfaftudtysge.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliZmpqdXpua2ZhZnR1ZHR5c2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MzUwMjIsImV4cCI6MjEwMjExMTAyMn0.pXs6udT7zoAe0ceUGA1NVmD3lVTgIBasYvKSoVjBaPc
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_pcCWg0bAE4p0A4VNOuPUUg_CMLwdOTf
```

La clé `service_role` ne doit **jamais** être mise dans le front-end.

## 5. Organisation des fichiers

```text
frontend/
├── src/
│   ├── app/                 # routeur, layout, providers
│   ├── components/          # composants UI réellement partagés
│   ├── features/            # code organisé par domaine métier
│   │   ├── auth/
│   │   ├── listings/
│   │   ├── categories/
│   │   ├── favorites/
│   │   ├── profiles/
│   │   ├── dashboard/
│   │   └── admin/
│   ├── lib/                 # client Supabase et utilitaires
│   ├── stores/              # état UI local/global uniquement
│   ├── test/                # setup et fixtures de test
│   └── styles.css
├── .env.example
├── package.json
└── vite.config.ts
```

Une feature suit la même forme :

```text
features/listings/
├── api/                     # lectures et mutations Supabase
├── components/              # composants propres aux annonces
├── model/                   # types, schémas Zod, règles pures
├── pages/                   # assemblage des écrans
└── hooks/                   # hooks réutilisés dans la feature
```

## 6. Responsabilité des états

### TanStack Query

Utiliser TanStack Query pour les annonces, catégories, profils, favoris, signalements et statistiques. Les clés doivent être stables et structurées :

```ts
["listings", filters][("listing", listingId)][("seller", sellerId)][
  ("favorites", userId)
];
```

Après une mutation, invalider seulement les données touchées. Ne pas déclencher des rafraîchissements globaux.

### URL

La recherche publique appartient à l'URL :

```text
/annonces?q=velo&category=velos&city=toulon&minPrice=100&sort=price_asc
```

Cela garantit le partage, le retour navigateur, le cache et une future stratégie SEO.

### Zustand

Réserver Zustand à l'état d'interface non persistant : ouverture d'une sidebar, mode grille/liste, étape courante d'un formulaire ou brouillon local. Les données Supabase n'y sont pas dupliquées.

## 7. Routes V1

| Route                 | Accès            | But                             |
| --------------------- | ---------------- | ------------------------------- |
| `/`                   | public           | accueil et recherche principale |
| `/annonces`           | public           | catalogue, filtres et tri       |
| `/annonce/:slug`      | public           | fiche annonce                   |
| `/categorie/:slug`    | public           | catalogue préfiltré             |
| `/vendeur/:username`  | public           | profil et annonces du vendeur   |
| `/connexion`          | public           | connexion                       |
| `/inscription`        | public           | création de compte              |
| `/publier`            | authentifié      | formulaire multi-étapes         |
| `/dashboard`          | authentifié      | synthèse vendeur                |
| `/dashboard/annonces` | authentifié      | gestion des annonces            |
| `/dashboard/favoris`  | authentifié      | favoris                         |
| `/dashboard/profil`   | authentifié      | édition du profil               |
| `/admin`              | modérateur/admin | modération                      |

Les routes non encore implémentées affichent actuellement une page neutre. Ce comportement est volontaire : il évite les liens morts tout en signalant clairement la tranche suivante.

## 8. Ordre de réalisation TDD

Chaque tranche suit strictement : **test rouge → code minimal correct → test vert → nettoyage → build**.

### Tranche F1 — catalogue

- [x] validation des filtres URL ;
- [x] carte d'annonce accessible ;
- [x] catalogue responsive ;
- [x] tri et recherche ;
- [ ] pagination avec conservation des filtres ;
- [ ] état favori relié à Supabase et retour de connexion explicite.

Critères de fin : URL partageable, aucune erreur TypeScript, navigation clavier, états chargement/vide/erreur visibles.

### Tranche F2 — fiche annonce

Écrire d'abord les tests couvrant : chargement par slug, annonce absente, galerie clavier/tactile, prix absent, champs dynamiques et informations vendeur.

Critères de fin : aucune donnée privée exposée, galerie responsive, bouton contact clair, signalement authentifié.

### Tranche F3 — authentification et profil

Écrire d'abord les tests couvrant : validation email/mot de passe, erreur Supabase lisible, redirection après connexion et session expirée.

Critères de fin : aucun secret client, erreurs non techniques, déconnexion fiable, routes privées protégées.

### Tranche F4 — dépôt d'annonce

Étapes : catégorie, informations, champs dynamiques, images, localisation, prévisualisation, envoi en modération.

Écrire d'abord les tests des schémas Zod, puis des changements d'étape, enfin de la mutation. Le brouillon local ne doit jamais être confondu avec une annonce sauvegardée côté serveur.

### Tranche F5 — dashboard et modération

Tester les permissions visibles, mais ne jamais compter sur l'interface comme sécurité : les décisions définitives restent dans les politiques RLS du back-end.

## 9. Règles de qualité

- TypeScript `strict` reste activé ;
- aucun `any` implicite ;
- aucun appel Supabase directement dans un composant visuel ;
- aucune donnée serveur dupliquée dans Zustand ;
- chaque formulaire possède un schéma Zod ;
- chaque bouton icône possède un nom accessible ;
- tous les états asynchrones ont chargement, succès, vide et erreur ;
- mobile testé à 320 px minimum ;
- animations désactivables avec `prefers-reduced-motion` ;
- aucun placeholder silencieux dans un parcours critique.

## 10. Définition de « terminé »

Une tranche front-end est terminée uniquement quand :

1. les tests métier et composants passent ;
2. le typecheck passe ;
3. le lint passe sans avertissement ;
4. le build de production passe ;
5. le parcours clavier est utilisable ;
6. les états erreur et vide ont été vérifiés ;
7. le contrat back-end utilisé est documenté dans `BACKEND.md`.

## 11. Payement par stripe

- tu peux mettre de le fonctionnement par stripe
- mode de payement en option google pay

## 12. Carte localisation de plan de la france

- je souhaite avoir une carte de plan geographique sur la page d'accuille, pour que les cliens puisse faire une recherche d'annonce
- pour que clients puisse cliquer sur la carte departement par departement
