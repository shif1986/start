import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getListingDetail } from "./get-listing-detail";

describe("getListingDetail", () => {
  it("charge toutes les relations et signe les images en lot", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [{
        id: "listing-id", owner_id: "owner-id", slug: "service-test", title: "Service test", description: "Description complète",
        price: 120, price_unit: "hour", currency: "EUR", condition: null, country_code: "FR", city: "Paris", subdivision_code: "75", subdivision_name: "Paris",
        latitude: 48.85, longitude: 2.35, status: "published", published_at: "2026-08-28T08:00:00Z",
        category_id: "category-id", category_name: "Services", category_slug: "services",
        images: [{ storage_path: "owner/listing/one.webp", alt_text: "Photo", position: 0, width: 1200, height: 800 }],
        fields: [{ key: "urgent", name: "Intervention urgente", field_type: "boolean", value: true, options: [] }],
        seller_display_name: "Impact Conseil", seller_username: "impact", seller_avatar_url: null, seller_bio: null, seller_city: "Paris",
        seller_is_verified: true, seller_phone: "+33 6 00 00 00 00", seller_email: "contact@example.test", is_favorite: true,
      }],
      error: null,
    });
    const createSignedUrls = vi.fn().mockResolvedValue({ data: [{ path: "owner/listing/one.webp", signedUrl: "https://images.test/one.webp" }], error: null });
    const client = { rpc, storage: { from: vi.fn().mockReturnValue({ createSignedUrls }) } } as unknown as SupabaseClient<Database>;

    const result = await getListingDetail("service-test", client);

    expect(rpc).toHaveBeenCalledWith("get_listing_detail", { listing_slug: "service-test" });
    expect(createSignedUrls).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      slug: "service-test",
      image: "https://images.test/one.webp",
      images: [{ src: "https://images.test/one.webp", altText: "Photo" }],
      priceUnit: "hour",
      details: [{ key: "urgent", label: "Intervention urgente", value: true }],
      professional: { name: "Impact Conseil", phone: "+33 6 00 00 00 00", email: "contact@example.test" },
    });
  });

  it("retourne null pour un slug inconnu", async () => {
    const client = { rpc: vi.fn().mockResolvedValue({ data: [], error: null }) } as unknown as SupabaseClient<Database>;
    await expect(getListingDetail("inconnu", client)).resolves.toBeNull();
  });
});
