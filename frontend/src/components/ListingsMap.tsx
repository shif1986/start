import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, Tooltip, ZoomControl, useMap } from "react-leaflet";
import type { FeatureCollection } from "geojson";
import type { Listing } from "../data/mockListings";
import franceDepartmentsGeoJsonRaw from "../data/franceDepartments.geojson?raw";
import overseasDepartmentsGeoJsonRaw from "../data/overseasDepartments.geojson?raw";
import switzerlandGeoJsonRaw from "../data/switzerland.geojson?raw";

const metropolitanDepartments = JSON.parse(franceDepartmentsGeoJsonRaw) as FeatureCollection;
const overseasDepartments = JSON.parse(overseasDepartmentsGeoJsonRaw) as FeatureCollection;
const switzerlandGeoJson = JSON.parse(switzerlandGeoJsonRaw) as FeatureCollection;
const franceDepartmentsGeoJson: FeatureCollection = {
  type: "FeatureCollection",
  features: [...metropolitanDepartments.features, ...overseasDepartments.features],
};
const markerColors = ["#4DA3FF", "#FFB33D", "#FF4D4F"] as const;

function FitListings({ listings, selectedCountry }: { listings: Listing[]; selectedCountry: string }) {
  const map = useMap();

  useEffect(() => {
    const updateView = () => {
      const isCompact = map.getSize().x < 700;
      if (selectedCountry === "Suisse") {
        map.setView([46.82, 8.23], isCompact ? 6.75 : 7.5, { animate: false });
        return;
      }
      map.setView(
        isCompact ? [46.7, 2.4] : [46.7, 3],
        isCompact ? 5.5 : 6,
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
  const groups = useMemo(() => {
    const grouped = new Map<string, Listing[]>();
    listings.forEach((listing) => {
      const key = listing.coordinates.join(",");
      grouped.set(key, [...(grouped.get(key) ?? []), listing]);
    });
    return [...grouped.values()];
  }, [listings]);

  return (
    <section className="listings-map relative overflow-hidden rounded-2xl border border-start-gold/25 bg-[#171a21] shadow-[0_28px_80px_rgba(0,0,0,.28)]" aria-label="Carte des annonces disponibles">
      <div className="absolute top-5 left-5 z-[500] bg-transparent px-4 py-3 text-start-cream opacity-65 [text-shadow:0_1px_4px_rgba(0,0,0,.6)] max-sm:top-3 max-sm:right-14 max-sm:left-3 max-sm:px-3 max-sm:py-2.5">
        <span className="block text-[.65rem] font-bold tracking-[.2em] text-start-gold uppercase">{selectedCountry || "France & Suisse"}</span>
        <strong className="mt-1 block text-sm max-sm:text-xs">{listings.length} annonce{listings.length > 1 ? "s" : ""} sur la carte</strong>
      </div>

      <MapContainer className="h-[clamp(520px,68vh,720px)] w-full max-sm:h-[430px]" center={[46.7, 3]} zoom={6} zoomSnap={0.25} minZoom={4} maxZoom={15} scrollWheelZoom zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="bottomright" />
        <FitListings listings={listings} selectedCountry={selectedCountry} />
        <GeoJSON
          data={franceDepartmentsGeoJson}
          interactive={false}
          style={{
            color: "#c7a45d",
            fillColor: "transparent",
            fillOpacity: 0,
            opacity: 0.88,
            weight: 0.95,
          }}
        />
        <GeoJSON
          data={switzerlandGeoJson}
          interactive={false}
          style={{
            color: "#4da3ff",
            fillColor: "#4da3ff",
            fillOpacity: 0.12,
            opacity: 0.95,
            weight: 1.6,
          }}
        />

        {groups.map((group, index) => {
          const first = group[0];
          const markerColor = markerColors[index % markerColors.length];
          return (
            <CircleMarker
              key={first.coordinates.join(",")}
              center={first.coordinates}
              radius={group.length > 1 ? 15 : 11}
              pathOptions={{ color: "#f4efe5a6", fillColor: markerColor, fillOpacity: 0.76, opacity: 0.8, weight: 1 }}
            >
              <Tooltip permanent direction="center" className="start-map-count">
                {group.length}
              </Tooltip>
              <Popup minWidth={230}>
                <div className="grid gap-3 text-[#22221e]">
                  <strong>{first.city} · {first.department} · {first.country ?? "France"}</strong>
                  {group.map((listing) => (
                    <Link key={listing.id} to={`/annonce/${listing.id}`} className="border-t border-black/10 pt-2 no-underline">
                      <span className="block text-xs font-semibold text-[#9b762c] uppercase">{listing.category}</span>
                      <span className="mt-1 block font-semibold text-[#22221e]">{listing.title}</span>
                    </Link>
                  ))}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </section>
  );
}
