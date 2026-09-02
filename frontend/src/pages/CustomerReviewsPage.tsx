import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AccountShell from "../components/AccountShell";
import { useAuth } from "../features/auth/context/use-auth";
import { customerAccountNavigation } from "../features/profiles/model/account-navigation";
import { getUserReviews, USER_REVIEWS_CHANGED, type UserReview } from "../features/reviews/model/user-reviews";

export default function CustomerReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<UserReview[]>([]);

  useEffect(() => {
    const refresh = () => setReviews(getUserReviews(user?.id ?? ""));
    refresh();
    window.addEventListener(USER_REVIEWS_CHANGED, refresh);
    return () => window.removeEventListener(USER_REVIEWS_CHANGED, refresh);
  }, [user?.id]);

  return <AccountShell eyebrow="Compte particulier" title="Mes avis" description="Consultez les évaluations que vous avez publiées." navigation={[...customerAccountNavigation]}>
    {reviews.length > 0 ? <div className="grid gap-5">{reviews.map((review) => <article key={review.id} className="rounded-2xl border border-start-cream/10 bg-[#121418] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><span className="text-sm text-start-gold">{review.professionalName}</span><h2 className="mt-1 text-xl font-semibold">{review.listingTitle}</h2></div><span className="text-start-gold" aria-label={`${review.rating} étoiles sur 5`}>{"★".repeat(review.rating)}<span className="text-start-cream/20">{"★".repeat(5 - review.rating)}</span></span></div>
      <p className="mt-4 leading-7 text-start-cream/65">{review.comment}</p>
      <Link to={`/annonce/${review.listingSlug}#avis`} className="mt-5 inline-flex text-sm font-semibold text-start-gold">Voir l’annonce →</Link>
    </article>)}</div> : <div className="rounded-2xl border border-dashed border-start-cream/20 p-10 text-center text-start-cream/65"><h2 className="text-xl font-semibold text-start-cream">Aucun avis publié</h2><p className="mt-3">Évaluez un professionnel depuis la fiche de son annonce.</p></div>}
  </AccountShell>;
}
