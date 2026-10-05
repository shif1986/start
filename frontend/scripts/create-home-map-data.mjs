import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const inputPath = fileURLToPath(new URL("../public/maps/france-departments.min.geojson", import.meta.url));
const switzerlandInputPath = fileURLToPath(new URL("../public/maps/switzerland.min.geojson", import.meta.url));
const outputPath = fileURLToPath(new URL("../public/maps/france-home-map.min.json", import.meta.url));
const checkOnly = process.argv.includes("--check");
const excludedDepartments = new Set(["Guadeloupe", "Martinique", "Guyane", "La Réunion", "Mayotte", "Nouvelle-Calédonie"]);

function polygons(geometry) {
  return geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
}

function allPoints(features) {
  return features.flatMap((feature) => polygons(feature.geometry).flatMap((polygon) => polygon.flat()));
}

function projectionBounds(features) {
  const points = allPoints(features);
  return {
    minLng: Math.min(...points.map(([lng]) => lng)),
    maxLng: Math.max(...points.map(([lng]) => lng)),
    minLat: Math.min(...points.map(([, lat]) => lat)),
    maxLat: Math.max(...points.map(([, lat]) => lat)),
  };
}

function project([lng, lat], bounds) {
  return [
    ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * 1000,
    ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat || 1)) * 800,
  ];
}

function squaredSegmentDistance(point, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const lengthSquared = dx * dx + dy * dy;
  const position = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1,
    ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / lengthSquared,
  ));
  const errorX = point[0] - start[0] - position * dx;
  const errorY = point[1] - start[1] - position * dy;
  return errorX * errorX + errorY * errorY;
}

function simplify(points, toleranceSquared = 0.25) {
  if (points.length <= 3) return points;
  let index = -1;
  let largestError = toleranceSquared;
  for (let position = 1; position < points.length - 1; position += 1) {
    const error = squaredSegmentDistance(points[position], points[0], points.at(-1));
    if (error > largestError) {
      largestError = error;
      index = position;
    }
  }
  if (index === -1) return [points[0], points.at(-1)];
  return [
    ...simplify(points.slice(0, index + 1), toleranceSquared).slice(0, -1),
    ...simplify(points.slice(index), toleranceSquared),
  ];
}

function geometryPath(geometry, bounds) {
  return polygons(geometry).flatMap((polygon) => polygon.map((ring) => {
    const projected = ring.map((point) => project(point, bounds));
    const simplified = simplify(projected.slice(0, -1));
    if (simplified.length < 3) return "";
    return `M${simplified.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;
  })).filter(Boolean).join("");
}

function centroid(geometry, bounds) {
  let totalX = 0;
  let totalY = 0;
  let totalWeight = 0;
  for (const polygon of polygons(geometry)) {
    for (const ring of polygon) {
      for (let index = 0; index < ring.length; index += 1) {
        const [lng1, lat1] = ring[index];
        const [lng2, lat2] = ring[(index + 1) % ring.length];
        const cross = lng1 * lat2 - lng2 * lat1;
        totalX += (lng1 + lng2) * cross;
        totalY += (lat1 + lat2) * cross;
        totalWeight += cross;
      }
    }
  }
  if (Math.abs(totalWeight) < 1e-8) return { x: 0, y: 0 };
  const [x, y] = project([totalX / (3 * totalWeight), totalY / (3 * totalWeight)], bounds);
  return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
}

const source = JSON.parse(readFileSync(inputPath, "utf8"));
const franceFeatures = source.features.filter((feature) => {
  const name = feature.properties?.nom ?? feature.properties?.name ?? feature.properties?.nom_complet ?? feature.properties?.code;
  return name && !excludedDepartments.has(name);
});
const switzerlandSource = JSON.parse(readFileSync(switzerlandInputPath, "utf8"));
const features = [
  ...franceFeatures.map((feature) => ({ feature, country: "FR" })),
  ...switzerlandSource.features.map((feature) => ({ feature, country: "CH" })),
];
const bounds = projectionBounds(features.map(({ feature }) => feature));
const departments = features.map(({ feature, country }) => {
  const name = feature.properties?.nom ?? feature.properties?.name ?? feature.properties?.nom_complet ?? feature.properties?.code;
  return {
    name: country === "CH" ? "Suisse" : name,
    country,
    d: geometryPath(feature.geometry, bounds),
    ...centroid(feature.geometry, bounds),
  };
});
const serialized = `${JSON.stringify(departments)}\n`;

if (checkOnly) {
  if (readFileSync(outputPath, "utf8") !== serialized) {
    throw new Error("La carte d’accueil doit être régénérée avec npm run maps:home");
  }
} else {
  writeFileSync(outputPath, serialized);
  process.stdout.write(`Carte d’accueil générée : ${(Buffer.byteLength(serialized) / 1024).toFixed(1)} Kio\n`);
}
