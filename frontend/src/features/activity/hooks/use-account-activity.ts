import { useQuery } from "@tanstack/react-query";
import { getAccountActivity } from "../api/account-activity";

export function useAccountActivity(userId: string, enabled = true) {
  return useQuery({ queryKey: ["account-activity", userId], queryFn: () => getAccountActivity(userId), enabled: enabled && Boolean(userId), staleTime: 15_000 });
}
