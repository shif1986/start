import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";

type SetFavoriteInput = {
  userId: string;
  listingId: string;
  isFavorite: boolean;
};

export async function setFavorite(input: SetFavoriteInput, client: SupabaseClient<Database> = getSupabaseClient()) {
  const result = input.isFavorite
    ? await client.from("favorites").insert({ user_id: input.userId, listing_id: input.listingId })
    : await client.from("favorites").delete().eq("user_id", input.userId).eq("listing_id", input.listingId);

  if (result.error) throw new Error("Impossible de modifier ce favori.", { cause: result.error });
}
