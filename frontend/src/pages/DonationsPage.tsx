import ThemedPage from "../components/ThemedPage";
import BrandPattern from "../components/BrandPattern";

export default function DonationsPage() {
  return (
    <ThemedPage ambiance="gold" className="p-[clamp(32px,7vw,104px)]">
      <span className="text-xs font-bold tracking-[.22em] text-start-gold uppercase">Soutenir la mission</span>
      <h1 className="mt-3 text-[clamp(2.5rem,6vw,5rem)] font-bold tracking-[-.04em]">Faire un don</h1>
      <p className="max-w-3xl text-lg leading-8 text-start-cream/70">
        Soutenez la mission du réseau chrétien local pour accompagner les
        projets, les familles et les initiatives de proximité.
      </p>

      <div className="relative isolate my-14 grid max-w-3xl grid-cols-2 gap-7 overflow-hidden rounded-2xl border border-start-gold/20 bg-[#17191e]/90 p-9 shadow-[0_24px_70px_rgba(0,0,0,.2)] max-sm:my-10 max-sm:grid-cols-1 max-sm:p-6">
        <BrandPattern variant="nodes" className="-right-24 -bottom-40 -z-10 h-[420px] w-[300px] text-start-gold/[.055] opacity-50 max-sm:opacity-30" />
        <div className="relative">
          <span className="block text-xs font-bold tracking-wider text-start-gold uppercase">Impact</span>
          <strong>Accompagnement local</strong>
        </div>
        <div className="relative">
          <span className="block text-xs font-bold tracking-wider text-start-gold uppercase">Objectif</span>
          <strong>Renforcer les projets de proximité</strong>
        </div>
      </div>

      <button type="button" className="rounded-xl bg-start-gold px-6 py-3 font-bold text-start-ink hover:bg-[#d5b66f]">
        Faire un don
      </button>
    </ThemedPage>
  );
}
