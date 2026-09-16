# SEO et indexation

## Métadonnées

Les routes publiques ont un titre, une description, des directives robots et des balises Open Graph/Twitter adaptés. Les espaces privés, l’authentification et les routes inconnues sont en `noindex,nofollow`. Une route inconnue affiche une page 404 applicative explicite.

Les URL canoniques, `og:url` et `og:image` ne sont ajoutées que si le domaine public HTTPS est configuré :

```env
VITE_PUBLIC_SITE_URL=https://startreseauchretien.com
```

Ne pas renseigner cette variable avec une URL locale ou une URL de prévisualisation temporaire. Elle doit être activée uniquement après la configuration DNS et TLS du domaine définitif.

## robots.txt et sitemap

Vite génère toujours un `robots.txt` valide. Lorsque `VITE_PUBLIC_SITE_URL` est défini avec une origine HTTPS valide, le build ajoute aussi :

- la directive `Sitemap` dans `robots.txt` ;
- `sitemap.xml` pour les routes publiques statiques.

Les annonces et profils dynamiques ne sont pas ajoutés au sitemap statique. Leur ajout nécessitera une génération connectée à Supabase ou un rendu serveur.

## Recette avant indexation

Après mise en ligne du domaine :

1. vérifier le certificat HTTPS et les redirections avec et sans `www` ;
2. contrôler `/robots.txt` et `/sitemap.xml` ;
3. vérifier les canoniques sur l’accueil, le catalogue et les pages publiques ;
4. tester un aperçu de partage social ;
5. contrôler les codes HTTP réels : le fallback SPA affiche la page 404, mais le serveur d’hébergement doit également pouvoir répondre avec un statut 404 ;
6. soumettre le sitemap aux outils pour webmasters seulement après ces contrôles.

Le SEO côté navigateur ne remplace pas un pré-rendu ou un rendu serveur pour les robots et services de partage qui n’exécutent pas JavaScript. Cette décision dépendra de l’hébergement retenu.
