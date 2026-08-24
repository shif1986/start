import type { RefObject } from "react";
import NavigationLink from "./NavigationLink";
import NavigationLogo from "./NavigationLogo";
import { navigationActions } from "./navigation.config";

type MobileNavigationProps = {
  isMenuOpen: boolean;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  onMenuToggle: () => void;
};

export default function MobileNavigation({
  isMenuOpen,
  menuButtonRef,
  onMenuToggle,
}: MobileNavigationProps) {
  return (
    <>
      <div className="mobile-navigation-bar">
        <NavigationLogo />
        <div className="mobile-navigation-actions">
          <NavigationLink item={navigationActions.donation} className="mobile-donation-link" />
          <button
            ref={menuButtonRef}
            type="button"
            className="mobile-menu-trigger"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation-drawer"
            onClick={onMenuToggle}
          >
            <span className="sr-only">{isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}</span>
            <span className="mobile-menu-icon" aria-hidden="true"><span /><span /><span /></span>
          </button>
        </div>
      </div>

    </>
  );
}
