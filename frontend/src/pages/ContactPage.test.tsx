import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ContactPage from "./ContactPage";

describe("ContactPage", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

  it("affiche tous les champs attendus", () => {
    render(<ContactPage />);
    expect(screen.getByLabelText(/nom complet/i)).toBeRequired();
    expect(screen.getByLabelText(/adresse e-mail/i)).toBeRequired();
    expect(screen.getByLabelText(/téléphone/i)).not.toBeRequired();
    expect(screen.getByLabelText(/votre message/i)).toBeRequired();
  });

  it("envoie les informations et confirme le succès", async () => {
    vi.stubEnv("VITE_CONTACT_ENDPOINT", "https://example.test/contact");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));
    const user = userEvent.setup();
    render(<ContactPage />);
    await user.type(screen.getByLabelText(/nom complet/i), "Marie Martin");
    await user.type(screen.getByLabelText(/adresse e-mail/i), "marie@example.fr");
    await user.type(screen.getByLabelText(/téléphone/i), "0612345678");
    await user.type(screen.getByLabelText(/votre message/i), "Bonjour, je souhaite rejoindre le réseau.");
    await user.click(screen.getByRole("button", { name: /envoyer le message/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith("https://example.test/contact", expect.objectContaining({ method: "POST" }));
    expect(await screen.findByRole("status")).toHaveTextContent(/bien été envoyé/i);
  });

  it("utilise l’adresse START si aucun endpoint personnalisé n’est configuré", async () => {
    vi.stubEnv("VITE_CONTACT_ENDPOINT", "");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));
    render(<ContactPage />);
    const form = screen.getByRole("button", { name: /envoyer le message/i }).closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith(
      "https://formsubmit.co/ajax/contact@startreseauchretien.com",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
