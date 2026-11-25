type GeocoderFeature = {
  geometry?: { coordinates?: unknown };
  properties?: { context?: unknown };
};

type GeocoderResponse = { features?: GeocoderFeature[] };

export type GeocodedFrenchLocation = {
  latitude: number;
  longitude: number;
  subdivisionCode: string | null;
  subdivisionName: string | null;
};

const geocodingEndpoint = "https://data.geopf.fr/geocodage/search/";

/**
 * Resolves a city to its public centre point. An imprecise or unavailable
 * geocoding service must never prevent someone from publishing an advert.
 */
export async function geocodeFrenchLocation(city: string, postalCode: string): Promise<GeocodedFrenchLocation | null> {
  const query = [city.trim(), postalCode.trim()].filter(Boolean).join(" ");
  if (!query) return null;

  const parameters = new URLSearchParams({ q: query, limit: "1" });
  const response = await fetch(`${geocodingEndpoint}?${parameters.toString()}`);
  if (!response.ok) return null;

  const payload = await response.json() as GeocoderResponse;
  const feature = payload.features?.[0];
  const coordinates = feature?.geometry?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;

  const [longitude, latitude] = coordinates;
  if (typeof latitude !== "number" || typeof longitude !== "number") return null;

  const context = typeof feature?.properties?.context === "string" ? feature.properties.context : "";
  const [subdivisionCode = "", subdivisionName = ""] = context.split(",").map((part) => part.trim());

  return {
    latitude,
    longitude,
    subdivisionCode: subdivisionCode || null,
    subdivisionName: subdivisionName || null,
  };
}
