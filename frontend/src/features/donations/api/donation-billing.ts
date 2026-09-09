import { getSupabaseClient } from "../../../lib/supabase/client";

export type DonationCheckoutInput = { amountCents: number; frequency: "once" | "monthly"; firstName: string; lastName: string; email: string; consent: true };
export type DonationStatus = { status: "pending" | "active" | "succeeded" | "failed" | "canceled"; amountCents: number; currency: string; frequency: "once" | "monthly" };

export async function createDonationCheckout(input: DonationCheckoutInput) {
  const { data, error } = await getSupabaseClient().functions.invoke<{ url?: string; error?: string }>("create-donation-checkout", { body: { ...input, requestId: crypto.randomUUID() } });
  if (error) throw new Error(data?.error ?? "Le service de don est momentanément indisponible.", { cause: error });
  if (!data?.url?.startsWith("https://")) throw new Error(data?.error ?? "Adresse de paiement invalide.");
  return data.url;
}

export async function getDonationStatus(sessionId: string): Promise<DonationStatus> {
  const { data, error } = await getSupabaseClient().functions.invoke<DonationStatus & { error?: string }>("get-donation-status", { body: { sessionId } });
  if (error || !data?.status) throw new Error(data?.error ?? "Impossible de confirmer ce don.", { cause: error });
  return data;
}
