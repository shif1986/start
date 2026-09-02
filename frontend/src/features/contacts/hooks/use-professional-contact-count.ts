import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/context/use-auth";
import { getProfessionalContactCount } from "../api/contact-clicks";

export const professionalContactCountKey = (userId: string) => ["professional-contact-count", userId] as const;

export function useProfessionalContactCount(enabled = true) {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  return useQuery({
    queryKey: professionalContactCountKey(userId),
    queryFn: () => getProfessionalContactCount(userId),
    enabled: enabled && Boolean(userId),
    staleTime: 30_000,
  });
}

