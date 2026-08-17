import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  ZoomControl,
} from "react-leaflet";
import type { Listing } from "../data/mockListings";

type ListingLocationMapProps = {
  listing: Listing;
};

export default function ListingLocationMap({
  listing,
}: ListingLocationMapProps) {
  return (
    <section
      className="my-7 overflow-hidden rounded-2xl border border-start-cream/10 bg-[#080c12]/60"
      aria-label={`Localisation de l’annonce à ${listing.city}`}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <span className="text-xs font-bold tracking-wider text-start-gold uppercase">Localisation</span>
        <strong>
          {listing.city} · {listing.department}
        </strong>
      </div>

      <MapContainer
        key={listing.id}
        className="h-[380px] w-full max-sm:h-[300px]"
        center={listing.coordinates}
        zoom={12}
        minZoom={5}
        maxZoom={16}
        scrollWheelZoom={false}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />

        <CircleMarker
          center={listing.coordinates}
          radius={12}
          pathOptions={{
            color: "#111827",
            fillColor: "#c7a45d",
            fillOpacity: 1,
            opacity: 0.9,
            weight: 3,
          }}
        >
          <Tooltip permanent direction="top" offset={[0, -10]} opacity={1}>
            <strong>{listing.city}</strong>
          </Tooltip>

          <Popup>
            <div className="grid gap-1 text-start-ink">
              <span>{listing.category}</span>
              <strong>{listing.title}</strong>
              <p>
                {listing.city} · {listing.department}
              </p>
            </div>
          </Popup>
        </CircleMarker>
      </MapContainer>
    </section>
  );
}
