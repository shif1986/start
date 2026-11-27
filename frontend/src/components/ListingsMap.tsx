import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, Tooltip, ZoomControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { FeatureCollection } from "geojson";
import type { Listing } from "../features/listings/model/listing.types";
import { loadGeoJson, mapDataUrls } from "../features/maps/api/geojson";

const markerColors = ["#4DA3FF", "#FFB33D", "#FF4D4F"] as const;
const franceCenter: [number, number] = [46.7, 3];
const switzerlandCenter: [number, number] = [46.82, 8.23];
type GeoPoint = [number, number];

function normalizeLocation(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/[^a-z0-9]/g, "");
}

function featureCenter(feature: FeatureCollection["features"][number]): [number, number] | null {
  const points: Array<[number, number]> = [];

  function collectCoordinates(value: unknown) {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && typeof value[0] === "number" && typeof value[1] === "number") {
      points.push([value[1], value[0]]);
      return;
    }
    value.forEach(collectCoordinates);
  }

  function collectGeometryCoordinates(value: unknown) {
    if (Array.isArray(value)) {
      collectCoordinates(value);
      return;
    }
    if (value && typeof value === "object") {
      Object.values(value).forEach(collectGeometryCoordinates);
    }
  }

  collectGeometryCoordinates(feature.geometry);
  if (points.length === 0) return null;

  const latitudes = points.map(([latitude]) => latitude);
  const longitudes = points.map(([, longitude]) => longitude);
  return [
    (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
    (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
  ];
}

/**
 * The departments file contains shared borders twice (once per department).
 * Keeping only borders that occur once gives us the France silhouette, while
 * leaving the thin department divisions on the layer underneath.
 */
function franceOutline(source: FeatureCollection): FeatureCollection {
  const edges = new Map<string, { count: number; start: GeoPoint; end: GeoPoint; startKey: string; endKey: string }>();
  const points = new Map<string, GeoPoint>();
  const pointKey = ([longitude, latitude]: GeoPoint) => `${longitude},${latitude}`;
  const edgeKey = (start: string, end: string) => start < end ? `${start}|${end}` : `${end}|${start}`;

  const addRing = (ring: unknown) => {
    if (!Array.isArray(ring)) return;
    for (let index = 0; index < ring.length - 1; index += 1) {
      const start = ring[index] as GeoPoint;
      const end = ring[index + 1] as GeoPoint;
      if (!Array.isArray(start) || !Array.isArray(end)) continue;
      const startKey = pointKey(start);
      const endKey = pointKey(end);
      const key = edgeKey(startKey, endKey);
      const existing = edges.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        edges.set(key, { count: 1, start, end, startKey, endKey });
        points.set(startKey, start);
        points.set(endKey, end);
      }
    }
  };

  source.features.forEach((feature) => {
    const geometry = feature.geometry;
    if (!geometry || (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon")) return;
    const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
    polygons.forEach((polygon) => polygon.forEach(addRing));
  });

  const exteriorEdges = [...edges.values()].filter((edge) => edge.count === 1);
  const neighbours = new Map<string, string[]>();
  exteriorEdges.forEach((edge) => {
    neighbours.set(edge.startKey, [...(neighbours.get(edge.startKey) ?? []), edge.endKey]);
    neighbours.set(edge.endKey, [...(neighbours.get(edge.endKey) ?? []), edge.startKey]);
  });
  const consumed = new Set<string>();
  const paths: GeoPoint[][] = [];

  const follow = (startKey: string, nextKey: string) => {
    const path = [points.get(startKey)!];
    let previousKey = startKey;
    let currentKey = nextKey;
    while (true) {
      const currentEdge = edgeKey(previousKey, currentKey);
      if (consumed.has(currentEdge)) break;
      consumed.add(currentEdge);
      path.push(points.get(currentKey)!);
      const currentNeighbours = neighbours.get(currentKey) ?? [];
      if (currentNeighbours.length !== 2) break;
      const followingKey = currentNeighbours.find((key) => key !== previousKey);
      if (!followingKey || followingKey === startKey) break;
      previousKey = currentKey;
      currentKey = followingKey;
    }
    if (path.length > 1) paths.push(path);
  };

  // Split paths at coast/island junctions, then handle closed islands (Corsica included).
  neighbours.forEach((adjacent, key) => {
    if (adjacent.length !== 2) adjacent.forEach((nextKey) => follow(key, nextKey));
  });
  exteriorEdges.forEach((edge) => {
    if (!consumed.has(edgeKey(edge.startKey, edge.endKey))) follow(edge.startKey, edge.endKey);
  });

  return {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      properties: { name: "Contour de la France" },
      geometry: { type: "MultiLineString", coordinates: paths },
    }],
  };
}

function FitListings({ listings, selectedCountry }: { listings: Listing[]; selectedCountry: string }) {
  const map = useMap();

  useEffect(() => {
    const updateView = () => {
      const isCompact = map.getSize().x < 700;
      if (selectedCountry === "Suisse") {
        map.setView([46.82, 8.23], isCompact ? 7.6 : 8.45, { animate: false });
        return;
      }
      map.setView(
        isCompact ? [46.7, 2.9] : [46.7, 3.8],
        isCompact ? 6.2 : 6.9,
        { animate: false },
      );
    };

    updateView();
    map.on("resize", updateView);
    return () => {
      map.off("resize", updateView);
    };
  }, [listings, map, selectedCountry]);

  return null;
}

export default function ListingsMap({ listings, selectedCountry = "" }: { listings: Listing[]; selectedCountry?: string }) {
  const [franceDepartmentsGeoJson, setFranceDepartmentsGeoJson] = useState<FeatureCollection | null>(null);
  const [switzerlandGeoJson, setSwitzerlandGeoJson] = useState<FeatureCollection | null>(null);
  const [mapDataError, setMapDataError] = useState(false);

  useEffect(() => {
    let isActive = true;

    Promise.all([
      loadGeoJson(mapDataUrls.france),
      loadGeoJson(mapDataUrls.overseas),
      loadGeoJson(mapDataUrls.switzerland),
    ])
      .then(([metropolitan, overseas, switzerland]) => {
        if (!isActive) return;
        setFranceDepartmentsGeoJson({
          type: "FeatureCollection",
          features: [...metropolitan.features, ...overseas.features],
        });
        setSwitzerlandGeoJson(switzerland);
      })
      .catch(() => {
        if (isActive) setMapDataError(true);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const markers = useMemo(() => {
    const franceAreas = new Map<string, [number, number]>();
    franceDepartmentsGeoJson?.features.forEach((feature) => {
      const properties = feature.properties as { code?: unknown; nom?: unknown } | null;
      const center = featureCenter(feature);
      if (!properties || !center) return;
      [properties.code, properties.nom]
        .filter((value): value is string => typeof value === "string")
        .forEach((value) => franceAreas.set(normalizeLocation(value), center));
    });
    const swissCenter = switzerlandGeoJson?.features[0]
      ? featureCenter(switzerlandGeoJson.features[0]) ?? switzerlandCenter
      : switzerlandCenter;
    const points = listings.map((listing) => {
      const isSwiss = listing.country === "Suisse";
      const position = listing.coordinates
        ?? (isSwiss
          ? swissCenter
          : franceAreas.get(normalizeLocation(listing.department)) ?? franceCenter);
      return { listing, position };
    });

    const occurrences = new Map<string, number>();
    const totals = new Map<string, number>();
    points.forEach(({ position }) => {
      const key = position.join(",");
      totals.set(key, (totals.get(key) ?? 0) + 1);
    });

    return points.map(({ listing, position }, index) => {
      const key = position.join(",");
      const occurrence = occurrences.get(key) ?? 0;
      occurrences.set(key, occurrence + 1);
      const total = totals.get(key) ?? 1;
      if (total === 1) return { listing, position, color: markerColors[index % markerColors.length] };

      // Separate adverts published in the same city just enough to make each
      // individual point selectable, while keeping them near that city.
      const angle = (occurrence / total) * Math.PI * 2;
      const distance = 0.035 * (1 + Math.floor(occurrence / 6));
      return {
        listing,
        position: [
          position[0] + Math.sin(angle) * distance,
          position[1] + (Math.cos(angle) * distance) / Math.max(Math.cos(position[0] * Math.PI / 180), 0.25),
        ] as [number, number],
        color: markerColors[index % markerColors.length],
      };
    });
  }, [franceDepartmentsGeoJson, listings, switzerlandGeoJson]);

  const franceOutlineGeoJson = useMemo(
    () => franceDepartmentsGeoJson ? franceOutline(franceDepartmentsGeoJson) : null,
    [franceDepartmentsGeoJson],
  );

  return (
    <section className="listings-map relative overflow-hidden rounded-2xl" aria-label="Carte des annonces disponibles">
      <div className="absolute top-5 left-5 z-[500] rounded-xl bg-[#080c12]/75 px-4 py-3 text-start-cream backdrop-blur-sm [text-shadow:0_1px_4px_rgba(0,0,0,.6)] max-sm:top-3 max-sm:right-14 max-sm:left-3 max-sm:px-3 max-sm:py-2.5">
        <span className="block text-[.65rem] font-bold tracking-[.2em] text-start-gold uppercase">{selectedCountry || "France & Suisse"}</span>
        <strong className="mt-1 block text-sm max-sm:text-xs">{listings.length} annonce{listings.length > 1 ? "s" : ""} sur la carte</strong>
      </div>

      <MapContainer className="relative h-[clamp(520px,68vh,720px)] w-full max-sm:h-[430px]" center={[46.7, 3]} zoom={6} zoomSnap={0.25} minZoom={4} maxZoom={15} scrollWheelZoom zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <FitListings listings={listings} selectedCountry={selectedCountry} />
        {franceDepartmentsGeoJson && <GeoJSON
          data={franceDepartmentsGeoJson}
          interactive={false}
          style={{
            color: "#c7a45d",
            fillColor: "transparent",
            fillOpacity: 0,
            opacity: 0.88,
            weight: 0.95,
          }}
        />}
        {franceOutlineGeoJson && <GeoJSON
          data={franceOutlineGeoJson}
          interactive={false}
          style={{
            color: "#e1b958",
            opacity: 1,
            weight: 3.5,
            lineCap: "round",
            lineJoin: "round",
          }}
        />}
        {switzerlandGeoJson && <GeoJSON
          data={switzerlandGeoJson}
          interactive={false}
          style={{
            color: "#4da3ff",
            fillColor: "#4da3ff",
            fillOpacity: 0.12,
            opacity: 0.95,
            weight: 1.6,
          }}
        />}

        {markers.map(({ position, listing, color }) => {
          return (
            <CircleMarker
              key={listing.id}
              center={position}
              radius={5.5}
              pathOptions={{ color: "#f4efe5", fillColor: color, fillOpacity: 0.94, opacity: 1, weight: 1.4 }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                {listing.city} · {listing.title}
              </Tooltip>
              <Popup minWidth={230}>
                <div className="grid gap-3 text-[#22221e]">
                  <strong>{listing.city} · {listing.department} · {listing.country ?? "France"}</strong>
                  <Link to={`/annonce/${listing.slug ?? listing.id}`} className="border-t border-black/10 pt-2 no-underline">
                    <span className="block text-xs font-semibold text-[#9b762c] uppercase">{listing.category}</span>
                    <span className="mt-1 block font-semibold text-[#22221e]">{listing.title}</span>
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      {!franceDepartmentsGeoJson && !mapDataError && <p className="pointer-events-none absolute right-5 bottom-5 z-[500] rounded-lg bg-[#080c12]/85 px-3 py-2 text-xs text-start-cream/70" role="status">Chargement des limites géographiques…</p>}
      {mapDataError && <p className="absolute right-5 bottom-5 z-[500] rounded-lg border border-network-red/30 bg-[#080c12]/90 px-3 py-2 text-xs text-start-cream" role="alert">Les limites géographiques sont indisponibles. Les annonces restent visibles.</p>}
    </section>
  );
}
