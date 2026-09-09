import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";

export type PendingAdminListing = {
  id: string;
  slug: string;
  title: string;
  description: string;
  city: string;
  price: number | null;
  currency: string;
  createdAt: string;
  categoryName: string;
  ownerName: string;
  ownerUsername: string;
  status: Database["public"]["Enums"]["listing_status"];
};

export type AdminDashboardData = {
  unverifiedProfiles: number;
  activeListings: number;
  openReports: number;
  pendingListings: PendingAdminListing[];
  reviews: AdminReview[];
  profiles: AdminProfile[];
  reports: AdminReport[];
  auditLog: AuditEntry[];
};

export type AdminReview = { id: string; rating: number; body: string; isHidden: boolean; createdAt: string; authorName: string; listingTitle: string };
export type AdminProfile = { id: string; displayName: string; username: string; accountType: string; accountStatus: string; isVerified: boolean; createdAt: string };
export type AdminReport = { id: string; reason: string; details: string | null; status: Database["public"]["Enums"]["report_status"]; createdAt: string; reporterName: string; listingTitle: string };
export type AuditEntry = { id: string; action: string; targetType: string; reason: string; createdAt: string; moderatorName: string };

export async function getAdminDashboard(client: SupabaseClient<Database> = getSupabaseClient()): Promise<AdminDashboardData> {
  const [profilesResult, activeResult, reportsResult, pendingResult, reviewsResult, auditResult] = await Promise.all([
    client.from("profiles").select("id,display_name,username,account_type,account_status,is_verified,created_at").order("created_at", { ascending: false }).limit(50),
    client.from("listings").select("id", { count: "exact", head: true }).eq("status", "published"),
    client.from("reports").select("id,reporter_id,listing_id,reason,details,status,created_at,listings!inner(title)").order("created_at", { ascending: false }).limit(50),
    client.from("listings")
      .select("id,owner_id,slug,title,description,city,price,currency,created_at,status,categories(name)")
      .in("status", ["pending", "published"])
      .order("created_at", { ascending: true })
      .limit(50),
    client.from("listing_reviews").select("id,author_id,rating,body,is_hidden,created_at,listings!inner(title)").order("created_at", { ascending: false }).limit(50),
    client.from("moderation_audit_log").select("id,moderator_id,action,target_type,reason,created_at").order("created_at", { ascending: false }).limit(50),
  ]);

  const firstError = profilesResult.error ?? activeResult.error ?? reportsResult.error ?? pendingResult.error ?? reviewsResult.error ?? auditResult.error;
  if (firstError) throw new Error("Impossible de charger le tableau de bord administrateur.", { cause: firstError });

  const pendingRows = (pendingResult.data ?? []) as unknown as Array<{
    id: string; owner_id: string; slug: string; title: string; description: string; city: string;
    price: number | null; currency: string; created_at: string; status: Database["public"]["Enums"]["listing_status"]; categories: { name: string } | null;
  }>;
  const reviewRows = (reviewsResult.data ?? []) as unknown as Array<{ id: string; author_id: string; rating: number; body: string; is_hidden: boolean; created_at: string; listings: { title: string } }>;
  const reportRows = (reportsResult.data ?? []) as unknown as Array<{ id: string; reporter_id: string; reason: string; details: string | null; status: Database["public"]["Enums"]["report_status"]; created_at: string; listings: { title: string } }>;
  const auditRows = auditResult.data ?? [];
  const profileIds = [...new Set([...pendingRows.map((listing) => listing.owner_id), ...reviewRows.map((review) => review.author_id), ...reportRows.map((report) => report.reporter_id), ...auditRows.map((entry) => entry.moderator_id)])];
  const ownersResult = profileIds.length
    ? await client.from("profiles").select("id,display_name,username").in("id", profileIds)
    : { data: [], error: null };

  if (ownersResult.error) throw new Error("Impossible de charger les auteurs des annonces.", { cause: ownersResult.error });
  const owners = new Map((ownersResult.data ?? []).map((owner) => [owner.id, owner]));

  return {
    unverifiedProfiles: (profilesResult.data ?? []).filter((profile) => !profile.is_verified).length,
    activeListings: activeResult.count ?? 0,
    openReports: reportRows.filter((report) => report.status === "open").length,
    reviews: reviewRows.map((review) => ({ id: review.id, rating: review.rating, body: review.body, isHidden: review.is_hidden, createdAt: review.created_at, authorName: owners.get(review.author_id)?.display_name ?? "Membre START", listingTitle: review.listings.title })),
    profiles: (profilesResult.data ?? []).map((profile) => ({ id: profile.id, displayName: profile.display_name, username: profile.username, accountType: profile.account_type, accountStatus: profile.account_status, isVerified: profile.is_verified, createdAt: profile.created_at })),
    reports: reportRows.map((report) => ({ id: report.id, reason: report.reason, details: report.details, status: report.status, createdAt: report.created_at, reporterName: owners.get(report.reporter_id)?.display_name ?? "Membre START", listingTitle: report.listings.title })),
    auditLog: auditRows.map((entry) => ({ id: entry.id, action: entry.action, targetType: entry.target_type, reason: entry.reason, createdAt: entry.created_at, moderatorName: owners.get(entry.moderator_id)?.display_name ?? "Modérateur" })),
    pendingListings: pendingRows.map((listing) => {
      const owner = owners.get(listing.owner_id);
      return {
        id: listing.id,
        slug: listing.slug,
        title: listing.title,
        description: listing.description,
        city: listing.city,
        price: listing.price,
        currency: listing.currency,
        createdAt: listing.created_at,
        categoryName: listing.categories?.name ?? "Sans catégorie",
        ownerName: owner?.display_name ?? "Professionnel",
        ownerUsername: owner?.username ?? "",
        status: listing.status,
      };
    }),
  };
}

export async function moderateReview(reviewId: string, action: "hide" | "show" | "delete", reason: string, client: SupabaseClient<Database> = getSupabaseClient()) {
  const { error } = await client.rpc("moderate_review", { p_review_id: reviewId, p_action: action, p_reason: reason });
  if (error) throw new Error("Impossible de modérer cet avis.", { cause: error });
}

export async function moderateProfile(profileId: string, action: "verify" | "suspend" | "reactivate", reason: string, client: SupabaseClient<Database> = getSupabaseClient()) {
  const { error } = await client.rpc("moderate_profile", { p_profile_id: profileId, p_action: action, p_reason: reason });
  if (error) throw new Error("Impossible de modérer ce profil.", { cause: error });
}

export async function moderateReport(reportId: string, status: "reviewing" | "resolved" | "dismissed", reason: string, client: SupabaseClient<Database> = getSupabaseClient()) {
  const { error } = await client.rpc("moderate_report", { p_report_id: reportId, p_status: status, p_reason: reason });
  if (error) throw new Error("Impossible de traiter ce signalement.", { cause: error });
}

export async function moderateListing(
  listingId: string,
  decision: "published" | "rejected",
  rejectionReason?: string,
  client: SupabaseClient<Database> = getSupabaseClient(),
) {
  const reason = rejectionReason?.trim() ?? "";
  if (decision === "rejected" && reason.length < 5) throw new Error("Indiquez un motif de refus d’au moins 5 caractères.");

  const { error } = await client.rpc("moderate_listing", { p_listing_id: listingId, p_decision: decision, p_reason: reason });

  if (error) throw new Error("La décision de modération n’a pas pu être enregistrée.", { cause: error });
}
