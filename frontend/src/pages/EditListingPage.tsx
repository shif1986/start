import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import AccountShell from "../components/AccountShell";
import { useAuth } from "../features/auth/context/use-auth";
import { getListingForEdit } from "../features/listings/api/get-listing-for-edit";
import { updateListing } from "../features/listings/api/update-listing";
import { listingEditSchema, type ListingEditValues } from "../features/listings/model/listing-edit-schema";
import { listingKeys } from "../features/listings/model/listing-keys";
import { professionalAccountNavigation } from "../features/profiles/model/account-navigation";

const fieldClassName = "min-h-12 rounded-xl border border-start-cream/15 bg-[#0b0d10] px-4 py-3 text-start-cream outline-none transition focus:border-start-gold focus:ring-2 focus:ring-start-gold/15";

export default function EditListingPage() {
  const { listingId = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState("");
  const listingQuery = useQuery({
    queryKey: [...listingKeys.owner(user?.id ?? ""), "edit", listingId],
    queryFn: () => getListingForEdit(listingId, user!.id),
    enabled: Boolean(user && listingId),
  });
  const form = useForm<ListingEditValues>({ resolver: zodResolver(listingEditSchema) });

  useEffect(() => {
    if (listingQuery.data) form.reset(listingQuery.data);
  }, [form, listingQuery.data]);

  async function submit(values: ListingEditValues) {
    if (!user) return;
    setFeedback("");
    try {
      await updateListing(listingId, user.id, values);
      await queryClient.invalidateQueries({ queryKey: listingKeys.owner(user.id) });
      navigate("/espace/professionnel/annonces", { replace: true, state: { listingUpdated: true } });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Impossible d’enregistrer les modifications.");
    }
  }

  return <AccountShell eyebrow="Compte professionnel" title="Modifier l’annonce" description="Mettez à jour les informations visibles de votre annonce." navigation={[...professionalAccountNavigation]} action={<Link to="/espace/professionnel/annonces" className="inline-flex min-h-11 items-center rounded-xl border border-start-cream/15 px-5 font-semibold text-start-cream/70">Retour aux annonces</Link>}>
    {listingQuery.isPending && <p role="status" className="rounded-xl border border-start-cream/10 p-5 text-start-cream/60">Chargement de l’annonce…</p>}
    {listingQuery.isError && <p role="alert" className="rounded-xl border border-network-red/25 bg-network-red/[.06] p-5 text-red-200">{listingQuery.error.message}</p>}
    {listingQuery.data && <form className="grid gap-5 rounded-2xl border border-start-cream/10 bg-[#121418] p-[clamp(20px,4vw,36px)]" noValidate onSubmit={form.handleSubmit(submit)}>
      <label className="grid gap-2 text-sm font-semibold text-start-cream/70">Titre<input className={fieldClassName} {...form.register("title")} />{form.formState.errors.title && <span className="text-xs text-red-200">{form.formState.errors.title.message}</span>}</label>
      <label className="grid gap-2 text-sm font-semibold text-start-cream/70">Description<textarea className={`${fieldClassName} min-h-48 resize-y`} {...form.register("description")} />{form.formState.errors.description && <span className="text-xs text-red-200">{form.formState.errors.description.message}</span>}</label>
      <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1"><label className="grid gap-2 text-sm font-semibold text-start-cream/70">Montant en euros<input className={fieldClassName} type="number" min="0" step="0.01" {...form.register("price")} />{form.formState.errors.price && <span className="text-xs text-red-200">{form.formState.errors.price.message}</span>}</label><label className="grid gap-2 text-sm font-semibold text-start-cream/70">Unité<select className={fieldClassName} {...form.register("priceUnit")}><option value="fixed">Prix fixe</option><option value="hour">Par heure</option><option value="day">Par jour</option><option value="month">Par mois</option><option value="quote">Sur devis</option></select></label></div>
      <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1"><label className="grid gap-2 text-sm font-semibold text-start-cream/70">Pays<select className={fieldClassName} {...form.register("countryCode")}><option value="FR">France</option><option value="CH">Suisse</option></select></label><label className="grid gap-2 text-sm font-semibold text-start-cream/70">Ville<input className={fieldClassName} {...form.register("city")} />{form.formState.errors.city && <span className="text-xs text-red-200">{form.formState.errors.city.message}</span>}</label><label className="grid gap-2 text-sm font-semibold text-start-cream/70">Code postal<input className={fieldClassName} {...form.register("postalCode")} /></label><label className="grid gap-2 text-sm font-semibold text-start-cream/70">Département ou canton<input className={fieldClassName} {...form.register("subdivisionName")} /></label></div>
      {feedback && <p role="alert" className="rounded-xl border border-network-red/25 bg-network-red/[.06] px-4 py-3 text-sm text-red-200">{feedback}</p>}
      <button type="submit" disabled={form.formState.isSubmitting} className="min-h-12 rounded-xl bg-start-gold px-7 font-bold text-start-ink disabled:opacity-60">{form.formState.isSubmitting ? "Enregistrement…" : "Enregistrer les modifications"}</button>
    </form>}
  </AccountShell>;
}
