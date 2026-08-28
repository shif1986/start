import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SubscriptionPage from "./SubscriptionPage";

const subscriptionMocks = vi.hoisted(() => ({
  plans: vi.fn(),
  current: vi.fn(),
}));

vi.mock("../lib/data-source", () => ({ getDataSource: () => "supabase" }));
vi.mock("../components/StartNetworkCycle", () => ({ default: () => null }));
vi.mock("../features/subscriptions/hooks/use-subscription-plans", () => ({
  useSubscriptionPlans: subscriptionMocks.plans,
}));
vi.mock("../features/subscriptions/hooks/use-current-subscription", () => ({
  useCurrentSubscription: subscriptionMocks.current,
}));

describe("SubscriptionPage", () => {
  beforeEach(() => {
    subscriptionMocks.plans.mockReturnValue({
      data: [
        { id: "monthly", code: "pro_monthly", name: "Pro mensuel", interval: "monthly", priceCents: 700, currency: "EUR" },
        { id: "yearly", code: "pro_yearly", name: "Pro annuel", interval: "yearly", priceCents: 8400, currency: "EUR" },
      ],
      isPending: false,
      isError: false,
    });
    subscriptionMocks.current.mockReturnValue({
      data: {
        id: "subscription-1",
        status: "active",
        currentPeriodEnd: "2026-09-28T00:00:00Z",
        cancelAtPeriodEnd: false,
        plan: { code: "pro_monthly", name: "Pro mensuel", interval: "monthly", priceCents: 700, currency: "EUR" },
      },
      isPending: false,
      isError: false,
    });
  });

  it("affiche le catalogue réel et l'état de l'abonnement", () => {
    render(<MemoryRouter><SubscriptionPage /></MemoryRouter>);

    expect(screen.getByText("Abonnement actif")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mensuel.*7/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Annuel.*84/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abonnement déjà actif" })).toBeDisabled();
  });

  it("affiche un état vide sans réintroduire des offres statiques", () => {
    subscriptionMocks.plans.mockReturnValue({ data: [], isPending: false, isError: false });
    subscriptionMocks.current.mockReturnValue({ data: null, isPending: false, isError: false });

    render(<MemoryRouter><SubscriptionPage /></MemoryRouter>);

    expect(screen.getByText("Aucune formule n’est disponible actuellement.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Mensuel.*7/ })).not.toBeInTheDocument();
  });
});
