import { useState, type FormEvent } from "react";
import ThemedPage from "../components/ThemedPage";

type SubmissionState = "idle" | "sending" | "success" | "error";

const fieldClassName = "min-h-12 rounded-xl border border-start-cream/15 bg-[#080c12]/75 px-4 font-normal text-start-cream outline-none transition placeholder:text-start-cream/30 hover:border-start-cream/25 focus:border-start-gold focus:ring-2 focus:ring-start-gold/15 disabled:cursor-not-allowed disabled:opacity-60";

export default function ContactPage() {
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT?.trim();

    if (!endpoint) {
      setSubmissionState("error");
      setFeedback("Le service d’envoi n’est pas encore configuré. Veuillez réessayer plus tard.");
      return;
    }

    setSubmissionState("sending");
    setFeedback("");
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, source: "Site START Réseau Chrétien" }),
      });
      if (!response.ok) throw new Error("Contact submission failed");

      form.reset();
      setSubmissionState("success");
      setFeedback("Votre message a bien été envoyé. Notre équipe vous répondra dans les meilleurs délais.");
    } catch {
      setSubmissionState("error");
      setFeedback("L’envoi n’a pas abouti. Vérifiez votre connexion puis réessayez dans quelques instants.");
    }
  }

  const isSending = submissionState === "sending";

  return (
    <ThemedPage ambiance="network" showPattern={false} className="discreet-network-background contact-network-test px-[clamp(20px,5vw,72px)] py-[clamp(32px,5vw,72px)]">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-3xl text-center">
          <span className="mx-auto block h-px w-24 bg-start-gold/70" aria-hidden="true" />
          <span className="mx-auto mt-6 flex w-fit items-center gap-3" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-network-blue shadow-[0_0_14px_rgba(77,163,255,.16)]" />
            <span className="size-2.5 rounded-full bg-network-yellow shadow-[0_0_14px_rgba(255,179,61,.14)]" />
            <span className="size-2.5 rounded-full bg-network-red shadow-[0_0_14px_rgba(255,77,79,.14)]" />
          </span>
          <span className="mt-5 block text-[.65rem] font-bold tracking-[.2em] text-start-gold uppercase">
            Nous contacter
          </span>
          <h1 className="mt-6 text-[clamp(1.65rem,3vw,2.8rem)] leading-[1.08] font-bold tracking-[-.035em]">
            Une question, un projet ?
            <span className="mt-1 block text-start-gold">Échangeons ensemble.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[clamp(.9rem,1.2vw,1rem)] leading-7 text-start-cream/62">Une question sur START, votre compte ou le réseau ? Écrivez-nous : notre équipe prendra le temps de vous répondre.</p>
        </header>

        <div className="mt-[clamp(36px,6vw,64px)] grid gap-7 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="relative overflow-hidden rounded-2xl border border-start-gold/20 bg-[radial-gradient(circle_at_top_left,rgba(199,164,93,.11),transparent_46%),#15171b] p-[clamp(26px,4vw,42px)] shadow-[0_24px_70px_rgba(0,0,0,.22)]">
            <span className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-start-gold/80 via-start-gold/20 to-transparent" aria-hidden="true" />
            <span className="text-xs font-bold tracking-[.18em] text-start-gold uppercase">À votre écoute</span>
            <h2 className="mt-4 text-[clamp(1.55rem,3vw,2.25rem)] leading-tight font-semibold">Chaque échange peut créer une nouvelle connexion.</h2>
            <p className="mt-5 leading-7 text-start-cream/58">Décrivez-nous votre besoin avec le plus de précision possible. Les informations transmises servent uniquement à traiter votre demande.</p>
            <div className="mt-9 space-y-5 border-t border-start-cream/10 pt-7 text-sm text-start-cream/66">
              <div className="flex gap-4"><span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-network-blue/25 bg-network-blue/[.07] text-network-blue" aria-hidden="true"><svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6.5 12 13l8-6.5"/><rect x="3" y="5" width="18" height="14" rx="2"/></svg></span><div><strong className="block text-start-cream">Réponse personnalisée</strong><span className="mt-1 block">Votre demande arrive directement à l’équipe START.</span></div></div>
              <div className="flex gap-4"><span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-network-yellow/25 bg-network-yellow/[.07] text-network-yellow" aria-hidden="true"><svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><div><strong className="block text-start-cream">Dans les meilleurs délais</strong><span className="mt-1 block">Nous revenons vers vous dès que possible.</span></div></div>
            </div>
          </aside>

          <form className="rounded-2xl border border-start-cream/10 bg-[#14171c]/90 p-[clamp(24px,4vw,44px)] shadow-[0_28px_80px_rgba(0,0,0,.28)]" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-start-cream/75">Nom complet <span className="sr-only">(obligatoire)</span><input className={fieldClassName} type="text" name="name" autoComplete="name" minLength={2} maxLength={100} placeholder="Votre nom" required disabled={isSending} /></label>
              <label className="grid gap-2 text-sm font-semibold text-start-cream/75">Adresse e-mail <span className="sr-only">(obligatoire)</span><input className={fieldClassName} type="email" name="email" autoComplete="email" maxLength={160} placeholder="vous@exemple.fr" required disabled={isSending} /></label>
              <label className="grid gap-2 text-sm font-semibold text-start-cream/75 sm:col-span-2">Téléphone <span className="font-normal text-start-cream/40">(facultatif)</span><input className={fieldClassName} type="tel" name="phone" autoComplete="tel" maxLength={30} placeholder="06 00 00 00 00" disabled={isSending} /></label>
              <label className="grid gap-2 text-sm font-semibold text-start-cream/75 sm:col-span-2">Votre message <span className="sr-only">(obligatoire)</span><textarea className={`${fieldClassName} min-h-40 resize-y py-3.5`} name="message" rows={6} minLength={10} maxLength={3000} placeholder="Comment pouvons-nous vous aider ?" required disabled={isSending} /></label>
            </div>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <div className="mt-7 flex items-center justify-between gap-5 max-sm:flex-col max-sm:items-stretch">
              <p className="max-w-sm text-xs leading-5 text-start-cream/42">En envoyant ce formulaire, vous acceptez que vos informations soient utilisées pour répondre à votre demande.</p>
              <button type="submit" disabled={isSending} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-start-gold px-6 font-bold text-start-ink transition hover:bg-[#d5b66f] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-start-gold disabled:cursor-wait disabled:opacity-65 max-sm:w-full">{isSending ? "Envoi en cours…" : "Envoyer le message"}{!isSending && <span aria-hidden="true">→</span>}</button>
            </div>
            {feedback && <div className={`mt-6 rounded-xl border px-4 py-3 text-sm leading-6 ${submissionState === "success" ? "border-emerald-400/25 bg-emerald-400/[.07] text-emerald-200" : "border-network-red/25 bg-network-red/[.07] text-red-200"}`} role={submissionState === "error" ? "alert" : "status"} aria-live="polite">{feedback}</div>}
          </form>
        </div>
      </div>
    </ThemedPage>
  );
}
