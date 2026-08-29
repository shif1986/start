import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import ThemedPage from "./ThemedPage";

type AccountShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  navigation: { label: string; to: string }[];
  action?: ReactNode;
  showPreview?: boolean;
  children: ReactNode;
};

export default function AccountShell({ eyebrow, title, description, navigation, action, showPreview = false, children }: AccountShellProps) {
  return (
    <ThemedPage ambiance="network" className="p-[clamp(18px,4vw,56px)]">
      {showPreview && <div className="rounded-xl border border-network-blue/20 bg-network-blue/[.055] px-4 py-3 text-sm text-start-cream/65">Aperçu frontend — authentification, paiements et permissions non connectés.</div>}
      <header className="mt-10 flex max-w-4xl items-start justify-between gap-6 max-sm:flex-col">
        <div><span className="text-xs font-bold tracking-[.2em] text-start-gold uppercase">{eyebrow}</span><h1 className="mt-3 text-[clamp(1.65rem,3vw,2.8rem)] font-semibold tracking-[-.035em]">{title}</h1><p className="mt-4 max-w-2xl leading-7 text-start-cream/60">{description}</p></div>
        {action}
      </header>
      <nav className="mt-[clamp(48px,7vw,80px)] flex flex-wrap gap-2 border-b border-start-cream/10 pb-5" aria-label="Navigation de l’espace personnel">
        {navigation.map((item) => <NavLink key={`${item.to}-${item.label}`} to={item.to} className="inline-flex min-h-11 items-center rounded-lg border border-start-cream/10 bg-[#121418] px-4 py-2.5 text-sm font-semibold text-start-cream/65 transition hover:border-start-gold hover:text-start-gold max-sm:flex-1 max-sm:justify-center max-sm:text-center">{item.label}</NavLink>)}
      </nav>
      <div className="mt-8">{children}</div>
    </ThemedPage>
  );
}
