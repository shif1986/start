import { describe, expect, it } from "vitest";
import { parseSupabaseEnv } from "./env";

describe("parseSupabaseEnv", () => {
  it("retourne une configuration Supabase valide", () => {
    expect(parseSupabaseEnv({
      VITE_SUPABASE_URL: "https://example.supabase.co",
      VITE_SUPABASE_ANON_KEY: "public-anon-key",
    })).toEqual({
      url: "https://example.supabase.co",
      anonKey: "public-anon-key",
    });
  });

  it("refuse une URL invalide", () => {
    expect(() => parseSupabaseEnv({
      VITE_SUPABASE_URL: "not-an-url",
      VITE_SUPABASE_ANON_KEY: "public-anon-key",
    })).toThrow("Configuration Supabase invalide");
  });

  it("refuse une clé service_role", () => {
    const serviceRolePayload = btoa(JSON.stringify({ role: "service_role" }));
    const serviceRoleKey = `header.${serviceRolePayload}.signature`;

    expect(() => parseSupabaseEnv({
      VITE_SUPABASE_URL: "https://example.supabase.co",
      VITE_SUPABASE_ANON_KEY: serviceRoleKey,
    })).toThrow("service_role");
  });

  it("accepte une clé publique publishable", () => {
    expect(parseSupabaseEnv({
      VITE_SUPABASE_URL: "https://example.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    })).toEqual({
      url: "https://example.supabase.co",
      anonKey: "sb_publishable_example",
    });
  });
});
