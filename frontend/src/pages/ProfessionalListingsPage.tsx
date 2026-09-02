import { Link } from "react-router-dom";
import AccountShell from "../components/AccountShell";
import { useOwnerListings } from "../features/listings/hooks/use-owner-listings";
import type { DatabaseListingStatus } from "../features/listings/model/listing.types";
import SubmitListingButton from "../features/listings/components/SubmitListingButton";
import { professionalAccountNavigation } from "../features/profiles/model/account-navigation";
import { getDataSource } from "../lib/data-source";

const statusLabels: Record<DatabaseListingStatus, string> = {
  draft: "Brouillon",
  pending: "En validation",
  published: "Publiée",
  rejected: "Refusée",
  sold: "Vendue",
  archived: "Archivée",
};

const priceUnitLabels = { fixed: "", hour: " / heure", day: " / jour", month: " / mois" } as const;

function formatListingPrice(listing: { price: number | null; priceUnit: "fixed" | "hour" | "day" | "month" | "quote"; currency: string }) {
  if (listing.priceUnit === "quote") return "Sur devis";
  if (listing.price === null) return null;
  const amount = new Intl.NumberFormat("fr-FR", { style: "currency", currency: listing.currency }).format(listing.price);
  return `${amount}${priceUnitLabels[listing.priceUnit] ?? ""}`;
}

export default function ProfessionalListingsPage() {
  const isSupabase = getDataSource() === "supabase";
  const listingsQuery = useOwnerListings(isSupabase);
  const listings = listingsQuery.data ?? [];

  return (
    <AccountShell
      eyebrow="Compte professionnel"
      title="Mes annonces"
      description="Suivez vos brouillons, vos annonces en validation et vos publications actives."
      navigation={[...professionalAccountNavigation]}
      action={<Link to="/publier" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-start-gold px-5 py-3 font-bold text-start-ink">Créer une annonce</Link>}
    >
      {listingsQuery.isPending && <p className="rounded-xl border border-dashed border-start-cream/15 p-6 text-start-cream/55" role="status">Chargement de vos annonces…</p>}
      {listingsQuery.isError && <p className="rounded-xl border border-network-red/25 bg-network-red/[.06] p-4 text-red-200" role="alert">Impossible de charger vos annonces pour le moment.</p>}
      {!listingsQuery.isPending && !listingsQuery.isError && listings.length === 0 && (
        <section className="rounded-2xl border border-dashed border-start-cream/15 bg-[#121418] p-8 text-center">
          <h2 className="text-xl font-semibold">Vous n’avez encore créé aucune annonce.</h2>
          <p className="mt-3 text-sm leading-6 text-start-cream/55">Votre première annonce apparaîtra ici dès son enregistrement.</p>
          <Link to="/publier" className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-start-gold/40 px-5 py-3 font-semibold text-start-gold">Créer une annonce</Link>
        </section>
      )}
      {listings.length > 0 && (
        <div className="grid gap-4">
          {listings.map((listing) => (
            <article key={listing.id} className="grid grid-cols-[120px_1fr_auto] items-center gap-5 rounded-2xl border border-start-cream/10 bg-[#121418] p-4 max-sm:grid-cols-[84px_1fr]">
              <div className="aspect-square overflow-hidden rounded-xl bg-start-cream/[.04]">
                {listing.coverImage ? <img src={listing.coverImage} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-content-center text-xs text-start-cream/35">Sans image</div>}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold tracking-[.12em] text-start-gold uppercase">{statusLabels[listing.status]}</span>
                <h2 className="mt-2 truncate text-lg font-semibold">{listing.title}</h2>
                <p className="mt-2 text-sm text-start-cream/50">{listing.categoryName} · {listing.city}{formatListingPrice(listing) ? ` · ${formatListingPrice(listing)}` : ""}</p>
                {listing.rejectionReason && <p className="mt-3 text-sm text-red-200">Motif : {listing.rejectionReason}</p>}
              </div>
              <div className="grid gap-2 max-sm:col-span-2">
                {listing.status === "draft" && <SubmitListingButton listingId={listing.id} />}
                <Link to={`/annonce/${listing.slug}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-start-cream/15 px-4 text-sm font-semibold text-start-cream/70 hover:border-start-gold hover:text-start-gold">Voir</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
