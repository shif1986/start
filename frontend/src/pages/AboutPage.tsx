import ThemedPage from "../components/ThemedPage";

export default function AboutPage() {
  return (
    <ThemedPage
      ambiance="dark"
      showPattern={false}
      className="discreet-network-background px-[clamp(20px,5vw,72px)] py-[clamp(32px,5vw,72px)]"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-3xl text-center">
          <span className="mx-auto block h-px w-24 bg-start-gold/70" aria-hidden="true" />
          <span className="mx-auto mt-6 flex w-fit items-center gap-3" aria-hidden="true">
            <span className="size-2 rounded-full bg-network-blue" />
            <span className="size-2 rounded-full bg-network-yellow" />
            <span className="size-2 rounded-full bg-network-red" />
          </span>
          <span className="mt-5 block text-[.65rem] font-bold tracking-[.2em] text-start-gold uppercase">
            Notre vision
          </span>
          <h1 className="mt-6 text-[clamp(1.65rem,3vw,2.8rem)] leading-[1.08] font-bold tracking-[-.035em]">
            Une foi qui rassemble.<br />
            <span className="text-start-gold">Un réseau qui agit.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[clamp(.92rem,1.3vw,1.05rem)] leading-7 text-start-cream/62">
            START met en relation les professionnels, les familles et les
            institutions chrétiennes pour servir la communauté avec
            bienveillance, proximité et excellence.
          </p>
        </header>

        <section className="cyril-profile relative mt-[clamp(48px,7vw,80px)] overflow-hidden rounded-2xl border border-start-cream/10 bg-[radial-gradient(circle_at_10%_15%,rgba(199,164,93,.08),transparent_30%),#14171d] p-[clamp(24px,4vw,52px)] shadow-[0_28px_80px_rgba(0,0,0,.28)]">
          <span className="pointer-events-none absolute top-0 right-[9%] h-px w-48 bg-gradient-to-r from-transparent via-start-gold/70 to-transparent" aria-hidden="true" />
          <div className="grid items-center gap-[clamp(34px,5vw,72px)] min-[700px]:grid-cols-[minmax(260px,.82fr)_minmax(0,1.18fr)]">
            <figure className="relative mx-auto w-full max-w-[480px]">
              <span className="absolute -top-3 -right-3 h-28 w-28 rounded-tr-3xl border-t border-r border-start-gold/50" aria-hidden="true" />
              <span className="absolute -bottom-3 -left-3 h-20 w-20 rounded-bl-3xl border-b border-l border-network-blue/35" aria-hidden="true" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem_2.5rem_1rem_1rem] bg-[#090b0f] shadow-[0_26px_70px_rgba(0,0,0,.38)]">
                <img
                  src="/images/team/cyril-cerdan.png"
                  alt="Portrait de Cyril Cerdan, président de START Réseau Chrétien"
                  className="size-full object-cover object-[51%_center]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_72%,rgba(7,9,12,.5)_100%)]" aria-hidden="true" />
              </div>
            </figure>

            <div className="flex flex-col justify-center py-[clamp(10px,2vw,24px)] min-[700px]:pr-[clamp(6px,2vw,20px)]">
              <div className="flex items-center gap-4">
                <span className="h-10 w-1 bg-start-gold" aria-hidden="true" />
                <div>
                  <span className="text-[.68rem] font-bold tracking-[.22em] text-start-gold uppercase">
                    Qui nous sommes
                  </span>
                  <h2 className="mt-1 text-[clamp(2rem,4vw,3.5rem)] leading-none font-bold tracking-[-.045em] text-start-gold">
                    Cyril Cerdan
                  </h2>
                </div>
              </div>

              <p className="mt-7 text-[clamp(1rem,1.25vw,1.15rem)] font-medium text-start-cream/82">
                Présentation du président de l’association.
              </p>

              <div className="mt-7 space-y-5 text-[clamp(.92rem,1.03vw,1rem)] leading-7 text-start-cream/64">
                <p>
                  Transformé par une rencontre avec le Seigneur en 2010, Cyril
                  a été libéré de la polytoxicomanie et de l’occultisme. Depuis,
                  il œuvre dans les nations en annonçant l’Évangile avec des
                  signes, des miracles et des prodiges.
                </p>
                <p>
                  Artisan indépendant pendant huit ans dans l’immobilier, la
                  gestion de conflits et le coaching, il a participé au lancement
                  de l’association humanitaire Empreinte d’Espoir. Il s’investit
                  pour apporter un avenir et une espérance : creusement de puits,
                  construction de centres d’accueil, soutien à la scolarité et
                  accompagnement des plus démunis.
                </p>
                <p>
                  À Madagascar, il a initié une société pour créer de l’emploi
                  dans des territoires défavorisés. Aujourd’hui écrivain,
                  conférencier et pasteur, il met son expérience missionnaire au
                  service de l’unité du corps de Christ et d’une vision où
                  l’économie et l’entrepreneuriat deviennent des leviers d’impact.
                </p>
              </div>

              <blockquote className="relative mt-7 border-l border-start-gold/55 py-1 pl-5 text-[clamp(1rem,1.3vw,1.18rem)] leading-7 font-semibold text-start-cream/88">
                « Tout seul, on va plus vite. Ensemble, on va plus loin ! »
              </blockquote>

              <div className="mt-7 flex flex-wrap gap-2" aria-label="Fonctions de Cyril Cerdan">
                {[
                  ["Écrivain", "border-network-blue/25 text-network-blue"],
                  ["Conférencier", "border-network-yellow/25 text-network-yellow"],
                  ["Pasteur", "border-start-gold/25 text-start-gold"],
                ].map(([label, classes]) => (
                  <span key={label} className={`rounded-full border bg-start-cream/[.025] px-3 py-1.5 text-xs font-semibold ${classes}`}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-7 lg:grid-cols-2">
          <article className="relative overflow-hidden rounded-2xl border border-start-gold/20 bg-[radial-gradient(circle_at_top_left,rgba(199,164,93,.1),transparent_42%),#17191e] p-[clamp(28px,4vw,44px)] shadow-[0_24px_70px_rgba(0,0,0,.2)]">
            <span className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-start-gold/80 via-start-gold/20 to-transparent" aria-hidden="true" />
            <span className="text-xs font-bold tracking-[.18em] text-network-blue uppercase">
              Notre vision
            </span>
            <h2 className="mt-4 text-[clamp(1.6rem,3vw,2.35rem)] leading-tight font-semibold">
              Faire de la connexion une force collective
            </h2>
            <p className="mt-5 leading-7 text-start-cream/60">
              Favoriser l’unité du corps de Christ, investir la société par ses
              valeurs et permettre aux chrétiens de prospérer pour devenir une
              lumière dans le monde.
            </p>
          </article>

          <article className="relative overflow-hidden rounded-2xl border border-start-cream/10 bg-[#121418]/90 p-[clamp(28px,4vw,44px)] shadow-[0_24px_70px_rgba(0,0,0,.2)]">
            <span className="text-xs font-bold tracking-[.18em] text-network-yellow uppercase">
              Notre mission
            </span>
            <h2 className="mt-4 text-[clamp(1.6rem,3vw,2.35rem)] leading-tight font-semibold">
              Mettre la foi en action
            </h2>
            <p className="mt-5 leading-7 text-start-cream/60">
              Encourager les échanges, l’entrepreneuriat et les projets porteurs
              d’espérance afin que chacun puisse contribuer avec ses talents.
            </p>
          </article>
        </section>

      </div>
    </ThemedPage>
  );
}
