import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";

export type AccountActivity = { id: string; kind: "review" | "favorite" | "contact" | "listing"; label: string; detail: string; createdAt: string };

export async function getAccountActivity(userId: string, client: SupabaseClient<Database> = getSupabaseClient()): Promise<AccountActivity[]> {
  const [reviews, favorites, contacts, listings] = await Promise.all([
    client.from("listing_reviews").select("id,listing_id,rating,created_at").eq("author_id", userId).order("created_at", { ascending: false }).limit(50),
    client.from("favorites").select("listing_id,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
    client.from("professional_contact_clicks").select("professional_id,last_listing_id,last_channel,last_clicked_at").eq("user_id", userId).order("last_clicked_at", { ascending: false }).limit(50),
    client.from("listings").select("id,title,status,created_at,published_at").eq("owner_id", userId).order("created_at", { ascending: false }).limit(50),
  ]);
  const error = reviews.error ?? favorites.error ?? contacts.error ?? listings.error;
  if (error) throw new Error("Impossible de charger l’historique du compte.", { cause: error });

  const listingIds = [...new Set([
    ...(reviews.data ?? []).map((item) => item.listing_id),
    ...(favorites.data ?? []).map((item) => item.listing_id),
    ...(contacts.data ?? []).flatMap((item) => item.last_listing_id ? [item.last_listing_id] : []),
  ])];
  const referencedListings = listingIds.length ? await client.from("listings").select("id,title").in("id", listingIds) : { data: [], error: null };
  if (referencedListings.error) throw new Error("Impossible de charger les annonces de l’historique.", { cause: referencedListings.error });
  const titles = new Map((referencedListings.data ?? []).map((listing) => [listing.id, listing.title]));

  return [
    ...(reviews.data ?? []).map((item): AccountActivity => ({ id: `review-${item.id}`, kind: "review", label: "Avis publié", detail: `${titles.get(item.listing_id) ?? "Annonce"} · ${item.rating}/5`, createdAt: item.created_at })),
    ...(favorites.data ?? []).map((item): AccountActivity => ({ id: `favorite-${item.listing_id}`, kind: "favorite", label: "Favori ajouté", detail: titles.get(item.listing_id) ?? "Annonce", createdAt: item.created_at })),
    ...(contacts.data ?? []).map((item): AccountActivity => ({ id: `contact-${item.professional_id}`, kind: "contact", label: "Contact initié", detail: `${titles.get(item.last_listing_id ?? "") ?? "Professionnel"} · ${item.last_channel}`, createdAt: item.last_clicked_at })),
    ...(listings.data ?? []).map((item): AccountActivity => ({ id: `listing-${item.id}`, kind: "listing", label: item.status === "published" ? "Annonce publiée" : "Annonce créée", detail: item.title, createdAt: item.published_at ?? item.created_at })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
