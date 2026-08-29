import { useEffect, useRef, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Navigation from "./navigation/Navigation";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const elements = Array.from(
      main.querySelectorAll<HTMLElement>("h1, h2, h3, p"),
    ).filter((element) => !element.closest("[data-no-scroll-reveal]"));

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

  return (
    <div
      data-app-content
      className="mx-auto min-h-screen max-w-[1600px] px-[30px] pt-3 pb-6 max-sm:px-3"
    >
      <Navigation />

      <main ref={mainRef} className="pt-3.5">{children}</main>

      <footer className="relative mt-8 overflow-hidden rounded-3xl border border-start-cream/15 bg-start-cream/[.09] p-5 shadow-[0_20px_55px_rgba(0,0,0,.16)] backdrop-blur-xl max-sm:p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-9 max-md:grid-cols-1 max-md:justify-items-center max-md:gap-5 max-md:text-center">
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-start-cream/70 max-md:justify-center" aria-label="Ressources du pied de page">
            <NavLink to="/contact">Contact</NavLink>
            <NavLink to="/don">Faire un don</NavLink>
            <NavLink to="/contact">Support</NavLink>
            <NavLink to="/signaler-un-contenu">Signaler un contenu</NavLink>
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

        <div className="mt-5 flex items-start justify-between gap-6 border-t border-start-cream/10 pt-4 text-xs text-start-cream/55 max-lg:flex-col max-lg:items-center max-lg:text-center">
          <span>© 2026 START Réseau Chrétien</span>
          <nav className="flex flex-wrap justify-end gap-x-5 gap-y-2 max-lg:justify-center" aria-label="Informations juridiques du pied de page">
            <NavLink to="/mentions-legales" className="transition hover:text-start-gold">Mentions légales</NavLink>
            <NavLink to="/confidentialite" className="transition hover:text-start-gold">Confidentialité</NavLink>
            <NavLink to="/conditions-utilisation" className="transition hover:text-start-gold">CGU</NavLink>
            <NavLink to="/conditions-abonnement" className="transition hover:text-start-gold">Conditions d’abonnement</NavLink>
            <NavLink to="/cookies" className="transition hover:text-start-gold">Cookies</NavLink>
          </nav>
        </div>
      </footer>
    </div>
  );
}
