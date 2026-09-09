import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";
import { parseListingPrice } from "../model/listing-creation-schema";
import type { ListingEditValues } from "../model/listing-edit-schema";

export async function updateListing(listingId: string, ownerId: string, values: ListingEditValues, client: SupabaseClient<Database> = getSupabaseClient()) {
  const { data, error } = await client.from("listings").update({
    title: values.title.trim(),
    description: values.description.trim(),
    price: parseListingPrice(values.price),
    price_unit: values.priceUnit,
    country_code: values.countryCode,
    city: values.city.trim(),
    postal_code: values.postalCode.trim() || null,
    subdivision_name: values.subdivisionName.trim() || null,
  }).eq("id", listingId).eq("owner_id", ownerId).select("id,slug").maybeSingle();

  if (error) throw new Error("Impossible d’enregistrer les modifications.", { cause: error });
  if (!data) throw new Error("Annonce introuvable ou modification non autorisée.");
  return data;
}
