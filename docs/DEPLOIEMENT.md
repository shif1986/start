# Déploiement — START

## Environnements

| Environnement | Branche / déclencheur | Frontend | Supabase |
| --- | --- | --- | --- |
| Local | poste développeur | Vite sur `localhost` | Supabase CLI local |
| Preview | pull request | URL éphémère fournie par l’hébergeur | staging, jamais production |
| Staging | branche `develop` | projet de préproduction | projet Supabase staging |
| Production | branche `main` + validation manuelle | domaine public | projet Supabase production |

Le frontend est une application Vite statique. L’hébergeur doit rediriger les routes inconnues vers `index.html` afin que React Router traite les URLs comme `/annonce/...` et `/admin`.

## Variables frontend

Configurer dans chaque environnement d’hébergement :

- `VITE_DATA_SOURCE=supabase` ;
- `VITE_SUPABASE_URL` ;
- `VITE_SUPABASE_PUBLISHABLE_KEY` ;
- les éventuels endpoints publics documentés dans `frontend/.env.example`.

Une variable préfixée par `VITE_` est intégrée au JavaScript public. Ne jamais y placer de clé `service_role`, secret Stripe, mot de passe de base ou jeton d’accès.

## Secrets GitHub pour les migrations

Créer deux environnements GitHub protégés, `staging` et `production`, puis définir dans chacun :

- `SUPABASE_ACCESS_TOKEN` ;
- `SUPABASE_PROJECT_ID` ;
- `SUPABASE_DB_PASSWORD`.

L’environnement `production` doit exiger une approbation. Le workflow `Déployer les migrations Supabase` est manuel : il affiche d’abord le dry-run, puis applique les migrations versionnées.

## Déroulement recommandé

1. Ouvrir une pull request vers `develop` et attendre les trois jobs de qualité.
2. Déployer le frontend en preview et effectuer la recette ciblée.
3. Fusionner dans `develop`, déployer les migrations vers `staging`, puis le frontend staging.
4. Exécuter la recette de non-régression.
5. Ouvrir une pull request `develop` vers `main`.
6. Après validation, lancer manuellement les migrations `production`, puis déployer le frontend.
7. Exécuter la vérification post-déploiement ci-dessous.

## Vérification post-déploiement

- la page d’accueil, le catalogue et une fiche annonce répondent sans erreur ;
- inscription, connexion, déconnexion et callback OAuth fonctionnent ;
- les routes particulier, professionnel et admin appliquent les bons droits ;
- publication, image, favori, avis et signalement fonctionnent ;
- aucun secret ni message technique sensible n’apparaît dans le navigateur ;
- les erreurs Supabase, webhooks et paiements sont surveillées côté plateforme.

## Rollback

Ne pas modifier ni supprimer une migration déjà appliquée. Pour une erreur applicative, redéployer l’artefact frontend précédent. Pour une erreur de schéma, créer une nouvelle migration corrective, la tester localement et sur staging, puis la déployer avec le même workflow.

Avant une migration destructive, produire une sauvegarde vérifiée et documenter explicitement la restauration. Si la compatibilité entre ancien et nouveau frontend est incertaine, appliquer une stratégie en deux temps : ajout compatible, déploiement du code, puis retrait dans une migration ultérieure.
