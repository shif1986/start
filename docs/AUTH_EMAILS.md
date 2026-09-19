# E-mails d’authentification Supabase

Les inscriptions par adresse e-mail nécessitent une confirmation Supabase avant l’ouverture d’une session. Le frontend propose un renvoi du message et conserve la destination prévue après confirmation.

## SMTP du projet hébergé

Le projet utilise la boîte Infomaniak de l’organisation :

- expéditeur : `contact@startreseauchretien.com` ;
- nom d’expéditeur : `START Réseau Chrétien` ;
- serveur : `mail.infomaniak.com` ;
- port : `587` avec STARTTLS ;
- identifiant : l’adresse e-mail complète.

Le mot de passe de la boîte est saisi uniquement dans **Supabase Dashboard → Authentication → Emails → SMTP Settings**. Il ne doit jamais être ajouté au dépôt, à une variable `VITE_`, à une capture d’écran ou à un ticket.

Le service SMTP intégré de Supabase est réservé aux essais avec les membres de l’organisation et ne convient pas aux inscriptions publiques. Le SMTP personnalisé doit donc rester actif pour envoyer vers Gmail, Yahoo et les domaines professionnels.

## Vérification

1. Créer un compte avec une adresse externe contrôlée.
2. Vérifier la réception du message, y compris dans les indésirables.
3. Utiliser le lien de confirmation.
4. Vérifier que `/auth/callback` ouvre le bon espace selon le type de compte.
5. Tester **Renvoyer l’e-mail de confirmation** sans dépasser les limites configurées.

En cas d’échec, consulter d’abord **Supabase → Logs → Auth** puis les journaux de la boîte Infomaniak. Ne jamais désactiver durablement la confirmation e-mail pour contourner un défaut de livraison.

Références : [SMTP Supabase](https://supabase.com/docs/guides/auth/auth-smtp) et [configuration SMTP Infomaniak](https://www.infomaniak.com/en/support/faq/2433/configure-the-mail-app-native-android-application-using-imap-email).
