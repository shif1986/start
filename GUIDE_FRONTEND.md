# Guide frontend — START Réseau Chrétien

Ce guide permet de reprendre le frontend dans son état actuel sans supposer que les fonctionnalités futures sont déjà installées.

## 1. Périmètre et démarrage

Le travail actuel concerne uniquement `frontend/`. Il s'agit d'une maquette React fonctionnelle avec données locales.

Prérequis : Node.js 22 ou plus récent, npm et Git.

```bash
cd frontend
npm install
npm run dev
```

Contrôles disponibles :

```bash
npm run lint
npm run build
npm run preview
```

`frontend/package-lock.json` est le lockfile npm de référence.

## 2. Dépendances actuelles

| Dépendance              | Usage                  |
| ----------------------- | ---------------------- |
| React 19                | interface              |
| TypeScript              | typage strict          |
| Vite 8                  | développement et build |
| React Router DOM 7      | navigation et URL      |
| Tailwind CSS 4          | styles des composants  |
| Leaflet / React Leaflet | carte d'une annonce    |
| Oxlint                  | lint                   |

Supabase, TanStack Query, React Hook Form, Zod, Zustand, shadcn/ui, Vitest et Testing Library sont prévus, mais absents actuellement.

## 3. Identité visuelle et Design System

`GUIDE_FRONTEND.md` est la source de vérité pour l'identité et les règles visuelles. `FRONTEND.md` traduit ces règles en consignes opérationnelles et décrit l'état réel du code. En cas d'écart entre les deux documents sur une décision graphique, ce guide prévaut.

START n'est pas un site e-commerce. C'est une plateforme professionnelle d'annonces, de services, d'emploi, d'immobilier, d'événements, d'entraide et de mise en relation au sein d'un réseau chrétien. Toute interface doit d'abord évoquer le réseau professionnel, la confiance, la communauté et le sérieux institutionnel. Les informations utiles passent avant les grandes photographies décoratives.

La direction générale est sombre, contemporaine, élégante et chaleureuse, sans codes luxueux ni présentation de catalogue marchand. L'identité principale repose sur l'anthracite, le blanc cassé et le doré START. Le bleu, l'orange/jaune et le rouge du symbole sont uniquement des accents secondaires.

### 3.1 Tokens actuels et cible

Le plugin `@tailwindcss/vite` est activé dans `vite.config.ts` et Tailwind est importé dans `src/index.css`.

```text
font-sans       Montserrat
font-hero       Montserrat
font-script     MonteCarlo
start-ink       #22221E
start-cream     #F4EFE5
start-gold      #C7A45D
```

Ces tokens décrivent l'implémentation actuelle et restent utilisables tant qu'une migration dédiée n'a pas été validée. La direction cible du doré principal est `#D4AF37`. Son remplacement dans le code devra être étudié séparément afin de ne pas modifier involontairement la Hero validée.

Accents fonctionnels cibles :

```text
network-blue    #4DA3FF   information, nouveauté, découverte
network-yellow  #FFB33D   opportunité, mise en avant, professionnel
network-red     #FF4D4F   événement, urgence, expiration, attention
```

Ces couleurs sont réservées aux petits badges, points, traits, icônes, états et détails du motif. Elles ne remplacent jamais le doré comme couleur principale d'interaction et ne doivent pas colorer de grandes surfaces.

### 3.2 Familles de fonds

- **Dark Base** — fond standard des pages fonctionnelles, de `#0B0D10` à `#121418` : résultats, recherche, profils, formulaires, listes et contenu principal.
- **Surface Card** — surface légèrement plus claire, généralement `#121418` ou `#17191E`, avec bordure discrète : cartes, filtres, panneaux et informations secondaires.
- **Gold Glow** — lumière dorée diffuse sur fond sombre, limitée aux sections stratégiques : vision, mission, présentation, mise en avant, rejoindre le réseau et CTA institutionnels. Ne jamais employer une grande surface dorée pleine.
- **Network Pattern** — fond identitaire utilisant le motif START : présentation du réseau, statistiques, transitions, CTA, sections institutionnelles et footer.

Alterner subtilement ces familles pour rythmer une page sans créer plusieurs univers graphiques. Éviter une succession de sections ayant exactement le même noir.

Exemple de Gold Glow :

```css
background:
  radial-gradient(circle at 15% 30%, rgba(212, 175, 55, 0.1), transparent 35%),
  linear-gradient(120deg, #171712 0%, #101217 45%, #090c12 100%);
```

### 3.3 Signature réseau START

Le symbole de nœuds connectés exprime la connexion, la collaboration et la communauté. Il fait partie du Design System et peut être répété en arrière-plan.

- opacité habituelle comprise entre 3 % et 8 % ;
- motif sombre, discret et souvent partiellement coupé par les limites de la section ;
- lisibilité du contenu toujours prioritaire ;
- un ou quelques nœuds seulement peuvent recevoir un accent bleu, jaune ou rouge ;
- ne jamais colorer tout le réseau ni en faire la décoration dominante.

### 3.4 Typographie, interactions et surfaces

Les composants utilisent les utilitaires Tailwind. `App.css` n'est plus chargé.

Principes conservés : lueur dorée subtile, header sans contour coloré et bordures de boutons fines. Montserrat est la police principale du frontend et de la Hero. Le doré est réservé aux CTA principaux, liens importants, bordures actives, petits titres, séparateurs, états sélectionnés et icônes importantes.

### 3.5 Hero protégée

La Hero actuelle est réalisée et validée. Ne pas la redessiner dans la migration du Design System. Toute harmonisation future de variables communes doit être isolée, vérifiée à chaque breakpoint et ne pas altérer son rendu.

## 4. Architecture actuelle

```text
src/
├── components/
│   ├── FranceListingsMap.tsx
│   ├── Layout.tsx
│   └── ListingLocationMap.tsx
├── data/
│   ├── franceDepartments.geojson
│   └── mockListings.ts
├── pages/
├── App.tsx
├── index.css
└── main.tsx
```

`App.tsx` déclare les routes. `Layout.tsx` contient le header, les deux niveaux de navigation, le burger, la recherche et le footer.

## 5. Header responsive

Le header est sticky sur toutes les tailles.

Premier niveau : logo, navigation principale, Don, connexion et publication. Sous 1024 px, les liens et actions secondaires passent dans un burger accessible avec `aria-expanded` et `aria-controls`.

Second niveau :

- `Services`, `Éducation`, `Bricolage` à gauche ;
- recherche au centre ;
- `Santé`, `Événementiel`, `Conseil` à droite ;
- bordure de recherche de `0.5px` ;
- filtres vers `/annonces?category=...` ;
- recherche vers `/annonces?q=...`.

Sous 1280 px, les catégories deviennent une liste horizontale défilable sous la recherche.

## 6. Hero responsive

Sur grand écran : texte à gauche, carte à droite. Les colonnes sont rapprochées et la carte est légèrement décalée vers la gauche.

```text
START
RÉSEAU CHRÉTIEN
PROFESSIONNEL
```

Les trois lignes partagent les mêmes bords et `PROFESSIONNEL` est doré.

Sous 1024 px : une colonne centrée, titre limité à 300 px, paragraphe avec séparateur horizontal, CTA centrés, carte limitée à 650 px et indicateur « Découvrir » masqué.

Sous 640 px : titre limité à 260 px et 3 rem, libellé supérieur compact, CTA empilés, cartouche France réduit et padding vertical resserré.

## 7. Carte de France

`FranceListingsMap.tsx` transforme le GeoJSON en chemins SVG, calcule les centroïdes et affiche les compteurs.

- conserver clic et Entrée/Espace ;
- conserver la sélection dorée ;
- ne pas réintroduire le contour bleu natif ;
- conserver le fond transparent et l'absence de bordure ;
- compléter ultérieurement les territoires ultramarins ;
- optimiser le GeoJSON avant la production.

`ListingLocationMap.tsx` utilise OpenStreetMap via React Leaflet.

## 8. Catalogue et URL

Les annonces viennent de `mockListings.ts`. Les filtres restent dans l'URL :

```text
/annonces?q=...&department=...&category=...
```

Conserver cette règle lors du passage à Supabase.

## 9. Responsive à vérifier

- 320 px et 390 px : mobile ;
- 768 px : tablette ;
- 1024 px : bascule burger/hero ;
- 1280 px : bascule des catégories ;
- 1440 px et plus : disposition complète.

Vérifier le header sticky, le burger, le défilement des catégories, l'absence de débordement du titre, les CTA, la carte et les cartes d'annonces.

Règles responsive appliquées aux éléments récents :

- le sous-menu complet avec sous-catégories au survol est réservé au desktop à partir de 1280 px ; mobile et tablette utilisent un carrousel tactile affichant deux catégories ;
- la Hero place la carte de France avant le titre sous 1024 px et conserve des espacements compacts sous 640 px ;
- les dernières annonces passent de quatre à deux puis une carte par ligne ;
- les catégories passent automatiquement en colonnes selon la largeur disponible, sans largeur inférieure à 250 px ;
- la page de publication empile ses trois étapes sous 768 px et ses CTA sous 640 px ;
- la fiche annonce empile le profil sous le contenu à 1024 px, passe la photo principale en ratio 4/3 sous 768 px et empile sa légende sous 640 px ;
- tout nouveau composant ou ajustement visuel doit être contrôlé au minimum à 320, 390, 768, 1024 et 1440 px.

Les écrans de compte suivent également ces règles :

- `/connexion` et `/inscription` conservent une carte centrée, des champs pleine largeur et des zones tactiles d'au moins 44 px ;
- le lien discret « Accès administration » est affiché uniquement sur `/connexion` et reste lisible au clavier comme sur mobile ;
- `/abonnement` passe de deux formules à une colonne sous 768 px ; ses moyens de paiement s'empilent sous 640 px ;
- les tableaux de bord passent en une colonne, préservent les badges et autorisent les titres d'annonces à revenir à la ligne sans débordement.

## 10. Accessibilité

- tout bouton icône possède un nom accessible ;
- toutes les actions fonctionnent au clavier ;
- conserver un focus visible sur les contrôles classiques ;
- les départements SVG utilisent la sélection dorée comme indicateur ;
- ne pas imbriquer bouton et lien ;
- respecter `prefers-reduced-motion` lors de l'ajout d'animations.

## 11. Évolutions prévues

1. optimiser le GeoJSON et découper le bundle par route ;
2. installer Vitest et Testing Library ;
3. intégrer Supabase et générer les types ;
4. ajouter TanStack Query ;
5. construire l'authentification et la confidentialité ;
6. ajouter React Hook Form et Zod ;
7. développer favoris, signalements et publication ;
8. ajouter Stripe, dashboards et modération.

Ne jamais exposer une clé `service_role` et ne jamais compter sur le masquage React comme seule protection.

### 11.1 Authentification et administration — état actuel

Les formulaires e-mail et Google sont des interfaces frontend : ils ne créent pas encore de session réelle. La page de connexion propose un accès de démonstration à `/admin`. Cette route n'est ni authentifiée ni protégée tant que le backend et la gestion des rôles ne sont pas intégrés.

En production, tous les utilisateurs utiliseront la même connexion. Après authentification, le rôle enregistré côté serveur déterminera la redirection vers l'espace particulier, professionnel ou administrateur. Le rôle `admin` ne doit jamais être sélectionnable à l'inscription ni déduit d'une donnée modifiable dans le navigateur.

Le CTA « Publier une annonce » ouvre `/publier`. Cette page présente le parcours obligatoire : compte professionnel, abonnement actif, puis publication. La création de compte depuis ce parcours présélectionne le type professionnel et conduit à `/abonnement`. Un compte particulier qui serait choisi à la place revient dans son espace et ne peut pas poursuivre vers l'abonnement de publication.

### 11.2 Stripe — état actuel et branchement futur

`/abonnement` présente les formules professionnelles de 7 € par mois et 84 € par an ainsi qu'un choix visuel entre carte bancaire et Google Pay. Aucun paiement n'est actuellement créé et le bouton de continuation ne débite rien.

La connexion Stripe nécessitera un service serveur pour créer une Checkout Session, conserver la clé secrète, vérifier les webhooks et enregistrer l'état de l'abonnement. Le frontend ne devra recevoir que les identifiants publiables nécessaires. Le droit de publier devra toujours être contrôlé côté serveur à partir d'un abonnement réellement actif, jamais à partir de l'état React ou d'une redirection de succès.

Le tableau de bord interne `/admin` servira à superviser les comptes, annonces, commentaires, signalements et états d'abonnement. Les paiements, factures, remboursements et litiges resteront administrés dans Stripe Dashboard.

## 12. Avant livraison

```bash
cd frontend
npm run lint
npm run build
git diff --check
git status --short
```

Le build émet actuellement un avertissement de taille de chunk principalement lié au GeoJSON. Il doit être traité avant une production réelle.

## 13. Catégories et composants associés

`src/data/categories.ts` est l'unique source des catégories et de leurs sous-catégories. Les composants ne doivent jamais recréer ces tableaux localement. Le contrat minimal d'une catégorie contient `id`, `slug`, `label` et `subcategories`. `description`, `icon`, `image` et `shortLabel` complètent ce contrat pour les besoins actuels de l'interface.

- `CategoryIcon.tsx` rend les icônes vectorielles ;
- `CategoryCard.tsx` rend une catégorie premium avec photo et compteur ;
- `CategoriesPage.tsx` affiche les quatorze catégories sur `/categories` ;
- `homeCategories` sélectionne les catégories mises en avant sur l'accueil ;
- `navigationCategories` fournit la navigation courte sans dupliquer les objets ;
- les liens utilisent `/annonces?category=<slug>` ;
- les slugs restent stables afin de préparer les futures URLs SEO.

### 13.1 Architecture des quatorze catégories

1. **Véhicules** (`vehicules`) : Voitures, Motos, Utilitaires, Camping-cars & caravanes, Camions & poids lourds, Bateaux, Pièces & équipements.
2. **Immobilier** (`immobilier`) : Vente, Location, Locations saisonnières, Bureaux & commerces, Terrains, Parkings & garages, Immobilier professionnel.
3. **Emploi** (`emploi`) : Offres d'emploi, Missions, Intérim, Alternance, Stages, Freelance.
4. **Services** (`services`) : Artisans & travaux, Dépannage, Déménagement, Transport & livraison, Nettoyage, Jardinage, Informatique, Événementiel, Services aux entreprises.
5. **Maison & Jardin** (`maison-jardin`) : Meubles, Décoration, Électroménager, Bricolage, Jardin & extérieur, Matériaux, Outillage.
6. **Mode & Accessoires** (`mode-accessoires`) : Vêtements, Chaussures, Sacs, Montres, Bijoux, Accessoires.
7. **Multimédia** (`multimedia`) : Téléphones, Ordinateurs, Tablettes, TV, Audio, Photo & vidéo, Consoles & jeux vidéo.
8. **Loisirs** (`loisirs`) : Sports, Vélos, Musique & instruments, Livres, Jeux & jouets, Collection, Loisirs créatifs.
9. **Animaux** (`animaux`) : Accessoires, Équipements, Services pour animaux et autres annonces autorisées par la réglementation applicable.
10. **Matériel professionnel** (`materiel-professionnel`) : BTP, Matériel agricole, Matériel industriel, Machines & outils, Restauration, Matériel de magasin, Matériel informatique professionnel, Mobilier de bureau, Stocks & lots professionnels.
11. **Commerce & Entreprise** (`commerce-entreprise`) : Fonds de commerce, Entreprises à vendre, Locaux commerciaux, Franchise, Matériel commercial, Stocks & déstockage, Fournitures professionnelles.
12. **Agriculture** (`agriculture`) : Matériel agricole, Tracteurs, Machines agricoles, Équipements et fournitures agricoles.
13. **BTP & Industrie** (`btp-industrie`) : Engins de chantier, Machines industrielles, Outillage professionnel, Échafaudages, Matériaux, Équipements d'atelier, Manutention & stockage.
14. **Autres annonces** (`autres-annonces`) : Objets divers, Lots, Déstockage, Dons, Autres.

START reste une plateforme généraliste pour particuliers et professionnels. Services, Matériel professionnel, Commerce & Entreprise, Agriculture et BTP & Industrie doivent toutefois bénéficier d'une prise en charge particulièrement visible. La navigation ne montre pas les quatorze catégories simultanément : elle privilégie Véhicules, Immobilier, Emploi, Services, Maison & Jardin, Multimédia, Loisirs, Matériel professionnel et Commerce & Entreprise, puis propose « Toutes les catégories ».

Les sous-catégories doivent être réutilisables dans la recherche, les filtres, le dépôt d'annonce et les futures pages SEO. Toute évolution passe d'abord par `categories.ts`.

## 14. Cartes professionnelles et annonces

`ListingCard.tsx` décrit actuellement une carte avec image, catégorie, titre, localisation, prix, note, avis et favori. Les contrôles interactifs restent séparés : le cœur ne navigue pas et le lien d'avis ouvre l'ancre `#avis` de la fiche.

La cible ne doit cependant pas ressembler à une fiche produit. Une carte professionnelle privilégie, selon son type : catégorie, organisation ou professionnel, métier ou activité, courte description, localisation, compétences ou services, vérification et CTA. La photographie est facultative et peut être remplacée par un avatar, des initiales, un logo ou une icône.

Les variantes métier doivent respecter leur propre hiérarchie :

- **Professionnels** : identité, expertise, services, localisation, confiance, vérification et contact ;
- **Emploi & Missions** : intitulé, organisation, localisation, contrat ou mission, date, compétences et CTA ;
- **Associations & Entraide** : mission, besoin, localisation, domaine d'action et possibilités de participation ;
- **Églises & Communautés** : localisation, activités, informations essentielles, contact et carte lorsque pertinente ;
- **Événements** : date très identifiable, nom, lieu, catégorie, organisateur et informations utiles.

La refonte de ces cartes est une étape d'implémentation ultérieure et ne fait pas partie de la présente mise à jour documentaire.

## 15. Sections institutionnelles et éléments partagés

Vision, À propos, Notre mission, Pourquoi START et Rejoindre le réseau peuvent employer davantage d'espace négatif, de grandes typographies, des chiffres clés, Gold Glow et Network Pattern. Ces pages peuvent être plus expressives que les écrans fonctionnels.

Le header et le footer appartiennent au système partagé et conservent la même identité sur toutes les pages. Le footer peut utiliser le motif réseau à très faible opacité et regrouper navigation, catégories, ressources, newsletter, informations institutionnelles et invitation à rejoindre le réseau.

## 16. Critère de décision visuelle

Avant de valider un composant, se demander : « ressemble-t-il à une plateforme professionnelle de réseau et d'annonces, ou à une boutique ? » S'il évoque une boutique, revoir la hiérarchie, réduire le rôle de la photographie et du prix, puis remettre en avant identité, compétence, contexte et mise en relation.

## 17. Animations et révélation au scroll

Les titres et paragraphes utilisent une révélation progressive lors de leur entrée dans la zone visible. L'animation soutient la lecture et le caractère premium du site sans ralentir l'accès aux informations.

- révélation jouée une seule fois par élément ;
- fondu accompagné d'un déplacement vertical court ;
- durée principale de `950ms` avec `cubic-bezier(0.16, 1, 0.3, 1)` ;
- décalage progressif de `70ms`, limité à cinq niveaux ;
- flou initial très léger uniquement sur ordinateur ;
- mouvement raccourci et flou supprimé sur mobile ;
- affichage immédiat sans transition avec `prefers-reduced-motion: reduce`.

Le système est centralisé dans `Layout.tsx` avec `IntersectionObserver`. Les styles se trouvent dans `src/index.css` via `data-scroll-reveal` et `is-visible`. Ne pas recréer ce mécanisme dans chaque page.

## 18. Responsive des annonces et évaluations

La carte du catalogue, la barre de recherche, les fiches et les avis suivent les règles suivantes :

- grand écran : carte large, barre de recherche en quatre colonnes et fiche en deux colonnes ;
- tablette : barre de recherche en deux colonnes, fiche et profil professionnel empilés ;
- mobile : carte limitée à `340px`, barre en une colonne, boutons pleine largeur et marges latérales réduites ;
- le cartouche de compteur de la carte ne doit jamais recouvrir les contrôles Leaflet ;
- les étoiles peuvent revenir à la ligne et leur taille est réduite sous `640px` ;
- les coordonnées privées et le formulaire d'avis conservent la même règle d'accès sur tous les écrans ;
- les cartes de résultats utilisent un espacement vertical réduit progressivement sur tablette et mobile.

## 19. Rôles et espaces de compte

Le frontend prévoit trois rôles :

- **particulier** : compte gratuit, consultation, favoris, contact des professionnels, notes et commentaires, sans publication ;
- **professionnel** : profil public et gestion des annonces, avec abonnement actif obligatoire pour publier ;
- **administrateur** : supervision des comptes, validations professionnelles, abonnements, annonces, commentaires et signalements.

Les écrans actuels sont des maquettes frontend accessibles sans authentification. Cette accessibilité est volontaire pendant la phase de conception et ne constitue pas une sécurité. Les futures permissions devront être appliquées côté serveur et base de données ; React ne doit servir qu'à présenter l'état autorisé reçu du backend.
