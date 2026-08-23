import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function NavigationLogo() {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <NavLink
      to="/"
      className="navigation-logo-link"
      aria-label="Retour à l’accueil"
    >
      {hasImageError ? (
        <span className="navigation-logo-fallback">START</span>
      ) : (
        <img
          src="/Logo START_blanc.png"
          alt="START Réseau Chrétien"
          className="navigation-logo"
          onError={() => setHasImageError(true)}
        />
      )}
    </NavLink>
  );
}
