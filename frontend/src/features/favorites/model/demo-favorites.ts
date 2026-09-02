const STORAGE_PREFIX = "start-demo-favorites";
export const DEMO_FAVORITES_CHANGED = "start-demo-favorites-changed";

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function isDemoListingId(listingId: string) {
  return /^\d+$/.test(listingId);
}

export function getDemoFavoriteIds(userId: string): string[] {
  if (!userId) return [];
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(userId)) ?? "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function setDemoFavorite(userId: string, listingId: string, isFavorite: boolean) {
  const current = new Set(getDemoFavoriteIds(userId));
  if (isFavorite) current.add(listingId);
  else current.delete(listingId);
  localStorage.setItem(storageKey(userId), JSON.stringify([...current]));
  window.dispatchEvent(new CustomEvent(DEMO_FAVORITES_CHANGED, { detail: { userId } }));
}
