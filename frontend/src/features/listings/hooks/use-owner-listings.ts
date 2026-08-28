import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/context/use-auth";
import { getOwnerListings } from "../api/get-owner-listings";
import { listingKeys } from "../model/listing-keys";

export function useOwnerListings(enabled = true) {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  return useQuery({
    queryKey: listingKeys.owner(userId),
    queryFn: () => getOwnerListings(userId),
    enabled: enabled && Boolean(userId),
    staleTime: 30_000,
  });
}
