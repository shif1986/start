# Performance frontend

## Ce qui est automatisé

- Les pages secondaires sont chargées par route avec `React.lazy` et un état d'attente accessible. L'accueil et le catalogue sont inclus dès le démarrage : leur ancien fallback de 55 vh déplaçait le pied de page pendant le chargement et provoquait un CLS d'environ 0,37.
- Leaflet et les composants cartographiques sont dans des chunks séparés, chargés uniquement sur les pages concernées.
- Les GeoJSON ne sont plus incorporés au JavaScript. Ils sont simplifiés, minifiés et servis depuis `public/maps`.
- Le fond `contact-network` est servi en JPEG optimisé (environ 1,7 Mo en PNG contre 140 Ko en JPEG). Les images de cartes d'annonces et de catégories sous la première vue sont chargées à la demande.
- Les logos utilisés dans la navigation et le pied de page existent en versions de 616 px (environ 20 Ko au lieu de 52 Ko), avec dimensions explicites ; le logo de navigation est préchargé.
- `npm run maps:check` empêche de construire avec des cartes générées obsolètes.
- Le catalogue affiche un aperçu SVG statique de la carte dès le premier rendu ; Leaflet et les tuiles arrivent ensuite sans déplacer la page. `npm run maps:preview:check` bloque une construction si cet aperçu est obsolète.
- `npm run bundle:check` bloque la CI au-delà de 190 Kio gzip pour un chunk ou 500 Kio gzip pour l'ensemble du JavaScript.

Pour régénérer les cartes après une modification des sources :

```bash
cd frontend
npm run maps:optimize
npm run maps:preview
```

## Mesures du bundle

Mesures faites avec une construction Vite de production locale :

| Mesure | Avant | Après |
| --- | ---: | ---: |
| JavaScript total brut | environ 5,72 Mo | 1 018,6 Kio |
| JavaScript total gzip | environ 1,56 Mo | 313,8 Kio |
| Plus gros chunk gzip | bundle unique d'environ 1,56 Mo | 67,5 Kio |
| Données GeoJSON | 4 590,3 Kio dans le bundle | 1 085,5 Kio hors bundle |

Les données cartographiques sont en plus chargées à la demande. La page d'accueil ne télécharge que la métropole ; le catalogue charge les contours lorsqu'il affiche sa carte.

## Recette Lighthouse en cours

Trois passages Lighthouse CLI, Chrome headless, construction de production locale, mobile Slow 4G simulé, le 15 septembre 2026 :

| Route | Performance mobile | LCP mobile | CLS mobile | Performance desktop | CLS desktop |
| --- | ---: | ---: | ---: | ---: | ---: |
| Accueil | 80 (63–83) | 4,0 s (3,8–12,5 s) | ≤ 0,016 | 98 (90–98) | ≤ 0,017 |
| Catalogue | 84 (83–85) | 3,5 s (3,5–3,6 s) | ≤ 0,006 | 98 (92–98) | ≤ 0,003 |

Les valeurs centrales sont des médianes, les parenthèses indiquent le minimum et le maximum. Le catalogue a gagné environ 15 points mobiles après avoir sorti l'aperçu SVG du chargement différé de Leaflet. Le passage de l'accueil à 63 est un résultat aberrant à analyser sur l'hébergement final : l'image du logo a été chargée rapidement dans la trace, mais Lighthouse lui a attribué un LCP de 12,5 s. Il ne faut donc pas annoncer un seuil mobile stable à 80 sur l'accueil. SEO vaut 100 sur les deux routes dans ces mesures locales, sans valider pour autant l'indexation réelle.

Les rapports locaux sont gardés hors Git : ils peuvent contenir des URL de ressources signées. Les scores mobiles et desktop définitifs restent à vérifier sur staging puis sur l'hébergement final.

La configuration `frontend/lighthouserc.json` couvre l'accueil et le catalogue avec trois passages par URL. Après une construction :

```bash
cd frontend
npm run build
npx @lhci/cli autorun
```

La configuration Lighthouse CI écrit ses rapports dans `frontend/lighthouse-reports/`, sans les publier sur un stockage temporaire public. Conserver dans la carte Trello les scores avant/après et un rapport local ou privé. Cette mesure navigateur reste une étape de recette : elle dépend de la machine, du réseau, des tuiles OpenStreetMap et de l'environnement de déploiement. Les tuiles utilisent l'hôte officiel `tile.openstreetmap.org` avec attribution visible ; ne pas lancer de chargement massif ou de préchargement automatisé des tuiles.

Vérifier aussi manuellement : chargement de la carte, sélection d'un département, affichage France/Suisse, marqueurs, fenêtres d'annonce et carte de détail.
