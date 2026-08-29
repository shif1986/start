import type { ReactNode } from "react";
import ThemedPage from "./ThemedPage";

type LegalDocumentPageProps = {
  eyebrow: string;
  title: string;
  introduction: string;
  children: ReactNode;
};

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="rounded-2xl border border-start-cream/10 bg-[#121418]/92 p-[clamp(22px,3vw,32px)] shadow-[0_22px_60px_rgba(0,0,0,.2)]">
      <span className="block h-px w-10 bg-start-gold/65" aria-hidden="true" />
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <div className="mt-5 space-y-4 text-sm leading-7 text-start-cream/65">{children}</div>
    </article>
  );
}

export default function LegalDocumentPage({ eyebrow, title, introduction, children }: LegalDocumentPageProps) {
  return (
    <ThemedPage ambiance="dark" showPattern={false} className="discreet-network-background px-[clamp(20px,5vw,72px)] py-[clamp(32px,5vw,72px)]">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-3xl text-center">
          <span className="mx-auto block h-px w-24 bg-start-gold/70" aria-hidden="true" />
          <span className="mx-auto mt-6 flex w-fit items-center gap-3" aria-hidden="true">
            <span className="size-2 rounded-full bg-network-blue" />
            <span className="size-2 rounded-full bg-network-yellow" />
            <span className="size-2 rounded-full bg-network-red" />
          </span>
          <span className="mt-5 block text-[.65rem] font-bold tracking-[.2em] text-start-gold uppercase">{eyebrow}</span>
          <h1 className="mt-6 text-[clamp(1.65rem,3vw,2.8rem)] leading-[1.08] font-bold tracking-[-.035em]">{title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-[clamp(.9rem,1.2vw,1rem)] leading-7 text-start-cream/62">{introduction}</p>
        </header>
        <div className="mt-[clamp(48px,7vw,80px)] grid gap-5 md:grid-cols-2">{children}</div>
        <p className="mt-10 text-center text-xs text-start-cream/38">Dernière mise à jour : 26 août 2026</p>
      </div>
    </ThemedPage>
  );
}
