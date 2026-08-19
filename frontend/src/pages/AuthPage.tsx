import { Link } from "react-router-dom";
import ThemedPage from "../components/ThemedPage";

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  return (
    <ThemedPage ambiance="gold" className="grid min-h-[680px] place-items-center p-[clamp(18px,5vw,64px)]">
      <div className="w-full max-w-xl rounded-2xl border border-start-cream/10 bg-[#121418]/95 p-[clamp(22px,5vw,44px)] shadow-[0_28px_80px_rgba(0,0,0,.28)]">
        <span className="text-xs font-bold tracking-[.2em] text-start-gold uppercase">{isRegister ? "Rejoindre START" : "Bienvenue"}</span>
        <h1 className="mt-3 text-[clamp(2rem,5vw,3.5rem)] font-semibold tracking-[-.04em]">{isRegister ? "Créer un compte" : "Se connecter"}</h1>
        <p className="mt-3 text-start-cream/55">Interface frontend uniquement. La création de session sera reliée au backend ultérieurement.</p>

        {isRegister && <fieldset className="mt-8"><legend className="text-sm font-semibold text-start-cream/75">Type de compte</legend><div className="mt-3 grid grid-cols-2 gap-3 max-sm:grid-cols-1"><label className="rounded-xl border border-start-gold/35 bg-start-gold/[.06] p-4"><input type="radio" name="account-type" value="customer" defaultChecked className="mr-2 accent-[#c7a45d]" /><strong>Particulier</strong><span className="mt-2 block text-xs text-start-cream/50">Gratuit : contact, favoris et avis.</span></label><label className="rounded-xl border border-start-cream/10 bg-[#0b0d10] p-4"><input type="radio" name="account-type" value="professional" className="mr-2 accent-[#c7a45d]" /><strong>Professionnel</strong><span className="mt-2 block text-xs text-start-cream/50">Profil pro et abonnement pour publier.</span></label></div></fieldset>}

        <button type="button" className="mt-8 flex min-h-13 w-full items-center justify-center gap-3 rounded-xl border border-start-cream/15 bg-start-cream px-5 font-semibold text-start-ink transition hover:-translate-y-0.5 hover:bg-white">
          <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
            <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.24-2.54c-.9.61-2.05.97-3.39.97-2.61 0-4.82-1.77-5.61-4.14H3.04v2.62A10 10 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.39 13.86A6 6 0 0 1 6.08 12c0-.65.11-1.28.31-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.48l3.35-2.62Z" />
            <path fill="#EA4335" d="M12 6c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6 12 6Z" />
          </svg>
          Continuer avec Google
        </button>

        <div className="my-6 flex items-center gap-4 text-xs font-semibold tracking-[.14em] text-start-cream/35 uppercase">
          <span className="h-px flex-1 bg-start-cream/10" />
          ou par e-mail
          <span className="h-px flex-1 bg-start-cream/10" />
        </div>

        <form className="grid gap-5" onSubmit={(event) => event.preventDefault()}>
          {isRegister && <label className="grid gap-2 text-sm font-semibold text-start-cream/70">Nom complet<input className="rounded-xl border border-start-cream/15 bg-[#0b0d10] px-4 py-3.5 font-normal text-start-cream outline-none focus:border-start-gold" type="text" autoComplete="name" /></label>}
          <label className="grid gap-2 text-sm font-semibold text-start-cream/70">Adresse e-mail<input className="rounded-xl border border-start-cream/15 bg-[#0b0d10] px-4 py-3.5 font-normal text-start-cream outline-none focus:border-start-gold" type="email" autoComplete="email" /></label>
          <label className="grid gap-2 text-sm font-semibold text-start-cream/70">Mot de passe<input className="rounded-xl border border-start-cream/15 bg-[#0b0d10] px-4 py-3.5 font-normal text-start-cream outline-none focus:border-start-gold" type="password" autoComplete={isRegister ? "new-password" : "current-password"} /></label>
          <button className="rounded-xl bg-start-gold px-5 py-3.5 font-bold text-start-ink" type="submit">{isRegister ? "Créer mon compte" : "Se connecter"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-start-cream/55">{isRegister ? "Déjà membre ?" : "Pas encore de compte ?"} <Link className="font-semibold text-start-gold" to={isRegister ? "/connexion" : "/inscription"}>{isRegister ? "Se connecter" : "Créer un compte gratuit"}</Link></p>
        {!isRegister && (
          <div className="mt-7 border-t border-start-cream/10 pt-5 text-center">
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-start-cream/55 transition hover:bg-start-cream/[.05] hover:text-start-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-start-gold"
              to="/admin"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              Accès administration
            </Link>
          </div>
        )}
      </div>
    </ThemedPage>
  );
}
