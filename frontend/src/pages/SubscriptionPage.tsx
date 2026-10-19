import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import StartNetworkCycle from "../components/StartNetworkCycle";
import ThemedPage from "../components/ThemedPage";
import { useCurrentSubscription } from "../features/subscriptions/hooks/use-current-subscription";
import { useSubscriptionPlans } from "../features/subscriptions/hooks/use-subscription-plans";
import { useAuth } from "../features/auth/context/use-auth";
import { useCurrentProfile } from "../features/profiles/hooks/use-current-profile";
import type { SubscriptionPlan } from "../features/subscriptions/model/subscription.types";
import { getDataSource } from "../lib/data-source";
import { createSubscriptionCheckout } from "../features/subscriptions/api/stripe-billing";

type Plan = "monthly" | "yearly";

const previewPlans: SubscriptionPlan[] = [
  { id: "preview-monthly", code: "pro_monthly", name: "Pro mensuel", interval: "monthly", priceCents: 700, currency: "EUR" },
  { id: "preview-yearly", code: "pro_yearly", name: "Pro annuel", interval: "yearly", priceCents: 8400, currency: "EUR" },
];

const features = [
  "Créer et gérer vos annonces professionnelles",
  "Afficher un profil professionnel public",
  "Recevoir les contacts des membres particuliers",
  "Accéder aux avis et statistiques de vos annonces",
  "Soumettre vos annonces à la validation START",
];

export default function SubscriptionPage() {
  const isSupabase = getDataSource() === "supabase";
  const { user, isLoading: isAuthLoading } = useAuth();
  const profileQuery = useCurrentProfile();
  const plansQuery = useSubscriptionPlans(isSupabase);
  const subscriptionQuery = useCurrentSubscription(isSupabase && Boolean(user));
  const [plan, setPlan] = useState<Plan>("monthly");
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const termsInput = useRef<HTMLInputElement>(null);
  const plans = isSupabase ? plansQuery.data ?? [] : previewPlans;
  const selectedPlan = plans.find((candidate) => candidate.interval === plan) ?? plans[0];
  const currentSubscription = subscriptionQuery.data;
  const isEntitled = currentSubscription?.status === "active" || currentSubscription?.status === "trialing";
  const isProfessional = profileQuery.data?.accountType === "professional";
  const formatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: selectedPlan?.currency ?? "EUR" });

  async function openCheckout() {
    if (!isSupabase || !user || !isProfessional || !selectedPlan || isEntitled || checkoutPending) return;
    if (!termsAccepted) {
      setCheckoutError("Veuillez accepter les conditions de l’abonnement pour continuer vers Stripe.");
      termsInput.current?.focus();
      return;
    }
    setCheckoutPending(true);
    setCheckoutError("");
    try {
      window.location.assign(await createSubscriptionCheckout(selectedPlan.code));
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Impossible d’ouvrir le paiement.");
      setCheckoutPending(false);
    }
  }

  return (
    <ThemedPage
      ambiance="dark"
      showPattern={false}
      className="discreet-network-background"
    >
      <div className="px-[clamp(14px,4vw,52px)] pt-[clamp(32px,5vw,72px)] pb-[clamp(40px,5vw,72px)]">
        <div className="mx-auto max-w-5xl">
          <header className="mx-auto max-w-3xl text-center">
            <span className="mx-auto block h-px w-24 bg-start-gold/70" aria-hidden="true" />
            <span className="mx-auto mt-6 flex w-fit items-center gap-3" aria-hidden="true">
              <span className="size-2 rounded-full bg-network-blue" />
              <span className="size-2 rounded-full bg-network-yellow" />
              <span className="size-2 rounded-full bg-network-red" />
            </span>
            <span className="mt-5 block text-[.65rem] font-bold tracking-[.2em] text-start-gold uppercase">
              Vos dons de soutien
            </span>
            <h1 className="mt-6 text-[clamp(1.65rem,3vw,2.8rem)] leading-[1.08] font-bold tracking-[-.035em]">
              Développez votre présence.<br className="max-sm:hidden" />
              <span className="text-start-gold">Faites grandir votre réseau.</span>
            </h1>
          </header>

          {isSupabase && subscriptionQuery.isPending && <p className="mt-6 rounded-xl border border-start-cream/10 px-4 py-3 text-sm text-start-cream/60" aria-live="polite">Chargement de votre don de soutien…</p>}
          {isSupabase && subscriptionQuery.isError && <p className="mt-6 rounded-xl border border-network-red/25 bg-network-red/[.06] px-4 py-3 text-sm text-red-200" role="alert">Impossible de vérifier votre don de soutien pour le moment.</p>}
          {isSupabase && currentSubscription && <div className="mt-6 rounded-xl border border-network-blue/20 bg-network-blue/[.055] px-4 py-3 text-sm leading-6 text-start-cream/70"><strong className="text-start-cream">{isEntitled ? "Don de soutien actif" : "Paiement à régulariser"}</strong> · {currentSubscription.plan.name}{currentSubscription.currentPeriodEnd ? ` jusqu’au ${new Intl.DateTimeFormat("fr-FR").format(new Date(currentSubscription.currentPeriodEnd))}` : ""}{currentSubscription.cancelAtPeriodEnd ? " · Renouvellement arrêté en fin de période" : ""}</div>}
          {!isSupabase && <div className="mt-6 rounded-xl border border-network-blue/20 bg-network-blue/[.055] px-4 py-2.5 text-sm leading-6 text-start-cream/65 max-sm:mt-4 max-sm:text-xs max-sm:leading-5">Aperçu frontend — aucun paiement ne sera débité.</div>}

        {isSupabase && plansQuery.isPending && <p className="mt-6 rounded-xl border border-dashed border-start-cream/15 p-6 text-sm text-start-cream/55" aria-live="polite">Chargement des formules…</p>}
        {isSupabase && plansQuery.isError && <p className="mt-6 rounded-xl border border-network-red/25 bg-network-red/[.06] p-4 text-sm text-red-200" role="alert">Impossible de charger les formules disponibles.</p>}
        {!plansQuery.isPending && !plansQuery.isError && plans.length === 0 && <p className="mt-6 rounded-xl border border-dashed border-start-cream/15 p-6 text-sm text-start-cream/55">Aucune formule n’est disponible actuellement.</p>}
        {plans.length > 0 && <div className="mt-[clamp(48px,7vw,80px)] grid grid-cols-2 gap-4 max-md:grid-cols-1 max-sm:gap-3">
          {plans.map((candidate) => {
            const selected = plan === candidate.interval;
            return <button key={candidate.id} type="button" className={`relative rounded-2xl border p-5 text-left transition max-sm:rounded-xl max-sm:p-4 ${selected ? "border-start-gold bg-start-gold/[.08] shadow-[0_20px_60px_rgba(199,164,93,.12)]" : "border-start-cream/10 bg-[#121418] hover:border-start-gold/40"}`} aria-pressed={selected} onClick={() => setPlan(candidate.interval)}>
              <span className={`text-xs font-bold tracking-[.18em] uppercase ${candidate.interval === "monthly" ? "text-network-blue" : "text-network-yellow"}`}>{candidate.interval === "monthly" ? "Don mensuel" : "Don annuel"}</span>
              <div className="mt-3"><strong className="text-4xl">{new Intl.NumberFormat("fr-FR", { style: "currency", currency: candidate.currency, maximumFractionDigits: 0 }).format(candidate.priceCents / 100)}</strong><span className="text-start-cream/50"> / {candidate.interval === "monthly" ? "mois" : "an"}</span></div>
              <p className="mt-3 text-sm leading-5 text-start-cream/55">{candidate.interval === "monthly" ? "Don mensuel, renouvelé jusqu’à résiliation." : "Don annuel, renouvelé chaque année jusqu’à résiliation."}</p>
              <span className={`absolute top-5 right-5 inline-flex size-6 items-center justify-center rounded-full border max-sm:top-4 max-sm:right-4 ${selected ? "border-start-gold bg-start-gold text-start-ink" : "border-start-cream/20"}`}>{selected ? "✓" : ""}</span>
            </button>;
          })}
        </div>}

        <div className="mt-5 grid grid-cols-[1.15fr_.85fr] gap-5 max-lg:grid-cols-1 max-sm:mt-3 max-sm:gap-3">
          <section className="rounded-2xl border border-start-cream/10 bg-[#121418] p-[clamp(18px,3vw,28px)] max-sm:rounded-xl">
            <h2 className="text-2xl font-semibold max-sm:text-xl">Ce que permet votre don de soutien</h2>
            <ul className="mt-6 grid gap-4 p-0 max-sm:mt-4 max-sm:gap-3">{features.map((feature) => <li key={feature} className="flex items-start gap-3 text-start-cream/65"><span className="mt-0.5 shrink-0 text-start-gold">✓</span><span>{feature}</span></li>)}</ul>
            <p className="mt-7 border-t border-start-cream/10 pt-5 text-xs leading-5 text-start-cream/60">Votre don de soutien mensuel ou annuel permet la soumission d’annonces. Chaque annonce reste soumise aux règles de validation et de modération de START.</p>
          </section>

          <aside className="rounded-2xl border border-start-gold/25 bg-[#0b0d10]/90 p-[clamp(18px,3vw,28px)] max-sm:rounded-xl">
            <span className="text-xs font-bold tracking-[.18em] text-start-gold uppercase">Récapitulatif</span>
            {selectedPlan ? <div className="mt-5 flex items-end justify-between gap-4 border-b border-start-cream/10 pb-5 max-sm:items-start"><div><strong className="block">{selectedPlan.name}</strong><span className="text-sm text-start-cream/45">Renouvellement automatique</span></div><strong className="shrink-0 text-2xl text-start-gold">{formatter.format(selectedPlan.priceCents / 100)}</strong></div> : <p className="mt-5 text-sm text-start-cream/50">Sélectionnez une formule disponible.</p>}
            <div className="mt-6 rounded-xl border border-start-cream/10 p-4 text-sm leading-6 text-start-cream/55">Le paiement s’ouvre sur la page sécurisée Stripe. Les moyens disponibles, dont Google Pay sur les appareils compatibles, sont proposés directement par Stripe.</div>
            {!user && !isAuthLoading ? <div className="mt-5"><p className="text-sm leading-6 text-start-cream/60">Pour effectuer votre don de soutien mensuel ou annuel, créez un compte professionnel ou connectez-vous. Vous pourrez ensuite finaliser votre choix et le paiement sécurisé.</p><Link to="/inscription?type=professional&redirect=/abonnement" className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-start-gold px-5 text-center font-bold text-start-ink transition hover:bg-[#d5b66f]">Créer mon compte professionnel</Link><Link to="/connexion?redirect=/abonnement" className="mt-3 flex min-h-11 items-center justify-center rounded-xl border border-start-gold/40 px-5 text-center font-semibold text-start-gold transition hover:bg-start-gold/[.08]">J’ai déjà un compte professionnel</Link></div> : isAuthLoading || profileQuery.isPending ? <p className="mt-5 text-sm text-start-cream/60" role="status">Vérification de votre compte…</p> : !isProfessional ? <div className="mt-5"><p className="text-sm leading-6 text-start-cream/60">Le don de soutien est réservé aux comptes professionnels.</p><Link to="/publier/compte-professionnel-requis" className="mt-5 flex min-h-12 items-center justify-center rounded-xl border border-start-gold/40 px-5 text-center font-semibold text-start-gold transition hover:bg-start-gold/[.08]">Utiliser un compte professionnel</Link></div> : <><label className="mt-5 flex items-start gap-3 text-xs leading-5 text-start-cream/55"><input ref={termsInput} required checked={termsAccepted} onChange={(event) => { setTermsAccepted(event.target.checked); setCheckoutError(""); }} type="checkbox" className="mt-1 accent-[#c7a45d]" /><span>J’accepte les <Link to="/conditions-abonnement" className="text-start-gold underline underline-offset-4">conditions du don de soutien</Link>, notamment son renouvellement automatique et sa résiliation en fin de période.</span></label>{checkoutError && <p role="alert" className="mt-4 text-sm text-red-200">{checkoutError}</p>}<button type="button" disabled={!isSupabase || isEntitled || !selectedPlan || checkoutPending} onClick={() => void openCheckout()} className="mt-6 w-full rounded-xl bg-start-gold px-5 py-3.5 font-bold text-start-ink disabled:cursor-not-allowed disabled:opacity-55">{isEntitled ? "Don de soutien déjà actif" : checkoutPending ? "Ouverture du paiement…" : "Soutenir START"}</button><Link to="/espace/professionnel" className="mt-4 block text-center text-sm text-start-cream/45 hover:text-start-gold">Retour à mon espace professionnel</Link></>}
          </aside>
        </div>
      </div>
      </div>

      <StartNetworkCycle variant="list" />

      <section className="border-t border-start-cream/10 bg-[#0d1015] px-[clamp(16px,5vw,72px)] py-[clamp(44px,7vw,88px)]" aria-labelledby="subscription-faq-title">
        <div className="mx-auto max-w-5xl">
          <header className="max-w-3xl max-sm:text-center">
            <span className="text-xs font-bold tracking-[.22em] text-start-gold uppercase">Questions fréquentes</span>
            <h2 id="subscription-faq-title" className="mt-3 text-[clamp(2rem,4vw,3.4rem)] leading-tight font-bold tracking-[-.04em]">
              FAQ – Dons de soutien
            </h2>
          </header>

          <div className="mt-8 grid gap-x-12 max-sm:mt-6 lg:grid-cols-2">
            <div>
              <article className="border-b border-start-cream/10 py-7 first:pt-0">
                <h3 className="text-xl font-semibold">Comment effectuer mon don de soutien ?</h3>
                <p className="mt-4 leading-7 text-start-cream/60">Créez ou connectez votre compte professionnel, choisissez le don mensuel ou annuel, puis sélectionnez votre moyen de paiement. Votre soutien est activé après la validation du paiement.</p>
              </article>
              <article className="border-b border-start-cream/10 py-7">
                <h3 className="text-xl font-semibold">Puis-je modifier ou arrêter mon don ?</h3>
                <p className="mt-4 leading-7 text-start-cream/60">Vous pouvez gérer, modifier ou arrêter votre don de soutien depuis votre espace professionnel. Les modalités de renouvellement et de résiliation sont récapitulées avant la validation.</p>
              </article>
              <article className="border-b border-start-cream/10 py-7">
                <h3 className="text-xl font-semibold">Quels moyens de paiement sont acceptés ?</h3>
                <p className="mt-4 leading-7 text-start-cream/60">Vous pouvez effectuer votre don de soutien de manière sécurisée par carte bancaire ou avec Google Pay.</p>
              </article>
              <article className="border-b border-start-cream/10 py-7">
                <h3 className="text-xl font-semibold">Comment contacter le support ?</h3>
                <p className="mt-4 leading-7 text-start-cream/60">En cas de question sur votre compte ou votre abonnement, utilisez notre <Link to="/contact" className="font-semibold text-start-gold underline decoration-start-gold/35 underline-offset-4 hover:decoration-start-gold">formulaire de contact</Link>.</p>
              </article>
            </div>

            <div>
              <article className="border-b border-start-cream/10 py-7 first:pt-0">
                <h3 className="text-xl font-semibold">Quels dons de soutien sont proposés ?</h3>
                <p className="mt-4 leading-7 text-start-cream/60"><strong className="text-start-cream/85">Don mensuel de 7 € :</strong> renouvelé chaque mois. <strong className="text-start-cream/85">Don annuel de 84 € :</strong> renouvelé chaque année.</p>
              </article>
              <article className="border-b border-start-cream/10 py-7">
                <h3 className="text-xl font-semibold">Que permet le don de soutien professionnel ?</h3>
                <p className="mt-4 leading-7 text-start-cream/60">Il permet de créer un profil professionnel public, de gérer vos annonces et de les soumettre à START. La publication reste conditionnée à un don de soutien actif, à la validation du profil et à la modération de chaque annonce.</p>
              </article>
              <article className="border-b border-start-cream/10 py-7">
                <h3 className="text-xl font-semibold">Mon don ouvre-t-il droit à une réduction d’impôt ?</h3>
                <p className="mt-4 leading-7 text-start-cream/60">Un reçu fiscal est délivré pour votre don de soutien. Pour les entreprises, il peut ouvrir droit à une réduction d’impôt pouvant atteindre 60 %, selon les conditions et limites prévues par l’article 238 bis du Code général des impôts.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

    </ThemedPage>
  );
}
