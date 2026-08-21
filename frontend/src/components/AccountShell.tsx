import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import ThemedPage from "./ThemedPage";

type AccountShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  navigation: { label: string; to: string }[];
  children: ReactNode;
};

export default function AccountShell({ eyebrow, title, description, navigation, children }: AccountShellProps) {
  return (
    <ThemedPage ambiance="network" className="p-[clamp(18px,4vw,56px)]">
      <div className="rounded-xl border border-network-blue/20 bg-network-blue/[.055] px-4 py-3 text-sm text-start-cream/65">
        Aperçu frontend — authentification, paiements et permissions non connectés.
      </div>
      <header className="mt-10 max-w-3xl">
        <span className="text-xs font-bold tracking-[.2em] text-start-gold uppercase">{eyebrow}</span>
        <h1 className="mt-3 text-[clamp(2.2rem,5vw,4.5rem)] font-semibold tracking-[-.045em]">{title}</h1>
        <p className="mt-4 max-w-2xl leading-7 text-start-cream/60">{description}</p>
      </header>
      <nav className="mt-10 flex flex-wrap gap-2 border-b border-start-cream/10 pb-5" aria-label="Navigation de l’espace personnel">
        {navigation.map((item) => <NavLink key={item.to} to={item.to} className="rounded-lg border border-start-cream/10 bg-[#121418] px-4 py-2.5 text-sm font-semibold text-start-cream/65 transition hover:border-start-gold hover:text-start-gold">{item.label}</NavLink>)}
      </nav>
      <div className="mt-8">{children}</div>
    </ThemedPage>
  );
}
