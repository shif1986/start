import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DeleteAccountSection from "./DeleteAccountSection";

describe("DeleteAccountSection", () => {
  it("demande une confirmation explicite avant de supprimer un compte particulier", async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(<DeleteAccountSection accountType="customer" onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: "Supprimer mon compte" }));
    const deleteButton = screen.getByRole("button", { name: "Supprimer définitivement" });
    expect(deleteButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Confirmation"), { target: { value: "supprimer" } });
    fireEvent.click(screen.getByRole("checkbox"));
    expect(deleteButton).toBeEnabled();

    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("avertit le professionnel de la résiliation de l’abonnement", () => {
    render(<DeleteAccountSection accountType="professional" onDelete={vi.fn()} />);
    expect(screen.getByText(/abonnement professionnel est actif/i)).toBeInTheDocument();
  });
});
