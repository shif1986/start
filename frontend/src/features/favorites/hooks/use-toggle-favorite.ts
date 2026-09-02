import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useAuth } from "../../auth/context/use-auth";
import { listingKeys } from "../../listings/model/listing-keys";
import type { Listing, ListingsPageData } from "../../listings/model/listing.types";
import { setFavorite } from "../api/set-favorite";

type FavoriteSnapshot = {
  lists: [QueryKey, ListingsPageData | undefined][];
  detail: Listing | null | undefined;
};

export function useToggleFavorite(listing: Listing) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const detailKey = listingKeys.detail(listing.slug ?? listing.id);

  const mutation = useMutation({
    mutationFn: async (isFavorite: boolean) => {
      if (!user) throw new Error("Vous devez être connecté pour gérer vos favoris.");
      await setFavorite({ userId: user.id, listingId: listing.id, isFavorite });
    },
    onMutate: async (isFavorite): Promise<FavoriteSnapshot> => {
      await queryClient.cancelQueries({ queryKey: listingKeys.all });
      const lists = queryClient.getQueriesData<ListingsPageData>({ queryKey: listingKeys.lists() });
      const detail = queryClient.getQueryData<Listing | null>(detailKey);

      queryClient.setQueriesData<ListingsPageData>({ queryKey: listingKeys.lists() }, (current) => current ? {
        ...current,
        items: current.items.map((item) => item.id === listing.id ? { ...item, isFavorite } : item),
      } : current);
      queryClient.setQueryData<Listing | null>(detailKey, (current) => current ? { ...current, isFavorite } : current);

      return { lists, detail };
    },
    onError: (_error, _isFavorite, snapshot) => {
      snapshot?.lists.forEach(([key, data]) => queryClient.setQueryData(key, data));
      queryClient.setQueryData(detailKey, snapshot?.detail);
    },
    onSettled: () => {
      if (user) void queryClient.invalidateQueries({ queryKey: listingKeys.favorites(user.id) });
    },
  });

  return { ...mutation, user };
}
