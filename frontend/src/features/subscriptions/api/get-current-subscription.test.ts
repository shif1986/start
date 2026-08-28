import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getCurrentSubscription } from "./get-current-subscription";

function createClientResult(data: unknown, error: unknown = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error });
  const order = vi.fn().mockReturnValue({ maybeSingle });
  const eqUser = vi.fn().mockReturnValue({ order });
  const inStatus = vi.fn().mockReturnValue({ eq: eqUser });
  const select = vi.fn().mockReturnValue({ in: inStatus });
  const from = vi.fn().mockReturnValue({ select });

  return {
    client: { from } as unknown as SupabaseClient<Database>,
    from,
    select,
    inStatus,
    eqUser,
    order,
    maybeSingle,
  };
}

describe("getCurrentSubscription", () => {
  it("retourne l'abonnement actif le plus récent de l'utilisateur", async () => {
    const query = createClientResult({
      id: "subscription-1",
      status: "active",
      current_period_end: "2026-09-28T00:00:00Z",
      cancel_at_period_end: false,
      subscription_plans: { code: "pro_monthly", name: "Pro mensuel", interval: "monthly", price_cents: 700, currency: "EUR" },
    });

    await expect(getCurrentSubscription("user-1", query.client)).resolves.toEqual({
      id: "subscription-1",
      status: "active",
      currentPeriodEnd: "2026-09-28T00:00:00Z",
      cancelAtPeriodEnd: false,
      plan: { code: "pro_monthly", name: "Pro mensuel", interval: "monthly", priceCents: 700, currency: "EUR" },
    });
    expect(query.from).toHaveBeenCalledWith("subscriptions");
    expect(query.inStatus).toHaveBeenCalledWith("status", ["trialing", "active", "past_due"]);
    expect(query.eqUser).toHaveBeenCalledWith("user_id", "user-1");
    expect(query.order).toHaveBeenCalledWith("current_period_end", { ascending: false });
  });

  it("retourne null lorsqu'aucun abonnement n'existe", async () => {
    await expect(getCurrentSubscription("user-1", createClientResult(null).client)).resolves.toBeNull();
  });

  it("refuse un identifiant utilisateur vide", async () => {
    await expect(getCurrentSubscription("", createClientResult(null).client)).rejects.toThrow("Utilisateur requis");
  });

  it("expose une erreur métier en cas d'échec Supabase", async () => {
    await expect(getCurrentSubscription("user-1", createClientResult(null, { message: "denied" }).client)).rejects.toThrow(
      "Impossible de charger votre abonnement",
    );
  });
});
