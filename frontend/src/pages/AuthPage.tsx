import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ThemedPage from "../components/ThemedPage";
import { isGoogleAuthEnabled, signInWithEmail, signInWithGoogle, signUpWithEmail } from "../features/auth/api/auth-actions";
import { createAuthSchema, type AuthFormValues } from "../features/auth/model/auth-schema";
import { getDataSource } from "../lib/data-source";

function safeRedirect(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : undefined;
}

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedProfessional = isRegister && searchParams.get("type") === "professional";
  const [accountType, setAccountType] = useState<"customer" | "professional">(requestedProfessional ? "professional" : "customer");
  const [feedback, setFeedback] = useState("");
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState<boolean | null>(null);
  const redirect = safeRedirect(searchParams.get("redirect"));
  const redirectQuery = redirect ? `?redirect=${encodeURIComponent(redirect)}` : "";
  const loginPath = `/connexion${redirectQuery}`;
  const registerPath = `/inscription${redirectQuery}`;
  const dataSource = getDataSource();
  const accountHome = accountType === "professional"
    ? isRegister ? "/abonnement" : "/espace/professionnel"
    : "/espace/particulier";
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(createAuthSchema(isRegister)),
    defaultValues: { email: "", password: "", displayName: "" },
  });

  useEffect(() => {
    if (dataSource !== "supabase") {
      setGoogleEnabled(false);
      return;
    }
    let active = true;
    void isGoogleAuthEnabled().then((enabled) => {
      if (active) setGoogleEnabled(enabled);
    }).catch(() => {
      if (active) setGoogleEnabled(false);
    });
    return () => { active = false; };
  }, [dataSource]);

  async function handleEmailSubmit(values: AuthFormValues) {
    setFeedback("");

    if (dataSource === "static") {
      setFeedback("La connexion réelle est indisponible : configurez Supabase puis redémarrez l’application.");
      return;
    }

    try {
      if (isRegister) {
        const data = await signUpWithEmail({
          email: values.email,
          password: values.password,
          displayName: values.displayName.trim(),
          accountType,
          redirectPath: accountType === "professional" ? "/abonnement" : "/espace/particulier",
        });
        if (!data.session) {
          setFeedback("Vérifiez votre adresse e-mail pour confirmer votre compte.");
          return;
        }
      } else {
        await signInWithEmail({ email: values.email, password: values.password });
      }

      const requestedPath = redirect && (!isRegister || accountType === "professional") ? redirect : accountHome;
      navigate(`/auth/callback?next=${encodeURIComponent(requestedPath)}`, { replace: true });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "L’authentification n’a pas abouti.");
    }
  }

  async function handleGoogle() {
    if (dataSource === "static") {
      setFeedback("La connexion Google est indisponible tant que Supabase n’est pas configuré.");
      return;
    }
    if (!googleEnabled) {
      setFeedback("La connexion Google doit encore être activée dans Supabase.");
      return;
    }

    setFeedback("");
    setIsGooglePending(true);
    try {
      await signInWithGoogle(redirect ?? accountHome, accountType);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "La connexion Google n’a pas abouti.");
      setIsGooglePending(false);
    }
  }

  const fieldClassName = "rounded-xl border border-start-cream/15 bg-[#0b0d10] px-4 py-3.5 font-normal text-start-cream outline-none focus:border-start-gold";
  return (
    <ThemedPage ambiance="gold" className="grid min-h-[680px] place-items-center p-[clamp(18px,5vw,64px)]">
      <div className="w-full max-w-xl rounded-2xl border border-start-cream/10 bg-[#121418]/95 p-[clamp(22px,5vw,44px)] shadow-[0_28px_80px_rgba(0,0,0,.28)]">
        <nav className="mb-8 grid grid-cols-2 rounded-xl border border-start-cream/10 bg-[#0b0d10] p-1" aria-label="Accès au compte">
          <Link to={loginPath} aria-current={!isRegister ? "page" : undefined} className={`flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition ${!isRegister ? "bg-start-gold text-start-ink" : "text-start-cream/55 hover:text-start-gold"}`}>Se connecter</Link>
          <Link to={registerPath} aria-current={isRegister ? "page" : undefined} className={`flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition ${isRegister ? "bg-start-gold text-start-ink" : "text-start-cream/55 hover:text-start-gold"}`}>Créer un compte</Link>
        </nav>
        <span className="text-xs font-bold tracking-[.2em] text-start-gold uppercase">{isRegister ? "Rejoindre START" : "Bienvenue"}</span>
        <h1 className="mt-3 text-[clamp(1.65rem,3vw,2.8rem)] font-semibold tracking-[-.035em]">{isRegister ? "Créer un compte" : "Se connecter"}</h1>
        {dataSource === "static" && <p className="mt-3 text-start-cream/55">Mode de démonstration local. Activez Supabase pour créer une session réelle.</p>}

        {requestedProfessional && <p className="mt-5 rounded-xl border border-start-gold/25 bg-start-gold/[.06] px-4 py-3 text-sm text-start-cream/65">Créez votre compte professionnel, puis choisissez votre abonnement pour continuer vers la publication.</p>}

        {isRegister && <fieldset className="mt-8"><legend className="text-sm font-semibold text-start-cream/75">Type de compte</legend><div className="mt-3 grid grid-cols-2 gap-3 max-sm:grid-cols-1"><label className={`rounded-xl border p-4 ${accountType === "customer" ? "border-start-gold/35 bg-start-gold/[.06]" : "border-start-cream/10 bg-[#0b0d10]"}`}><input type="radio" name="account-type" value="customer" checked={accountType === "customer"} onChange={() => setAccountType("customer")} className="mr-2 accent-[#c7a45d]" /><strong>Particulier</strong><span className="mt-2 block text-xs text-start-cream/50">Gratuit : contact, favoris et avis.</span></label><label className={`rounded-xl border p-4 ${accountType === "professional" ? "border-start-gold/35 bg-start-gold/[.06]" : "border-start-cream/10 bg-[#0b0d10]"}`}><input type="radio" name="account-type" value="professional" checked={accountType === "professional"} onChange={() => setAccountType("professional")} className="mr-2 accent-[#c7a45d]" /><strong>Professionnel</strong><span className="mt-2 block text-xs text-start-cream/50">Profil pro et abonnement pour publier.</span></label></div></fieldset>}

        <button type="button" disabled={googleEnabled !== true || isGooglePending || form.formState.isSubmitting} onClick={() => void handleGoogle()} className="mt-8 flex min-h-13 w-full items-center justify-center gap-3 rounded-xl border border-start-cream/15 bg-start-cream px-5 font-semibold text-start-ink transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">
          <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" /><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.24-2.54c-.9.61-2.05.97-3.39.97-2.61 0-4.82-1.77-5.61-4.14H3.04v2.62A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.39 13.86A6 6 0 0 1 6.08 12c0-.65.11-1.28.31-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.48l3.35-2.62Z" /><path fill="#EA4335" d="M12 6c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6 12 6Z" /></svg>
          {isGooglePending ? "Redirection…" : googleEnabled === false ? "Google bientôt disponible" : "Continuer avec Google"}
        </button>

        <div className="my-6 flex items-center gap-4 text-xs font-semibold tracking-[.14em] text-start-cream/35 uppercase"><span className="h-px flex-1 bg-start-cream/10" />ou par e-mail<span className="h-px flex-1 bg-start-cream/10" /></div>

        <form className="grid gap-5" noValidate onSubmit={form.handleSubmit(handleEmailSubmit)}>
          {isRegister && <label className="grid gap-2 text-sm font-semibold text-start-cream/70">Nom complet<input className={fieldClassName} type="text" autoComplete="name" aria-invalid={Boolean(form.formState.errors.displayName)} {...form.register("displayName")} />{form.formState.errors.displayName && <span className="text-xs text-red-300">{form.formState.errors.displayName.message}</span>}</label>}
          <label className="grid gap-2 text-sm font-semibold text-start-cream/70">Adresse e-mail<input className={fieldClassName} type="email" autoComplete="email" aria-invalid={Boolean(form.formState.errors.email)} {...form.register("email")} />{form.formState.errors.email && <span className="text-xs text-red-300">{form.formState.errors.email.message}</span>}</label>
          <label className="grid gap-2 text-sm font-semibold text-start-cream/70">Mot de passe<input className={fieldClassName} type="password" autoComplete={isRegister ? "new-password" : "current-password"} aria-invalid={Boolean(form.formState.errors.password)} {...form.register("password")} />{form.formState.errors.password && <span className="text-xs text-red-300">{form.formState.errors.password.message}</span>}</label>
          <button className="rounded-xl bg-start-gold px-5 py-3.5 font-bold text-start-ink disabled:cursor-wait disabled:opacity-60" disabled={form.formState.isSubmitting || isGooglePending} type="submit">{form.formState.isSubmitting ? "Traitement…" : requestedProfessional ? "Créer mon compte et choisir mon abonnement" : isRegister ? "Créer mon compte" : "Se connecter"}</button>
        </form>
        {feedback && <p className="mt-5 rounded-xl border border-start-gold/20 bg-start-gold/[.05] px-4 py-3 text-sm text-start-cream/75" role="status" aria-live="polite">{feedback}</p>}
        <p className="mt-6 text-center text-sm text-start-cream/55">{isRegister ? "Déjà membre ?" : "Pas encore de compte ?"} <Link className="font-semibold text-start-gold" to={isRegister ? loginPath : registerPath}>{isRegister ? "Se connecter" : "Créer un compte gratuit"}</Link></p>
      </div>
    </ThemedPage>
  );
}
