# Fonctionnement produit et contrat mobile

Ce document décrit les règles métier effectivement portées par le site START. Il sert de référence pour l’application mobile : les écrans peuvent différer, mais les droits, statuts et appels Supabase ne doivent pas être réinterprétés côté client.

## Principe d’architecture

- Le client web et la future application mobile consomment le même projet Supabase : Auth, PostgreSQL, Storage, RPC et Edge Functions.
- PostgreSQL avec RLS est l’autorité pour les droits. Une règle cachée dans une interface n’est jamais une protection suffisante.
- Stripe Checkout et le portail Stripe restent ouverts dans le navigateur système ou une webview sécurisée. Le mobile ne manipule jamais de montant, de `price_id`, de clé secrète ni d’état d’abonnement local comme source de vérité.
- Les valeurs de `VITE_*` du site sont publiques par nature. Pour le mobile, utiliser uniquement l’URL Supabase et sa clé publishable/anon correspondante ; jamais de `service_role`.

## Rôles et droits

| Acteur | Peut faire | Ne peut pas faire |
| --- | --- | --- |
| Visiteur | consulter catalogue, fiches, profils publics, catégories, pages institutionnelles | voir les coordonnées privées, enregistrer un favori, publier, commenter ou signaler |
| Particulier actif | favoris, avis, signalements, consultation des coordonnées autorisées, tableau de bord | publier une annonce ou souscrire l’offre professionnelle |
| Professionnel actif sans abonnement | gérer son profil, consulter ses annonces existantes et ses favoris/avis | créer ou soumettre une annonce |
| Professionnel avec abonnement `trialing` ou `active` non expiré | mêmes droits, créer/modifier/soumettre une annonce, abonnement et métriques de contacts | se donner des droits de modération |
| Modérateur / administrateur | traiter annonces, profils, avis et signalements | contourner les contrôles serveur ou exposer des données privées dans le client |

Un compte suspendu perd les droits réservés aux membres actifs. Les annonces et profils déjà publiés restent consultables selon les règles de publication, mais les coordonnées professionnelles sont masquées lorsque les conditions d’accès ne sont plus remplies.

## Parcours produit à conserver

1. **Découverte** — l’accueil, les catégories et le catalogue sont publics. Le catalogue filtre par recherche, catégorie, pays, département français ou canton suisse ; ces filtres doivent rester partageables (URL côté web, deep link côté mobile).
2. **Fiche annonce** — elle affiche les informations publiques, la galerie, les avis et le profil professionnel. Le détail est obtenu via `get_listing_detail(slug)`, qui masque les données sensibles côté base.
3. **Inscription et connexion** — e-mail/mot de passe, confirmation, récupération de mot de passe et Google OAuth. À l’issue de Google OAuth, l’utilisateur doit finaliser son type de compte avant d’accéder aux espaces réservés.
4. **Particulier** — il peut gérer favoris et avis, signaler un contenu et contacter un professionnel uniquement si la base lui renvoie les coordonnées autorisées. L’ouverture d’un canal téléphone/e-mail/adresse enregistre un événement de contact via `record_professional_contact`.
5. **Professionnel** — il complète son profil, gère ses annonces et souscrit une formule mensuelle ou annuelle. La base vérifie l’abonnement avant la création ou la soumission ; le mobile doit afficher l’état retourné, pas tenter de le déduire.
6. **Modération** — les listes et décisions de modération passent par les RPC dédiés. Les actions sont tracées dans `moderation_audit_log`.
7. **Don** — le client demande une session de paiement à `create-donation-checkout`; l’état final est confirmé par webhook, puis consulté via `get-donation-status`.

## Contrat Supabase utile au mobile

| Domaine | Accès / opération à réutiliser |
| --- | --- |
| Authentification | Supabase Auth : e-mail, OAuth Google, session et réinitialisation |
| Catalogue | RPC `search_listings_v2` ; pagination et filtres identiques au web |
| Fiche | RPC `get_listing_detail` ; ne jamais reconstruire les règles de visibilité dans l’application |
| Profil | RPC `update_my_profile`, `complete_registration_identity`, `complete_google_account_type` |
| Annonces | tables/RPC contrôlés par RLS, upload Storage `listing-images` avec chemin propriétaire |
| Favoris, avis, signalements | tables contrôlées par RLS et opérations présentes dans `frontend/src/features/` |
| Coordonnées | RPC `can_read_professional_contact`, `record_professional_contact`; aucun cache persistant de téléphone, e-mail ou adresse |
| Abonnement | Edge Functions `create-subscription-checkout`, `confirm-subscription-checkout`, `create-customer-portal` ; table `subscriptions` en source de vérité |
| Dons | Edge Functions `create-donation-checkout`, `get-donation-status` |
| Modération | RPC `moderate_listing`, `moderate_profile`, `moderate_report`, `moderate_review` |

Les types TypeScript produits depuis la base sont dans `frontend/src/lib/supabase/database.types.ts`. À chaque changement de migration, les régénérer avant de modifier web ou mobile afin de garder un contrat commun.

## Règles mobiles non négociables

- Rafraîchir la session et les données de profil au retour de Stripe ou d’OAuth ; ne pas débloquer une fonctionnalité parce que la page de succès a été affichée.
- Stocker les jetons de session dans le stockage sécurisé de la plateforme, jamais dans des préférences non chiffrées ni dans des logs.
- Ouvrir les liens de paiement, e-mail et téléphone avec confirmation explicite. Ne conserver aucune coordonnée privée hors de la session écran.
- Utiliser les mêmes statuts serveur pour les chargements, erreurs, contenus vides et refus d’autorisation ; présenter un message utilisateur sans détail technique ni donnée privée.
- Prévoir les deep links vers une annonce (`/annonce/:slug`), un professionnel (`/professionnel/:username`) et le callback OAuth. Ajouter les URL mobile autorisées dans la configuration Auth Supabase avant publication.
- Tester séparément visiteur, particulier, professionnel sans abonnement, professionnel abonné, modérateur et compte suspendu. Les tests d’interface ne remplacent pas les tests RLS SQL.

## Source du code à reprendre, pas à dupliquer

Le dossier `frontend/src/features/` est organisé par domaine (`auth`, `listings`, `profiles`, `favorites`, `reviews`, `reports`, `subscriptions`, `donations`, `admin`). Les fonctions `api/` et les modèles constituent le meilleur point de départ pour extraire un futur package TypeScript partagé. Les composants et les pages React restent spécifiques au web.

Avant de commencer le mobile, créer un package partagé pour : les types générés Supabase, les schémas Zod, les normaliseurs de filtres, les clients API sans dépendance React et les constantes de statuts. Conserver les hooks React Query et l’interface dans chaque application.
