export default function DonationsPage() {
  return (
    <div className="page simple-page">
      <h1>Faire un don</h1>
      <p>
        Soutenez la mission du réseau chrétien local pour accompagner les
        projets, les familles et les initiatives de proximité.
      </p>

      <div className="donation-panel">
        <div>
          <span className="meta-label">Impact</span>
          <strong>Accompagnement local</strong>
        </div>
        <div>
          <span className="meta-label">Objectif</span>
          <strong>Renforcer les projets de proximité</strong>
        </div>
      </div>

      <button type="button" className="btn btn-primary">
        Faire un don
      </button>
    </div>
  );
}
