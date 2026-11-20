import { corsHeaders, jsonResponse, requireAllowedOrigin, requirePost } from "../_shared/http.ts";
import { createStripeClient } from "../_shared/stripe.ts";
import { createAdminClient, getAuthenticatedUser } from "../_shared/supabase.ts";

function errorMessage(error: unknown) {
  if (error instanceof Error && /no such subscription/i.test(error.message)) return null;
  return error instanceof Error ? error.message : "Erreur inconnue";
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
    const { data: profile, error: profileError } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profileError) throw profileError;
    if (profile?.role === "admin" || profile?.role === "moderator") {
      return jsonResponse({ error: "Les comptes de modération ne peuvent pas être supprimés depuis cet espace." }, 403, headers);
    }

    const { data: subscriptions, error: subscriptionsError } = await admin.from("subscriptions")
      .select("provider_subscription_id")
      .eq("user_id", user.id)
      .not("provider_subscription_id", "is", null)
      .neq("status", "canceled");
    if (subscriptionsError) throw subscriptionsError;

    if (subscriptions && subscriptions.length > 0) {
      const stripe = createStripeClient();
      for (const subscription of subscriptions) {
        if (!subscription.provider_subscription_id) continue;
        try {
          await stripe.subscriptions.cancel(subscription.provider_subscription_id);
        } catch (error) {
          const message = errorMessage(error);
          if (message) throw error;
        }
      }
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;
    return jsonResponse({ deleted: true }, 200, headers);
  } catch (error) {
    return jsonResponse({ error: "Impossible de supprimer ce compte pour le moment." }, 500, headers);
  }
});
