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

export function appUrl(request?: Request) {
  const configured = (Deno.env.get("APP_URLS") ?? Deno.env.get("APP_URL") ?? "")
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const origin = request?.headers.get("origin")?.replace(/\/$/, "") ?? "";
  const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if (origin && (isLocal || configured.includes(origin))) return origin;

  const fallback = Deno.env.get("APP_URL")?.replace(/\/$/, "") ?? configured[0];
  if (!fallback) throw new Error("Configuration serveur APP_URL manquante");
  return fallback;
}
