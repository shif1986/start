import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/context/use-auth";
import { getCurrentSubscription } from "../api/get-current-subscription";
import { subscriptionKeys } from "../model/subscription-keys";

export function useCurrentSubscription(enabled = true) {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  return useQuery({
    queryKey: subscriptionKeys.current(userId),
    queryFn: () => getCurrentSubscription(userId),
    enabled: enabled && Boolean(userId),
    staleTime: 60_000,
  });
}
