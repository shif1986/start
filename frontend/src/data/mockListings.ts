export type Listing = {
  id: string;
  title: string;
  category: string;
  department: string;
  city: string;
  coordinates: [number, number];
  price: number | null;
  description: string;
  professional: {
    name: string;
    role: string;
    phone: string;
    email: string;
  };
  featured?: boolean;
};

export const mockListings: Listing[] = [
  {
    id: "1",
    title: "Aide à la gestion administrative pour PME chrétienne",
    category: "Services",
    department: "Paris",
    city: "Paris",
    coordinates: [48.8566, 2.3522],
    price: 120,
    description:
      "Accompagnement administratif, comptabilité légère et organisation pour structures chrétiennes.",
    professional: {
      name: "Impact Conseil",
      role: "Cabinet de conseil",
      phone: "+33 1 84 00 00 01",
      email: "contact@impactconseil.fr",
    },
    featured: true,
  },
  {
    id: "2",
    title: "Cours de musique pour enfants et adolescents",
    category: "Éducation",
    department: "Rhône",
    city: "Lyon",
    coordinates: [45.764, 4.8357],
    price: 45,
    description:
      "Cours de piano, chant et musique avec approche douce et spirituelle pour les familles.",
    professional: {
      name: "Musique Lumière",
      role: "Professeur de musique",
      phone: "+33 4 72 00 00 02",
      email: "lyon@musiquelumiere.fr",
    },
    featured: true,
  },
  {
    id: "3",
    title: "Service de maintenance de maison pour familles chrétiennes",
    category: "Bricolage",
    department: "Gironde",
    city: "Bordeaux",
    coordinates: [44.8378, -0.5792],
    price: 80,
    description:
      "Petits travaux, dépannage et entretien ménager pour les familles et les lieux de rencontre.",
    professional: {
      name: "Maison de Grâce",
      role: "Entreprise de maintenance",
      phone: "+33 5 56 00 00 03",
      email: "contact@maisongrace.fr",
    },
  },
  {
    id: "4",
    title: "Conseil d’accompagnement spirituel et familial",
    category: "Santé",
    department: "Bouches-du-Rhône",
    city: "Marseille",
    coordinates: [43.2965, 5.3698],
    price: null,
    description:
      "Accompagnement pastoral et conseil familial sur demande, avec écoute et accompagnement humain.",
    professional: {
      name: "Médiation Vie",
      role: "Conseiller familial",
      phone: "+33 4 91 00 00 04",
      email: "contact@mediationvie.fr",
    },
  },
  {
    id: "5",
    title: "Traiteur pour événements chrétiens",
    category: "Événementiel",
    department: "Loire-Atlantique",
    city: "Nantes",
    coordinates: [47.2184, -1.5536],
    price: 350,
    description:
      "Traiteur pour réunions, conférences, mariages et événements associatifs avec menu 100% artisanal.",
    professional: {
      name: "Table du Royaume",
      role: "Traiteur",
      phone: "+33 2 40 00 00 05",
      email: "nantes@tableduroyaume.fr",
    },
  },
];
