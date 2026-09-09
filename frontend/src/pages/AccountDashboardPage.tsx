import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountShell from "../components/AccountShell";
import { signOut } from "../features/auth/api/auth-actions";
import { useCurrentProfile } from "../features/profiles/hooks/use-current-profile";
import { customerAccountNavigation, professionalAccountNavigation } from "../features/profiles/model/account-navigation";
import { useCurrentSubscription } from "../features/subscriptions/hooks/use-current-subscription";
import { getDataSource } from "../lib/data-source";
import { queryClient } from "../lib/query-client";
import { CONTACT_EMAIL } from "../config/site";
import { useAuth } from "../features/auth/context/use-auth";
import { useFavoriteListings } from "../features/favorites/hooks/use-favorite-listings";
import { DEMO_FAVORITES_CHANGED, getDemoFavoriteIds } from "../features/favorites/model/demo-favorites";
import { getUserReviews, USER_REVIEWS_CHANGED, type UserReview } from "../features/reviews/model/user-reviews";
import { DEMO_CONTACT_CLICKS_CHANGED, getDemoContactIds } from "../features/contacts/model/demo-contact-clicks";
import { useProfessionalContactCount } from "../features/contacts/hooks/use-professional-contact-count";
import { useUserReviews } from "../features/reviews/hooks/use-reviews";
import { useAccountActivity } from "../features/activity/hooks/use-account-activity";

type AccountRole = "customer" | "professional" | "admin";

const roleContent = {
  customer: { eyebrow: "Compte particulier", title: "Votre espace particulier", description: "Retrouvez vos favoris, vos contacts et les avis publiés au sein du réseau.", stats: [["—", "Favoris"], ["—", "Contacts initiés"], ["—", "Avis publiés"]], nav: [...customerAccountNavigation] },
  professional: { eyebrow: "Compte professionnel", title: "Votre espace professionnel", description: "Gérez vos annonces et retrouvez aussi vos favoris et les avis que vous publiez.", stats: [["—", "Abonnement"], ["—", "Favoris"], ["—", "Avis publiés"]], nav: [...professionalAccountNavigation] },
  admin: { eyebrow: "Administration", title: "Administration START", description: "Supervisez les comptes, annonces et signalements selon vos permissions.", stats: [["—", "Comptes à vérifier"], ["—", "Annonces actives"], ["—", "Signalements ouverts"]], nav: [{ label: "Vue globale", to: "/admin" }, { label: "Utilisateurs", to: "/admin" }, { label: "Annonces", to: "/admin" }, { label: "Signalements", to: "/admin" }] },
};

export default function AccountDashboardPage({ role }: { role: AccountRole }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const dataSource = getDataSource();
  const profileQuery = useCurrentProfile();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [demoFavoriteCount, setDemoFavoriteCount] = useState(0);
  const [localReviews, setReviews] = useState<UserReview[]>([]);
  const [demoContactCount, setDemoContactCount] = useState(0);
  const [activityPage, setActivityPage] = useState(1);
  const content = roleContent[role];
  const isSupabase = dataSource === "supabase";
  const subscriptionQuery = useCurrentSubscription(isSupabase && role === "professional");
  const favoritesQuery = useFavoriteListings(isSupabase && role !== "admin");
  const reviewsQuery = useUserReviews(user?.id ?? "", 1, isSupabase && role !== "admin");
  const reviews = isSupabase ? [...(reviewsQuery.data?.items ?? []), ...localReviews] : localReviews;
  const reviewCount = isSupabase ? (reviewsQuery.data?.totalCount ?? 0) + localReviews.length : localReviews.length;
  const contactsQuery = useProfessionalContactCount(isSupabase && role === "customer");
  const activityQuery = useAccountActivity(user?.id ?? "", isSupabase && role !== "admin");
  const activities = activityQuery.data ?? [];
  const activityPageCount = Math.max(1, Math.ceil(activities.length / 5));
  const visibleActivities = activities.slice((activityPage - 1) * 5, activityPage * 5);
  const subscriptionStatus = subscriptionQuery.data?.status === "active" || subscriptionQuery.data?.status === "trialing" ? "Actif" : "Inactif";
  const favoriteCount = (favoritesQuery.data?.length ?? 0) + demoFavoriteCount;
  const contactCount = (contactsQuery.data ?? 0) + demoContactCount;
  const stats = isSupabase ? content.stats.map(([, label]) => [
    label === "Abonnement" ? subscriptionStatus
        : label === "Favoris" ? favoriteCount.toString()
        : label === "Contacts initiés" ? contactCount.toString()
        : label === "Avis publiés" ? reviewCount.toString()
          : "—",
    label,
  ]) : content.stats;

  useEffect(() => {
    if (role === "admin") return;
    const refreshFavorites = () => setDemoFavoriteCount(getDemoFavoriteIds(user?.id ?? "").length);
    const refreshReviews = () => setReviews(getUserReviews(user?.id ?? ""));
    const refreshContacts = () => setDemoContactCount(getDemoContactIds(user?.id ?? "").length);
    refreshFavorites();
    refreshReviews();
    refreshContacts();
    window.addEventListener(DEMO_FAVORITES_CHANGED, refreshFavorites);
    window.addEventListener(USER_REVIEWS_CHANGED, refreshReviews);
    window.addEventListener(DEMO_CONTACT_CLICKS_CHANGED, refreshContacts);
    return () => {
      window.removeEventListener(DEMO_FAVORITES_CHANGED, refreshFavorites);
      window.removeEventListener(USER_REVIEWS_CHANGED, refreshReviews);
      window.removeEventListener(DEMO_CONTACT_CLICKS_CHANGED, refreshContacts);
    };
  }, [role, user?.id]);

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
          {isSupabase && role !== "admin" && activities.length > 0 ? <div className="mt-5 grid gap-3">
            {visibleActivities.map((activity) => <div key={activity.id} className="rounded-xl border border-start-cream/10 p-4 text-sm text-start-cream/65"><strong className="text-start-cream">{activity.label}</strong> · {activity.detail}<time className="mt-1 block text-xs text-start-cream/35">{new Date(activity.createdAt).toLocaleDateString("fr-FR")}</time></div>)}
            {activityPageCount > 1 && <nav className="flex items-center justify-center gap-3 text-sm" aria-label="Pagination de l’historique"><button type="button" disabled={activityPage === 1} onClick={() => setActivityPage((page) => page - 1)}>Précédent</button><span>Page {activityPage} sur {activityPageCount}</span><button type="button" disabled={activityPage === activityPageCount} onClick={() => setActivityPage((page) => page + 1)}>Suivant</button></nav>}
          </div> : role !== "admin" && (reviews.length > 0 || favoriteCount > 0 || contactCount > 0) ? <div className="mt-5 grid gap-3">
            {reviews.slice(0, 3).map((review) => <div key={review.id} className="rounded-xl border border-start-cream/10 p-4 text-sm text-start-cream/65"><strong className="text-start-cream">Avis publié</strong> · {review.listingTitle} · <span className="text-start-gold">{review.rating}/5</span></div>)}
            {favoriteCount > 0 && <div className="rounded-xl border border-start-cream/10 p-4 text-sm text-start-cream/65"><strong className="text-start-cream">Favoris</strong> · {favoriteCount} annonce{favoriteCount > 1 ? "s" : ""} enregistrée{favoriteCount > 1 ? "s" : ""}</div>}
            {contactCount > 0 && <div className="rounded-xl border border-start-cream/10 p-4 text-sm text-start-cream/65"><strong className="text-start-cream">Contacts initiés</strong> · {contactCount} professionnel{contactCount > 1 ? "s" : ""}</div>}
          </div> : <p className="mt-5 rounded-xl border border-dashed border-start-cream/15 p-6 text-sm leading-6 text-start-cream/55">{isSupabase ? "Aucune activité récente pour le moment." : "Aucune activité personnelle fictive n’est affichée en mode démonstration."}</p>}
        </section>
        <aside className="rounded-2xl border border-start-gold/20 bg-[radial-gradient(circle_at_top,rgba(199,164,93,.1),transparent_45%),#121418] p-6"><span className="text-xs font-bold tracking-[.18em] text-start-gold uppercase">Prochaine étape</span><h2 className="mt-3 text-xl font-semibold">{role === "professional" ? "Compléter votre profil" : role === "admin" ? "Vérifier les signalements" : "Découvrir des professionnels"}</h2><p className="mt-3 text-sm leading-6 text-start-cream/55">{isSupabase ? "Les prochaines actions seront proposées à partir de vos données réelles." : "Les actions seront connectées aux données réelles lors de l’intégration du backend."}</p>{role === "admin" && <a className="mt-4 block break-all text-sm font-semibold text-start-gold underline decoration-start-gold/35 underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>}</aside>
      </div>
    </AccountShell>
  );
}
