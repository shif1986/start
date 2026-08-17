import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FranceListingsMap from "../components/FranceListingsMap";
import { mockListings } from "../data/mockListings";

const featuredListings = mockListings.slice(0, 5);

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
    <section className="search-by-location">
      <div className="search-copy">
        <span className="eyebrow">RÉSEAU CHRÉTIEN LOCAL</span>

        <h1 className="hero-title">
          <span className="title-line">CONNECTER</span>
          <span className="title-line title-line-soft">
            <span className="title-light">POUR</span>
            <span className="title-script">Grandir</span>
          </span>
          <span className="title-line">ENSEMBLE</span>
        </h1>

        <p className="hero-subtitle">
          Une plateforme qui met en relation les professionnels et particuliers
          chrétiens pour développer un réseau utile, local et inspiré par la
          foi.
        </p>

        <div className="search-box hero-search">
          <input
            type="text"
            placeholder="Que recherchez-vous ?"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSearch();
            }}
          />
          <button type="button" onClick={onSearch} aria-label="Rechercher">
            <svg viewBox="0 0 24 24" aria-hidden="true">
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
      </div>

      <div className="location-map-panel">
        <FranceListingsMap
          listings={mockListings}
          selectedDepartment={selectedDepartment}
          onDepartmentSelect={onDepartmentSelect}
        />
      </div>

      <div className="scroll-cue" aria-label="Découvrir la suite">
        <span>DÉCOUVRIR</span>
        <span className="scroll-arrow">↓</span>
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
    <div className="page home-page">
      <SearchByLocation
        query={query}
        selectedDepartment={selectedDepartment}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        onDepartmentSelect={handleDepartmentSelect}
      />

      <section className="listing-section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Annonces récentes</span>
            <h2>Découvrir les derniers services</h2>
          </div>
          <Link to="/annonces" className="link-button">
            Voir plus
          </Link>
        </div>

        <div className="listing-grid">
          {featuredListings.map((listing) => (
            <article key={listing.id} className="listing-card">
              <span className="listing-tag">{listing.category}</span>
              <h3>{listing.title}</h3>
              <p>
                {listing.city} • {listing.department}
              </p>
              <div className="listing-meta">
                <strong>
                  {listing.price ? `${listing.price}€` : "Prix libre"}
                </strong>
                <span>{listing.professional.name}</span>
              </div>
              <Link to={`/annonce/${listing.id}`} className="card-link">
                Voir l’annonce
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
