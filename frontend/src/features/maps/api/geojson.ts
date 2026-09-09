import type { FeatureCollection } from "geojson";

const geoJsonRequests = new Map<string, Promise<FeatureCollection>>();

export const mapDataUrls = {
  france: `${import.meta.env.BASE_URL}maps/france-departments.min.geojson`,
  overseas: `${import.meta.env.BASE_URL}maps/overseas-departments.min.geojson`,
  switzerland: `${import.meta.env.BASE_URL}maps/switzerland.min.geojson`,
} as const;

export function loadGeoJson(url: string): Promise<FeatureCollection> {
  const existingRequest = geoJsonRequests.get(url);
  if (existingRequest) return existingRequest;

  const request = fetch(url, { headers: { Accept: "application/geo+json, application/json" } })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Impossible de charger la carte (${response.status}).`);
      }

      const payload = await response.json() as FeatureCollection;
      if (payload.type !== "FeatureCollection" || !Array.isArray(payload.features)) {
        throw new Error("Le fichier cartographique est invalide.");
      }
      return payload;
    })
    .catch((error: unknown) => {
      geoJsonRequests.delete(url);
      throw error;
    });

  geoJsonRequests.set(url, request);
  return request;
}
