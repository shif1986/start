import { beforeEach, describe, expect, it } from "vitest";
import { deleteUserReview, getUserReviews, saveUserReview, updateUserReview } from "./user-reviews";
import type { Listing } from "../../listings/model/listing.types";

const listing = { id: "demo-1", slug: "demo", title: "Annonce démo", category: "Services", categorySlug: "services", image: "", department: "Paris", city: "Paris", coordinates: null, price: null, description: "Description", rating: null, reviewCount: 0, professional: { name: "Pro test", role: "Pro", phone: null, email: null } } satisfies Listing;

describe("avis locaux", () => {
  beforeEach(() => localStorage.clear());

  it("permet de créer, modifier puis supprimer un avis", () => {
    const review = saveUserReview("user-1", listing, 5, "Très bien");
    updateUserReview("user-1", review.id, 4, "Avis corrigé");
    expect(getUserReviews("user-1")[0]).toMatchObject({ rating: 4, comment: "Avis corrigé" });
    deleteUserReview("user-1", review.id);
    expect(getUserReviews("user-1")).toEqual([]);
  });
});
