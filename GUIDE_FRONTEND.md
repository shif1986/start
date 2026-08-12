# Guide de démarrage front-end — Place

Ne jamais commencer le back-end si le front-end n'est pas terminé. Le front-end doit être terminé d'abord completement. de façon efficace propre clair et aux complet.

Ce document peut être transmis tel quel au développeur chargé du front-end. Il explique ce qui est déjà installé, les responsabilités techniques, l'ordre de réalisation et les règles de qualité.

Le projet est une marketplace locale multi-catégories construite avec React, TypeScript et Supabase. Le premier objectif n'est pas d'imiter toutes les fonctions de Leboncoin ou WP Directory Kit : il faut terminer une V1 fiable autour des annonces, de la recherche, des profils vendeurs, des favoris, du dépôt d'annonce et de la modération.

## 1. Règle principale : rester à la racine

Les dossiers `frontend/` et `backend/` sont côte à côte :

```text
start/
├── frontend/               # application React
├── backend/                # migrations et tests Supabase
├── FRONTEND.md             # architecture fonctionnelle front
├── BACKEND.md              # architecture fonctionnelle back
├── GUIDE_FRONTEND.md       # présent document de transmission
└── package.json            # commandes communes
```

Toutes les commandes de ce guide sont lancées dans `start/`. Il n'est pas nécessaire d'utiliser `cd frontend` ou `cd backend`.

## 2. Prérequis

- Node.js 22 ou plus récent ;
- npm fourni avec Node.js ;
- Git ;
- Docker Desktop seulement si le développeur doit démarrer Supabase localement ;
- un éditeur avec prise en charge TypeScript et ESLint.

Vérification :

```bash
node --version
npm --version
git --version
```

## 3. Première installation

Depuis la racine :

```bash
npm run setup
```

Cette commande installe :

1. toutes les dépendances de `frontend/package.json` ;
2. le CLI Supabase déclaré à la racine ;
3. les versions verrouillées par les fichiers `package-lock.json`.

Ne pas supprimer les lockfiles. Ils garantissent que deux développeurs installent les mêmes versions résolues.

Ensuite :

```bash
npm run check
npm run dev
```

Le front est disponible sur `http://127.0.0.1:5173`.

## 4. Variables d'environnement

Créer `frontend/.env.local` à partir de `frontend/.env.example` :

```dotenv
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=remplacer_par_la_cle_anon
```

Règles :

- seules les variables préfixées par `VITE_` sont exposées au navigateur ;
- la clé anonyme Supabase peut être utilisée dans le navigateur car la sécurité repose sur RLS ;
- la clé `service_role` est strictement interdite dans le front-end ;
- aucun secret ne doit être ajouté dans `.env.example` ou commité ;
- après modification d'une variable Vite, redémarrer le serveur de développement.

Sans variables Supabase, le catalogue utilise volontairement des fixtures locales afin que l'interface reste développable. Les écritures authentifiées ne devront jamais simuler un succès : elles devront afficher qu'une connexion Supabase est nécessaire.

## 5. Dépendances installées

Les versions exactes sont dans `frontend/package-lock.json`. Le tableau explique la responsabilité de chaque paquet, pas une invitation à les utiliser partout.

### Fondations

| Dépendance           | Responsabilité             |
| -------------------- | -------------------------- |
| `react`, `react-dom` | rendu de l'application     |
| `typescript`         | types stricts et contrats  |
| `vite`               | serveur local et build     |
| `react-router-dom`   | routes et paramètres d'URL |

### Données et back-end

| Dépendance                       | Responsabilité                           |
| -------------------------------- | ---------------------------------------- |
| `@supabase/supabase-js`          | Auth, PostgreSQL, Storage et RPC         |
| `@tanstack/react-query`          | requêtes, mutations et cache serveur     |
| `@tanstack/react-query-devtools` | inspection du cache en développement     |
| `@tanstack/react-table`          | futures tables du dashboard/admin        |
| `zustand`                        | petit état global d'interface uniquement |

### Formulaires

| Dépendance            | Responsabilité                         |
| --------------------- | -------------------------------------- |
| `react-hook-form`     | gestion performante des formulaires    |
| `zod`                 | validation et inférence TypeScript     |
| `@hookform/resolvers` | connexion entre React Hook Form et Zod |

### Interface

| Dépendance                         | Responsabilité                                      |
| ---------------------------------- | --------------------------------------------------- |
| `tailwindcss`, `@tailwindcss/vite` | styles utilitaires Tailwind v4                      |
| `shadcn`                           | CLI et registre des composants shadcn/ui            |
| `radix-ui`                         | primitives accessibles des composants               |
| `class-variance-authority`         | variantes typées des composants                     |
| `clsx`, `tailwind-merge`           | composition sûre des classes avec `cn()`            |
| `lucide-react`                     | icônes cohérentes                                   |
| `sonner`                           | notifications toast                                 |
| `motion`                           | animations ponctuelles                              |
| `next-themes`                      | support du thème attendu par les composants UI      |
| `@fontsource-variable/geist`       | police locale, sans dépendance réseau au chargement |

### Marketplace

| Dépendance                  | Responsabilité                          |
| --------------------------- | --------------------------------------- |
| `react-dropzone`            | sélection et glisser-déposer des images |
| `browser-image-compression` | compression avant upload Storage        |
| `leaflet`, `react-leaflet`  | carte OpenStreetMap                     |
| `date-fns`                  | affichage et calcul des dates           |
| `react-helmet-async`        | titre et métadonnées par route          |

### Tests et qualité

| Dépendance                    | Responsabilité                                |
| ----------------------------- | --------------------------------------------- |
| `vitest`                      | tests unitaires et composants                 |
| `@vitest/coverage-v8`         | rapport de couverture                         |
| `@testing-library/react`      | test par comportement utilisateur             |
| `@testing-library/user-event` | clics, saisies et clavier réalistes           |
| `@testing-library/jest-dom`   | assertions DOM lisibles                       |
| `jsdom`                       | environnement navigateur de test              |
| `msw`                         | simulation des requêtes réseau dans les tests |
| `eslint`                      | règles statiques                              |
| `eslint-plugin-jsx-a11y`      | erreurs d'accessibilité JSX                   |
| `prettier`                    | formatage déterministe                        |

Stripe, la messagerie temps réel et les bibliothèques de graphiques ne sont pas installés : ils appartiennent à une tranche ultérieure et ne doivent pas alourdir la V1.

## 6. shadcn/ui déjà configuré

La configuration se trouve dans `frontend/components.json`. Les composants générés sont placés dans :

```text
frontend/src/components/ui/
```

Composants actuellement disponibles :

```text
alert
avatar
badge
breadcrumb
button
card
checkbox
dialog
dropdown-menu
input
label
pagination
select
separator
sheet
skeleton
sonner
tabs
textarea
```

Pour ajouter un composant depuis la racine :

```bash
npm run ui:add -- tooltip
npm run ui:add -- calendar popover
```

Ne pas copier manuellement un composant trouvé sur un blog. Utiliser le registre officiel, puis adapter localement le composant généré si nécessaire.

Alias configurés :

```ts
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

## 7. Commandes quotidiennes

```bash
npm run dev               # développement
npm run test              # tests une fois
npm run test:coverage     # tests et couverture
npm run typecheck         # TypeScript strict
npm run lint              # ESLint et accessibilité
npm run format            # formater les fichiers
npm run format:check      # vérifier le formatage
npm run build             # build de production
npm run check             # tous les contrôles avant livraison
```

Commandes Supabase, toujours depuis la racine :

```bash
npm run backend:start
npm run backend:reset
npm run backend:test
npm run backend:types
npm run backend:status
npm run backend:stop
```

Après une modification du schéma SQL, exécuter `backend:reset`, `backend:test`, puis `backend:types` avant de modifier les appels TypeScript.

## 8. Architecture obligatoire

```text
frontend/src/
├── app/
│   ├── router.tsx         # déclaration centrale des routes
│   ├── providers.tsx      # Query, Helmet, Toaster, Devtools
│   └── Layout.tsx         # cadre général
├── components/
│   └── ui/                # composants shadcn génériques
├── features/
│   └── listings/
│       ├── api/           # appels Supabase
│       ├── components/    # UI propre aux annonces
│       ├── model/         # types, schémas, fonctions pures
│       └── pages/         # assemblage des routes
├── lib/
│   ├── supabase.ts        # client partagé
│   └── utils.ts           # cn() et utilitaires transverses
├── stores/
│   └── ui-store.ts        # état UI Zustand uniquement
└── test/                  # setup et fixtures
```

Créer une feature par domaine : `auth`, `categories`, `favorites`, `profiles`, `dashboard`, `admin`. Ne pas créer un grand dossier `components` contenant toute l'application.

## 9. Règle de décision pour l'état

### Donnée venant de Supabase

Utiliser TanStack Query :

```ts
useQuery({
  queryKey: ["listing", listingId],
  queryFn: () => getListing(listingId),
});
```

### Filtre de catalogue partageable

Utiliser l'URL :

```text
/annonces?category=velos&city=toulon&minPrice=100&sort=price_asc
```

### État temporaire d'interface

Utiliser un état local React. Zustand est accepté uniquement si plusieurs branches éloignées en ont réellement besoin. `src/stores/ui-store.ts` montre le périmètre correct : mode grille/liste et ouverture des filtres mobiles.

Ne jamais mettre les annonces, profils ou favoris dans Zustand. Cela créerait deux sources de vérité avec le cache Query.

## 10. Formulaires

Chaque formulaire métier doit commencer par un schéma Zod :

```ts
const listingDetailsSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(20).max(10_000),
  price: z.coerce.number().nonnegative().nullable(),
});
```

Puis connecter le schéma au formulaire :

```ts
const form = useForm<ListingDetails>({
  resolver: zodResolver(listingDetailsSchema),
  defaultValues: initialValues,
});
```

Le serveur revalide toujours les données. Zod améliore l'expérience utilisateur mais ne remplace ni les contraintes PostgreSQL ni RLS.

## 11. Appels Supabase

Les composants visuels n'appellent pas directement Supabase. Une fonction dans `features/<domaine>/api/` réalise l'appel, vérifie l'erreur et retourne un type métier stable.

Une mutation de favori doit :

1. vérifier la session ;
2. réaliser `insert` ou `delete` ;
3. afficher une erreur claire si la session manque ;
4. mettre à jour optimistement le cache si le rollback est implémenté ;
5. invalider seulement les clés concernées ;
6. ne jamais afficher un faux succès hors connexion.

## 12. Méthode TDD obligatoire

Pour chaque comportement :

1. écrire un test qui échoue pour la bonne raison ;
2. écrire le minimum de code correct ;
3. faire passer le test ;
4. nettoyer sans changer le comportement ;
5. lancer les contrôles complets.

Tester le comportement visible et les règles métier, pas les détails internes. Préférer :

```ts
screen.getByRole("button", { name: /publier/i });
```

Éviter les sélecteurs CSS fragiles et les snapshots géants.

Chaque requête doit avoir des tests pour : chargement, succès, résultat vide et erreur. Chaque formulaire doit tester : données valides, erreurs principales, double soumission et erreur serveur.

## 13. Ordre conseillé des travaux

### Étape 1 — stabiliser le catalogue

- relier les catégories à Supabase ;
- ajouter prix minimum/maximum ;
- ajouter pagination ;
- relier réellement les favoris ;
- remplacer les placeholders par des skeletons ;
- conserver tous les filtres dans l'URL.

### Étape 2 — fiche annonce

- galerie responsive ;
- prix, description et champs dynamiques ;
- profil vendeur ;
- bouton favori ;
- contact vendeur ;
- signalement ;
- titres et métadonnées avec Helmet.

### Étape 3 — authentification

- inscription ;
- connexion ;
- lien magique ;
- mot de passe oublié ;
- gestion de session ;
- protection des routes privées.

### Étape 4 — dépôt d'annonce

- formulaire multi-étapes ;
- champs générés depuis `category_fields` ;
- compression et upload d'images ;
- réorganisation des images ;
- localisation ;
- prévisualisation ;
- sauvegarde brouillon ;
- soumission en modération.

### Étape 5 — dashboard vendeur

- mes annonces ;
- modification ;
- archivage ;
- marquer comme vendu ;
- favoris ;
- profil.

### Étape 6 — administration

- garde de rôle ;
- file des annonces en attente ;
- approbation/refus ;
- catégories ;
- champs dynamiques ;
- signalements.

## 14. Accessibilité et responsive

- utiliser les composants shadcn/Radix avant de reconstruire dialog, select ou dropdown ;
- tout champ possède un label visible ou un nom accessible ;
- tout bouton icône possède `aria-label` ;
- ne jamais imbriquer un bouton dans un lien ;
- conserver un focus visible ;
- toutes les actions doivent fonctionner au clavier ;
- tester à 320 px, 768 px et grand écran ;
- respecter `prefers-reduced-motion` ;
- les images informatives ont un texte alternatif ; les images décoratives ont `alt=""`.

## 15. Gestion des erreurs

Ne jamais afficher directement une erreur technique Supabase contenant des détails internes. Mapper les erreurs connues vers des messages utilisateur, conserver la cause pour le diagnostic et proposer une action : réessayer, se connecter ou revenir à la page précédente.

Interdire :

- les `catch {}` silencieux ;
- les boutons qui ne réagissent pas ;
- les mutations sans état de chargement ;
- les doubles soumissions ;
- les faux succès avec des données locales ;
- les `refetch()` globaux après chaque action.

## 16. Git et livraison

Une branche traite une tranche cohérente. Avant un commit :

```bash
npm run check
git diff --check
git status --short
```

Ne pas commiter : `.env.local`, `node_modules`, `dist`, `coverage` ou une clé Supabase privée.

Un commit doit décrire un résultat :

```text
Add listing detail gallery and seller summary
```

Éviter :

```text
changes
fix stuff
final final
```

## 17. Définition de terminé

Une fonctionnalité front-end est terminée seulement si :

1. son parcours nominal fonctionne ;
2. les permissions sont aussi protégées côté Supabase ;
3. chargement, vide et erreur sont visibles ;
4. les tests TDD passent ;
5. TypeScript strict passe sans `any` de contournement ;
6. ESLint et l'accessibilité passent ;
7. Prettier ne détecte aucun écart ;
8. le build de production réussit ;
9. mobile et clavier ont été vérifiés ;
10. le contrat utilisé est cohérent avec `BACKEND.md`.

## 18. Payement par stripe

- tu peux mettre de le fonctionnement par stripe
- mode de payement en option google pay

## 19. Références officielles

- [shadcn/ui avec Vite](https://ui.shadcn.com/docs/installation/vite)
- [TanStack Query pour React](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Supabase JavaScript](https://supabase.com/docs/reference/javascript/introduction)
- [Zustand](https://zustand.docs.pmnd.rs/getting-started/introduction)
- [React Hook Form](https://react-hook-form.com/get-started)
- [Tailwind CSS avec Vite](https://tailwindcss.com/docs/installation/using-vite)

Le développeur doit commencer par lire ce fichier, puis `FRONTEND.md`, puis consulter `BACKEND.md` uniquement pour comprendre les contrats et permissions dont son interface dépend.

## 20. Carte localisation de plan de la france

- je souhaite avoir une carte de plan geographique sur la page d'accuille, pour que les cliens puisse faire une recherche d'annonce
- pour que clients puisse cliquer sur la carte departement par departement
