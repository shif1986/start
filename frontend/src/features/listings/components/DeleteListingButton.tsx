import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/context/use-auth";
import { deleteListing } from "../api/delete-listing";
import { listingKeys } from "../model/listing-keys";

export default function DeleteListingButton({ listingId }: { listingId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!user || !window.confirm("Supprimer définitivement cette annonce et ses photos ? Cette action est irréversible.")) return;
    setError("");
    setIsPending(true);
    try {
      await deleteListing(listingId, user.id);
      await queryClient.invalidateQueries({ queryKey: listingKeys.all });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Impossible de supprimer l’annonce.");
      setIsPending(false);
    }
  }

  return <div className="grid gap-2"><button type="button" onClick={() => void handleDelete()} disabled={!user || isPending} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-network-red/45 px-4 text-sm font-semibold text-red-200 transition hover:bg-network-red/10 disabled:cursor-wait disabled:opacity-60">{isPending ? "Suppression…" : "Supprimer"}</button>{error && <span className="max-w-48 text-xs leading-5 text-red-200" role="alert">{error}</span>}</div>;
}
