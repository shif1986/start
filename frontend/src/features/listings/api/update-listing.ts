import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";
import { geocodeFrenchLocation } from "../../maps/api/geocode-listing-location";
import { parseListingPrice } from "../model/listing-creation-schema";
import type { ListingEditValues } from "../model/listing-edit-schema";

export async function updateListing(listingId: string, ownerId: string, values: ListingEditValues, client: SupabaseClient<Database> = getSupabaseClient()) {
  const location = values.countryCode === "FR"
    ? await geocodeFrenchLocation(values.city, values.postalCode).catch(() => null)
    : null;

  const { data, error } = await client.from("listings").update({
    title: values.title.trim(),
    description: values.description.trim(),
    price: parseListingPrice(values.price),
    price_unit: values.priceUnit,
    country_code: values.countryCode,
    city: values.city.trim(),
    postal_code: values.postalCode.trim() || null,
    subdivision_name: location?.subdivisionName ?? (values.subdivisionName.trim() || null),
    ...(location ? {
      subdivision_code: location.subdivisionCode,
      latitude: location.latitude,
      longitude: location.longitude,
    } : values.countryCode === "FR" ? {
      latitude: null,
      longitude: null,
    } : {}),
  }).eq("id", listingId).eq("owner_id", ownerId).select("id,slug").maybeSingle();

  if (error) throw new Error("Impossible d’enregistrer les modifications.", { cause: error });
  if (!data) throw new Error("Annonce introuvable ou modification non autorisée.");
  return data;
}
