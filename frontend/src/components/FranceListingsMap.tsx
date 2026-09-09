import { useEffect, useMemo, useState } from "react";
import type { Listing } from "../features/listings/model/listing.types";
import { loadGeoJson, mapDataUrls } from "../features/maps/api/geojson";

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

const OVERSEAS_DEPARTMENTS = new Set([
  "Guadeloupe",
  "Martinique",
  "Guyane",
  "La Réunion",
  "Mayotte",
  "Nouvelle-Calédonie",
]);
const NETWORK_MARKER_COLORS = ["#4DA3FF", "#FFB33D", "#FF4D4F"] as const;

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
  const [geoJson, setGeoJson] = useState<GeoJsonResponse | null>(null);
  const [mapDataError, setMapDataError] = useState(false);

  useEffect(() => {
    let isActive = true;
    loadGeoJson(mapDataUrls.france)
      .then((payload) => {
        if (isActive) setGeoJson(payload as GeoJsonResponse);
      })
      .catch(() => {
        if (isActive) setMapDataError(true);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const listingCounts = useMemo(() => {
    const counts = new Map<string, number>();

    listings.forEach((listing) => {
      counts.set(listing.department, (counts.get(listing.department) ?? 0) + 1);
    });

    return counts;
  }, [listings]);

  const markerColorsByDepartment = useMemo(() => {
    const activeDepartments = [...listingCounts.keys()].sort((first, second) => first.localeCompare(second, "fr"));
    return new Map(
      activeDepartments.map((departmentName, index) => [
        departmentName,
        NETWORK_MARKER_COLORS[index % NETWORK_MARKER_COLORS.length],
      ]),
    );
  }, [listingCounts]);

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
      className="france-listings-map relative overflow-hidden bg-transparent p-2 max-sm:p-0"
      aria-label="Carte interactive des départements de France"
    >
      <div className="france-map-summary absolute top-5 left-5 z-10 flex flex-col bg-transparent px-4 py-3 opacity-65 [text-shadow:0_1px_4px_rgba(0,0,0,.55)] max-sm:top-2 max-sm:left-2 max-sm:px-3 max-sm:py-2">
        <span className="text-xs font-extrabold tracking-[.2em] text-start-gold uppercase max-sm:text-[.6rem]">France</span>
        <strong className="text-sm text-start-cream max-sm:text-xs">{listings.length} annonces disponibles</strong>
      </div>

      {!geoJson && !mapDataError && <div className="absolute inset-0 grid place-items-center" role="status"><span className="size-9 animate-spin rounded-full border-2 border-start-cream/15 border-t-start-gold" aria-hidden="true" /><span className="sr-only">Chargement de la carte</span></div>}
      {mapDataError && <p className="absolute inset-x-8 top-1/2 -translate-y-1/2 rounded-xl border border-network-red/30 bg-[#101318]/90 p-4 text-center text-sm text-start-cream" role="alert">La carte est momentanément indisponible.</p>}

      <svg
        className="block h-auto w-full overflow-visible"
        viewBox="0 0 1000 800"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Carte des départements français"
      >
        {departmentMap.map(({ name, d, hasListings }) => {
          const isSelected = selectedDepartment === name;

          return (
            <path
              key={name}
              d={d}
              className={`cursor-pointer stroke-start-gold outline-none transition-all duration-200 ${isSelected ? "fill-start-gold/80 [filter:drop-shadow(0_0_10px_rgba(199,164,93,.5))]" : hasListings ? "fill-start-gold/20 hover:fill-start-gold/35" : "fill-start-cream/[.02] hover:fill-start-gold/15"}`}
              onClick={() => onDepartmentSelect(name)}
              style={{ strokeWidth: isSelected ? 2.1 : 1 }}
              aria-label={name}
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onDepartmentSelect(name);
                }
              }}
            />
          );
        })}

        {departmentMap.filter(({ count }) => count > 0).map(({ name, count, x, y }) => {
          const isSelected = selectedDepartment === name;
          const markerColor = markerColorsByDepartment.get(name) ?? NETWORK_MARKER_COLORS[0];

          return (
            <g
              key={`marker-${name}`}
              className="cursor-pointer outline-none"
              onClick={() => onDepartmentSelect(name)}
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
                    r={isSelected ? 23 : 20}
                    fill={markerColor}
                    fillOpacity={isSelected ? 0.88 : 0.76}
                    stroke="#F4EFE599"
                    strokeWidth={isSelected ? 1.5 : 0.9}
                    style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,.32))" }}
                  />
                  <text
                    x={x}
                    y={y + 6}
                    textAnchor="middle"
                    fill="#22221E"
                    stroke="#22221E"
                    strokeWidth={0.35}
                    paintOrder="stroke"
                    fontSize={isSelected ? 17 : 15}
                    fontWeight={700}
                    fontFamily="Inter, sans-serif"
                  >
                    {count}
                  </text>
                </g>
          );
        })}
      </svg>
    </section>
  );
}
