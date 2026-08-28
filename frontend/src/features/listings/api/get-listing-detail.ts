import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";
import type { Listing } from "../model/listing.types";
import { mapDetailListing, parseListingImages } from "./listing-mapper";
import { signListingImages } from "./sign-listing-images";

export async function getListingDetail(slug: string, client: SupabaseClient<Database> = getSupabaseClient()): Promise<Listing | null> {
  const { data, error } = await client.rpc("get_listing_detail", { listing_slug: slug });
  if (error) throw new Error("Impossible de charger cette annonce.", { cause: error });

  const row = data[0];
  if (!row) return null;

  const images = parseListingImages(row.images);
  const signedImages = await signListingImages(images.map((image) => image.storage_path), client);
  return mapDetailListing(row, images.flatMap((image) => {
    const signedImage = signedImages.get(image.storage_path);
    return signedImage ? [signedImage] : [];
  }));
}
