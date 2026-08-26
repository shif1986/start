import { useState } from "react";
import { Link } from "react-router-dom";
import FranceListingsMap from "../components/FranceListingsMap";
import { mockListings } from "../data/mockListings";
import { homeCategories } from "../data/categories";
import CategoryCard from "../components/CategoryCard";
import ListingCard from "../components/ListingCard";
import StartNetworkCycle from "../components/StartNetworkCycle";
import ThemeToggle from "../components/ThemeToggle";

const featuredListings = mockListings.slice(0, 8);

function HeroGradientBackdrop() {
  return (
    <div
      className="hero-gradient-backdrop pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(199,164,93,.28)_0%,rgba(199,164,93,.11)_30%,transparent_60%),linear-gradient(145deg,rgba(31,34,41,.18)_0%,rgba(12,15,21,.66)_72%)]"
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
    <section className="home-hero relative grid min-h-[calc(100svh-150px)] grid-cols-[minmax(0,.88fr)_minmax(0,1.12fr)] items-center gap-[clamp(20px,2vw,40px)] overflow-hidden rounded-3xl bg-[#171a21] px-[clamp(20px,3.5vw,52px)] py-[clamp(32px,4.5vh,54px)] max-lg:min-h-0 max-lg:grid-cols-1 max-lg:justify-items-center max-lg:gap-10 max-lg:py-10 max-sm:gap-9 max-sm:rounded-2xl max-sm:px-4 max-sm:pt-20 max-sm:pb-10">
      <HeroGradientBackdrop />
      <ThemeToggle />

      <div
        data-no-scroll-reveal
        className="relative z-10 flex w-full max-w-[520px] min-w-0 flex-col items-center justify-self-center text-center max-lg:order-2 max-lg:max-w-[560px]"
      >
        <div className="flex w-full items-center gap-4 font-hero text-[clamp(.62rem,.8vw,.84rem)] font-medium tracking-[.08em] text-start-gold uppercase max-sm:gap-3 max-sm:text-[.58rem] max-sm:tracking-[.07em]">
          <span
            className="h-px min-w-4 flex-1 bg-gradient-to-r from-transparent to-start-gold/75"
            aria-hidden="true"
          />
          <span className="shrink-0">Site d’annonce professionnel</span>
          <span
            className="h-px min-w-4 flex-1 bg-gradient-to-l from-transparent to-start-gold/75"
            aria-hidden="true"
          />
        </div>

        <h1 className="mt-9 flex w-[min(100%,370px)] flex-col items-stretch font-hero leading-none max-lg:mt-7 max-lg:w-[min(100%,400px)] max-sm:mt-6 max-sm:w-[min(100%,290px)]">
          <span className="sr-only">START Réseau Chrétien Professionnel</span>
          <span
            className="flex w-full items-center justify-between text-[clamp(2.25rem,4vw,3.6rem)] font-medium tracking-[.025em] text-[#f5f5f3] max-sm:tracking-0"
            aria-hidden="true"
          >
            <span>S</span>
            <span>T</span>
            <svg
              className="h-[.96em] w-[.78em] shrink-0 overflow-visible"
              viewBox="0 0 100 120"
              fill="none"
            >
              <path
                d="M45 31L22 83M55 31L78 83"
                stroke="#F5F5F3"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="50"
                cy="19"
                r="17"
                fill="#D4AF37"
                stroke="#F5F5F3"
                strokeWidth="8"
              />
              <circle
                cx="19"
                cy="94"
                r="17"
                fill="#D4AF37"
                stroke="#F5F5F3"
                strokeWidth="8"
              />
              <circle
                cx="81"
                cy="94"
                r="17"
                fill="#D4AF37"
                stroke="#F5F5F3"
                strokeWidth="8"
              />
            </svg>
            <span>R</span>
            <span>T</span>
          </span>
          <span
            className="mt-3 flex w-full items-center justify-center gap-[clamp(18px,4vw,34px)] whitespace-nowrap text-[clamp(.65rem,.88vw,.88rem)] font-normal tracking-[.26em] text-[#f5f5f3]/90 max-lg:text-[.88rem] max-lg:tracking-[.23em] max-sm:mt-4 max-sm:gap-4 max-sm:text-[.6rem] max-sm:tracking-[.14em]"
            aria-hidden="true"
          >
            <span>RÉSEAU</span>
            <span>CHRÉTIEN</span>
          </span>
          <span
            className="mt-7 flex w-full items-center gap-2.5 max-sm:mt-6 max-sm:gap-2"
            aria-hidden="true"
          >
            <span className="h-[.5px] min-w-3 flex-1 bg-start-gold/55" />
            <span className="relative flex min-h-12 w-[82%] items-center justify-center px-[clamp(16px,3vw,34px)] text-[clamp(.72rem,1.15vw,1.05rem)] font-semibold tracking-[.3em] text-start-gold max-sm:min-h-10 max-sm:w-[90%] max-sm:px-3 max-sm:text-[.64rem] max-sm:tracking-[.14em]">
              <svg
                className="absolute inset-0 size-full"
                viewBox="0 0 620 64"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M18 1h584l17 31-17 31H18L1 32 18 1Z"
                  stroke="currentColor"
                  strokeWidth="0.75"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <span className="relative">PROFESSIONNEL</span>
            </span>
            <span className="h-[.5px] min-w-3 flex-1 bg-start-gold/55" />
          </span>
        </h1>

        <p className="mt-12 max-w-[470px] font-hero text-[clamp(.86rem,1.05vw,1.02rem)] leading-[1.65] font-normal text-start-cream/78 max-lg:mt-11 max-lg:text-base max-sm:mt-10 max-sm:max-w-[330px] max-sm:text-sm max-sm:leading-7">
          Valoriser votre entreprise et{" "}
          <span className="text-start-gold">soutenir l’économie</span>
          <br className="max-sm:hidden" /> qui porte nos valeurs.
        </p>

        <div className="mt-11 flex items-center justify-center gap-4 max-lg:mt-10 max-sm:mt-8 max-sm:w-full max-sm:flex-col">
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

      <div className="relative z-10 mx-auto w-full max-w-[720px] min-w-0 max-lg:order-1 max-lg:max-w-[620px] max-sm:max-w-[430px]">
        <div className="france-map-shell mx-auto w-[98%] max-sm:w-full">
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
        <span className="animate-bounce text-2xl leading-none text-start-gold">
          ↓
        </span>
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
    <div className="home-page overflow-hidden rounded-3xl bg-[#171a21]">
      <SearchByLocation
        selectedDepartment={selectedDepartment}
        onDepartmentSelect={handleDepartmentSelect}
      />

      <section className="home-listings-section relative overflow-hidden border-y border-start-cream/10 bg-[radial-gradient(circle_at_14%_18%,rgba(199,164,93,.14),transparent_34%),linear-gradient(125deg,#24231f_0%,#1b1e23_48%,#12161c_100%)] px-[clamp(20px,5vw,72px)] py-28 text-start-cream max-sm:py-16">
        <div className="relative z-10 mb-14 flex items-end justify-between gap-6 max-sm:mb-9 max-sm:flex-col max-sm:items-start">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[.24em] text-network-blue uppercase"><span className="size-1.5 rounded-full bg-network-blue" aria-hidden="true" />
              À la une
            </span>
            <h2 className="mt-2 text-[clamp(1.65rem,3vw,2.8rem)] font-bold tracking-[-.035em]">
              Les dernières annonces
            </h2>
            <p className="mt-2 max-w-xl text-start-cream/65">
              Découvrez les nouvelles opportunités et services proposés par le
              réseau.
            </p>
          </div>
          <Link
            to="/annonces"
            className="shrink-0 rounded-lg border border-start-cream/20 px-5 py-3 font-semibold text-start-cream transition hover:border-start-gold hover:text-start-gold"
          >
            Voir toutes les annonces{" "}
            <span className="ml-3 text-start-gold" aria-hidden="true">
              →
            </span>
          </Link>
        </div>

        <div className="relative z-10 grid grid-cols-4 gap-x-6 gap-y-12 max-lg:grid-cols-2 max-lg:gap-y-10 max-sm:grid-cols-1 max-sm:gap-y-8">
          {featuredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} compact />
          ))}
        </div>
      </section>

      <section className="home-categories-section discreet-network-background relative overflow-hidden border-t border-start-cream/10 px-[clamp(20px,5vw,72px)] py-28 text-start-cream shadow-[inset_0_1px_0_rgba(255,255,255,.025)] max-sm:py-16">
        <div className="home-categories-header relative z-10 mb-14 flex items-end justify-between gap-6 max-sm:mb-9 max-sm:flex-col max-sm:items-start">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[.22em] text-network-yellow uppercase"><span className="size-1.5 rounded-full bg-network-yellow" aria-hidden="true" />
              Explorez le réseau
            </span>
            <h2 className="mt-2 text-[clamp(1.65rem,3vw,2.8rem)] font-bold tracking-[-.035em]">
              Parcourez les catégories
            </h2>
            <p className="mt-2 max-w-xl text-start-cream/65">
              Trouvez facilement les services, opportunités et ressources dont
              vous avez besoin.
            </p>
          </div>
          <Link
            to="/categories"
            className="shrink-0 rounded-lg border border-start-cream/20 px-5 py-3 text-sm font-semibold text-start-cream transition hover:border-start-gold hover:text-start-gold"
          >
            Voir toutes les catégories{" "}
            <span className="ml-3 text-start-gold" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
        <div className="relative z-10 grid grid-cols-[1.4fr_repeat(3,1fr)] gap-x-6 gap-y-12 max-lg:grid-cols-2 max-lg:gap-y-10 max-sm:grid-cols-1 max-sm:gap-y-8">
          {homeCategories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              compact
              featured={index === 0}
              count={
                mockListings.filter(
                  (listing) => listing.categorySlug === category.slug,
                ).length
              }
            />
          ))}
        </div>
      </section>

      <StartNetworkCycle />
    </div>
  );
}
