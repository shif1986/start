import { NavLink } from "react-router-dom";
import type { NavigationItem } from "./navigation.types";

type NavigationLinkProps = {
  item: NavigationItem;
  className?: string;
  onNavigate?: () => void;
};

export default function NavigationLink({
  item,
  className = "",
  onNavigate,
}: NavigationLinkProps) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `${className}${isActive ? " is-active" : ""}`
      }
    >
      <span>{item.label}</span>
    </NavLink>
  );
}
