# START Marketplace

Application React/Vite connectable progressivement à Supabase.

## Démarrage frontend

```bash
bun install
bun run dev
```

Le frontend reste en source statique tant que `VITE_DATA_SOURCE` n'est pas défini à `supabase`. Copier `frontend/.env.example` vers `frontend/.env.local` avant d'activer Supabase.

La procédure d'activation de la connexion Google est décrite dans [docs/GOOGLE_OAUTH.md](docs/GOOGLE_OAUTH.md).

Les règles d'accès aux coordonnées professionnelles sont documentées dans [docs/SECURITE_COORDONNEES_PROFESSIONNELLES.md](docs/SECURITE_COORDONNEES_PROFESSIONNELLES.md).

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
