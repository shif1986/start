import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FranceListingsMap from "../components/FranceListingsMap";
import { mockListings } from "../data/mockListings";

const featuredListings = mockListings.slice(0, 5);

function HeroGradientBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(199,164,93,.25)_0%,rgba(199,164,93,.09)_28%,transparent_58%),linear-gradient(145deg,rgba(14,18,30,.15)_0%,rgba(5,8,13,.82)_72%)]"
      aria-hidden="true"
    ></div>
  );
}

function SearchByLocation({
  query,
  selectedDepartment,
  onQueryChange,
  onSearch,
  onDepartmentSelect,
}: {
  query: string;
  selectedDepartment: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onDepartmentSelect: (department: string) => void;
}) {
  return (
    <section className="relative grid min-h-[calc(100svh-100px)] grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] items-center gap-[clamp(24px,4vw,64px)] overflow-hidden rounded-3xl bg-[#0e121e] px-[clamp(24px,5vw,72px)] pt-[clamp(125px,16vh,155px)] pb-[clamp(48px,6vh,72px)] max-lg:min-h-0 max-lg:grid-cols-1">
      <HeroGradientBackdrop />

      <div className="absolute top-[clamp(28px,5vh,48px)] left-1/2 z-20 flex w-[min(480px,calc(100%-48px))] -translate-x-1/2 overflow-hidden rounded-xl border border-start-cream/10 bg-[#090e12]/30 shadow-lg backdrop-blur-sm focus-within:border-start-gold/70">
        <input
          className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-start-cream outline-none placeholder:text-start-cream/40"
          type="text"
          placeholder="Que recherchez-vous ?"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSearch();
          }}
        />
        <button
          className="m-1 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-start-gold text-start-ink transition hover:bg-[#d5b66f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-start-cream"
          type="button"
          onClick={onSearch}
          aria-label="Rechercher"
        >
          <svg className="size-4.5" viewBox="0 0 24 24" aria-hidden="true">
            <circle
              cx="11"
              cy="11"
              r="5.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M16 16L21 21"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="relative z-10 max-w-2xl">
        <span className="text-xs font-extrabold tracking-[.28em] text-start-cream">
          RÉSEAU CHRÉTIEN LOCAL
        </span>

        <h1 className="my-6 flex flex-col items-start font-sans text-[clamp(3.4rem,6.2vw,6.7rem)] leading-none font-extrabold tracking-[-.06em] text-start-cream">
          <span>START</span>
          <span className="mt-3 text-[.4em] font-semibold tracking-[.12em]">
            RÉSEAU
          </span>
          <span className="mt-1.5 text-[.4em] font-semibold tracking-[.12em]">
            CHRÉTIEN
          </span>
          <span className="mt-1.5 text-[.4em] font-semibold tracking-[.12em] text-start-gold">
            PROFESSIONNEL.
          </span>
        </h1>

        <p className="max-w-xl border-l-2 border-start-gold/70 pl-5 font-sans text-[clamp(1rem,1.35vw,1.28rem)] leading-[1.7] font-light tracking-[-.015em] text-start-cream/70">
          Valoriser votre entreprise
          <br />
          <span className="font-medium text-start-cream/90">
            et soutenir l’économie qui porte nos valeurs.
          </span>
        </p>

        <div className="mt-5 flex items-center gap-4 max-sm:flex-col max-sm:items-start">
          <Link
            to="/publier"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-start-gold bg-transparent px-5 font-bold text-start-gold transition hover:-translate-y-0.5 hover:bg-start-gold/10"
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

      <div className="relative z-10 mx-auto w-full max-w-[680px] min-w-0">
        <div className="mx-auto w-[88%] max-sm:w-full">
          <FranceListingsMap
            listings={mockListings}
            selectedDepartment={selectedDepartment}
            onDepartmentSelect={onDepartmentSelect}
          />
        </div>
      </div>

      <div
        className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-[.65rem] tracking-[.25em] text-start-cream/50"
        aria-label="Découvrir la suite"
      >
        <span>DÉCOUVRIR</span>
        <span className="animate-bounce text-xl text-start-gold">↓</span>
      </div>
    </section>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();

    if (query.trim()) params.set("q", query.trim());
    if (selectedDepartment) params.set("department", selectedDepartment);

    navigate(`/annonces${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function handleDepartmentSelect(department: string) {
    setSelectedDepartment((current) =>
      current === department ? "" : department,
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-[#0e121e]">
      <SearchByLocation
        query={query}
        selectedDepartment={selectedDepartment}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        onDepartmentSelect={handleDepartmentSelect}
      />

      <section className="px-[clamp(20px,4vw,56px)] py-16">
        <div className="mb-8 flex items-end justify-between gap-5 max-sm:items-start">
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
            className="shrink-0 rounded-xl border border-start-gold px-4 py-2.5 font-bold text-start-gold transition hover:bg-start-gold hover:text-start-ink"
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
