import { afterEach, describe, expect, it, vi } from "vitest";
import { loadGeoJson, loadHomeMap } from "./geojson";

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

describe("loadHomeMap", () => {
  it("valide les tracés pré-calculés et met la ressource en cache", async () => {
    const payload = [{ name: "Vaucluse", d: "M0 0L1 1L2 0Z", x: 1, y: 2 }];
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(loadHomeMap("/maps/test-home-map.json")).resolves.toEqual(payload);
    await expect(loadHomeMap("/maps/test-home-map.json")).resolves.toEqual(payload);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejette un tracé pré-calculé invalide", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('[{"name":"Vaucluse"}]', { status: 200 })));

    await expect(loadHomeMap("/maps/test-invalid-home-map.json")).rejects.toThrow("invalide");
  });
});
