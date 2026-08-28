import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CategoriesPage from "./CategoriesPage";

const useCategoriesMock = vi.fn();

vi.mock("../lib/data-source", () => ({ getDataSource: () => "supabase" }));
vi.mock("../features/categories/hooks/use-categories", () => ({
  useCategories: () => useCategoriesMock(),
}));

function renderPage() {
  return render(<MemoryRouter><CategoriesPage /></MemoryRouter>);
}

describe("CategoriesPage avec Supabase", () => {
  beforeEach(() => {
    useCategoriesMock.mockReset();
  });

  it("affiche un état de chargement stable", () => {
    useCategoriesMock.mockReturnValue({ data: undefined, isPending: true, isError: false });
    renderPage();
    expect(screen.getByRole("status", { name: "Chargement des catégories" })).toBeInTheDocument();
  });

  it("affiche une erreur métier", () => {
    useCategoriesMock.mockReturnValue({ data: undefined, isPending: false, isError: true });
    renderPage();
    expect(screen.getByRole("alert")).toHaveTextContent("Impossible de charger les catégories");
  });

  it("affiche un état vide sans données factices", () => {
    useCategoriesMock.mockReturnValue({ data: [], isPending: false, isError: false });
    renderPage();
    expect(screen.getByText("Aucune catégorie disponible")).toBeInTheDocument();
  });

  it("affiche les catégories provenant de Supabase", () => {
    useCategoriesMock.mockReturnValue({
      data: [{ id: "db-id", slug: "services", label: "Services DB", description: "Description", icon: "briefcase", image: undefined, subcategories: [] }],
      isPending: false,
      isError: false,
    });
    renderPage();
    expect(screen.getByRole("heading", { name: "Services DB" })).toBeInTheDocument();
  });
});
