import type { Database } from "../../../lib/supabase/database.types";

export type CurrentProfile = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  role: Database["public"]["Enums"]["user_role"];
  accountType: Database["public"]["Enums"]["account_type"];
  accountStatus: Database["public"]["Enums"]["account_status"];
  isVerified: boolean;
};
