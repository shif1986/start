export type DataSource = "static" | "supabase";

export function getDataSource(input: Record<string, unknown> = import.meta.env): DataSource {
  return input.VITE_DATA_SOURCE === "supabase" ? "supabase" : "static";
}
