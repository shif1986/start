import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ListingCreationForm from "./ListingCreationForm";
import { LISTING_DRAFT_KEY } from "../model/listing-draft";

const createListing = vi.fn().mockResolvedValue({ id: "listing-id", slug: "annonce-test" });

vi.mock("../../auth/context/use-auth", () => ({ useAuth: () => ({ user: { id: "user-id", email: "pro@example.test" } }) }));
vi.mock("../../categories/hooks/use-categories", () => ({ useCategories: () => ({ data: [{ id: "category-id", label: "Services" }], isPending: false, isError: false }) }));
vi.mock("../../categories/hooks/use-category-fields", () => ({ useCategoryFields: () => ({ data: [], isPending: false, isError: false }) }));
vi.mock("../api/create-listing", () => ({ createListing: (...args: unknown[]) => createListing(...args) }));

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}><MemoryRouter><ListingCreationForm /></MemoryRouter></QueryClientProvider>);
}

describe("ListingCreationForm", () => {
  beforeEach(() => {
    localStorage.clear();
    createListing.mockClear();
  });

  it("guide le professionnel jusqu’à la prévisualisation puis soumet l’annonce", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.selectOptions(screen.getByLabelText("Catégorie"), "category-id");
    await user.click(screen.getByRole("button", { name: "Continuer" }));
    await user.type(screen.getByLabelText("Titre"), "Conseil aux entrepreneurs");
    await user.type(screen.getByLabelText("Description"), "Une description suffisamment complète pour être acceptée.");
    await user.click(screen.getByRole("button", { name: "Continuer" }));
    await user.type(screen.getByLabelText("Ville"), "Paris");
    await user.type(screen.getByLabelText("Téléphone"), "0600000000");
    await user.type(screen.getByLabelText("Adresse exacte"), "10 rue de la Paix, Paris");
    await user.click(screen.getByRole("button", { name: "Continuer" }));
    await user.click(screen.getByRole("button", { name: "Continuer" }));

    expect(screen.getByRole("heading", { name: "Vérifiez avant la publication" })).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Publier l’annonce" }));

    expect(createListing).toHaveBeenCalledWith(expect.objectContaining({ ownerId: "user-id", categoryId: "category-id" }));
    expect(localStorage.getItem(LISTING_DRAFT_KEY)).toBeNull();
  });

  it("bloque la progression quand la catégorie manque", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: "Continuer" }));
    expect(await screen.findByText("Choisissez une catégorie.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Choisissez la catégorie" })).toBeInTheDocument();
  });
});
