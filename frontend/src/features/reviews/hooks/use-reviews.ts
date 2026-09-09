import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteSupabaseReview, getListingReviews, getSupabaseUserReviews, saveSupabaseReview, updateSupabaseReview } from "../api/reviews";

export const reviewKeys = {
  listing: (listingId: string, page = 1) => ["reviews", "listing", listingId, page] as const,
  user: (userId: string, page = 1) => ["reviews", "user", userId, page] as const,
};

export function useListingReviews(listingId: string, page = 1, enabled = true) {
  return useQuery({ queryKey: reviewKeys.listing(listingId, page), queryFn: () => getListingReviews(listingId, page), enabled: enabled && Boolean(listingId) });
}

export function useUserReviews(userId: string, page = 1, enabled = true) {
  return useQuery({ queryKey: reviewKeys.user(userId, page), queryFn: () => getSupabaseUserReviews(userId, page), enabled: enabled && Boolean(userId) });
}

export function useSaveReview(listingId: string, authorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: { rating: number; comment: string }) => saveSupabaseReview({ listingId, authorId, ...values }),
    onSuccess: async () => Promise.all([queryClient.invalidateQueries({ queryKey: ["reviews", "listing", listingId] }), queryClient.invalidateQueries({ queryKey: ["reviews", "user", authorId] })]),
  });
}


export function useManageReview(userId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["reviews"] });
  const updateMutation = useMutation({ mutationFn: (input: { id: string; rating: number; comment: string }) => updateSupabaseReview(input.id, userId, input.rating, input.comment), onSuccess: invalidate });
  const deleteMutation = useMutation({ mutationFn: (reviewId: string) => deleteSupabaseReview(reviewId, userId), onSuccess: invalidate });
  return { updateMutation, deleteMutation };
}
