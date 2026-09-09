import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "../api/admin-dashboard";

export const adminDashboardKey = ["admin", "dashboard"] as const;

export function useAdminDashboard(enabled = true) {
  return useQuery({
    queryKey: adminDashboardKey,
    queryFn: () => getAdminDashboard(),
    enabled,
    staleTime: 15_000,
  });
}
