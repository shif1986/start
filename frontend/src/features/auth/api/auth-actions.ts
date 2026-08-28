import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { getSupabaseClient } from "../../../lib/supabase/client";

type EmailCredentials = {
  email: string;
  password: string;
};

type SignUpCredentials = EmailCredentials & {
  displayName: string;
  accountType: Database["public"]["Enums"]["account_type"];
};

function safeRedirectPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//") ? path : "/";
}

export async function signInWithEmail(credentials: EmailCredentials, client: SupabaseClient<Database> = getSupabaseClient()) {
  const { data, error } = await client.auth.signInWithPassword(credentials);
  if (error) throw new Error("Adresse e-mail ou mot de passe incorrect.", { cause: error });
  return data;
}

export async function signUpWithEmail(credentials: SignUpCredentials, client: SupabaseClient<Database> = getSupabaseClient()) {
  const { data, error } = await client.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        display_name: credentials.displayName,
        account_type: credentials.accountType,
      },
    },
  });
  if (error) throw new Error("Impossible de créer ce compte.", { cause: error });
  return data;
}

export async function signInWithGoogle(redirectPath: string, client: SupabaseClient<Database> = getSupabaseClient()) {
  const redirectTo = new URL(safeRedirectPath(redirectPath), window.location.origin).toString();
  const { data, error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
  if (error) throw new Error("Impossible de lancer la connexion Google.", { cause: error });
  return data;
}

export async function signOut(client: SupabaseClient<Database> = getSupabaseClient()) {
  const { error } = await client.auth.signOut();
  if (error) throw new Error("Impossible de vous déconnecter.", { cause: error });
}
