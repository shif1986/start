import { corsHeaders, jsonResponse, requireAllowedOrigin, requirePost } from "../_shared/http.ts";
import { createStripeClient } from "../_shared/stripe.ts";
import { createAdminClient, getAuthenticatedUser } from "../_shared/supabase.ts";

function isMissingStripeCustomer(error: unknown) {
  if (!(error instanceof Error)) return false;
  return /no such customer/i.test(error.message)
    || ("code" in error && error.code === "resource_missing");
}

Deno.serve(async (request) => {
  const headers = corsHeaders(request);
  const originResponse = requireAllowedOrigin(request, headers);
  if (originResponse) return originResponse;
  const methodResponse = requirePost(request, headers);
  if (methodResponse) return methodResponse;

  try {
    const user = await getAuthenticatedUser(request);
    const admin = createAdminClient();
    const { data: subscription, error: readError } = await admin.from("subscriptions")
      .select("id,provider_customer_id")
      .eq("user_id", user.id)
      .in("status", ["incomplete", "trialing", "active", "past_due"])
      .maybeSingle();
    if (readError) throw readError;
    if (!subscription?.provider_customer_id?.startsWith("cus_")) {
      return jsonResponse({ error: "Aucun abonnement Stripe inaccessible n’a été trouvé." }, 404, headers);
    }

    try {
      await createStripeClient().customers.retrieve(subscription.provider_customer_id);
      return jsonResponse({ error: "Cet abonnement existe dans le compte Stripe configuré et doit être résilié depuis le portail Stripe." }, 409, headers);
    } catch (error) {
      if (!isMissingStripeCustomer(error)) throw error;
    }

    const now = new Date().toISOString();
    const { error: updateError } = await admin.from("subscriptions").update({
      status: "canceled",
      canceled_at: now,
      current_period_end: now,
      cancel_at_period_end: false,
    }).eq("id", subscription.id).eq("user_id", user.id);
    if (updateError) throw updateError;
    return jsonResponse({ reset: true }, 200, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur de facturation";
    const status = message === "Authentification requise" ? 401 : 500;
    return jsonResponse({ error: status === 500 ? "Impossible de réinitialiser cet abonnement." : message }, status, headers);
  }
});
