import { z } from "zod";
import { priceUnits } from "./listing-creation-schema";

export const listingEditSchema = z.object({
  title: z.string().trim().min(5, "Le titre doit contenir au moins 5 caractères.").max(120),
  description: z.string().trim().min(20, "La description doit contenir au moins 20 caractères.").max(10_000),
  price: z.string().trim().refine((value) => value === "" || (Number.isFinite(Number(value.replace(",", "."))) && Number(value.replace(",", ".")) >= 0), "Le prix doit être un nombre positif."),
  priceUnit: z.enum(priceUnits),
  countryCode: z.enum(["FR", "CH"]),
  city: z.string().trim().min(2, "Indiquez une ville.").max(100),
  postalCode: z.string().trim().max(12),
  subdivisionName: z.string().trim().max(100),
});

export type ListingEditValues = z.infer<typeof listingEditSchema>;
