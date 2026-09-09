import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";
import type { ProfileFormValues } from "../model/profile-form-schema";

export async function updateMyProfile(values: ProfileFormValues, client: SupabaseClient<Database> = getSupabaseClient()) {
  const { error } = await client.rpc("update_my_profile", {
    p_username: values.username,
    p_display_name: values.displayName,
    p_avatar_url: values.avatarUrl || null,
    p_bio: values.bio || null,
    p_city: values.city || null,
    p_phone: values.phone || null,
    p_public_email: values.publicEmail || null,
    p_postal_address: values.postalAddress || null,
  });

  if (error?.code === "23505") throw new Error("Ce nom d’utilisateur est déjà utilisé.", { cause: error });
  if (error) throw new Error(`Impossible d’enregistrer le profil${error.code ? ` (${error.code})` : ""}.`, { cause: error });
}
