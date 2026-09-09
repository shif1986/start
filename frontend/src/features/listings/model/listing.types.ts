export type Listing = {
  id: string;
  ownerId?: string;
  slug?: string;
  title: string;
  category: string;
  categorySlug: string;
  image: string;
  images?: { src: string; altText: string }[];
  country?: "France" | "Suisse";
  department: string;
  city: string;
  coordinates: [number, number] | null;
  price: number | null;
  priceUnit?: "fixed" | "hour" | "day" | "month" | "quote";
  currency?: string;
  description: string;
  rating: number | null;
  reviewCount: number;
  details?: { key: string; label: string; fieldType: string; value: import("../../../lib/supabase/database.types").Json; options: { label: string; value: string }[] }[];
  professional?: {
    name: string;
    username?: string;
    role: string;
    phone: string | null;
    email: string | null;
    postalAddress?: string | null;
  };
  featured?: boolean;
  isFavorite?: boolean;
};

export type ListingFilters = {
  search: string | null;
  category: string | null;
  countryCode: "FR" | "CH" | null;
  subdivision: string | null;
  page: number;
  pageSize: number;
};

export type ListingsPageData = {
  items: Listing[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type OwnerListing = {
  id: string;
  title: string;
  slug: string;
  status: DatabaseListingStatus;
  price: number | null;
  priceUnit: "fixed" | "hour" | "day" | "month" | "quote";
  currency: string;
  city: string;
  categoryName: string;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  rejectionReason: string | null;
};

export type DatabaseListingStatus = import("../../../lib/supabase/database.types").Database["public"]["Enums"]["listing_status"];
