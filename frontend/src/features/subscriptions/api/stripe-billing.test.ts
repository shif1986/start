import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCustomerPortal, createSubscriptionCheckout, resetUnmatchedStripeSubscription } from "./stripe-billing";

const invoke = vi.hoisted(() => vi.fn());
vi.mock("../../../lib/supabase/client", () => ({ getSupabaseClient: () => ({ functions: { invoke } }) }));

describe("Stripe billing", () => {
  beforeEach(() => invoke.mockReset());

  it("envoie uniquement le code serveur du plan et un identifiant idempotent", async () => {
    invoke.mockResolvedValue({ data: { url: "https://checkout.stripe.test/session" }, error: null });
    await expect(createSubscriptionCheckout("pro_monthly")).resolves.toBe("https://checkout.stripe.test/session");
    expect(invoke).toHaveBeenCalledWith("create-subscription-checkout", { body: {
      planCode: "pro_monthly",
      requestId: expect.stringMatching(/^[0-9a-f-]{36}$/),
    } });
  });

  it("ouvre le portail de facturation", async () => {
    invoke.mockResolvedValue({ data: { url: "https://billing.stripe.test/session" }, error: null });
    await expect(createCustomerPortal()).resolves.toBe("https://billing.stripe.test/session");
    expect(invoke).toHaveBeenCalledWith("create-customer-portal", { body: {} });
  });

  it("réinitialise uniquement un abonnement Stripe introuvable", async () => {
    invoke.mockResolvedValue({ data: { reset: true }, error: null });

    await expect(resetUnmatchedStripeSubscription()).resolves.toBeUndefined();
    expect(invoke).toHaveBeenCalledWith("reset-unmatched-stripe-subscription", { body: {} });
  });

  it("refuse une URL non sécurisée", async () => {
    invoke.mockResolvedValue({ data: { url: "http://example.test" }, error: null });
    await expect(createCustomerPortal()).rejects.toThrow("Adresse de paiement invalide");
  });

  it("affiche le message métier retourné par une Edge Function", async () => {
    invoke.mockResolvedValue({
      data: null,
      error: {
        context: new Response(JSON.stringify({ error: "Aucun compte de facturation Stripe n’est encore associé." }), {
          status: 404,
          headers: { "content-type": "application/json" },
        }),
      },
    });

    await expect(createCustomerPortal()).rejects.toThrow("Aucun compte de facturation Stripe n’est encore associé.");
  });

  it("conserve un message neutre lorsque la réponse serveur est illisible", async () => {
    invoke.mockResolvedValue({ data: null, error: { message: "network failure" } });
    await expect(createCustomerPortal()).rejects.toThrow("Le service de paiement est momentanément indisponible.");
  });
});
