import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";

export async function enableAccountType(accountType: Database["public"]["Enums"]["account_type"], client: SupabaseClient<Database> = getSupabaseClient()) {
  const { error } = await client.rpc("enable_my_account_type", { requested_account_type: accountType });
  if (error) throw new Error("Impossible d’activer cet espace pour le moment.", { cause: error });
}
