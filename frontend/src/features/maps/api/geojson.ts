import type { FeatureCollection } from "geojson";

const geoJsonRequests = new Map<string, Promise<FeatureCollection>>();

export type HomeMapDepartment = {
  name: string;
  d: string;
  x: number;
  y: number;
};

const homeMapRequests = new Map<string, Promise<HomeMapDepartment[]>>();

export const mapDataUrls = {
  france: `${import.meta.env.BASE_URL}maps/france-departments.min.geojson`,
  franceHome: `${import.meta.env.BASE_URL}maps/france-home-map.min.json`,
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

export function loadHomeMap(url: string = mapDataUrls.franceHome): Promise<HomeMapDepartment[]> {
  const existingRequest = homeMapRequests.get(url);
  if (existingRequest) return existingRequest;
  const request = fetch(url, { headers: { Accept: "application/json" } })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Impossible de charger la carte (${response.status}).`);
      const payload = await response.json() as HomeMapDepartment[];
      if (!Array.isArray(payload) || payload.some((item) => !item.name || !item.d || !Number.isFinite(item.x) || !Number.isFinite(item.y))) {
        throw new Error("Le fichier de la carte d’accueil est invalide.");
      }
      return payload;
    })
    .catch((error: unknown) => {
      homeMapRequests.delete(url);
      throw error;
    });
  homeMapRequests.set(url, request);
  return request;
}
