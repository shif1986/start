import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";

export type CategoryField = {
  id: string;
  key: string;
  name: string;
  fieldType: Database["public"]["Enums"]["field_type"];
  placeholder: string | null;
  helpText: string | null;
  isRequired: boolean;
  validation: Json;
  options: { label: string; value: string }[];
};

export async function getCategoryFields(categoryId: string, client: SupabaseClient<Database> = getSupabaseClient()): Promise<CategoryField[]> {
  if (!categoryId) return [];
  const { data, error } = await client.from("category_fields")
    .select("id,key,name,field_type,placeholder,help_text,is_required,position,validation,category_field_options(label,value,position)")
    .eq("category_id", categoryId)
    .order("position", { ascending: true });
  if (error) throw new Error("Impossible de charger les champs de cette catégorie.", { cause: error });

  return data.map((field) => ({
    id: field.id,
    key: field.key,
    name: field.name,
    fieldType: field.field_type,
    placeholder: field.placeholder,
    helpText: field.help_text,
    isRequired: field.is_required,
    validation: field.validation,
    options: [...field.category_field_options].sort((left, right) => left.position - right.position).map(({ label, value }) => ({ label, value })),
  }));
}
