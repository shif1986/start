import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import DesktopNavigation from "./DesktopNavigation";
import MobileNavigation from "./MobileNavigation";
import MobileNavigationDrawer from "./MobileNavigationDrawer";
import type { NavigationState } from "./navigation.types";
import { useCompactNavigation } from "./useCompactNavigation";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const displayState = useCompactNavigation();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const navigationState: NavigationState = isMenuOpen ? "menu-open" : displayState;

  useEffect(() => {
    closeMenu();
  }, [closeMenu, pathname]);

  return (
    <>
      <header className="site-navigation" data-navigation-state={navigationState}>
        <DesktopNavigation />
        <MobileNavigation
          isMenuOpen={isMenuOpen}
          menuButtonRef={menuButtonRef}
          onMenuToggle={() => setIsMenuOpen((current) => !current)}
        />
      </header>
      {createPortal(
        <MobileNavigationDrawer isOpen={isMenuOpen} onClose={closeMenu} triggerRef={menuButtonRef} />,
        document.body,
      )}
    </>
  );
}
