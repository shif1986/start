import { useState } from "react";
import { Link } from "react-router-dom";
import FranceListingsMap from "../components/FranceListingsMap";
import { mockListings } from "../data/mockListings";

const featuredListings = mockListings.slice(0, 5);

function HeroGradientBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(199,164,93,.28)_0%,rgba(199,164,93,.11)_30%,transparent_60%),linear-gradient(145deg,rgba(31,34,41,.18)_0%,rgba(12,15,21,.66)_72%)]"
      aria-hidden="true"
    ></div>
  );
}

function SearchByLocation({
  selectedDepartment,
  onDepartmentSelect,
}: {
  selectedDepartment: string;
  onDepartmentSelect: (department: string) => void;
}) {
  return (
    <section className="relative grid min-h-[calc(100svh-120px)] grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] items-center gap-0 overflow-hidden rounded-3xl bg-[#171a21] px-[clamp(20px,3.5vw,52px)] py-[clamp(44px,6vh,72px)] max-lg:min-h-0 max-lg:grid-cols-1 max-lg:justify-items-center max-lg:gap-6 max-lg:py-10 max-sm:rounded-2xl max-sm:py-8">
      <HeroGradientBackdrop />

      <div className="relative z-10 max-w-2xl max-lg:flex max-lg:w-full max-lg:flex-col max-lg:items-center max-lg:text-center">
        <span className="block w-[min(100%,350px)] whitespace-nowrap text-[clamp(.68rem,.9vw,.95rem)] font-bold tracking-[.1em] text-start-cream max-lg:w-[300px] max-lg:text-xs max-lg:tracking-[.06em] max-sm:w-[260px] max-sm:text-[.65rem] max-sm:tracking-[.035em]">
          SITE D'ANNONCE PROFESSIONNEL
        </span>

        <h1 className="my-6 flex w-[min(100%,350px)] flex-col items-stretch font-sans text-[clamp(3.4rem,6.5vw,7rem)] leading-none font-extrabold text-start-cream max-lg:my-4 max-lg:w-[300px] max-lg:text-[3.5rem] max-sm:w-[260px] max-sm:text-[3rem]">
          <span className="flex w-full items-center justify-between">
            {"START".split("").map((letter, index) => (
              <span key={`${letter}-${index}`}>{letter}</span>
            ))}
          </span>
          <span className="mt-3 flex w-full items-center justify-between whitespace-nowrap text-[.24em] font-semibold tracking-[.31em] text-start-cream/95 max-lg:mt-2 max-lg:tracking-[.2em]">
            <span>RÉSEAU</span>
            <span>CHRÉTIEN</span>
          </span>
          <span className="mt-3 flex w-full items-center justify-between text-[.4em] font-extrabold tracking-[-.025em] text-start-gold max-lg:mt-2">
            {"PROFESSIONNEL".split("").map((letter, index) => (
              <span key={`${letter}-${index}`}>{letter}</span>
            ))}
          </span>
        </h1>

        <p className="mt-10 max-w-2xl border-l-2 border-start-gold/70 pl-5 font-sans text-[clamp(1rem,1.5vw,1.4rem)] leading-[1.7] font-light tracking-[-.015em] text-start-cream/70 max-lg:mt-7 max-lg:max-w-xl max-lg:border-t max-lg:border-l-0 max-lg:px-0 max-lg:pt-4 max-sm:mt-6 max-sm:text-sm">
          Valoriser votre entreprise
          <br />
          <span className="font-medium text-start-cream/90">
            et soutenir l’économie qui porte nos valeurs.
          </span>
        </p>

        <div className="mt-15 flex items-center gap-4 max-lg:mt-8 max-lg:justify-center max-sm:mt-7 max-sm:flex-col">
          <Link
            to="/publier"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border-start-gold bg-transparent px-5 font-bold text-start-gold [border-style:solid] [border-width:.5px] transition hover:-translate-y-0.5 hover:bg-start-gold/10"
          >
            Rejoindre le réseau
            <span className="ml-3" aria-hidden="true">
              →
            </span>
          </Link>
          <Link
            to="/annonces"
            className="text-sm font-semibold text-start-cream/65 transition hover:text-start-gold"
          >
            Découvrir les annonces
          </Link>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[760px] min-w-0 max-lg:max-w-[650px] lg:-translate-x-8 xl:-translate-x-14">
        <div className="mx-auto w-[98%] max-sm:w-full">
          <FranceListingsMap
            listings={mockListings}
            selectedDepartment={selectedDepartment}
            onDepartmentSelect={onDepartmentSelect}
          />
        </div>
      </div>

      <div
        className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-[.65rem] tracking-[.25em] text-start-cream/50 max-lg:hidden"
        aria-label="Découvrir la suite"
      >
        <span>DÉCOUVRIR</span>
        <span className="animate-bounce text-xl text-start-gold">↓</span>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [selectedDepartment, setSelectedDepartment] = useState("");

  function handleDepartmentSelect(department: string) {
    setSelectedDepartment((current) =>
      current === department ? "" : department,
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-[#171a21]">
      <SearchByLocation
        selectedDepartment={selectedDepartment}
        onDepartmentSelect={handleDepartmentSelect}
      />

      <section className="px-[clamp(20px,4vw,56px)] py-16">
        <div className="mb-8 flex items-end justify-between gap-5 max-sm:flex-col max-sm:items-start">
          <div>
            <span className="text-xs font-extrabold tracking-[.24em] text-start-gold uppercase">
              Annonces récentes
            </span>
            <h2 className="mt-2 font-serif text-[clamp(2rem,4vw,3.5rem)]">
              Découvrir les derniers services
            </h2>
          </div>
          <Link
            to="/annonces"
            className="shrink-0 rounded-xl border-start-gold px-4 py-2.5 font-bold text-start-gold [border-style:solid] [border-width:.5px] transition hover:bg-start-gold hover:text-start-ink"
          >
            Voir plus
          </Link>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-5">
          {featuredListings.map((listing) => (
            <article
              key={listing.id}
              className="flex min-h-64 flex-col rounded-2xl border border-start-cream/10 bg-start-cream/5 p-6 shadow-xl transition hover:-translate-y-1 hover:border-start-gold/50"
            >
              <span className="mb-4 w-fit rounded-full bg-start-gold/15 px-3 py-1 text-xs font-bold text-start-gold">
                {listing.category}
              </span>
              <h3 className="mb-3 text-xl font-bold">{listing.title}</h3>
              <p className="text-start-cream/60">
                {listing.city} • {listing.department}
              </p>
              <div className="mt-auto flex items-end justify-between gap-3 pt-5 text-sm text-start-cream/65">
                <strong>
                  {listing.price ? `${listing.price}€` : "Prix libre"}
                </strong>
                <span>{listing.professional.name}</span>
              </div>
              <Link
                to={`/annonce/${listing.id}`}
                className="mt-4 font-bold text-start-gold hover:underline"
              >
                Voir l’annonce
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
