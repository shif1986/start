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
          src="/logo-start-blanc-616.png"
          alt="START Réseau Chrétien"
          width="616"
          height="314"
          fetchPriority="high"
          className="navigation-logo"
          onError={() => setHasImageError(true)}
        />
      )}
    </NavLink>
  );
}
