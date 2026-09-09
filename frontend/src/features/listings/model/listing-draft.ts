import { listingCreationDefaults, listingCreationSchema, type ListingCreationValues } from "./listing-creation-schema";

export const LISTING_DRAFT_KEY = "start-listing-draft-v1";

export function readListingDraft(storage: Pick<Storage, "getItem"> = localStorage): ListingCreationValues {
  try {
    const raw = storage.getItem(LISTING_DRAFT_KEY);
    if (!raw) return listingCreationDefaults;
    const result = listingCreationSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : listingCreationDefaults;
  } catch {
    return listingCreationDefaults;
  }
}

export function writeListingDraft(values: ListingCreationValues, storage: Pick<Storage, "setItem"> = localStorage) {
  storage.setItem(LISTING_DRAFT_KEY, JSON.stringify(values));
}

export function clearListingDraft(storage: Pick<Storage, "removeItem"> = localStorage) {
  storage.removeItem(LISTING_DRAFT_KEY);
}
