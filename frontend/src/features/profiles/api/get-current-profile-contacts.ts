import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";

export type ProfileContacts = { phone: string; publicEmail: string; postalAddress: string };

export async function getCurrentProfileContacts(userId: string, client: SupabaseClient<Database> = getSupabaseClient()): Promise<ProfileContacts> {
  const { data, error } = await client.from("profile_contacts")
    .select("phone,public_email,postal_address")
    .eq("profile_id", userId)
    .maybeSingle();
  if (error) throw new Error("Impossible de charger vos coordonnées.", { cause: error });
  return { phone: data?.phone ?? "", publicEmail: data?.public_email ?? "", postalAddress: data?.postal_address ?? "" };
}
