import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ThemedPage from "../components/ThemedPage";
import { useAuth } from "../features/auth/context/use-auth";
import { createReport } from "../features/reports/api/create-report";
import { getDataSource } from "../lib/data-source";
import type { Database } from "../lib/supabase/database.types";

type SubmissionState = "idle" | "sending" | "success" | "error";

const fieldClassName = "min-h-12 rounded-xl border border-start-cream/15 bg-[#080c12]/78 px-4 font-normal text-start-cream outline-none transition placeholder:text-start-cream/30 hover:border-start-cream/25 focus:border-start-gold focus:ring-2 focus:ring-start-gold/15 disabled:cursor-not-allowed disabled:opacity-60";

export default function ReportContentPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const endpoint = import.meta.env.VITE_REPORT_ENDPOINT?.trim();
    const listingId = searchParams.get("listing");
    const formData = Object.fromEntries(new FormData(form).entries());

    if (getDataSource() === "supabase" && listingId && !user) {
      setSubmissionState("error");
      setFeedback("Connectez-vous avec un compte actif pour signaler cette annonce.");
      return;
    }

    if (getDataSource() === "supabase" && user && listingId) {
      setSubmissionState("sending"); setFeedback("");
      try {
        await createReport({ reporterId: user.id, listingId, reason: formData.reason as Database["public"]["Enums"]["report_reason"], details: String(formData.details ?? "") });
        form.reset(); setSubmissionState("success"); setFeedback("Votre signalement a bien été enregistré pour modération.");
      } catch (error) { setSubmissionState("error"); setFeedback(error instanceof Error ? error.message : "L’envoi n’a pas abouti."); }
      return;
    }

    if (!endpoint) {
      setSubmissionState("error");
      setFeedback("Le service de signalement est momentanément indisponible. Utilisez le formulaire de contact ou réessayez plus tard.");
      return;
    }

    setSubmissionState("sending");
    setFeedback("");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, source: "Signalement START" }),
      });
      if (!response.ok) throw new Error("Report submission failed");

      form.reset();
      setSubmissionState("success");
      setFeedback("Votre signalement a bien été reçu. Nous vous informerons de la suite donnée à l’adresse indiquée.");
    } catch {
      setSubmissionState("error");
      setFeedback("L’envoi n’a pas abouti. Vérifiez votre connexion ou utilisez le formulaire de contact.");
    }
  }

  const isSending = submissionState === "sending";

  return (
    <ThemedPage ambiance="dark" showPattern={false} className="discreet-network-background px-[clamp(20px,5vw,72px)] py-[clamp(32px,5vw,72px)]">
      <div className="mx-auto max-w-5xl">
        <header className="mx-auto max-w-3xl text-center">
          <span className="mx-auto block h-px w-24 bg-start-gold/70" aria-hidden="true" />
          <span className="mx-auto mt-6 flex w-fit items-center gap-3" aria-hidden="true"><span className="size-2 rounded-full bg-network-blue" /><span className="size-2 rounded-full bg-network-yellow" /><span className="size-2 rounded-full bg-network-red" /></span>
          <span className="mt-5 block text-[.65rem] font-bold tracking-[.2em] text-start-gold uppercase">Sécurité de la plateforme</span>
          <h1 className="mt-6 text-[clamp(1.65rem,3vw,2.8rem)] leading-[1.08] font-bold tracking-[-.035em]">Signaler un contenu</h1>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-start-cream/62">Signalez une annonce ou un contenu que vous estimez illégal, frauduleux ou contraire aux règles de START.</p>
        </header>

        <div className="mt-[clamp(48px,7vw,80px)] grid items-start gap-7 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="rounded-2xl border border-start-gold/20 bg-[#121418]/92 p-[clamp(24px,4vw,36px)]">
            <h2 className="text-xl font-semibold">Avant de signaler</h2>
            <ul className="mt-5 grid gap-3 pl-5 text-sm leading-6 text-start-cream/65 [list-style:disc]">
              <li>indiquez précisément pourquoi le contenu serait illégal ou interdit ;</li>
              <li>fournissez l’adresse exacte de l’annonce ou du contenu ;</li>
              <li>ajoutez les faits et éléments permettant de vérifier rapidement le signalement ;</li>
              <li>n’utilisez pas ce formulaire pour une urgence immédiate.</li>
            </ul>
            <p className="mt-6 border-t border-start-cream/10 pt-5 text-xs leading-5 text-start-cream/45">En cas de danger immédiat, contactez les services d’urgence compétents. Pour une simple question de compte, utilisez le <Link to="/contact" className="text-start-gold underline underline-offset-4">support</Link>.</p>
          </aside>

          <form className="rounded-2xl border border-start-cream/10 bg-[#14171c]/94 p-[clamp(24px,4vw,44px)] shadow-[0_28px_80px_rgba(0,0,0,.28)]" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-start-cream/75">Nom complet<input className={fieldClassName} name="name" type="text" autoComplete="name" minLength={2} maxLength={100} required disabled={isSending} /></label>
              <label className="grid gap-2 text-sm font-semibold text-start-cream/75">Adresse e-mail<input className={fieldClassName} name="email" type="email" autoComplete="email" maxLength={160} required disabled={isSending} /></label>
              <label className="grid gap-2 text-sm font-semibold text-start-cream/75 sm:col-span-2">URL du contenu<input className={fieldClassName} name="contentUrl" type="url" inputMode="url" placeholder="https://…" maxLength={500} required disabled={isSending} /></label>
              <label className="grid gap-2 text-sm font-semibold text-start-cream/75 sm:col-span-2">Motif du signalement<select className={fieldClassName} name="reason" required defaultValue="" disabled={isSending}><option value="" disabled>Sélectionnez un motif</option><option value="forbidden_content">Contenu ou service interdit</option><option value="scam">Fraude ou arnaque</option><option value="spam">Spam</option><option value="wrong_category">Mauvaise catégorie</option><option value="counterfeit">Contrefaçon</option><option value="already_sold">Annonce déjà vendue</option><option value="other">Autre violation</option></select></label>
              <label className="grid gap-2 text-sm font-semibold text-start-cream/75 sm:col-span-2">Explication détaillée<textarea className={`${fieldClassName} min-h-44 resize-y py-3.5`} name="details" rows={7} minLength={20} maxLength={5000} required disabled={isSending} /></label>
            </div>
            <label className="mt-6 flex items-start gap-3 text-sm leading-6 text-start-cream/65"><input className="mt-1 size-4 shrink-0 accent-[#c7a45d]" type="checkbox" name="goodFaith" required disabled={isSending} /><span>Je confirme de bonne foi que les informations fournies sont exactes et complètes.</span></label>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <button type="submit" disabled={isSending} className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-start-gold px-6 font-bold text-start-ink transition hover:bg-[#d5b66f] disabled:cursor-wait disabled:opacity-65">{isSending ? "Envoi en cours…" : "Envoyer le signalement"}</button>
            {feedback && <div className={`mt-5 rounded-xl border px-4 py-3 text-sm leading-6 ${submissionState === "success" ? "border-emerald-400/25 bg-emerald-400/[.07] text-emerald-200" : "border-network-red/25 bg-network-red/[.07] text-red-200"}`} role={submissionState === "error" ? "alert" : "status"} aria-live="polite">{feedback}</div>}
            {getDataSource() === "supabase" && searchParams.get("listing") && !user && <Link to={`/connexion?redirect=${encodeURIComponent(`/signaler-un-contenu?listing=${searchParams.get("listing")}`)}`} className="mt-4 flex min-h-11 items-center justify-center rounded-xl border border-start-gold/30 text-sm font-semibold text-start-gold">Se connecter pour signaler</Link>}
            <p className="mt-5 text-xs leading-5 text-start-cream/40">Les informations sont utilisées pour examiner le signalement, vous contacter et respecter les obligations légales de modération.</p>
          </form>
        </div>
      </div>
    </ThemedPage>
  );
}
