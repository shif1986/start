import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";

export async function createReport(input: { reporterId: string; listingId: string; reason: Database["public"]["Enums"]["report_reason"]; details: string }, client: SupabaseClient<Database> = getSupabaseClient()) {
  const profileResult = await client
    .from("profiles")
    .select("account_status")
    .eq("id", input.reporterId)
    .maybeSingle();

  if (!profileResult.error && profileResult.data?.account_status !== "active") {
    throw new Error("Votre compte doit être actif pour signaler une annonce.");
  }

  const listingResult = await client
    .from("listings")
    .select("owner_id,status")
    .eq("id", input.listingId)
    .maybeSingle();

  if (!listingResult.error && !listingResult.data) {
    throw new Error("Cette annonce n’est plus disponible ou publiée.");
  }
  if (listingResult.data?.owner_id === input.reporterId) {
    throw new Error("Vous ne pouvez pas signaler votre propre annonce.");
  }
  if (listingResult.data && listingResult.data.status !== "published") {
    throw new Error("Seules les annonces publiées peuvent être signalées.");
  }

  const { error } = await client.from("reports").insert({ reporter_id: input.reporterId, listing_id: input.listingId, reason: input.reason, details: input.details.trim() });
  if (error?.code === "23505") throw new Error("Vous avez déjà signalé cette annonce.", { cause: error });
  if (error?.code === "42501") throw new Error("Ce signalement n’est pas autorisé pour ce compte ou cette annonce.", { cause: error });
  if (error) throw new Error(`Impossible d’enregistrer le signalement. (${error.code}: ${error.message})`, { cause: error });
}
