import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = path.resolve(import.meta.dirname, "..");
const checkOnly = process.argv.includes("--check");
const coordinatePrecision = 4;
const simplificationTolerance = 0.0015;
const files = [
  ["franceDepartments.geojson", "france-departments.min.geojson"],
  ["overseasDepartments.geojson", "overseas-departments.min.geojson"],
  ["switzerland.geojson", "switzerland.min.geojson"],
];

function roundCoordinates(value) {
  if (typeof value === "number") {
    return Number(value.toFixed(coordinatePrecision));
  }
  return Array.isArray(value) ? value.map(roundCoordinates) : value;
}

function squaredSegmentDistance(point, start, end) {
  let x = start[0];
  let y = start[1];
  let dx = end[0] - x;
  let dy = end[1] - y;

  if (dx !== 0 || dy !== 0) {
    const position = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);
    if (position > 1) {
      x = end[0];
      y = end[1];
    } else if (position > 0) {
      x += dx * position;
      y += dy * position;
    }
    dx = point[0] - x;
    dy = point[1] - y;
  } else {
    dx = point[0] - x;
    dy = point[1] - y;
  }
  return dx * dx + dy * dy;
}

function simplifyLine(points, tolerance = simplificationTolerance) {
  if (points.length <= 4) return points;
  const squaredTolerance = tolerance * tolerance;
  const markers = new Uint8Array(points.length);
  const stack = [[0, points.length - 1]];
  markers[0] = 1;
  markers[points.length - 1] = 1;

  while (stack.length > 0) {
    const [first, last] = stack.pop();
    let largestDistance = 0;
    let largestIndex = 0;
    for (let index = first + 1; index < last; index += 1) {
      const distance = squaredSegmentDistance(points[index], points[first], points[last]);
      if (distance > largestDistance) {
        largestDistance = distance;
        largestIndex = index;
      }
    }
    if (largestDistance > squaredTolerance) {
      markers[largestIndex] = 1;
      stack.push([first, largestIndex], [largestIndex, last]);
    }
  }
  return points.filter((_, index) => markers[index] === 1);
}

function optimizeRing(ring) {
  const rounded = roundCoordinates(ring);
  const isClosed = rounded.length > 1
    && rounded[0][0] === rounded.at(-1)[0]
    && rounded[0][1] === rounded.at(-1)[1];
  const points = isClosed ? rounded.slice(0, -1) : rounded;
  const simplified = simplifyLine(points);
  if (simplified.length < 3) return rounded;
  return isClosed ? [...simplified, simplified[0]] : simplified;
}

function optimizeGeometry(geometry) {
  const coordinates = geometry.type === "Polygon"
    ? geometry.coordinates.map(optimizeRing)
    : geometry.coordinates.map((polygon) => polygon.map(optimizeRing));
  return { type: geometry.type, coordinates };
}

function usefulProperties(properties = {}) {
  const selected = {};
  for (const key of ["code", "nom", "name", "nom_complet", "NAME", "NAME_FR"]) {
    if (properties[key] !== undefined && properties[key] !== null) selected[key] = properties[key];
  }
  return selected;
}

async function optimize([sourceName, outputName]) {
  const sourcePath = path.join(projectRoot, "src", "data", sourceName);
  const outputPath = path.join(projectRoot, "public", "maps", outputName);
  const source = JSON.parse(await readFile(sourcePath, "utf8"));
  const optimized = {
    type: "FeatureCollection",
    features: source.features.map((feature) => ({
      type: "Feature",
      properties: usefulProperties(feature.properties),
      geometry: optimizeGeometry(feature.geometry),
    })),
  };
  const serialized = `${JSON.stringify(optimized)}\n`;

  if (checkOnly) {
    const current = await readFile(outputPath, "utf8").catch(() => "");
    if (current !== serialized) {
      throw new Error(`${outputName} n'est pas à jour. Lancez npm run maps:optimize.`);
    }
    return;
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, serialized);
  const reduction = 1 - Buffer.byteLength(serialized) / Buffer.byteLength(JSON.stringify(source));
  process.stdout.write(`${outputName}: ${(Buffer.byteLength(serialized) / 1024).toFixed(1)} Kio (${(reduction * 100).toFixed(1)} % économisés)\n`);
}

await Promise.all(files.map(optimize));
if (checkOnly) process.stdout.write("Les fichiers cartographiques optimisés sont à jour.\n");
