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
    <div className="page listings-page">
      <section className="catalog-header">
        <div>
          <span className="eyebrow">Catalogue</span>
          <h1>Rechercher une annonce</h1>
        </div>
        <Link to="/" className="link-button secondary">
          Retour à l’accueil
        </Link>
      </section>

      <section className="catalog-hero">
        <div className="cta-panel">
          <p className="eyebrow">Compte gratuit</p>
          <h2>Créez votre compte pour voir les contacts privés</h2>
          <p>
            Découvrez les profils, les coordonnées et les annonces de votre
            région en quelques clics.
          </p>
          <button type="button" className="btn btn-primary">
            Créer un compte
          </button>
        </div>

        <div className="department-map-panel">
          <div className="department-grid">
            {departmentOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={`department-tile${department === item ? " active" : ""}`}
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

      <div className="catalog-layout">
        <aside className="filters-panel">
          <h3>Filtres</h3>
          <label>
            Recherche
            <input
              type="text"
              placeholder="Mot-clé"
              value={search}
              onChange={(event) => updateParam("q", event.target.value)}
            />
          </label>

          <label>
            Département
            <select
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

          <label>
            Catégorie
            <select
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

        <div className="catalog-results">
          {filteredListings.length > 0 ? (
            filteredListings.map((listing) => (
              <article key={listing.id} className="result-card">
                <div className="result-topline">
                  <span>{listing.category}</span>
                  <span>{listing.department}</span>
                </div>
                <h3>{listing.title}</h3>
                <p>{listing.description}</p>
                <div className="result-footer">
                  <strong>
                    {listing.price ? `${listing.price} €` : "Prix libre"}
                  </strong>
                  <Link to={`/annonce/${listing.id}`}>Voir plus</Link>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <h3>Aucune annonce trouvée</h3>
              <p>Essayez un autre mot-clé ou un autre département.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
