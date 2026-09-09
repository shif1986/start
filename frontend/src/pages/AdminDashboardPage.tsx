import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountShell from "../components/AccountShell";
import { signOut } from "../features/auth/api/auth-actions";
import PendingListingCard from "../features/admin/components/PendingListingCard";
import AdminReviewCard from "../features/admin/components/AdminReviewCard";
import AdminProfileCard from "../features/admin/components/AdminProfileCard";
import AdminReportCard from "../features/admin/components/AdminReportCard";
import { useAdminDashboard } from "../features/admin/hooks/use-admin-dashboard";
import { getDataSource } from "../lib/data-source";
import { queryClient } from "../lib/query-client";

const navigation = [
  { label: "Vue globale", to: "/admin" },
  { label: "Annonces à valider", to: "/admin#annonces-a-valider" },
  { label: "Utilisateurs", to: "/admin#utilisateurs" },
  { label: "Signalements", to: "/admin#signalements" },
  { label: "Avis", to: "/admin#avis" },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const isSupabase = getDataSource() === "supabase";
  const dashboardQuery = useAdminDashboard(isSupabase);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const data = dashboardQuery.data;

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
    queryClient.clear();
    navigate("/", { replace: true });
  }

  const stats = [
    [data ? data.pendingListings.filter((listing) => listing.status === "pending").length : "—", "Annonces à valider", "text-network-yellow"],
    [data?.activeListings ?? "—", "Annonces publiées", "text-start-gold"],
    [data?.unverifiedProfiles ?? "—", "Profils non vérifiés", "text-network-blue"],
    [data?.openReports ?? "—", "Signalements ouverts", "text-network-red"],
  ] as const;

  return (
    <AccountShell
      eyebrow="Administration"
      title="Centre de modération"
      description="Contrôlez les annonces, les comptes et les signalements à partir des données réelles de START."
      navigation={navigation}
      action={<button type="button" disabled={isSigningOut} onClick={() => void handleSignOut()} className="min-h-11 rounded-xl border border-start-cream/15 px-4 font-semibold text-start-cream/70 transition hover:border-start-gold hover:text-start-gold disabled:opacity-50">{isSigningOut ? "Déconnexion…" : "Se déconnecter"}</button>}
    >
      {dashboardQuery.isPending && <p role="status" className="rounded-2xl border border-dashed border-start-cream/15 p-6 text-start-cream/55">Chargement des données administrateur…</p>}
      {dashboardQuery.isError && <p role="alert" className="rounded-2xl border border-network-red/30 bg-network-red/[.06] p-5 text-red-200">Impossible de charger les données. Vérifiez que ce compte possède bien le rôle administrateur.</p>}

      {!dashboardQuery.isPending && !dashboardQuery.isError && <>
        <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
          {stats.map(([value, label, color]) => <div key={label} className="rounded-2xl border border-start-cream/10 bg-[#121418] p-6"><strong className={`text-3xl ${color}`}>{value}</strong><span className="mt-2 block text-sm text-start-cream/50">{label}</span></div>)}
        </div>

        <section id="annonces-a-valider" className="mt-8 scroll-mt-36">
          <div className="flex items-end justify-between gap-4 border-b border-start-cream/10 pb-5 max-sm:items-start">
            <div><span className="text-xs font-bold tracking-[.18em] text-network-yellow uppercase">Priorité de modération</span><h2 className="mt-2 text-2xl font-semibold">Annonces à contrôler</h2></div>
            <span className="rounded-full border border-start-gold/25 px-3 py-1 text-sm font-semibold text-start-gold">{data?.pendingListings.length ?? 0} affichées</span>
          </div>
          {data?.pendingListings.length ? <div className="mt-5 grid gap-4">{data.pendingListings.map((listing) => <PendingListingCard key={listing.id} listing={listing} />)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-start-cream/15 bg-[#121418] p-8 text-center"><h3 className="text-lg font-semibold">Aucune annonce en attente</h3><p className="mt-2 text-sm text-start-cream/50">Toutes les annonces soumises ont été traitées.</p></div>}
        </section>

        <div className="mt-8 grid grid-cols-2 gap-5 max-md:grid-cols-1">
          <section id="utilisateurs" className="scroll-mt-36 rounded-2xl border border-start-cream/10 bg-[#121418] p-6"><span className="text-xs font-bold tracking-[.16em] text-network-blue uppercase">Utilisateurs</span><h2 className="mt-3 text-xl font-semibold">Profils à contrôler</h2>{data?.profiles?.length ? <div className="mt-5 grid gap-4">{data.profiles.map((profile) => <AdminProfileCard key={profile.id} profile={profile} />)}</div> : <p className="mt-3 text-sm text-start-cream/55">Aucun profil à contrôler.</p>}</section>
          <section id="signalements" className="scroll-mt-36 rounded-2xl border border-start-cream/10 bg-[#121418] p-6"><span className="text-xs font-bold tracking-[.16em] text-network-red uppercase">Signalements</span><h2 className="mt-3 text-xl font-semibold">Contenus signalés</h2>{data?.reports?.length ? <div className="mt-5 grid gap-4">{data.reports.map((report) => <AdminReportCard key={report.id} report={report} />)}</div> : <p className="mt-3 text-sm text-start-cream/55">Aucun signalement à traiter.</p>}</section>
        </div>
        <section id="avis" className="mt-8 scroll-mt-36 rounded-2xl border border-start-cream/10 bg-[#121418] p-6"><span className="text-xs font-bold tracking-[.16em] text-start-gold uppercase">Modération</span><h2 className="mt-3 text-xl font-semibold">Avis de la communauté</h2>{data?.reviews.length ? <div className="mt-5 grid gap-4">{data.reviews.map((review) => <AdminReviewCard key={review.id} review={review} />)}</div> : <p className="mt-4 text-sm text-start-cream/50">Aucun avis à modérer.</p>}</section>
        <section className="mt-8 rounded-2xl border border-start-cream/10 bg-[#121418] p-6"><span className="text-xs font-bold tracking-[.16em] text-network-blue uppercase">Traçabilité</span><h2 className="mt-3 text-xl font-semibold">Journal d’audit</h2>{data?.auditLog?.length ? <div className="mt-5 grid gap-3">{data.auditLog.map((entry) => <article key={entry.id} className="rounded-xl border border-start-cream/10 p-4"><strong>{entry.action}</strong><p className="mt-1 text-sm text-start-cream/55">{entry.moderatorName} · {entry.targetType} · {entry.reason}</p><time className="mt-1 block text-xs text-start-cream/35">{new Date(entry.createdAt).toLocaleString("fr-FR")}</time></article>)}</div> : <p className="mt-3 text-sm text-start-cream/55">Aucune action enregistrée.</p>}</section>
      </>}
    </AccountShell>
  );
}
