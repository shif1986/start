# Stripe — abonnements professionnels

L’intégration utilise Stripe Checkout hébergé, le portail client Stripe et une Edge Function Supabase pour les webhooks. Les montants ne viennent jamais du navigateur : le frontend envoie seulement le code du plan et le serveur le traduit vers un Price Stripe configuré.

## Configuration Stripe de test

1. Créer deux prix récurrents Stripe correspondant aux lignes `pro_monthly` et `pro_yearly` de `subscription_plans`.
2. Activer les moyens de paiement voulus dans Stripe. Checkout affiche Google Pay uniquement lorsque Stripe, le navigateur, l’appareil et le domaine le permettent.
3. Configurer le portail client Stripe pour la mise à jour du paiement et la résiliation.
4. Créer un endpoint webhook vers `https://<project-ref>.supabase.co/functions/v1/stripe-webhook` pour :
   - `checkout.session.completed` ;
   - `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted` ;
   - `invoice.paid`, `invoice.payment_failed`.
5. Définir les secrets depuis `backend/supabase/functions/.env.example` avec `supabase secrets set`, sans jamais les ajouter au frontend ni à Git.

Le webhook vérifie la signature sur le corps brut, journalise chaque identifiant d’événement et rejoue uniquement les événements qui n’ont pas encore été traités. La table `subscriptions` reste la source de vérité pour le droit de publication.

## Recette

- lancer Checkout avec chaque formule en mode test ;
- vérifier l’activation après le webhook ;
- simuler `invoice.paid` puis `invoice.payment_failed` ;
- planifier puis annuler une résiliation depuis le portail ;
- renvoyer le même événement et vérifier qu’il est marqué comme doublon ;
- vérifier qu’un compte particulier ou suspendu ne peut pas créer de session.

Références : [abonnements Checkout](https://docs.stripe.com/payments/checkout/build-subscriptions), [signatures webhook](https://docs.stripe.com/webhooks/signature), [secrets des Edge Functions](https://supabase.com/docs/guides/functions/secrets).
