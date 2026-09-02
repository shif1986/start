import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandPattern from "../components/BrandPattern";
import ThemedPage from "../components/ThemedPage";
import { signOut } from "../features/auth/api/auth-actions";
import { queryClient } from "../lib/query-client";

export default function ProfessionalAccountRequiredPage() {
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function startProfessionalRegistration() {
    setIsSigningOut(true);
    setError("");
    try {
      await signOut();
      queryClient.clear();
      navigate("/inscription?type=professional&redirect=/abonnement", { replace: true });
    } catch {
      setError("Impossible de vous déconnecter pour le moment.");
      setIsSigningOut(false);
    }
  }

  return (
    <ThemedPage ambiance="gold" className="relative isolate overflow-hidden px-[clamp(18px,6vw,80px)] py-[clamp(48px,8vw,104px)]">
      <BrandPattern variant="chain" className="absolute -right-20 -bottom-40 -z-10 h-[560px] w-[420px] text-start-gold/[.05]" />
      <div className="mx-auto max-w-4xl">
        <span className="text-xs font-bold tracking-[.22em] text-start-gold uppercase">Publication professionnelle</span>
        <h1 className="mt-4 text-[clamp(1.65rem,3vw,2.8rem)] leading-tight font-semibold tracking-[-.035em]">La publication d’annonces est réservée aux comptes professionnels.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-start-cream/60">Votre compte particulier reste gratuit pour consulter les annonces, enregistrer des favoris, contacter les professionnels et publier des avis.</p>

        <section className="mt-10 grid grid-cols-[1.1fr_.9fr] overflow-hidden rounded-3xl border border-start-gold/25 bg-[#121418]/95 shadow-[0_30px_90px_rgba(0,0,0,.3)] max-md:grid-cols-1">
          <div className="p-[clamp(24px,5vw,48px)]">
            <span className="inline-flex rounded-full border border-network-blue/30 bg-network-blue/[.07] px-3 py-1.5 text-xs font-bold tracking-[.12em] text-network-blue uppercase">Compte actuel : particulier</span>
            <h2 className="mt-6 text-2xl font-semibold">Pour déposer une annonce</h2>
            <ol className="mt-6 grid gap-4 text-sm leading-6 text-start-cream/65">
              <li className="flex gap-3"><strong className="text-start-gold">01</strong><span>Créer ou utiliser un compte professionnel.</span></li>
              <li className="flex gap-3"><strong className="text-start-gold">02</strong><span>Activer une formule professionnelle.</span></li>
              <li className="flex gap-3"><strong className="text-start-gold">03</strong><span>Créer l’annonce, qui sera directement envoyée à la validation START.</span></li>
            </ol>
          </div>
          <aside className="border-l border-start-cream/10 bg-[#0b0d10] p-[clamp(24px,5vw,48px)] max-md:border-t max-md:border-l-0">
            <span className="text-xs font-bold tracking-[.18em] text-start-gold uppercase">Passer à l’étape suivante</span>
            <p className="mt-4 text-sm leading-6 text-start-cream/55">La création d’un compte professionnel nécessite de quitter votre session particulière actuelle.</p>
            <button type="button" onClick={() => void startProfessionalRegistration()} disabled={isSigningOut} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-start-gold px-5 font-bold text-start-ink disabled:cursor-wait disabled:opacity-60">{isSigningOut ? "Déconnexion…" : "Créer un compte professionnel"}</button>
            <Link to="/espace/particulier" className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-start-cream/15 px-5 font-semibold text-start-cream/65">Retour à mon espace</Link>
            {error && <p className="mt-4 text-sm text-red-200" role="alert">{error}</p>}
          </aside>
        </section>
      </div>
    </ThemedPage>
  );
}
