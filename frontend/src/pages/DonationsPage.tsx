import { useMemo, useState, type FormEvent } from "react";
import ThemedPage from "../components/ThemedPage";

type DonationFrequency = "once" | "monthly";
type PaymentMethod = "card" | "google-pay";

const suggestedAmounts = [10, 25, 50, 100];

export default function DonationsPage() {
  const [frequency, setFrequency] = useState<DonationFrequency>("once");
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(25);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [previewMessage, setPreviewMessage] = useState("");

  const amount = useMemo(() => {
    if (selectedAmount !== "custom") return selectedAmount;
    const parsedAmount = Number(customAmount.replace(",", "."));
    return Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 0;
  }, [customAmount, selectedAmount]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPreviewMessage(
      amount > 0
        ? "Aucun débit n’a été effectué. Le paiement sécurisé sera activé après la connexion de Stripe côté serveur."
        : "Choisissez ou saisissez un montant supérieur à 0 €.",
    );
  }

  return (
    <ThemedPage ambiance="dark" showPattern={false} className="!bg-[radial-gradient(circle_at_50%_0%,rgba(199,164,93,.09),transparent_30%),linear-gradient(145deg,#191914_0%,#101319_48%,#090c12_100%)] px-[clamp(16px,5vw,72px)] py-[clamp(28px,5vw,72px)]">
      <div className="mx-auto max-w-6xl">
        <header data-no-scroll-reveal className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-start-cream/10 bg-[#121418]/72 px-[clamp(20px,5vw,56px)] py-[clamp(28px,5vw,48px)] text-center shadow-[inset_0_1px_0_rgba(255,255,255,.035),0_24px_70px_rgba(0,0,0,.2)]">
          <span className="mx-auto block h-px w-16 bg-start-gold/70" aria-hidden="true" />
          <span className="mx-auto mt-5 flex w-fit items-center gap-2" aria-hidden="true"><span className="size-2 rounded-full bg-network-blue" /><span className="size-2 rounded-full bg-network-yellow" /><span className="size-2 rounded-full bg-network-red" /></span>
          <span className="mt-4 block text-xs font-bold tracking-[.22em] text-start-gold uppercase">Soutenir la mission</span>
          <h1 className="mt-4 text-[clamp(2.2rem,5vw,4rem)] leading-[1.05] font-bold tracking-[-.045em]">Faire un don</h1>
          <p className="mx-auto mt-5 max-w-2xl text-[clamp(.92rem,1.3vw,1.05rem)] leading-7 text-start-cream/62">
            Votre soutien aide START à accompagner les initiatives locales, développer les outils du réseau et favoriser des projets porteurs de sens.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-[.82fr_1.18fr] items-start gap-8 max-lg:grid-cols-1 max-sm:mt-7">
          <section className="relative overflow-hidden rounded-2xl border border-start-gold/20 bg-[radial-gradient(circle_at_top_left,rgba(199,164,93,.1),transparent_38%),#17191e] p-[clamp(22px,4vw,36px)] shadow-[0_24px_70px_rgba(0,0,0,.22)] max-lg:order-2">
            <span className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-start-gold/80 via-start-gold/20 to-transparent" aria-hidden="true" />
            <span className="text-xs font-bold tracking-[.18em] text-network-yellow uppercase">Votre impact</span>
            <h2 className="mt-3 text-[clamp(1.5rem,3vw,2.2rem)] font-semibold">Ensemble, faisons grandir le réseau</h2>
            <p className="mt-4 text-sm leading-7 text-start-cream/60">Chaque contribution participe au développement d’un espace de confiance pour les particuliers, professionnels et initiatives chrétiennes.</p>

            <ul className="mt-7 grid gap-4 p-0">
              {["Soutenir les projets de proximité", "Développer les outils et ressources START", "Accompagner les membres et les initiatives"].map((impact) => (
                <li key={impact} className="flex items-start gap-3 text-sm text-start-cream/70">
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-network-blue/10 text-xs text-network-blue" aria-hidden="true">✓</span>
                  {impact}
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-xl border border-start-cream/10 bg-[#0b0d10]/55 p-4 text-xs leading-6 text-start-cream/45">
              Aperçu frontend : aucun paiement réel n’est actuellement encaissé sur cette page.
            </div>
          </section>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-start-cream/12 bg-[#14171d]/98 p-[clamp(20px,4vw,38px)] shadow-[inset_0_1px_0_rgba(255,255,255,.03),0_28px_80px_rgba(0,0,0,.3)] max-lg:order-1">
            <fieldset>
              <legend className="text-sm font-semibold text-start-cream/80">Type de don</legend>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setFrequency("once")} aria-pressed={frequency === "once"} className={`min-h-12 rounded-xl border px-4 py-3 text-sm font-semibold transition ${frequency === "once" ? "border-start-gold bg-start-gold/[.08] text-start-gold" : "border-start-cream/12 text-start-cream/60 hover:border-start-gold/35"}`}>Don ponctuel</button>
                <button type="button" onClick={() => setFrequency("monthly")} aria-pressed={frequency === "monthly"} className={`min-h-12 rounded-xl border px-4 py-3 text-sm font-semibold transition ${frequency === "monthly" ? "border-network-yellow bg-network-yellow/[.08] text-network-yellow" : "border-start-cream/12 text-start-cream/60 hover:border-network-yellow/35"}`}>Don mensuel</button>
              </div>
            </fieldset>

            <fieldset className="mt-7">
              <legend className="text-sm font-semibold text-start-cream/80">Montant du don</legend>
              <div className="mt-3 grid grid-cols-4 gap-3 max-sm:grid-cols-2">
                {suggestedAmounts.map((suggestedAmount) => (
                  <button key={suggestedAmount} type="button" onClick={() => { setSelectedAmount(suggestedAmount); setPreviewMessage(""); }} aria-pressed={selectedAmount === suggestedAmount} className={`min-h-12 rounded-xl border px-3 py-3 font-semibold transition ${selectedAmount === suggestedAmount ? "border-start-gold bg-start-gold text-start-ink" : "border-start-cream/12 text-start-cream/65 hover:border-start-gold/40"}`}>{suggestedAmount} €</button>
                ))}
              </div>
              <label className="mt-3 grid gap-2 text-sm text-start-cream/60">
                Autre montant
                <span className={`flex min-h-12 items-center rounded-xl border bg-[#080c12] transition focus-within:border-start-gold ${selectedAmount === "custom" ? "border-start-gold/60" : "border-start-cream/12"}`}>
                  <input type="number" min="1" step="1" inputMode="decimal" value={customAmount} onFocus={() => setSelectedAmount("custom")} onChange={(event) => { setSelectedAmount("custom"); setCustomAmount(event.target.value); setPreviewMessage(""); }} className="min-w-0 flex-1 bg-transparent px-4 text-start-cream outline-none" placeholder="Saisir un montant" aria-label="Montant personnalisé" />
                  <span className="pr-4 font-semibold text-start-gold">€</span>
                </span>
              </label>
            </fieldset>

            <fieldset className="mt-7">
              <legend className="text-sm font-semibold text-start-cream/80">Vos informations</legend>
              <div className="mt-3 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                <label className="grid gap-2 text-xs font-semibold tracking-wide text-start-cream/55 uppercase">Prénom<input required autoComplete="given-name" className="min-h-12 rounded-xl border border-start-cream/12 bg-[#080c12] px-4 font-normal tracking-normal text-start-cream normal-case outline-none focus:border-start-gold" /></label>
                <label className="grid gap-2 text-xs font-semibold tracking-wide text-start-cream/55 uppercase">Nom<input required autoComplete="family-name" className="min-h-12 rounded-xl border border-start-cream/12 bg-[#080c12] px-4 font-normal tracking-normal text-start-cream normal-case outline-none focus:border-start-gold" /></label>
              </div>
              <label className="mt-4 grid gap-2 text-xs font-semibold tracking-wide text-start-cream/55 uppercase">Adresse e-mail<input required type="email" autoComplete="email" className="min-h-12 rounded-xl border border-start-cream/12 bg-[#080c12] px-4 font-normal tracking-normal text-start-cream normal-case outline-none focus:border-start-gold" placeholder="vous@exemple.fr" /></label>
            </fieldset>

            <fieldset className="mt-7">
              <legend className="text-sm font-semibold text-start-cream/80">Mode de paiement</legend>
              <div className="mt-3 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <button type="button" onClick={() => setPaymentMethod("card")} aria-pressed={paymentMethod === "card"} className={`min-h-12 rounded-xl border px-4 py-3 text-sm font-semibold transition ${paymentMethod === "card" ? "border-start-gold text-start-gold" : "border-start-cream/12 text-start-cream/60"}`}>Carte bancaire</button>
                <button type="button" onClick={() => setPaymentMethod("google-pay")} aria-pressed={paymentMethod === "google-pay"} className={`min-h-12 rounded-xl border px-4 py-3 text-sm font-semibold transition ${paymentMethod === "google-pay" ? "border-network-blue text-network-blue" : "border-start-cream/12 text-start-cream/60"}`}>Google Pay</button>
              </div>
            </fieldset>

            <label className="mt-6 flex items-start gap-3 text-xs leading-5 text-start-cream/50">
              <input required type="checkbox" className="mt-1 accent-[#c7a45d]" />
              <span>J’accepte que mes informations soient utilisées pour traiter mon don et recevoir son récapitulatif.</span>
            </label>

            <div className="mt-7 flex items-end justify-between gap-4 border-t border-start-cream/10 pt-5">
              <div><span className="block text-xs text-start-cream/45">Total {frequency === "monthly" ? "mensuel" : "du don"}</span><strong className="text-3xl text-start-gold">{amount.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €</strong></div>
              <span className="text-right text-xs text-start-cream/40">{paymentMethod === "card" ? "Carte bancaire" : "Google Pay"}</span>
            </div>

            <button type="submit" className="mt-6 min-h-13 w-full rounded-xl bg-start-gold px-5 py-3.5 font-bold text-start-ink shadow-[0_14px_35px_rgba(199,164,93,.16)] transition hover:-translate-y-0.5 hover:bg-[#d5b66f]">Continuer vers le paiement sécurisé</button>
            <p className="mt-3 text-center text-[.68rem] leading-5 text-start-cream/35">Le paiement réel sera traité par Stripe après son intégration sécurisée côté serveur.</p>
            {previewMessage && <p className="mt-4 rounded-xl border border-network-blue/20 bg-network-blue/[.06] px-4 py-3 text-sm leading-6 text-start-cream/65" role="status" aria-live="polite">{previewMessage}</p>}
          </form>
        </div>
      </div>
    </ThemedPage>
  );
}
