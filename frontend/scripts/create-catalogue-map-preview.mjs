import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const mapsDir = fileURLToPath(new URL("../public/maps/", import.meta.url));
const outputPath = fileURLToPath(new URL("../public/maps/catalogue-preview.svg", import.meta.url));
const readMap = (name) => JSON.parse(readFileSync(`${mapsDir}${name}`, "utf8"));

function project([longitude, latitude]) {
  return [((longitude + 6) / 17.5) * 1200, ((52.5 - latitude) / 12) * 650];
}

function distanceToSegment(point, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1,
    ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / lengthSquared,
  ));
  const errorX = point[0] - start[0] - t * dx;
  const errorY = point[1] - start[1] - t * dy;
  return errorX * errorX + errorY * errorY;
}

function simplify(points, toleranceSquared = 3) {
  if (points.length <= 3) return points;
  let index = -1;
  let largestError = toleranceSquared;
  for (let i = 1; i < points.length - 1; i += 1) {
    const error = distanceToSegment(points[i], points[0], points.at(-1));
    if (error > largestError) {
      largestError = error;
      index = i;
    }
  }
  if (index === -1) return [points[0], points.at(-1)];
  return [
    ...simplify(points.slice(0, index + 1), toleranceSquared).slice(0, -1),
    ...simplify(points.slice(index), toleranceSquared),
  ];
}

function geometryPaths(geometry) {
  const polygons = geometry.type === "MultiPolygon" ? geometry.coordinates : [geometry.coordinates];
  return polygons.map((polygon) => {
    const ring = polygon[0].map(project);
    const points = simplify(ring.slice(0, -1));
    if (points.length < 3) return "";
    return `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;
  }).filter(Boolean);
}

const departments = readMap("france-departments.min.geojson").features
  .flatMap((feature) => geometryPaths(feature.geometry))
  .map((path) => `<path d="${path}"/>`).join("");
const switzerland = readMap("switzerland.min.geojson").features
  .flatMap((feature) => geometryPaths(feature.geometry))
  .map((path) => `<path d="${path}"/>`).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 650" preserveAspectRatio="xMidYMid slice">
<defs><radialGradient id="glow"><stop stop-color="#1a2530"/><stop offset="1" stop-color="#0b1016"/></radialGradient></defs>
<rect width="1200" height="650" fill="url(#glow)"/>
<g fill="#131922" stroke="#ad8944" stroke-width="1" stroke-linejoin="round" opacity=".86">${departments}</g>
<g fill="#1b2d3a" stroke="#4da3ff" stroke-width="2" stroke-linejoin="round" opacity=".92">${switzerland}</g>
<text x="500" y="320" fill="#c7a45d" font-family="Arial,sans-serif" font-size="22" letter-spacing="6" opacity=".45">FRANCE</text>
<text x="900" y="395" fill="#4da3ff" font-family="Arial,sans-serif" font-size="15" letter-spacing="3" opacity=".7">SUISSE</text>
</svg>\n`;

if (process.argv.includes("--check")) {
  if (readFileSync(outputPath, "utf8") !== svg) {
    throw new Error("L'aperçu de la carte doit être régénéré avec npm run maps:preview");
  }
} else {
  writeFileSync(outputPath, svg);
  process.stdout.write(`Aperçu de carte généré : ${Buffer.byteLength(svg)} octets\n`);
}
