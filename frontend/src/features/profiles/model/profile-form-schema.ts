import { z } from "zod";

const optionalUrl = z.string().trim().max(500).refine(
  (value) => value === "" || /^https:\/\//i.test(value),
  "Utilisez une adresse HTTPS.",
);

const optionalEmail = z.string().trim().max(160).refine(
  (value) => value === "" || z.email().safeParse(value).success,
  "Adresse e-mail invalide.",
);

export const profileFormSchema = z.object({
  username: z.string().trim().min(3, "Au moins 3 caractères.").max(30).regex(/^[a-z0-9][a-z0-9_-]*$/, "Minuscules, chiffres, tirets et underscores uniquement."),
  displayName: z.string().trim().min(2, "Au moins 2 caractères.").max(80),
  avatarUrl: optionalUrl,
  bio: z.string().trim().max(1000),
  city: z.string().trim().max(100),
  phone: z.string().trim().max(30),
  publicEmail: optionalEmail,
  postalAddress: z.string().trim().max(300),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
