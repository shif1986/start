import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";
import type { SubscriptionPlan } from "../model/subscription.types";

export async function getSubscriptionPlans(client: SupabaseClient<Database> = getSupabaseClient()): Promise<SubscriptionPlan[]> {
  const { data, error } = await client
    .from("subscription_plans")
    .select("id,code,name,interval,price_cents,currency,position")
    .eq("is_active", true)
    .order("position", { ascending: true });

  if (error) {
    throw new Error("Impossible de charger les abonnements.", { cause: error });
  }

  return data.map((plan) => ({
    id: plan.id,
    code: plan.code,
    name: plan.name,
    interval: plan.interval,
    priceCents: plan.price_cents,
    currency: plan.currency,
  }));
}
