import { useState } from "react";
import { applyTheme, getTheme, type ThemeMode } from "../lib/theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(getTheme);
  const isDark = theme === "dark";

  const toggleTheme = () => {
    const nextTheme: ThemeMode = isDark ? "light" : "dark";
    applyTheme(nextTheme);
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {isDark ? (
          <>
            <circle cx="12" cy="12" r="3.5" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
          </>
        ) : (
          <path d="M20.2 15.3A8.5 8.5 0 0 1 8.7 3.8 8.5 8.5 0 1 0 20.2 15.3Z" />
        )}
      </svg>
      <span>{isDark ? "Clair" : "Sombre"}</span>
    </button>
  );
}
