import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";

export async function createReport(input: { reporterId: string; listingId: string; reason: Database["public"]["Enums"]["report_reason"]; details: string }, client: SupabaseClient<Database> = getSupabaseClient()) {
  const { error } = await client.from("reports").insert({ reporter_id: input.reporterId, listing_id: input.listingId, reason: input.reason, details: input.details.trim() });
  if (error?.code === "23505") throw new Error("Vous avez déjà signalé cette annonce.", { cause: error });
  if (error?.code === "42501") throw new Error("Ce signalement n’est pas autorisé pour ce compte ou cette annonce.", { cause: error });
  if (error) throw new Error(`Impossible d’enregistrer le signalement. (${error.code}: ${error.message})`, { cause: error });
}
