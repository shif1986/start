import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandPattern from "../components/BrandPattern";
import ThemedPage from "../components/ThemedPage";
import { useAuth } from "../features/auth/context/use-auth";
import { enableAccountType } from "../features/profiles/api/enable-account-type";
import { profileKeys } from "../features/profiles/model/profile-keys";
import { queryClient } from "../lib/query-client";

export default function ProfessionalAccountRequiredPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const isAuthenticated = Boolean(session);
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState("");

  async function startProfessionalSpace() {
    setIsActivating(true);
    setError("");
    try {
      if (isAuthenticated) {
        await enableAccountType("professional");
        await queryClient.invalidateQueries({ queryKey: profileKeys.all });
        navigate("/abonnement", { replace: true });
        return;
      }
      navigate("/inscription?type=professional&redirect=/abonnement", { replace: true });
    } catch {
      setError("Impossible d’activer l’espace professionnel pour le moment.");
      setIsActivating(false);
    }
  }

  return (
    <ThemedPage ambiance="gold" className="relative isolate overflow-hidden px-[clamp(18px,6vw,80px)] py-[clamp(48px,8vw,104px)]">
      <BrandPattern variant="chain" className="absolute -right-20 -bottom-40 -z-10 h-[560px] w-[420px] text-start-gold/[.05]" />
      <div className="mx-auto max-w-4xl">
        <span className="text-xs font-bold tracking-[.22em] text-start-gold uppercase">Publication professionnelle</span>
        <h1 className="mt-4 text-[clamp(1.65rem,3vw,2.8rem)] leading-tight font-semibold tracking-[-.035em]">La publication d’annonces est réservée aux comptes professionnels.</h1>

        <section className="mt-10 grid grid-cols-[1.1fr_.9fr] overflow-hidden rounded-3xl border border-start-gold/25 bg-[#121418]/95 shadow-[0_30px_90px_rgba(0,0,0,.3)] max-md:grid-cols-1">
          <div className="p-[clamp(24px,5vw,48px)]">
            <span className="inline-flex rounded-full border border-network-blue/30 bg-network-blue/[.07] px-3 py-1.5 text-xs font-bold tracking-[.12em] text-network-blue uppercase">{isAuthenticated ? "Compte actuel : particulier" : "Visiteur non connecté"}</span>
            <h2 className="mt-6 text-2xl font-semibold">Pour déposer une annonce</h2>
            <ol className="mt-6 grid gap-4 text-sm leading-6 text-start-cream/65">
              <li className="flex gap-3"><strong className="text-start-gold">01</strong><span>Créer ou utiliser un compte professionnel.</span></li>
              <li className="flex gap-3"><strong className="text-start-gold">02</strong><span>Activer une formule professionnelle.</span></li>
              <li className="flex gap-3"><strong className="text-start-gold">03</strong><span>Créer l’annonce, qui sera directement envoyée à la validation START.</span></li>
            </ol>
          </div>
          <aside className="border-l border-start-cream/10 bg-[#0b0d10] p-[clamp(24px,5vw,48px)] max-md:border-t max-md:border-l-0">
            <span className="text-xs font-bold tracking-[.18em] text-start-gold uppercase">Passer à l’étape suivante</span>
            <p className="mt-4 text-sm leading-6 text-start-cream/55">{isAuthenticated ? "Activez votre espace professionnel avec la même adresse e-mail, sans quitter votre compte particulier." : "Créez un compte professionnel, puis activez un abonnement pour pouvoir soumettre vos annonces."}</p>
            <button type="button" onClick={() => void startProfessionalSpace()} disabled={isActivating} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-start-gold px-5 font-bold text-start-ink disabled:cursor-wait disabled:opacity-60">{isActivating ? "Activation…" : isAuthenticated ? "Activer mon espace professionnel" : "Créer un compte professionnel"}</button>
            <Link to={isAuthenticated ? "/espace/particulier" : "/connexion?redirect=%2Fpublier"} className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-start-cream/15 px-5 text-center font-semibold text-start-cream/65">{isAuthenticated ? "Retour à mon espace" : "J’ai déjà un compte professionnel"}</Link>
            {error && <p className="mt-4 text-sm text-red-200" role="alert">{error}</p>}
          </aside>
        </section>
      </div>
    </ThemedPage>
  );
}
