# Configuration de Google OAuth avec Supabase

Ce document décrit l'activation de « Continuer avec Google » pour START Marketplace.

## Configuration retenue

Le client OAuth de remplacement créé le 2 septembre 2026 est celui à utiliser pour l'intégration Supabase.

```text
Projet Google : start reseau chretien
Type de client : Application Web
ID client : 595693999747-54p6slhs5edek3823phgpdfhomobcm22.apps.googleusercontent.com
Callback Supabase : https://ybfjjuznkfaftudtysge.supabase.co/auth/v1/callback
```

L'ancien client OAuth ne doit plus être utilisé. Les codes secrets ne sont volontairement pas documentés dans ce dépôt.

État de rotation au 2 septembre 2026 : les deux secrets créés à 10:58:43 et 11:00:32 ont été exposés et doivent être désactivés puis supprimés. Aucun des deux ne doit être renseigné dans Supabase. Il faut créer un nouveau secret après leur suppression et saisir sa valeur directement dans Supabase, sans la partager ni la documenter.

Les suffixes servent uniquement à identifier les secrets dans Google Auth Platform. Les valeurs complètes doivent rester dans Google et Supabase.

## Comptes et responsabilités

Trois comptes distincts interviennent :

- le compte Google Cloud qui possède ou administre le projet OAuth ;
- le compte Supabase qui administre le projet Supabase ;
- le compte administrateur de START Marketplace, dont le rôle `admin` est enregistré dans la base.

Ces comptes peuvent utiliser la même adresse e-mail, mais ce n'est pas obligatoire. Être administrateur Google Cloud ou Supabase ne donne jamais automatiquement le rôle `admin` dans l'application.

Il est recommandé d'utiliser des comptes professionnels contrôlés par l'organisation et de prévoir au moins un second administrateur pour Google Cloud et Supabase.

## 1. Créer le client dans Google Auth Platform

Dans le projet Google Cloud approprié :

1. Ouvrir **Google Auth Platform**.
2. Configurer **Branding** : nom de l'application, adresse d'assistance et domaines autorisés.
3. Dans **Audience**, choisir le type adapté. Pour permettre la connexion de comptes Google extérieurs à l'organisation, utiliser une audience externe.
4. Tant que l'application est en mode test, ajouter explicitement les adresses Google autorisées dans **Utilisateurs de test**.
5. Dans **Accès aux données**, conserver les scopes nécessaires à Supabase : `openid`, adresse e-mail et profil.
6. Dans **Clients**, créer un client de type **Application Web**.

Ajouter les origines JavaScript autorisées :

```text
http://localhost:5173
http://127.0.0.1:5173
https://<domaine-de-production>
```

Ajouter cette URI de redirection autorisée pour le projet Supabase hébergé :

```text
https://ybfjjuznkfaftudtysge.supabase.co/auth/v1/callback
```

Cette URL est le callback de Supabase vers lequel Google renvoie l'utilisateur. Il ne faut pas mettre ici le callback React `/auth/callback` à sa place.

## 2. Protéger le secret OAuth

Le client Google fournit un ID client et un code secret :

- l'ID client peut être copié dans la configuration Supabase ;
- le code secret ne doit jamais être placé dans le frontend, dans une variable `VITE_*`, dans Git, dans une capture d'écran ou dans un message ;
- seul Supabase doit recevoir ce secret.

Si le secret a été affiché dans une capture ou communiqué à un tiers, il faut le considérer comme compromis. Le réinitialiser dans Google Auth Platform ou recréer le client OAuth, puis utiliser uniquement le nouveau secret.

## 3. Activer Google dans Supabase

Dans **Supabase Dashboard → Authentication → Providers → Google** :

1. activer le provider Google ;
2. renseigner l'ID client documenté dans la section **Configuration retenue** ;
3. renseigner le nouveau code secret Google ;
4. enregistrer.

Le secret reste côté Supabase. Il ne doit pas être ajouté à `frontend/.env.local`.

## 4. Autoriser les redirections de l'application

Dans **Supabase Dashboard → Authentication → URL Configuration** :

1. définir **Site URL** avec le domaine réel de production ;
2. ajouter les callbacks utilisés pour le développement et la production dans **Redirect URLs**.

```text
http://localhost:5173/auth/callback
http://127.0.0.1:5173/auth/callback
https://<domaine-de-production>/auth/callback
```

Les URLs de production doivent utiliser HTTPS et correspondre exactement au domaine déployé.

## 5. Tester l'intégration

1. Vérifier que `VITE_DATA_SOURCE=supabase` et que les clés publiques Supabase sont configurées dans le frontend.
2. Si Google est encore en mode test, se connecter avec une adresse déclarée comme utilisateur de test.
3. Ouvrir `/inscription`, puis vérifier que le bouton affiche **Continuer avec Google**.
4. Tester la création d'un compte particulier, la redirection vers `/auth/callback`, puis l'accès à l'espace personnel.
5. Vérifier dans **Supabase → Authentication → Users** que l'utilisateur Google a été créé.

L'application interroge publiquement les réglages Auth Supabase et désactive le bouton tant que le provider Google n'est pas activé.

Le client utilise le flux OAuth PKCE. Après authentification, Supabase renvoie un paramètre temporaire `code` vers `/auth/callback`; l'application l'échange contre une session. Les jetons de session ne doivent donc pas apparaître dans le fragment `#` de l'URL. Le callback OAuth ne contient aucun paramètre applicatif supplémentaire afin de correspondre exactement à l'URL autorisée dans Supabase ; la destination finale est conservée temporairement dans `sessionStorage`.

## 6. Comptes professionnels

Le choix professionnel du parcours Google est finalisé par la fonction SQL sécurisée `complete_google_account_type`. Elle accepte uniquement un utilisateur authentifié avec Google, sur son propre profil nouvellement créé, dans les 30 minutes suivant l'inscription. La modification directe de `account_type` reste interdite au client.

La migration `202609020002_complete_google_account_type.sql` doit être appliquée au projet Supabase avant de tester ce parcours.

Validation effectuée le 2 septembre 2026 : les parcours Google `customer` et `professional` fonctionnent en local sur `http://localhost:5173`. Le compte particulier arrive sur `/espace/particulier`; le compte professionnel est finalisé côté serveur puis arrive sur `/abonnement`.

Pour tester temporairement les droits d'un abonnement sans paiement, utiliser `backend/supabase/scripts/grant_test_subscription.sql` dans SQL Editor. Le script exige l'adresse exacte d'un compte Google professionnel, refuse un abonnement courant préexistant et crée un statut `trialing` valable 24 heures. Il est réservé aux tests et ne doit pas devenir une migration. Après le test, exécuter `backend/supabase/scripts/revoke_test_subscription.sql` afin de passer l'abonnement manuel à `canceled` et de ne pas bloquer une future souscription réelle.

## 7. Supabase local

Pour tester Google avec Supabase CLI local, ajouter une configuration dédiée à `backend/supabase/config.toml` et conserver le secret dans une variable d'environnement non versionnée :

```toml
[auth.external.google]
enabled = true
client_id = "<google-client-id>"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET)"
skip_nonce_check = false
```

Le callback Google local correspondant est :

```text
http://127.0.0.1:54321/auth/v1/callback
```

Cette configuration locale n'est pas nécessaire lorsque le frontend utilise directement le projet Supabase hébergé.
