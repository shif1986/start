import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";
import type { CurrentProfile } from "../model/profile.types";

export async function getCurrentProfile(userId: string, client: SupabaseClient<Database> = getSupabaseClient()): Promise<CurrentProfile> {
  const { data, error } = await client
    .from("profiles")
    .select("id,username,display_name,avatar_url,bio,city,role,account_type,is_verified")
    .eq("id", userId)
    .single();

  if (error) throw new Error("Impossible de charger votre profil.", { cause: error });

  return {
    id: data.id,
    username: data.username,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    city: data.city,
    role: data.role,
    accountType: data.account_type,
    isVerified: data.is_verified,
  };
}
