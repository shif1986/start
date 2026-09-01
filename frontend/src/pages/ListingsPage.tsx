import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { mockListings } from "../data/mockListings";
import { categories } from "../data/categories";
import { departments, swissCantons } from "../data/departments";
import ListingCard from "../components/ListingCard";
import ThemedPage from "../components/ThemedPage";
import ListingsMap from "../components/ListingsMap";
import { normalizeListingFilters } from "../features/listings/model/listing-filters";
import { useListings } from "../features/listings/hooks/use-listings";
import { getDataSource } from "../lib/data-source";

const filterControlClass =
  "h-12 w-full box-border rounded-xl border border-start-cream/15 bg-[#080c12] px-4 py-0 text-start-cream outline-none transition focus:border-start-gold max-sm:h-14";
const LISTINGS_PER_PAGE = 4;

function SelectChevron() {
  return (
    <svg className="pointer-events-none absolute top-1/2 right-5 size-4 -translate-y-1/2 text-start-cream" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m3 6 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dataSource = getDataSource();

  const search = searchParams.get("q") ?? "";
  const department = searchParams.get("department") ?? "";
  const country = searchParams.get("country") ?? "";
  const category = searchParams.get("category") ?? "";
  const requestedPage = Number.parseInt(searchParams.get("page") ?? "1", 10);

  const staticFilteredListings = useMemo(() => {
    return mockListings.filter((listing) => {
      const matchesQuery =
        !search ||
        [listing.title, listing.description, listing.category, listing.city]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesDepartment =
        !department ||
        listing.department.toLowerCase() === department.toLowerCase();

      const matchesCountry =
        !country || (listing.country ?? "France") === country;

      const matchesCategory =
        !category ||
        listing.categorySlug === category ||
        listing.category.toLowerCase() === category.toLowerCase();

      return matchesQuery && matchesCountry && matchesDepartment && matchesCategory;
    });
  }, [search, country, department, category]);

  const listingFilters = useMemo(() => normalizeListingFilters({
    search,
    category,
    country,
    subdivision: department,
    page: requestedPage,
    pageSize: LISTINGS_PER_PAGE,
  }), [category, country, department, requestedPage, search]);
  const listingsQuery = useListings(listingFilters, { enabled: dataSource === "supabase" });
  const catalogStateQuery = useListings({
    search: null,
    category: null,
    countryCode: null,
    subdivision: null,
    page: 1,
    pageSize: 1,
  }, { enabled: dataSource === "supabase" });
  const useDemoCatalog = dataSource === "static"
    || (!catalogStateQuery.isPending && !catalogStateQuery.isError && (catalogStateQuery.data?.totalCount ?? 0) === 0);
  const filteredListings = useDemoCatalog ? staticFilteredListings : listingsQuery.data?.items ?? [];
  const totalCount = useDemoCatalog ? staticFilteredListings.length : listingsQuery.data?.totalCount ?? 0;

  const locationOptions = country === "Suisse" ? swissCantons : departments;

  const pageCount = Math.max(1, Math.ceil(totalCount / LISTINGS_PER_PAGE));
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), pageCount)
    : 1;
  const visibleListings = !useDemoCatalog ? filteredListings : filteredListings.slice(
      (currentPage - 1) * LISTINGS_PER_PAGE,
      currentPage * LISTINGS_PER_PAGE,
    );

  useEffect(() => {
    if (requestedPage === currentPage) return;
    const next = new URLSearchParams(searchParams);
    if (currentPage === 1) next.delete("page");
    else next.set("page", currentPage.toString());
    setSearchParams(next, { replace: true });
  }, [currentPage, requestedPage, searchParams, setSearchParams]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    next.delete("page");

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    setSearchParams(next);
  }

  function updateCountry(value: string) {
    const next = new URLSearchParams(searchParams);
    next.delete("page");
    next.delete("department");
    if (value) next.set("country", value);
    else next.delete("country");
    setSearchParams(next);
  }

  function goToPage(page: number) {
    const next = new URLSearchParams(searchParams);
    if (page === 1) next.delete("page");
    else next.set("page", page.toString());
    setSearchParams(next);
    window.requestAnimationFrame(() => {
      document.getElementById("annonces-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <ThemedPage ambiance="dark" className="px-[clamp(8px,2vw,28px)] pt-[clamp(8px,2vw,24px)] pb-[clamp(44px,7vw,96px)]">
      <ListingsMap listings={filteredListings} selectedCountry={country} />

      <section className="relative z-10 mx-auto mt-10 mb-16 w-[min(94%,1120px)] rounded-2xl border border-start-gold/25 bg-[#121418]/95 p-5 shadow-[0_22px_65px_rgba(0,0,0,.35)] backdrop-blur-xl max-md:mt-7 max-md:mb-12 max-md:w-full max-sm:p-4">
        <div className="grid grid-cols-[1.25fr_1fr_.8fr_1fr_auto] items-end gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1">
          <label className="flex flex-col gap-2 text-xs font-semibold tracking-wide text-start-cream/60 uppercase">
            Recherche
            <input className={`${filterControlClass} placeholder:text-start-cream/30`} type="search" placeholder="Métier, service, annonce..." value={search} onChange={(event) => updateParam("q", event.target.value)} />
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold tracking-wide text-start-cream/60 uppercase">
            Catégorie
            <span className="relative block">
              <select className={`${filterControlClass} appearance-none pr-12`} value={category} onChange={(event) => updateParam("category", event.target.value)}>
                <option value="">Toutes les catégories</option>
                {categories.map((item) => <option key={item.id} value={item.slug}>{item.label}</option>)}
              </select>
              <SelectChevron />
            </span>
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold tracking-wide text-start-cream/60 uppercase">
            Pays
            <span className="relative block">
              <select className={`${filterControlClass} appearance-none pr-12`} value={country} onChange={(event) => updateCountry(event.target.value)}>
                <option value="">Tous les pays</option>
                <option value="France">France</option>
                <option value="Suisse">Suisse</option>
              </select>
              <SelectChevron />
            </span>
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold tracking-wide text-start-cream/60 uppercase">
            {country === "Suisse" ? "Canton" : "Département"}
            <span className="relative block">
              <select className={`${filterControlClass} appearance-none pr-12`} value={department} onChange={(event) => updateParam("department", event.target.value)}>
                <option value="">{country === "Suisse" ? "Toute la Suisse" : "Toute la France"}</option>
                {locationOptions.map((item) => <option key={item.code} value={item.name}>{item.code} · {item.name}</option>)}
              </select>
              <SelectChevron />
            </span>
          </label>
          <button type="button" className="h-12 rounded-xl border border-network-red/45 px-5 py-0 font-semibold text-network-red transition hover:bg-network-red hover:text-start-ink max-sm:h-14 max-sm:w-full" onClick={() => setSearchParams({})}>
            Réinitialiser
          </button>
        </div>
      </section>

      <section id="annonces-results" className="scroll-mt-28">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[.2em] text-network-blue uppercase"><span className="size-1.5 rounded-full bg-network-blue" aria-hidden="true" />Résultats</span>
            <h2 className="mt-2 text-2xl font-semibold">{totalCount} annonce{totalCount > 1 ? "s" : ""} disponible{totalCount > 1 ? "s" : ""}</h2>
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-x-5 gap-y-12 max-md:gap-y-9 max-sm:gap-y-7">
          {dataSource === "supabase" && (listingsQuery.isPending || catalogStateQuery.isPending) ? (
            Array.from({ length: LISTINGS_PER_PAGE }, (_, index) => <span key={index} className="h-[390px] animate-pulse rounded-xl border border-start-cream/10 bg-start-cream/[.04]" aria-hidden="true" />)
          ) : dataSource === "supabase" && (listingsQuery.isError || catalogStateQuery.isError) ? (
            <div className="rounded-2xl border border-network-red/30 bg-network-red/[.06] p-10 text-center text-start-cream" role="alert">Impossible de charger les annonces. Veuillez réessayer dans quelques instants.</div>
          ) : totalCount > 0 ? (
            visibleListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
          ) : (
            <div className="rounded-2xl border border-dashed border-start-cream/20 p-10 text-center text-start-cream/65">
              <h3>Aucune annonce trouvée</h3>
              <p>Essayez un autre mot-clé ou un autre département.</p>
            </div>
          )}
        </div>

        {totalCount > 0 && pageCount > 1 && (
          <nav className="mt-12 flex flex-col items-center gap-5" aria-label="Pagination des annonces">
            {currentPage < pageCount && (
              <button
                type="button"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-start-gold px-7 font-bold text-start-ink transition hover:-translate-y-0.5 hover:bg-start-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-start-gold"
                onClick={() => goToPage(currentPage + 1)}
              >
                Voir les autres annonces <span className="ml-2" aria-hidden="true">→</span>
              </button>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`inline-flex size-11 items-center justify-center rounded-full border text-sm font-bold transition ${page === currentPage ? "border-start-gold bg-start-gold text-start-ink" : "border-start-cream/20 text-start-cream/70 hover:border-start-gold hover:text-start-gold"}`}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? "page" : undefined}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
          </nav>
        )}
      </section>
    </ThemedPage>
  );
}
