import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDonationCheckout, getDonationStatus } from "./donation-billing";

const invoke = vi.hoisted(() => vi.fn());
vi.mock("../../../lib/supabase/client", () => ({ getSupabaseClient: () => ({ functions: { invoke } }) }));

describe("donation billing", () => {
  beforeEach(() => invoke.mockReset());

  it("transmet un montant en centimes et le consentement au serveur", async () => {
    invoke.mockResolvedValue({ data: { url: "https://checkout.stripe.test/donation" }, error: null });
    await createDonationCheckout({ amountCents: 2500, frequency: "once", firstName: "Ada", lastName: "Test", email: "ada@example.test", consent: true });
    expect(invoke).toHaveBeenCalledWith("create-donation-checkout", { body: expect.objectContaining({ amountCents: 2500, frequency: "once", consent: true, requestId: expect.any(String) }) });
  });

  it("ne confirme le don qu’avec le statut retourné par le serveur", async () => {
    invoke.mockResolvedValue({ data: { status: "succeeded", amountCents: 2500, currency: "EUR", frequency: "once" }, error: null });
    await expect(getDonationStatus("cs_test_valid")).resolves.toMatchObject({ status: "succeeded", amountCents: 2500 });
    expect(invoke).toHaveBeenCalledWith("get-donation-status", { body: { sessionId: "cs_test_valid" } });
  });

  it("remonte un échec de confirmation", async () => {
    invoke.mockResolvedValue({ data: null, error: { message: "failure" } });
    await expect(getDonationStatus("cs_test_invalid")).rejects.toThrow("Impossible de confirmer ce don");
  });
});
