import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountShell from "../components/AccountShell";
import { signOut } from "../features/auth/api/auth-actions";
import { useCurrentProfile } from "../features/profiles/hooks/use-current-profile";
import { professionalAccountNavigation } from "../features/profiles/model/account-navigation";
import { useCurrentSubscription } from "../features/subscriptions/hooks/use-current-subscription";
import { getDataSource } from "../lib/data-source";
import { queryClient } from "../lib/query-client";
import { CONTACT_EMAIL } from "../config/site";

type AccountRole = "customer" | "professional" | "admin";

const roleContent = {
  customer: { eyebrow: "Compte particulier", title: "Votre espace particulier", description: "Retrouvez vos favoris, vos contacts et les avis publiés au sein du réseau.", stats: [["—", "Favoris"], ["—", "Professionnels contactés"], ["—", "Avis publiés"]], nav: [{ label: "Vue d’ensemble", to: "/espace/particulier" }, { label: "Mes favoris", to: "/annonces" }, { label: "Mes avis", to: "/espace/particulier" }] },
  professional: { eyebrow: "Compte professionnel", title: "Votre espace professionnel", description: "Gérez votre profil, vos annonces et l’état de votre abonnement professionnel.", stats: [["—", "Abonnement"], ["—", "Annonces publiées"], ["—", "Avis reçus"]], nav: [...professionalAccountNavigation] },
  admin: { eyebrow: "Administration", title: "Administration START", description: "Supervisez les comptes, annonces et signalements selon vos permissions.", stats: [["—", "Comptes à vérifier"], ["—", "Annonces actives"], ["—", "Signalements ouverts"]], nav: [{ label: "Vue globale", to: "/admin" }, { label: "Utilisateurs", to: "/admin" }, { label: "Annonces", to: "/admin" }, { label: "Signalements", to: "/admin" }] },
};

export default function AccountDashboardPage({ role }: { role: AccountRole }) {
  const navigate = useNavigate();
  const dataSource = getDataSource();
  const profileQuery = useCurrentProfile();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const content = roleContent[role];
  const isSupabase = dataSource === "supabase";
  const subscriptionQuery = useCurrentSubscription(isSupabase && role === "professional");
  const subscriptionStatus = subscriptionQuery.data?.status === "active" || subscriptionQuery.data?.status === "trialing" ? "Actif" : "Inactif";
  const stats = isSupabase ? content.stats.map(([, label]) => [label === "Abonnement" ? subscriptionStatus : "—", label]) : content.stats;

  async function handleSignOut() {
    setIsSigningOut(true);
    setSignOutError("");
    try {
      await signOut();
      queryClient.clear();
      navigate("/", { replace: true });
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : "La déconnexion n’a pas abouti.");
      setIsSigningOut(false);
    }
  }

  return (
    <AccountShell
      eyebrow={content.eyebrow}
      title={isSupabase ? profileQuery.data?.displayName ?? "Votre espace" : content.title}
      description={content.description}
      navigation={content.nav}
      showPreview={!isSupabase}
      action={isSupabase ? <button type="button" disabled={isSigningOut} onClick={() => void handleSignOut()} className="min-h-11 shrink-0 rounded-xl border border-start-cream/15 px-4 font-semibold text-start-cream/70 transition hover:border-start-gold hover:text-start-gold disabled:cursor-wait disabled:opacity-60">{isSigningOut ? "Déconnexion…" : "Se déconnecter"}</button> : undefined}
    >
      {signOutError && <p className="mb-6 rounded-xl border border-network-red/25 bg-network-red/[.06] px-4 py-3 text-sm text-red-200" role="alert">{signOutError}</p>}
      <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">{stats.map(([value, label]) => <div key={label} className="rounded-2xl border border-start-cream/10 bg-[#121418] p-6"><strong className="text-3xl text-start-gold">{value}</strong><span className="mt-2 block text-sm text-start-cream/50">{label}</span></div>)}</div>
      <div className="mt-8 grid grid-cols-[1.35fr_.65fr] gap-6 max-lg:grid-cols-1">
        <section className="rounded-2xl border border-start-cream/10 bg-[#121418] p-6 max-sm:p-5">
          <h2 className="text-xl font-semibold">Activité récente</h2>
          <p className="mt-5 rounded-xl border border-dashed border-start-cream/15 p-6 text-sm leading-6 text-start-cream/55">{isSupabase ? "Votre activité réelle apparaîtra ici lorsqu’elle sera disponible." : "Aucune activité personnelle fictive n’est affichée en mode démonstration."}</p>
        </section>
        <aside className="rounded-2xl border border-start-gold/20 bg-[radial-gradient(circle_at_top,rgba(199,164,93,.1),transparent_45%),#121418] p-6"><span className="text-xs font-bold tracking-[.18em] text-start-gold uppercase">Prochaine étape</span><h2 className="mt-3 text-xl font-semibold">{role === "professional" ? "Compléter votre profil" : role === "admin" ? "Vérifier les signalements" : "Découvrir des professionnels"}</h2><p className="mt-3 text-sm leading-6 text-start-cream/55">{isSupabase ? "Les prochaines actions seront proposées à partir de vos données réelles." : "Les actions seront connectées aux données réelles lors de l’intégration du backend."}</p>{role === "admin" && <a className="mt-4 block break-all text-sm font-semibold text-start-gold underline decoration-start-gold/35 underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>}</aside>
      </div>
    </AccountShell>
  );
}
