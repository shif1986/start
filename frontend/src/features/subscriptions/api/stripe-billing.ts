import { getSupabaseClient } from "../../../lib/supabase/client";

async function invokeBillingFunction(name: string, body?: object) {
  const { data, error } = await getSupabaseClient().functions.invoke<{ url?: string; error?: string }>(name, { body: body ?? {} });
  if (error) throw new Error(data?.error ?? "Le service de paiement est momentanément indisponible.", { cause: error });
  if (!data?.url || !data.url.startsWith("https://")) throw new Error(data?.error ?? "Adresse de paiement invalide.");
  return data.url;
}

export function createSubscriptionCheckout(planCode: string) {
  return invokeBillingFunction("create-subscription-checkout", { planCode, requestId: crypto.randomUUID() });
}

export function createCustomerPortal() {
  return invokeBillingFunction("create-customer-portal");
}
