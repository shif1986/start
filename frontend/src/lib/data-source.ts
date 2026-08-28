export type DataSource = "static" | "supabase";

export function getDataSource(input: Record<string, unknown> = import.meta.env): DataSource {
  if (input.VITE_DATA_SOURCE === "static") return "static";
  if (input.VITE_DATA_SOURCE === "supabase") return "supabase";

  const hasSupabaseConfig = Boolean(
    input.VITE_SUPABASE_URL
    && (input.VITE_SUPABASE_ANON_KEY || input.VITE_SUPABASE_PUBLISHABLE_KEY),
  );
  return hasSupabaseConfig ? "supabase" : "static";
}
