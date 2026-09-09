import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { moderateListing, type PendingAdminListing } from "../api/admin-dashboard";
import { adminDashboardKey } from "../hooks/use-admin-dashboard";

export default function PendingListingCard({ listing }: { listing: PendingAdminListing }) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [pendingDecision, setPendingDecision] = useState<"published" | "rejected" | null>(null);
  const [feedback, setFeedback] = useState("");

  async function decide(decision: "published" | "rejected") {
    if (reason.trim().length < 5) {
      setFeedback("Indiquez un motif d’au moins 5 caractères.");
      return;
    }
    if (!window.confirm(decision === "published" ? "Confirmer la publication de cette annonce ?" : "Confirmer le refus de cette annonce ?")) return;
    setPendingDecision(decision);
    setFeedback("");
    try {
      await moderateListing(listing.id, decision, reason);
      await queryClient.invalidateQueries({ queryKey: adminDashboardKey });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Impossible d’enregistrer cette décision.");
      setPendingDecision(null);
    }
  }

  const formattedPrice = listing.price === null
    ? "Prix non renseigné"
    : new Intl.NumberFormat("fr-FR", { style: "currency", currency: listing.currency }).format(listing.price);

  return (
    <article className="rounded-2xl border border-start-cream/10 bg-[#121418] p-5">
      <div className="flex items-start justify-between gap-5 max-md:flex-col">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold tracking-[.12em] uppercase">
            <span className="rounded-full bg-network-yellow/10 px-3 py-1 text-network-yellow">{listing.status === "published" ? "Publiée" : "En validation"}</span>
            <span className="text-start-cream/35">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(listing.createdAt))}</span>
          </div>
          <h3 className="mt-4 text-xl font-semibold">{listing.title}</h3>
          <p className="mt-2 text-sm text-start-cream/50">{listing.categoryName} · {listing.city} · {formattedPrice}</p>
          <p className="mt-3 line-clamp-3 max-w-3xl text-sm leading-6 text-start-cream/65">{listing.description}</p>
          <p className="mt-3 text-xs text-start-cream/40">Proposé par <strong className="text-start-cream/65">{listing.ownerName}</strong>{listing.ownerUsername ? ` (@${listing.ownerUsername})` : ""}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link to={`/annonce/${listing.slug}`} target="_blank" className="inline-flex min-h-11 items-center rounded-xl border border-start-cream/15 px-4 text-sm font-semibold text-start-cream/70 hover:border-start-gold hover:text-start-gold">Aperçu</Link>
          {listing.status !== "published" && <button type="button" disabled={pendingDecision !== null} onClick={() => void decide("published")} className="min-h-11 rounded-xl bg-start-gold px-4 text-sm font-bold text-start-ink disabled:opacity-50">{pendingDecision === "published" ? "Publication…" : "Publier"}</button>}
          <button type="button" disabled={pendingDecision !== null} onClick={() => void decide("rejected")} className="min-h-11 rounded-xl border border-network-red/35 px-4 text-sm font-semibold text-red-200 disabled:opacity-50">{pendingDecision === "rejected" ? "Refus…" : "Refuser"}</button>
        </div>
      </div>
      <div className="mt-5 border-t border-start-cream/10 pt-5">
        <label className="grid gap-2 text-sm font-semibold text-start-cream/65">Motif de la décision
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} minLength={5} maxLength={1000} className="min-h-24 resize-y rounded-xl border border-start-cream/15 bg-[#0b0d10] px-4 py-3 font-normal text-start-cream outline-none focus:border-network-red" placeholder="Expliquez clairement les éléments à corriger…" />
        </label>
      </div>
      {feedback && <p role="alert" className="mt-4 rounded-xl border border-network-red/25 bg-network-red/[.06] px-4 py-3 text-sm text-red-200">{feedback}</p>}
    </article>
  );
}
