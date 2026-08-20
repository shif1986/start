# Front-end — Place

Ce document est la référence unique pour construire l'interface React. Le code se trouve dans `frontend/`, mais toutes les commandes ci-dessous se lancent depuis la racine du projet. Il n'est jamais nécessaire d'exécuter `cd frontend`.

## Principes produit confirmés

- Nom : START Réseau Chrétien.
- Marketplace / annuaire d'annonces pour professionnels et particuliers chrétiens.
- Compte particulier : gratuit.
- Compte professionnel : publication conditionnée à un abonnement actif.
- Abonnement pro prévu : 7 € / mois ou 84 € / an.
- Authentification : e-mail classique + Google.
- Un visiteur non connecté peut consulter les annonces et les profils publics, mais il ne peut pas voir le numéro de téléphone ni l’adresse e-mail professionnelle.
- Un particulier connecté peut consulter les annonces, commenter, signaler un contenu, enregistrer des favoris et prendre contact selon le parcours défini par le site, sans pouvoir publier d’annonce.
- Un professionnel connecté peut consulter les annonces et les profils publics, et peut voir les coordonnées d’un autre professionnel.
- Une annonce professionnelle ne peut être publiée qu’après souscription à un abonnement actif et validation du compte / statut pro.
- Carte de France avec recherche par département sur l'accueil et dans le catalogue.
- Paiement prévu avec Stripe, avec un mode de paiement Google Pay et un mode classique lorsque disponible.
- Identité visuelle : Manrope, #22221E, #F4EFE5, #C7A45D.

## 1. Objectif du front-end

Créer une marketplace (site d'annonces) locale, rapide, accessible, dynamique, moderne, animée, professionnelle et responsive, qui permet à un visiteur de :

1. rechercher une annonce ;
2. filtrer et trier les résultats avec une URL partageable ;
3. consulter une fiche annonce et un profil professionnel ;
4. créer un compte professionnel ; les professionnels peuvent y accéder pour déposer une annonce après avoir souscrit un abonnement de 7 € par mois ou 84 € par an ;
5. créer un compte particulier gratuit, qui permet au client de laisser des commentaires, enregistrer des favoris et prendre contact selon les règles du site, sans avoir le droit de publier une annonce ;
6. consulter l'ensemble des annonces, sans voir les coordonnées privées professionnelles, signaler un problème et laisser un commentaire après création d'un compte ;
7. enregistrer des favoris ;
8. signaler un contenu ;
9. utiliser un tableau de bord professionnel ou particulier selon son rôle, ainsi qu'un tableau de bord de modération, tout en conservant l'historique de ses interactions sur le site ;
10. choisir entre la création d'un compte pro ou particulier via Google ou via un identifiant classique avec n'importe quelle adresse e-mail.

## 2. Les pages

- Le nom du site est Start Réseau Chrétien. Le site s'inspire d'un thème WordPress que l'on peut consulter ici : https://wpdirectorykit.com/theme_preview/classified-ads-directory
- J'ai déjà un logo.
- Police : Sora.
- Couleurs : #22221E, #F4EFE5, #C7A45D.

1. Accueil :
   - titre : Start Réseau Chrétien ;
   - description : mettre une proposition correspondant à un site d'association chrétienne qui accueille des professionnels chrétiens et des particuliers chrétiens pour travailler pour le Royaume de Dieu ;
   - carte des départements de France et des DOM-TOM avec une barre de recherche ; les utilisateurs peuvent cliquer sur les départements pour lancer une recherche ; cela redirige vers la page d'annonces, avec la recherche et le département transmis dans l'URL ;
   - section secondaire avec une galerie de 5 cartes d'annonces, avec un bouton "Voir plus" ; ces annonces doivent être triées du plus récent au plus ancien.

2. Page de recherche d'annonces :
   - si l'utilisateur n'est pas authentifié, proposer un bouton pour l'inviter à créer un compte ;
   - en haut, une carte géographique affichant la présence des annonces selon le département choisi par le client ;
   - une barre de recherche d'annonces ;
   - filtres et tri des annonces ;
   - cliquer sur une annonce ouvre le profil du professionnel ;
   - sous-page d'abonnement pour expliquer les deux options professionnelles : 7 € par mois et 84 € par an. Les options classiques permettent de créer des annonces, etc.

3. Page de détail d'une annonce avec un bouton permettant de revenir à la page de recherche.

4. Page À propos : laisser créer un style moderne, puis ajouter le texte et une vidéo YouTube pour expliquer la vision.

5. Page de dons : créer une page dédiée pour recevoir des dons, avec un bouton conservé dans le header.

6. Page de contact : classique.

## 3. Stack retenue

- React 19 + TypeScript strict ;
- Vite pour le développement et le build ;
- React Router pour les routes ;
- TanStack Query pour les données serveur et le cache ;
- React Hook Form + Zod pour les formulaires et leur validation ;
- Supabase JS pour Auth, PostgreSQL, Storage et les appels RPC ;
- Zustand uniquement pour un futur état d'interface réellement global ;
- Vitest + Testing Library pour le TDD ;
- CSS en Tailwind centralisé au départ, avec variables et composants visuels cohérents.

### Tailwind CSS

Tailwind CSS 4 est installé avec son plugin Vite officiel dans `frontend/`.
L'import global et les tokens de l'identité START se trouvent dans
`frontend/src/index.css` :

font-sans Montserrat
font-hero Montserrat
font-script MonteCarlo

- `start-ink` : `#22221E` ;
- `start-cream` : `#F4EFE5` ;
- `start-gold` : `#C7A45D`.

Exemples : `bg-start-ink`, `text-start-cream`, `border-start-gold` et
`font-script`. Les composants de l'interface utilisent directement les classes
utilitaires Tailwind. `App.css` est conservé temporairement comme archive de la
maquette précédente, mais il n'est plus chargé par l'application.

## 4. Commandes depuis la racine

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

## 5. Configuration locale

Copier `frontend/.env.example` vers `frontend/.env.local`, puis renseigner les valeurs retournées par `npm run backend:start` :

```dotenv
VITE_SUPABASE_URL=https://ybfjjuznkfaftudtysge.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliZmpqdXpua2ZhZnR1ZHR5c2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MzUwMjIsImV4cCI6MjEwMjExMTAyMn0.pXs6udT7zoAe0ceUGA1NVmD3lVTgIBasYvKSoVjBaPc
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_pcCWg0bAE4p0A4VNOuPUUg_CMLwdOTf
```

La clé `service_role` ne doit jamais être mise dans le front-end.

## 6. Organisation des fichiers

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

## 7. Responsabilité des états

### TanStack Query

Utiliser TanStack Query pour les annonces, catégories, profils, favoris, signalements et statistiques. Les clés doivent être stables et structurées :

```ts
["listings", filters][("listing", listingId)][("seller", sellerId)][
  ("favorites", userId)
];
```

Après une mutation, invalider uniquement les données touchées. Ne pas déclencher de rafraîchissement global.

### URL

La recherche publique appartient à l'URL :

```text
/annonces?q=velo&category=velos&city=toulon&minPrice=100&sort=price_asc
```

Cela garantit le partage, le retour navigateur, le cache et une future stratégie SEO.

### Zustand

Réserver Zustand à l'état d'interface non persistant : ouverture d'une sidebar, mode grille / liste, étape courante d'un formulaire ou brouillon local. Les données Supabase ne doivent pas y être dupliquées.

## 8. Routes V1

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
| `/abonnement`         | professionnel    | choix de l'abonnement pro       |

Les routes non encore implémentées affichent actuellement une page neutre. Ce comportement est volontaire : il évite les liens morts tout en signalant clairement la tranche suivante.

État de la maquette : `/connexion` contient un lien discret « Accès administration » qui ouvre `/admin`. Il facilite la revue du frontend uniquement et ne constitue pas une authentification. À terme, la connexion commune redirigera automatiquement selon le rôle retourné par le backend.

La page `/abonnement` est également une maquette frontend : les sélecteurs mensuel/annuel, carte et Google Pay sont visuels et aucun paiement n'est débité. La clé secrète Stripe, la création des sessions Checkout, les webhooks et le contrôle de l'abonnement actif devront rester côté serveur.

### Catégories V1

`frontend/src/data/categories.ts` est la source unique des quatorze catégories. Chaque entrée possède au minimum `id`, `slug`, `label` et `subcategories`. Les composants de navigation, recherche, filtre, dépôt et pages de catégories doivent importer cette configuration au lieu de reconstruire leurs propres listes.

Slugs principaux : `vehicules`, `immobilier`, `emploi`, `services`, `maison-jardin`, `mode-accessoires`, `multimedia`, `loisirs`, `animaux`, `materiel-professionnel`, `commerce-entreprise`, `agriculture`, `btp-industrie` et `autres-annonces`.

La navigation courte privilégie : Véhicules, Immobilier, Emploi, Services, Maison & Jardin, Multimédia, Loisirs, Matériel Pro et Commerce, avec un accès distinct à « Toutes les catégories ». Les catégories professionnelles prioritaires sont Services, Matériel professionnel, Commerce & Entreprise, Agriculture et BTP & Industrie.

Les URLs de filtre utilisent `/annonces?category=<slug>`. Les futures pages SEO pourront reprendre les mêmes slugs, par exemple `/vehicules`, `/services`, `/materiel-professionnel`, `/commerce-entreprise` et `/btp-industrie`.

## 9. Ordre de réalisation TDD

Chaque tranche suit strictement : test rouge → code minimal correct → test vert → nettoyage → build.

### Tranche F1 — catalogue

- [x] validation des filtres URL ;
- [x] carte d'annonce accessible ;
- [x] catalogue responsive ;
- [x] tri et recherche ;
- [ ] pagination avec conservation des filtres ;
- [ ] état favori relié à Supabase et retour de connexion explicite.

Critères de fin : URL partageable, aucune erreur TypeScript, navigation clavier, états chargement / vide / erreur visibles.

### Tranche F2 — fiche annonce

Écrire d'abord les tests couvrant : chargement par slug, annonce absente, galerie clavier / tactile, prix absent, champs dynamiques et informations vendeur.

Critères de fin : aucune donnée privée exposée, galerie responsive, bouton contact clair, signalement authentifié.

### Tranche F3 — authentification et profil

Écrire d'abord les tests couvrant : validation e-mail / mot de passe, erreur Supabase lisible, redirection après connexion et session expirée.

Critères de fin : aucun secret client, erreurs non techniques, déconnexion fiable, routes privées protégées.

### Tranche F4 — dépôt d'annonce

Étapes : catégorie, informations, champs dynamiques, images, localisation, prévisualisation, envoi en modération.

Écrire d'abord les tests des schémas Zod, puis des changements d'étape, enfin de la mutation. Le brouillon local ne doit jamais être confondu avec une annonce enregistrée côté serveur.

### Tranche F5 — dashboard et modération

Tester les permissions visibles, mais ne jamais compter sur l'interface comme sécurité : les décisions définitives restent dans les politiques RLS du back-end.

## 10. Règles de qualité

- TypeScript `strict` reste activé ;
- aucun `any` implicite ;
- aucun appel Supabase directement dans un composant visuel ;
- aucune donnée serveur dupliquée dans Zustand ;
- chaque formulaire possède un schéma Zod ;
- chaque bouton icône possède un nom accessible ;
- tous les états asynchrones ont un état de chargement, de succès, de vide et d'erreur ;
- mobile testé à 320 px minimum ;
- animations désactivables avec `prefers-reduced-motion` ;
- aucun placeholder silencieux dans un parcours critique.

## 11. Définition de « terminé »

Une tranche front-end est terminée uniquement quand :

1. les tests métier et composants passent ;
2. le typecheck passe ;
3. le lint passe sans avertissement ;
4. le build de production passe ;
5. le parcours clavier est utilisable ;
6. les états erreur et vide ont été vérifiés ;
7. le contrat back-end utilisé est documenté dans `BACKEND.md`.

## 12. Paiement par Stripe

- mettre en place le fonctionnement par Stripe ;
- proposer un mode de paiement Google Pay comme option.

## 13. Carte de localisation du plan de la France

- souhaité : une carte géographique sur la page d'accueil pour que les clients puissent rechercher des annonces ;
- les clients doivent pouvoir cliquer sur la carte, département par département, pour lancer une recherche.

## 14. Système d'animation actuel

La révélation des titres et paragraphes au scroll est gérée globalement dans `src/components/Layout.tsx`. Le layout sélectionne les éléments `h1`, `h2`, `h3` et `p`, puis un `IntersectionObserver` ajoute `is-visible` lors de leur entrée dans le viewport.

```text
durée principale       950ms
délai progressif       70ms, limité à cinq niveaux
déplacement desktop    22px
déplacement mobile     14px
durée mobile           720ms
seuil d'observation    8%
marge basse            -8%
```

Les styles sont centralisés dans `src/index.css`. Sur mobile, le flou est supprimé et le déplacement est raccourci. Avec `prefers-reduced-motion: reduce`, les contenus sont immédiatement visibles sans animation.

Règles opérationnelles :

- ne pas dupliquer l'observateur dans chaque page ;
- ne pas appliquer ce système aux boutons, champs ou contrôles indispensables ;
- conserver une seule exécution par élément ;
- garantir l'affichage si `IntersectionObserver` est indisponible ;
- tester à 320 px, 390 px, 768 px et sur grand écran.

## 15. Responsive du catalogue et des fiches

- `ListingsMap.tsx` utilise une hauteur fluide jusqu'à `620px` et passe à `340px` sous `640px` ;
- la barre de recherche passe de quatre à deux puis une colonne ;
- les filtres restent synchronisés avec l'URL à toutes les tailles ;
- la fiche annonce empile le contenu et le profil sous `1024px` ;
- les CTA d'inscription, de contact et d'évaluation prennent toute la largeur sur mobile ;
- `ListingReviews.tsx` autorise le retour à la ligne des étoiles et réduit leur taille sur mobile ;
- contrôler en priorité 320px, 390px, 768px, 1024px et 1440px.

## 16. Espaces de comptes — maquettes frontend

Routes disponibles :

- `/connexion` et `/inscription` : accès et choix particulier/professionnel ;
- `/espace/particulier` : favoris, contacts et avis ;
- `/espace/professionnel` : profil, annonces et abonnement ;
- `/abonnement` : choix mensuel à 7 € ou annuel à 84 €, récapitulatif et moyens de paiement ;
- `/admin` : supervision des utilisateurs, annonces, commentaires, signalements et abonnements.

Ces routes utilisent uniquement des données locales et ne sont pas protégées. Elles servent à valider l'interface et le responsive. Ne jamais considérer leur affichage conditionnel comme une autorisation réelle. Authentification, rôles, abonnement actif et permissions administrateur devront être contrôlés ultérieurement côté backend et base de données.

La page `/abonnement` est une maquette frontend : aucun débit, renouvellement ou changement de statut n'est effectué. Les boutons Carte bancaire et Google Pay préparent uniquement l'intégration future de Stripe.
