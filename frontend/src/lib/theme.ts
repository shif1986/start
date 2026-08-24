export type ThemeMode = "dark" | "light";

const THEME_STORAGE_KEY = "start-theme";

export function getTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";

  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "light"
      ? "light"
      : "dark";
  } catch {
    return "dark";
  }
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The selected theme still applies when storage is unavailable.
  }
}

export function initializeTheme() {
  applyTheme(getTheme());
}
