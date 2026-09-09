import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthPage from "./AuthPage";

const authMocks = vi.hoisted(() => ({
  getDataSource: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  isGoogleAuthEnabled: vi.fn(),
}));

vi.mock("../lib/data-source", () => ({ getDataSource: authMocks.getDataSource }));
vi.mock("../features/auth/api/auth-actions", () => authMocks);

function renderAuth(path = "/connexion") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/connexion" element={<AuthPage mode="login" />} />
        <Route path="/inscription" element={<AuthPage mode="register" />} />
        <Route path="/auth/callback" element={<div>Finalisation du compte</div>} />
        <Route path="/espace/particulier" element={<div>Espace particulier</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AuthPage Supabase", () => {
  beforeEach(() => {
    authMocks.getDataSource.mockReturnValue("supabase");
    authMocks.signInWithEmail.mockReset().mockResolvedValue({ session: { user: { id: "user-id" } } });
    authMocks.signUpWithEmail.mockReset().mockResolvedValue({ session: null });
    authMocks.signInWithGoogle.mockReset().mockResolvedValue({});
    authMocks.isGoogleAuthEnabled.mockReset().mockResolvedValue(true);
  });

  it("valide les identifiants avant la requête", async () => {
    renderAuth();
    await userEvent.click(screen.getByRole("button", { name: "Se connecter" }));
    expect(await screen.findByText("Adresse e-mail invalide.")).toBeInTheDocument();
    expect(screen.getByText("Le mot de passe doit contenir au moins 8 caractères.")).toBeInTheDocument();
    expect(authMocks.signInWithEmail).not.toHaveBeenCalled();
  });

  it("connecte puis respecte la redirection sûre", async () => {
    renderAuth("/connexion?redirect=%2Fespace%2Fparticulier");
    await userEvent.type(screen.getByLabelText("Adresse e-mail"), "user@example.test");
    await userEvent.type(screen.getByLabelText("Mot de passe"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Se connecter" }));
    expect(await screen.findByText("Finalisation du compte")).toBeInTheDocument();
    expect(authMocks.signInWithEmail).toHaveBeenCalledWith({ email: "user@example.test", password: "password123" });
  });

  it("crée un compte professionnel et demande la confirmation e-mail", async () => {
    renderAuth("/inscription?type=professional");
    await userEvent.type(screen.getByLabelText("Nom complet"), "Impact Conseil");
    await userEvent.type(screen.getByLabelText("Adresse e-mail"), "pro@example.test");
    await userEvent.type(screen.getByLabelText("Mot de passe"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Créer mon compte et choisir mon abonnement" }));
    expect(authMocks.signUpWithEmail).toHaveBeenCalledWith(expect.objectContaining({ accountType: "professional", displayName: "Impact Conseil", redirectPath: "/abonnement" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Vérifiez votre adresse e-mail");
  });

  it("lance Google avec la redirection demandée", async () => {
    renderAuth("/connexion?redirect=%2Fannonces");
    const googleButton = screen.getByRole("button", { name: "Continuer avec Google" });
    await waitFor(() => expect(googleButton).toBeEnabled());
    await userEvent.click(googleButton);
    expect(authMocks.signInWithGoogle).toHaveBeenCalledWith("/annonces", "customer", false);
  });

  it("laisse le profil décider de l'espace après une connexion Google ordinaire", async () => {
    renderAuth();
    const googleButton = screen.getByRole("button", { name: "Continuer avec Google" });
    await waitFor(() => expect(googleButton).toBeEnabled());
    await userEvent.click(googleButton);
    expect(authMocks.signInWithGoogle).toHaveBeenCalledWith(undefined, "customer", false);
  });

  it("propose un accès administration sans contourner le contrôle du rôle", async () => {
    renderAuth("/connexion?admin=true&redirect=%2Fadmin");
    expect(screen.getByRole("heading", { name: "Connexion administration" })).toBeInTheDocument();
    expect(screen.getByText(/L’accès sera refusé automatiquement/)).toBeInTheDocument();

    const googleButton = screen.getByRole("button", { name: "Continuer avec Google" });
    await waitFor(() => expect(googleButton).toBeEnabled());
    await userEvent.click(googleButton);
    expect(authMocks.signInWithGoogle).toHaveBeenCalledWith("/admin", "customer", true);
  });

  it("lie clairement inscription et connexion en conservant la redirection", async () => {
    renderAuth("/inscription?redirect=%2Fannonces");

    const loginLinks = screen.getAllByRole("link", { name: "Se connecter" });
    expect(loginLinks[0]).toHaveAttribute("href", "/connexion?redirect=%2Fannonces");
    await userEvent.click(loginLinks[0]);

    expect(screen.getByRole("heading", { name: "Se connecter" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Créer un compte/ })[0]).toHaveAttribute("href", "/inscription?redirect=%2Fannonces");
  });

  it("ne simule jamais une connexion lorsque Supabase est désactivé", async () => {
    authMocks.getDataSource.mockReturnValue("static");
    renderAuth();
    await userEvent.type(screen.getByLabelText("Adresse e-mail"), "user@example.test");
    await userEvent.type(screen.getByLabelText("Mot de passe"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await screen.findByRole("status")).toHaveTextContent("connexion réelle est indisponible");
    expect(authMocks.signInWithEmail).not.toHaveBeenCalled();
    expect(screen.queryByText("Espace particulier")).not.toBeInTheDocument();
  });
});
