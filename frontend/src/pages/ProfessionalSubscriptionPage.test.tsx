import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfessionalSubscriptionPage from "./ProfessionalSubscriptionPage";

const currentSubscription = vi.fn();

vi.mock("../features/subscriptions/hooks/use-current-subscription", () => ({
  useCurrentSubscription: () => currentSubscription(),
}));

describe("ProfessionalSubscriptionPage", () => {
  beforeEach(() => {
    currentSubscription.mockReturnValue({
      data: {
        id: "subscription-1",
        status: "trialing",
        currentPeriodEnd: "2099-09-03T11:08:58.000Z",
        cancelAtPeriodEnd: false,
        isStripeManaged: false,
        plan: { code: "pro_monthly", name: "Pro mensuel", interval: "monthly", priceCents: 700, currency: "EUR" },
      },
      isPending: false,
      isError: false,
    });
  });

  it("présente la formule personnelle et sa date de validité", () => {
    render(<MemoryRouter><ProfessionalSubscriptionPage /></MemoryRouter>);

    expect(screen.getByText("Abonnement actif")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pro mensuel" })).toBeInTheDocument();
    expect(screen.getByText(/3 septembre 2099/i)).toBeInTheDocument();
    expect(screen.getByText("Période de test actuellement active.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Gérer le paiement ou résilier" })).not.toBeInTheDocument();
    expect(screen.getByText(/abonnement d’essai est géré par START/i)).toBeInTheDocument();
  });

  it("propose le portail pour un abonnement Stripe", () => {
    currentSubscription.mockReturnValue({
      data: {
        id: "subscription-stripe",
        status: "active",
        currentPeriodEnd: "2099-09-03T11:08:58.000Z",
        cancelAtPeriodEnd: false,
        isStripeManaged: true,
        plan: { code: "pro_monthly", name: "Pro mensuel", interval: "monthly", priceCents: 700, currency: "EUR" },
      },
      isPending: false,
      isError: false,
    });

    render(<MemoryRouter><ProfessionalSubscriptionPage /></MemoryRouter>);
    expect(screen.getByRole("button", { name: "Gérer le paiement ou résilier" })).toBeInTheDocument();
  });
});
