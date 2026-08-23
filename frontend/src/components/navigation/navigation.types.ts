export type NavigationDisplayState = "expanded" | "compact";

export type NavigationState = NavigationDisplayState | "menu-open";

export type NavigationItem = {
  id: string;
  to: string;
  label: string;
  end?: boolean;
};
