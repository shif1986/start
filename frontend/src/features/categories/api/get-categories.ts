import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";
import type { CategoryRow } from "../model/category.types";

export async function getCategories(client: SupabaseClient<Database> = getSupabaseClient()): Promise<CategoryRow[]> {
  const { data, error } = await client
    .from("categories")
    .select("id,parent_id,name,slug,icon,description,position,is_active")
    .eq("is_active", true)
    .order("position", { ascending: true });

  if (error) {
    throw new Error("Impossible de charger les catégories.", { cause: error });
  }

  return data;
}
