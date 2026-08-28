import type { Database } from "../../../lib/supabase/database.types";

export type CategoryRow = Pick<
  Database["public"]["Tables"]["categories"]["Row"],
  "id" | "parent_id" | "name" | "slug" | "icon" | "description" | "position" | "is_active"
>;
