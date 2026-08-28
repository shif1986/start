import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../lib/supabase/database.types";
import { setFavorite } from "./set-favorite";

describe("setFavorite", () => {
  it("ajoute un favori avec l'utilisateur courant", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });
    const client = { from } as unknown as SupabaseClient<Database>;

    await setFavorite({ userId: "user-id", listingId: "listing-id", isFavorite: true }, client);
    expect(from).toHaveBeenCalledWith("favorites");
    expect(insert).toHaveBeenCalledWith({ user_id: "user-id", listing_id: "listing-id" });
  });

  it("retire uniquement le favori ciblé", async () => {
    const secondEq = vi.fn().mockResolvedValue({ error: null });
    const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
    const deleteQuery = vi.fn().mockReturnValue({ eq: firstEq });
    const client = { from: vi.fn().mockReturnValue({ delete: deleteQuery }) } as unknown as SupabaseClient<Database>;

    await setFavorite({ userId: "user-id", listingId: "listing-id", isFavorite: false }, client);
    expect(firstEq).toHaveBeenCalledWith("user_id", "user-id");
    expect(secondEq).toHaveBeenCalledWith("listing_id", "listing-id");
  });

  it("expose une erreur métier pour permettre le rollback", async () => {
    const client = { from: vi.fn().mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: { message: "denied" } }) }) } as unknown as SupabaseClient<Database>;
    await expect(setFavorite({ userId: "user-id", listingId: "listing-id", isFavorite: true }, client)).rejects.toThrow("Impossible de modifier ce favori");
  });
});
