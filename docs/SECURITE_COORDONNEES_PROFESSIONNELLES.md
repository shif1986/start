# Sécurité des coordonnées professionnelles

Les coordonnées de contact sont stockées dans `public.profile_contacts`, séparément des données publiques du profil. La sécurité est appliquée dans PostgreSQL avec RLS ; masquer les champs dans l'interface ne constitue pas le contrôle d'accès principal.

## Règles d'accès

- un visiteur anonyme ne peut lire aucune coordonnée ;
- un particulier authentifié et actif peut lire les coordonnées d'un professionnel actif uniquement pendant un abonnement `trialing` ou `active` non expiré ;
- un professionnel actif disposant d'un abonnement peut consulter les coordonnées professionnelles ;
- un professionnel peut toujours consulter ses propres coordonnées tant que son compte est actif ;
- un administrateur conserve l'accès nécessaire à la modération ;
- un compte suspendu ou un particulier expiré n'obtient aucun accès supplémentaire.

Le téléphone, l'adresse électronique et l'adresse postale sont couverts par ces règles. La fonction `public.can_read_professional_contact(uuid)` centralise l'autorisation. Le RPC `public.get_listing_detail(text)` dépend de la même RLS et renvoie des valeurs nulles lorsque le demandeur n'est pas autorisé.

## Suivi des prises de contact

`public.record_professional_contact(uuid, text)` accepte les canaux `phone`, `email` et `address`. Il vérifie que l'utilisateur est un particulier actif, que l'annonce est publiée et que ses coordonnées lui sont accessibles avant d'enregistrer le clic. La table `public.professional_contact_clicks` n'est lisible que par le particulier propriétaire des lignes concernées.

## Migrations requises

Appliquer dans cet ordre :

1. `202608310001_restrict_professional_contacts.sql` ;
2. `202609010001_complete_contact_authorization.sql` ;
3. `202609020001_track_professional_contacts.sql` ;
4. `202609020002_complete_google_account_type.sql`, qui rétablit la protection compatible avec la finalisation des comptes Google professionnels.

## Vérification du déploiement

Dans Supabase SQL Editor, les huit contrôles suivants doivent être vrais : présence de `profile_contacts`, de `postal_address`, activation de RLS, présence des fonctions d'autorisation et d'abonnement, présence de la table et de la fonction de suivi, et présence de la policy `profile_contacts_authorized_read`.

Cette vérification structurelle a été effectuée avec succès sur le projet hébergé le 2 septembre 2026. Les tests de comportement restent disponibles dans `backend/supabase/tests/database/contact_visibility.test.sql`, `authorization_completion.test.sql` et `contact_clicks.test.sql`.

