import { useQuery } from "@tanstack/react-query";
import { getListings } from "../api/get-listings";
import { listingKeys } from "../model/listing-keys";
import type { ListingFilters } from "../model/listing.types";

export function useListings(filters: ListingFilters, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: listingKeys.list(filters),
    queryFn: () => getListings(filters),
    enabled,
  });
}
