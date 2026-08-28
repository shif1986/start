import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";

export async function signListingImages(paths: string[], client: SupabaseClient<Database>) {
  if (paths.length === 0) return new Map<string, string>();

  const { data, error } = await client.storage.from("listing-images").createSignedUrls(paths, 60 * 60);
  if (error) return new Map<string, string>();

  return new Map(data.flatMap((item) => item.signedUrl ? [[item.path, item.signedUrl] as const] : []));
}
