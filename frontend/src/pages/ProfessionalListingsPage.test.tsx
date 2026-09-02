import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfessionalListingsPage from "./ProfessionalListingsPage";

const listingMocks = vi.hoisted(() => ({ own: vi.fn() }));

vi.mock("../lib/data-source", () => ({ getDataSource: () => "supabase" }));
vi.mock("../features/listings/hooks/use-owner-listings", () => ({ useOwnerListings: listingMocks.own }));
vi.mock("../features/listings/components/SubmitListingButton", () => ({ default: () => <button type="button">Soumettre</button> }));

describe("ProfessionalListingsPage", () => {
  beforeEach(() => {
    listingMocks.own.mockReturnValue({
      data: [{
        id: "listing-1",
        title: "Service professionnel",
        slug: "service-professionnel",
        status: "draft",
        price: 120,
        priceUnit: "hour",
        currency: "EUR",
        city: "Paris",
        categoryName: "Services",
        coverImage: null,
        createdAt: "2026-08-28T12:00:00Z",
        updatedAt: "2026-08-28T12:00:00Z",
        publishedAt: null,
        rejectionReason: null,
      }],
      isPending: false,
      isError: false,
    });
  });

  it("affiche les annonces réelles et leur statut métier", () => {
    render(<MemoryRouter><ProfessionalListingsPage /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Mes annonces" })).toBeInTheDocument();
    expect(screen.getByText("Service professionnel")).toBeInTheDocument();
    expect(screen.getByText("Brouillon")).toBeInTheDocument();
  });

  it("propose une action claire lorsque la liste est vide", () => {
    listingMocks.own.mockReturnValue({ data: [], isPending: false, isError: false });
    render(<MemoryRouter><ProfessionalListingsPage /></MemoryRouter>);
    expect(screen.getByText("Vous n’avez encore créé aucune annonce.")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Créer une annonce" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Créer une annonce" })[0]).toHaveAttribute("href", "/publier");
  });
});
