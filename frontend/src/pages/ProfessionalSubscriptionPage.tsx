import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AccountShell from "../components/AccountShell";
import { professionalAccountNavigation } from "../features/profiles/model/account-navigation";
import { useCurrentSubscription } from "../features/subscriptions/hooks/use-current-subscription";
import { createCustomerPortal } from "../features/subscriptions/api/stripe-billing";

const benefits = [
  "Créer et soumettre vos annonces",
  "Afficher votre profil professionnel",
  "Gérer vos annonces depuis votre espace",
  "Recevoir les contacts des membres",
];

export default function ProfessionalSubscriptionPage() {
  const [searchParams] = useSearchParams();
  const [portalPending, setPortalPending] = useState(false);
  const [portalError, setPortalError] = useState("");
  const subscriptionQuery = useCurrentSubscription();
  const subscription = subscriptionQuery.data;
  const expiresAt = subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
  const isCurrent = Boolean(
    subscription
    && (subscription.status === "active" || subscription.status === "trialing")
    && (!expiresAt || expiresAt.getTime() > Date.now()),
  );
  const formattedEndDate = expiresAt
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(expiresAt)
    : "Non renseignée";
  const price = subscription
    ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: subscription.plan.currency, maximumFractionDigits: 0 }).format(subscription.plan.priceCents / 100)
    : "—";

  async function openPortal() {
    setPortalPending(true);
    setPortalError("");
    try { window.location.assign(await createCustomerPortal()); }
    catch (error) { setPortalError(error instanceof Error ? error.message : "Impossible d’ouvrir la facturation."); setPortalPending(false); }
  }

  return (
    <AccountShell
      eyebrow="Compte professionnel"
      title="Mon abonnement"
      description="Retrouvez votre formule, sa période de validité et les services disponibles avec votre compte START."
      navigation={[...professionalAccountNavigation]}
    >
      {searchParams.get("checkout") === "success" && <p role="status" className="mb-6 rounded-xl border border-network-blue/25 bg-network-blue/[.06] p-4 text-network-blue">Paiement reçu par Stripe. L’abonnement apparaîtra actif dès la confirmation du webhook.</p>}
      {subscriptionQuery.isPending && <p className="rounded-2xl border border-start-cream/10 bg-[#121418] p-8 text-start-cream/60" role="status">Chargement de votre abonnement…</p>}
      {subscriptionQuery.isError && <p className="rounded-2xl border border-network-red/25 bg-network-red/[.06] p-6 text-red-200" role="alert">Impossible de charger votre abonnement pour le moment.</p>}

      {!subscriptionQuery.isPending && !subscriptionQuery.isError && !subscription && (
        <section className="rounded-2xl border border-start-gold/20 bg-[radial-gradient(circle_at_top_right,rgba(199,164,93,.12),transparent_38%),#121418] p-[clamp(24px,5vw,48px)]">
          <span className="text-xs font-bold tracking-[.2em] text-start-gold uppercase">Aucune formule active</span>
          <h2 className="mt-4 text-3xl font-semibold">Activez votre espace professionnel</h2>
          <p className="mt-4 max-w-2xl leading-7 text-start-cream/60">Choisissez une formule pour publier vos annonces et profiter des services professionnels.</p>
          <Link to="/abonnement" className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-start-gold px-6 font-bold text-start-ink">Découvrir les formules</Link>
        </section>
      )}

      {!subscriptionQuery.isPending && !subscriptionQuery.isError && subscription && (
        <div className="grid gap-6">
          <section className="relative overflow-hidden rounded-3xl border border-start-gold/30 bg-[radial-gradient(circle_at_82%_15%,rgba(199,164,93,.18),transparent_30%),linear-gradient(145deg,#17191e,#0b0d10)] p-[clamp(24px,5vw,52px)] shadow-[0_28px_80px_rgba(0,0,0,.28)]">
            <div className="absolute top-0 right-0 h-40 w-40 translate-x-12 -translate-y-12 rounded-full border border-start-gold/15" aria-hidden="true" />
            <div className="relative flex items-start justify-between gap-6 max-sm:flex-col">
              <div>
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold tracking-[.12em] uppercase ${isCurrent ? "border-network-blue/35 bg-network-blue/[.08] text-network-blue" : "border-network-red/35 bg-network-red/[.08] text-red-200"}`}>
                  <span className={`size-2 rounded-full ${isCurrent ? "bg-network-blue" : "bg-network-red"}`} aria-hidden="true" />
                  {isCurrent ? "Abonnement actif" : "Abonnement inactif"}
                </span>
                <h2 className="mt-6 text-[clamp(1.65rem,3vw,2.5rem)] font-semibold tracking-[-.035em]">{subscription.plan.name}</h2>
                <p className="mt-3 text-start-cream/55">{subscription.plan.interval === "monthly" ? "Formule mensuelle" : "Formule annuelle"} · {price}</p>
              </div>
              <div className="min-w-64 rounded-2xl border border-start-cream/10 bg-black/20 p-5 max-sm:w-full">
                <span className="text-xs font-bold tracking-[.15em] text-start-cream/40 uppercase">Valable jusqu’au</span>
                <strong className="mt-3 block text-2xl text-start-gold">{formattedEndDate}</strong>
                <p className="mt-3 text-sm leading-6 text-start-cream/50">{subscription.cancelAtPeriodEnd ? "La résiliation est prévue à cette date." : subscription.status === "trialing" ? "Période de test actuellement active." : "Renouvellement prévu en fin de période."}</p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-[1.15fr_.85fr] gap-6 max-lg:grid-cols-1">
            <section className="rounded-2xl border border-start-cream/10 bg-[#121418] p-7">
              <span className="text-xs font-bold tracking-[.18em] text-start-gold uppercase">Services inclus</span>
              <h2 className="mt-3 text-2xl font-semibold">Votre accès professionnel</h2>
              <ul className="mt-6 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                {benefits.map((benefit) => <li key={benefit} className="flex gap-3 rounded-xl border border-start-cream/10 bg-[#0b0d10] p-4 text-sm text-start-cream/65"><span className="text-network-blue">✓</span><span>{benefit}</span></li>)}
              </ul>
            </section>
            <aside className="rounded-2xl border border-start-gold/20 bg-[#121418] p-7">
              <span className="text-xs font-bold tracking-[.18em] text-start-gold uppercase">Actions rapides</span>
              <div className="mt-6 grid gap-3">
                <Link to="/publier" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-start-gold px-5 font-bold text-start-ink">Créer une annonce</Link>
                <Link to="/espace/professionnel/annonces" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-start-cream/15 px-5 font-semibold text-start-cream/70">Gérer mes annonces</Link>
                <button type="button" disabled={portalPending} onClick={() => void openPortal()} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-start-gold/30 px-5 font-semibold text-start-gold disabled:opacity-50">{portalPending ? "Ouverture…" : "Gérer le paiement ou résilier"}</button>
              </div>
              {portalError && <p role="alert" className="mt-4 text-sm text-red-200">{portalError}</p>}
              <p className="mt-5 text-xs leading-5 text-start-cream/40">Les moyens de paiement, factures et résiliations sont gérés dans le portail sécurisé Stripe.</p>
            </aside>
          </div>
        </div>
      )}
    </AccountShell>
  );
}
