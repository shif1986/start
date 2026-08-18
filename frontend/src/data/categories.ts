export type CategoryIcon =
  | "briefcase" | "work" | "building" | "home" | "vehicle"
  | "tools" | "computer" | "fashion" | "family" | "culture"
  | "event" | "heart" | "church";

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: CategoryIcon;
  image?: string;
  subcategories: string[];
};

export const categories: Category[] = [
  { id: "professionals-services", slug: "professionnels-services", name: "Professionnels & Services", description: "Trouvez des compétences fiables pour vos projets professionnels et personnels.", icon: "briefcase", image: "/images/categories/professionnels.webp", subcategories: ["Artisans", "Bâtiment & rénovation", "Informatique & web", "Graphisme & communication", "Photographie & vidéo", "Comptabilité", "Juridique", "Conseil", "Transport & déménagement", "Entretien", "Services à la personne"] },
  { id: "jobs-missions", slug: "emploi-missions", name: "Emploi & Missions", description: "Offres d'emploi, missions et engagements au sein du réseau.", icon: "work", image: "/images/categories/emploi.webp", subcategories: ["CDI", "CDD", "Intérim", "Alternance", "Stage", "Freelance", "Missions ponctuelles", "Bénévolat"] },
  { id: "real-estate", slug: "immobilier", name: "Immobilier", description: "Biens, espaces professionnels et solutions de logement.", icon: "building", image: "/images/categories/immobilier.webp", subcategories: ["Vente", "Location", "Colocation", "Bureaux & commerces", "Terrains", "Locations temporaires"] },
  { id: "home-garden", slug: "maison-jardin", name: "Maison & Jardin", description: "Équipez, aménagez et entretenez votre cadre de vie.", icon: "home", image: "/images/categories/maison-jardin.webp", subcategories: ["Meubles", "Décoration", "Électroménager", "Bricolage", "Jardinage", "Matériaux"] },
  { id: "vehicles-mobility", slug: "vehicules-mobilite", name: "Véhicules & Mobilité", description: "Véhicules, équipements et solutions de déplacement.", icon: "vehicle", image: "/images/categories/vehicules.webp", subcategories: ["Voitures", "Motos", "Utilitaires", "Vélos", "Pièces & accessoires", "Covoiturage"] },
  { id: "professional-equipment", slug: "materiel-professionnel", name: "Matériel professionnel", description: "Équipements spécialisés pour développer votre activité.", icon: "tools", image: "/images/categories/materiel-professionnel.webp", subcategories: ["Équipements professionnels", "BTP", "Restauration", "Bureau", "Commerce", "Agriculture", "Matériel médical"] },
  { id: "computing-electronics", slug: "informatique-electronique", name: "Informatique & Électronique", description: "Matériel numérique, audiovisuel et accessoires.", icon: "computer", image: "/images/categories/informatique-electronique.webp", subcategories: ["Ordinateurs", "Téléphones", "Photo & vidéo", "Audio", "Accessoires", "Consoles"] },
  { id: "fashion-accessories", slug: "mode-accessoires", name: "Mode & Accessoires", description: "Vêtements et accessoires pour toute la famille.", icon: "fashion", image: "/images/categories/mode-accessoires.webp", subcategories: ["Vêtements", "Chaussures", "Sacs", "Bijoux", "Montres", "Vêtements enfants"] },
  { id: "family-children", slug: "famille-enfants", name: "Famille & Enfants", description: "Équipements et services pensés pour les familles.", icon: "family", image: "/images/categories/famille-enfants.webp", subcategories: ["Équipement bébé", "Mobilier enfant", "Garde d'enfants", "Services familiaux"] },
  { id: "leisure-culture", slug: "loisirs-culture", name: "Loisirs & Culture", description: "Partagez vos passions, créations et découvertes culturelles.", icon: "culture", image: "/images/categories/loisirs-culture.webp", subcategories: ["Livres", "Musique", "Instruments", "Sport", "Jeux", "Loisirs créatifs", "Collection"] },
  { id: "events", slug: "evenements", name: "Événements", description: "Rencontres, célébrations et rendez-vous du réseau.", icon: "event", image: "/images/categories/evenements.webp", subcategories: ["Conférences", "Rencontres professionnelles", "Concerts", "Mariages", "Événements associatifs", "Billetterie"] },
  { id: "associations-mutual-aid", slug: "associations-entraide", name: "Associations & Entraide", description: "Mobilisez les talents et les ressources au service des autres.", icon: "heart", image: "/images/categories/entraide.webp", subcategories: ["Associations", "Bénévolat", "Dons", "Recherche d'aide", "Entraide locale", "Projets solidaires"] },
  { id: "churches-communities", slug: "eglises-communautes", name: "Églises & Communautés", description: "Connectez les églises, ministères et initiatives chrétiennes.", icon: "church", image: "/images/categories/communaute.webp", subcategories: ["Églises locales", "Associations chrétiennes", "Groupes & réseaux", "Ministères", "Projets missionnaires", "Musiciens & louange", "Besoins matériels", "Recherche de bénévoles", "Événements communautaires"] },
];

const homeCategorySlugs = ["professionnels-services", "emploi-missions", "immobilier", "evenements", "associations-entraide", "eglises-communautes"];

export const homeCategories = homeCategorySlugs.map((slug) => categories.find((category) => category.slug === slug)!).filter(Boolean);

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}
