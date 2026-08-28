import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";
import type { OwnerListing } from "../model/listing.types";
import { signListingImages } from "./sign-listing-images";

type OwnerListingResult = Pick<Database["public"]["Tables"]["listings"]["Row"],
  "id" | "title" | "slug" | "status" | "price" | "currency" | "city" | "created_at" | "updated_at" | "published_at" | "rejection_reason"
> & {
  categories: Pick<Database["public"]["Tables"]["categories"]["Row"], "name" | "slug">;
  listing_images: Pick<Database["public"]["Tables"]["listing_images"]["Row"], "storage_path" | "position">[];
};

export async function getOwnerListings(
  userId: string,
  client: SupabaseClient<Database> = getSupabaseClient(),
): Promise<OwnerListing[]> {
  if (!userId) throw new Error("Utilisateur requis pour charger les annonces.");

  const { data, error } = await client
    .from("listings")
    .select("id,title,slug,status,price,currency,city,created_at,updated_at,published_at,rejection_reason,categories(name,slug),listing_images(storage_path,position)")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Impossible de charger vos annonces.", { cause: error });
  if (data.length === 0) return [];

  const rows = data as unknown as OwnerListingResult[];
  const coverPaths = rows.flatMap((row) => {
    const cover = row.listing_images.toSorted((left, right) => left.position - right.position)[0];
    return cover ? [cover.storage_path] : [];
  });
  const signedImages = await signListingImages(coverPaths, client);

  return rows.map((row) => {
    const cover = row.listing_images.toSorted((left, right) => left.position - right.position)[0];
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      status: row.status,
      price: row.price,
      currency: row.currency,
      city: row.city,
      categoryName: row.categories.name,
      coverImage: cover ? signedImages.get(cover.storage_path) ?? null : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishedAt: row.published_at,
      rejectionReason: row.rejection_reason,
    };
  });
}
