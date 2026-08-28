import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../api/get-categories";
import { categoryKeys } from "../model/category-keys";
import { mapCategoryRows } from "../model/category-mapper";

export function useCategories({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: categoryKeys.activeList(),
    queryFn: () => getCategories(),
    select: mapCategoryRows,
    staleTime: 30 * 60_000,
    enabled,
  });
}
