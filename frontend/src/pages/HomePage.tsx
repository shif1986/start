import { useState } from "react";
import { Link } from "react-router-dom";
import FranceListingsMap from "../components/FranceListingsMap";
import { mockListings } from "../data/mockListings";
import { homeCategories } from "../data/categories";
import CategoryCard from "../components/CategoryCard";
import ListingCard from "../components/ListingCard";
import BrandPattern from "../components/BrandPattern";

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

        <h1 className="my-6 flex w-[min(100%,350px)] flex-col items-stretch font-sans leading-none font-extrabold max-lg:my-4 max-lg:w-[300px] max-sm:w-[260px]">
          <span className="sr-only">
            START Réseau Chrétien Professionnel
          </span>
          <span
            className="flex w-full items-center justify-between text-[clamp(4rem,6.2vw,6.5rem)] font-medium tracking-[-.07em] text-start-cream max-lg:text-[4.8rem] max-sm:text-[4.1rem]"
            aria-hidden="true"
          >
            <span>S</span>
            <span>T</span>
            <svg
              className="h-[.95em] w-[.82em] shrink-0 overflow-visible"
              viewBox="0 0 100 120"
              fill="none"
            >
              <path
                d="M45 31L22 83M55 31L78 83"
                stroke="#F4EFE5"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="50" cy="19" r="17" fill="#C7A45D" stroke="#F4EFE5" strokeWidth="8" />
              <circle cx="19" cy="94" r="17" fill="#C7A45D" stroke="#F4EFE5" strokeWidth="8" />
              <circle cx="81" cy="94" r="17" fill="#C7A45D" stroke="#F4EFE5" strokeWidth="8" />
            </svg>
            <span>R</span>
            <span>T</span>
          </span>
          <span
            className="mt-2 flex w-full items-center justify-between whitespace-nowrap text-[clamp(.88rem,1.35vw,1.25rem)] font-normal tracking-[.22em] text-start-cream/95 max-lg:text-[1rem] max-lg:tracking-[.17em] max-sm:text-[.82rem] max-sm:tracking-[.12em]"
            aria-hidden="true"
          >
            <span>RÉSEAU</span>
            <span>CHRÉTIEN</span>
          </span>
          <span
            className="mt-3 flex w-full items-center justify-between text-[clamp(1.4rem,2.6vw,2.8rem)] font-extrabold tracking-[-.025em] text-start-gold max-lg:mt-2 max-lg:text-[1.9rem] max-sm:text-[1.65rem]"
            aria-hidden="true"
          >
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
        className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 text-[.68rem] tracking-[.28em] text-start-cream/65 max-lg:hidden"
        aria-label="Découvrir la suite"
      >
        <span>DÉCOUVRIR</span>
        <span className="animate-bounce text-2xl leading-none text-start-gold">↓</span>
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

      <section className="relative overflow-hidden bg-start-cream px-[clamp(20px,4vw,56px)] py-14 text-start-ink">
        <BrandPattern className="-top-24 -right-20 h-[560px] w-[370px] rotate-6 text-start-gold/[.065] max-sm:hidden" />
        <div className="relative z-10 mb-8 flex items-end justify-between gap-5 max-sm:flex-col max-sm:items-start">
          <div>
            <span className="text-xs font-extrabold tracking-[.24em] text-start-gold uppercase">
              À la une
            </span>
            <h2 className="mt-2 text-[clamp(2rem,4vw,3.5rem)] font-bold tracking-[-.035em]">
              Les dernières annonces
            </h2>
            <p className="mt-2 max-w-xl text-start-ink/65">Découvrez les nouvelles opportunités et services proposés par le réseau.</p>
          </div>
          <Link
            to="/annonces"
            className="shrink-0 rounded-lg border border-start-ink/15 px-5 py-3 font-semibold text-start-ink transition hover:border-start-gold hover:text-start-gold"
          >
            Voir toutes les annonces <span className="ml-3 text-start-gold" aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-7 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {featuredListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>
      </section>

      <section className="relative overflow-hidden bg-start-cream px-[clamp(20px,4vw,56px)] pb-16 pt-10 text-start-ink">
        <BrandPattern className="-bottom-40 -left-24 h-[610px] w-[400px] -rotate-6 text-start-gold/[.055] max-sm:hidden" />
        <div className="relative z-10 mb-6 flex items-end justify-between gap-5 max-sm:flex-col max-sm:items-start">
          <div>
            <span className="text-xs font-bold tracking-[.22em] text-start-gold uppercase">Explorez le réseau</span>
            <h2 className="mt-2 text-[clamp(2rem,4vw,3.5rem)] font-bold tracking-[-.035em]">Parcourez les catégories</h2>
            <p className="mt-2 max-w-xl text-start-ink/65">Trouvez facilement les services, opportunités et ressources dont vous avez besoin.</p>
          </div>
          <Link to="/categories" className="shrink-0 rounded-lg border border-start-ink/15 px-5 py-3 text-sm font-semibold text-start-ink transition hover:border-start-gold hover:text-start-gold">Voir toutes les catégories <span className="ml-3 text-start-gold" aria-hidden="true">→</span></Link>
        </div>
        <div className="relative z-10 grid grid-cols-[1.4fr_repeat(3,1fr)] gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {homeCategories.map((category, index) => (
            <CategoryCard key={category.id} category={category} compact featured={index === 0} count={mockListings.filter((listing) => listing.categorySlug === category.slug).length} />
          ))}
        </div>
      </section>
    </div>
  );
}
