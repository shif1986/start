import { useState } from "react";
import { moderateProfile, type AdminProfile } from "../api/admin-dashboard";
import { adminDashboardKey } from "../hooks/use-admin-dashboard";
import { queryClient } from "../../../lib/query-client";

export default function AdminProfileCard({ profile }: { profile: AdminProfile }) {
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function act(action: "verify" | "suspend" | "reactivate") {
    if (!window.confirm("Confirmer cette action sur le compte ?")) return;
    setPending(true); setError("");
    try { await moderateProfile(profile.id, action, reason); await queryClient.invalidateQueries({ queryKey: adminDashboardKey }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Action impossible."); }
    finally { setPending(false); }
  }
  return <article className="rounded-xl border border-start-cream/10 p-5"><div className="flex flex-wrap justify-between gap-3"><div><strong>{profile.displayName}</strong><p className="text-sm text-start-cream/50">@{profile.username} · {profile.accountType}</p></div><span>{profile.accountStatus === "suspended" ? "Suspendu" : profile.isVerified ? "Vérifié" : "À vérifier"}</span></div><label className="mt-4 grid gap-2 text-sm">Motif<input value={reason} onChange={(event) => setReason(event.target.value)} minLength={5} maxLength={1000} className="rounded-lg border border-start-cream/15 bg-[#0b0d10] px-3 py-2" /></label><div className="mt-3 flex flex-wrap gap-2">{!profile.isVerified && <button type="button" disabled={pending || reason.trim().length < 5} onClick={() => void act("verify")} className="rounded-lg border border-network-blue/30 px-3 py-2 text-sm text-network-blue disabled:opacity-40">Vérifier</button>}{profile.accountStatus === "suspended" ? <button type="button" disabled={pending || reason.trim().length < 5} onClick={() => void act("reactivate")} className="rounded-lg border border-start-gold/30 px-3 py-2 text-sm text-start-gold disabled:opacity-40">Réactiver</button> : <button type="button" disabled={pending || reason.trim().length < 5} onClick={() => void act("suspend")} className="rounded-lg border border-network-red/30 px-3 py-2 text-sm text-network-red disabled:opacity-40">Suspendre</button>}</div>{error && <p role="alert" className="mt-3 text-sm text-red-200">{error}</p>}</article>;
}
