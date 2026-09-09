import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import type { Listing } from "../features/listings/model/listing.types";
import { getUserReviews, saveUserReview, USER_REVIEWS_CHANGED, type UserReview } from "../features/reviews/model/user-reviews";
import { useListingReviews, useSaveReview } from "../features/reviews/hooks/use-reviews";
import { getDataSource } from "../lib/data-source";

type ListingReviewsProps = {
  listing: Listing;
  canReview?: boolean;
  isAuthenticated?: boolean;
  isPersistedListing?: boolean;
  userId?: string;
};

export default function ListingReviews({ listing, canReview = false, isAuthenticated = false, isPersistedListing = true, userId = "" }: ListingReviewsProps) {
  const location = useLocation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewsPage, setReviewsPage] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const isSupabase = getDataSource() === "supabase" && isPersistedListing;
  const reviewsQuery = useListingReviews(listing.id, reviewsPage, isSupabase);
  const saveReviewMutation = useSaveReview(listing.id, userId);
  const displayedReviews = isSupabase ? reviewsQuery.data?.items ?? [] : userReviews;
  const averageRating = isSupabase ? reviewsQuery.data?.averageRating ?? null : displayedReviews.length > 0
    ? displayedReviews.reduce((total, review) => total + review.rating, 0) / displayedReviews.length
    : listing.rating;
  const reviewCount = isSupabase ? reviewsQuery.data?.totalCount ?? 0 : displayedReviews.length > 0 ? displayedReviews.length : listing.reviewCount;

  useEffect(() => {
    if (isSupabase) return;
    const refresh = () => setUserReviews(getUserReviews(userId).filter((review) => review.listingId === listing.id));
    refresh();
    window.addEventListener(USER_REVIEWS_CHANGED, refresh);
    return () => window.removeEventListener(USER_REVIEWS_CHANGED, refresh);
  }, [isSupabase, listing.id, userId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canReview || rating === 0 || comment.trim().length < 2) return;
    try {
      if (isSupabase) await saveReviewMutation.mutateAsync({ rating, comment });
      else saveUserReview(userId, listing, rating, comment);
      setIsSubmitted(true);
      setRating(0);
      setComment("");
    } catch {
      setIsSubmitted(false);
    }
  }

  return (
    <section id="avis" className="mt-10 scroll-mt-36 rounded-2xl border border-start-cream/10 bg-[#17191e] p-[clamp(20px,4vw,34px)]">
      <div className="flex items-start justify-between gap-6 border-b border-start-cream/10 pb-6 max-sm:flex-col">
        <div>
          <span className="text-xs font-bold tracking-[.18em] text-start-gold uppercase">Avis et évaluations</span>
          <h2 className="mt-2 text-2xl font-semibold">L’expérience de la communauté</h2>
        </div>
        <div className="shrink-0 text-right max-sm:text-left">
          {averageRating !== null ? <><div className="flex items-center gap-3"><strong className="text-3xl text-start-cream">{averageRating.toFixed(1)}</strong><span className="tracking-[.12em] text-start-gold" aria-label={`${averageRating} étoiles sur 5`}>★★★★★</span></div><span className="text-sm text-start-cream/50">{reviewCount} évaluation{reviewCount > 1 ? "s" : ""}</span></> : <span className="text-sm text-start-cream/50">Aucun avis publié</span>}
        </div>
      </div>

      {canReview ? (
        <form className="mt-7" onSubmit={handleSubmit}>
          <fieldset>
            <legend className="text-sm font-semibold text-start-cream/75">Votre note</legend>
            <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Choisir une note sur cinq">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} type="button" className={`text-3xl transition hover:scale-110 max-sm:text-2xl ${value <= rating ? "text-start-gold" : "text-start-cream/20"}`} aria-label={`${value} étoile${value > 1 ? "s" : ""}`} aria-pressed={rating === value} onClick={() => setRating(value)}>★</button>
              ))}
            </div>
          </fieldset>
          <label className="mt-6 flex flex-col gap-2 text-sm font-semibold text-start-cream/75">
            Votre commentaire
            <textarea className="min-h-32 resize-y rounded-xl border border-start-cream/15 bg-[#0b0d10] px-4 py-3 font-normal text-start-cream outline-none placeholder:text-start-cream/30 focus:border-start-gold" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Partagez votre expérience avec ce professionnel..." minLength={2} maxLength={1200} required />
          </label>
          <div className="mt-5 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
            <span className="text-xs text-start-cream/40">Votre avis sera associé à votre compte.</span>
            <button type="submit" className="rounded-xl bg-start-gold px-6 py-3 font-bold text-start-ink disabled:cursor-not-allowed disabled:opacity-40" disabled={rating === 0 || comment.trim().length < 2 || saveReviewMutation.isPending}>{saveReviewMutation.isPending ? "Publication…" : "Publier mon avis"}</button>
          </div>
          {isSubmitted && <p className="mt-4 text-sm text-network-blue" role="status">Merci, votre avis a bien été pris en compte.</p>}
          {saveReviewMutation.isError && <p className="mt-4 text-sm text-red-200" role="alert">{saveReviewMutation.error instanceof Error ? saveReviewMutation.error.message : "Impossible d’enregistrer votre avis. Réessayez dans un instant."}</p>}
        </form>
      ) : (
        <div className="mt-7 flex items-center justify-between gap-6 rounded-xl border border-start-cream/10 bg-[#0b0d10]/70 p-5 max-sm:flex-col max-sm:items-start">
          <div>
            <h3 className="font-semibold text-start-cream">Vous avez fait appel à ce professionnel ?</h3>
            <p className="mt-2 text-sm leading-6 text-start-cream/55">{isAuthenticated ? "Votre compte doit être actif et vous ne pouvez pas évaluer votre propre annonce." : "Connectez-vous pour laisser une note et partager votre expérience."}</p>
          </div>
          {!isAuthenticated && <Link to={`/connexion?redirect=${encodeURIComponent(`${location.pathname}${location.search}#avis`)}`} className="shrink-0 rounded-xl border border-start-gold/60 px-5 py-3 text-center font-semibold text-start-gold transition hover:bg-start-gold hover:text-start-ink max-sm:w-full">Se connecter pour évaluer</Link>}
        </div>
      )}

      {displayedReviews.length > 0 && <div className="mt-7 grid gap-4 border-t border-start-cream/10 pt-6">
        <h3 className="font-semibold text-start-cream">Avis publiés</h3>
        {displayedReviews.map((review) => <article key={review.id} className="rounded-xl border border-start-cream/10 bg-[#0b0d10]/70 p-5">
          <div className="text-start-gold" aria-label={`${review.rating} étoiles sur 5`}>{"★".repeat(review.rating)}<span className="text-start-cream/20">{"★".repeat(5 - review.rating)}</span></div>
          <p className="mt-3 text-sm leading-6 text-start-cream/65">{review.comment}</p>
        </article>)}
        {isSupabase && (reviewsQuery.data?.totalCount ?? 0) > reviewsQuery.data!.pageSize && <nav className="flex items-center justify-center gap-3" aria-label="Pagination des avis">
          <button type="button" className="rounded-lg border border-start-cream/15 px-4 py-2 disabled:opacity-40" disabled={reviewsPage === 1} onClick={() => setReviewsPage((page) => page - 1)}>Précédent</button>
          <span className="text-sm text-start-cream/55">Page {reviewsPage} sur {Math.ceil((reviewsQuery.data?.totalCount ?? 0) / reviewsQuery.data!.pageSize)}</span>
          <button type="button" className="rounded-lg border border-start-cream/15 px-4 py-2 disabled:opacity-40" disabled={reviewsPage >= Math.ceil((reviewsQuery.data?.totalCount ?? 0) / reviewsQuery.data!.pageSize)} onClick={() => setReviewsPage((page) => page + 1)}>Suivant</button>
        </nav>}
      </div>}
    </section>
  );
}
