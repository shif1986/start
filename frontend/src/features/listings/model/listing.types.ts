export type Listing = {
  id: string;
  slug?: string;
  title: string;
  category: string;
  categorySlug: string;
  image: string;
  country?: "France" | "Suisse";
  department: string;
  city: string;
  coordinates: [number, number] | null;
  price: number | null;
  currency?: string;
  description: string;
  rating: number | null;
  reviewCount: number;
  professional?: {
    name: string;
    role: string;
    phone: string | null;
    email: string | null;
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
