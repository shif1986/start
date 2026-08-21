import { Link } from "react-router-dom";
import ThemedPage from "../components/ThemedPage";
import BrandPattern from "../components/BrandPattern";

export default function PublishPage() {
  return (
    <ThemedPage ambiance="gold" className="p-[clamp(32px,7vw,104px)]">
      <div className="mx-auto max-w-6xl">
      <span className="text-xs font-bold tracking-[.22em] text-start-gold uppercase">Rejoindre le réseau</span>
      <h1 className="mt-3 max-w-4xl text-[clamp(2.5rem,6vw,5rem)] font-bold tracking-[-.04em]">Publier une annonce</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-start-cream/65">La publication est réservée aux professionnels disposant d’un abonnement START actif.</p>

      <div className="relative isolate mt-12 overflow-hidden rounded-2xl border border-start-gold/20 bg-[#17191e]/90 p-[clamp(24px,4vw,44px)] shadow-[0_24px_70px_rgba(0,0,0,.2)]">
        <BrandPattern variant="chain" className="-right-24 -bottom-44 -z-10 h-[440px] w-[340px] text-start-gold/[.055] opacity-50 max-sm:opacity-30" />
        <ol className="relative grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {[
            ["01", "Créer un compte professionnel", "Renseignez votre identité et les informations de votre activité.", "text-network-blue", "bg-network-blue"],
            ["02", "Choisir votre abonnement", "Sélectionnez la formule mensuelle à 7 € ou annuelle à 84 €.", "text-network-yellow", "bg-network-yellow"],
            ["03", "Publier votre annonce", "Après validation du profil et de l’abonnement, déposez votre annonce.", "text-network-red", "bg-network-red"],
          ].map(([number, title, description, textAccent, dotAccent]) => (
            <li key={number} className="rounded-2xl border border-start-cream/10 bg-[#0b0d10]/70 p-6">
              <span className={`inline-flex items-center gap-2 text-xs font-bold tracking-[.18em] ${textAccent}`}><span className={`size-1.5 rounded-full ${dotAccent}`} aria-hidden="true" />ÉTAPE {number}</span>
              <h2 className="mt-4 text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-start-cream/55">{description}</p>
            </li>
          ))}
        </ol>
        <div className="relative mt-8 flex flex-wrap items-center gap-4 max-sm:flex-col max-sm:items-stretch">
          <Link to="/inscription?type=professional&redirect=/abonnement" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-start-gold px-7 py-3.5 text-center font-bold text-start-ink shadow-[0_14px_35px_rgba(199,164,93,.18)] transition hover:-translate-y-0.5 hover:bg-[#d5b66f]">
            Créer mon compte professionnel
          </Link>
          <Link to="/connexion?redirect=/abonnement" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-start-gold/45 px-7 py-3.5 text-center font-semibold text-start-gold transition hover:bg-start-gold/[.08]">
            J’ai déjà un compte professionnel
          </Link>
        </div>
        <p className="relative mt-5 text-xs leading-5 text-start-cream/40">Aucun paiement n’est débité dans cette maquette frontend. L’activation réelle sera sécurisée lors de la connexion du backend et de Stripe.</p>
      </div>
      </div>
    </ThemedPage>
  );
}
