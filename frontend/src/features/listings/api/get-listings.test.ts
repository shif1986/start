import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getListings } from "./get-listings";

describe("getListings", () => {
  it("charge une page puis signe les images en un seul lot", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [{
        id: "listing-id", slug: "service-test", title: "Service test", description: "Description",
        price: 120, currency: "EUR", city: "Paris", subdivision_code: "75", subdivision_name: "Paris",
        country_code: "FR", latitude: 48.85, longitude: 2.35, condition: null, published_at: "2026-08-28T08:00:00Z",
        is_featured: false, category_name: "Services", category_slug: "services", cover_storage_path: "owner/listing/image.webp",
        is_favorite: false, total_count: 7,
      }],
      error: null,
    });
    const createSignedUrls = vi.fn().mockResolvedValue({
      data: [{ path: "owner/listing/image.webp", signedUrl: "https://images.test/signed.webp" }],
      error: null,
    });
    const from = vi.fn().mockReturnValue({ createSignedUrls });
    const client = { rpc, storage: { from } } as unknown as SupabaseClient<Database>;

    const result = await getListings({ search: null, category: null, countryCode: "FR", subdivision: null, page: 2, pageSize: 4 }, client);

    expect(rpc).toHaveBeenCalledWith("search_listings_v2", expect.objectContaining({ page_offset: 4, page_size: 4, country_filter: "FR" }));
    expect(createSignedUrls).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ totalCount: 7, page: 2, pageSize: 4 });
    expect(result.items[0]).toMatchObject({ slug: "service-test", image: "https://images.test/signed.webp", department: "Paris" });
  });

  it("retourne une page vide sans requête Storage", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
    const from = vi.fn();
    const client = { rpc, storage: { from } } as unknown as SupabaseClient<Database>;

    await expect(getListings({ search: null, category: null, countryCode: null, subdivision: null, page: 1, pageSize: 4 }, client)).resolves.toEqual({ items: [], totalCount: 0, page: 1, pageSize: 4 });
    expect(from).not.toHaveBeenCalled();
  });

  it("retourne une erreur métier lorsque la RPC échoue", async () => {
    const client = { rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "failure" } }) } as unknown as SupabaseClient<Database>;
    await expect(getListings({ search: null, category: null, countryCode: null, subdivision: null, page: 1, pageSize: 4 }, client)).rejects.toThrow("Impossible de charger les annonces");
  });
});
