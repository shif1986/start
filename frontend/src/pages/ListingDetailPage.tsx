import { Link, useParams } from "react-router-dom";
import ListingLocationMap from "../components/ListingLocationMap";
import { mockListings } from "../data/mockListings";
import ThemedPage from "../components/ThemedPage";
import BrandPattern from "../components/BrandPattern";
import ListingReviews from "../components/ListingReviews";

export default function ListingDetailPage() {
  const { slug } = useParams();
  const listing = mockListings.find((item) => item.id === slug);
  const hasContactAccess = false;

  if (!listing) {
    return (
      <div className="grid min-h-[50vh] place-content-center gap-5 text-center">
        <h1>Annonce introuvable</h1>
        <Link to="/annonces" className="rounded-xl border-start-gold px-4 py-2.5 font-bold text-start-gold [border-style:solid] [border-width:.5px]">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <ThemedPage ambiance="network" className="px-[clamp(12px,5vw,72px)] py-[clamp(28px,7vw,96px)]">
      <Link to="/annonces" className="inline-flex rounded-xl border-start-cream/20 px-4 py-2.5 font-bold text-start-cream/80 [border-style:solid] [border-width:.5px] hover:border-start-gold hover:text-start-gold">
        ← Retour à la recherche
      </Link>

      <div className="mt-10 rounded-2xl border border-start-cream/10 bg-[#121418]/95 p-[clamp(18px,5vw,56px)] shadow-[0_26px_80px_rgba(0,0,0,.25)] max-sm:mt-7">
        <div className="border-b border-start-cream/10 pb-7">
          <span className="text-xs font-extrabold tracking-[.24em] text-start-gold uppercase">{listing.category}</span>
          <h1 className="my-3 font-serif text-[clamp(2.2rem,5vw,4.5rem)]">{listing.title}</h1>
          <p className="text-start-cream/60">
            {listing.city} • {listing.department}
          </p>
        </div>

        <div className="grid grid-cols-[1fr_310px] gap-10 pt-10 max-lg:grid-cols-1">
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

            <ListingReviews listing={listing} canReview={false} />
          </div>

          <aside className="relative isolate h-fit overflow-hidden rounded-2xl border border-start-gold/30 bg-[radial-gradient(circle_at_top,rgba(199,164,93,.11),transparent_42%),#0b0d10] p-6 shadow-[0_20px_60px_rgba(0,0,0,.24)]">
            <BrandPattern variant="nodes" className="-right-24 -bottom-36 -z-10 h-[380px] w-[280px] text-start-cream/[.055] opacity-50 max-sm:opacity-30" />
            <span className="text-xs font-bold tracking-[.18em] text-start-gold uppercase">Profil professionnel</span>
            <h3 className="mt-3">{listing.professional.name}</h3>
            <p className="text-start-cream/65">{listing.professional.role}</p>
            {hasContactAccess ? (
              <>
                <ul className="my-5 space-y-2 p-0 text-sm text-start-cream/65">
                  <li>Tél. : {listing.professional.phone}</li>
                  <li>E-mail : {listing.professional.email}</li>
                </ul>
                <button type="button" className="w-full rounded-xl bg-start-gold px-5 py-3 font-bold text-start-ink hover:bg-[#d5b66f]">
                  Contacter
                </button>
              </>
            ) : (
              <div className="mt-6 rounded-xl border border-start-gold/20 bg-start-gold/[.055] p-5">
                <span className="inline-flex size-10 items-center justify-center rounded-full border border-start-gold/30 text-start-gold" aria-hidden="true">
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <rect x="5" y="10" width="14" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
                <h4 className="mt-4 font-semibold text-start-cream">Coordonnées privées</h4>
                <p className="mt-2 text-sm leading-6 text-start-cream/60">
                  Créez un compte gratuit pour voir le téléphone et l’e-mail de ce professionnel, puis prendre contact.
                </p>
                <button type="button" className="mt-5 w-full rounded-xl bg-start-gold px-5 py-3 font-bold text-start-ink transition hover:bg-[#d5b66f]">
                  Créer un compte gratuit
                </button>
                <button type="button" className="mt-3 w-full rounded-xl border border-start-cream/15 px-5 py-3 font-semibold text-start-cream/75 transition hover:border-start-gold hover:text-start-gold">
                  Se connecter
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </ThemedPage>
  );
}
