import { describe, expect, it } from "vitest";
import { categoryKeys } from "./category-keys";

describe("categoryKeys", () => {
  it("centralise une clé stable pour la liste active", () => {
    expect(categoryKeys.activeList()).toEqual(["categories", "list", "active"]);
  });
});
