import { useMemo } from "react";
import type { Listing } from "../data/mockListings";
import franceDepartmentsGeoJsonRaw from "../data/franceDepartments.geojson?raw";

type GeoJsonFeature = {
  type: "Feature";
  properties?: {
    nom?: string;
    name?: string;
    code?: string;
    nom_complet?: string;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
};

type GeoJsonResponse = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

type DepartmentMapItem = {
  name: string;
  d: string;
  count: number;
  x: number;
  y: number;
  hasListings: boolean;
};

type FranceListingsMapProps = {
  listings: Listing[];
  selectedDepartment: string;
  onDepartmentSelect: (department: string) => void;
};

const geoJson = JSON.parse(franceDepartmentsGeoJsonRaw) as GeoJsonResponse;

const OVERSEAS_DEPARTMENTS = new Set([
  "Guadeloupe",
  "Martinique",
  "Guyane",
  "La Réunion",
  "Mayotte",
  "Nouvelle-Calédonie",
]);

function getDepartmentName(feature: GeoJsonFeature): string | null {
  const name =
    feature.properties?.nom ??
    feature.properties?.name ??
    feature.properties?.nom_complet ??
    feature.properties?.code ??
    "";

  return name || null;
}

function computeProjectionBounds(features: GeoJsonFeature[]) {
  const lngs: number[] = [];
  const lats: number[] = [];

  features.forEach((feature) => {
    const coordinates =
      feature.geometry.type === "Polygon"
        ? [feature.geometry.coordinates as number[][][]]
        : (feature.geometry.coordinates as number[][][][]);

    coordinates.forEach((polygon) => {
      polygon.forEach((ring) => {
        ring.forEach(([lng, lat]) => {
          lngs.push(lng);
          lats.push(lat);
        });
      });
    });
  });

  if (lngs.length === 0 || lats.length === 0) {
    return null;
  }

  let minLng = Number.POSITIVE_INFINITY;
  let maxLng = Number.NEGATIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;

  for (const lng of lngs) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  for (const lat of lats) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  return { minLng, maxLng, minLat, maxLat };
}

function projectPoint(
  lng: number,
  lat: number,
  bounds: { minLng: number; maxLng: number; minLat: number; maxLat: number },
) {
  const x =
    ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * 1000;
  const y =
    ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat || 1)) * 800;

  return { x, y };
}

function buildDepartmentPath(
  geometry: GeoJsonFeature["geometry"],
  bounds: ReturnType<typeof computeProjectionBounds>,
): string {
  if (!bounds) {
    return "";
  }

  const polygons =
    geometry.type === "Polygon"
      ? [geometry.coordinates as number[][][]]
      : (geometry.coordinates as number[][][][]);

  return polygons
    .map((polygon) =>
      polygon
        .map((ring) => {
          const ringPath = ring
            .map(([lng, lat], index) => {
              const { x, y } = projectPoint(lng, lat, bounds);
              return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
            })
            .join(" ");

          return `${ringPath} Z`;
        })
        .join(" "),
    )
    .join(" ");
}

function computeCentroid(
  geometry: GeoJsonFeature["geometry"],
  bounds: ReturnType<typeof computeProjectionBounds>,
) {
  if (!bounds) {
    return { x: 0, y: 0 };
  }

  const polygons =
    geometry.type === "Polygon"
      ? [geometry.coordinates as number[][][]]
      : (geometry.coordinates as number[][][][]);

  let totalX = 0;
  let totalY = 0;
  let totalWeight = 0;

  polygons.forEach((polygon) => {
    polygon.forEach((ring) => {
      let area = 0;

      for (let i = 0; i < ring.length; i += 1) {
        const [lng1, lat1] = ring[i];
        const [lng2, lat2] = ring[(i + 1) % ring.length];
        area += lng1 * lat2 - lng2 * lat1;
      }

      const signedArea = area / 2;

      if (Math.abs(signedArea) < 1e-8) {
        return;
      }

      for (let i = 0; i < ring.length; i += 1) {
        const [lng1, lat1] = ring[i];
        const [lng2, lat2] = ring[(i + 1) % ring.length];
        const cross = lng1 * lat2 - lng2 * lat1;
        totalX += (lng1 + lng2) * cross;
        totalY += (lat1 + lat2) * cross;
        totalWeight += cross;
      }
    });
  });

  if (Math.abs(totalWeight) < 1e-8) {
    const points: number[][] = [];
    polygons.forEach((polygon) => {
      polygon.forEach((ring) => {
        ring.forEach(([lng, lat]) => points.push([lng, lat]));
      });
    });

    if (points.length === 0) {
      return { x: 0, y: 0 };
    }

    const avgLng = points.reduce((sum, [lng]) => sum + lng, 0) / points.length;
    const avgLat =
      points.reduce((sum, [, lat]) => sum + lat, 0) / points.length;
    return projectPoint(avgLng, avgLat, bounds);
  }

  const centroidLng = totalX / (3 * totalWeight);
  const centroidLat = totalY / (3 * totalWeight);
  return projectPoint(centroidLng, centroidLat, bounds);
}

export default function FranceListingsMap({
  listings,
  selectedDepartment,
  onDepartmentSelect,
}: FranceListingsMapProps) {
  const listingCounts = useMemo(() => {
    const counts = new Map<string, number>();

    listings.forEach((listing) => {
      counts.set(listing.department, (counts.get(listing.department) ?? 0) + 1);
    });

    return counts;
  }, [listings]);

  const departmentMap = useMemo<DepartmentMapItem[]>(() => {
    if (!geoJson) {
      return [];
    }

    const bounds = computeProjectionBounds(geoJson.features);

    if (!bounds) {
      return [];
    }

    return geoJson.features
      .map((feature) => {
        const name = getDepartmentName(feature);

        if (!name || OVERSEAS_DEPARTMENTS.has(name)) {
          return null;
        }

        const d = buildDepartmentPath(feature.geometry, bounds);

        if (!d) {
          return null;
        }

        const { x, y } = computeCentroid(feature.geometry, bounds);
        const count = listingCounts.get(name) ?? 0;

        return {
          name,
          d,
          count,
          x,
          y,
          hasListings: count > 0,
        };
      })
      .filter((item): item is DepartmentMapItem => Boolean(item));
  }, [geoJson, listingCounts]);

  return (
    <section
      className="france-map-shell"
      aria-label="Carte interactive des départements de France"
    >
      <div className="map-summary">
        <span>France</span>
        <strong>{listings.length} annonces disponibles</strong>
      </div>

      <svg
        className="france-departments-svg"
        viewBox="0 0 1000 800"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Carte des départements français"
      >
        {departmentMap.map(({ name, d, count, x, y, hasListings }) => {
          const isSelected = selectedDepartment === name;

          return (
            <g key={name}>
              <path
                d={d}
                className={`department-shape${
                  isSelected ? " selected" : ""
                }${hasListings ? " has-listings" : ""}`}
                onClick={() => onDepartmentSelect(name)}
                style={{
                  fill: isSelected
                    ? "rgba(199, 164, 93, 0.8)"
                    : hasListings
                      ? "rgba(199, 164, 93, 0.18)"
                      : "rgba(244, 239, 229, 0.02)",
                  stroke: "#C7A45D",
                  strokeWidth: isSelected ? 2.1 : 1,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  filter: isSelected
                    ? "drop-shadow(0 0 10px rgba(199, 164, 93, 0.5))"
                    : "none",
                }}
                aria-label={name}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onDepartmentSelect(name);
                  }
                }}
              />

              {count > 0 && (
                <g
                  className="department-counter"
                  onClick={() => onDepartmentSelect(name)}
                  style={{ cursor: "pointer" }}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onDepartmentSelect(name);
                    }
                  }}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 25 : 22}
                    fill="rgba(9, 14, 18, 0.72)"
                    stroke="rgba(199, 164, 93, 0.7)"
                    strokeWidth={isSelected ? 2.2 : 1.5}
                    style={{
                      filter: "drop-shadow(0 0 12px rgba(199, 164, 93, 0.3))",
                    }}
                  />
                  <text
                    x={x}
                    y={y + 6}
                    textAnchor="middle"
                    fill="#F4EFE5"
                    fontSize={isSelected ? 15 : 13}
                    fontWeight={700}
                    fontFamily="Inter, sans-serif"
                  >
                    {count}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </section>
  );
}
