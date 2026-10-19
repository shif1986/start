import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SubscriptionPage from "./SubscriptionPage";

const subscriptionMocks = vi.hoisted(() => ({
  plans: vi.fn(),
  current: vi.fn(),
  checkout: vi.fn(),
  auth: vi.fn(),
  profile: vi.fn(),
}));

vi.mock("../features/subscriptions/api/stripe-billing", () => ({ createSubscriptionCheckout: subscriptionMocks.checkout }));

vi.mock("../lib/data-source", () => ({ getDataSource: () => "supabase" }));
vi.mock("../components/StartNetworkCycle", () => ({ default: () => null }));
vi.mock("../features/subscriptions/hooks/use-subscription-plans", () => ({
  useSubscriptionPlans: subscriptionMocks.plans,
}));
vi.mock("../features/subscriptions/hooks/use-current-subscription", () => ({
  useCurrentSubscription: subscriptionMocks.current,
}));
vi.mock("../features/auth/context/use-auth", () => ({ useAuth: subscriptionMocks.auth }));
vi.mock("../features/profiles/hooks/use-current-profile", () => ({ useCurrentProfile: subscriptionMocks.profile }));

describe("SubscriptionPage", () => {
  beforeEach(() => {
    subscriptionMocks.checkout.mockReset();
    subscriptionMocks.auth.mockReturnValue({ user: { id: "professional-1" }, isLoading: false });
    subscriptionMocks.profile.mockReturnValue({ data: { accountType: "professional" }, isPending: false });
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

  it("affiche le catalogue réel et l'état du don de soutien", () => {
    render(<MemoryRouter><SubscriptionPage /></MemoryRouter>);

    expect(screen.getByText("Don de soutien actif")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Don mensuel.*7/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Don annuel.*84/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Don de soutien déjà actif" })).toBeDisabled();
  });

  it("affiche un état vide sans réintroduire des offres statiques", () => {
    subscriptionMocks.plans.mockReturnValue({ data: [], isPending: false, isError: false });
    subscriptionMocks.current.mockReturnValue({ data: null, isPending: false, isError: false });

    render(<MemoryRouter><SubscriptionPage /></MemoryRouter>);

    expect(screen.getByText("Aucune formule n’est disponible actuellement.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Don mensuel.*7/ })).not.toBeInTheDocument();
  });

  it("exige l’acceptation des conditions avant le paiement", async () => {
    subscriptionMocks.current.mockReturnValue({ data: null, isPending: false, isError: false });
    render(<MemoryRouter><SubscriptionPage /></MemoryRouter>);

    const checkoutButton = screen.getByRole("button", { name: "Soutenir START" });
    expect(checkoutButton).toBeEnabled();
    await userEvent.click(checkoutButton);
    expect(subscriptionMocks.checkout).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Veuillez accepter les conditions");
    const terms = screen.getByRole("checkbox", { name: /J’accepte les conditions du don de soutien/ });
    expect(terms).toHaveFocus();
    await userEvent.click(terms);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    subscriptionMocks.checkout.mockRejectedValue(new Error("Paiement indisponible"));
    await userEvent.click(checkoutButton);
    expect(subscriptionMocks.checkout).toHaveBeenCalledWith("pro_monthly");
    expect(await screen.findByRole("alert")).toHaveTextContent("Paiement indisponible");
    expect(checkoutButton).toBeEnabled();
  });

  it("présente les offres aux visiteurs et demande un compte seulement au moment de souscrire", () => {
    subscriptionMocks.auth.mockReturnValue({ user: null, isLoading: false });
    subscriptionMocks.profile.mockReturnValue({ data: undefined, isPending: false });
    subscriptionMocks.current.mockReturnValue({ data: undefined, isPending: false, isError: false });

    render(<MemoryRouter><SubscriptionPage /></MemoryRouter>);

    expect(screen.getByRole("button", { name: /Don mensuel.*7/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Créer mon compte professionnel" })).toHaveAttribute("href", "/inscription?type=professional&redirect=/abonnement");
    expect(screen.getByRole("link", { name: "J’ai déjà un compte professionnel" })).toHaveAttribute("href", "/connexion?redirect=/abonnement");
    expect(screen.queryByRole("button", { name: "Soutenir START" })).not.toBeInTheDocument();
  });
});
