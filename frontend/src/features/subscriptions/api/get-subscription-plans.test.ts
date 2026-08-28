import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSubscriptionPlans } from "./get-subscription-plans";

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

describe("getSubscriptionPlans", () => {
  it("charge uniquement les offres actives dans leur ordre d'affichage", async () => {
    const query = createClientResult([
      { id: "plan-1", code: "pro_monthly", name: "Pro mensuel", interval: "monthly", price_cents: 700, currency: "EUR", position: 10 },
    ]);

    await expect(getSubscriptionPlans(query.client)).resolves.toEqual([
      { id: "plan-1", code: "pro_monthly", name: "Pro mensuel", interval: "monthly", priceCents: 700, currency: "EUR" },
    ]);
    expect(query.from).toHaveBeenCalledWith("subscription_plans");
    expect(query.select).toHaveBeenCalledWith("id,code,name,interval,price_cents,currency,position");
    expect(query.eq).toHaveBeenCalledWith("is_active", true);
    expect(query.order).toHaveBeenCalledWith("position", { ascending: true });
  });

  it("ne fabrique aucune offre lorsque le catalogue est vide", async () => {
    await expect(getSubscriptionPlans(createClientResult([]).client)).resolves.toEqual([]);
  });

  it("expose une erreur métier en cas d'échec Supabase", async () => {
    await expect(getSubscriptionPlans(createClientResult(null, { message: "unavailable" }).client)).rejects.toThrow(
      "Impossible de charger les abonnements",
    );
  });
});
