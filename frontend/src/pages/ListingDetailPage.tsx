import { Link, useParams } from "react-router-dom";
import ListingLocationMap from "../components/ListingLocationMap";
import { mockListings } from "../data/mockListings";

export default function ListingDetailPage() {
  const { slug } = useParams();
  const listing = mockListings.find((item) => item.id === slug);

  if (!listing) {
    return (
      <div className="grid min-h-[50vh] place-content-center gap-5 text-center">
        <h1>Annonce introuvable</h1>
        <Link to="/annonces" className="rounded-xl border border-start-gold px-4 py-2.5 font-bold text-start-gold">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-[#0e121e] px-[clamp(20px,4vw,56px)] py-12">
      <Link to="/annonces" className="inline-flex rounded-xl border border-start-cream/20 px-4 py-2.5 font-bold text-start-cream/80 hover:border-start-gold hover:text-start-gold">
        ← Retour à la recherche
      </Link>

      <div className="mt-6 rounded-2xl border border-start-cream/10 bg-start-cream/5 p-[clamp(20px,4vw,44px)]">
        <div className="border-b border-start-cream/10 pb-7">
          <span className="text-xs font-extrabold tracking-[.24em] text-start-gold uppercase">{listing.category}</span>
          <h1 className="my-3 font-serif text-[clamp(2.2rem,5vw,4.5rem)]">{listing.title}</h1>
          <p className="text-start-cream/60">
            {listing.city} • {listing.department}
          </p>
        </div>

        <div className="grid grid-cols-[1fr_310px] gap-8 pt-8 max-lg:grid-cols-1">
          <div className="min-w-0">
            <p className="text-lg leading-8 text-start-cream/70">{listing.description}</p>

            <div className="my-7 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
              <div>
                <span className="block text-xs font-bold tracking-wider text-start-gold uppercase">Localisation</span>
                <strong>{listing.city}</strong>
              </div>
              <div>
                <span className="block text-xs font-bold tracking-wider text-start-gold uppercase">Département</span>
                <strong>{listing.department}</strong>
              </div>
              <div>
                <span className="block text-xs font-bold tracking-wider text-start-gold uppercase">Prix</span>
                <strong>
                  {listing.price ? `${listing.price} €` : "Prix libre"}
                </strong>
              </div>
            </div>

            <ListingLocationMap listing={listing} />

            <div className="mt-6 grid min-h-56 place-content-center rounded-2xl border border-dashed border-start-cream/20 bg-[#080c12]/50 text-start-cream/45">Vidéo / galerie annonce</div>
          </div>

          <aside className="h-fit rounded-2xl border border-start-gold/30 bg-[#080c12]/70 p-6">
            <h3>{listing.professional.name}</h3>
            <p>{listing.professional.role}</p>
            <ul className="my-5 space-y-2 p-0 text-sm text-start-cream/65">
              <li>Tel : {listing.professional.phone}</li>
              <li>Email : {listing.professional.email}</li>
            </ul>
            <button type="button" className="w-full rounded-xl bg-start-gold px-5 py-3 font-bold text-start-ink hover:bg-[#d5b66f]">
              Contacter
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
