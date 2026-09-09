import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import ThemedPage from "../components/ThemedPage";
import { createDonationCheckout, getDonationStatus, type DonationStatus } from "../features/donations/api/donation-billing";

type DonationFrequency = "once" | "monthly";
const suggestedAmounts = [10, 25, 50, 100];

export default function DonationsPage() {
  const [frequency, setFrequency] = useState<DonationFrequency>("once");
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(25);
  const [customAmount, setCustomAmount] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [confirmedDonation, setConfirmedDonation] = useState<DonationStatus | null>(null);
  const [searchParams] = useSearchParams();

  const amount = useMemo(() => {
    if (selectedAmount !== "custom") return selectedAmount;
    const parsedAmount = Number(customAmount.replace(",", "."));
    return Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 0;
  }, [customAmount, selectedAmount]);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return;
    setFeedbackMessage("Confirmation du paiement en cours…");
    void getDonationStatus(sessionId).then((result) => {
      setConfirmedDonation(result);
      setFeedbackMessage(result.status === "succeeded" || result.status === "active" ? "Merci, votre don a été confirmé par Stripe." : "Le paiement est encore en cours de confirmation.");
    }).catch((error) => setFeedbackMessage(error instanceof Error ? error.message : "Impossible de confirmer ce don."));
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (amount < 1 || amount > 10_000) { setFeedbackMessage("Choisissez un montant compris entre 1 € et 10 000 €."); return; }
    setPending(true);
    setFeedbackMessage("");
    try {
      const url = await createDonationCheckout({ amountCents: Math.round(amount * 100), frequency, firstName, lastName, email, consent: true });
      window.location.assign(url);
    } catch (error) {
      setFeedbackMessage(error instanceof Error ? error.message : "Impossible d’ouvrir le paiement.");
      setPending(false);
    }
  }

  return (
    <ThemedPage ambiance="dark" showPattern={false} className="!bg-[radial-gradient(circle_at_50%_0%,rgba(199,164,93,.09),transparent_30%),linear-gradient(145deg,#191914_0%,#101319_48%,#090c12_100%)] px-[clamp(16px,5vw,72px)] py-[clamp(28px,5vw,72px)]">
      <div className="mx-auto max-w-6xl">
        <header data-no-scroll-reveal className="mx-auto max-w-3xl text-center">
          <span className="mx-auto block h-px w-24 bg-start-gold/70" aria-hidden="true" />
          <span className="mx-auto mt-6 flex w-fit items-center gap-3" aria-hidden="true"><span className="size-2 rounded-full bg-network-blue" /><span className="size-2 rounded-full bg-network-yellow" /><span className="size-2 rounded-full bg-network-red" /></span>
          <span className="mt-5 block text-[.65rem] font-bold tracking-[.2em] text-start-gold uppercase">Soutenir la mission</span>
          <h1 className="mt-6 text-[clamp(1.65rem,3vw,2.8rem)] leading-[1.08] font-bold tracking-[-.035em]">Faire un don</h1>
          <p className="mx-auto mt-5 max-w-2xl text-[clamp(.92rem,1.3vw,1.05rem)] leading-7 text-start-cream/62">
            Votre soutien aide START à accompagner les initiatives locales, développer les outils du réseau et favoriser des projets porteurs de sens.
          </p>
        </header>

        {searchParams.get("checkout") === "cancelled" && <p role="status" className="mx-auto mt-8 max-w-3xl rounded-xl border border-start-gold/25 p-4 text-center text-start-cream/65">Le paiement a été annulé. Aucun don n’a été confirmé.</p>}
        {confirmedDonation && (confirmedDonation.status === "succeeded" || confirmedDonation.status === "active") && <p role="status" className="mx-auto mt-8 max-w-3xl rounded-xl border border-network-blue/30 bg-network-blue/[.06] p-4 text-center text-start-cream/80">Merci ! Don de {(confirmedDonation.amountCents / 100).toLocaleString("fr-FR")} € {confirmedDonation.frequency === "monthly" ? "mensuel" : "ponctuel"} confirmé.</p>}

        <div className="mt-[clamp(48px,7vw,80px)] grid grid-cols-[.82fr_1.18fr] items-start gap-8 max-lg:grid-cols-1">
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
                  <button key={suggestedAmount} type="button" onClick={() => { setSelectedAmount(suggestedAmount); setFeedbackMessage(""); }} aria-pressed={selectedAmount === suggestedAmount} className={`min-h-12 rounded-xl border px-3 py-3 font-semibold transition ${selectedAmount === suggestedAmount ? "border-start-gold bg-start-gold text-start-ink" : "border-start-cream/12 text-start-cream/65 hover:border-start-gold/40"}`}>{suggestedAmount} €</button>
                ))}
              </div>
              <label className="mt-3 grid gap-2 text-sm text-start-cream/60">
                Autre montant
                <span className={`flex min-h-12 items-center rounded-xl border bg-[#080c12] transition focus-within:border-start-gold ${selectedAmount === "custom" ? "border-start-gold/60" : "border-start-cream/12"}`}>
                  <input type="number" min="1" step="1" inputMode="decimal" value={customAmount} onFocus={() => setSelectedAmount("custom")} onChange={(event) => { setSelectedAmount("custom"); setCustomAmount(event.target.value); setFeedbackMessage(""); }} className="min-h-12 min-w-0 flex-1 bg-transparent px-4 text-start-cream outline-none" placeholder="Saisir un montant" aria-label="Montant personnalisé" />
                  <span className="pr-4 font-semibold text-start-gold">€</span>
                </span>
              </label>
            </fieldset>

            <fieldset className="mt-7">
              <legend className="text-sm font-semibold text-start-cream/80">Vos informations</legend>
              <div className="mt-3 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                <label className="grid gap-2 text-xs font-semibold tracking-wide text-start-cream/55 uppercase">Prénom<input required maxLength={80} value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" className="min-h-12 rounded-xl border border-start-cream/12 bg-[#080c12] px-4 font-normal tracking-normal text-start-cream normal-case outline-none focus:border-start-gold" /></label>
                <label className="grid gap-2 text-xs font-semibold tracking-wide text-start-cream/55 uppercase">Nom<input required maxLength={80} value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" className="min-h-12 rounded-xl border border-start-cream/12 bg-[#080c12] px-4 font-normal tracking-normal text-start-cream normal-case outline-none focus:border-start-gold" /></label>
              </div>
              <label className="mt-4 grid gap-2 text-xs font-semibold tracking-wide text-start-cream/55 uppercase">Adresse e-mail<input required type="email" maxLength={160} value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="min-h-12 rounded-xl border border-start-cream/12 bg-[#080c12] px-4 font-normal tracking-normal text-start-cream normal-case outline-none focus:border-start-gold" placeholder="vous@exemple.fr" /></label>
            </fieldset>

            <div className="mt-7 rounded-xl border border-start-cream/10 p-4 text-sm leading-6 text-start-cream/55">Stripe proposera uniquement les moyens disponibles pour votre appareil et votre navigateur, notamment la carte et Google Pay lorsqu’il est éligible.</div>

            <label className="mt-6 flex items-start gap-3 text-xs leading-5 text-start-cream/50">
              <input required checked={consent} onChange={(event) => setConsent(event.target.checked)} type="checkbox" className="mt-1 accent-[#c7a45d]" />
              <span>J’accepte que mes informations soient utilisées pour traiter mon don et recevoir son récapitulatif.</span>
            </label>

            <div className="mt-7 flex items-end justify-between gap-4 border-t border-start-cream/10 pt-5">
              <div><span className="block text-xs text-start-cream/45">Total {frequency === "monthly" ? "mensuel" : "du don"}</span><strong className="text-3xl text-start-gold">{amount.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €</strong></div>
              <span className="text-right text-xs text-start-cream/40">Paiement sécurisé Stripe</span>
            </div>

            <button type="submit" disabled={pending || !consent} className="mt-6 min-h-13 w-full rounded-xl bg-start-gold px-5 py-3.5 font-bold text-start-ink shadow-[0_14px_35px_rgba(199,164,93,.16)] transition hover:-translate-y-0.5 hover:bg-[#d5b66f] disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Ouverture du paiement…" : "Continuer vers le paiement sécurisé"}</button>
            <p className="mt-3 text-center text-[.68rem] leading-5 text-start-cream/35">Vos informations de paiement sont protégées par un traitement sécurisé.</p>
            {feedbackMessage && <p className="mt-4 rounded-xl border border-network-blue/20 bg-network-blue/[.06] px-4 py-3 text-sm leading-6 text-start-cream/65" role="status" aria-live="polite">{feedbackMessage}</p>}
          </form>
        </div>
      </div>
    </ThemedPage>
  );
}
