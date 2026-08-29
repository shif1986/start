import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import LegalNoticePage from "./LegalNoticePage";

describe("LegalNoticePage", () => {
  it("affiche l’identité de l’association et son hébergeur", () => {
    render(
      <MemoryRouter>
        <LegalNoticePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Mentions légales" })).toBeInTheDocument();
    expect(screen.getByText("W842013429")).toBeInTheDocument();
    expect(screen.getByText(/103 rue du Creuset/i)).toBeInTheDocument();
    expect(screen.getByText(/Directeur de la publication : Shifnas SALEEM/i)).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent?.includes("Netlify, Inc.") === true)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Formulaire de contact" })).toHaveAttribute("href", "/contact");
  });
});
