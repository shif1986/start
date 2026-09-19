import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import ThemedPage from "../components/ThemedPage";
import { requestPasswordReset } from "../features/auth/api/auth-actions";
import { getDataSource } from "../lib/data-source";

const emailSchema = z.email("Adresse e-mail invalide.");

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    const parsed = emailSchema.safeParse(email.trim());
    if (!parsed.success) {
      setFeedback(parsed.error.issues[0]?.message ?? "Adresse e-mail invalide.");
      return;
    }
    if (getDataSource() !== "supabase") {
      setFeedback("La récupération réelle est indisponible tant que Supabase n’est pas configuré.");
      return;
    }

    setIsPending(true);
    try {
      await requestPasswordReset(parsed.data);
      setFeedback("Si un compte correspond à cette adresse, un lien de réinitialisation vient d’être envoyé. Vérifiez aussi les courriers indésirables.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Impossible d’envoyer l’e-mail de réinitialisation.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <ThemedPage ambiance="gold" className="grid min-h-[620px] place-items-center p-[clamp(18px,5vw,64px)]">
      <div className="w-full max-w-xl rounded-2xl border border-start-cream/10 bg-[#121418]/95 p-[clamp(22px,5vw,44px)] shadow-[0_28px_80px_rgba(0,0,0,.28)]">
        <span className="text-xs font-bold tracking-[.2em] text-start-gold uppercase">Accès au compte</span>
        <h1 className="mt-3 text-[clamp(1.65rem,3vw,2.8rem)] font-semibold tracking-[-.035em]">Mot de passe oublié</h1>
        <p className="mt-4 leading-7 text-start-cream/60">Saisissez votre adresse e-mail pour recevoir un lien sécurisé.</p>
        <form className="mt-8 grid gap-5" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <label className="grid gap-2 text-sm font-semibold text-start-cream/70">Adresse e-mail<input className="rounded-xl border border-start-cream/15 bg-[#0b0d10] px-4 py-3.5 font-normal text-start-cream outline-none focus:border-start-gold" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <button type="submit" disabled={isPending} className="rounded-xl bg-start-gold px-5 py-3.5 font-bold text-start-ink disabled:cursor-wait disabled:opacity-60">{isPending ? "Envoi…" : "Envoyer le lien"}</button>
        </form>
        {feedback && <p className="mt-5 rounded-xl border border-start-gold/20 bg-start-gold/[.05] px-4 py-3 text-sm leading-6 text-start-cream/75" role="status" aria-live="polite">{feedback}</p>}
        <p className="mt-6 text-center text-sm"><Link className="font-semibold text-start-gold" to="/connexion">Retour à la connexion</Link></p>
      </div>
    </ThemedPage>
  );
}
