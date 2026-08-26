import type { NavigationItem } from "./navigation.types";

export const primaryNavigationItems: NavigationItem[] = [
  { id: "home", to: "/", label: "Accueil", end: true },
  { id: "listings", to: "/annonces", label: "Annonce" },
  { id: "vision", to: "/a-propos", label: "Vision" },
  { id: "subscription", to: "/abonnement", label: "Abonnement" },
  { id: "contact", to: "/contact", label: "Contact" },
];

export const navigationActions = {
  donation: { id: "donation", to: "/don", label: "Don" },
  login: { id: "login", to: "/connexion", label: "Se connecter" },
  publish: { id: "publish", to: "/publier", label: "Publier une annonce" },
} satisfies Record<string, NavigationItem>;
