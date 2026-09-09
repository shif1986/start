import { corsHeaders, jsonResponse, requirePost } from "../_shared/http.ts";
import { appUrl, createStripeClient, stripePriceId } from "../_shared/stripe.ts";
import { createAdminClient, getAuthenticatedUser } from "../_shared/supabase.ts";

const requestIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(async (request) => {
  const headers = corsHeaders(request);
  const methodResponse = requirePost(request, headers);
  if (methodResponse) return methodResponse;

  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json() as { planCode?: string; requestId?: string };
    if (!body.planCode || !body.requestId || !requestIdPattern.test(body.requestId)) return jsonResponse({ error: "Demande de paiement invalide." }, 400, headers);

    const admin = createAdminClient();
    const [{ data: profile, error: profileError }, { data: plan, error: planError }, { data: current, error: subscriptionError }] = await Promise.all([
      admin.from("profiles").select("account_type,account_status").eq("id", user.id).single(),
      admin.from("subscription_plans").select("id,code,is_active").eq("code", body.planCode).eq("is_active", true).single(),
      admin.from("subscriptions").select("provider_customer_id,status,current_period_end").eq("user_id", user.id).in("status", ["incomplete", "trialing", "active", "past_due"]).maybeSingle(),
    ]);
    if (profileError || profile?.account_type !== "professional" || profile.account_status !== "active") return jsonResponse({ error: "Un compte professionnel actif est requis." }, 403, headers);
    if (planError || !plan) return jsonResponse({ error: "Formule indisponible." }, 404, headers);
    if (subscriptionError) throw subscriptionError;
    if (current) return jsonResponse({ error: "Un abonnement existe déjà. Utilisez le portail de gestion." }, 409, headers);

    const stripe = createStripeClient();
    const siteUrl = appUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: stripePriceId(plan.code), quantity: 1 }],
      success_url: `${siteUrl}/espace/professionnel/abonnement?checkout=success`,
      cancel_url: `${siteUrl}/abonnement?checkout=cancelled`,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: { kind: "professional_subscription", user_id: user.id, plan_id: plan.id, plan_code: plan.code },
      subscription_data: { metadata: { kind: "professional_subscription", user_id: user.id, plan_id: plan.id, plan_code: plan.code } },
    }, { idempotencyKey: `subscription-checkout-${user.id}-${body.requestId}` });

    if (!session.url) throw new Error("Stripe n’a retourné aucune URL de paiement");
    return jsonResponse({ url: session.url }, 200, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur de paiement";
    const status = message === "Authentification requise" ? 401 : 500;
    return jsonResponse({ error: status === 500 ? "Impossible d’ouvrir le paiement." : message }, status, headers);
  }
});
