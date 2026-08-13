import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

type LayoutProps = {
  children: ReactNode;
};

const navItems = [
  { to: "/", label: "Accueil" },
  { to: "/annonces", label: "Annonces" },
  { to: "/a-propos", label: "À propos" },
  { to: "/don", label: "Don" },
  { to: "/contact", label: "Contact" },
];

function StartLogo() {
  return (
    <img
      src="/Logo START_blanc.png"
      alt="START Réseau Chrétien"
      className="brand-logo"
    />
  );
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <StartLogo />
        </div>

        <nav className="main-nav" aria-label="Navigation principale">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <NavLink to="/publier" className="btn btn-primary action-primary">
            <span className="btn-icon">+</span>
            Annonce
          </NavLink>
          <button type="button" className="btn btn-ghost action-secondary">
            Connexion
          </button>
          <button type="button" className="btn btn-primary action-secondary">
            S’inscrire
          </button>
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-branding">
            <StartLogo />
            <p>
              Une place de rencontre pour les professionnels et particuliers
              chrétiens, près de chez vous.
            </p>
          </div>

          <div className="footer-column">
            <h4>Explorer</h4>
            <NavLink to="/">Accueil</NavLink>
            <NavLink to="/annonces">Annonces</NavLink>
            <NavLink to="/a-propos">À propos</NavLink>
          </div>

          <div className="footer-column">
            <h4>Ressources</h4>
            <NavLink to="/contact">Contact</NavLink>
            <NavLink to="/don">Faire un don</NavLink>
            <NavLink to="/contact">Support</NavLink>
          </div>

          <div className="footer-column">
            <h4>Newsletter</h4>
            <div className="newsletter-box">
              <input type="email" placeholder="Votre email" />
              <button type="button">OK</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 START Réseau Chrétien</span>
          <span>Mentions légales • Confidentialité</span>
        </div>
      </footer>
    </div>
  );
}
