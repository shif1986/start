export const profileKeys = {
  all: ["profiles"] as const,
  current: (userId: string) => [...profileKeys.all, "current", userId] as const,
};
