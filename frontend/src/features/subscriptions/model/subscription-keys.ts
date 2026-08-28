export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  plans: () => [...subscriptionKeys.all, "plans"] as const,
  current: (userId: string) => [...subscriptionKeys.all, "current", userId] as const,
};
