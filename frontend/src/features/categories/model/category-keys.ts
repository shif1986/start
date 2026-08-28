export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  activeList: () => [...categoryKeys.lists(), "active"] as const,
};
