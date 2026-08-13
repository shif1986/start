import { Link, useParams } from "react-router-dom";
import { mockListings } from "../data/mockListings";

export default function ListingDetailPage() {
  const { slug } = useParams();
  const listing = mockListings.find((item) => item.id === slug);

  if (!listing) {
    return (
      <div className="page empty-page">
        <h1>Annonce introuvable</h1>
        <Link to="/annonces" className="link-button">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="page detail-page">
      <Link to="/annonces" className="link-button secondary">
        ← Retour à la recherche
      </Link>

      <div className="detail-card">
        <div className="detail-header">
          <span className="eyebrow">{listing.category}</span>
          <h1>{listing.title}</h1>
          <p>
            {listing.city} • {listing.department}
          </p>
        </div>

        <div className="detail-body">
          <div className="detail-content">
            <p>{listing.description}</p>

            <div className="detail-meta-grid">
              <div>
                <span className="meta-label">Localisation</span>
                <strong>{listing.city}</strong>
              </div>
              <div>
                <span className="meta-label">Département</span>
                <strong>{listing.department}</strong>
              </div>
              <div>
                <span className="meta-label">Prix</span>
                <strong>
                  {listing.price ? `${listing.price} €` : "Prix libre"}
                </strong>
              </div>
            </div>

            <div className="video-placeholder">Vidéo / galerie annonce</div>
          </div>

          <aside className="professional-panel">
            <h3>{listing.professional.name}</h3>
            <p>{listing.professional.role}</p>
            <ul>
              <li>Tel : {listing.professional.phone}</li>
              <li>Email : {listing.professional.email}</li>
            </ul>
            <button type="button" className="btn btn-primary">
              Contacter
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
