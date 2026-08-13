import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mockListings } from "../data/mockListings";

const featuredListings = mockListings.slice(0, 5);

const franceDepartments = [
  { name: "Paris", x: 50, y: 18 },
  { name: "Rhône", x: 72, y: 33 },
  { name: "Gironde", x: 24, y: 46 },
  { name: "Bouches-du-Rhône", x: 78, y: 60 },
  { name: "Loire-Atlantique", x: 38, y: 54 },
  { name: "Martinique", x: 18, y: 80 },
  { name: "Guadeloupe", x: 28, y: 86 },
  { name: "Réunion", x: 86, y: 82 },
  { name: "Mayotte", x: 92, y: 88 },
  { name: "Nouvelle-Calédonie", x: 76, y: 92 },
];

function FranceDepartmentMap({
  onSelect,
}: {
  onSelect: (department: string) => void;
}) {
  return (
    <div
      className="france-department-map"
      aria-label="Carte des départements de France et des DOM-TOM"
    >
      <svg
        className="france-svg"
        viewBox="0 0 950 760"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          className="france-shape"
          d="M165 120 L200 90 L244 74 L286 78 L323 61 L375 68 L415 92 L445 92 L472 102 L505 105 L541 126 L557 142 L589 176 L603 230 L620 247 L616 273 L633 286 L627 333 L646 365 L635 404 L640 445 L611 477 L618 505 L590 534 L602 560 L565 586 L555 615 L527 630 L484 646 L448 640 L418 621 L379 625 L356 585 L325 571 L306 585 L280 572 L254 540 L231 531 L214 496 L167 470 L145 422 L130 389 L103 349 L92 321 L82 294 L88 258 L101 214 L103 181 L125 153 L143 130 Z"
        />
        <path
          className="france-shape island"
          d="M530 651 L542 639 L562 644 L576 660 L565 682 L545 690 L528 680 Z"
        />
        <path
          className="france-shape island"
          d="M117 504 L128 495 L144 498 L154 512 L148 531 L133 539 L118 525 Z"
        />
        <path
          className="france-shape island"
          d="M652 606 L669 598 L685 606 L687 621 L675 636 L659 635 L648 621 Z"
        />
        <path
          className="france-shape island"
          d="M710 680 L728 675 L740 690 L734 707 L715 714 L700 698 Z"
        />
      </svg>

      {franceDepartments.map((department) => (
        <button
          key={department.name}
          type="button"
          className="map-pin"
          style={{
            left: `${department.x}%`,
            top: `${department.y}%`,
          }}
          onClick={() => onSelect(department.name)}
        >
          {department.name}
        </button>
      ))}
    </div>
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
    <section className="search-by-location">
      <div className="search-copy">
        <span className="eyebrow">Réseau chrétien local</span>
        <h1 className="hero-title">START Réseau Chrétien</h1>
        <p>
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

        <div className="department-pills" aria-label="Départements">
          {franceDepartments.map((department) => (
            <button
              key={department.name}
              type="button"
              className={`chip${selectedDepartment === department.name ? " selected" : ""}`}
              onClick={() => onDepartmentSelect(department.name)}
            >
              {department.name}
            </button>
          ))}
        </div>
      </div>

      <div className="location-map-panel">
        <FranceDepartmentMap onSelect={onDepartmentSelect} />
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
    setSelectedDepartment(department);
    const params = new URLSearchParams();

    if (query.trim()) params.set("q", query.trim());
    params.set("department", department);

    navigate(`/annonces?${params.toString()}`);
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
