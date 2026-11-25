import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";

export async function deleteListing(listingId: string, ownerId: string, client: SupabaseClient<Database> = getSupabaseClient()) {
  const { data: images, error: imagesError } = await client
    .from("listing_images")
    .select("storage_path")
    .eq("listing_id", listingId);
  if (imagesError) throw new Error("Impossible de préparer la suppression de l’annonce.", { cause: imagesError });

  const paths = (images ?? []).map((image) => image.storage_path);
  if (paths.length > 0) {
    const { error: storageError } = await client.storage.from("listing-images").remove(paths);
    if (storageError) throw new Error("Impossible de supprimer les photos de l’annonce.", { cause: storageError });
  }

  const { data, error } = await client
    .from("listings")
    .delete()
    .eq("id", listingId)
    .eq("owner_id", ownerId)
    .select("id")
    .maybeSingle();
  if (error) throw new Error("Impossible de supprimer l’annonce.", { cause: error });
  if (!data) throw new Error("Cette annonce n’existe plus ou ne vous appartient pas.");
}
