import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import CookiePolicyPage from "./CookiePolicyPage";
import PrivacyPolicyPage from "./PrivacyPolicyPage";
import ReportContentPage from "./ReportContentPage";
import SubscriptionTermsPage from "./SubscriptionTermsPage";
import TermsOfUsePage from "./TermsOfUsePage";

const documentPages = [
  [PrivacyPolicyPage, "Politique de confidentialité"],
  [TermsOfUsePage, "Conditions générales d’utilisation"],
  [SubscriptionTermsPage, "Conditions de l’abonnement"],
  [CookiePolicyPage, "Politique relative aux cookies"],
] as const;

describe("Pages juridiques", () => {
  it.each(documentPages)("affiche la page %s", (Page, title) => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
  });

  it("propose un formulaire public de signalement", () => {
    render(<MemoryRouter><ReportContentPage /></MemoryRouter>);

    expect(screen.getByRole("heading", { level: 1, name: "Signaler un contenu" })).toBeInTheDocument();
    expect(screen.getByLabelText("URL du contenu")).toBeRequired();
    expect(screen.getByLabelText("Explication détaillée")).toBeRequired();
    expect(screen.getByRole("button", { name: "Envoyer le signalement" })).toBeEnabled();
  });
});
