import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";
import type { Listing } from "../../listings/model/listing.types";
import { countryName, fallbackListingImage } from "../../listings/api/listing-mapper";
import { signListingImages } from "../../listings/api/sign-listing-images";

type PublicListingRow = Pick<Database["public"]["Tables"]["listings"]["Row"], "id" | "slug" | "title" | "description" | "price" | "currency" | "city" | "country_code" | "subdivision_code" | "subdivision_name" | "latitude" | "longitude" | "is_featured"> & {
  categories: Pick<Database["public"]["Tables"]["categories"]["Row"], "name" | "slug">;
  listing_images: Pick<Database["public"]["Tables"]["listing_images"]["Row"], "storage_path" | "position">[];
};

export type PublicProfessionalProfile = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  isVerified: boolean;
  contacts: { phone: string | null; publicEmail: string | null; postalAddress: string | null } | null;
  listings: Listing[];
};

export async function getPublicProfessionalProfile(username: string, includeContacts: boolean, client: SupabaseClient<Database> = getSupabaseClient()): Promise<PublicProfessionalProfile | null> {
  const profileResult = await client.from("active_professional_profiles")
    .select("id,username,display_name,avatar_url,bio,city,is_verified")
    .eq("username", username)
    .maybeSingle();
  if (profileResult.error) throw new Error("Impossible de charger ce professionnel.", { cause: profileResult.error });
  if (!profileResult.data?.id || !profileResult.data.username || !profileResult.data.display_name) return null;

  const listingResult = await client.from("listings")
    .select("id,slug,title,description,price,currency,city,country_code,subdivision_code,subdivision_name,latitude,longitude,is_featured,categories(name,slug),listing_images(storage_path,position)")
    .eq("owner_id", profileResult.data.id)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (listingResult.error) throw new Error("Impossible de charger les annonces de ce professionnel.", { cause: listingResult.error });

  const rows = (listingResult.data ?? []) as unknown as PublicListingRow[];
  const coverPaths = rows.flatMap((row) => {
    const cover = row.listing_images.toSorted((a, b) => a.position - b.position)[0];
    return cover ? [cover.storage_path] : [];
  });
  const signedImages = await signListingImages(coverPaths, client);

  let contacts: PublicProfessionalProfile["contacts"] = null;
  if (includeContacts) {
    const contactResult = await client.from("profile_contacts").select("phone,public_email,postal_address").eq("profile_id", profileResult.data.id).maybeSingle();
    if (contactResult.error) throw new Error("Impossible de vérifier les coordonnées de ce professionnel.", { cause: contactResult.error });
    if (contactResult.data) contacts = { phone: contactResult.data.phone, publicEmail: contactResult.data.public_email, postalAddress: contactResult.data.postal_address };
  }

  const listings: Listing[] = rows.map((row) => {
    const cover = row.listing_images.toSorted((a, b) => a.position - b.position)[0];
    return {
      id: row.id, slug: row.slug, title: row.title, description: row.description,
      category: row.categories.name, categorySlug: row.categories.slug,
      image: cover ? signedImages.get(cover.storage_path) ?? fallbackListingImage(row.categories.slug) : fallbackListingImage(row.categories.slug),
      country: countryName(row.country_code), department: row.subdivision_name ?? row.subdivision_code ?? row.city,
      city: row.city, coordinates: row.latitude !== null && row.longitude !== null ? [row.latitude, row.longitude] : null,
      price: row.price, currency: row.currency, rating: null, reviewCount: 0, featured: row.is_featured,
    };
  });

  return {
    id: profileResult.data.id,
    username: profileResult.data.username,
    displayName: profileResult.data.display_name,
    avatarUrl: profileResult.data.avatar_url,
    bio: profileResult.data.bio,
    city: profileResult.data.city,
    isVerified: profileResult.data.is_verified ?? false,
    contacts,
    listings,
  };
}
