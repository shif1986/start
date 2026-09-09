import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminDashboardPage from "./AdminDashboardPage";

const mocks = vi.hoisted(() => ({ dashboard: vi.fn() }));

vi.mock("../lib/data-source", () => ({ getDataSource: () => "supabase" }));
vi.mock("../features/admin/hooks/use-admin-dashboard", () => ({
  useAdminDashboard: () => mocks.dashboard(),
  adminDashboardKey: ["admin", "dashboard"],
}));
vi.mock("../features/admin/components/PendingListingCard", () => ({
  default: ({ listing }: { listing: { title: string } }) => <article>{listing.title}</article>,
}));

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    mocks.dashboard.mockReturnValue({
      data: {
        unverifiedProfiles: 3,
        activeListings: 12,
        openReports: 2,
        pendingListings: [{ id: "listing-1", title: "Annonce à contrôler" }],
        reviews: [],
      },
      isPending: false,
      isError: false,
    });
  });

  it("affiche les indicateurs réels et la file de modération", () => {
    render(<MemoryRouter><AdminDashboardPage /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: "Centre de modération" })).toBeInTheDocument();
    expect(screen.getByText("Annonce à contrôler")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getAllByText(/profils non vérifiés/i)).not.toHaveLength(0);
    expect(screen.getAllByText(/signalements ouverts/i)).not.toHaveLength(0);
  });
});
