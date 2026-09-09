import { lazy, Suspense } from "react";
import { Link, useParams } from "react-router-dom";
import { mockListings } from "../data/mockListings";
import ThemedPage from "../components/ThemedPage";
import BrandPattern from "../components/BrandPattern";
import ListingReviews from "../components/ListingReviews";
import { useListingDetail } from "../features/listings/hooks/use-listing-detail";
import { getDataSource } from "../lib/data-source";
import FavoriteButton from "../features/favorites/components/FavoriteButton";
import { useAuth } from "../features/auth/context/use-auth";
import { useCurrentProfile } from "../features/profiles/hooks/use-current-profile";
import { recordProfessionalContact, type ContactChannel } from "../features/contacts/api/contact-clicks";
import { recordDemoContact } from "../features/contacts/model/demo-contact-clicks";
import { professionalContactCountKey } from "../features/contacts/hooks/use-professional-contact-count";
import { queryClient } from "../lib/query-client";
import ListingGallery from "../components/ListingGallery";
import type { Json } from "../lib/supabase/database.types";

const ListingLocationMap = lazy(() => import("../components/ListingLocationMap"));

const priceUnitLabels = { fixed: "", hour: " / heure", day: " / jour", month: " / mois" } as const;

function formatPrice(price: number | null, unit: NonNullable<import("../features/listings/model/listing.types").Listing["priceUnit"]> = "fixed", currency = "EUR") {
  if (unit === "quote") return "Sur devis";
  if (price === null) return "Sur demande";
  return `${new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(price)}${priceUnitLabels[unit]}`;
}

function formatDetailValue(value: Json, options: { label: string; value: string }[]) {
  const labels = new Map(options.map((option) => [option.value, option.label]));
  if (Array.isArray(value)) return value.map((item) => typeof item === "string" ? labels.get(item) ?? item : String(item)).join(", ");
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (typeof value === "string") return labels.get(value) ?? value;
  if (typeof value === "number") return new Intl.NumberFormat("fr-FR").format(value);
  return "Non renseigné";
}

export default function ListingDetailPage() {
  const { slug } = useParams();
  const { session } = useAuth();
  const profileQuery = useCurrentProfile();
  const dataSource = getDataSource();
  const listingQuery = useListingDetail(slug, { enabled: dataSource === "supabase" });
  const demoListing = mockListings.find((item) => item.id === slug || item.slug === slug);
  const listing = dataSource === "supabase" ? listingQuery.data ?? demoListing : demoListing;
  const isSupabaseListing = dataSource === "supabase" && Boolean(listingQuery.data);
  const isAuthenticated = Boolean(session);
  const canReview = (profileQuery.data?.accountType === "customer" || profileQuery.data?.accountType === "professional")
    && profileQuery.data.accountStatus === "active"
    && listing?.ownerId !== session?.user.id;
  const hasDemoContactAccess = dataSource === "supabase" && !isSupabaseListing && isAuthenticated;
  const hasContactAccess = (isSupabaseListing || hasDemoContactAccess)
    && Boolean(listing?.professional?.phone || listing?.professional?.email);

  function handleContactClick(channel: ContactChannel) {
    if (!session?.user.id || !listing?.professional) return;
    if (!isSupabaseListing) {
      recordDemoContact(session.user.id, listing.professional.name);
      return;
    }
    void recordProfessionalContact(listing.id, channel)
      .then(() => queryClient.invalidateQueries({ queryKey: professionalContactCountKey(session.user.id) }))
      .catch(() => undefined);
  }

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

        <ListingGallery images={listing.images ?? [{ src: listing.image, altText: `Illustration de l’annonce : ${listing.title}` }]} />

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
                  {formatPrice(listing.price, listing.priceUnit, listing.currency)}
                </strong>
              </div>
            </div>

            {listing.details && listing.details.length > 0 && <section className="my-8" aria-labelledby="listing-details-title"><h2 id="listing-details-title" className="text-xl font-semibold">Caractéristiques</h2><dl className="mt-4 grid grid-cols-2 gap-3 max-sm:grid-cols-1">{listing.details.map((detail) => <div key={detail.key} className="rounded-xl border border-start-cream/10 bg-black/15 p-4"><dt className="text-xs font-bold tracking-wide text-start-cream/45 uppercase">{detail.label}</dt><dd className="mt-2 font-semibold text-start-cream/85">{formatDetailValue(detail.value, detail.options)}</dd></div>)}</dl></section>}

            <Suspense fallback={<div className="my-8 h-72 animate-pulse rounded-2xl border border-start-cream/10 bg-start-cream/[.035]" role="status" aria-label="Chargement de la carte de localisation" />}>
              <ListingLocationMap listing={listing} />
            </Suspense>

            <ListingReviews listing={listing} canReview={canReview} isAuthenticated={isAuthenticated} isPersistedListing={dataSource !== "supabase" || isSupabaseListing} userId={session?.user.id} />
          </div>

          <aside className="relative isolate h-fit overflow-hidden rounded-2xl border border-start-gold/30 bg-[radial-gradient(circle_at_top,rgba(199,164,93,.11),transparent_42%),#0b0d10] p-6 shadow-[0_20px_60px_rgba(0,0,0,.24)]">
            <BrandPattern variant="nodes" className="-right-24 -bottom-36 -z-10 h-[380px] w-[280px] text-start-cream/[.055] opacity-50 max-sm:opacity-30" />
            <span className="text-xs font-bold tracking-[.18em] text-network-yellow uppercase">Profil professionnel</span>
            <h3 className="mt-3">{listing.professional?.username ? <Link className="hover:text-start-gold" to={`/professionnel/${listing.professional.username}`}>{listing.professional.name}</Link> : listing.professional?.name ?? "Professionnel"}</h3>
            <p className="text-start-cream/65">{listing.professional?.role ?? "Membre du réseau"}</p>
            {hasContactAccess && listing.professional ? (
              <>
                <ul className="my-5 space-y-2 p-0 text-sm text-start-cream/65">
                  {listing.professional.phone && <li>Tél. : <a href={`tel:${listing.professional.phone}`} onClick={() => handleContactClick("phone")} className="font-semibold text-start-gold underline decoration-start-gold/35 underline-offset-4 hover:decoration-start-gold">{listing.professional.phone}</a></li>}
                  {listing.professional.email && <li>E-mail : <a href={`mailto:${listing.professional.email}`} onClick={() => handleContactClick("email")} className="break-all font-semibold text-start-gold underline decoration-start-gold/35 underline-offset-4 hover:decoration-start-gold">{listing.professional.email}</a></li>}
                  {listing.professional.postalAddress && <li>Adresse : <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.professional.postalAddress)}`} target="_blank" rel="noreferrer" onClick={() => handleContactClick("address")} className="font-semibold text-start-gold underline decoration-start-gold/35 underline-offset-4 hover:decoration-start-gold">{listing.professional.postalAddress}</a></li>}
                </ul>
                <a href={listing.professional.email ? `mailto:${listing.professional.email}` : `tel:${listing.professional.phone}`} onClick={() => handleContactClick(listing.professional?.email ? "email" : "phone")} className="flex w-full items-center justify-center rounded-xl bg-start-gold px-5 py-3 font-bold text-start-ink hover:bg-[#d5b66f]">
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
            {isSupabaseListing && <Link to={`/signaler-un-contenu?listing=${listing.id}`} className="mt-4 block text-center text-xs text-start-cream/40 underline underline-offset-4 hover:text-network-red">Signaler cette annonce</Link>}
          </aside>
        </div>
      </div>
    </ThemedPage>
  );
}
