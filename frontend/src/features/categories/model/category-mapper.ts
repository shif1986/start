import { categories as categoryPresentation, type Category, type CategoryIcon } from "../../../data/categories";
import type { CategoryRow } from "./category.types";

const validIcons = new Set<CategoryIcon>([
  "vehicle", "building", "work", "briefcase", "home", "fashion", "computer",
  "culture", "paw", "tools", "commerce", "agriculture", "industry", "more",
]);

function resolveIcon(row: CategoryRow, presentation?: Category): CategoryIcon {
  if (presentation) return presentation.icon;
  return row.icon && validIcons.has(row.icon as CategoryIcon) ? row.icon as CategoryIcon : "more";
}

export function mapCategoryRows(rows: CategoryRow[]): Category[] {
  const childrenByParent = new Map<string, CategoryRow[]>();

  for (const row of rows) {
    if (!row.parent_id) continue;
    const children = childrenByParent.get(row.parent_id) ?? [];
    children.push(row);
    childrenByParent.set(row.parent_id, children);
  }

  return rows
    .filter((row) => row.parent_id === null)
    .sort((left, right) => left.position - right.position)
    .map((row) => {
      const presentation = categoryPresentation.find((category) => category.slug === row.slug);
      const children = (childrenByParent.get(row.id) ?? []).sort((left, right) => left.position - right.position);

      return {
        id: row.id,
        slug: row.slug,
        label: row.name,
        shortLabel: presentation?.shortLabel,
        description: row.description ?? presentation?.description ?? "Catégorie d’annonces",
        icon: resolveIcon(row, presentation),
        image: presentation?.image,
        subcategories: children.map((child) => child.name),
        professionalPriority: presentation?.professionalPriority,
      };
    });
}
