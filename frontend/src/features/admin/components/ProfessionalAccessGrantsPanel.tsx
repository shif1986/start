import { useEffect, useState, type FormEvent } from "react";
import { getProfessionalAccessGrants, grantProfessionalAccess, revokeProfessionalAccess, type ProfessionalAccessGrant } from "../api/professional-access-grants";

function formatEnd(grant: ProfessionalAccessGrant) {
  if (grant.revoked_at) return "Révoqué";
  if (!grant.ends_at) return "À vie";
  return `Jusqu’au ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(grant.ends_at))}`;
}

export default function ProfessionalAccessGrantsPanel() {
  const [email, setEmail] = useState("");
  const [duration, setDuration] = useState<"one_year" | "lifetime">("one_year");
  const [note, setNote] = useState("");
  const [grants, setGrants] = useState<ProfessionalAccessGrant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    setIsLoading(true);
    try { setGrants(await getProfessionalAccessGrants()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible de charger les accès offerts."); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { void refresh(); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);
    try {
      await grantProfessionalAccess(email, duration, note);
      setMessage(`Accès ${duration === "lifetime" ? "à vie" : "d’un an"} accordé à ${email.trim().toLowerCase()}.`);
      setEmail("");
      setNote("");
      await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible d’accorder cet accès."); }
    finally { setIsSaving(false); }
  }

  async function revoke(grant: ProfessionalAccessGrant) {
    if (!window.confirm(`Révoquer l’accès professionnel offert pour ${grant.email} ?`)) return;
    setError("");
    setMessage("");
    try {
      await revokeProfessionalAccess(grant.email);
      setMessage(`Accès révoqué pour ${grant.email}.`);
      await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible de révoquer cet accès."); }
  }

  return <section id="acces-offerts" className="mt-8 scroll-mt-36 rounded-2xl border border-start-gold/25 bg-[#121418] p-6">
    <span className="text-xs font-bold tracking-[.16em] text-start-gold uppercase">Accès professionnel offert</span>
    <h2 className="mt-3 text-xl font-semibold">Autoriser une adresse e-mail sans paiement</h2>
    <p className="mt-2 max-w-3xl text-sm leading-6 text-start-cream/55">L’accès est appliqué immédiatement si le compte existe, ou automatiquement lors de sa création. Il active l’espace professionnel et la publication d’annonces.</p>
    <form onSubmit={(event) => void submit(event)} className="mt-5 grid gap-4 rounded-xl border border-start-cream/10 bg-[#0b0d10] p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_13rem] gap-4 max-sm:grid-cols-1"><label className="grid gap-2 text-sm font-semibold">Adresse e-mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-11 rounded-lg border border-start-cream/15 bg-[#121418] px-3 font-normal outline-none focus:border-start-gold" placeholder="nom@exemple.fr" /></label><label className="grid gap-2 text-sm font-semibold">Durée<select value={duration} onChange={(event) => setDuration(event.target.value as "one_year" | "lifetime")} className="min-h-11 rounded-lg border border-start-cream/15 bg-[#121418] px-3 font-normal outline-none focus:border-start-gold"><option value="one_year">Un an gratuit</option><option value="lifetime">À vie</option></select></label></div>
      <label className="grid gap-2 text-sm font-semibold">Note interne <span className="font-normal text-start-cream/40">(facultative)</span><input value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} className="min-h-11 rounded-lg border border-start-cream/15 bg-[#121418] px-3 font-normal outline-none focus:border-start-gold" placeholder="Ex. partenaire local" /></label>
      <div><button type="submit" disabled={isSaving} className="min-h-11 rounded-xl bg-start-gold px-5 font-bold text-start-ink disabled:opacity-55">{isSaving ? "Attribution…" : "Accorder l’accès"}</button></div>
    </form>
    {error && <p className="mt-4 text-sm text-red-200" role="alert">{error}</p>}
    {message && <p className="mt-4 text-sm text-network-blue" role="status">{message}</p>}
    {isLoading ? <p className="mt-5 text-sm text-start-cream/50">Chargement des accès…</p> : <div className="mt-5 grid gap-3">{grants.length ? grants.map((grant) => <article key={grant.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-start-cream/10 p-4"><div><strong>{grant.email}</strong><p className="mt-1 text-sm text-start-cream/55">{formatEnd(grant)}{grant.note ? ` · ${grant.note}` : ""}</p></div>{!grant.revoked_at && <button type="button" onClick={() => void revoke(grant)} className="min-h-10 rounded-lg border border-network-red/40 px-4 text-sm font-semibold text-red-200 hover:bg-network-red/10">Révoquer</button>}</article>) : <p className="text-sm text-start-cream/50">Aucun accès offert enregistré.</p>}</div>}
  </section>;
}
