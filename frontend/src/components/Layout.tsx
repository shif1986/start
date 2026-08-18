import { useState, type FormEvent, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";

type LayoutProps = {
  children: ReactNode;
};

const navItems = [
  { id: "accueil", to: "/", label: "Accueil" },
  { id: "annonces", to: "/annonces", label: "Annonce" },
  { id: "vision", to: "/a-propos", label: "Vision" },
  { id: "contact", to: "/contact", label: "Contact" },
];

const categoryLinksLeft = ["Services", "Éducation", "Bricolage"];
const categoryLinksRight = ["Santé", "Événementiel", "Conseil"];

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

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/annonces?q=${encodeURIComponent(query)}` : "/annonces");
  }

  return (
    <div className="mx-auto min-h-screen max-w-[1600px] px-[30px] pt-3 pb-6 max-sm:px-3">
      <header className="sticky top-2 z-50 flex min-h-13 flex-wrap items-center justify-between gap-x-3 rounded-3xl bg-white/[.055] px-4 py-1 shadow-[inset_0_.5px_0_rgba(255,255,255,.1),0_8px_28px_rgba(0,0,0,.08)] backdrop-blur-2xl backdrop-saturate-150 max-md:rounded-2xl">
        <div className="flex min-w-0 flex-1 items-center">
          <StartLogo />
        </div>

        <nav
          id="main-navigation"
          className={`${isMenuOpen ? "flex" : "hidden"} absolute top-[calc(100%+10px)] right-0 left-0 flex-col gap-1 bg-transparent p-3 lg:static lg:mx-3 lg:flex lg:flex-[1.6] lg:flex-row lg:flex-wrap lg:items-center lg:justify-center lg:gap-2.5 lg:p-0`}
          aria-label="Navigation principale"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              onClick={closeMenu}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-[clamp(1rem,1.15vw,1.18rem)] font-semibold tracking-[-.02em] text-start-cream/90 transition hover:bg-start-cream/5 hover:text-start-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-start-gold lg:py-1.5 ${isActive ? "text-start-gold" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/publier"
            onClick={closeMenu}
            className="mt-2 rounded-lg bg-start-gold px-3 py-2.5 text-center text-sm font-bold text-start-ink lg:hidden"
          >
            Publier une annonce
          </NavLink>
          <button
            type="button"
            className="rounded-lg px-3 py-2.5 text-left text-sm font-bold text-start-gold lg:hidden"
          >
            Se connecter
          </button>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-3">
          <NavLink
            to="/don"
            className="inline-flex min-h-10 min-w-20 items-center justify-center rounded-lg border-start-gold/80 bg-transparent px-3.5 text-sm font-bold text-start-gold [border-style:solid] [border-width:.5px] transition hover:-translate-y-0.5 hover:bg-start-gold/10 max-sm:min-w-14 max-sm:px-2.5"
          >
            Don
          </NavLink>
          <button type="button" className="inline-flex min-h-10 min-w-28 items-center justify-center rounded-lg border-start-gold/80 px-3.5 text-sm font-bold text-start-gold [border-style:solid] [border-width:.5px] transition hover:-translate-y-0.5 hover:bg-start-gold/10 max-lg:hidden">
            Connecter
          </button>
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
              <NavLink
                key={category}
                to={`/annonces?category=${encodeURIComponent(category)}`}
                className="text-xs font-semibold text-start-cream/75 transition hover:text-start-gold"
              >
                {category}
              </NavLink>
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
              <NavLink
                key={category}
                to={`/annonces?category=${encodeURIComponent(category)}`}
                className="text-xs font-semibold text-start-cream/75 transition hover:text-start-gold"
              >
                {category}
              </NavLink>
            ))}
          </nav>

          <nav
            className="flex w-full items-center gap-5 overflow-x-auto px-1 pt-1 pb-0.5 [scrollbar-width:none] xl:hidden"
            aria-label="Catégories d'annonces"
          >
            {[...categoryLinksLeft, ...categoryLinksRight].map((category) => (
              <NavLink
                key={category}
                to={`/annonces?category=${encodeURIComponent(category)}`}
                className="shrink-0 text-xs font-semibold text-start-cream/70 transition hover:text-start-gold"
              >
                {category}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="pt-3.5">{children}</main>

      <footer className="mt-8 rounded-3xl border border-start-cream/10 bg-[#080c12]/90 p-8 max-sm:p-5">
        <div className="grid grid-cols-[1.5fr_repeat(3,1fr)] gap-8 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <div className="max-w-sm">
            <StartLogo />
            <p>
              Une place de rencontre pour les professionnels et particuliers
              chrétiens, près de chez vous.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-start-cream/70">
            <h4>Explorer</h4>
            <NavLink to="/">Accueil</NavLink>
            <NavLink to="/annonces">Annonces</NavLink>
            <NavLink to="/a-propos">À propos</NavLink>
          </div>

          <div className="flex flex-col gap-2 text-start-cream/70">
            <h4>Ressources</h4>
            <NavLink to="/contact">Contact</NavLink>
            <NavLink to="/don">Faire un don</NavLink>
            <NavLink to="/contact">Support</NavLink>
          </div>

          <div className="flex flex-col gap-2 text-start-cream/70">
            <h4>Newsletter</h4>
            <div className="flex overflow-hidden rounded-xl border border-start-cream/15 bg-start-cream/5">
              <input className="min-w-0 flex-1 bg-transparent px-3 py-2 outline-none placeholder:text-start-cream/40" type="email" placeholder="Votre email" />
              <button className="bg-start-gold px-3 font-bold text-start-ink" type="button">OK</button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between gap-4 border-t border-start-cream/10 pt-5 text-sm text-start-cream/55 max-sm:flex-col">
          <span>© 2026 START Réseau Chrétien</span>
          <span>Mentions légales • Confidentialité</span>
        </div>
      </footer>
    </div>
  );
}
