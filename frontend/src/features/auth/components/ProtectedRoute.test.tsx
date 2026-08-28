import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

const useAuthMock = vi.fn();
const useCurrentProfileMock = vi.fn();

vi.mock("../../../lib/data-source", () => ({ getDataSource: () => "supabase" }));
vi.mock("../context/use-auth", () => ({ useAuth: () => useAuthMock() }));
vi.mock("../../profiles/hooks/use-current-profile", () => ({ useCurrentProfile: () => useCurrentProfileMock() }));

function renderRoute(element: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/connexion" element={<div>Connexion</div>} />
        <Route path="/" element={<div>Accueil</div>} />
        <Route path="/admin" element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    useCurrentProfileMock.mockReset();
  });

  it("attend la restauration de session", () => {
    useAuthMock.mockReturnValue({ session: null, isLoading: true });
    useCurrentProfileMock.mockReturnValue({ data: undefined, isPending: false });
    renderRoute(<ProtectedRoute><div>Privé</div></ProtectedRoute>);
    expect(screen.getByRole("status")).toHaveTextContent("Vérification de votre session");
  });

  it("redirige un visiteur vers la connexion", () => {
    useAuthMock.mockReturnValue({ session: null, isLoading: false });
    useCurrentProfileMock.mockReturnValue({ data: undefined, isPending: false });
    renderRoute(<ProtectedRoute><div>Privé</div></ProtectedRoute>);
    expect(screen.getByText("Connexion")).toBeInTheDocument();
  });

  it("refuse un rôle insuffisant", () => {
    useAuthMock.mockReturnValue({ session: { user: { id: "user-id" } }, isLoading: false });
    useCurrentProfileMock.mockReturnValue({ data: { role: "user", accountType: "customer" }, isPending: false });
    renderRoute(<ProtectedRoute roles={["admin", "moderator"]}><div>Administration</div></ProtectedRoute>);
    expect(screen.getByText("Accueil")).toBeInTheDocument();
  });

  it("autorise un administrateur", () => {
    useAuthMock.mockReturnValue({ session: { user: { id: "admin-id" } }, isLoading: false });
    useCurrentProfileMock.mockReturnValue({ data: { role: "admin", accountType: "professional" }, isPending: false });
    renderRoute(<ProtectedRoute roles={["admin", "moderator"]}><div>Administration</div></ProtectedRoute>);
    expect(screen.getByText("Administration")).toBeInTheDocument();
  });
});
