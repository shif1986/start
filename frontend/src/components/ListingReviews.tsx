import { useState, type FormEvent } from "react";
import type { Listing } from "../data/mockListings";

type ListingReviewsProps = {
  listing: Listing;
  canReview?: boolean;
};

export default function ListingReviews({ listing, canReview = false }: ListingReviewsProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canReview || rating === 0 || !comment.trim()) return;
    setIsSubmitted(true);
    setRating(0);
    setComment("");
  }

  return (
    <section id="avis" className="mt-10 scroll-mt-36 rounded-2xl border border-start-cream/10 bg-[#17191e] p-[clamp(20px,4vw,34px)]">
      <div className="flex items-start justify-between gap-6 border-b border-start-cream/10 pb-6 max-sm:flex-col">
        <div>
          <span className="text-xs font-bold tracking-[.18em] text-start-gold uppercase">Avis et évaluations</span>
          <h2 className="mt-2 text-2xl font-semibold">L’expérience de la communauté</h2>
        </div>
        <div className="shrink-0 text-right max-sm:text-left">
          <div className="flex items-center gap-3">
            <strong className="text-3xl text-start-cream">{listing.rating.toFixed(1)}</strong>
            <span className="tracking-[.12em] text-start-gold" aria-label={`${listing.rating} étoiles sur 5`}>★★★★★</span>
          </div>
          <span className="text-sm text-start-cream/50">{listing.reviewCount} évaluations</span>
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
            <textarea className="min-h-32 resize-y rounded-xl border border-start-cream/15 bg-[#0b0d10] px-4 py-3 font-normal text-start-cream outline-none placeholder:text-start-cream/30 focus:border-start-gold" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Partagez votre expérience avec ce professionnel..." maxLength={1200} required />
          </label>
          <div className="mt-5 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
            <span className="text-xs text-start-cream/40">Votre avis sera associé à votre compte particulier.</span>
            <button type="submit" className="rounded-xl bg-start-gold px-6 py-3 font-bold text-start-ink disabled:cursor-not-allowed disabled:opacity-40" disabled={rating === 0 || !comment.trim()}>Publier mon avis</button>
          </div>
          {isSubmitted && <p className="mt-4 text-sm text-network-blue" role="status">Merci, votre avis a bien été pris en compte.</p>}
        </form>
      ) : (
        <div className="mt-7 flex items-center justify-between gap-6 rounded-xl border border-start-cream/10 bg-[#0b0d10]/70 p-5 max-sm:flex-col max-sm:items-start">
          <div>
            <h3 className="font-semibold text-start-cream">Vous avez fait appel à ce professionnel ?</h3>
            <p className="mt-2 text-sm leading-6 text-start-cream/55">Connectez-vous avec votre compte particulier gratuit pour laisser une note et partager votre expérience.</p>
          </div>
          <button type="button" className="shrink-0 rounded-xl border border-start-gold/60 px-5 py-3 font-semibold text-start-gold transition hover:bg-start-gold hover:text-start-ink max-sm:w-full">Se connecter pour évaluer</button>
        </div>
      )}
    </section>
  );
}
