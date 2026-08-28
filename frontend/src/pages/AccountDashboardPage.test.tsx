import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AccountDashboardPage from "./AccountDashboardPage";

vi.mock("../lib/data-source", () => ({ getDataSource: () => "static" }));
vi.mock("../features/profiles/hooks/use-current-profile", () => ({ useCurrentProfile: () => ({ data: null }) }));
vi.mock("../features/subscriptions/hooks/use-current-subscription", () => ({ useCurrentSubscription: () => ({ data: null }) }));

describe("AccountDashboardPage", () => {
  it("n'affiche aucune identité ou statistique personnelle fictive", () => {
    render(<MemoryRouter><AccountDashboardPage role="customer" /></MemoryRouter>);

    expect(screen.queryByText(/Marie/i)).not.toBeInTheDocument();
    expect(screen.queryByText("5")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Votre espace particulier" })).toBeInTheDocument();
  });
});
