import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { Database } from "../../../lib/supabase/database.types";
import { createReport } from "./create-report";

const input = {
  reporterId: "reporter-id",
  listingId: "listing-id",
  reason: "spam" as const,
  details: "  Contenu répété et non pertinent.  ",
};

function resultQuery(data: unknown, error: unknown = null) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
  };
}

function createClient(options: { accountStatus?: "active" | "suspended"; ownerId?: string; listingStatus?: Database["public"]["Enums"]["listing_status"] } = {}) {
  const profileQuery = resultQuery({ account_status: options.accountStatus ?? "active" });
  const listingQuery = resultQuery({ owner_id: options.ownerId ?? "owner-id", status: options.listingStatus ?? "published" });
  const insert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn((table: string) => {
    if (table === "profiles") return profileQuery;
    if (table === "listings") return listingQuery;
    return { insert };
  });
  return { client: { from } as unknown as SupabaseClient<Database>, insert };
}

describe("createReport", () => {
  it("enregistre le signalement autorisé en normalisant les détails", async () => {
    const { client, insert } = createClient();
    await createReport(input, client);
    expect(insert).toHaveBeenCalledWith({ reporter_id: "reporter-id", listing_id: "listing-id", reason: "spam", details: "Contenu répété et non pertinent." });
  });

  it("explique lorsqu’un membre signale sa propre annonce", async () => {
    const { client, insert } = createClient({ ownerId: "reporter-id" });
    await expect(createReport(input, client)).rejects.toThrow("Vous ne pouvez pas signaler votre propre annonce.");
    expect(insert).not.toHaveBeenCalled();
  });

  it("explique lorsqu’un compte est suspendu", async () => {
    const { client, insert } = createClient({ accountStatus: "suspended" });
    await expect(createReport(input, client)).rejects.toThrow("Votre compte doit être actif pour signaler une annonce.");
    expect(insert).not.toHaveBeenCalled();
  });
});
