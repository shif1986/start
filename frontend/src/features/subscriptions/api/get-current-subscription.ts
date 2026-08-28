import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";
import type { CurrentSubscription } from "../model/subscription.types";

type SubscriptionResult = Database["public"]["Tables"]["subscriptions"]["Row"] & {
  subscription_plans: Pick<Database["public"]["Tables"]["subscription_plans"]["Row"], "code" | "name" | "interval" | "price_cents" | "currency">;
};

export async function getCurrentSubscription(
  userId: string,
  client: SupabaseClient<Database> = getSupabaseClient(),
): Promise<CurrentSubscription | null> {
  if (!userId) throw new Error("Utilisateur requis pour charger l’abonnement.");

  const { data, error } = await client
    .from("subscriptions")
    .select("id,status,current_period_end,cancel_at_period_end,subscription_plans(code,name,interval,price_cents,currency)")
    .in("status", ["trialing", "active", "past_due"])
    .eq("user_id", userId)
    .order("current_period_end", { ascending: false })
    .maybeSingle();

  if (error) {
    throw new Error("Impossible de charger votre abonnement.", { cause: error });
  }
  if (!data) return null;

  const subscription = data as unknown as SubscriptionResult;
  return {
    id: subscription.id,
    status: subscription.status,
    currentPeriodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    plan: {
      code: subscription.subscription_plans.code,
      name: subscription.subscription_plans.name,
      interval: subscription.subscription_plans.interval,
      priceCents: subscription.subscription_plans.price_cents,
      currency: subscription.subscription_plans.currency,
    },
  };
}
