import { useState } from "react";
import { Link } from "react-router-dom";
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
    <ThemedPage ambiance="gold" className="p-[clamp(18px,5vw,72px)]">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-xl border border-[#4da3ff]/20 bg-[#4da3ff]/[.055] px-4 py-3 text-sm text-start-cream/65">
          Aperçu frontend — aucun paiement ne sera débité. Stripe et Google Pay seront connectés ultérieurement.
        </div>

        <header className="mx-auto mt-12 max-w-3xl text-center">
          <span className="text-xs font-bold tracking-[.22em] text-start-gold uppercase">Abonnement professionnel</span>
          <h1 className="mt-4 text-[clamp(2.4rem,6vw,5rem)] font-semibold tracking-[-.05em]">Développez votre présence sur START</h1>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-start-cream/60">Un abonnement actif et la validation de votre profil professionnel sont nécessaires pour publier une annonce.</p>
        </header>

        <div className="mt-14 grid grid-cols-2 gap-6 max-md:grid-cols-1">
          <button type="button" className={`relative rounded-2xl border p-7 text-left transition ${plan === "monthly" ? "border-start-gold bg-start-gold/[.08] shadow-[0_20px_60px_rgba(199,164,93,.12)]" : "border-start-cream/10 bg-[#121418] hover:border-start-gold/40"}`} aria-pressed={plan === "monthly"} onClick={() => setPlan("monthly")}>
            <span className="text-xs font-bold tracking-[.18em] text-start-gold uppercase">Mensuel</span>
            <div className="mt-4"><strong className="text-5xl">7 €</strong><span className="text-start-cream/50"> / mois</span></div>
            <p className="mt-4 text-sm leading-6 text-start-cream/55">Paiement mensuel, renouvelable jusqu’à résiliation.</p>
            <span className={`absolute top-6 right-6 inline-flex size-6 items-center justify-center rounded-full border ${plan === "monthly" ? "border-start-gold bg-start-gold text-start-ink" : "border-start-cream/20"}`}>{plan === "monthly" ? "✓" : ""}</span>
          </button>

          <button type="button" className={`relative rounded-2xl border p-7 text-left transition ${plan === "yearly" ? "border-start-gold bg-start-gold/[.08] shadow-[0_20px_60px_rgba(199,164,93,.12)]" : "border-start-cream/10 bg-[#121418] hover:border-start-gold/40"}`} aria-pressed={plan === "yearly"} onClick={() => setPlan("yearly")}>
            <span className="text-xs font-bold tracking-[.18em] text-start-gold uppercase">Annuel</span>
            <div className="mt-4"><strong className="text-5xl">84 €</strong><span className="text-start-cream/50"> / an</span></div>
            <p className="mt-4 text-sm leading-6 text-start-cream/55">Un seul paiement pour douze mois d’accès professionnel.</p>
            <span className={`absolute top-6 right-6 inline-flex size-6 items-center justify-center rounded-full border ${plan === "yearly" ? "border-start-gold bg-start-gold text-start-ink" : "border-start-cream/20"}`}>{plan === "yearly" ? "✓" : ""}</span>
          </button>
        </div>

        <div className="mt-8 grid grid-cols-[1.15fr_.85fr] gap-7 max-lg:grid-cols-1">
          <section className="rounded-2xl border border-start-cream/10 bg-[#121418] p-[clamp(22px,4vw,36px)]">
            <h2 className="text-2xl font-semibold">Inclus dans votre abonnement</h2>
            <ul className="mt-6 grid gap-4 p-0">{features.map((feature) => <li key={feature} className="flex items-start gap-3 text-start-cream/65"><span className="mt-0.5 text-start-gold">✓</span><span>{feature}</span></li>)}</ul>
            <p className="mt-7 border-t border-start-cream/10 pt-5 text-xs leading-5 text-start-cream/40">L’abonnement autorise la soumission d’annonces. Chaque annonce reste soumise aux règles de validation et de modération de START.</p>
          </section>

          <aside className="rounded-2xl border border-start-gold/25 bg-[#0b0d10]/90 p-[clamp(22px,4vw,36px)]">
            <span className="text-xs font-bold tracking-[.18em] text-start-gold uppercase">Récapitulatif</span>
            <div className="mt-5 flex items-end justify-between gap-4 border-b border-start-cream/10 pb-5"><div><strong className="block">Formule {plan === "monthly" ? "mensuelle" : "annuelle"}</strong><span className="text-sm text-start-cream/45">Renouvellement automatique</span></div><strong className="text-2xl text-start-gold">{price} €</strong></div>
            <fieldset className="mt-6"><legend className="text-sm font-semibold text-start-cream/70">Mode de paiement</legend><div className="mt-3 grid grid-cols-2 gap-3 max-sm:grid-cols-1"><button type="button" className={`min-h-12 rounded-xl border px-4 py-3 text-sm font-semibold ${paymentMethod === "card" ? "border-start-gold text-start-gold" : "border-start-cream/10 text-start-cream/55"}`} onClick={() => setPaymentMethod("card")}>Carte bancaire</button><button type="button" className={`min-h-12 rounded-xl border px-4 py-3 text-sm font-semibold ${paymentMethod === "google" ? "border-start-gold text-start-gold" : "border-start-cream/10 text-start-cream/55"}`} onClick={() => setPaymentMethod("google")}>Google Pay</button></div></fieldset>
            <button type="button" className="mt-6 w-full rounded-xl bg-start-gold px-5 py-3.5 font-bold text-start-ink">Continuer vers le paiement</button>
            <Link to="/espace/professionnel" className="mt-4 block text-center text-sm text-start-cream/45 hover:text-start-gold">Retour à mon espace professionnel</Link>
          </aside>
        </div>
      </div>
    </ThemedPage>
  );
}
