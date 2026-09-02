import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getOwnerListings } from "./get-owner-listings";

function createClientResult(data: unknown, error: unknown = null) {
  const order = vi.fn().mockResolvedValue({ data, error });
  const eq = vi.fn().mockReturnValue({ order });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  const createSignedUrls = vi.fn().mockResolvedValue({
    data: [{ path: "user/listing/cover.webp", signedUrl: "https://signed.example/cover.webp" }],
    error: null,
  });
  const storageFrom = vi.fn().mockReturnValue({ createSignedUrls });

  return {
    client: { from, storage: { from: storageFrom } } as unknown as SupabaseClient<Database>,
    from,
    select,
    eq,
    order,
  };
}

describe("getOwnerListings", () => {
  it("charge uniquement les annonces du propriétaire avec leur couverture", async () => {
    const query = createClientResult([
      {
        id: "listing-1",
        title: "Service professionnel",
        slug: "service-professionnel",
        status: "draft",
        price: 120,
        price_unit: "hour",
        currency: "EUR",
        city: "Paris",
        created_at: "2026-08-28T12:00:00Z",
        updated_at: "2026-08-28T12:00:00Z",
        published_at: null,
        rejection_reason: null,
        categories: { name: "Services", slug: "services" },
        listing_images: [{ storage_path: "user/listing/cover.webp", position: 0 }],
      },
    ]);

    await expect(getOwnerListings("user-1", query.client)).resolves.toEqual([
      expect.objectContaining({ id: "listing-1", categoryName: "Services", coverImage: "https://signed.example/cover.webp" }),
    ]);
    expect(query.from).toHaveBeenCalledWith("listings");
    expect(query.eq).toHaveBeenCalledWith("owner_id", "user-1");
    expect(query.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("retourne une liste vide sans donnée de démonstration", async () => {
    await expect(getOwnerListings("user-1", createClientResult([]).client)).resolves.toEqual([]);
  });

  it("refuse un propriétaire vide", async () => {
    await expect(getOwnerListings("", createClientResult([]).client)).rejects.toThrow("Utilisateur requis");
  });

  it("transforme une erreur Supabase en erreur métier", async () => {
    await expect(getOwnerListings("user-1", createClientResult(null, { message: "denied" }).client)).rejects.toThrow(
      "Impossible de charger vos annonces",
    );
  });
});
