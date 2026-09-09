import { afterEach, describe, expect, it, vi } from "vitest";
import { loadGeoJson } from "./geojson";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadGeoJson", () => {
  it("valide le contenu et met en cache une même ressource", async () => {
    const payload = { type: "FeatureCollection", features: [] };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(loadGeoJson("/maps/test-cache.geojson")).resolves.toEqual(payload);
    await expect(loadGeoJson("/maps/test-cache.geojson")).resolves.toEqual(payload);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejette une réponse HTTP en erreur", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 })));

    await expect(loadGeoJson("/maps/test-http-error.geojson")).rejects.toThrow("503");
  });

  it("rejette un document qui n'est pas une collection GeoJSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('{"type":"Point"}', { status: 200 })));

    await expect(loadGeoJson("/maps/test-invalid.geojson")).rejects.toThrow("invalide");
  });
});
