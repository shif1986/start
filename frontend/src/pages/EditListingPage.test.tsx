import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EditListingPage from "./EditListingPage";

const listingMocks = vi.hoisted(() => ({
  get: vi.fn(),
  update: vi.fn(),
}));

vi.mock("../features/auth/context/use-auth", () => ({ useAuth: () => ({ user: { id: "owner-id" } }) }));
vi.mock("../features/listings/api/get-listing-for-edit", () => ({ getListingForEdit: listingMocks.get }));
vi.mock("../features/listings/api/update-listing", () => ({ updateListing: listingMocks.update }));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}><MemoryRouter initialEntries={["/espace/professionnel/annonces/listing-id/modifier"]}><Routes><Route path="/espace/professionnel/annonces/:listingId/modifier" element={<EditListingPage />} /><Route path="/espace/professionnel/annonces" element={<div>Mes annonces</div>} /></Routes></MemoryRouter></QueryClientProvider>);
}

describe("EditListingPage", () => {
  beforeEach(() => {
    listingMocks.get.mockReset().mockResolvedValue({ id: "listing-id", slug: "annonce-test", status: "published", title: "Annonce publiée", description: "Une description suffisamment longue pour être modifiée.", price: "100", priceUnit: "fixed", countryCode: "FR", city: "Nice", postalCode: "06000", subdivisionName: "Alpes-Maritimes" });
    listingMocks.update.mockReset().mockResolvedValue({ id: "listing-id", slug: "annonce-test" });
  });

  it("permet au propriétaire de modifier une annonce publiée", async () => {
    const user = userEvent.setup();
    renderPage();
    const title = await screen.findByLabelText("Titre");
    await user.clear(title);
    await user.type(title, "Annonce publiée corrigée");
    await user.click(screen.getByRole("button", { name: "Enregistrer les modifications" }));

    expect(listingMocks.update).toHaveBeenCalledWith("listing-id", "owner-id", expect.objectContaining({ title: "Annonce publiée corrigée" }));
    expect(await screen.findByText("Mes annonces")).toBeInTheDocument();
  });
});
