import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import DesktopNavigation from "./DesktopNavigation";
import MobileNavigation from "./MobileNavigation";
import MobileNavigationDrawer from "./MobileNavigationDrawer";
import type { NavigationState } from "./navigation.types";
import { useCompactNavigation } from "./useCompactNavigation";
import { useAuth } from "../../features/auth/context/use-auth";
import { useCurrentProfile } from "../../features/profiles/hooks/use-current-profile";
import { navigationActions } from "./navigation.config";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const displayState = useCompactNavigation();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  const { session, user, isLoading } = useAuth();
  const profileQuery = useCurrentProfile();
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const navigationState: NavigationState = isMenuOpen ? "menu-open" : displayState;
  const accountType = profileQuery.data?.accountType ?? user?.user_metadata.account_type;
  const role = profileQuery.data?.role;
  const accountPath = accountType === "professional"
    ? "/espace/professionnel"
    : role === "admin" || role === "moderator"
      ? "/admin"
      : "/espace/particulier";
  const accountAction = session
    ? { ...navigationActions.account, to: accountPath }
    : isLoading
      ? { ...navigationActions.login, label: "Compte" }
      : navigationActions.login;

  useEffect(() => {
    closeMenu();
  }, [closeMenu, pathname]);

  return (
    <>
      <header className="site-navigation" data-navigation-state={navigationState}>
        <DesktopNavigation accountAction={accountAction} />
        <MobileNavigation
          isMenuOpen={isMenuOpen}
          menuButtonRef={menuButtonRef}
          onMenuToggle={() => setIsMenuOpen((current) => !current)}
        />
      </header>
      {createPortal(
        <MobileNavigationDrawer accountAction={accountAction} isOpen={isMenuOpen} onClose={closeMenu} triggerRef={menuButtonRef} />,
        document.body,
      )}
    </>
  );
}
