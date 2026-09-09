import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";
import type { UserReview } from "../model/user-reviews";

export type ListingReview = { id: string; authorId: string; authorName: string; rating: number; comment: string; createdAt: string };
export type ReviewsPage<T> = { items: T[]; totalCount: number; page: number; pageSize: number; averageRating?: number | null };

type ReviewRow = Database["public"]["Tables"]["listing_reviews"]["Row"];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function authorNames(authorIds: string[], client: SupabaseClient<Database>) {
  if (authorIds.length === 0) return new Map<string, string>();
  const { data, error } = await client.from("public_profiles").select("id,display_name").in("id", [...new Set(authorIds)]);
  if (error) throw new Error("Impossible de charger les auteurs des avis.", { cause: error });
  return new Map((data ?? []).flatMap((profile) => profile.id ? [[profile.id, profile.display_name ?? "Membre START"]] : []));
}

export async function getListingReviews(listingId: string, page = 1, pageSize = 5, client: SupabaseClient<Database> = getSupabaseClient()): Promise<ReviewsPage<ListingReview>> {
  const from = (page - 1) * pageSize;
  const [{ data, error, count }, ratingsResult] = await Promise.all([
    client.from("listing_reviews").select("id,author_id,rating,body,created_at", { count: "exact" }).eq("listing_id", listingId).eq("is_hidden", false).order("created_at", { ascending: false }).range(from, from + pageSize - 1),
    client.from("listing_reviews").select("rating").eq("listing_id", listingId).eq("is_hidden", false),
  ]);
  if (error ?? ratingsResult.error) throw new Error("Impossible de charger les avis.", { cause: error ?? ratingsResult.error });
  const rows = (data ?? []) as Pick<ReviewRow, "id" | "author_id" | "rating" | "body" | "created_at">[];
  const names = await authorNames(rows.map((row) => row.author_id), client);
  const ratings = ratingsResult.data ?? [];
  return { items: rows.map((row) => ({ id: row.id, authorId: row.author_id, authorName: names.get(row.author_id) ?? "Membre START", rating: row.rating, comment: row.body, createdAt: row.created_at })), totalCount: count ?? 0, page, pageSize, averageRating: ratings.length ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length : null };
}

export async function getSupabaseUserReviews(userId: string, page = 1, pageSize = 6, client: SupabaseClient<Database> = getSupabaseClient()): Promise<ReviewsPage<UserReview>> {
  const from = (page - 1) * pageSize;
  const { data, error, count } = await client.from("listing_reviews").select("id,listing_id,rating,body,created_at,listings!inner(slug,title,owner_id)", { count: "exact" }).eq("author_id", userId).order("created_at", { ascending: false }).range(from, from + pageSize - 1);
  if (error) throw new Error("Impossible de charger vos avis.", { cause: error });
  const rows = (data ?? []) as unknown as Array<Pick<ReviewRow, "id" | "listing_id" | "rating" | "body" | "created_at"> & { listings: { slug: string; title: string; owner_id: string } }>;
  const names = await authorNames(rows.map((row) => row.listings.owner_id), client);
  return { items: rows.map((row) => ({ id: row.id, listingId: row.listing_id, listingSlug: row.listings.slug, listingTitle: row.listings.title, professionalName: names.get(row.listings.owner_id) ?? "Professionnel", rating: row.rating, comment: row.body, createdAt: row.created_at })), totalCount: count ?? 0, page, pageSize };
}

export async function saveSupabaseReview(input: { listingId: string; authorId: string; rating: number; comment: string }, client: SupabaseClient<Database> = getSupabaseClient()) {
  if (!UUID_PATTERN.test(input.listingId)) throw new Error("Cette annonce de démonstration ne peut pas recevoir d’avis.");
  const { data, error } = await client.from("listing_reviews").upsert({ listing_id: input.listingId, author_id: input.authorId, rating: input.rating, body: input.comment.trim(), is_hidden: false }, { onConflict: "listing_id,author_id" }).select("id").single();
  if (error) {
    const detail = [error.code, error.message].filter(Boolean).join(": ");
    throw new Error(`Impossible d’enregistrer votre avis.${detail ? ` (${detail})` : ""}`, { cause: error });
  }
  return data;
}

export async function deleteSupabaseReview(reviewId: string, authorId: string, client: SupabaseClient<Database> = getSupabaseClient()) {
  const { error } = await client.from("listing_reviews").delete().eq("id", reviewId).eq("author_id", authorId);
  if (error) throw new Error("Impossible de supprimer votre avis.", { cause: error });
}

export async function updateSupabaseReview(reviewId: string, authorId: string, rating: number, comment: string, client: SupabaseClient<Database> = getSupabaseClient()) {
  const { error } = await client.from("listing_reviews").update({ rating, body: comment.trim() }).eq("id", reviewId).eq("author_id", authorId);
  if (error) throw new Error("Impossible de modifier votre avis.", { cause: error });
}
