import Stripe from "npm:stripe@22.0.0";

export function createStripeClient() {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("Configuration serveur Stripe manquante");
  return new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
}

export function stripePriceId(planCode: string) {
  const names: Record<string, string> = {
    pro_monthly: "STRIPE_PRICE_PRO_MONTHLY",
    pro_yearly: "STRIPE_PRICE_PRO_YEARLY",
  };
  const variable = names[planCode];
  const value = variable ? Deno.env.get(variable) : undefined;
  if (!value) throw new Error("Cette formule n’est pas configurée pour le paiement");
  return value;
}

export function appUrl() {
  const value = Deno.env.get("APP_URL")?.replace(/\/$/, "");
  if (!value) throw new Error("Configuration serveur APP_URL manquante");
  return value;
}
