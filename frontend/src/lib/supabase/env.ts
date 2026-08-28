import { z } from "zod";

const supabaseEnvSchema = z.object({
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
});

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

  if (result.data.VITE_SUPABASE_ANON_KEY.startsWith("sb_secret_") || decodeJwtRole(result.data.VITE_SUPABASE_ANON_KEY) === "service_role") {
    throw new Error("Une clé service_role ne doit jamais être exposée dans le frontend.");
  }

  return {
    url: result.data.VITE_SUPABASE_URL,
    anonKey: result.data.VITE_SUPABASE_ANON_KEY,
  };
}

export function getSupabaseEnv() {
  return parseSupabaseEnv(import.meta.env);
}
