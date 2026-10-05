import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";
import type { ListingFilters, ListingsPageData } from "../model/listing.types";
import { mapSearchListing } from "./listing-mapper";
import { signListingImages } from "./sign-listing-images";

export async function getListings(filters: ListingFilters, client: SupabaseClient<Database> = getSupabaseClient()): Promise<ListingsPageData> {
  const { data, error } = await client.rpc("search_listings_v2", {
    search_query: filters.search,
    category_slug: filters.category,
    country_filter: filters.countryCode,
    subdivision_filter: filters.subdivision,
    city_query: null,
    min_price: null,
    max_price: null,
    sort_order: "recent",
    page_size: filters.pageSize,
    page_offset: (filters.page - 1) * filters.pageSize,
  });

  if (error) throw new Error("Impossible de charger les annonces.", { cause: error });
  if (data.length === 0) return { items: [], totalCount: 0, page: filters.page, pageSize: filters.pageSize };

  const paths = data.flatMap((row) => row.cover_storage_path ? [row.cover_storage_path] : []);
  const signedImages = await signListingImages(paths, client);

  return {
    items: data.map((row) => mapSearchListing(row, row.cover_storage_path ? signedImages.get(row.cover_storage_path) : undefined)),
    totalCount: Number(data[0].total_count),
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

/**
 * Loads every result matching the supplied filters for maps, which must not be
 * restricted to the listings currently visible in a paginated grid.
 */
export async function getAllListings(
  filters: Omit<ListingFilters, "page" | "pageSize">,
  client: SupabaseClient<Database> = getSupabaseClient(),
): Promise<ListingsPageData["items"]> {
  const pageSize = 100;
  const firstPage = await getListings({ ...filters, page: 1, pageSize }, client);
  const pageCount = Math.ceil(firstPage.totalCount / pageSize);

  if (pageCount <= 1) return firstPage.items;

  const remainingPages = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) =>
      getListings({ ...filters, page: index + 2, pageSize }, client),
    ),
  );

  return [...firstPage.items, ...remainingPages.flatMap((page) => page.items)];
}
