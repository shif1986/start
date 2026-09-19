import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ForgotPasswordPage from "./ForgotPasswordPage";
import ResetPasswordPage from "./ResetPasswordPage";

const mocks = vi.hoisted(() => ({
  getDataSource: vi.fn(),
  requestPasswordReset: vi.fn(),
  updatePassword: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock("../lib/data-source", () => ({ getDataSource: mocks.getDataSource }));
vi.mock("../features/auth/api/auth-actions", () => ({ requestPasswordReset: mocks.requestPasswordReset, updatePassword: mocks.updatePassword }));
vi.mock("../features/auth/context/use-auth", () => ({ useAuth: mocks.useAuth }));

describe("récupération du mot de passe", () => {
  beforeEach(() => {
    mocks.getDataSource.mockReturnValue("supabase");
    mocks.requestPasswordReset.mockReset().mockResolvedValue({});
    mocks.updatePassword.mockReset().mockResolvedValue({});
    mocks.useAuth.mockReset().mockReturnValue({ session: { user: { id: "user-id" } }, isLoading: false });
  });

  it("envoie une demande sans révéler si le compte existe", async () => {
    render(<MemoryRouter><ForgotPasswordPage /></MemoryRouter>);
    await userEvent.type(screen.getByLabelText("Adresse e-mail"), "user@example.test");
    await userEvent.click(screen.getByRole("button", { name: "Envoyer le lien" }));
    expect(mocks.requestPasswordReset).toHaveBeenCalledWith("user@example.test");
    expect(await screen.findByRole("status")).toHaveTextContent("Si un compte correspond");
  });

  it("refuse deux mots de passe différents", async () => {
    render(<MemoryRouter><ResetPasswordPage /></MemoryRouter>);
    await userEvent.type(screen.getByLabelText("Nouveau mot de passe"), "nouveau-secret");
    await userEvent.type(screen.getByLabelText("Confirmer le mot de passe"), "autre-secret");
    await userEvent.click(screen.getByRole("button", { name: "Enregistrer le nouveau mot de passe" }));
    expect(await screen.findByRole("status")).toHaveTextContent("ne correspondent pas");
    expect(mocks.updatePassword).not.toHaveBeenCalled();
  });

  it("met à jour le mot de passe puis finalise la session", async () => {
    render(<MemoryRouter initialEntries={["/auth/reinitialiser-mot-de-passe"]}><Routes><Route path="/auth/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} /><Route path="/auth/callback" element={<div>Finalisation</div>} /></Routes></MemoryRouter>);
    await userEvent.type(screen.getByLabelText("Nouveau mot de passe"), "nouveau-secret");
    await userEvent.type(screen.getByLabelText("Confirmer le mot de passe"), "nouveau-secret");
    await userEvent.click(screen.getByRole("button", { name: "Enregistrer le nouveau mot de passe" }));
    expect(mocks.updatePassword).toHaveBeenCalledWith("nouveau-secret");
    expect(await screen.findByText("Finalisation")).toBeInTheDocument();
  });

  it("refuse un lien sans session de récupération", () => {
    mocks.useAuth.mockReturnValue({ session: null, isLoading: false });
    render(<MemoryRouter><ResetPasswordPage /></MemoryRouter>);
    expect(screen.getByRole("alert")).toHaveTextContent("invalide ou a expiré");
    expect(screen.getByRole("link", { name: "Demander un nouveau lien" })).toHaveAttribute("href", "/mot-de-passe-oublie");
  });
});
