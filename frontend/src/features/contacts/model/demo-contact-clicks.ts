const STORAGE_PREFIX = "start-demo-contact-clicks";
export const DEMO_CONTACT_CLICKS_CHANGED = "start-demo-contact-clicks-changed";

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function getDemoContactIds(userId: string): string[] {
  if (!userId) return [];
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(userId)) ?? "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function recordDemoContact(userId: string, professionalId: string) {
  if (!userId || !professionalId) return;
  const contacts = new Set(getDemoContactIds(userId));
  contacts.add(professionalId);
  localStorage.setItem(storageKey(userId), JSON.stringify([...contacts]));
  window.dispatchEvent(new CustomEvent(DEMO_CONTACT_CLICKS_CHANGED, { detail: { userId } }));
}

