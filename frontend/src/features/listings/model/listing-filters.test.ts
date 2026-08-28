import { describe, expect, it } from "vitest";
import { normalizeListingFilters } from "./listing-filters";

describe("normalizeListingFilters", () => {
  it("normalise les filtres URL vers les paramètres Supabase", () => {
    expect(normalizeListingFilters({
      search: "  piano  ",
      category: "services",
      country: "Suisse",
      subdivision: "Genève",
      page: 2,
      pageSize: 4,
    })).toEqual({
      search: "piano",
      category: "services",
      countryCode: "CH",
      subdivision: "Genève",
      page: 2,
      pageSize: 4,
    });
  });

  it("borne la pagination et transforme les chaînes vides en null", () => {
    expect(normalizeListingFilters({ search: "", category: "", country: "", subdivision: "", page: -4, pageSize: 500 })).toEqual({
      search: null,
      category: null,
      countryCode: null,
      subdivision: null,
      page: 1,
      pageSize: 100,
    });
  });
});
