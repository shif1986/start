import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AccountShell from "../components/AccountShell";
import { useAuth } from "../features/auth/context/use-auth";
import { customerAccountNavigation, professionalAccountNavigation } from "../features/profiles/model/account-navigation";
import { deleteUserReview, getUserReviews, updateUserReview, USER_REVIEWS_CHANGED, type UserReview } from "../features/reviews/model/user-reviews";
import { useManageReview, useUserReviews } from "../features/reviews/hooks/use-reviews";
import { getDataSource } from "../lib/data-source";

export default function CustomerReviewsPage({ accountType = "customer" }: { accountType?: "customer" | "professional" }) {
  const { user } = useAuth();
  const [localReviews, setReviews] = useState<UserReview[]>([]);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRating, setEditingRating] = useState(5);
  const [editingComment, setEditingComment] = useState("");
  const [actionError, setActionError] = useState("");
  const isSupabase = getDataSource() === "supabase";
  const reviewsQuery = useUserReviews(user?.id ?? "", page, isSupabase);
  const manager = useManageReview(user?.id ?? "");
  const reviews = isSupabase ? [...(reviewsQuery.data?.items ?? []), ...(page === 1 ? localReviews : [])] : localReviews.slice((page - 1) * 6, page * 6);
  const totalCount = (isSupabase ? reviewsQuery.data?.totalCount ?? 0 : 0) + localReviews.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / 6));

  useEffect(() => {
    const refresh = () => setReviews(getUserReviews(user?.id ?? ""));
    refresh();
    window.addEventListener(USER_REVIEWS_CHANGED, refresh);
    return () => window.removeEventListener(USER_REVIEWS_CHANGED, refresh);
  }, [user?.id]);

  function startEditing(review: UserReview) {
    setEditingId(review.id);
    setEditingRating(review.rating);
    setEditingComment(review.comment);
  }

  async function saveEdit(review: UserReview) {
    if (editingComment.trim().length < 2) return;
    setActionError("");
    try {
      if (localReviews.some((item) => item.id === review.id)) updateUserReview(user?.id ?? "", review.id, editingRating, editingComment);
      else await manager.updateMutation.mutateAsync({ id: review.id, rating: editingRating, comment: editingComment });
      setEditingId(null);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Impossible de modifier cet avis.");
    }
  }

  async function removeReview(review: UserReview) {
    if (!window.confirm("Supprimer définitivement cet avis ?")) return;
    setActionError("");
    try {
      if (localReviews.some((item) => item.id === review.id)) deleteUserReview(user?.id ?? "", review.id);
      else await manager.deleteMutation.mutateAsync(review.id);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Impossible de supprimer cet avis.");
    }
  }

  return <AccountShell eyebrow={accountType === "professional" ? "Compte professionnel" : "Compte particulier"} title="Mes avis" description="Consultez les évaluations que vous avez publiées." navigation={[...(accountType === "professional" ? professionalAccountNavigation : customerAccountNavigation)]}>
    {isSupabase && reviewsQuery.isPending && <p role="status">Chargement de vos avis…</p>}
    {isSupabase && reviewsQuery.isError && <p role="alert" className="text-red-200">Impossible de charger vos avis.</p>}
    {actionError && <p role="alert" className="mb-4 rounded-xl border border-network-red/30 p-4 text-red-200">{actionError}</p>}
    {reviews.length > 0 ? <div className="grid gap-5">{reviews.map((review) => <article key={review.id} className="rounded-2xl border border-start-cream/10 bg-[#121418] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><span className="text-sm text-start-gold">{review.professionalName}</span><h2 className="mt-1 text-xl font-semibold">{review.listingTitle}</h2></div><span className="text-start-gold" aria-label={`${review.rating} étoiles sur 5`}>{"★".repeat(review.rating)}<span className="text-start-cream/20">{"★".repeat(5 - review.rating)}</span></span></div>
      {editingId === review.id ? <div className="mt-4 grid gap-3"><select aria-label="Modifier la note" className="w-fit rounded-lg bg-[#0b0d10] p-2" value={editingRating} onChange={(event) => setEditingRating(Number(event.target.value))}>{[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}/5</option>)}</select><textarea aria-label="Modifier le commentaire" className="min-h-28 rounded-xl border border-start-cream/15 bg-[#0b0d10] p-3" minLength={2} maxLength={1200} value={editingComment} onChange={(event) => setEditingComment(event.target.value)} /><div className="flex gap-3"><button type="button" className="rounded-lg bg-start-gold px-4 py-2 font-semibold text-start-ink" onClick={() => void saveEdit(review)}>Enregistrer</button><button type="button" className="rounded-lg border border-start-cream/15 px-4 py-2" onClick={() => setEditingId(null)}>Annuler</button></div></div> : <p className="mt-4 leading-7 text-start-cream/65">{review.comment}</p>}
      <div className="mt-5 flex flex-wrap gap-4"><Link to={`/annonce/${review.listingSlug}#avis`} className="text-sm font-semibold text-start-gold">Voir l’annonce →</Link><button type="button" className="text-sm text-network-blue" onClick={() => startEditing(review)}>Modifier</button><button type="button" className="text-sm text-network-red" onClick={() => void removeReview(review)}>Supprimer</button></div>
    </article>)}{pageCount > 1 && <nav className="flex items-center justify-center gap-3" aria-label="Pagination de mes avis"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Précédent</button><span>Page {page} sur {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}>Suivant</button></nav>}</div> : <div className="rounded-2xl border border-dashed border-start-cream/20 p-10 text-center text-start-cream/65"><h2 className="text-xl font-semibold text-start-cream">Aucun avis publié</h2><p className="mt-3">Évaluez un professionnel depuis la fiche de son annonce.</p></div>}
  </AccountShell>;
}
