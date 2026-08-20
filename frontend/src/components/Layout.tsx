import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { navigationCategories, type Category } from "../data/categories";

type LayoutProps = {
  children: ReactNode;
};

const navItems = [
  { id: "accueil", to: "/", label: "Accueil" },
  { id: "annonces", to: "/annonces", label: "Annonce" },
  { id: "vision", to: "/a-propos", label: "Vision" },
  { id: "contact", to: "/contact", label: "Contact" },
];

const categoryLinksLeft = navigationCategories.slice(0, 5);
const categoryLinksRight = navigationCategories.slice(5);

function CategoryDropdown({ category, align = "left" }: { category: Category; align?: "left" | "right" }) {
  return (
    <div className="group/category relative py-1.5">
      <NavLink
        to={`/annonces?category=${encodeURIComponent(category.slug)}`}
        className="whitespace-nowrap text-[.68rem] font-semibold text-start-cream/75 transition hover:text-start-gold group-focus-within/category:text-start-gold"
      >
        {category.shortLabel ?? category.label}
      </NavLink>
      <div className={`invisible absolute top-full z-50 w-64 translate-y-2 pt-3 opacity-0 transition duration-200 group-hover/category:visible group-hover/category:translate-y-0 group-hover/category:opacity-100 group-focus-within/category:visible group-focus-within/category:translate-y-0 group-focus-within/category:opacity-100 ${align === "right" ? "right-0" : "left-0"}`}>
        <div className="overflow-hidden rounded-xl border border-start-cream/12 bg-[#111419]/98 p-2 shadow-[0_22px_55px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur-xl">
          <span className="block px-3 pt-2 pb-1 text-[.6rem] font-bold tracking-[.16em] text-start-gold uppercase">{category.label}</span>
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

function StartLogo() {
  return (
    <img
      src="/Logo START_blanc.png"
      alt="START Réseau Chrétien"
      className="block h-auto w-[min(210px,18vw)] max-md:w-40"
    />
  );
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const categoryNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const elements = Array.from(main.querySelectorAll<HTMLElement>("h1, h2, h3, p")).filter(
      (element) => !element.closest("[data-no-scroll-reveal]"),
    );

    elements.forEach((element, index) => {
      element.dataset.scrollReveal = "";
      element.style.setProperty("--reveal-delay", `${(index % 5) * 70}ms`);
    });

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [pathname]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/annonces?q=${encodeURIComponent(query)}` : "/annonces");
  }

  function scrollCategories(direction: -1 | 1) {
    categoryNavRef.current?.scrollBy({
      left: direction * categoryNavRef.current.clientWidth,
      behavior: "smooth",
    });
  }

  return (
    <div className="mx-auto min-h-screen max-w-[1600px] px-[30px] pt-3 pb-6 max-sm:px-3">
      <header className="sticky top-2 z-50 flex min-h-13 flex-wrap items-center justify-between gap-x-3 rounded-3xl bg-white/[.055] px-4 py-1 shadow-[inset_0_.5px_0_rgba(255,255,255,.1),0_8px_28px_rgba(0,0,0,.08)] backdrop-blur-2xl backdrop-saturate-150 max-md:rounded-2xl">
        <div className="flex min-w-0 flex-1 items-center">
          <StartLogo />
        </div>

        <nav
          id="main-navigation"
          className={`${isMenuOpen ? "flex" : "hidden"} absolute top-[calc(100%+10px)] right-0 left-0 z-50 flex-col gap-1 rounded-2xl border border-start-cream/12 bg-[#111419]/98 p-3.5 shadow-[0_24px_60px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur-xl lg:static lg:mx-3 lg:flex lg:flex-[1.6] lg:flex-row lg:flex-wrap lg:items-center lg:justify-center lg:gap-2.5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none`}
          aria-label="Navigation principale"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              onClick={closeMenu}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-[clamp(1rem,1.15vw,1.18rem)] font-semibold tracking-[-.02em] text-start-cream/90 transition hover:bg-start-cream/[.06] hover:text-start-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-start-gold lg:rounded-lg lg:px-3 lg:py-1.5 ${isActive ? "bg-start-gold/[.08] text-start-gold lg:bg-transparent" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/publier"
            onClick={closeMenu}
            className="mt-2 rounded-xl bg-start-gold px-4 py-3 text-center text-sm font-bold text-start-ink shadow-[0_10px_26px_rgba(199,164,93,.16)] lg:hidden"
          >
            Publier une annonce
          </NavLink>
          <NavLink
            to="/connexion"
            onClick={closeMenu}
            className="rounded-xl border border-start-gold/25 px-4 py-3 text-center text-sm font-bold text-start-gold lg:hidden"
          >
            Se connecter
          </NavLink>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-3">
          <NavLink
            to="/don"
            className="inline-flex min-h-10 min-w-20 items-center justify-center rounded-lg border-start-gold/80 bg-transparent px-3.5 text-sm font-bold text-start-gold [border-style:solid] [border-width:.5px] transition hover:-translate-y-0.5 hover:bg-start-gold/10 max-sm:min-w-14 max-sm:px-2.5"
          >
            Don
          </NavLink>
          <NavLink to="/connexion" className="inline-flex min-h-10 min-w-28 items-center justify-center rounded-lg border-start-gold/80 px-3.5 text-sm font-bold text-start-gold [border-style:solid] [border-width:.5px] transition hover:-translate-y-0.5 hover:bg-start-gold/10 max-lg:hidden">
            Connecter
          </NavLink>
          <NavLink to="/publier" className="inline-flex min-h-10 min-w-28 items-center justify-center rounded-lg border-start-gold bg-gradient-to-b from-start-gold to-[#ab8947] px-3.5 text-sm font-bold text-[#111827] [border-style:solid] [border-width:.5px] shadow-[0_6px_14px_rgba(199,164,93,.22)] transition hover:-translate-y-0.5 hover:bg-none hover:bg-start-gold/10 hover:text-start-gold max-lg:hidden">
            <span className="mr-2 inline-flex size-[22px] items-center justify-center rounded-full bg-[#111827]/10 text-xl font-extrabold">+</span>
            Annonce
          </NavLink>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg text-start-cream transition hover:bg-start-cream/10 focus-visible:outline-2 focus-visible:outline-start-gold lg:hidden"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isMenuOpen}
            aria-controls="main-navigation"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <span className="sr-only">
              {isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            </span>
            <span className="relative block h-4.5 w-5" aria-hidden="true">
              <span className={`absolute left-0 h-px w-5 bg-current transition ${isMenuOpen ? "top-2 rotate-45" : "top-0"}`} />
              <span className={`absolute top-2 left-0 h-px w-5 bg-current transition ${isMenuOpen ? "opacity-0" : "opacity-100"}`} />
              <span className={`absolute left-0 h-px w-5 bg-current transition ${isMenuOpen ? "top-2 -rotate-45" : "top-4"}`} />
            </span>
          </button>
        </div>

        <div className="order-4 grid w-full grid-cols-[1fr_minmax(280px,440px)_1fr] items-center gap-9 border-t border-start-cream/5 py-1.5 max-xl:grid-cols-1">
          <nav className="hidden items-center justify-end gap-6 xl:flex" aria-label="Catégories principales, première partie">
            {categoryLinksLeft.map((category) => (
              <CategoryDropdown key={category.id} category={category} />
            ))}
          </nav>

          <form
            className="flex w-full items-center justify-center"
            role="search"
            onSubmit={handleSearch}
          >
            <div className="flex w-full items-center overflow-hidden rounded-lg border-start-cream/40 bg-black/10 [border-style:solid] [border-width:.5px] transition focus-within:border-start-gold/80 focus-within:bg-black/15">
              <input
                className="min-w-0 flex-1 bg-transparent px-3.5 py-1.5 text-sm text-start-cream outline-none placeholder:text-start-cream/35"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Rechercher une annonce..."
                aria-label="Rechercher une annonce"
              />
              <button
                className="m-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-start-gold transition hover:bg-start-gold/10"
                type="submit"
                aria-label="Lancer la recherche"
              >
                <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 16L21 21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </form>

          <nav className="hidden items-center justify-start gap-6 xl:flex" aria-label="Catégories principales, seconde partie">
            {categoryLinksRight.map((category) => (
              <CategoryDropdown key={category.id} category={category} align="right" />
            ))}
          </nav>

          <div className="grid w-full grid-cols-[32px_minmax(0,1fr)_32px] items-center gap-2 pt-1 xl:hidden">
            <button type="button" onClick={() => scrollCategories(-1)} className="inline-flex size-8 items-center justify-center rounded-full border border-start-gold/25 text-sm text-start-gold transition hover:bg-start-gold/10" aria-label="Voir les catégories précédentes">←</button>
            <nav
              ref={categoryNavRef}
              className="flex w-full snap-x snap-mandatory gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Catégories d'annonces"
            >
              {[...categoryLinksLeft, ...categoryLinksRight].map((category) => (
                <NavLink
                  key={category.id}
                  to={`/annonces?category=${encodeURIComponent(category.slug)}`}
                  className="flex min-h-10 w-[calc(50%_-_4px)] shrink-0 snap-start items-center justify-center rounded-lg border border-start-cream/[.07] bg-black/[.08] px-2 py-2 text-center text-[.68rem] leading-[1.2] font-semibold text-start-cream/70 transition hover:border-start-gold/25 hover:bg-start-gold/[.05] hover:text-start-gold max-sm:text-[.62rem]"
                >
                  {category.shortLabel ?? category.label}
                </NavLink>
              ))}
            </nav>
            <button type="button" onClick={() => scrollCategories(1)} className="inline-flex size-8 items-center justify-center rounded-full border border-start-gold/25 text-sm text-start-gold transition hover:bg-start-gold/10" aria-label="Voir les catégories suivantes">→</button>
          </div>
        </div>
      </header>

      <main ref={mainRef} className="pt-3.5">{children}</main>

      <footer className="relative mt-8 overflow-hidden rounded-3xl border border-start-cream/15 bg-start-cream/[.09] p-5 shadow-[0_20px_55px_rgba(0,0,0,.16)] backdrop-blur-xl max-sm:p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-9 max-md:grid-cols-1 max-md:justify-items-center max-md:gap-5 max-md:text-center">
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-start-cream/70 max-md:justify-center" aria-label="Ressources du pied de page">
            <NavLink to="/contact">Contact</NavLink>
            <NavLink to="/don">Faire un don</NavLink>
            <NavLink to="/contact">Support</NavLink>
          </nav>

          <div className="flex min-h-20 min-w-32 items-center justify-center self-center max-md:order-first">
            <img src="/logo-start-couleur.png" alt="START Réseau Chrétien" className="h-auto w-44 max-sm:w-40" />
          </div>

          <div className="flex flex-col gap-3 text-start-cream/70 max-md:w-full max-md:max-w-sm">
            <h4>Newsletter</h4>
            <div className="flex overflow-hidden rounded-xl border border-start-cream/15 bg-start-cream/5">
              <input className="min-w-0 flex-1 bg-transparent px-3 py-2 outline-none placeholder:text-start-cream/40" type="email" placeholder="Votre email" />
              <button className="bg-start-gold px-3 font-bold text-start-ink" type="button">OK</button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-between gap-4 border-t border-start-cream/10 pt-4 text-xs text-start-cream/55 max-sm:flex-col">
          <span>© 2026 START Réseau Chrétien</span>
          <span>Mentions légales • Confidentialité</span>
        </div>
      </footer>
    </div>
  );
}
