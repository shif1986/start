import { z } from "zod";

export const priceUnits = ["fixed", "hour", "day", "month", "quote"] as const;

export const listingCreationSchema = z.object({
  categoryId: z.string().min(1, "Choisissez une catégorie."),
  title: z.string().trim().min(5, "Le titre doit contenir au moins 5 caractères.").max(120),
  description: z.string().trim().min(20, "La description doit contenir au moins 20 caractères.").max(10_000),
  price: z.string().trim().refine((value) => value === "" || (Number.isFinite(Number(value.replace(",", "."))) && Number(value.replace(",", ".")) >= 0), "Le prix doit être un nombre positif."),
  priceUnit: z.enum(priceUnits),
  countryCode: z.enum(["FR", "CH"]),
  city: z.string().trim().min(2, "Indiquez une ville.").max(100),
  postalCode: z.string().trim().max(12),
  subdivisionCode: z.string().trim().max(10),
  subdivisionName: z.string().trim().max(100),
  phone: z.string().trim().min(5, "Indiquez un numéro de téléphone.").max(30),
  email: z.email("Indiquez une adresse e-mail valide.").max(160),
  postalAddress: z.string().trim().min(5, "Indiquez une adresse professionnelle.").max(300),
  dynamicValues: z.record(z.string(), z.unknown()),
});

export type ListingCreationValues = z.infer<typeof listingCreationSchema>;

export const listingCreationDefaults: ListingCreationValues = {
  categoryId: "",
  title: "",
  description: "",
  price: "",
  priceUnit: "fixed",
  countryCode: "FR",
  city: "",
  postalCode: "",
  subdivisionCode: "",
  subdivisionName: "",
  phone: "",
  email: "",
  postalAddress: "",
  dynamicValues: {},
};

export function parseListingPrice(value: string) {
  return value.trim() === "" ? null : Number(value.replace(",", "."));
}
