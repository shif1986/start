export default function AboutPage() {
  return (
    <div className="rounded-3xl border border-start-cream/10 bg-[#0e121e] p-[clamp(24px,5vw,64px)]">
      <h1 className="font-serif text-[clamp(2.5rem,6vw,5rem)]">À propos</h1>
      <p className="max-w-3xl text-lg leading-8 text-start-cream/70">
        START Réseau Chrétien est une plateforme locale qui met en relation les
        professionnels, les familles et les institutions chrétiennes pour servir
        la communauté avec bienveillance, proximité et excellence.
      </p>

      <div className="my-8 grid grid-cols-2 gap-5 max-md:grid-cols-1">
        <div className="rounded-2xl border border-start-cream/10 bg-start-cream/5 p-6">
          <h3 className="mb-3 text-xl font-bold text-start-gold">Notre vision</h3>
          <p>
            Créer un espace où la foi, le service et le tissu local s’unissent
            pour renforcer les initiatives chrétiennes dans chaque région.
          </p>
        </div>
        <div className="rounded-2xl border border-start-cream/10 bg-start-cream/5 p-6">
          <h3 className="mb-3 text-xl font-bold text-start-gold">Notre mission</h3>
          <p>
            Faciliter les échanges utiles entre particuliers et professionnels,
            tout en gardant une expérience simple, respectueuse et inspirante.
          </p>
        </div>
      </div>

      <div className="grid min-h-72 place-content-center rounded-2xl border border-dashed border-start-cream/20 bg-[#080c12]/50 text-start-cream/45">
        Vidéo YouTube de présentation / vision du réseau
      </div>
    </div>
  );
}
