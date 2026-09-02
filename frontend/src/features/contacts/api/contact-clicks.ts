import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";

export type ContactChannel = "phone" | "email" | "address";

export async function recordProfessionalContact(listingId: string, channel: ContactChannel, client: SupabaseClient<Database> = getSupabaseClient()) {
  const { error } = await client.rpc("record_professional_contact", { p_listing_id: listingId, p_channel: channel });
  if (error) throw new Error("Impossible d’enregistrer ce clic de contact.", { cause: error });
}

export async function getProfessionalContactCount(userId: string, client: SupabaseClient<Database> = getSupabaseClient()) {
  const { count, error } = await client
    .from("professional_contact_clicks")
    .select("professional_id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw new Error("Impossible de charger les contacts initiés.", { cause: error });
  return count ?? 0;
}
