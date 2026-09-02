import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/context/use-auth";
import { submitListing } from "../api/submit-listing";
import { listingKeys } from "../model/listing-keys";

export default function SubmitListingButton({ listingId }: { listingId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!user) return;
    setError("");
    setIsPending(true);
    try {
      await submitListing(listingId, user.id);
      await queryClient.invalidateQueries({ queryKey: listingKeys.owner(user.id) });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Impossible de soumettre l’annonce.");
      setIsPending(false);
    }
  }

  return <div className="grid gap-2">
    <button type="button" onClick={() => void handleSubmit()} disabled={!user || isPending} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-start-gold px-4 text-sm font-bold text-start-ink disabled:cursor-wait disabled:opacity-60">{isPending ? "Envoi…" : "Soumettre"}</button>
    {error && <span className="max-w-48 text-xs leading-5 text-red-200" role="alert">{error}</span>}
  </div>;
}
