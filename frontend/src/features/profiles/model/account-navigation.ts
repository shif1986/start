export const professionalAccountNavigation = [
  { label: "Tableau de bord", to: "/espace/professionnel" },
  { label: "Mes annonces", to: "/espace/professionnel/annonces" },
  { label: "Mon profil", to: "/espace/professionnel" },
  { label: "Abonnement", to: "/espace/professionnel/abonnement" },
] as const;

export const customerAccountNavigation = [
  { label: "Vue d’ensemble", to: "/espace/particulier" },
  { label: "Mes favoris", to: "/espace/particulier/favoris" },
  { label: "Mes avis", to: "/espace/particulier/avis" },
] as const;
