# Stripe — abonnements professionnels

L’intégration utilise Stripe Checkout hébergé, le portail client Stripe et une Edge Function Supabase pour les webhooks. Les montants ne viennent jamais du navigateur : le frontend envoie seulement le code du plan et le serveur le traduit vers un Price Stripe configuré.

## Séparation des environnements

Le projet Supabase de production utilise uniquement les objets Stripe réels. Un second projet Supabase staging utilise uniquement un sandbox Stripe. Les clients, produits, prix, clés et secrets de webhook ne sont pas partagés entre ces deux environnements.

| Élément | Staging | Production |
| --- | --- | --- |
| Frontend | URL Netlify de staging | `https://startreseauchretien.com` |
| Supabase | projet staging | projet production |
| Stripe | sandbox, clés `sk_test_` | mode réel, clé `sk_live_` |
| Origines locales | `ALLOW_LOCAL_ORIGINS=true` | `ALLOW_LOCAL_ORIGINS=false` |

## Configuration Stripe

1. Créer le produit « START Pro » et deux prix récurrents correspondant aux lignes `pro_monthly` (7 EUR/mois) et `pro_yearly` (84 EUR/an) de `subscription_plans`.
2. Activer les moyens de paiement voulus dans Stripe. Checkout affiche Google Pay uniquement lorsque Stripe, le navigateur, l’appareil et le domaine le permettent.
3. Configurer le portail client Stripe pour la mise à jour du paiement et la résiliation.
4. Créer un endpoint webhook vers `https://<project-ref>.supabase.co/functions/v1/stripe-webhook` pour :
   - `checkout.session.completed` ;
   - `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted` ;
   - `invoice.paid`, `invoice.payment_failed`.
5. Définir les secrets depuis `backend/supabase/functions/.env.example` avec `supabase secrets set`, sans jamais les ajouter au frontend ni à Git.

En production, définir exactement :

- `APP_URL=https://startreseauchretien.com` ;
- `APP_URLS=https://startreseauchretien.com,https://www.startreseauchretien.com` ;
- `ALLOW_LOCAL_ORIGINS=false` ;
- `STRIPE_SECRET_KEY` avec une clé réelle `sk_live_` ;
- `STRIPE_WEBHOOK_SECRET` avec le secret du webhook réel ;
- `STRIPE_PRICE_PRO_MONTHLY` et `STRIPE_PRICE_PRO_YEARLY` avec les identifiants des prix réels.

En staging, employer les URL de staging, `ALLOW_LOCAL_ORIGINS=true` et uniquement des clés et objets Stripe de test. Une page locale ne doit jamais appeler le projet Supabase de production pour effectuer un paiement.

Les dons utilisent des `price_data` validées côté fonction : aucun identifiant de prix supplémentaire n’est nécessaire. Les coordonnées bancaires de virement se configurent exclusivement dans le Dashboard Stripe et ne doivent jamais être copiées dans Supabase, Netlify ou Git.

## Passage en production

1. Terminer la vérification du compte Stripe et ajouter le compte bancaire EUR dans **Paramètres → Entreprise → Comptes bancaires et devises**.
2. Créer les prix, le portail et le webhook en mode réel, séparément de leurs versions de test.
3. Configurer les secrets du projet Supabase de production et déployer les cinq fonctions.
4. Vérifier le domaine HTTPS, les URL Auth/OAuth et les variables Netlify avant d’autoriser Checkout.
5. Ne pas simuler une recette avec une vraie carte : le premier débit réel doit correspondre à une véritable souscription ou un véritable don.

La mention « TVA non applicable » repose sur le régime fiscal déclaré par START. Elle doit être confirmée avec la personne chargée de la comptabilité avant l’ouverture des paiements réels.

Le webhook vérifie la signature sur le corps brut, journalise chaque identifiant d’événement et rejoue uniquement les événements qui n’ont pas encore été traités. La table `subscriptions` reste la source de vérité pour le droit de publication.

## Recette

- lancer Checkout avec chaque formule en mode test ;
- vérifier l’activation après le webhook ;
- simuler `invoice.paid` puis `invoice.payment_failed` ;
- planifier puis annuler une résiliation depuis le portail ;
- renvoyer le même événement et vérifier qu’il est marqué comme doublon ;
- vérifier qu’un compte particulier ou suspendu ne peut pas créer de session.

Références : [abonnements Checkout](https://docs.stripe.com/payments/checkout/build-subscriptions), [signatures webhook](https://docs.stripe.com/webhooks/signature), [secrets des Edge Functions](https://supabase.com/docs/guides/functions/secrets).
