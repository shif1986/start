import { getSupabaseClient } from "../../../lib/supabase/client";
import { getFunctionErrorMessage } from "../../../lib/supabase/function-error";

export type ProfessionalAccessGrant = {
  id: string;
  email: string;
  duration: "one_year" | "lifetime";
  starts_at: string;
  ends_at: string | null;
  revoked_at: string | null;
  note: string | null;
  created_at: string;
};

async function invokeProfessionalAccess(body: Record<string, unknown>) {
  const { data, error } = await getSupabaseClient().functions.invoke<{ grants?: ProfessionalAccessGrant[]; grant?: ProfessionalAccessGrant; error?: string }>("manage-professional-access", { body });
  if (error) throw new Error(await getFunctionErrorMessage(error, "Impossible de gérer l’accès professionnel offert."), { cause: error });
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function getProfessionalAccessGrants() {
  return (await invokeProfessionalAccess({ action: "list" }))?.grants ?? [];
}

export async function grantProfessionalAccess(email: string, duration: "one_year" | "lifetime", note: string) {
  return (await invokeProfessionalAccess({ action: "grant", email, duration, note }))?.grant;
}

export async function revokeProfessionalAccess(email: string) {
  await invokeProfessionalAccess({ action: "revoke", email });
}
