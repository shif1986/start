import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AccountDashboardPage from "./AccountDashboardPage";

vi.mock("../lib/data-source", () => ({ getDataSource: () => "static" }));
vi.mock("../features/profiles/hooks/use-current-profile", () => ({ useCurrentProfile: () => ({ data: null }) }));
vi.mock("../features/subscriptions/hooks/use-current-subscription", () => ({ useCurrentSubscription: () => ({ data: null }) }));
vi.mock("../features/auth/context/use-auth", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("../features/favorites/hooks/use-favorite-listings", () => ({ useFavoriteListings: () => ({ data: [] }) }));
vi.mock("../features/contacts/hooks/use-professional-contact-count", () => ({ useProfessionalContactCount: () => ({ data: 0 }) }));
vi.mock("../features/reviews/hooks/use-reviews", () => ({ useUserReviews: () => ({ data: { items: [], totalCount: 0 } }) }));
vi.mock("../features/activity/hooks/use-account-activity", () => ({ useAccountActivity: () => ({ data: [] }) }));

describe("AccountDashboardPage", () => {
  it("n'affiche aucune identité ou statistique personnelle fictive", () => {
    render(<MemoryRouter><AccountDashboardPage role="customer" /></MemoryRouter>);

    expect(screen.queryByText(/Marie/i)).not.toBeInTheDocument();
    expect(screen.queryByText("5")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Votre espace particulier" })).toBeInTheDocument();
  });

  it("donne au professionnel accès à ses favoris et à ses avis", () => {
    render(<MemoryRouter><AccountDashboardPage role="professional" /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: "Votre espace professionnel" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mes favoris" })).toHaveAttribute("href", "/espace/professionnel/favoris");
    expect(screen.getByRole("link", { name: "Mes avis" })).toHaveAttribute("href", "/espace/professionnel/avis");
    expect(screen.getByText("Favoris")).toBeInTheDocument();
    expect(screen.getByText("Avis publiés")).toBeInTheDocument();
  });
});
