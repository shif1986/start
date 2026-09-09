import { useState } from "react";
import { moderateReview, type AdminReview } from "../api/admin-dashboard";
import { queryClient } from "../../../lib/query-client";
import { adminDashboardKey } from "../hooks/use-admin-dashboard";

export default function AdminReviewCard({ review }: { review: AdminReview }) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");

  async function run(action: () => Promise<void>) {
    setIsPending(true);
    setError("");
    try {
      await action();
      await queryClient.invalidateQueries({ queryKey: adminDashboardKey });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Action impossible.");
    } finally {
      setIsPending(false);
    }
  }

  return <article className="rounded-xl border border-start-cream/10 p-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><strong>{review.listingTitle}</strong><p className="mt-1 text-sm text-start-cream/50">{review.authorName} · {review.rating}/5</p></div><span className={review.isHidden ? "text-network-red" : "text-network-blue"}>{review.isHidden ? "Masqué" : "Visible"}</span></div>
    <p className="mt-3 text-sm leading-6 text-start-cream/65">{review.body}</p>
    <label className="mt-4 grid gap-2 text-sm">Motif<input className="rounded-lg border border-start-cream/15 bg-[#0b0d10] px-3 py-2" minLength={5} maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} /></label>
    <div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={isPending || reason.trim().length < 5} className="rounded-lg border border-start-gold/30 px-3 py-2 text-sm text-start-gold disabled:opacity-40" onClick={() => window.confirm("Confirmer cette action de modération ?") && void run(() => moderateReview(review.id, review.isHidden ? "show" : "hide", reason))}>{review.isHidden ? "Rendre visible" : "Masquer"}</button><button type="button" disabled={isPending || reason.trim().length < 5} className="rounded-lg border border-network-red/30 px-3 py-2 text-sm text-network-red disabled:opacity-40" onClick={() => window.confirm("Supprimer définitivement cet avis ?") && void run(() => moderateReview(review.id, "delete", reason))}>Supprimer</button></div>
    {error && <p role="alert" className="mt-3 text-sm text-red-200">{error}</p>}
  </article>;
}
