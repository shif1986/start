import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";

export type CreateListingInput = {
  ownerId: string;
  categoryId: string;
  title: string;
  description: string;
  city: string;
  price: number | null;
  priceUnit: "fixed" | "hour" | "day" | "month" | "quote";
};

function listingSlug(title: string) {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "annonce";

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function createListing(input: CreateListingInput, client: SupabaseClient<Database> = getSupabaseClient()) {
  const { data, error } = await client
    .from("listings")
    .insert({
      owner_id: input.ownerId,
      category_id: input.categoryId,
      title: input.title.trim(),
      slug: listingSlug(input.title),
      description: input.description.trim(),
      city: input.city.trim(),
      price: input.price,
      price_unit: input.priceUnit,
      currency: "EUR",
      country_code: "FR",
      status: "pending",
    })
    .select("id,slug")
    .single();

  if (error) throw new Error("Impossible d’enregistrer l’annonce.", { cause: error });
  return data;
}
