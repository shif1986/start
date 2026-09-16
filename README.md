# START Marketplace

Marketplace React/Vite reliée à Supabase : authentification, comptes particuliers/professionnels, annonces, abonnements Stripe, dons, avis, favoris, signalements et modération.

## Démarrage frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

`VITE_DATA_SOURCE=supabase` active la source réelle. Le mode `static` reste réservé aux démonstrations locales et ne constitue jamais une autorisation.

La procédure d'activation de la connexion Google est décrite dans [docs/GOOGLE_OAUTH.md](docs/GOOGLE_OAUTH.md).

Le pipeline de qualité et la procédure staging/production, secrets, migrations et rollback sont décrits dans [docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md).

Le découpage du bundle, l'optimisation des cartes et la recette Lighthouse sont documentés dans [docs/PERFORMANCE.md](docs/PERFORMANCE.md).

Les métadonnées, la page 404, `robots.txt`, le sitemap et la configuration du domaine sont documentés dans [docs/SEO.md](docs/SEO.md).

La recette post-déploiement, les alertes, sauvegardes et incidents sont documentés dans [docs/EXPLOITATION.md](docs/EXPLOITATION.md).

Les règles d'accès aux coordonnées professionnelles sont documentées dans [docs/SECURITE_COORDONNEES_PROFESSIONNELLES.md](docs/SECURITE_COORDONNEES_PROFESSIONNELLES.md).

L'installation de Docker, la configuration de Supabase local et la recette complète sont documentées dans [docs/TESTS_LOCAUX.md](docs/TESTS_LOCAUX.md).

## Validation

```bash
cd frontend
npm run test:run
npm run typecheck
npm run lint
npm run build
npm run bundle:check
npm run test:e2e
```

## Supabase local

Docker est requis.

```bash
npx supabase start --workdir backend
npx supabase db reset --workdir backend
npx supabase test db --workdir backend
```

Consulter [docs/TESTS_LOCAUX.md](docs/TESTS_LOCAUX.md). Toujours exécuter le reset avant les tests après l'ajout d'une migration.
