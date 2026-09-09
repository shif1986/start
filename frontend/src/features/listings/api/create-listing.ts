import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";

export type CreateListingInput = {
  ownerId: string;
  categoryId: string;
  title: string;
  description: string;
  city: string;
  countryCode: "FR" | "CH";
  postalCode: string;
  subdivisionCode: string;
  subdivisionName: string;
  price: number | null;
  priceUnit: "fixed" | "hour" | "day" | "month" | "quote";
  phone: string;
  email: string;
  postalAddress: string;
  images: File[];
  fieldValues: { fieldId: string; value: string | number | boolean | string[] }[];
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
      postal_code: input.postalCode.trim() || null,
      subdivision_code: input.subdivisionCode.trim() || null,
      subdivision_name: input.subdivisionName.trim() || null,
      price: input.price,
      price_unit: input.priceUnit,
      currency: "EUR",
      country_code: input.countryCode,
      status: "draft",
    })
    .select("id,slug")
    .single();

  if (error) {
    const detail = import.meta.env.DEV ? ` (${error.code}: ${error.message})` : "";
    throw new Error(`Impossible d’enregistrer l’annonce.${detail}`, { cause: error });
  }

  const uploadedPaths: string[] = [];
  try {
    for (const [position, image] of input.images.entries()) {
      const extension = image.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const storagePath = `${input.ownerId}/${data.id}/${position}-${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await client.storage.from("listing-images").upload(storagePath, image, {
        cacheControl: "3600",
        contentType: image.type,
        upsert: false,
      });
      if (uploadError) throw uploadError;
      uploadedPaths.push(storagePath);
    }

    if (input.fieldValues.length > 0) {
      const { error: fieldValuesError } = await client.from("listing_field_values").insert(input.fieldValues.map((field) => ({
        listing_id: data.id,
        field_id: field.fieldId,
        value: field.value,
      })));
      if (fieldValuesError) throw fieldValuesError;
    }

    if (uploadedPaths.length > 0) {
      const { error: imageRowsError } = await client.from("listing_images").insert(uploadedPaths.map((storagePath, position) => ({
        listing_id: data.id,
        storage_path: storagePath,
        alt_text: `Photo de l’annonce ${input.title.trim()}`.slice(0, 160),
        position,
      })));
      if (imageRowsError) throw imageRowsError;
    }

    const { error: contactError } = await client.from("profile_contacts").upsert({
      profile_id: input.ownerId,
      phone: input.phone.trim(),
      public_email: input.email.trim().toLowerCase(),
      postal_address: input.postalAddress.trim(),
    }, { onConflict: "profile_id" });
    if (contactError) throw contactError;

    const { data: published, error: publishError } = await client.from("listings")
      .update({ status: "published" })
      .eq("id", data.id)
      .eq("owner_id", input.ownerId)
      .eq("status", "draft")
      .select("id,slug")
      .maybeSingle();
    if (publishError || !published) throw publishError ?? new Error("Publication refusée");
  } catch (uploadError) {
    if (uploadedPaths.length > 0) await client.storage.from("listing-images").remove(uploadedPaths);
    await client.from("listings").delete().eq("id", data.id);
    throw new Error("Impossible de publier l’annonce. Aucun enregistrement incomplet n’a été conservé.", { cause: uploadError });
  }

  return data;
}
