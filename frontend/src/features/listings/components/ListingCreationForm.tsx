import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/use-auth";
import { useCategories } from "../../categories/hooks/use-categories";
import { createListing } from "../api/create-listing";
import { listingKeys } from "../model/listing-keys";

const fieldClassName = "rounded-xl border border-start-cream/15 bg-[#0b0d10] px-4 py-3.5 text-start-cream outline-none focus:border-start-gold";

export default function ListingCreationForm() {
  const { user } = useAuth();
  const categoriesQuery = useCategories();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    const form = new FormData(event.currentTarget);
    const rawPrice = String(form.get("price") ?? "").trim();
    const price = rawPrice ? Number(rawPrice.replace(",", ".")) : null;
    const priceUnit = String(form.get("priceUnit") ?? "fixed") as "fixed" | "hour" | "day" | "month" | "quote";
    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      setFeedback("Le prix doit être un nombre positif.");
      return;
    }

    setFeedback("");
    setIsSubmitting(true);
    try {
      await createListing({
        ownerId: user.id,
        categoryId: String(form.get("categoryId") ?? ""),
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        city: String(form.get("city") ?? ""),
        price,
        priceUnit,
      });
      await queryClient.invalidateQueries({ queryKey: listingKeys.owner(user.id) });
      navigate("/espace/professionnel/annonces");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Impossible d’enregistrer l’annonce.");
      setIsSubmitting(false);
    }
  }

  if (categoriesQuery.isPending) return <p role="status" className="text-start-cream/60">Chargement des catégories…</p>;
  if (categoriesQuery.isError) return <p role="alert" className="text-red-200">Impossible de charger les catégories.</p>;

  return (
    <form className="grid w-full gap-5" onSubmit={(event) => void handleSubmit(event)}>
      <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
        <label className="grid gap-2 text-sm font-semibold text-start-cream/70">Titre
          <input className={fieldClassName} name="title" minLength={5} maxLength={120} required />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-start-cream/70">Catégorie
          <select className={fieldClassName} name="categoryId" required defaultValue="">
            <option value="" disabled>Choisir une catégorie</option>
            {(categoriesQuery.data ?? []).map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-start-cream/70">Ville
          <input className={fieldClassName} name="city" minLength={2} maxLength={100} required />
        </label>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-semibold text-start-cream/70">Tarif <span className="font-normal text-start-cream/40">(facultatif)</span></legend>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(150px,.8fr)] gap-2 max-sm:grid-cols-1">
            <input aria-label="Montant en euros" className={fieldClassName} name="price" type="number" min="0" step="0.01" inputMode="decimal" placeholder="15" />
            <select aria-label="Unité du tarif" className={fieldClassName} name="priceUnit" defaultValue="fixed">
              <option value="fixed">Prix fixe</option>
              <option value="hour">Par heure</option>
              <option value="day">Par jour</option>
              <option value="month">Par mois</option>
              <option value="quote">Sur devis</option>
            </select>
          </div>
          <span className="text-xs font-normal text-start-cream/40">Exemple : 15 € par heure.</span>
        </fieldset>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-start-cream/70">Description
        <textarea className={`${fieldClassName} min-h-40 resize-y`} name="description" minLength={20} maxLength={10000} required />
      </label>
      {feedback && <p className="rounded-xl border border-network-red/25 bg-network-red/[.06] px-4 py-3 text-sm text-red-200" role="alert">{feedback}</p>}
      <button className="min-h-12 w-fit rounded-xl bg-start-gold px-7 py-3.5 font-bold text-start-ink disabled:cursor-wait disabled:opacity-60 max-sm:w-full" disabled={isSubmitting || !user} type="submit">{isSubmitting ? "Envoi à la validation…" : "Créer et soumettre l’annonce"}</button>
    </form>
  );
}
