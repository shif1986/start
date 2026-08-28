import type { ListingFilters } from "./listing.types";

export const listingKeys = {
  all: ["listings"] as const,
  lists: () => [...listingKeys.all, "list"] as const,
  list: (filters: ListingFilters) => [...listingKeys.lists(), filters] as const,
  details: () => [...listingKeys.all, "detail"] as const,
  detail: (slug: string) => [...listingKeys.details(), slug] as const,
  owner: (userId: string) => [...listingKeys.all, "owner", userId] as const,
};
