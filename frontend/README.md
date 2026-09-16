# Frontend START

Application React 19, TypeScript strict, Vite, Tailwind CSS, React Router, TanStack Query et Supabase JS.

## Démarrage

```bash
npm install
cp .env.example .env.local
npm run dev
```

Utiliser `VITE_DATA_SOURCE=supabase` avec l’URL et la clé publiable Supabase. Ne jamais placer une clé `service_role`, un secret Stripe ou un mot de passe dans une variable `VITE_*`.

## Validation

```bash
npm run test:run
npm run typecheck
npm run lint
npm run build
npm run bundle:check
npm run test:e2e
```

La suite d’intégration réelle exige Supabase local et se lance avec `npm run test:integration`. Voir [le guide de tests](../docs/TESTS_LOCAUX.md).

## Documentation

- [Architecture et règles frontend](../FRONTEND.md)
- [Direction visuelle et responsive](../GUIDE_FRONTEND.md)
- [Performance et Lighthouse](../docs/PERFORMANCE.md)
- [SEO et domaine](../docs/SEO.md)
- [Déploiement](../docs/DEPLOIEMENT.md)
- [Stripe](../docs/STRIPE.md)
