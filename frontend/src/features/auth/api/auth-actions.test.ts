import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { signInWithEmail, signInWithGoogle, signOut, signUpWithEmail } from "./auth-actions";

function createClient() {
  return {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: { session: {} }, error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: { url: "https://accounts.google.test" }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  } as unknown as SupabaseClient<Database>;
}

describe("auth actions", () => {
  it("connecte avec e-mail sans stocker de session parallèle", async () => {
    const client = createClient();
    await signInWithEmail({ email: "user@example.test", password: "password123" }, client);
    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({ email: "user@example.test", password: "password123" });
  });

  it("inscrit le type de compte dans les métadonnées contrôlées", async () => {
    const client = createClient();
    await signUpWithEmail({ email: "pro@example.test", password: "password123", displayName: "Impact Conseil", accountType: "professional" }, client);
    expect(client.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({
      email: "pro@example.test",
      options: { data: { display_name: "Impact Conseil", account_type: "professional" } },
    }));
  });

  it("utilise une redirection OAuth locale sûre", async () => {
    const client = createClient();
    await signInWithGoogle("/annonces", client);
    expect(client.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/annonces` },
    });
  });

  it("déconnecte via Supabase", async () => {
    const client = createClient();
    await signOut(client);
    expect(client.auth.signOut).toHaveBeenCalledTimes(1);
  });
});
