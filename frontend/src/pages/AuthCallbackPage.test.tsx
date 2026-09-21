import { StrictMode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthCallbackPage from "./AuthCallbackPage";

const mocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  getSession: vi.fn(),
  rpc: vi.fn(),
  signOut: vi.fn(),
  getCurrentProfile: vi.fn(),
}));

vi.mock("../lib/supabase/client", () => ({
  getSupabaseClient: () => ({
    auth: {
      exchangeCodeForSession: mocks.exchangeCodeForSession,
      getSession: mocks.getSession,
      signOut: mocks.signOut,
    },
    rpc: mocks.rpc,
  }),
}));

vi.mock("../features/profiles/api/get-current-profile", () => ({
  getCurrentProfile: mocks.getCurrentProfile,
}));

vi.mock("../features/auth/model/auth-destination", () => ({
  canAccessAdmin: () => false,
  resolveAuthDestination: (_accountType: string, requestedNext?: string) => requestedNext ?? "/espace/particulier",
}));

describe("callback d’authentification", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mocks.exchangeCodeForSession.mockReset().mockResolvedValue({ data: {}, error: null });
    mocks.getSession.mockReset().mockResolvedValue({
      data: { session: { user: { id: "user-id" } } },
      error: null,
    });
    mocks.rpc.mockReset().mockResolvedValue({ data: null, error: null });
    mocks.signOut.mockReset().mockResolvedValue({ error: null });
    mocks.getCurrentProfile.mockReset().mockResolvedValue({
      accountType: "customer",
      role: "user",
    });
  });

  it("n’échange le code PKCE qu’une fois sous React StrictMode", async () => {
    render(
      <StrictMode>
        <MemoryRouter initialEntries={["/auth/callback?code=recovery-strict-mode&next=%2Fauth%2Freinitialiser-mot-de-passe"]}>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/auth/reinitialiser-mot-de-passe" element={<div>Réinitialisation prête</div>} />
          </Routes>
        </MemoryRouter>
      </StrictMode>,
    );

    expect(await screen.findByText("Réinitialisation prête")).toBeInTheDocument();
    expect(mocks.exchangeCodeForSession).toHaveBeenCalledTimes(1);
    expect(mocks.exchangeCodeForSession).toHaveBeenCalledWith("recovery-strict-mode");
  });

  it("explique comment renouveler un lien PKCE ouvert dans un autre navigateur", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({
      data: {},
      error: {
        code: "pkce_code_verifier_not_found",
        message: "PKCE code verifier not found in storage",
      },
    });

    render(
      <MemoryRouter initialEntries={["/auth/callback?code=recovery-other-browser&next=%2Fauth%2Freinitialiser-mot-de-passe"]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("même navigateur et le même profil");
    expect(screen.getByRole("link", { name: "Demander un nouveau lien" })).toHaveAttribute("href", "/mot-de-passe-oublie");
  });
});
