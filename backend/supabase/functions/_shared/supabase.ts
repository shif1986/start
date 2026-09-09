import { createClient } from "npm:@supabase/supabase-js@2.112.4";

function firstKey(raw: string | undefined) {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return Object.values(parsed).find(Boolean);
  } catch {
    return undefined;
  }
}

function required(name: string, value: string | undefined) {
  if (!value) throw new Error(`Configuration serveur manquante : ${name}`);
  return value;
}

export function createAdminClient() {
  const url = required("SUPABASE_URL", Deno.env.get("SUPABASE_URL"));
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    ?? Deno.env.get("SUPABASE_SECRET_KEY")
    ?? firstKey(Deno.env.get("SUPABASE_SECRET_KEYS"));
  return createClient(url, required("clé secrète Supabase", secret), { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function getAuthenticatedUser(request: Request) {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) throw new Error("Authentification requise");
  const url = required("SUPABASE_URL", Deno.env.get("SUPABASE_URL"));
  const publishable = Deno.env.get("SUPABASE_ANON_KEY")
    ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")
    ?? firstKey(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS"));
  const client = createClient(url, required("clé publique Supabase", publishable), {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new Error("Authentification requise");
  return user;
}
