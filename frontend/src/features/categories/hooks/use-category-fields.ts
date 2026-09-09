import { useQuery } from "@tanstack/react-query";
import { getCategoryFields } from "../api/get-category-fields";
import { categoryKeys } from "../model/category-keys";

export function useCategoryFields(categoryId: string) {
  return useQuery({
    queryKey: categoryKeys.fields(categoryId),
    queryFn: () => getCategoryFields(categoryId),
    enabled: Boolean(categoryId),
    staleTime: 30 * 60_000,
  });
}
