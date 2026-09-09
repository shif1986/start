import { corsHeaders, jsonResponse, requirePost } from "../_shared/http.ts";
import { createStripeClient } from "../_shared/stripe.ts";
import { createAdminClient } from "../_shared/supabase.ts";

Deno.serve(async (request) => {
  const headers = corsHeaders(request);
  const methodResponse = requirePost(request, headers);
  if (methodResponse) return methodResponse;
  try {
    const { sessionId } = await request.json() as { sessionId?: string };
    if (!sessionId || !/^cs_(test_|live_)?[A-Za-z0-9_]+$/.test(sessionId)) return jsonResponse({ error: "Session invalide." }, 400, headers);
    const session = await createStripeClient().checkout.sessions.retrieve(sessionId);
    const donationId = session.metadata?.kind === "donation" ? session.metadata.donation_id : null;
    if (!donationId) return jsonResponse({ error: "Don introuvable." }, 404, headers);
    const { data, error } = await createAdminClient().from("donations").select("status,amount_cents,currency,frequency").eq("id", donationId).eq("stripe_checkout_session_id", session.id).single();
    if (error) return jsonResponse({ error: "Don introuvable." }, 404, headers);
    return jsonResponse({ status: data.status, amountCents: data.amount_cents, currency: data.currency, frequency: data.frequency }, 200, headers);
  } catch {
    return jsonResponse({ error: "Impossible de confirmer ce don." }, 500, headers);
  }
});
