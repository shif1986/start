# Dons Stripe

Les dons ponctuels et mensuels passent par Stripe Checkout. Le serveur valide une contribution comprise entre 1 € et 10 000 €, la fréquence, l’identité, l’e-mail et le consentement. Le navigateur ne transmet aucune donnée bancaire et n’annonce jamais un succès sur la seule base du retour Stripe.

Le webhook signé met à jour `donations` et crée une ligne idempotente dans `donation_payments` pour chaque versement confirmé. L’URL de reçu Stripe, lorsqu’elle est disponible, est conservée pour permettre son envoi ou sa consultation par une future interface administrative.

Les données sont réservées au traitement du don, à la comptabilité, aux obligations légales et à la gestion des reçus. Leur accès direct est refusé aux rôles `anon` et `authenticated`. La durée légale de conservation comptable doit être confirmée avec le responsable de traitement avant la mise en production.

Événements Stripe à ajouter au webhook en plus des abonnements : `checkout.session.completed`, `checkout.session.expired`, `invoice.paid`, `invoice.payment_failed` et `customer.subscription.deleted`.
