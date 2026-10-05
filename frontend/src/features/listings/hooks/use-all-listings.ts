import { useQuery } from "@tanstack/react-query";
import { getAllListings } from "../api/get-listings";
import { listingKeys } from "../model/listing-keys";
import type { ListingFilters } from "../model/listing.types";

type MapFilters = Omit<ListingFilters, "page" | "pageSize">;

export function useAllListings(
  filters: MapFilters,
  { enabled = true }: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: listingKeys.map(filters),
    queryFn: () => getAllListings(filters),
    enabled,
  });
}
