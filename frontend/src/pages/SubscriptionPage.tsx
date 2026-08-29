import { useState } from "react";
import { Link } from "react-router-dom";
import StartNetworkCycle from "../components/StartNetworkCycle";
import ThemedPage from "../components/ThemedPage";
import { useCurrentSubscription } from "../features/subscriptions/hooks/use-current-subscription";
import { useSubscriptionPlans } from "../features/subscriptions/hooks/use-subscription-plans";
import type { SubscriptionPlan } from "../features/subscriptions/model/subscription.types";
import { getDataSource } from "../lib/data-source";

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
  const plansQuery = useSubscriptionPlans(isSupabase);
  const subscriptionQuery = useCurrentSubscription(isSupabase);
  const [plan, setPlan] = useState<Plan>("monthly");
  const plans = isSupabase ? plansQuery.data ?? [] : previewPlans;
  const selectedPlan = plans.find((candidate) => candidate.interval === plan) ?? plans[0];
  const currentSubscription = subscriptionQuery.data;
  const isEntitled = currentSubscription?.status === "active" || currentSubscription?.status === "trialing";
  const formatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: selectedPlan?.currency ?? "EUR" });

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
              Nos abonnements
            </span>
            <h1 className="mt-6 text-[clamp(1.65rem,3vw,2.8rem)] leading-[1.08] font-bold tracking-[-.035em]">
              Développez votre présence.<br className="max-sm:hidden" />
              <span className="text-start-gold">Faites grandir votre réseau.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[clamp(.9rem,1.2vw,1.05rem)] leading-7 text-start-cream/62">
              Choisissez la formule professionnelle qui vous convient et rejoignez
              une communauté chrétienne engagée au service de votre activité.
            </p>
          </header>

          {isSupabase && subscriptionQuery.isPending && <p className="mt-6 rounded-xl border border-start-cream/10 px-4 py-3 text-sm text-start-cream/60" aria-live="polite">Chargement de votre abonnement…</p>}
          {isSupabase && subscriptionQuery.isError && <p className="mt-6 rounded-xl border border-network-red/25 bg-network-red/[.06] px-4 py-3 text-sm text-red-200" role="alert">Impossible de vérifier votre abonnement pour le moment.</p>}
          {isSupabase && currentSubscription && <div className="mt-6 rounded-xl border border-network-blue/20 bg-network-blue/[.055] px-4 py-3 text-sm leading-6 text-start-cream/70"><strong className="text-start-cream">{isEntitled ? "Abonnement actif" : "Paiement à régulariser"}</strong> · {currentSubscription.plan.name}{currentSubscription.currentPeriodEnd ? ` jusqu’au ${new Intl.DateTimeFormat("fr-FR").format(new Date(currentSubscription.currentPeriodEnd))}` : ""}{currentSubscription.cancelAtPeriodEnd ? " · Résiliation prévue en fin de période" : ""}</div>}
          {!isSupabase && <div className="mt-6 rounded-xl border border-network-blue/20 bg-network-blue/[.055] px-4 py-2.5 text-sm leading-6 text-start-cream/65 max-sm:mt-4 max-sm:text-xs max-sm:leading-5">Aperçu frontend — aucun paiement ne sera débité.</div>}

        {isSupabase && plansQuery.isPending && <p className="mt-6 rounded-xl border border-dashed border-start-cream/15 p-6 text-sm text-start-cream/55" aria-live="polite">Chargement des formules…</p>}
        {isSupabase && plansQuery.isError && <p className="mt-6 rounded-xl border border-network-red/25 bg-network-red/[.06] p-4 text-sm text-red-200" role="alert">Impossible de charger les formules disponibles.</p>}
        {!plansQuery.isPending && !plansQuery.isError && plans.length === 0 && <p className="mt-6 rounded-xl border border-dashed border-start-cream/15 p-6 text-sm text-start-cream/55">Aucune formule n’est disponible actuellement.</p>}
        {plans.length > 0 && <div className="mt-[clamp(48px,7vw,80px)] grid grid-cols-2 gap-4 max-md:grid-cols-1 max-sm:gap-3">
          {plans.map((candidate) => {
            const selected = plan === candidate.interval;
            return <button key={candidate.id} type="button" className={`relative rounded-2xl border p-5 text-left transition max-sm:rounded-xl max-sm:p-4 ${selected ? "border-start-gold bg-start-gold/[.08] shadow-[0_20px_60px_rgba(199,164,93,.12)]" : "border-start-cream/10 bg-[#121418] hover:border-start-gold/40"}`} aria-pressed={selected} onClick={() => setPlan(candidate.interval)}>
              <span className={`text-xs font-bold tracking-[.18em] uppercase ${candidate.interval === "monthly" ? "text-network-blue" : "text-network-yellow"}`}>{candidate.interval === "monthly" ? "Mensuel" : "Annuel"}</span>
              <div className="mt-3"><strong className="text-4xl">{new Intl.NumberFormat("fr-FR", { style: "currency", currency: candidate.currency, maximumFractionDigits: 0 }).format(candidate.priceCents / 100)}</strong><span className="text-start-cream/50"> / {candidate.interval === "monthly" ? "mois" : "an"}</span></div>
              <p className="mt-3 text-sm leading-5 text-start-cream/55">{candidate.interval === "monthly" ? "Paiement mensuel, renouvelable jusqu’à résiliation." : "Un seul paiement pour douze mois d’accès professionnel."}</p>
              <span className={`absolute top-5 right-5 inline-flex size-6 items-center justify-center rounded-full border max-sm:top-4 max-sm:right-4 ${selected ? "border-start-gold bg-start-gold text-start-ink" : "border-start-cream/20"}`}>{selected ? "✓" : ""}</span>
            </button>;
          })}
        </div>}

        <div className="mt-5 grid grid-cols-[1.15fr_.85fr] gap-5 max-lg:grid-cols-1 max-sm:mt-3 max-sm:gap-3">
          <section className="rounded-2xl border border-start-cream/10 bg-[#121418] p-[clamp(18px,3vw,28px)] max-sm:rounded-xl">
            <h2 className="text-2xl font-semibold max-sm:text-xl">Inclus dans votre abonnement</h2>
            <ul className="mt-6 grid gap-4 p-0 max-sm:mt-4 max-sm:gap-3">{features.map((feature) => <li key={feature} className="flex items-start gap-3 text-start-cream/65"><span className="mt-0.5 shrink-0 text-start-gold">✓</span><span>{feature}</span></li>)}</ul>
            <p className="mt-7 border-t border-start-cream/10 pt-5 text-xs leading-5 text-start-cream/40">L’abonnement autorise la soumission d’annonces. Chaque annonce reste soumise aux règles de validation et de modération de START.</p>
          </section>

          <aside className="rounded-2xl border border-start-gold/25 bg-[#0b0d10]/90 p-[clamp(18px,3vw,28px)] max-sm:rounded-xl">
            <span className="text-xs font-bold tracking-[.18em] text-start-gold uppercase">Récapitulatif</span>
            {selectedPlan ? <div className="mt-5 flex items-end justify-between gap-4 border-b border-start-cream/10 pb-5 max-sm:items-start"><div><strong className="block">{selectedPlan.name}</strong><span className="text-sm text-start-cream/45">Renouvellement automatique</span></div><strong className="shrink-0 text-2xl text-start-gold">{formatter.format(selectedPlan.priceCents / 100)}</strong></div> : <p className="mt-5 text-sm text-start-cream/50">Sélectionnez une formule disponible.</p>}
            <div className="mt-6 rounded-xl border border-start-cream/10 p-4 text-sm leading-6 text-start-cream/55">Le paiement sécurisé sera ouvert uniquement après connexion du serveur Stripe et de son webhook signé.</div>
            <button type="button" disabled className="mt-6 w-full cursor-not-allowed rounded-xl bg-start-gold px-5 py-3.5 font-bold text-start-ink opacity-55">{isEntitled ? "Abonnement déjà actif" : "Paiement bientôt disponible"}</button>
            <Link to="/espace/professionnel" className="mt-4 block text-center text-sm text-start-cream/45 hover:text-start-gold">Retour à mon espace professionnel</Link>
          </aside>
        </div>
      </div>
      </div>

      <StartNetworkCycle />

      <section className="border-t border-start-cream/10 bg-[#0d1015] px-[clamp(16px,5vw,72px)] py-[clamp(44px,7vw,88px)]" aria-labelledby="subscription-faq-title">
        <div className="mx-auto max-w-5xl">
          <header className="max-w-3xl max-sm:text-center">
            <span className="text-xs font-bold tracking-[.22em] text-start-gold uppercase">Questions fréquentes</span>
            <h2 id="subscription-faq-title" className="mt-3 text-[clamp(2rem,4vw,3.4rem)] leading-tight font-bold tracking-[-.04em]">
              FAQ – Abonnements
            </h2>
          </header>

          <article className="relative mt-8 overflow-hidden rounded-2xl border border-start-gold/25 bg-[radial-gradient(circle_at_top_right,rgba(199,164,93,.12),transparent_38%),#15171b] p-[clamp(20px,4vw,40px)] max-sm:mt-6 max-sm:rounded-xl">
            <span className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-start-gold via-start-gold/30 to-transparent" aria-hidden="true" />
            <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr] lg:gap-12">
              <div>
                <span className="text-xs font-bold tracking-[.18em] text-network-yellow uppercase">Votre abonnement a un impact concret</span>
                <h3 className="mt-3 text-[clamp(1.55rem,3vw,2.35rem)] leading-tight font-semibold">
                  Investissez utilement et soutenez nos actions
                </h3>
                <p className="mt-4 leading-7 text-start-cream/65">
                  En souscrivant, vous contribuez directement au développement de START et à la continuité de ses actions d’intérêt général.
                </p>
              </div>
              <div>
                <p className="font-semibold text-start-cream/85">Votre soutien permet notamment de :</p>
                <ul className="mt-4 grid gap-3 text-sm leading-6 text-start-cream/65">
                  <li className="flex gap-3"><span className="text-start-gold">✓</span><span>assurer la maintenance et l’amélioration continue de la plateforme ;</span></li>
                  <li className="flex gap-3"><span className="text-start-gold">✓</span><span>organiser des conventions, formations et événements dédiés à l’entrepreneuriat ;</span></li>
                  <li className="flex gap-3"><span className="text-start-gold">✓</span><span>financer des missions humanitaires en Afrique et en Amérique du Sud.</span></li>
                </ul>
                <p className="mt-5 border-t border-start-cream/10 pt-5 text-sm leading-6 text-start-cream/50">
                  Après couverture des frais indispensables au fonctionnement du projet, les fonds disponibles sont consacrés au financement des actions humanitaires, dans le respect de la mission de START.
                </p>
              </div>
            </div>
          </article>

          <div className="mt-10 grid gap-x-12 max-sm:mt-8 lg:grid-cols-2">
            <div>
              <article className="border-b border-start-cream/10 py-7 first:pt-0">
                <h3 className="text-xl font-semibold">Comment souscrire à un abonnement ?</h3>
                <p className="mt-4 leading-7 text-start-cream/60">Créez ou connectez votre compte professionnel, choisissez la formule mensuelle ou annuelle, puis sélectionnez votre moyen de paiement. Votre abonnement est activé après la validation du paiement.</p>
              </article>
              <article className="border-b border-start-cream/10 py-7">
                <h3 className="text-xl font-semibold">Puis-je modifier ou annuler mon abonnement ?</h3>
                <p className="mt-4 leading-7 text-start-cream/60">Vous pouvez gérer, modifier ou résilier votre abonnement depuis votre espace professionnel. Les modalités de renouvellement et de résiliation sont récapitulées avant la validation.</p>
              </article>
              <article className="border-b border-start-cream/10 py-7">
                <h3 className="text-xl font-semibold">Quels moyens de paiement sont acceptés ?</h3>
                <p className="mt-4 leading-7 text-start-cream/60">Vous pouvez régler votre abonnement de manière sécurisée par carte bancaire ou avec Google Pay.</p>
              </article>
              <article className="border-b border-start-cream/10 py-7">
                <h3 className="text-xl font-semibold">Comment contacter le support ?</h3>
                <p className="mt-4 leading-7 text-start-cream/60">En cas de question sur votre compte ou votre abonnement, utilisez notre <Link to="/contact" className="font-semibold text-start-gold underline decoration-start-gold/35 underline-offset-4 hover:decoration-start-gold">formulaire de contact</Link>.</p>
              </article>
            </div>

            <div>
              <article className="border-b border-start-cream/10 py-7 first:pt-0">
                <h3 className="text-xl font-semibold">Quels abonnements sont proposés ?</h3>
                <p className="mt-4 leading-7 text-start-cream/60"><strong className="text-start-cream/85">Pro mensuel à 7 € :</strong> une formule flexible, renouvelée chaque mois. <strong className="text-start-cream/85">Pro annuel à 84 € :</strong> un paiement unique donnant accès aux services professionnels pendant douze mois.</p>
              </article>
              <article className="border-b border-start-cream/10 py-7">
                <h3 className="text-xl font-semibold">Que permet l’abonnement professionnel ?</h3>
                <p className="mt-4 leading-7 text-start-cream/60">Il permet de créer un profil professionnel public, de gérer vos annonces et de les soumettre à START. La publication reste conditionnée à un abonnement actif, à la validation du profil et à la modération de chaque annonce.</p>
              </article>
              <article className="border-b border-start-cream/10 py-7">
                <h3 className="text-xl font-semibold">Mon abonnement ouvre-t-il droit à une réduction d’impôt de 60 % ?</h3>
                <p className="mt-4 leading-7 text-start-cream/60">Votre abonnement peut ouvrir droit à une réduction d’impôt de 60 % lorsqu’il remplit les conditions légales du mécénat et qu’un reçu fiscal peut être délivré.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

    </ThemedPage>
  );
}
