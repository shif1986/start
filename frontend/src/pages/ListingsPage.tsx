import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { mockListings } from "../data/mockListings";

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
        !category || listing.category.toLowerCase() === category.toLowerCase();

      return matchesQuery && matchesDepartment && matchesCategory;
    });
  }, [search, department, category]);

  const departmentOptions = [
    ...new Set(mockListings.map((listing) => listing.department)),
  ];

  const categories = [
    ...new Set(mockListings.map((listing) => listing.category)),
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
    <div className="rounded-3xl bg-[#0e121e] px-[clamp(20px,4vw,56px)] py-12">
      <section className="mb-8 flex items-end justify-between gap-5 max-sm:items-start">
        <div>
          <span className="text-xs font-extrabold tracking-[.24em] text-start-gold uppercase">Catalogue</span>
          <h1 className="mt-2 font-serif text-[clamp(2.4rem,5vw,4.5rem)]">Rechercher une annonce</h1>
        </div>
        <Link to="/" className="shrink-0 rounded-xl border border-start-cream/20 px-4 py-2.5 font-bold text-start-cream/80 transition hover:border-start-gold hover:text-start-gold">
          Retour à l’accueil
        </Link>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-5 max-lg:grid-cols-1">
        <div className="rounded-2xl border border-start-cream/10 bg-start-cream/5 p-7">
          <p className="text-xs font-extrabold tracking-[.24em] text-start-gold uppercase">Compte gratuit</p>
          <h2 className="my-3 font-serif text-3xl">Créez votre compte pour voir les contacts privés</h2>
          <p className="text-start-cream/65">
            Découvrez les profils, les coordonnées et les annonces de votre
            région en quelques clics.
          </p>
          <button type="button" className="mt-4 rounded-xl bg-start-gold px-5 py-3 font-bold text-start-ink transition hover:bg-[#d5b66f]">
            Créer un compte
          </button>
        </div>

        <div className="rounded-2xl border border-start-cream/10 bg-start-cream/5 p-7">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2">
            {departmentOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-start-gold ${department === item ? "border-start-gold bg-start-gold text-start-ink" : "border-start-cream/10 bg-start-cream/5 text-start-cream/75 hover:border-start-gold hover:text-start-gold"}`}
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

      <div className="grid grid-cols-[280px_1fr] gap-6 max-lg:grid-cols-1">
        <aside className="h-fit rounded-2xl border border-start-cream/10 bg-start-cream/5 p-6">
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
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </aside>

        <div className="grid gap-4">
          {filteredListings.length > 0 ? (
            filteredListings.map((listing) => (
              <article key={listing.id} className="rounded-2xl border border-start-cream/10 bg-start-cream/5 p-6 transition hover:border-start-gold/45">
                <div className="mb-3 flex justify-between gap-4 text-xs font-bold tracking-wide text-start-gold uppercase">
                  <span>{listing.category}</span>
                  <span>{listing.department}</span>
                </div>
                <h3 className="mb-2 text-xl font-bold">{listing.title}</h3>
                <p className="text-start-cream/65">{listing.description}</p>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <strong>
                    {listing.price ? `${listing.price} €` : "Prix libre"}
                  </strong>
                  <Link className="font-bold text-start-gold hover:underline" to={`/annonce/${listing.id}`}>Voir plus</Link>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-start-cream/20 p-10 text-center text-start-cream/65">
              <h3>Aucune annonce trouvée</h3>
              <p>Essayez un autre mot-clé ou un autre département.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
