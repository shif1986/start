import { Link, useParams } from "react-router-dom";
import ListingLocationMap from "../components/ListingLocationMap";
import { mockListings } from "../data/mockListings";
import ThemedPage from "../components/ThemedPage";
import BrandPattern from "../components/BrandPattern";
import ListingReviews from "../components/ListingReviews";
import { useListingDetail } from "../features/listings/hooks/use-listing-detail";
import { getDataSource } from "../lib/data-source";
import FavoriteButton from "../features/favorites/components/FavoriteButton";
import { useAuth } from "../features/auth/context/use-auth";

export default function ListingDetailPage() {
  const { slug } = useParams();
  const { session } = useAuth();
  const dataSource = getDataSource();
  const listingQuery = useListingDetail(slug, { enabled: dataSource === "supabase" });
  const demoListing = mockListings.find((item) => item.id === slug || item.slug === slug);
  const listing = dataSource === "supabase" ? listingQuery.data ?? demoListing : demoListing;
  const isSupabaseListing = dataSource === "supabase" && Boolean(listingQuery.data);
  const isAuthenticated = Boolean(session);
  const hasDemoContactAccess = dataSource === "supabase" && !isSupabaseListing && isAuthenticated;
  const hasContactAccess = (isSupabaseListing || hasDemoContactAccess)
    && Boolean(listing?.professional?.phone || listing?.professional?.email);

  if (dataSource === "supabase" && listingQuery.isPending) {
    return <div className="min-h-[680px] animate-pulse rounded-2xl border border-start-cream/10 bg-start-cream/[.035]" role="status" aria-label="Chargement de l’annonce" />;
  }

  if (dataSource === "supabase" && listingQuery.isError) {
    return <div className="grid min-h-[50vh] place-content-center gap-4 rounded-2xl border border-network-red/30 bg-network-red/[.06] p-8 text-center" role="alert"><h1>Impossible de charger cette annonce</h1><p>Veuillez vérifier votre connexion puis réessayer.</p></div>;
  }

  if (!listing) {
    return (
      <div className="grid min-h-[50vh] place-content-center gap-5 text-center">
        <h1 className="text-[clamp(1.65rem,3vw,2.8rem)] font-bold tracking-[-.035em]">Annonce introuvable</h1>
        <Link to="/annonces" className="rounded-xl border-start-gold px-4 py-2.5 font-bold text-start-gold [border-style:solid] [border-width:.5px]">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <ThemedPage ambiance="network" className="px-[clamp(12px,5vw,72px)] py-[clamp(20px,3.5vw,52px)]">
      <div className="flex items-center justify-between gap-4"><Link to="/annonces" className="inline-flex rounded-xl border-start-cream/20 px-4 py-2.5 font-bold text-start-cream/80 [border-style:solid] [border-width:.5px] hover:border-start-gold hover:text-start-gold">← Retour à la recherche</Link><FavoriteButton listing={listing} placement="inline" /></div>

      <div className="mt-6 rounded-2xl border border-start-cream/10 bg-[#121418]/95 px-[clamp(18px,5vw,56px)] py-[clamp(22px,3.5vw,40px)] shadow-[0_26px_80px_rgba(0,0,0,.25)] max-sm:mt-5 max-sm:rounded-none max-sm:border-0 max-sm:bg-transparent max-sm:px-0 max-sm:shadow-none">
        <div className="border-b border-start-cream/10 pb-7">
          <span className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[.24em] text-network-blue uppercase"><span className="size-1.5 rounded-full bg-network-blue" aria-hidden="true" />{listing.category}</span>
          <h1 className="my-3 max-w-5xl font-serif text-[clamp(1.65rem,3vw,2.8rem)] leading-[1.12] tracking-[-.025em]">{listing.title}</h1>
          <p className="text-start-cream/60">
            {listing.city} • {listing.department}
          </p>
        </div>

        <figure className="relative mt-8 aspect-[16/7] min-h-56 overflow-hidden rounded-2xl border border-start-cream/10 bg-[#080c12] shadow-[0_20px_55px_rgba(0,0,0,.24)] max-md:aspect-[4/3] max-sm:min-h-52">
          <img
            src={listing.image}
            alt={`Illustration de l’annonce : ${listing.title}`}
            className="size-full object-cover brightness-[.9] transition duration-700 hover:scale-[1.015] hover:brightness-100"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080c12]/75 via-transparent to-transparent" aria-hidden="true" />
          <figcaption className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-4 text-sm max-sm:right-4 max-sm:bottom-4 max-sm:left-4 max-sm:flex-col max-sm:items-start max-sm:gap-2">
            <span className="rounded-full border border-white/20 bg-[#0b0d10]/70 px-3 py-1.5 font-semibold text-start-cream backdrop-blur-md">Photo de l’annonce</span>
            <span className="rounded-full bg-[#0b0d10]/55 px-3 py-1 text-start-cream/75 backdrop-blur-sm">{listing.city} · {listing.department}</span>
          </figcaption>
        </figure>

        <div className="grid grid-cols-[1fr_310px] gap-10 pt-10 max-lg:grid-cols-1">
          <div className="min-w-0">
            <p className="text-lg leading-8 text-start-cream/70">{listing.description}</p>

            <div className="my-7 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
              <div>
                <span className="block text-xs font-bold tracking-wider text-network-blue uppercase">Localisation</span>
                <strong>{listing.city}</strong>
              </div>
              <div>
                <span className="block text-xs font-bold tracking-wider text-start-gold uppercase">Département</span>
                <strong>{listing.department}</strong>
              </div>
              <div>
                <span className="block text-xs font-bold tracking-wider text-network-yellow uppercase">Prix</span>
                <strong>
                  {listing.price ? `${listing.price} €` : "Prix libre"}
                </strong>
              </div>
            </div>

            <ListingLocationMap listing={listing} />

            <ListingReviews listing={listing} canReview={false} />
          </div>

          <aside className="relative isolate h-fit overflow-hidden rounded-2xl border border-start-gold/30 bg-[radial-gradient(circle_at_top,rgba(199,164,93,.11),transparent_42%),#0b0d10] p-6 shadow-[0_20px_60px_rgba(0,0,0,.24)]">
            <BrandPattern variant="nodes" className="-right-24 -bottom-36 -z-10 h-[380px] w-[280px] text-start-cream/[.055] opacity-50 max-sm:opacity-30" />
            <span className="text-xs font-bold tracking-[.18em] text-network-yellow uppercase">Profil professionnel</span>
            <h3 className="mt-3">{listing.professional?.name ?? "Professionnel"}</h3>
            <p className="text-start-cream/65">{listing.professional?.role ?? "Membre du réseau"}</p>
            {hasContactAccess && listing.professional ? (
              <>
                <ul className="my-5 space-y-2 p-0 text-sm text-start-cream/65">
                  {listing.professional.phone && <li>Tél. : {listing.professional.phone}</li>}
                  {listing.professional.email && <li>E-mail : {listing.professional.email}</li>}
                  {listing.professional.postalAddress && <li>Adresse : {listing.professional.postalAddress}</li>}
                </ul>
                <a href={listing.professional.email ? `mailto:${listing.professional.email}` : `tel:${listing.professional.phone}`} className="flex w-full items-center justify-center rounded-xl bg-start-gold px-5 py-3 font-bold text-start-ink hover:bg-[#d5b66f]">
                  Contacter
                </a>
              </>
            ) : isAuthenticated ? (
              <div className="mt-6 rounded-xl border border-start-gold/20 bg-start-gold/[.055] p-5">
                <h4 className="font-semibold text-start-cream">Coordonnées indisponibles</h4>
                <p className="mt-2 text-sm leading-6 text-start-cream/60">
                  Les coordonnées de ce professionnel ne sont pas disponibles actuellement. Son abonnement peut être arrivé à échéance.
                </p>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-start-gold/20 bg-start-gold/[.055] p-5">
                <span className="inline-flex size-10 items-center justify-center rounded-full border border-network-red/30 text-network-red" aria-hidden="true">
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <rect x="5" y="10" width="14" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
                <h4 className="mt-4 font-semibold text-start-cream">Coordonnées privées</h4>
                <p className="mt-2 text-sm leading-6 text-start-cream/60">
                  Créez un compte particulier gratuit pour voir le téléphone, l’e-mail et, lorsqu’elle est renseignée, l’adresse postale de ce professionnel.
                </p>
                <Link to={`/inscription?redirect=${encodeURIComponent(`/annonce/${listing.slug ?? listing.id}`)}`} className="mt-5 flex w-full items-center justify-center rounded-xl bg-start-gold px-5 py-3 font-bold text-start-ink transition hover:bg-[#d5b66f]">
                  Créer un compte gratuit
                </Link>
                <Link to={`/connexion?redirect=${encodeURIComponent(`/annonce/${listing.slug ?? listing.id}`)}`} className="mt-3 flex w-full items-center justify-center rounded-xl border border-start-cream/15 px-5 py-3 font-semibold text-start-cream/75 transition hover:border-start-gold hover:text-start-gold">
                  Se connecter
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </ThemedPage>
  );
}
