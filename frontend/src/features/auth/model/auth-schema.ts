import { z } from "zod";

export function createAuthSchema(isRegister: boolean) {
  return z.object({
    email: z.email("Adresse e-mail invalide."),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
    displayName: z.string(),
  }).superRefine((value, context) => {
    if (isRegister && value.displayName.trim().length < 2) {
      context.addIssue({
        code: "custom",
        path: ["displayName"],
        message: "Le nom doit contenir au moins 2 caractères.",
      });
    }
  });
}

export type AuthFormValues = z.infer<ReturnType<typeof createAuthSchema>>;
