import { corsHeaders, jsonResponse, requireAllowedOrigin, requirePost } from "../_shared/http.ts";
import { appUrl, createStripeClient } from "../_shared/stripe.ts";
import { createAdminClient, getAuthenticatedUser } from "../_shared/supabase.ts";

function customerPortalError(error: unknown) {
  if (!(error instanceof Error)) return "Impossible d’ouvrir la gestion de l’abonnement.";
  if (error.message === "Authentification requise") return error.message;
  if (/no such customer/i.test(error.message)) {
    return "Le client Stripe associé est introuvable. Vérifiez que l’abonnement et la clé Stripe utilisent le même environnement (test ou réel).";
  }
  if (/portal.*configur|configur.*portal/i.test(error.message)) {
    return "Le portail client Stripe n’est pas encore configuré. Activez-le dans Stripe pour permettre la résiliation.";
  }
  if (/configuration serveur stripe manquante/i.test(error.message)) {
    return "La configuration Stripe du serveur est incomplète.";
  }
  return "Impossible d’ouvrir la gestion de l’abonnement.";
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
    const { data, error } = await admin.from("subscriptions")
      .select("provider_customer_id")
      .eq("user_id", user.id)
      .not("provider_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data?.provider_customer_id) return jsonResponse({ error: "Aucun compte de facturation Stripe n’est encore associé." }, 404, headers);
    if (!data.provider_customer_id.startsWith("cus_")) {
      return jsonResponse({ error: "Cet abonnement est géré directement par START et ne dispose pas de portail Stripe." }, 409, headers);
    }

    const session = await createStripeClient().billingPortal.sessions.create({
      customer: data.provider_customer_id,
      return_url: `${appUrl(request)}/espace/professionnel/abonnement`,
    });
    return jsonResponse({ url: session.url }, 200, headers);
  } catch (error) {
    const message = customerPortalError(error);
    const status = message === "Authentification requise" ? 401 : 500;
    return jsonResponse({ error: message }, status, headers);
  }
});
