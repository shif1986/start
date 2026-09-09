# START Marketplace

Application React/Vite connectable progressivement à Supabase.

## Démarrage frontend

```bash
bun install
bun run dev
```

Le frontend reste en source statique tant que `VITE_DATA_SOURCE` n'est pas défini à `supabase`. Copier `frontend/.env.example` vers `frontend/.env.local` avant d'activer Supabase.

La procédure d'activation de la connexion Google est décrite dans [docs/GOOGLE_OAUTH.md](docs/GOOGLE_OAUTH.md).

Le pipeline de qualité et la procédure staging/production, secrets, migrations et rollback sont décrits dans [docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md).

Le découpage du bundle, l'optimisation des cartes et la recette Lighthouse sont documentés dans [docs/PERFORMANCE.md](docs/PERFORMANCE.md).

Les règles d'accès aux coordonnées professionnelles sont documentées dans [docs/SECURITE_COORDONNEES_PROFESSIONNELLES.md](docs/SECURITE_COORDONNEES_PROFESSIONNELLES.md).

L'installation de Docker, la configuration de Supabase local et la recette complète sont documentées dans [docs/TESTS_LOCAUX.md](docs/TESTS_LOCAUX.md).

## Validation

```bash
bun run test
bun run typecheck
bun run lint
bun run build
bun run test:e2e
```

## Supabase local

Docker est requis.

```bash
bun run backend:start
bun run backend:reset
bun run backend:test
bun run backend:types
```

Avec npm/npx, consulter [docs/TESTS_LOCAUX.md](docs/TESTS_LOCAUX.md). Toujours exécuter le reset avant les tests après l'ajout d'une migration.
