import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import ThemedPage from "../components/ThemedPage";
import { updatePassword } from "../features/auth/api/auth-actions";
import { useAuth } from "../features/auth/context/use-auth";

const passwordSchema = z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères.");

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setFeedback(parsed.error.issues[0]?.message ?? "Mot de passe invalide.");
      return;
    }
    if (password !== confirmation) {
      setFeedback("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setIsPending(true);
    try {
      await updatePassword(parsed.data);
      navigate("/auth/callback", { replace: true });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Impossible de modifier le mot de passe.");
      setIsPending(false);
    }
  }

  if (isLoading) return <div className="grid min-h-[55vh] place-content-center text-start-cream/65" role="status">Vérification du lien…</div>;

  return (
    <ThemedPage ambiance="gold" className="grid min-h-[620px] place-items-center p-[clamp(18px,5vw,64px)]">
      <div className="w-full max-w-xl rounded-2xl border border-start-cream/10 bg-[#121418]/95 p-[clamp(22px,5vw,44px)] shadow-[0_28px_80px_rgba(0,0,0,.28)]">
        <span className="text-xs font-bold tracking-[.2em] text-start-gold uppercase">Sécurité du compte</span>
        <h1 className="mt-3 text-[clamp(1.65rem,3vw,2.8rem)] font-semibold tracking-[-.035em]">Nouveau mot de passe</h1>
        {!session ? <><p className="mt-5 rounded-xl border border-red-300/30 bg-red-400/10 px-4 py-3 leading-7 text-start-cream" role="alert">Le lien est invalide ou a expiré.</p><Link className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-start-gold px-6 font-bold text-start-ink" to="/mot-de-passe-oublie">Demander un nouveau lien</Link></> : <form className="mt-8 grid gap-5" onSubmit={(event) => void handleSubmit(event)} noValidate><label className="grid gap-2 text-sm font-semibold text-start-cream/70">Nouveau mot de passe<input className="rounded-xl border border-start-cream/15 bg-[#0b0d10] px-4 py-3.5 font-normal text-start-cream outline-none focus:border-start-gold" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><label className="grid gap-2 text-sm font-semibold text-start-cream/70">Confirmer le mot de passe<input className="rounded-xl border border-start-cream/15 bg-[#0b0d10] px-4 py-3.5 font-normal text-start-cream outline-none focus:border-start-gold" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label><button type="submit" disabled={isPending} className="rounded-xl bg-start-gold px-5 py-3.5 font-bold text-start-ink disabled:cursor-wait disabled:opacity-60">{isPending ? "Mise à jour…" : "Enregistrer le nouveau mot de passe"}</button>{feedback && <p className="rounded-xl border border-start-gold/20 bg-start-gold/[.05] px-4 py-3 text-sm leading-6 text-start-cream/75" role="status" aria-live="polite">{feedback}</p>}</form>}
      </div>
    </ThemedPage>
  );
}
