import { useState, type FormEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { navigationCategories, type Category } from "../../data/categories";
import NavigationLink from "./NavigationLink";
import NavigationLogo from "./NavigationLogo";
import {
  navigationActions,
  primaryNavigationItems,
} from "./navigation.config";

const categoryLinksLeft = navigationCategories.slice(0, 5);
const categoryLinksRight = navigationCategories.slice(5);

function CategoryDropdown({
  category,
  align = "left",
}: {
  category: Category;
  align?: "left" | "right";
}) {
  return (
    <div className="group/category relative py-1.5">
      <NavLink
        to={`/annonces?category=${encodeURIComponent(category.slug)}`}
        className="whitespace-nowrap text-[.68rem] font-semibold text-start-cream/75 transition hover:text-start-gold group-focus-within/category:text-start-gold"
      >
        {category.shortLabel ?? category.label}
      </NavLink>
      <div
        className={`invisible absolute top-full z-50 w-64 translate-y-2 pt-3 opacity-0 transition duration-200 group-hover/category:visible group-hover/category:translate-y-0 group-hover/category:opacity-100 group-focus-within/category:visible group-focus-within/category:translate-y-0 group-focus-within/category:opacity-100 ${align === "right" ? "right-0" : "left-0"}`}
      >
        <div className="overflow-hidden rounded-xl border border-start-cream/12 bg-[#080b10]/72 p-2 shadow-[0_22px_55px_rgba(0,0,0,.38)] backdrop-blur-2xl">
          <span className="block px-3 pt-2 pb-1 text-[.6rem] font-bold tracking-[.16em] text-start-gold uppercase">
            {category.label}
          </span>
          <ul className="m-0 grid list-none gap-0.5 p-0">
            {category.subcategories.map((subcategory) => (
              <li key={subcategory}>
                <NavLink
                  to={`/annonces?category=${encodeURIComponent(category.slug)}&subcategory=${encodeURIComponent(subcategory)}`}
                  className="block rounded-lg px-3 py-2 text-xs leading-5 text-start-cream/65 transition hover:bg-start-cream/[.06] hover:text-start-cream focus-visible:bg-start-cream/[.06] focus-visible:text-start-gold focus-visible:outline-none"
                >
                  {subcategory}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function DesktopNavigation() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/annonces?q=${encodeURIComponent(query)}` : "/annonces");
  }

  return (
    <div className="desktop-navigation">
      <div className="desktop-navigation-primary">
        <div className="desktop-navigation-logo">
          <NavigationLogo />
        </div>

        <nav className="desktop-navigation-links" aria-label="Navigation principale">
          {primaryNavigationItems.map((item) => (
            <NavigationLink
              key={item.id}
              item={item}
              className="desktop-navigation-link"
            />
          ))}
        </nav>

        <div className="desktop-navigation-actions">
          <NavigationLink item={navigationActions.donation} className="navigation-action navigation-action-secondary" />
          <NavigationLink item={navigationActions.login} className="navigation-action navigation-action-secondary" />
          <NavigationLink item={navigationActions.publish} className="navigation-action navigation-action-primary" />
        </div>
      </div>

      <div className="desktop-navigation-discovery">
        <nav className="desktop-category-links desktop-category-links-left" aria-label="Catégories principales, première partie">
          {categoryLinksLeft.map((category) => (
            <CategoryDropdown key={category.id} category={category} />
          ))}
        </nav>

        <form className="navigation-search" role="search" onSubmit={handleSearch}>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Rechercher une annonce..."
            aria-label="Rechercher une annonce"
          />
          <button type="submit" aria-label="Lancer la recherche">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M16 16L21 21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </form>

        <nav className="desktop-category-links desktop-category-links-right" aria-label="Catégories principales, seconde partie">
          {categoryLinksRight.map((category) => (
            <CategoryDropdown key={category.id} category={category} align="right" />
          ))}
        </nav>

      </div>
    </div>
  );
}
