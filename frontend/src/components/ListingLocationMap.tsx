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
      className="leaflet-map-shell listing-map-shell"
      aria-label={`Localisation de l’annonce à ${listing.city}`}
    >
      <div className="listing-map-heading">
        <span>Localisation</span>
        <strong>
          {listing.city} · {listing.department}
        </strong>
      </div>

      <MapContainer
        key={listing.id}
        className="listing-leaflet-map"
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
            <div className="map-popup-content">
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
