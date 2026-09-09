import { Link } from "react-router-dom";
import ThemedPage from "../components/ThemedPage";
import BrandPattern from "../components/BrandPattern";
import ListingCreationForm from "../features/listings/components/ListingCreationForm";
import { useCurrentSubscription } from "../features/subscriptions/hooks/use-current-subscription";
import { getDataSource } from "../lib/data-source";

export default function PublishPage() {
  const isSupabase = getDataSource() === "supabase";
  const subscriptionQuery = useCurrentSubscription(isSupabase);
  const subscription = subscriptionQuery.data;
  const hasActiveSubscription = subscription?.status === "active" || subscription?.status === "trialing";

  return (
    <ThemedPage ambiance="gold" className="p-[clamp(32px,7vw,104px)]">
      <div className="mx-auto max-w-6xl">
      <span className="text-xs font-bold tracking-[.22em] text-start-gold uppercase">Rejoindre le réseau</span>
      <h1 className="mt-3 max-w-4xl text-[clamp(1.65rem,3vw,2.8rem)] font-bold tracking-[-.035em]">Publier une annonce</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-start-cream/65">La publication est réservée aux professionnels disposant d’un abonnement START actif.</p>

      {isSupabase && subscriptionQuery.isPending && <p className="mt-6 rounded-xl border border-start-cream/10 px-4 py-3 text-sm text-start-cream/60" role="status">Vérification de votre abonnement…</p>}
      {isSupabase && subscriptionQuery.isError && <p className="mt-6 rounded-xl border border-network-red/25 bg-network-red/[.06] px-4 py-3 text-sm text-red-200" role="alert">Impossible de vérifier votre abonnement pour le moment.</p>}
      {isSupabase && !subscriptionQuery.isPending && !subscriptionQuery.isError && hasActiveSubscription && <p className="mt-6 rounded-xl border border-network-blue/25 bg-network-blue/[.06] px-4 py-3 text-sm leading-6 text-start-cream/75"><strong className="text-start-cream">Compte professionnel reconnu · abonnement actif.</strong> Vous pouvez accéder à la gestion de vos annonces.</p>}
      {isSupabase && !subscriptionQuery.isPending && !subscriptionQuery.isError && !hasActiveSubscription && <p className="mt-6 rounded-xl border border-start-gold/25 bg-start-gold/[.06] px-4 py-3 text-sm leading-6 text-start-cream/75"><strong className="text-start-cream">Compte professionnel reconnu.</strong> Un abonnement actif est encore nécessaire pour soumettre une annonce.</p>}

      <div className="relative isolate mt-8 overflow-hidden rounded-2xl border border-start-gold/20 bg-[#17191e]/90 p-[clamp(24px,4vw,44px)] shadow-[0_24px_70px_rgba(0,0,0,.2)]">
        <BrandPattern variant="chain" className="-right-24 -bottom-44 -z-10 h-[440px] w-[340px] text-start-gold/[.055] opacity-50 max-sm:opacity-30" />
        <div className="relative flex flex-wrap items-center gap-4 max-sm:flex-col max-sm:items-stretch">
          {isSupabase ? hasActiveSubscription ? <ListingCreationForm /> : <Link to="/abonnement" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-start-gold px-7 py-3.5 text-center font-bold text-start-ink shadow-[0_14px_35px_rgba(199,164,93,.18)] transition hover:-translate-y-0.5 hover:bg-[#d5b66f]">Choisir un abonnement</Link> : <>
            <Link to="/inscription?type=professional&redirect=/abonnement" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-start-gold px-7 py-3.5 text-center font-bold text-start-ink shadow-[0_14px_35px_rgba(199,164,93,.18)] transition hover:-translate-y-0.5 hover:bg-[#d5b66f]">Créer mon compte professionnel</Link>
            <Link to="/connexion?redirect=/abonnement" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-start-gold/45 px-7 py-3.5 text-center font-semibold text-start-gold transition hover:bg-start-gold/[.08]">J’ai déjà un compte professionnel</Link>
          </>}
        </div>
      </div>
      </div>
    </ThemedPage>
  );
}
