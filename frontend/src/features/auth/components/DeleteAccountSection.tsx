import { useState } from "react";

type DeleteAccountSectionProps = {
  accountType: "customer" | "professional";
  disabled?: boolean;
  onDelete: () => Promise<void>;
};

const confirmationWord = "SUPPRIMER";

export default function DeleteAccountSection({ accountType, disabled = false, onDelete }: DeleteAccountSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const isProfessional = accountType === "professional";
  const canDelete = confirmation === confirmationWord && isAcknowledged && !isPending && !disabled;

  async function handleDelete() {
    if (!canDelete) return;
    setError("");
    setIsPending(true);
    try {
      await onDelete();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "La suppression du compte n’a pas abouti.");
      setIsPending(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-network-red/30 bg-network-red/[.05] p-6 max-sm:p-5" aria-labelledby="delete-account-title">
      <span className="text-xs font-bold tracking-[.18em] text-network-red uppercase">Zone de danger</span>
      <h2 id="delete-account-title" className="mt-2 text-xl font-semibold">Supprimer mon compte</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-start-cream/65">La suppression est définitive. Votre profil et les données associées, notamment vos favoris, avis et annonces, seront supprimés.</p>
      {isProfessional && <p className="mt-2 max-w-3xl text-sm leading-6 text-start-cream/65">Si un abonnement professionnel est actif, il sera résilié immédiatement avant la suppression du compte.</p>}
      {!isOpen ? <button type="button" disabled={disabled} onClick={() => setIsOpen(true)} className="mt-5 min-h-11 rounded-xl border border-network-red/55 px-5 font-semibold text-network-red transition hover:bg-network-red/10 disabled:cursor-not-allowed disabled:opacity-55">Supprimer mon compte</button> : <div className="mt-5 rounded-xl border border-network-red/25 bg-[#0b0d10]/70 p-5">
        <p className="text-sm leading-6 text-start-cream/70">Pour confirmer, saisissez <strong className="text-start-cream">{confirmationWord}</strong> et cochez la case ci-dessous.</p>
        <label className="mt-4 grid max-w-md gap-2 text-sm font-semibold text-start-cream/75">Confirmation
          <input value={confirmation} onChange={(event) => setConfirmation(event.target.value.toUpperCase())} autoComplete="off" className="rounded-xl border border-start-cream/15 bg-[#121418] px-4 py-3 text-start-cream outline-none focus:border-network-red" aria-describedby="delete-account-help" />
        </label>
        <label id="delete-account-help" className="mt-4 flex items-start gap-3 text-sm leading-6 text-start-cream/65"><input checked={isAcknowledged} onChange={(event) => setIsAcknowledged(event.target.checked)} type="checkbox" className="mt-1 accent-[#d95d5d]" /><span>Je comprends que cette action est irréversible.</span></label>
        {error && <p className="mt-4 text-sm text-red-200" role="alert">{error}</p>}
        <div className="mt-5 flex flex-wrap gap-3"><button type="button" disabled={!canDelete} onClick={() => void handleDelete()} className="min-h-11 rounded-xl bg-network-red px-5 font-bold text-white transition hover:bg-[#ec6f6f] disabled:cursor-not-allowed disabled:opacity-55">{isPending ? "Suppression…" : "Supprimer définitivement"}</button><button type="button" disabled={isPending} onClick={() => { setIsOpen(false); setConfirmation(""); setIsAcknowledged(false); setError(""); }} className="min-h-11 rounded-xl border border-start-cream/15 px-5 font-semibold text-start-cream/70 transition hover:border-start-cream/35 disabled:opacity-55">Annuler</button></div>
      </div>}
    </section>
  );
}
