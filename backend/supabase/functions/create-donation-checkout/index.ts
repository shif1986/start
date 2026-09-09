import { corsHeaders, jsonResponse, requirePost } from "../_shared/http.ts";
import { appUrl, createStripeClient } from "../_shared/stripe.ts";
import { createAdminClient } from "../_shared/supabase.ts";

const requestIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (request) => {
  const headers = corsHeaders(request);
  const methodResponse = requirePost(request, headers);
  if (methodResponse) return methodResponse;
  try {
    const body = await request.json() as { requestId?: string; amountCents?: number; frequency?: string; firstName?: string; lastName?: string; email?: string; consent?: boolean };
    const firstName = body.firstName?.trim() ?? "";
    const lastName = body.lastName?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const valid = body.requestId && requestIdPattern.test(body.requestId)
      && Number.isInteger(body.amountCents) && (body.amountCents ?? 0) >= 100 && (body.amountCents ?? 0) <= 1_000_000
      && (body.frequency === "once" || body.frequency === "monthly")
      && firstName.length >= 1 && firstName.length <= 80 && lastName.length >= 1 && lastName.length <= 80
      && email.length <= 160 && emailPattern.test(email) && body.consent === true;
    if (!valid) return jsonResponse({ error: "Informations de don invalides." }, 400, headers);

    const admin = createAdminClient();
    const donationId = body.requestId!;
    const { error: insertError } = await admin.from("donations").insert({
      id: donationId, donor_first_name: firstName, donor_last_name: lastName,
      donor_email: email, frequency: body.frequency, amount_cents: body.amountCents!,
      currency: "EUR", status: "pending", consent_at: new Date().toISOString(),
    });
    if (insertError?.code !== "23505") {
      if (insertError) throw insertError;
    }

    const recurring = body.frequency === "monthly" ? { interval: "month" as const } : undefined;
    const stripe = createStripeClient();
    const siteUrl = appUrl();
    const metadata = { kind: "donation", donation_id: donationId, frequency: body.frequency };
    const session = await stripe.checkout.sessions.create({
      mode: body.frequency === "monthly" ? "subscription" : "payment",
      line_items: [{ quantity: 1, price_data: {
        currency: "eur", unit_amount: body.amountCents!, recurring,
        product_data: { name: body.frequency === "monthly" ? "Don mensuel à START" : "Don à START" },
      } }],
      customer_email: email,
      success_url: `${siteUrl}/don?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/don?checkout=cancelled`,
      metadata,
      payment_intent_data: body.frequency === "once" ? { metadata, receipt_email: email } : undefined,
      subscription_data: body.frequency === "monthly" ? { metadata } : undefined,
    }, { idempotencyKey: `donation-checkout-${donationId}` });
    if (!session.url) throw new Error("Stripe n’a retourné aucune URL de paiement");
    await admin.from("donations").update({ stripe_checkout_session_id: session.id }).eq("id", donationId);
    return jsonResponse({ url: session.url }, 200, headers);
  } catch {
    return jsonResponse({ error: "Impossible d’ouvrir le paiement du don." }, 500, headers);
  }
});
