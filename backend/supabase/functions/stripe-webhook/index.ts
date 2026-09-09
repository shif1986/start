import Stripe from "npm:stripe@22.0.0";
import { jsonResponse } from "../_shared/http.ts";
import { createStripeClient } from "../_shared/stripe.ts";
import { createAdminClient } from "../_shared/supabase.ts";

function iso(timestamp: number | null | undefined) {
  return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}

function subscriptionStatus(status: string) {
  if (["incomplete", "trialing", "active", "past_due", "canceled", "unpaid"].includes(status)) return status;
  if (status === "incomplete_expired") return "canceled";
  return "past_due";
}

function referenceId(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value && typeof value.id === "string") return value.id;
  return null;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return jsonResponse({ error: "Méthode non autorisée." }, 405);
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!signature || !webhookSecret) return jsonResponse({ error: "Signature manquante." }, 400);

  const stripe = createStripeClient();
  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret, undefined, Stripe.createSubtleCryptoProvider());
  } catch {
    return jsonResponse({ error: "Signature Stripe invalide." }, 400);
  }

  const admin = createAdminClient();
  const { data: knownEvent, error: eventReadError } = await admin.from("stripe_webhook_events").select("processed_at").eq("id", event.id).maybeSingle();
  if (eventReadError) return jsonResponse({ error: "Journal Stripe indisponible." }, 500);
  if (knownEvent?.processed_at) return jsonResponse({ received: true, duplicate: true });
  if (!knownEvent) {
    const { error } = await admin.from("stripe_webhook_events").insert({ id: event.id, event_type: event.type });
    if (error?.code !== "23505") {
      if (error) return jsonResponse({ error: "Journal Stripe indisponible." }, 500);
    }
  }

  async function syncSubscription(subscription: Stripe.Subscription) {
    if (subscription.metadata.kind !== "professional_subscription") return;
    const existing = await admin.from("subscriptions").select("plan_id,user_id").eq("provider_subscription_id", subscription.id).maybeSingle();
    if (existing.error) throw existing.error;
    const userId = subscription.metadata.user_id || existing.data?.user_id;
    const planId = subscription.metadata.plan_id || existing.data?.plan_id;
    if (!userId || !planId) throw new Error("Métadonnées d’abonnement Stripe incomplètes");
    const firstItem = subscription.items.data[0];
    const periodStart = (subscription as Stripe.Subscription & { current_period_start?: number }).current_period_start ?? firstItem?.current_period_start;
    const periodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end ?? firstItem?.current_period_end;
    const { error } = await admin.from("subscriptions").upsert({
      user_id: userId,
      plan_id: planId,
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
  }

  async function syncDonationSubscription(subscription: Stripe.Subscription, succeeded?: boolean) {
    if (subscription.metadata.kind !== "donation" || !subscription.metadata.donation_id) return;
    const status = subscription.status === "canceled" ? "canceled" : succeeded === false ? "failed" : "active";
    const { error } = await admin.from("donations").update({
      status,
      stripe_customer_id: referenceId(subscription.customer),
      stripe_subscription_id: subscription.id,
      completed_at: status === "active" ? new Date().toISOString() : null,
    }).eq("id", subscription.metadata.donation_id);
    if (error) throw error;
  }

  async function syncDonationInvoice(invoice: Stripe.Invoice & { subscription?: unknown; parent?: { subscription_details?: { subscription?: unknown } } }, succeeded: boolean) {
    const subscriptionId = referenceId(invoice.subscription) ?? referenceId(invoice.parent?.subscription_details?.subscription);
    if (!subscriptionId) return;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (subscription.metadata.kind !== "donation" || !subscription.metadata.donation_id) return;
    await syncDonationSubscription(subscription, succeeded);
    const { error } = await admin.from("donation_payments").upsert({
      donation_id: subscription.metadata.donation_id,
      provider_payment_id: invoice.id,
      amount_cents: succeeded ? invoice.amount_paid : invoice.amount_due,
      currency: invoice.currency.toUpperCase(),
      status: succeeded ? "succeeded" : "failed",
      receipt_url: invoice.hosted_invoice_url,
      paid_at: succeeded ? iso(invoice.status_transitions?.paid_at) : null,
    }, { onConflict: "provider_payment_id" });
    if (error) throw error;
  }

  try {
    if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscription(subscription);
      await syncDonationSubscription(subscription);
    } else if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.kind === "professional_subscription") {
        const subscriptionId = referenceId(session.subscription);
        if (!subscriptionId) throw new Error("Abonnement absent de la session Checkout");
        await syncSubscription(await stripe.subscriptions.retrieve(subscriptionId));
      } else if (session.metadata?.kind === "donation" && session.metadata.donation_id) {
        const donationId = session.metadata.donation_id;
        if (session.mode === "subscription") {
          const subscriptionId = referenceId(session.subscription);
          if (!subscriptionId) throw new Error("Don mensuel absent de la session Checkout");
          await syncDonationSubscription(await stripe.subscriptions.retrieve(subscriptionId));
        } else {
          const paymentIntentId = referenceId(session.payment_intent);
          let receiptUrl: string | null = null;
          if (paymentIntentId) {
            const intent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge"] });
            const charge = intent.latest_charge;
            if (charge && typeof charge === "object" && "receipt_url" in charge) receiptUrl = charge.receipt_url;
          }
          const { error: donationError } = await admin.from("donations").update({
            status: session.payment_status === "paid" ? "succeeded" : "pending",
            stripe_customer_id: referenceId(session.customer), stripe_payment_intent_id: paymentIntentId,
            completed_at: session.payment_status === "paid" ? new Date().toISOString() : null,
          }).eq("id", donationId);
          if (donationError) throw donationError;
          if (session.payment_status === "paid") {
            const { error: paymentError } = await admin.from("donation_payments").upsert({
              donation_id: donationId, provider_payment_id: paymentIntentId ?? session.id,
              amount_cents: session.amount_total ?? 0, currency: (session.currency ?? "eur").toUpperCase(),
              status: "succeeded", receipt_url: receiptUrl, paid_at: new Date().toISOString(),
            }, { onConflict: "provider_payment_id" });
            if (paymentError) throw paymentError;
          }
        }
      }
    } else if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: unknown; parent?: { subscription_details?: { subscription?: unknown } } };
      const subscriptionId = referenceId(invoice.subscription) ?? referenceId(invoice.parent?.subscription_details?.subscription);
      if (subscriptionId) await syncSubscription(await stripe.subscriptions.retrieve(subscriptionId));
      await syncDonationInvoice(invoice, event.type === "invoice.paid");
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.kind === "donation" && session.metadata.donation_id) {
        const { error } = await admin.from("donations").update({ status: "canceled" }).eq("id", session.metadata.donation_id).eq("status", "pending");
        if (error) throw error;
      }
    }
    await admin.from("stripe_webhook_events").update({ processed_at: new Date().toISOString(), last_error: null }).eq("id", event.id);
    return jsonResponse({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 1000) : "Erreur de synchronisation Stripe";
    await admin.from("stripe_webhook_events").update({ last_error: message }).eq("id", event.id);
    return jsonResponse({ error: "Synchronisation Stripe impossible." }, 500);
  }
});
