import type { Database } from "../../../lib/supabase/database.types";

export type SubscriptionPlan = {
  id: string;
  code: string;
  name: string;
  interval: Database["public"]["Enums"]["subscription_interval"];
  priceCents: number;
  currency: string;
};

export type CurrentSubscription = {
  id: string;
  status: Database["public"]["Enums"]["subscription_status"];
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan: Omit<SubscriptionPlan, "id">;
};
