import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";

export async function submitListing(listingId: string, ownerId: string, client: SupabaseClient<Database> = getSupabaseClient()) {
  const { data, error } = await client
    .from("listings")
    .update({ status: "pending" })
    .eq("id", listingId)
    .eq("owner_id", ownerId)
    .eq("status", "draft")
    .select("id,status")
    .maybeSingle();

  if (error) throw new Error("Impossible de soumettre l’annonce à la validation.", { cause: error });
  if (!data) throw new Error("Cette annonce ne peut plus être soumise.");
  return data;
}
