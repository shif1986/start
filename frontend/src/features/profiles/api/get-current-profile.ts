import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";
import type { CurrentProfile } from "../model/profile.types";

export async function getCurrentProfile(userId: string, client: SupabaseClient<Database> = getSupabaseClient()): Promise<CurrentProfile> {
  const currentResult = await client
    .from("profiles")
    .select("id,username,display_name,avatar_url,bio,city,role,account_type,account_status,is_verified")
    .eq("id", userId)
    .single();

  if (!currentResult.error) {
    const data = currentResult.data;
    return {
      id: data.id,
      username: data.username,
      displayName: data.display_name,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      city: data.city,
      role: data.role,
      accountType: data.account_type,
      accountStatus: data.account_status,
      isVerified: data.is_verified,
    };
  }

  const isMissingAccountStatus = currentResult.error.code === "42703"
    || currentResult.error.message.includes("account_status");

  if (!isMissingAccountStatus) {
    throw new Error("Impossible de charger votre profil.", { cause: currentResult.error });
  }

  const legacyResult = await client
    .from("profiles")
    .select("id,username,display_name,avatar_url,bio,city,role,account_type,is_verified")
    .eq("id", userId)
    .single();

  if (legacyResult.error) {
    throw new Error("Impossible de charger votre profil.", { cause: legacyResult.error });
  }

  const data = legacyResult.data;
  return {
    id: data.id,
    username: data.username,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    city: data.city,
    role: data.role,
    accountType: data.account_type,
    accountStatus: "active",
    isVerified: data.is_verified,
  };
}
