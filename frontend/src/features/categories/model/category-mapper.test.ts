import { describe, expect, it } from "vitest";
import { mapCategoryRows } from "./category-mapper";

describe("mapCategoryRows", () => {
  it("construit les sous-catégories depuis les relations parent/enfant", () => {
    const result = mapCategoryRows([
      { id: "parent", parent_id: null, name: "Véhicules", slug: "vehicules", icon: "vehicle", description: "Mobilité", position: 10, is_active: true },
      { id: "child", parent_id: "parent", name: "Vélos", slug: "velos", icon: "bike", description: null, position: 10, is_active: true },
    ]);

    expect(result).toEqual([
      expect.objectContaining({ id: "parent", label: "Véhicules", subcategories: ["Vélos"] }),
    ]);
  });

  it("conserve les métadonnées visuelles locales par slug", () => {
    const [category] = mapCategoryRows([
      { id: "db-id", parent_id: null, name: "Services", slug: "services", icon: "briefcase", description: "Description DB", position: 10, is_active: true },
    ]);

    expect(category).toMatchObject({
      id: "db-id",
      label: "Services",
      description: "Description DB",
      image: "/images/categories/professionnels.webp",
      professionalPriority: true,
    });
  });

  it("ignore les catégories enfants au premier niveau", () => {
    expect(mapCategoryRows([
      { id: "child", parent_id: "missing", name: "Vélos", slug: "velos", icon: "bike", description: null, position: 10, is_active: true },
    ])).toEqual([]);
  });
});
