import { z } from "zod";

const supabaseEnvSchema = z.object({
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
}).refine((environment) => environment.VITE_SUPABASE_ANON_KEY || environment.VITE_SUPABASE_PUBLISHABLE_KEY);

export type SupabaseEnvironment = {
  url: string;
  anonKey: string;
};

function decodeJwtRole(key: string) {
  const payload = key.split(".")[1];
  if (!payload) return undefined;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized)) as { role?: unknown };
    return typeof decoded.role === "string" ? decoded.role : undefined;
  } catch {
    return undefined;
  }
}

export function parseSupabaseEnv(input: Record<string, unknown>): SupabaseEnvironment {
  const result = supabaseEnvSchema.safeParse(input);
  if (!result.success) {
    throw new Error("Configuration Supabase invalide. Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.");
  }

  const publicKey = result.data.VITE_SUPABASE_ANON_KEY ?? result.data.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!publicKey) {
    throw new Error("Configuration Supabase invalide. Vérifiez la clé publique Supabase.");
  }

  if (publicKey.startsWith("sb_secret_") || decodeJwtRole(publicKey) === "service_role") {
    throw new Error("Une clé service_role ne doit jamais être exposée dans le frontend.");
  }

  return {
    url: result.data.VITE_SUPABASE_URL,
    anonKey: publicKey,
  };
}

export function getSupabaseEnv() {
  return parseSupabaseEnv(import.meta.env);
}
