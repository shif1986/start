import { describe, expect, it, vi } from "vitest";
import { geocodeFrenchLocation } from "./geocode-listing-location";

describe("geocodeFrenchLocation", () => {
  it("returns the city centre and department returned by the geocoder", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [{
          geometry: { coordinates: [4.8055, 43.9493] },
          properties: { context: "84, Vaucluse, Provence-Alpes-Côte d’Azur" },
        }],
      }),
    }));

    await expect(geocodeFrenchLocation("Avignon", "84000")).resolves.toEqual({
      latitude: 43.9493,
      longitude: 4.8055,
      subdivisionCode: "84",
      subdivisionName: "Vaucluse",
    });
    expect(fetch).toHaveBeenCalledWith("https://data.geopf.fr/geocodage/search/?q=Avignon+84000&limit=1");
  });

  it("does not fail publication when geocoding is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(geocodeFrenchLocation("Avignon", "")).resolves.toBeNull();
  });
});
