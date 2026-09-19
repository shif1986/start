import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";
import { getSupabaseEnv } from "../../../lib/supabase/env";

type EmailCredentials = {
  email: string;
  password: string;
};

type SignUpCredentials = EmailCredentials & {
  displayName: string;
  companyName: string;
  accountType: Database["public"]["Enums"]["account_type"];
  redirectPath: string;
};

type ResendSignupCredentials = Pick<EmailCredentials, "email"> & {
  redirectPath: string;
};

function safeRedirectPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//") ? path : "/";
}

export async function isGoogleAuthEnabled() {
  const environment = getSupabaseEnv();
  const response = await fetch(`${environment.url}/auth/v1/settings`, {
    headers: { apikey: environment.anonKey },
  });
  if (!response.ok) return false;
  const settings = await response.json() as { external?: { google?: boolean } };
  return settings.external?.google === true;
}

export async function signInWithEmail(credentials: EmailCredentials, client: SupabaseClient<Database> = getSupabaseClient()) {
  const { data, error } = await client.auth.signInWithPassword(credentials);
  if (error) throw new Error("Adresse e-mail ou mot de passe incorrect.", { cause: error });
  return data;
}

export async function signUpWithEmail(credentials: SignUpCredentials, client: SupabaseClient<Database> = getSupabaseClient()) {
  const emailRedirectTo = new URL(`/auth/callback?next=${encodeURIComponent(safeRedirectPath(credentials.redirectPath))}`, window.location.origin).toString();
  const { data, error } = await client.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      emailRedirectTo,
      data: {
        display_name: credentials.displayName,
        company_name: credentials.accountType === "professional" ? credentials.companyName || null : null,
        account_type: credentials.accountType,
      },
    },
  });
  if (error) throw new Error("Impossible de créer ce compte.", { cause: error });
  return data;
}

export async function resendSignupConfirmation(credentials: ResendSignupCredentials, client: SupabaseClient<Database> = getSupabaseClient()) {
  const emailRedirectTo = new URL(`/auth/callback?next=${encodeURIComponent(safeRedirectPath(credentials.redirectPath))}`, window.location.origin).toString();
  const { data, error } = await client.auth.resend({
    type: "signup",
    email: credentials.email,
    options: { emailRedirectTo },
  });
  if (error?.code === "email_address_not_authorized") {
    throw new Error("Le service d’e-mail n’est pas encore configuré pour envoyer à cette adresse.", { cause: error });
  }
  if (error?.code === "over_email_send_rate_limit" || error?.status === 429) {
    throw new Error("Trop de demandes ont été envoyées. Patientez quelques minutes avant de réessayer.", { cause: error });
  }
  if (error) throw new Error("Impossible de renvoyer l’e-mail de confirmation.", { cause: error });
  return data;
}

export async function signInWithGoogle(
  redirectPath: string | undefined,
  accountType: Database["public"]["Enums"]["account_type"],
  adminIntent = false,
  client: SupabaseClient<Database> = getSupabaseClient(),
  registrationIdentity?: { displayName: string; companyName: string },
) {
  sessionStorage.setItem("start-oauth-account-type", accountType);
  if (registrationIdentity) {
    sessionStorage.setItem("start-oauth-registration-identity", JSON.stringify(registrationIdentity));
  } else {
    sessionStorage.removeItem("start-oauth-registration-identity");
  }
  if (redirectPath) {
    sessionStorage.setItem("start-oauth-next", safeRedirectPath(redirectPath));
  } else {
    sessionStorage.removeItem("start-oauth-next");
  }
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  if (redirectPath) callbackUrl.searchParams.set("next", safeRedirectPath(redirectPath));
  if (adminIntent) callbackUrl.searchParams.set("intent", "admin");
  const redirectTo = callbackUrl.toString();
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) throw new Error("Impossible de lancer la connexion Google.", { cause: error });
  return data;
}

export async function signOut(client: SupabaseClient<Database> = getSupabaseClient()) {
  const { error } = await client.auth.signOut();
  if (error) throw new Error("Impossible de vous déconnecter.", { cause: error });
}
