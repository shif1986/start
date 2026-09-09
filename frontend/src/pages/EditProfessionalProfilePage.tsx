import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import AccountShell from "../components/AccountShell";
import { useAuth } from "../features/auth/context/use-auth";
import { getCurrentProfileContacts } from "../features/profiles/api/get-current-profile-contacts";
import { updateMyProfile } from "../features/profiles/api/update-my-profile";
import { useCurrentProfile } from "../features/profiles/hooks/use-current-profile";
import { professionalAccountNavigation } from "../features/profiles/model/account-navigation";
import { profileFormSchema, type ProfileFormValues } from "../features/profiles/model/profile-form-schema";
import { profileKeys } from "../features/profiles/model/profile-keys";
import { queryClient } from "../lib/query-client";

const emptyValues: ProfileFormValues = { username: "", displayName: "", avatarUrl: "", bio: "", city: "", phone: "", publicEmail: "", postalAddress: "" };

export default function EditProfessionalProfilePage() {
  const { user } = useAuth();
  const profileQuery = useCurrentProfile();
  const [loadError, setLoadError] = useState("");
  const [saved, setSaved] = useState(false);
  const form = useForm<ProfileFormValues>({ resolver: zodResolver(profileFormSchema), defaultValues: emptyValues });

  useEffect(() => {
    if (!user?.id || !profileQuery.data) return;
    let cancelled = false;
    void getCurrentProfileContacts(user.id).then((contacts) => {
      if (cancelled || !profileQuery.data) return;
      form.reset({
        username: profileQuery.data.username, displayName: profileQuery.data.displayName,
        avatarUrl: profileQuery.data.avatarUrl ?? "", bio: profileQuery.data.bio ?? "", city: profileQuery.data.city ?? "",
        phone: contacts.phone, publicEmail: contacts.publicEmail, postalAddress: contacts.postalAddress,
      });
    }).catch(() => { if (!cancelled) setLoadError("Impossible de charger toutes vos coordonnées."); });
    return () => { cancelled = true; };
  }, [form, profileQuery.data, user?.id]);

  async function submit(values: ProfileFormValues) {
    setSaved(false);
    setLoadError("");
    try {
      await updateMyProfile(values);
      await queryClient.invalidateQueries({ queryKey: profileKeys.all });
      setSaved(true);
    } catch (error) {
      form.setError("root", { message: error instanceof Error ? error.message : "Impossible d’enregistrer le profil." });
    }
  }

  const inputClass = "min-h-11 rounded-xl border border-start-cream/15 bg-[#0b0d10] px-4 py-3 text-start-cream outline-none focus:border-start-gold";
  const fields: { name: keyof ProfileFormValues; label: string; type?: string; placeholder?: string }[] = [
    { name: "username", label: "Nom d’utilisateur" }, { name: "displayName", label: "Nom affiché" },
    { name: "avatarUrl", label: "Adresse HTTPS de la photo", type: "url", placeholder: "https://…" },
    { name: "city", label: "Ville" }, { name: "phone", label: "Téléphone", type: "tel" },
    { name: "publicEmail", label: "E-mail professionnel public", type: "email" },
    { name: "postalAddress", label: "Adresse postale" },
  ];

  return <AccountShell eyebrow="Profil professionnel" title="Modifier votre profil" description="Ces informations alimentent votre page publique. Les coordonnées restent soumises aux règles d’accès du réseau." navigation={[...professionalAccountNavigation]}>
    {loadError && <p role="alert" className="mb-5 rounded-xl border border-network-red/30 p-4 text-red-200">{loadError}</p>}
    <form onSubmit={form.handleSubmit(submit)} className="grid max-w-3xl gap-5 rounded-2xl border border-start-cream/10 bg-[#121418] p-6 max-sm:p-4">
      <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">{fields.map((field) => <label key={field.name} className={field.name === "postalAddress" || field.name === "avatarUrl" ? "grid gap-2 sm:col-span-2" : "grid gap-2"}><span className="text-sm font-semibold">{field.label}</span><input {...form.register(field.name)} type={field.type} placeholder={field.placeholder} className={inputClass} />{form.formState.errors[field.name]?.message && <span className="text-sm text-red-200">{form.formState.errors[field.name]?.message}</span>}</label>)}</div>
      <label className="grid gap-2"><span className="text-sm font-semibold">Présentation</span><textarea {...form.register("bio")} rows={6} className={inputClass} />{form.formState.errors.bio?.message && <span className="text-sm text-red-200">{form.formState.errors.bio.message}</span>}</label>
      {form.formState.errors.root?.message && <p role="alert" className="text-sm text-red-200">{form.formState.errors.root.message}</p>}
      {saved && <p role="status" className="text-sm text-network-blue">Profil enregistré. <Link className="font-semibold underline" to={`/professionnel/${form.getValues("username")}`}>Voir la page publique</Link></p>}
      <button type="submit" disabled={form.formState.isSubmitting} className="min-h-12 rounded-xl bg-start-gold px-5 font-bold text-start-ink disabled:opacity-50">{form.formState.isSubmitting ? "Enregistrement…" : "Enregistrer le profil"}</button>
    </form>
  </AccountShell>;
}
