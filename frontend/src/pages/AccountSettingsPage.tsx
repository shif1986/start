import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import AccountShell from "../components/AccountShell";
import { updateAccountEmail } from "../features/auth/api/auth-actions";
import { useAuth } from "../features/auth/context/use-auth";
import { enableAccountType } from "../features/profiles/api/enable-account-type";
import { getCurrentProfileContacts } from "../features/profiles/api/get-current-profile-contacts";
import { updateMyProfile } from "../features/profiles/api/update-my-profile";
import { useCurrentProfile } from "../features/profiles/hooks/use-current-profile";
import { customerAccountNavigation, professionalAccountNavigation } from "../features/profiles/model/account-navigation";
import { profileFormSchema, type ProfileFormValues } from "../features/profiles/model/profile-form-schema";
import { profileKeys } from "../features/profiles/model/profile-keys";
import { queryClient } from "../lib/query-client";

type AccountType = "customer" | "professional";
const emptyValues: ProfileFormValues = { username: "", displayName: "", companyName: "", avatarUrl: "", bio: "", city: "", phone: "", publicEmail: "", postalAddress: "" };

export default function AccountSettingsPage({ accountType }: { accountType: AccountType }) {
  const { user } = useAuth();
  const profileQuery = useCurrentProfile();
  const isProfessional = accountType === "professional";
  const form = useForm<ProfileFormValues>({ resolver: zodResolver(profileFormSchema), defaultValues: emptyValues });
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileMessage, setProfileMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isEmailPending, setIsEmailPending] = useState(false);
  const [isModePending, setIsModePending] = useState(false);
  const [modeError, setModeError] = useState("");
  const otherAccountType: AccountType = isProfessional ? "customer" : "professional";
  const hasOtherSpace = profileQuery.data?.accountTypes.includes(otherAccountType) === true;

  useEffect(() => {
    if (!user?.id || !profileQuery.data) return;
    let cancelled = false;
    void getCurrentProfileContacts(user.id).then((contacts) => {
      if (cancelled) return;
      form.reset({ username: profileQuery.data!.username, displayName: profileQuery.data!.displayName, companyName: profileQuery.data!.companyName ?? "", avatarUrl: profileQuery.data!.avatarUrl ?? "", bio: profileQuery.data!.bio ?? "", city: profileQuery.data!.city ?? "", phone: contacts.phone, publicEmail: contacts.publicEmail, postalAddress: contacts.postalAddress });
    }).catch(() => { if (!cancelled) setProfileMessage("Impossible de charger toutes vos coordonnées."); });
    return () => { cancelled = true; };
  }, [form, profileQuery.data, user?.id]);

  async function saveProfile(values: ProfileFormValues) {
    setProfileMessage("");
    try {
      await updateMyProfile(values);
      await queryClient.invalidateQueries({ queryKey: profileKeys.all });
      setProfileMessage("Profil enregistré.");
    } catch (error) {
      form.setError("root", { message: error instanceof Error ? error.message : "Impossible d’enregistrer le profil." });
    }
  }

  async function saveEmail() {
    if (!email || email === user?.email) return;
    setEmailMessage("");
    setIsEmailPending(true);
    try {
      await updateAccountEmail(email);
      setEmailMessage("Demande enregistrée. Confirmez la modification depuis l’e-mail reçu avant de vous reconnecter.");
    } catch (error) {
      setEmailMessage(error instanceof Error ? error.message : "Impossible de modifier l’adresse e-mail.");
    } finally {
      setIsEmailPending(false);
    }
  }

  async function activateOtherSpace() {
    setModeError("");
    setIsModePending(true);
    try {
      await enableAccountType(otherAccountType);
      await queryClient.invalidateQueries({ queryKey: profileKeys.all });
    } catch (error) {
      setModeError(error instanceof Error ? error.message : "Impossible d’activer cet espace.");
    } finally {
      setIsModePending(false);
    }
  }

  const inputClass = "min-h-11 rounded-xl border border-start-cream/15 bg-[#0b0d10] px-4 py-3 text-start-cream outline-none focus:border-start-gold";
  const fields: { name: keyof ProfileFormValues; label: string; type?: string; wide?: boolean }[] = [
    { name: "username", label: "Nom d’utilisateur" }, { name: "displayName", label: "Nom et prénom" }, { name: "avatarUrl", label: "Adresse HTTPS de la photo", type: "url", wide: true }, { name: "city", label: "Ville" },
    ...(isProfessional ? [{ name: "companyName" as const, label: "Nom de l’entreprise" }, { name: "phone" as const, label: "Téléphone professionnel", type: "tel" }, { name: "publicEmail" as const, label: "E-mail professionnel public", type: "email" }, { name: "postalAddress" as const, label: "Adresse postale", wide: true }] : []),
  ];
  const otherLabel = isProfessional ? "particulier" : "professionnel";
  const otherPath = isProfessional ? "/espace/particulier" : "/espace/professionnel";

  return <AccountShell eyebrow={isProfessional ? "Compte professionnel" : "Compte particulier"} title="Paramètres du compte" description="Modifiez votre profil, votre adresse de connexion et vos espaces START." navigation={[...(isProfessional ? professionalAccountNavigation : customerAccountNavigation)]}>
    <section className="max-w-3xl rounded-2xl border border-start-cream/10 bg-[#121418] p-6 max-sm:p-4"><h2 className="text-xl font-semibold">Adresse e-mail de connexion</h2><p className="mt-2 text-sm leading-6 text-start-cream/55">Cette adresse est commune à vos espaces particulier et professionnel.</p><div className="mt-5 flex flex-wrap gap-3"><label className="min-w-[min(100%,24rem)] flex-1"><span className="sr-only">Adresse e-mail de connexion</span><input className={inputClass} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><button type="button" disabled={isEmailPending || !email || email === user?.email} onClick={() => void saveEmail()} className="min-h-11 rounded-xl bg-start-gold px-5 font-bold text-start-ink disabled:cursor-not-allowed disabled:opacity-55">{isEmailPending ? "Demande…" : "Modifier l’e-mail"}</button></div>{emailMessage && <p className="mt-4 text-sm text-start-cream/70" role="status">{emailMessage}</p>}</section>
    <section className="mt-6 max-w-3xl rounded-2xl border border-start-cream/10 bg-[#121418] p-6 max-sm:p-4"><h2 className="text-xl font-semibold">Vos espaces</h2><p className="mt-2 text-sm leading-6 text-start-cream/55">Un seul e-mail peut accéder aux deux espaces, sans créer un second compte.</p>{hasOtherSpace ? <Link className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-start-gold/40 px-5 font-semibold text-start-gold" to={otherPath}>Ouvrir l’espace {otherLabel}</Link> : <><button type="button" disabled={isModePending} onClick={() => void activateOtherSpace()} className="mt-5 min-h-11 rounded-xl border border-start-gold/40 px-5 font-semibold text-start-gold disabled:opacity-55">{isModePending ? "Activation…" : `Activer l’espace ${otherLabel}`}</button>{modeError && <p className="mt-3 text-sm text-red-200" role="alert">{modeError}</p>}</>}</section>
    <form onSubmit={form.handleSubmit(saveProfile)} className="mt-6 grid max-w-3xl gap-5 rounded-2xl border border-start-cream/10 bg-[#121418] p-6 max-sm:p-4"><div><h2 className="text-xl font-semibold">Informations de profil</h2><p className="mt-2 text-sm leading-6 text-start-cream/55">Les coordonnées professionnelles publiques ne sont proposées que dans l’espace professionnel.</p></div><div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">{fields.map((field) => <label key={field.name} className={`grid gap-2 ${field.wide ? "sm:col-span-2" : ""}`}><span className="text-sm font-semibold">{field.label}</span><input {...form.register(field.name)} type={field.type} className={inputClass} />{form.formState.errors[field.name] && <span className="text-sm text-red-200">{form.formState.errors[field.name]?.message}</span>}</label>)}</div><label className="grid gap-2"><span className="text-sm font-semibold">Présentation</span><textarea {...form.register("bio")} rows={6} className={inputClass} /></label>{form.formState.errors.root?.message && <p role="alert" className="text-sm text-red-200">{form.formState.errors.root.message}</p>}{profileMessage && <p role="status" className="text-sm text-network-blue">{profileMessage}</p>}<button type="submit" disabled={form.formState.isSubmitting} className="min-h-12 rounded-xl bg-start-gold px-5 font-bold text-start-ink disabled:opacity-55">{form.formState.isSubmitting ? "Enregistrement…" : "Enregistrer le profil"}</button></form>
  </AccountShell>;
}
