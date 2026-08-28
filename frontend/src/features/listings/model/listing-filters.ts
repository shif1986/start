import type { ListingFilters } from "./listing.types";

type RawListingFilters = {
  search: string;
  category: string;
  country: string;
  subdivision: string;
  page: number;
  pageSize: number;
};

function optionalValue(value: string) {
  const normalized = value.trim();
  return normalized || null;
}

export function normalizeListingFilters(filters: RawListingFilters): ListingFilters {
  return {
    search: optionalValue(filters.search),
    category: optionalValue(filters.category),
    countryCode: filters.country === "Suisse" ? "CH" : filters.country === "France" ? "FR" : null,
    subdivision: optionalValue(filters.subdivision),
    page: Math.max(1, Math.trunc(filters.page) || 1),
    pageSize: Math.min(100, Math.max(1, Math.trunc(filters.pageSize) || 1)),
  };
}
