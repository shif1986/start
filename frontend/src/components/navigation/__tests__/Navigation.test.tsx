import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Navigation from "../Navigation";
import { primaryNavigationItems } from "../navigation.config";

function renderNavigation(path = "/") {
  const appContent = document.createElement("div");
  appContent.dataset.appContent = "";
  document.body.append(appContent);

  const result = render(
    <MemoryRouter initialEntries={[path]}>
      <Navigation />
    </MemoryRouter>,
    { container: appContent },
  );

  return { ...result, user: userEvent.setup() };
}

describe("Navigation", () => {
  it("affiche le logo et les liens issus de la configuration unique", () => {
    renderNavigation();

    expect(screen.getAllByRole("img", { name: "START Réseau Chrétien" }).length).toBeGreaterThan(0);
    const mainNavigation = screen.getByRole("navigation", { name: "Navigation principale" });
    primaryNavigationItems.forEach((item) => {
      expect(within(mainNavigation).getByRole("link", { name: item.label })).toHaveAttribute("href", item.to);
    });
  });

  it("identifie clairement la route active", () => {
    renderNavigation("/annonces");

    const mainNavigation = screen.getByRole("navigation", { name: "Navigation principale" });
    expect(within(mainNavigation).getByRole("link", { name: "Annonce" })).toHaveAttribute("aria-current", "page");
  });

  it("affiche les actions prévues pour un utilisateur déconnecté", () => {
    renderNavigation();

    expect(screen.getAllByRole("link", { name: "Se connecter" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Publier une annonce" }).length).toBeGreaterThan(0);
  });

  it("ouvre et ferme le panneau avec les attributs ARIA attendus", async () => {
    const { user } = renderNavigation();
    const trigger = screen.getByRole("button", { name: "Ouvrir le menu" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: "Menu principal" })).toBeInTheDocument();

    const dialog = screen.getByRole("dialog", { name: "Menu principal" });
    await user.click(within(dialog).getByRole("button", { name: "Fermer le menu" }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("ferme le panneau depuis l’overlay", async () => {
    const { user } = renderNavigation();
    const trigger = screen.getByRole("button", { name: "Ouvrir le menu" });

    await user.click(trigger);
    await user.click(screen.getByTestId("navigation-overlay"));

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("ferme le panneau avec Escape", async () => {
    const { user } = renderNavigation();
    const trigger = screen.getByRole("button", { name: "Ouvrir le menu" });

    await user.click(trigger);
    await user.keyboard("{Escape}");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("déplace le focus dans le panneau puis le rend au déclencheur", async () => {
    const { user } = renderNavigation();
    const trigger = screen.getByRole("button", { name: "Ouvrir le menu" });

    trigger.focus();
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Menu principal" });
    const closeButton = within(dialog).getByRole("button", { name: "Fermer le menu" });
    await waitFor(() => expect(closeButton).toHaveFocus());

    await user.click(closeButton);
    expect(trigger).toHaveFocus();
  });

  it("maintient le focus dans le panneau avec Tab et Shift Tab", async () => {
    const { user } = renderNavigation();
    await user.click(screen.getByRole("button", { name: "Ouvrir le menu" }));
    const dialog = screen.getByRole("dialog", { name: "Menu principal" });
    const closeButton = within(dialog).getByRole("button", { name: "Fermer le menu" });
    const publishLink = within(dialog).getByRole("link", { name: "Publier une annonce" });
    const logoLink = within(dialog).getByRole("link", { name: "Retour à l’accueil" });

    await waitFor(() => expect(closeButton).toHaveFocus());
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(logoLink).toHaveFocus();

    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(publishLink).toHaveFocus();

    await user.keyboard("{Tab}");
    expect(logoLink).toHaveFocus();
  });

  it("verrouille puis restaure le scroll du document", async () => {
    Object.defineProperty(window, "scrollY", { configurable: true, value: 180 });
    vi.mocked(window.scrollTo).mockClear();
    const { user } = renderNavigation();

    await user.click(screen.getByRole("button", { name: "Ouvrir le menu" }));
    expect(document.body.style.position).toBe("fixed");
    expect(document.querySelector("[data-app-content]")).toHaveAttribute("inert");

    const dialog = screen.getByRole("dialog", { name: "Menu principal" });
    await user.click(within(dialog).getByRole("button", { name: "Fermer le menu" }));
    expect(document.body.style.position).toBe("");
    expect(document.querySelector("[data-app-content]")).not.toHaveAttribute("inert");
    expect(window.scrollTo).toHaveBeenCalledWith(0, 180);
  });

  it("referme le panneau lors d’une navigation", async () => {
    const { user } = renderNavigation();
    const trigger = screen.getByRole("button", { name: "Ouvrir le menu" });

    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Menu principal" });
    await user.click(within(dialog).getByRole("link", { name: "Contact" }));

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("ne présente aucune violation d’accessibilité sérieuse ou critique", async () => {
    const { user } = renderNavigation();
    await user.click(screen.getByRole("button", { name: "Ouvrir le menu" }));

    const results = await axe.run(document.body);
    const blockingViolations = results.violations.filter(
      (violation) => violation.impact === "critical" || violation.impact === "serious",
    );

    expect(blockingViolations).toEqual([]);
  });
});
