import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";
import { getListingDetail } from "../../listings/api/get-listing-detail";
import type { Listing } from "../../listings/model/listing.types";

export async function getFavoriteListings(
  userId: string,
  client: SupabaseClient<Database> = getSupabaseClient(),
): Promise<Listing[]> {
  const favoritesResult = await client.from("favorites").select("listing_id").eq("user_id", userId);

  if (favoritesResult.error) {
    throw new Error("Impossible de charger vos favoris.", { cause: favoritesResult.error });
  }

  const listingIds = favoritesResult.data.map((favorite) => favorite.listing_id);
  if (listingIds.length === 0) return [];

  const listingsResult = await client.from("listings").select("id,slug").in("id", listingIds);
  if (listingsResult.error) {
    throw new Error("Impossible de charger vos favoris.", { cause: listingsResult.error });
  }

  const listings = await Promise.all(
    listingsResult.data.map((listing) => getListingDetail(listing.slug, client)),
  );

  return listings.flatMap((listing) => listing ? [{ ...listing, isFavorite: true }] : []);
}
