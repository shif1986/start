import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";
import type { ListingEditValues } from "../model/listing-edit-schema";

export type EditableListing = ListingEditValues & { id: string; slug: string; status: Database["public"]["Enums"]["listing_status"] };

export async function getListingForEdit(listingId: string, ownerId: string, client: SupabaseClient<Database> = getSupabaseClient()): Promise<EditableListing> {
  const { data, error } = await client.from("listings")
    .select("id,slug,status,title,description,price,price_unit,country_code,city,postal_code,subdivision_name")
    .eq("id", listingId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) throw new Error("Impossible de charger cette annonce.", { cause: error });
  if (!data) throw new Error("Annonce introuvable ou modification non autorisée.");

  return {
    id: data.id,
    slug: data.slug,
    status: data.status,
    title: data.title,
    description: data.description,
    price: data.price === null ? "" : String(data.price),
    priceUnit: data.price_unit as ListingEditValues["priceUnit"],
    countryCode: data.country_code as ListingEditValues["countryCode"],
    city: data.city,
    postalCode: data.postal_code ?? "",
    subdivisionName: data.subdivision_name ?? "",
  };
}
