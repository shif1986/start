import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/use-auth";
import { useCategories } from "../../categories/hooks/use-categories";
import { useCategoryFields } from "../../categories/hooks/use-category-fields";
import type { CategoryField } from "../../categories/api/get-category-fields";
import { createListing } from "../api/create-listing";
import { clearListingDraft, readListingDraft, writeListingDraft } from "../model/listing-draft";
import { listingCreationSchema, parseListingPrice, type ListingCreationValues } from "../model/listing-creation-schema";
import { listingKeys } from "../model/listing-keys";

const fieldClassName = "min-h-12 rounded-xl border border-start-cream/15 bg-[#0b0d10] px-4 py-3 text-start-cream outline-none transition focus:border-start-gold focus:ring-2 focus:ring-start-gold/15";
const steps = ["Catégorie", "Informations", "Localisation", "Photos", "Prévisualisation"] as const;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const maxImageSize = 8 * 1024 * 1024;

function isEmptyDynamicValue(value: unknown) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

function normalizedDynamicValue(field: CategoryField, value: unknown): string | number | boolean | string[] {
  if (field.fieldType === "number" || field.fieldType === "price") return Number(value);
  if (field.fieldType === "boolean" || field.fieldType === "checkbox") return Boolean(value);
  if (field.fieldType === "multi_select") return Array.isArray(value) ? value.map(String) : [String(value)];
  return String(value ?? "");
}

export default function ListingCreationForm() {
  const { user } = useAuth();
  const categoriesQuery = useCategories();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const restoredDraft = useMemo(() => {
    const draft = readListingDraft();
    return { ...draft, email: draft.email || user?.email || "" };
  }, [user?.email]);
  const form = useForm<ListingCreationValues>({ resolver: zodResolver(listingCreationSchema), defaultValues: restoredDraft, mode: "onTouched" });
  const categoryId = form.watch("categoryId");
  const categoryFieldsQuery = useCategoryFields(categoryId);
  const [step, setStep] = useState(0);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [feedback, setFeedback] = useState("");
  const [draftRestored] = useState(() => Boolean(restoredDraft.title || restoredDraft.categoryId));

  useEffect(() => {
    const subscription = form.watch((formValues) => {
      writeListingDraft({ ...restoredDraft, ...formValues } as ListingCreationValues);
    });
    return () => subscription.unsubscribe();
  }, [form, restoredDraft]);

  const dynamicFields = categoryFieldsQuery.data ?? [];
  const values = form.watch();
  const selectedCategory = categoriesQuery.data?.find((category) => category.id === categoryId);

  async function goNext() {
    setFeedback("");
    const fieldsByStep: (keyof ListingCreationValues)[][] = [
      ["categoryId"],
      ["title", "description", "price", "priceUnit"],
      ["countryCode", "city", "postalCode", "subdivisionName", "phone", "email", "postalAddress"],
      [],
    ];
    if (!(await form.trigger(fieldsByStep[step]))) return;
    if (step === 0) {
      const missing = dynamicFields.find((field) => field.isRequired && isEmptyDynamicValue(form.getValues(`dynamicValues.${field.key}`)));
      if (missing) {
        setFeedback(`Le champ « ${missing.name} » est obligatoire.`);
        return;
      }
    }
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  async function submit(valuesToSubmit: ListingCreationValues) {
    if (!user) return;
    setFeedback("");
    try {
      await createListing({
        ownerId: user.id,
        categoryId: valuesToSubmit.categoryId,
        title: valuesToSubmit.title,
        description: valuesToSubmit.description,
        city: valuesToSubmit.city,
        countryCode: valuesToSubmit.countryCode,
        postalCode: valuesToSubmit.postalCode,
        subdivisionCode: valuesToSubmit.subdivisionCode,
        subdivisionName: valuesToSubmit.subdivisionName,
        price: parseListingPrice(valuesToSubmit.price),
        priceUnit: valuesToSubmit.priceUnit,
        phone: valuesToSubmit.phone,
        email: valuesToSubmit.email,
        postalAddress: valuesToSubmit.postalAddress,
        images: selectedImages,
        fieldValues: dynamicFields.flatMap((field) => {
          const value = valuesToSubmit.dynamicValues[field.key];
          return isEmptyDynamicValue(value) ? [] : [{ fieldId: field.id, value: normalizedDynamicValue(field, value) }];
        }),
      });
      clearListingDraft();
      await queryClient.invalidateQueries({ queryKey: listingKeys.owner(user.id) });
      navigate("/espace/professionnel/annonces", { state: { listingPublished: true } });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Impossible d’enregistrer l’annonce.");
    }
  }

  if (categoriesQuery.isPending) return <p role="status" className="text-start-cream/60">Chargement des catégories…</p>;
  if (categoriesQuery.isError) return <p role="alert" className="text-red-200">Impossible de charger les catégories.</p>;

  return <form className="grid w-full gap-7" noValidate onSubmit={form.handleSubmit(submit)}>
    <div>
      <div className="flex items-center justify-between gap-4"><span className="text-xs font-bold tracking-[.16em] text-start-gold uppercase">Étape {step + 1} sur {steps.length}</span><span className="text-sm text-start-cream/50">{steps[step]}</span></div>
      <ol className="mt-3 grid grid-cols-5 gap-2" aria-label="Progression du dépôt">{steps.map((label, index) => <li key={label} aria-current={index === step ? "step" : undefined} className={`h-1.5 rounded-full ${index <= step ? "bg-start-gold" : "bg-start-cream/12"}`}><span className="sr-only">{label}</span></li>)}</ol>
      {draftRestored && <p className="mt-4 text-sm text-network-blue" role="status">Votre brouillon local a été restauré.</p>}
    </div>

    {step === 0 && <CategoryStep form={form} fields={dynamicFields} fieldsPending={categoryFieldsQuery.isPending} fieldsError={categoryFieldsQuery.isError} categories={categoriesQuery.data ?? []} />}
    {step === 1 && <InformationStep form={form} />}
    {step === 2 && <LocationStep form={form} />}
    {step === 3 && <ImagesStep images={selectedImages} onImages={(images, error) => { setSelectedImages(images); setFeedback(error); }} />}
    {step === 4 && <Preview values={values} category={selectedCategory?.label} imageCount={selectedImages.length} />}

    {feedback && <p className="rounded-xl border border-network-red/25 bg-network-red/[.06] px-4 py-3 text-sm text-red-200" role="alert">{feedback}</p>}
    <div className="flex flex-wrap justify-between gap-3 max-sm:flex-col-reverse">
      {step > 0 ? <button type="button" onClick={() => { setFeedback(""); setStep((current) => current - 1); }} className="min-h-12 rounded-xl border border-start-cream/15 px-6 font-semibold text-start-cream/70">Retour</button> : <span />}
      {step < steps.length - 1 ? <button type="button" onClick={() => void goNext()} className="min-h-12 rounded-xl bg-start-gold px-7 font-bold text-start-ink">Continuer</button> : <button type="submit" disabled={form.formState.isSubmitting || !user} className="min-h-12 rounded-xl bg-start-gold px-7 font-bold text-start-ink disabled:cursor-wait disabled:opacity-60">{form.formState.isSubmitting ? "Publication…" : "Publier l’annonce"}</button>}
    </div>
  </form>;
}

type Form = ReturnType<typeof useForm<ListingCreationValues>>;

function CategoryStep({ form, fields, fieldsPending, fieldsError, categories }: { form: Form; fields: CategoryField[]; fieldsPending: boolean; fieldsError: boolean; categories: { id: string; label: string }[] }) {
  return <section className="grid gap-5" aria-labelledby="listing-step-category"><h2 id="listing-step-category" className="text-xl font-semibold">Choisissez la catégorie</h2><label className="grid gap-2 text-sm font-semibold text-start-cream/70">Catégorie<select className={fieldClassName} {...form.register("categoryId")}><option value="">Choisir une catégorie</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}</select>{form.formState.errors.categoryId && <span className="text-xs text-red-200">{form.formState.errors.categoryId.message}</span>}</label>{fieldsPending && <p role="status" className="text-sm text-start-cream/50">Chargement des champs de la catégorie…</p>}{fieldsError && <p role="alert" className="text-sm text-red-200">Impossible de charger les champs de cette catégorie.</p>}{fields.length > 0 && <div className="grid grid-cols-2 gap-5 rounded-2xl border border-start-cream/10 p-5 max-md:grid-cols-1">{fields.map((field) => <DynamicField key={field.id} field={field} register={form.register} />)}</div>}</section>;
}

function InformationStep({ form }: { form: Form }) {
  return <section className="grid gap-5" aria-labelledby="listing-step-information"><h2 id="listing-step-information" className="text-xl font-semibold">Décrivez votre annonce</h2><label className="grid gap-2 text-sm font-semibold text-start-cream/70">Titre<input className={fieldClassName} {...form.register("title")} />{form.formState.errors.title && <span className="text-xs text-red-200">{form.formState.errors.title.message}</span>}</label><label className="grid gap-2 text-sm font-semibold text-start-cream/70">Description<textarea className={`${fieldClassName} min-h-44 resize-y`} {...form.register("description")} />{form.formState.errors.description && <span className="text-xs text-red-200">{form.formState.errors.description.message}</span>}</label><div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1"><label className="grid gap-2 text-sm font-semibold text-start-cream/70">Montant en euros <span className="font-normal text-start-cream/40">(facultatif)</span><input className={fieldClassName} type="number" min="0" step="0.01" inputMode="decimal" {...form.register("price")} />{form.formState.errors.price && <span className="text-xs text-red-200">{form.formState.errors.price.message}</span>}</label><label className="grid gap-2 text-sm font-semibold text-start-cream/70">Unité<select className={fieldClassName} {...form.register("priceUnit")}><option value="fixed">Prix fixe</option><option value="hour">Par heure</option><option value="day">Par jour</option><option value="month">Par mois</option><option value="quote">Sur devis</option></select></label></div></section>;
}

function LocationStep({ form }: { form: Form }) {
  return <section className="grid gap-5" aria-labelledby="listing-step-location"><h2 id="listing-step-location" className="text-xl font-semibold">Localisation et contact</h2><div className="grid grid-cols-2 gap-5 max-md:grid-cols-1"><label className="grid gap-2 text-sm font-semibold text-start-cream/70">Pays<select className={fieldClassName} {...form.register("countryCode")}><option value="FR">France</option><option value="CH">Suisse</option></select></label><label className="grid gap-2 text-sm font-semibold text-start-cream/70">Ville<input className={fieldClassName} autoComplete="address-level2" {...form.register("city")} />{form.formState.errors.city && <span className="text-xs text-red-200">{form.formState.errors.city.message}</span>}</label><label className="grid gap-2 text-sm font-semibold text-start-cream/70">Code postal<input className={fieldClassName} autoComplete="postal-code" {...form.register("postalCode")} /></label><label className="grid gap-2 text-sm font-semibold text-start-cream/70">Département ou canton<input className={fieldClassName} {...form.register("subdivisionName")} /></label></div><fieldset className="rounded-2xl border border-start-cream/10 p-5"><legend className="px-2 text-sm font-bold tracking-[.12em] text-start-gold uppercase">Coordonnées professionnelles</legend><p className="mb-5 text-sm leading-6 text-start-cream/45">Elles mettent à jour votre profil et restent protégées par les autorisations du serveur.</p><div className="grid grid-cols-2 gap-5 max-md:grid-cols-1"><label className="grid gap-2 text-sm font-semibold text-start-cream/70">Téléphone<input className={fieldClassName} type="tel" autoComplete="tel" {...form.register("phone")} />{form.formState.errors.phone && <span className="text-xs text-red-200">{form.formState.errors.phone.message}</span>}</label><label className="grid gap-2 text-sm font-semibold text-start-cream/70">E-mail<input className={fieldClassName} type="email" autoComplete="email" {...form.register("email")} />{form.formState.errors.email && <span className="text-xs text-red-200">{form.formState.errors.email.message}</span>}</label><label className="col-span-2 grid gap-2 text-sm font-semibold text-start-cream/70 max-md:col-span-1">Adresse exacte<input className={fieldClassName} autoComplete="street-address" {...form.register("postalAddress")} />{form.formState.errors.postalAddress && <span className="text-xs text-red-200">{form.formState.errors.postalAddress.message}</span>}</label></div></fieldset></section>;
}

function ImagesStep({ images, onImages }: { images: File[]; onImages: (images: File[], error: string) => void }) {
  return <section className="grid gap-5" aria-labelledby="listing-step-images"><h2 id="listing-step-images" className="text-xl font-semibold">Ajoutez vos photos</h2><label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-start-gold/35 bg-start-gold/[.035] px-5 py-7 text-center"><span className="font-semibold">Choisir jusqu’à 5 photos</span><span className="mt-2 text-xs text-start-cream/40">JPEG, PNG, WebP ou AVIF · 8 Mo maximum par photo</span><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(event) => { const files = Array.from(event.target.files ?? []); if (files.length > 5 || files.some((image) => !allowedImageTypes.has(image.type) || image.size > maxImageSize)) { event.target.value = ""; onImages([], "Choisissez au maximum 5 images JPEG, PNG, WebP ou AVIF de moins de 8 Mo."); return; } onImages(files, ""); }} /></label>{images.length > 0 ? <ul className="grid gap-2">{images.map((image) => <li key={`${image.name}-${image.lastModified}`} className="flex items-center justify-between gap-4 rounded-xl border border-start-cream/10 px-4 py-3 text-sm"><span className="truncate">{image.name}</span><span className="shrink-0 text-start-cream/40">{(image.size / 1024 / 1024).toFixed(1)} Mo</span></li>)}</ul> : <p className="text-sm text-start-cream/45">Les photos sont facultatives et ne sont pas conservées dans le brouillon local.</p>}</section>;
}

function Preview({ values, category, imageCount }: { values: ListingCreationValues; category?: string; imageCount: number }) {
  return <section className="grid gap-6" aria-labelledby="listing-step-preview"><h2 id="listing-step-preview" className="text-xl font-semibold">Vérifiez avant la publication</h2><div className="grid gap-5 rounded-2xl border border-start-gold/20 bg-[#0b0d10]/70 p-6"><div><span className="text-xs font-bold tracking-[.14em] text-start-gold uppercase">{category ?? "Catégorie"}</span><h3 className="mt-2 text-2xl font-semibold">{values.title}</h3></div><p className="whitespace-pre-wrap leading-7 text-start-cream/65">{values.description}</p><dl className="grid grid-cols-2 gap-4 text-sm max-sm:grid-cols-1"><div><dt className="text-start-cream/40">Localisation</dt><dd className="mt-1">{values.city} · {values.countryCode === "CH" ? "Suisse" : "France"}</dd></div><div><dt className="text-start-cream/40">Tarif</dt><dd className="mt-1">{values.price ? `${values.price} €` : "Sur demande"}</dd></div><div><dt className="text-start-cream/40">Photos</dt><dd className="mt-1">{imageCount}</dd></div><div><dt className="text-start-cream/40">Statut après publication</dt><dd className="mt-1">Active</dd></div></dl></div><p className="text-sm leading-6 text-start-cream/50">L’annonce sera visible immédiatement. Vous pourrez ensuite la modifier depuis votre espace professionnel.</p></section>;
}

function DynamicField({ field, register }: { field: CategoryField; register: UseFormRegister<ListingCreationValues> }) {
  const path = `dynamicValues.${field.key}` as const;
  const label = <>{field.name}{field.isRequired ? " *" : ""}</>;
  if (field.fieldType === "select" || field.fieldType === "multi_select") return <label className="grid gap-2 text-sm font-semibold text-start-cream/70">{label}<select className={fieldClassName} multiple={field.fieldType === "multi_select"} {...register(path)}><option value="">Choisir</option>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{field.helpText && <span className="text-xs font-normal text-start-cream/40">{field.helpText}</span>}</label>;
  if (field.fieldType === "boolean" || field.fieldType === "checkbox") return <label className="flex min-h-12 items-center gap-3 text-sm font-semibold text-start-cream/70"><input className="size-5 accent-[#c7a45d]" type="checkbox" {...register(path)} />{label}</label>;
  if (field.fieldType === "textarea") return <label className="grid gap-2 text-sm font-semibold text-start-cream/70">{label}<textarea className={`${fieldClassName} min-h-28 resize-y`} placeholder={field.placeholder ?? undefined} {...register(path)} /></label>;
  const type = field.fieldType === "number" || field.fieldType === "price" ? "number" : field.fieldType === "date" ? "date" : field.fieldType === "url" ? "url" : "text";
  return <label className="grid gap-2 text-sm font-semibold text-start-cream/70">{label}<input className={fieldClassName} type={type} placeholder={field.placeholder ?? undefined} {...register(path)} /></label>;
}
