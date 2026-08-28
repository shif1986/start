import { useQuery } from "@tanstack/react-query";
import { getListingDetail } from "../api/get-listing-detail";
import { listingKeys } from "../model/listing-keys";

export function useListingDetail(slug: string | undefined, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: listingKeys.detail(slug ?? ""),
    queryFn: () => getListingDetail(slug ?? ""),
    enabled: enabled && Boolean(slug),
  });
}
