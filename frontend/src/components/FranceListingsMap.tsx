import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  ZoomControl,
} from "react-leaflet";
import { Link } from "react-router-dom";
import type { LatLngBoundsExpression } from "leaflet";
import type { Listing } from "../data/mockListings";

const franceBounds: LatLngBoundsExpression = [
  [41.1, -5.6],
  [51.5, 10],
];

type MapLocation = {
  city: string;
  department: string;
  coordinates: [number, number];
  listings: Listing[];
};

type FranceListingsMapProps = {
  listings: Listing[];
  selectedDepartment: string;
  onDepartmentSelect: (department: string) => void;
};

function MapViewController({ location }: { location?: MapLocation }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(location.coordinates, 9, { duration: 0.8 });
      return;
    }

    map.fitBounds(franceBounds, { padding: [28, 28] });
  }, [location, map]);

  return null;
}

export default function FranceListingsMap({
  listings,
  selectedDepartment,
  onDepartmentSelect,
}: FranceListingsMapProps) {
  const locations = useMemo<MapLocation[]>(() => {
    const locationsByCity = new Map<string, MapLocation>();

    listings.forEach((listing) => {
      const key = `${listing.city}-${listing.department}`;
      const currentLocation = locationsByCity.get(key);

      if (currentLocation) {
        currentLocation.listings.push(listing);
        return;
      }

      locationsByCity.set(key, {
        city: listing.city,
        department: listing.department,
        coordinates: listing.coordinates,
        listings: [listing],
      });
    });

    return [...locationsByCity.values()];
  }, [listings]);

  const selectedLocation = locations.find(
    (location) => location.department === selectedDepartment,
  );

  return (
    <section
      className="leaflet-map-shell france-map-shell"
      aria-label="Carte interactive des annonces en France"
    >
      <div className="map-summary">
        <span>France</span>
        <strong>{listings.length} annonces disponibles</strong>
      </div>

      <MapContainer
        className="france-leaflet-map"
        bounds={franceBounds}
        minZoom={5}
        maxZoom={14}
        maxBounds={franceBounds}
        maxBoundsViscosity={0.85}
        scrollWheelZoom={false}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />

        <MapViewController location={selectedLocation} />

        {locations.map((location) => {
          const isSelected = location.department === selectedDepartment;

          return (
            <CircleMarker
              key={`${location.city}-${location.department}`}
              center={location.coordinates}
              radius={isSelected ? 13 : 10}
              pathOptions={{
                color: isSelected ? "#f4efe5" : "#111827",
                fillColor: isSelected ? "#d5b66f" : "#c7a45d",
                fillOpacity: 1,
                opacity: 0.9,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onDepartmentSelect(location.department),
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                <strong>{location.city}</strong>
                <span>
                  {location.listings.length} annonce
                  {location.listings.length > 1 ? "s" : ""}
                </span>
              </Tooltip>

              <Popup>
                <div className="map-popup-content">
                  <span>{location.department}</span>
                  <strong>{location.city}</strong>
                  <p>
                    {location.listings.length} annonce
                    {location.listings.length > 1 ? "s" : ""} disponible
                    {location.listings.length > 1 ? "s" : ""}
                  </p>
                  <Link
                    to={`/annonces?department=${encodeURIComponent(location.department)}`}
                  >
                    Voir les annonces
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </section>
  );
}
