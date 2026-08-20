export type CategoryIcon =
  | "vehicle" | "building" | "work" | "briefcase" | "home"
  | "fashion" | "computer" | "culture" | "paw" | "tools"
  | "commerce" | "agriculture" | "industry" | "more";

export type Category = {
  id: string;
  slug: string;
  label: string;
  shortLabel?: string;
  description: string;
  icon: CategoryIcon;
  image?: string;
  subcategories: string[];
  professionalPriority?: boolean;
};

export const categories: Category[] = [
  { id: "vehicles", slug: "vehicules", label: "Véhicules", description: "Véhicules, équipements et solutions de mobilité pour particuliers et professionnels.", icon: "vehicle", image: "/images/categories/vehicules.webp", subcategories: ["Voitures", "Motos", "Utilitaires", "Camping-cars & caravanes", "Camions & poids lourds", "Bateaux", "Pièces & équipements"] },
  { id: "real-estate", slug: "immobilier", label: "Immobilier", description: "Biens, espaces professionnels et solutions de logement partout en France.", icon: "building", image: "/images/categories/immobilier.webp", subcategories: ["Vente", "Location", "Locations saisonnières", "Bureaux & commerces", "Terrains", "Parkings & garages", "Immobilier professionnel"] },
  { id: "jobs", slug: "emploi", label: "Emploi", description: "Offres d'emploi, missions et opportunités pour développer les talents du réseau.", icon: "work", image: "/images/categories/emploi.webp", subcategories: ["Offres d'emploi", "Missions", "Intérim", "Alternance", "Stages", "Freelance"] },
  { id: "services", slug: "services", label: "Services", description: "Des compétences fiables pour les besoins quotidiens et les projets professionnels.", icon: "briefcase", image: "/images/categories/professionnels.webp", subcategories: ["Artisans & travaux", "Dépannage", "Déménagement", "Transport & livraison", "Nettoyage", "Jardinage", "Informatique", "Événementiel", "Services aux entreprises"], professionalPriority: true },
  { id: "home-garden", slug: "maison-jardin", label: "Maison & Jardin", description: "Équipez, aménagez et entretenez votre cadre de vie.", icon: "home", image: "/images/categories/maison-jardin.webp", subcategories: ["Meubles", "Décoration", "Électroménager", "Bricolage", "Jardin & extérieur", "Matériaux", "Outillage"] },
  { id: "fashion-accessories", slug: "mode-accessoires", label: "Mode & Accessoires", description: "Vêtements, bijoux et accessoires pour tous les styles.", icon: "fashion", image: "/images/categories/mode-accessoires.webp", subcategories: ["Vêtements", "Chaussures", "Sacs", "Montres", "Bijoux", "Accessoires"] },
  { id: "multimedia", slug: "multimedia", label: "Multimédia", description: "Équipements numériques, audiovisuels et divertissement connecté.", icon: "computer", image: "/images/categories/informatique-electronique.webp", subcategories: ["Téléphones", "Ordinateurs", "Tablettes", "TV", "Audio", "Photo & vidéo", "Consoles & jeux vidéo"] },
  { id: "leisure", slug: "loisirs", label: "Loisirs", description: "Sports, culture, passions et activités pour tous les âges.", icon: "culture", image: "/images/categories/loisirs-culture.webp", subcategories: ["Sports", "Vélos", "Musique & instruments", "Livres", "Jeux & jouets", "Collection", "Loisirs créatifs"] },
  { id: "animals", slug: "animaux", label: "Animaux", description: "Accessoires, équipements et services autorisés pour les animaux.", icon: "paw", image: "/images/categories/famille-enfants.webp", subcategories: ["Accessoires", "Équipements", "Services pour animaux", "Autres annonces autorisées"] },
  { id: "professional-equipment", slug: "materiel-professionnel", label: "Matériel professionnel", shortLabel: "Matériel Pro", description: "Équipements spécialisés pour créer, équiper et développer une activité.", icon: "tools", image: "/images/categories/materiel-professionnel.webp", subcategories: ["BTP", "Matériel agricole", "Matériel industriel", "Machines & outils", "Restauration", "Matériel de magasin", "Matériel informatique professionnel", "Mobilier de bureau", "Stocks & lots professionnels"], professionalPriority: true },
  { id: "business", slug: "commerce-entreprise", label: "Commerce & Entreprise", shortLabel: "Commerce", description: "Opportunités, équipements et ressources pour entreprendre et transmettre.", icon: "commerce", image: "/images/categories/immobilier.webp", subcategories: ["Fonds de commerce", "Entreprises à vendre", "Locaux commerciaux", "Franchise", "Matériel commercial", "Stocks & déstockage", "Fournitures professionnelles"], professionalPriority: true },
  { id: "agriculture", slug: "agriculture", label: "Agriculture", description: "Matériel et fournitures pour les exploitations et activités agricoles.", icon: "agriculture", image: "/images/categories/maison-jardin.webp", subcategories: ["Matériel agricole", "Tracteurs", "Machines agricoles", "Équipements et fournitures agricoles"], professionalPriority: true },
  { id: "construction-industry", slug: "btp-industrie", label: "BTP & Industrie", description: "Machines, matériaux et équipements pour les chantiers et ateliers.", icon: "industry", image: "/images/categories/materiel-professionnel.webp", subcategories: ["Engins de chantier", "Machines industrielles", "Outillage professionnel", "Échafaudages", "Matériaux", "Équipements d'atelier", "Manutention & stockage"], professionalPriority: true },
  { id: "other-listings", slug: "autres-annonces", label: "Autres annonces", description: "Objets, lots, dons et annonces qui ne correspondent pas aux autres catégories.", icon: "more", image: "/images/categories/entraide.webp", subcategories: ["Objets divers", "Lots", "Déstockage", "Dons", "Autres"] },
];

function selectCategories(slugs: string[]) {
  return slugs.map((slug) => categories.find((category) => category.slug === slug)).filter((category): category is Category => Boolean(category));
}

export const navigationCategories = selectCategories(["vehicules", "immobilier", "emploi", "services", "maison-jardin", "multimedia", "loisirs", "materiel-professionnel", "commerce-entreprise"]);

export const homeCategories = selectCategories(["services", "materiel-professionnel", "commerce-entreprise", "btp-industrie", "agriculture", "vehicules"]);

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}
