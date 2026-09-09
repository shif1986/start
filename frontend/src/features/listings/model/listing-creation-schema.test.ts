import { describe, expect, it } from "vitest";
import { listingCreationDefaults, listingCreationSchema, parseListingPrice } from "./listing-creation-schema";
import { clearListingDraft, LISTING_DRAFT_KEY, readListingDraft, writeListingDraft } from "./listing-draft";

const validListing = {
  ...listingCreationDefaults,
  categoryId: "category-id",
  title: "Conseil aux entrepreneurs",
  description: "Une description complète et suffisamment détaillée.",
  city: "Paris",
  phone: "0600000000",
  email: "contact@example.test",
  postalAddress: "10 rue de la Paix, Paris",
};

describe("listingCreationSchema", () => {
  it("valide une annonce complète", () => {
    expect(listingCreationSchema.safeParse(validListing).success).toBe(true);
  });

  it("refuse un prix négatif et des coordonnées invalides", () => {
    const result = listingCreationSchema.safeParse({ ...validListing, price: "-2", email: "invalide" });
    expect(result.success).toBe(false);
  });

  it("convertit le prix facultatif", () => {
    expect(parseListingPrice("")).toBeNull();
    expect(parseListingPrice("12,50")).toBe(12.5);
  });
});

describe("listing draft", () => {
  it("sauvegarde, relit et efface un brouillon valide", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    };
    writeListingDraft(validListing, storage);
    expect(readListingDraft(storage).title).toBe(validListing.title);
    clearListingDraft(storage);
    expect(values.has(LISTING_DRAFT_KEY)).toBe(false);
  });
});
