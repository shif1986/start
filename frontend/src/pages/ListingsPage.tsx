import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { mockListings } from "../data/mockListings";
import { categories } from "../data/categories";
import ListingCard from "../components/ListingCard";
import ThemedPage from "../components/ThemedPage";
import BrandPattern from "../components/BrandPattern";

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
    <ThemedPage ambiance="dark" className="px-[clamp(20px,5vw,72px)] py-[clamp(48px,7vw,96px)]">
      <section className="mb-12 flex items-end justify-between gap-5 max-sm:mb-9 max-sm:items-start">
        <div>
          <span className="text-xs font-extrabold tracking-[.24em] text-start-gold uppercase">Catalogue</span>
          <h1 className="mt-2 font-serif text-[clamp(2.4rem,5vw,4.5rem)]">Rechercher une annonce</h1>
        </div>
        <Link to="/" className="shrink-0 rounded-xl border-start-cream/20 px-4 py-2.5 font-bold text-start-cream/80 [border-style:solid] [border-width:.5px] transition hover:border-start-gold hover:text-start-gold">
          Retour à l’accueil
        </Link>
      </section>

      <section className="mb-12 grid grid-cols-2 gap-7 max-lg:grid-cols-1">
        <div className="relative overflow-hidden rounded-2xl border border-start-gold/20 bg-[radial-gradient(circle_at_15%_20%,rgba(199,164,93,.12),transparent_42%),#17191e] p-7 shadow-[0_20px_55px_rgba(0,0,0,.2)]">
          <BrandPattern variant="chain" className="-right-24 -bottom-44 h-[430px] w-[330px] text-start-gold/[.055] opacity-50 max-sm:opacity-30" />
          <p className="relative text-xs font-extrabold tracking-[.24em] text-start-gold uppercase">Compte gratuit</p>
          <h2 className="relative my-3 text-3xl font-bold tracking-[-.03em]">Créez votre compte pour voir les contacts privés</h2>
          <p className="relative text-start-cream/65">
            Découvrez les profils, les coordonnées et les annonces de votre
            région en quelques clics.
          </p>
          <button type="button" className="relative mt-4 rounded-xl bg-start-gold px-5 py-3 font-bold text-start-ink transition hover:bg-[#d5b66f]">
            Créer un compte
          </button>
        </div>

        <div className="rounded-2xl border border-start-cream/10 bg-[#121418] p-7 shadow-[0_20px_55px_rgba(0,0,0,.18)]">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2">
            {departmentOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={`rounded-xl px-3 py-3 text-sm font-semibold [border-style:solid] [border-width:.5px] transition focus-visible:outline-2 focus-visible:outline-start-gold ${department === item ? "border-start-gold bg-start-gold text-start-ink" : "border-start-cream/10 bg-start-cream/5 text-start-cream/75 hover:border-start-gold hover:text-start-gold"}`}
                onClick={() =>
                  updateParam("department", department === item ? "" : item)
                }
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-[280px_1fr] gap-8 max-lg:grid-cols-1">
        <aside className="h-fit rounded-2xl border border-start-cream/10 bg-[#121418] p-6 shadow-[0_18px_50px_rgba(0,0,0,.18)]">
          <h3 className="mb-5 text-xl font-bold">Filtres</h3>
          <label className="mb-4 flex flex-col gap-2 text-sm font-semibold text-start-cream/75">
            Recherche
            <input className="rounded-xl border border-start-cream/15 bg-[#080c12]/70 px-3 py-3 text-start-cream outline-none focus:border-start-gold"
              type="text"
              placeholder="Mot-clé"
              value={search}
              onChange={(event) => updateParam("q", event.target.value)}
            />
          </label>

          <label className="mb-4 flex flex-col gap-2 text-sm font-semibold text-start-cream/75">
            Département
            <select className="rounded-xl border border-start-cream/15 bg-[#080c12] px-3 py-3 text-start-cream outline-none focus:border-start-gold"
              value={department}
              onChange={(event) =>
                updateParam("department", event.target.value)
              }
            >
              <option value="">Tous</option>
              {departmentOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-start-cream/75">
            Catégorie
            <select className="rounded-xl border border-start-cream/15 bg-[#080c12] px-3 py-3 text-start-cream outline-none focus:border-start-gold"
              value={category}
              onChange={(event) => updateParam("category", event.target.value)}
            >
              <option value="">Toutes</option>
              {categories.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </aside>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
          {filteredListings.length > 0 ? (
            filteredListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
          ) : (
            <div className="rounded-2xl border border-dashed border-start-cream/20 p-10 text-center text-start-cream/65">
              <h3>Aucune annonce trouvée</h3>
              <p>Essayez un autre mot-clé ou un autre département.</p>
            </div>
          )}
        </div>
      </div>
    </ThemedPage>
  );
}
