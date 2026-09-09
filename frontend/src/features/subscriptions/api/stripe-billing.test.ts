import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCustomerPortal, createSubscriptionCheckout } from "./stripe-billing";

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

  it("refuse une URL non sécurisée", async () => {
    invoke.mockResolvedValue({ data: { url: "http://example.test" }, error: null });
    await expect(createCustomerPortal()).rejects.toThrow("Adresse de paiement invalide");
  });
});
