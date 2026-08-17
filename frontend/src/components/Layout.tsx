import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";

type LayoutProps = {
  children: ReactNode;
};

const navItems = [
  { id: "accueil", to: "/", label: "Accueil" },
  { id: "annonces", to: "/annonces", label: "Annonce" },
  { id: "vision", to: "/a-propos", label: "Vision" },
  { id: "contact", to: "/contact", label: "Contact" },
];

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

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <div className="mx-auto min-h-screen max-w-[1600px] px-[30px] pt-3 pb-6 max-sm:px-3">
      <header className="sticky top-2 z-50 flex min-h-13 items-center justify-between gap-3 rounded-3xl bg-white/[.025] px-4 py-1 shadow-[inset_0_.5px_0_rgba(255,255,255,.08),0_8px_28px_rgba(0,0,0,.1)] backdrop-blur-2xl backdrop-saturate-150 max-md:rounded-2xl">
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
