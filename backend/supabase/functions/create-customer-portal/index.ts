import { corsHeaders, jsonResponse, requirePost } from "../_shared/http.ts";
import { appUrl, createStripeClient } from "../_shared/stripe.ts";
import { createAdminClient, getAuthenticatedUser } from "../_shared/supabase.ts";

Deno.serve(async (request) => {
  const headers = corsHeaders(request);
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

    const session = await createStripeClient().billingPortal.sessions.create({
      customer: data.provider_customer_id,
      return_url: `${appUrl()}/espace/professionnel/abonnement`,
    });
    return jsonResponse({ url: session.url }, 200, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur de facturation";
    const status = message === "Authentification requise" ? 401 : 500;
    return jsonResponse({ error: status === 500 ? "Impossible d’ouvrir la gestion de l’abonnement." : message }, status, headers);
  }
});
