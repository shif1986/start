import { describe, expect, it } from "vitest";
import { getDataSource } from "./data-source";

describe("getDataSource", () => {
  it("active Supabase lorsque sa configuration publique est disponible", () => {
    expect(getDataSource({
      VITE_SUPABASE_URL: "https://example.supabase.co",
      VITE_SUPABASE_ANON_KEY: "public-key",
    })).toBe("supabase");
  });

  it("accepte la clé publique Supabase moderne", () => {
    expect(getDataSource({
      VITE_SUPABASE_URL: "https://example.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    })).toBe("supabase");
  });

  it("respecte un mode statique explicitement demandé", () => {
    expect(getDataSource({
      VITE_DATA_SOURCE: "static",
      VITE_SUPABASE_URL: "https://example.supabase.co",
      VITE_SUPABASE_ANON_KEY: "public-key",
    })).toBe("static");
  });
});
