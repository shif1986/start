import { useQuery } from "@tanstack/react-query";
import { getSubscriptionPlans } from "../api/get-subscription-plans";
import { subscriptionKeys } from "../model/subscription-keys";

export function useSubscriptionPlans(enabled = true) {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: () => getSubscriptionPlans(),
    enabled,
    staleTime: 60 * 60_000,
  });
}
