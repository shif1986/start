import { useEffect, useRef, type RefObject } from "react";
import { NavLink } from "react-router-dom";
import { navigationCategories } from "../../data/categories";
import NavigationLink from "./NavigationLink";
import NavigationLogo from "./NavigationLogo";
import { navigationActions, primaryNavigationItems } from "./navigation.config";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type MobileNavigationDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

export default function MobileNavigationDrawer({ isOpen, onClose, triggerRef }: MobileNavigationDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const scrollPosition = window.scrollY;
    const backgroundRegions = Array.from(
      document.querySelectorAll<HTMLElement>("[data-app-content] > main, [data-app-content] > footer"),
    );
    const triggerButton = triggerRef.current;
    const previousBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      right: document.body.style.right,
      left: document.body.style.left,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };

    backgroundRegions.forEach((region) => region.setAttribute("inert", ""));
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.right = "0";
    document.body.style.left = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusableElements = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) return;
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    function handleResize() {
      if (window.innerWidth >= 1024) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      backgroundRegions.forEach((region) => region.removeAttribute("inert"));
      Object.assign(document.body.style, previousBodyStyles);
      window.scrollTo(0, scrollPosition);
      triggerButton?.focus();
    };
  }, [isOpen, onClose, triggerRef]);

  return (
    <div
      id="mobile-navigation-drawer"
      className="mobile-navigation-layer"
      data-state={isOpen ? "open" : "closed"}
      aria-hidden={!isOpen}
      inert={isOpen ? undefined : true}
    >
      <button
        type="button"
        className="mobile-navigation-overlay"
        data-testid="navigation-overlay"
        aria-label="Fermer le menu"
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
      />
      <aside
        ref={drawerRef}
        className="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-navigation-title"
      >
        <div className="mobile-drawer-header">
          <div>
            <span id="mobile-navigation-title" className="sr-only">Menu principal</span>
            <NavigationLogo />
          </div>
          <button ref={closeButtonRef} type="button" className="mobile-drawer-close" aria-label="Fermer le menu" onClick={onClose}>
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="mobile-drawer-content">
          <nav className="mobile-drawer-navigation" aria-label="Navigation mobile">
            {primaryNavigationItems.map((item, index) => (
              <div key={item.id} className="mobile-drawer-link-row">
                <span aria-hidden="true">0{index + 1}</span>
                <NavigationLink item={item} className="mobile-drawer-link" onNavigate={onClose} />
              </div>
            ))}
          </nav>

          <nav className="mobile-drawer-submenu" aria-label="Catégories d’annonces">
            {navigationCategories.slice(0, 4).map((category) => (
              <NavLink key={category.id} to={`/annonces?category=${encodeURIComponent(category.slug)}`} onClick={onClose}>
                {category.shortLabel ?? category.label}
              </NavLink>
            ))}
            <NavLink className="mobile-drawer-submenu-all" to="/categories" onClick={onClose}>
              Toutes
            </NavLink>
          </nav>

        </div>

        <div className="mobile-drawer-footer">
          <NavigationLink item={navigationActions.login} className="drawer-action drawer-action-secondary" onNavigate={onClose} />
          <NavigationLink item={navigationActions.publish} className="drawer-action drawer-action-primary" onNavigate={onClose} />
        </div>
      </aside>
    </div>
  );
}
