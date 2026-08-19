import { useState } from "react";
import { Link } from "react-router-dom";
import type { Listing } from "../data/mockListings";

export default function ListingCard({ listing, compact = false }: { listing: Listing; compact?: boolean }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const detailUrl = `/annonce/${listing.id}`;

  return (
    <article className="group relative overflow-hidden rounded-xl border border-start-cream/10 bg-[#15181d] text-start-cream shadow-[0_16px_40px_rgba(0,0,0,.22)] transition hover:-translate-y-1 hover:border-start-gold/55">
      <Link to={detailUrl} className="absolute inset-0 z-0" aria-label={`Voir l'annonce ${listing.title}`} />
      <div className="overflow-hidden">
        <img src={listing.image} alt="" className={`pointer-events-none w-full object-cover transition duration-500 group-hover:scale-105 ${compact ? "h-40" : "h-52"}`} />
      </div>
      <button
        type="button"
        className={`absolute top-3 right-3 z-20 inline-flex size-10 items-center justify-center rounded-full border border-white/60 bg-[#22221e]/55 text-xl backdrop-blur transition ${isFavorite ? "text-start-gold" : "text-white"}`}
        aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        aria-pressed={isFavorite}
        onClick={() => setIsFavorite((current) => !current)}
      >
        {isFavorite ? "♥" : "♡"}
      </button>
      <div className={`pointer-events-none relative z-10 ${compact ? "p-4" : "p-5"}`}>
        <span className="text-xs font-bold tracking-wide text-start-gold uppercase">{listing.category}</span>
        <h3 className="mt-2 text-lg font-bold leading-6 text-start-cream transition group-hover:text-start-gold">{listing.title}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-start-cream/55">{listing.description}</p>
        <p className={`${compact ? "mt-3" : "mt-4"} text-sm text-start-cream/65`}><span className="mr-1 text-start-gold" aria-hidden="true">⌖</span>{listing.city}, {listing.department}</p>
        <div className={`${compact ? "mt-3 pt-3" : "mt-4 pt-4"} flex items-center justify-between gap-3 border-t border-start-cream/10`}>
          <Link to={`${detailUrl}#avis`} className="pointer-events-auto relative z-20 inline-flex items-center gap-1.5 text-sm text-start-cream/70 transition hover:text-start-gold" aria-label={`${listing.rating} sur 5, ${listing.reviewCount} avis. Voir les avis`}>
            <span className="text-start-gold" aria-hidden="true">★</span>
            <span>{listing.rating.toFixed(1)}</span>
            <span className="inline-flex items-center gap-1 text-start-cream/45"><svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 5h14v10H9l-4 4z" /></svg>{listing.reviewCount}</span>
          </Link>
          <strong className="text-start-cream">{listing.price ? `À partir de ${listing.price} €` : "Prix libre"}</strong>
        </div>
      </div>
    </article>
  );
}
