import { describe, expect, it } from "vitest";
import { listingKeys } from "./listing-keys";

describe("listingKeys", () => {
  it("sépare les listes et les détails", () => {
    const filters = { search: null, category: null, countryCode: "FR", subdivision: null, page: 1, pageSize: 4 } as const;
    expect(listingKeys.list(filters)).toEqual(["listings", "list", filters]);
    expect(listingKeys.detail("annonce-test")).toEqual(["listings", "detail", "annonce-test"]);
  });
});
