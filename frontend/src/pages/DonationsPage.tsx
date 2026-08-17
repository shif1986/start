export default function DonationsPage() {
  return (
    <div className="rounded-3xl border border-start-cream/10 bg-[#0e121e] p-[clamp(24px,5vw,64px)]">
      <h1 className="font-serif text-[clamp(2.5rem,6vw,5rem)]">Faire un don</h1>
      <p className="max-w-3xl text-lg leading-8 text-start-cream/70">
        Soutenez la mission du réseau chrétien local pour accompagner les
        projets, les familles et les initiatives de proximité.
      </p>

      <div className="my-8 grid max-w-3xl grid-cols-2 gap-5 rounded-2xl border border-start-cream/10 bg-start-cream/5 p-6 max-sm:grid-cols-1">
        <div>
          <span className="block text-xs font-bold tracking-wider text-start-gold uppercase">Impact</span>
          <strong>Accompagnement local</strong>
        </div>
        <div>
          <span className="block text-xs font-bold tracking-wider text-start-gold uppercase">Objectif</span>
          <strong>Renforcer les projets de proximité</strong>
        </div>
      </div>

      <button type="button" className="rounded-xl bg-start-gold px-6 py-3 font-bold text-start-ink hover:bg-[#d5b66f]">
        Faire un don
      </button>
    </div>
  );
}
