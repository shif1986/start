import Stripe from "npm:stripe@22.0.0";
import { corsHeaders, jsonResponse, requireAllowedOrigin, requirePost } from "../_shared/http.ts";
import { createStripeClient } from "../_shared/stripe.ts";
import { createAdminClient, getAuthenticatedUser } from "../_shared/supabase.ts";

const sessionIdPattern = /^cs_(?:test_|live_)?[A-Za-z0-9]+$/;

function iso(timestamp: number | null | undefined) {
  return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}

function subscriptionStatus(status: string) {
  if (["incomplete", "trialing", "active", "past_due", "canceled", "unpaid"].includes(status)) return status;
  return "past_due";
}

function referenceId(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value && typeof value.id === "string") return value.id;
  return null;
}

Deno.serve(async (request) => {
  const headers = corsHeaders(request);
  const originResponse = requireAllowedOrigin(request, headers);
  if (originResponse) return originResponse;
  const methodResponse = requirePost(request, headers);
  if (methodResponse) return methodResponse;

  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json() as { sessionId?: string };
    if (!body.sessionId || !sessionIdPattern.test(body.sessionId)) return jsonResponse({ error: "Session de paiement invalide." }, 400, headers);

    const stripe = createStripeClient();
    const session = await stripe.checkout.sessions.retrieve(body.sessionId, { expand: ["subscription"] });
    if (session.mode !== "subscription" || session.status !== "complete" || session.metadata?.kind !== "professional_subscription") {
      return jsonResponse({ error: "Le paiement n’est pas encore finalisé." }, 409, headers);
    }
    if (session.client_reference_id !== user.id || session.metadata.user_id !== user.id || !session.metadata.plan_id) {
      return jsonResponse({ error: "Cette session de paiement ne correspond pas à votre compte." }, 403, headers);
    }

    const subscription = typeof session.subscription === "string"
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription as Stripe.Subscription | null;
    if (!subscription) return jsonResponse({ error: "Abonnement Stripe introuvable." }, 409, headers);

    const item = subscription.items.data[0];
    const periodStart = (subscription as Stripe.Subscription & { current_period_start?: number }).current_period_start ?? item?.current_period_start;
    const periodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end ?? item?.current_period_end;
    const { error } = await createAdminClient().from("subscriptions").upsert({
      user_id: user.id,
      plan_id: session.metadata.plan_id,
      status: subscriptionStatus(subscription.status),
      provider: "stripe",
      provider_customer_id: referenceId(subscription.customer),
      provider_subscription_id: subscription.id,
      current_period_start: iso(periodStart),
      current_period_end: iso(periodEnd),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: iso(subscription.canceled_at),
    }, { onConflict: "provider_subscription_id" });
    if (error) throw error;
    return jsonResponse({ active: subscription.status === "active" || subscription.status === "trialing" }, 200, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur de paiement";
    const status = message === "Authentification requise" ? 401 : 500;
    return jsonResponse({ error: status === 500 ? "Impossible de confirmer le paiement." : message }, status, headers);
  }
});
