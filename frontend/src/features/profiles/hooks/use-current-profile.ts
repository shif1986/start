import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/context/use-auth";
import { getCurrentProfile } from "../api/get-current-profile";
import { profileKeys } from "../model/profile-keys";

export function useCurrentProfile() {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  return useQuery({
    queryKey: profileKeys.current(userId),
    queryFn: () => getCurrentProfile(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60_000,
  });
}
