import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getCategories } from "./get-categories";

function createClientResult(data: unknown, error: unknown = null) {
  const order = vi.fn().mockResolvedValue({ data, error });
  const eq = vi.fn().mockReturnValue({ order });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });

  return {
    client: { from } as unknown as SupabaseClient<Database>,
    from,
    select,
    eq,
    order,
  };
}

describe("getCategories", () => {
  it("charge uniquement les catégories actives dans l'ordre", async () => {
    const query = createClientResult([
      { id: "1", parent_id: null, name: "Services", slug: "services", icon: "briefcase", description: null, position: 10, is_active: true },
    ]);

    await expect(getCategories(query.client)).resolves.toHaveLength(1);
    expect(query.from).toHaveBeenCalledWith("categories");
    expect(query.select).toHaveBeenCalledWith("id,parent_id,name,slug,icon,description,position,is_active");
    expect(query.eq).toHaveBeenCalledWith("is_active", true);
    expect(query.order).toHaveBeenCalledWith("position", { ascending: true });
  });

  it("retourne une liste vide sans inventer de données", async () => {
    const query = createClientResult([]);
    await expect(getCategories(query.client)).resolves.toEqual([]);
  });

  it("transforme une erreur Supabase en erreur métier", async () => {
    const query = createClientResult(null, { message: "database unavailable" });
    await expect(getCategories(query.client)).rejects.toThrow("Impossible de charger les catégories");
  });
});
