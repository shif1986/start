import type { Listing } from "../../listings/model/listing.types";

export type UserReview = {
  id: string;
  listingId: string;
  listingSlug: string;
  listingTitle: string;
  professionalName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export const USER_REVIEWS_CHANGED = "start-user-reviews-changed";

function storageKey(userId: string) {
  return `start-user-reviews:${userId}`;
}

export function getUserReviews(userId: string): UserReview[] {
  if (!userId) return [];
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(userId)) ?? "[]");
    return Array.isArray(value) ? value as UserReview[] : [];
  } catch {
    return [];
  }
}

export function saveUserReview(userId: string, listing: Listing, rating: number, comment: string) {
  const review: UserReview = {
    id: `${listing.id}-${Date.now()}`,
    listingId: listing.id,
    listingSlug: listing.slug ?? listing.id,
    listingTitle: listing.title,
    professionalName: listing.professional?.name ?? "Professionnel",
    rating,
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
  };
  const reviews = [review, ...getUserReviews(userId)];
  localStorage.setItem(storageKey(userId), JSON.stringify(reviews));
  window.dispatchEvent(new CustomEvent(USER_REVIEWS_CHANGED, { detail: { userId } }));
  return review;
}
