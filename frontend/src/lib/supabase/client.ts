import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

let browserClient: SupabaseClient<Database> | undefined;

export function getSupabaseClient() {
  if (browserClient) return browserClient;

  const env = getSupabaseEnv();
  browserClient = createClient<Database>(env.url, env.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}
