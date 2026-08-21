import ThemedPage from "../components/ThemedPage";
import BrandPattern from "../components/BrandPattern";

export default function AboutPage() {
  return (
    <ThemedPage ambiance="gold" className="p-[clamp(32px,7vw,104px)]">
      <span className="text-xs font-bold tracking-[.22em] text-start-gold uppercase">Notre identité</span>
      <h1 className="mt-3 text-[clamp(2.5rem,6vw,5rem)] font-bold tracking-[-.04em]">À propos</h1>
      <p className="max-w-3xl text-lg leading-8 text-start-cream/70">
        START Réseau Chrétien est une plateforme locale qui met en relation les
        professionnels, les familles et les institutions chrétiennes pour servir
        la communauté avec bienveillance, proximité et excellence.
      </p>

      <div className="my-14 grid grid-cols-2 gap-7 max-md:my-10 max-md:grid-cols-1">
        <div className="rounded-2xl border border-start-cream/10 bg-[#17191e]/90 p-7 shadow-[0_20px_55px_rgba(0,0,0,.18)]">
          <span className="mb-4 block size-2 rounded-full bg-network-blue shadow-[0_0_0_6px_rgba(77,163,255,.08)]" aria-hidden="true" />
          <h3 className="mb-3 text-xl font-bold text-network-blue">Notre vision</h3>
          <p>
            Créer un espace où la foi, le service et le tissu local s’unissent
            pour renforcer les initiatives chrétiennes dans chaque région.
          </p>
        </div>
        <div className="rounded-2xl border border-start-cream/10 bg-[#17191e]/90 p-7 shadow-[0_20px_55px_rgba(0,0,0,.18)]">
          <span className="mb-4 block size-2 rounded-full bg-network-yellow shadow-[0_0_0_6px_rgba(255,179,61,.08)]" aria-hidden="true" />
          <h3 className="mb-3 text-xl font-bold text-network-yellow">Notre mission</h3>
          <p>
            Faciliter les échanges utiles entre particuliers et professionnels,
            tout en gardant une expérience simple, respectueuse et inspirante.
          </p>
        </div>
      </div>

      <div className="relative isolate grid min-h-80 place-content-center overflow-hidden rounded-2xl border border-dashed border-start-gold/25 bg-[#0b0d10]/75 text-start-cream/45">
        <BrandPattern variant="constellation" className="inset-0 -z-10 size-full text-start-cream/[.05] opacity-50 max-sm:opacity-30" />
        <span className="relative">Vidéo YouTube de présentation / vision du réseau</span>
      </div>
    </ThemedPage>
  );
}
