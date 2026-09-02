import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/context/use-auth";
import { listingKeys } from "../../listings/model/listing-keys";
import { getFavoriteListings } from "../api/get-favorite-listings";

export function useFavoriteListings(enabled = true) {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  return useQuery({
    queryKey: listingKeys.favorites(userId),
    queryFn: () => getFavoriteListings(userId),
    enabled: enabled && Boolean(userId),
    staleTime: 30_000,
  });
}
