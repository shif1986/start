# Performance frontend

## Ce qui est automatisé

- Chaque page est chargée par route avec `React.lazy` et un état d'attente accessible.
- Leaflet et les composants cartographiques sont dans des chunks séparés, chargés uniquement sur les pages concernées.
- Les GeoJSON ne sont plus incorporés au JavaScript. Ils sont simplifiés, minifiés et servis depuis `public/maps`.
- `npm run maps:check` empêche de construire avec des cartes générées obsolètes.
- `npm run bundle:check` bloque la CI au-delà de 190 Kio gzip pour un chunk ou 500 Kio gzip pour l'ensemble du JavaScript.

Pour régénérer les cartes après une modification des sources :

```bash
cd frontend
npm run maps:optimize
```

## Mesures du bundle

Mesures faites avec la construction Vite de production du 9 septembre 2026 :

| Mesure | Avant | Après |
| --- | ---: | ---: |
| JavaScript total brut | environ 5,72 Mo | 1 018,6 Kio |
| JavaScript total gzip | environ 1,56 Mo | 318,1 Kio |
| Plus gros chunk gzip | bundle unique d'environ 1,56 Mo | 67,5 Kio |
| Données GeoJSON | 4 590,3 Kio dans le bundle | 1 085,5 Kio hors bundle |

Les données cartographiques sont en plus chargées à la demande. La page d'accueil ne télécharge que la métropole ; le catalogue charge les contours lorsqu'il affiche sa carte.

## Recette Lighthouse à effectuer

La configuration `frontend/lighthouserc.json` couvre l'accueil et le catalogue avec trois passages par URL. Après une construction :

```bash
cd frontend
npm run build
npx @lhci/cli autorun
```

Conserver dans la carte Trello les scores mobile et desktop avant/après, ainsi que le lien vers le rapport. Cette mesure navigateur reste une étape de recette : elle dépend de la machine, du réseau, des tuiles OpenStreetMap et de l'environnement de déploiement.

Vérifier aussi manuellement : chargement de la carte, sélection d'un département, affichage France/Suisse, marqueurs, fenêtres d'annonce et carte de détail.
