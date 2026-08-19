import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { mockListings } from "../data/mockListings";
import { categories } from "../data/categories";
import ListingCard from "../components/ListingCard";
import ThemedPage from "../components/ThemedPage";
import ListingsMap from "../components/ListingsMap";

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("q") ?? "";
  const department = searchParams.get("department") ?? "";
  const category = searchParams.get("category") ?? "";

  const filteredListings = useMemo(() => {
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

      const matchesCategory =
        !category ||
        listing.categorySlug === category ||
        listing.category.toLowerCase() === category.toLowerCase();

      return matchesQuery && matchesDepartment && matchesCategory;
    });
  }, [search, department, category]);

  const departmentOptions = [
    ...new Set(mockListings.map((listing) => listing.department)),
  ];

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    setSearchParams(next);
  }

  return (
    <ThemedPage ambiance="dark" className="px-[clamp(8px,2vw,28px)] pt-[clamp(8px,2vw,24px)] pb-[clamp(44px,7vw,96px)]">
      <ListingsMap listings={filteredListings} />

      <section className="relative z-10 mx-auto mt-10 mb-16 w-[min(94%,1120px)] rounded-2xl border border-start-gold/25 bg-[#121418]/95 p-5 shadow-[0_22px_65px_rgba(0,0,0,.35)] backdrop-blur-xl max-md:mt-7 max-md:mb-12 max-md:w-full max-sm:p-4">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_auto] items-end gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <label className="flex flex-col gap-2 text-xs font-semibold tracking-wide text-start-cream/60 uppercase">
            Recherche
            <input className="min-h-12 rounded-xl border border-start-cream/15 bg-[#080c12] px-4 text-start-cream outline-none placeholder:text-start-cream/30 focus:border-start-gold" type="search" placeholder="Métier, service, annonce..." value={search} onChange={(event) => updateParam("q", event.target.value)} />
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold tracking-wide text-start-cream/60 uppercase">
            Catégorie
            <select className="min-h-12 rounded-xl border border-start-cream/15 bg-[#080c12] px-4 text-start-cream outline-none focus:border-start-gold" value={category} onChange={(event) => updateParam("category", event.target.value)}>
              <option value="">Toutes les catégories</option>
              {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold tracking-wide text-start-cream/60 uppercase">
            Localisation
            <select className="min-h-12 rounded-xl border border-start-cream/15 bg-[#080c12] px-4 text-start-cream outline-none focus:border-start-gold" value={department} onChange={(event) => updateParam("department", event.target.value)}>
              <option value="">Toute la France</option>
              {departmentOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <button type="button" className="min-h-12 rounded-xl border border-start-gold/60 px-5 font-semibold text-start-gold transition hover:bg-start-gold hover:text-start-ink max-sm:w-full" onClick={() => setSearchParams({})}>
            Réinitialiser
          </button>
        </div>
      </section>

      <section>
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-[.2em] text-start-gold uppercase">Résultats</span>
            <h2 className="mt-2 text-2xl font-semibold">{filteredListings.length} annonce{filteredListings.length > 1 ? "s" : ""} disponible{filteredListings.length > 1 ? "s" : ""}</h2>
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-x-5 gap-y-12 max-md:gap-y-9 max-sm:gap-y-7">
          {filteredListings.length > 0 ? (
            filteredListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
          ) : (
            <div className="rounded-2xl border border-dashed border-start-cream/20 p-10 text-center text-start-cream/65">
              <h3>Aucune annonce trouvée</h3>
              <p>Essayez un autre mot-clé ou un autre département.</p>
            </div>
          )}
        </div>
      </section>
    </ThemedPage>
  );
}
