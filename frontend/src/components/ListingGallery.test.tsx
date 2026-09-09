import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ListingGallery from "./ListingGallery";

const images = [{ src: "/one.webp", altText: "Première photo" }, { src: "/two.webp", altText: "Deuxième photo" }];

describe("ListingGallery", () => {
  it("navigue avec les boutons et le clavier", async () => {
    const user = userEvent.setup();
    render(<ListingGallery images={images} />);
    expect(screen.getByRole("img", { name: "Première photo" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Photo suivante" }));
    expect(screen.getByRole("img", { name: "Deuxième photo" })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("region", { name: "Galerie de l’annonce" }).firstElementChild!, { key: "ArrowLeft" });
    expect(screen.getByRole("img", { name: "Première photo" })).toBeInTheDocument();
  });

  it("n’affiche aucun contrôle inutile pour une image", () => {
    render(<ListingGallery images={[images[0]]} />);
    expect(screen.queryByRole("button", { name: "Photo suivante" })).not.toBeInTheDocument();
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
  });
});
