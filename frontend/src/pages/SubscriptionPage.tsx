import { useState } from "react";
import { Link } from "react-router-dom";
import StartNetworkCycle from "../components/StartNetworkCycle";
import ThemedPage from "../components/ThemedPage";

type Plan = "monthly" | "yearly";

const features = [
  "Créer et gérer vos annonces professionnelles",
  "Afficher un profil professionnel public",
  "Recevoir les contacts des membres particuliers",
  "Accéder aux avis et statistiques de vos annonces",
  "Soumettre vos annonces à la validation START",
];

export default function SubscriptionPage() {
  const [plan, setPlan] = useState<Plan>("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "google">("card");
  const price = plan === "monthly" ? 7 : 84;

  return (
    <ThemedPage
      ambiance="dark"
      showPattern={false}
      className="discreet-network-background"
    >
      <div className="px-[clamp(14px,4vw,52px)] pt-[clamp(14px,4vw,48px)] pb-[clamp(40px,5vw,72px)]">
        <div className="mx-auto max-w-5xl">
          <header className="relative overflow-hidden rounded-2xl border border-start-cream/10 bg-[#121418]/72 px-[clamp(18px,4vw,48px)] py-[clamp(26px,4.5vw,52px)] text-center shadow-[inset_0_1px_0_rgba(255,255,255,.035),0_24px_70px_rgba(0,0,0,.2)] max-sm:rounded-xl">
            <span className="mx-auto block h-px w-16 bg-start-gold/70" aria-hidden="true" />
            <span className="mx-auto mt-4 flex w-fit items-center gap-2" aria-hidden="true">
              <span className="size-2 rounded-full bg-network-blue" />
              <span className="size-2 rounded-full bg-network-yellow" />
              <span className="size-2 rounded-full bg-network-red" />
            </span>
            <span className="mt-3 block text-[.7rem] font-bold tracking-[.22em] text-start-gold uppercase">
              Nos abonnements
            </span>
            <h1 className="mt-4 text-[clamp(1.65rem,3vw,2.8rem)] leading-[1.08] font-bold tracking-[-.035em]">
              Développez votre présence.<br className="max-sm:hidden" />
              <span className="text-start-gold">Faites grandir votre réseau.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[clamp(.9rem,1.2vw,1.05rem)] leading-7 text-start-cream/62">
              Choisissez la formule professionnelle qui vous convient et rejoignez
              une communauté chrétienne engagée au service de votre activité.
            </p>
          </header>

          <div className="mt-6 rounded-xl border border-network-blue/20 bg-network-blue/[.055] px-4 py-2.5 text-sm leading-6 text-start-cream/65 max-sm:mt-4 max-sm:text-xs max-sm:leading-5">
            Aperçu frontend — aucun paiement ne sera débité. Stripe et Google Pay seront connectés ultérieurement.
          </div>

        <div className="mt-6 grid grid-cols-2 gap-4 max-md:grid-cols-1 max-sm:mt-4 max-sm:gap-3">
          <button type="button" className={`relative rounded-2xl border p-5 text-left transition max-sm:rounded-xl max-sm:p-4 ${plan === "monthly" ? "border-start-gold bg-start-gold/[.08] shadow-[0_20px_60px_rgba(199,164,93,.12)]" : "border-start-cream/10 bg-[#121418] hover:border-start-gold/40"}`} aria-pressed={plan === "monthly"} onClick={() => setPlan("monthly")}>
            <span className="text-xs font-bold tracking-[.18em] text-network-blue uppercase">Mensuel</span>
            <div className="mt-3"><strong className="text-4xl">7 €</strong><span className="text-start-cream/50"> / mois</span></div>
            <p className="mt-3 text-sm leading-5 text-start-cream/55">Paiement mensuel, renouvelable jusqu’à résiliation.</p>
            <span className={`absolute top-5 right-5 inline-flex size-6 items-center justify-center rounded-full border max-sm:top-4 max-sm:right-4 ${plan === "monthly" ? "border-start-gold bg-start-gold text-start-ink" : "border-start-cream/20"}`}>{plan === "monthly" ? "✓" : ""}</span>
          </button>

          <button type="button" className={`relative rounded-2xl border p-5 text-left transition max-sm:rounded-xl max-sm:p-4 ${plan === "yearly" ? "border-start-gold bg-start-gold/[.08] shadow-[0_20px_60px_rgba(199,164,93,.12)]" : "border-start-cream/10 bg-[#121418] hover:border-start-gold/40"}`} aria-pressed={plan === "yearly"} onClick={() => setPlan("yearly")}>
            <span className="text-xs font-bold tracking-[.18em] text-network-yellow uppercase">Annuel</span>
            <div className="mt-3"><strong className="text-4xl">84 €</strong><span className="text-start-cream/50"> / an</span></div>
            <p className="mt-3 text-sm leading-5 text-start-cream/55">Un seul paiement pour douze mois d’accès professionnel.</p>
            <span className={`absolute top-5 right-5 inline-flex size-6 items-center justify-center rounded-full border max-sm:top-4 max-sm:right-4 ${plan === "yearly" ? "border-start-gold bg-start-gold text-start-ink" : "border-start-cream/20"}`}>{plan === "yearly" ? "✓" : ""}</span>
          </button>
        </div>

        <div className="mt-5 grid grid-cols-[1.15fr_.85fr] gap-5 max-lg:grid-cols-1 max-sm:mt-3 max-sm:gap-3">
          <section className="rounded-2xl border border-start-cream/10 bg-[#121418] p-[clamp(18px,3vw,28px)] max-sm:rounded-xl">
            <h2 className="text-2xl font-semibold max-sm:text-xl">Inclus dans votre abonnement</h2>
            <ul className="mt-6 grid gap-4 p-0 max-sm:mt-4 max-sm:gap-3">{features.map((feature) => <li key={feature} className="flex items-start gap-3 text-start-cream/65"><span className="mt-0.5 shrink-0 text-start-gold">✓</span><span>{feature}</span></li>)}</ul>
            <p className="mt-7 border-t border-start-cream/10 pt-5 text-xs leading-5 text-start-cream/40">L’abonnement autorise la soumission d’annonces. Chaque annonce reste soumise aux règles de validation et de modération de START.</p>
          </section>

          <aside className="rounded-2xl border border-start-gold/25 bg-[#0b0d10]/90 p-[clamp(18px,3vw,28px)] max-sm:rounded-xl">
            <span className="text-xs font-bold tracking-[.18em] text-start-gold uppercase">Récapitulatif</span>
            <div className="mt-5 flex items-end justify-between gap-4 border-b border-start-cream/10 pb-5 max-sm:items-start"><div><strong className="block">Formule {plan === "monthly" ? "mensuelle" : "annuelle"}</strong><span className="text-sm text-start-cream/45">Renouvellement automatique</span></div><strong className="shrink-0 text-2xl text-start-gold">{price} €</strong></div>
            <fieldset className="mt-6"><legend className="text-sm font-semibold text-start-cream/70">Mode de paiement</legend><div className="mt-3 grid grid-cols-2 gap-3 max-sm:grid-cols-1"><button type="button" className={`min-h-12 rounded-xl border px-4 py-3 text-sm font-semibold ${paymentMethod === "card" ? "border-start-gold text-start-gold" : "border-start-cream/10 text-start-cream/55"}`} onClick={() => setPaymentMethod("card")}>Carte bancaire</button><button type="button" className={`min-h-12 rounded-xl border px-4 py-3 text-sm font-semibold ${paymentMethod === "google" ? "border-start-gold text-start-gold" : "border-start-cream/10 text-start-cream/55"}`} onClick={() => setPaymentMethod("google")}>Google Pay</button></div></fieldset>
            <button type="button" className="mt-6 w-full rounded-xl bg-start-gold px-5 py-3.5 font-bold text-start-ink">Continuer vers le paiement</button>
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
                <p className="mt-4 leading-7 text-start-cream/60">Créez ou connectez votre compte professionnel, choisissez la formule mensuelle ou annuelle sur cette page, puis sélectionnez votre moyen de paiement. L’activation définitive sera disponible après l’intégration sécurisée de Stripe.</p>
              </article>
              <article className="border-b border-start-cream/10 py-7">
                <h3 className="text-xl font-semibold">Puis-je modifier ou annuler mon abonnement ?</h3>
                <p className="mt-4 leading-7 text-start-cream/60">La gestion de l’abonnement sera accessible depuis votre espace professionnel. Les modalités précises de modification, de renouvellement et de résiliation seront affichées avant tout paiement réel.</p>
              </article>
              <article className="border-b border-start-cream/10 py-7">
                <h3 className="text-xl font-semibold">Quels moyens de paiement seront acceptés ?</h3>
                <p className="mt-4 leading-7 text-start-cream/60">Le paiement sécurisé par carte bancaire et Google Pay est prévu via Stripe. Pour le moment, cette page est une maquette et aucun débit n’est effectué.</p>
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
                <h3 className="text-xl font-semibold">Puis-je bénéficier d’un avantage fiscal ?</h3>
                <p className="mt-4 leading-7 text-start-cream/60">L’article 134 de la loi de finances pour 2020 prévoit un taux de 60 % pour certains versements effectués par des entreprises au profit d’organismes sans but lucratif venant en aide aux personnes en difficulté. Ce régime ne s’applique pas automatiquement à tout abonnement : l’éligibilité dépend notamment du statut de l’organisme, de la nature du versement, des éventuelles contreparties et de l’émission d’un reçu fiscal.</p>
                <p className="mt-3 text-xs leading-5 text-start-cream/40">Cette information est générale et ne constitue pas un conseil fiscal. Vérifiez votre situation auprès de l’administration fiscale ou de votre conseiller.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

    </ThemedPage>
  );
}
