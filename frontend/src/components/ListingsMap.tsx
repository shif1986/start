import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, ZoomControl, useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import type { Listing } from "../data/mockListings";

function FitListings({ listings }: { listings: Listing[] }) {
  const map = useMap();

  useEffect(() => {
    if (listings.length === 0) return;
    const bounds = listings.map((listing) => listing.coordinates) as LatLngBoundsExpression;
    map.fitBounds(bounds, { padding: [16, 16], maxZoom: 8 });
  }, [listings, map]);

  return null;
}

export default function ListingsMap({ listings }: { listings: Listing[] }) {
  const groups = useMemo(() => {
    const grouped = new Map<string, Listing[]>();
    listings.forEach((listing) => {
      const key = listing.coordinates.join(",");
      grouped.set(key, [...(grouped.get(key) ?? []), listing]);
    });
    return [...grouped.values()];
  }, [listings]);

  return (
    <section className="listings-map relative overflow-hidden rounded-2xl border border-start-gold/25 bg-[#0b0d10] shadow-[0_28px_80px_rgba(0,0,0,.28)]" aria-label="Carte des annonces disponibles">
      <div className="absolute top-5 left-5 z-[500] rounded-xl border border-start-cream/15 bg-[#0b0d10]/85 px-4 py-3 text-start-cream shadow-xl backdrop-blur-md max-sm:top-3 max-sm:right-14 max-sm:left-3 max-sm:px-3 max-sm:py-2.5">
        <span className="block text-[.65rem] font-bold tracking-[.2em] text-start-gold uppercase">France</span>
        <strong className="mt-1 block text-sm max-sm:text-xs">{listings.length} annonce{listings.length > 1 ? "s" : ""} sur la carte</strong>
      </div>

      <MapContainer className="h-[clamp(380px,58vh,620px)] w-full max-sm:h-[340px]" center={[46.6034, 1.8883]} zoom={5} minZoom={4} maxZoom={15} scrollWheelZoom zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="bottomright" />
        <FitListings listings={listings} />

        {groups.map((group) => {
          const first = group[0];
          return (
            <CircleMarker
              key={first.coordinates.join(",")}
              center={first.coordinates}
              radius={group.length > 1 ? 16 : 12}
              pathOptions={{ color: "#f4efe5", fillColor: "#d4af37", fillOpacity: 0.95, opacity: 0.9, weight: 2 }}
            >
              <Tooltip permanent direction="center" className="start-map-count">
                {group.length}
              </Tooltip>
              <Popup minWidth={230}>
                <div className="grid gap-3 text-[#22221e]">
                  <strong>{first.city} · {first.department}</strong>
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
