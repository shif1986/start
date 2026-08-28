import { getCategoryBySlug } from "../../../data/categories";
import type { Database, Json } from "../../../lib/supabase/database.types";
import type { Listing } from "../model/listing.types";

type SearchListingRow = Database["public"]["Functions"]["search_listings_v2"]["Returns"][number];
type DetailListingRow = Database["public"]["Functions"]["get_listing_detail"]["Returns"][number];

export type ListingImageRow = {
  storage_path: string;
  alt_text: string | null;
  position: number;
  width: number | null;
  height: number | null;
};

export function countryName(countryCode: string): "France" | "Suisse" {
  return countryCode === "CH" ? "Suisse" : "France";
}

export function fallbackListingImage(categorySlug: string) {
  return getCategoryBySlug(categorySlug)?.image ?? "/images/categories/entraide.webp";
}

export function mapSearchListing(row: SearchListingRow, signedImage?: string): Listing {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category_name,
    categorySlug: row.category_slug,
    image: signedImage ?? fallbackListingImage(row.category_slug),
    country: countryName(row.country_code),
    department: row.subdivision_name ?? row.subdivision_code ?? row.city,
    city: row.city,
    coordinates: row.latitude !== null && row.longitude !== null ? [row.latitude, row.longitude] : null,
    price: row.price,
    currency: row.currency,
    description: row.description,
    rating: null,
    reviewCount: 0,
    featured: row.is_featured,
    isFavorite: row.is_favorite,
  };
}

export function parseListingImages(value: Json): ListingImageRow[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item) || typeof item.storage_path !== "string") return [];
    return [{
      storage_path: item.storage_path,
      alt_text: typeof item.alt_text === "string" ? item.alt_text : null,
      position: typeof item.position === "number" ? item.position : 0,
      width: typeof item.width === "number" ? item.width : null,
      height: typeof item.height === "number" ? item.height : null,
    }];
  });
}

export function mapDetailListing(row: DetailListingRow, signedImages: string[]): Listing {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category_name,
    categorySlug: row.category_slug,
    image: signedImages[0] ?? fallbackListingImage(row.category_slug),
    country: countryName(row.country_code),
    department: row.subdivision_name ?? row.subdivision_code ?? row.city,
    city: row.city,
    coordinates: row.latitude !== null && row.longitude !== null ? [row.latitude, row.longitude] : null,
    price: row.price,
    currency: row.currency,
    description: row.description,
    rating: null,
    reviewCount: 0,
    professional: {
      name: row.seller_display_name,
      role: row.seller_is_verified ? "Professionnel vérifié" : "Professionnel",
      phone: row.seller_phone,
      email: row.seller_email,
    },
    isFavorite: row.is_favorite,
  };
}
