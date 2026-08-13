export default function AboutPage() {
  return (
    <div className="page simple-page">
      <h1>À propos</h1>
      <p>
        START Réseau Chrétien est une plateforme locale qui met en relation les
        professionnels, les familles et les institutions chrétiennes pour servir
        la communauté avec bienveillance, proximité et excellence.
      </p>

      <div className="about-grid">
        <div className="about-card">
          <h3>Notre vision</h3>
          <p>
            Créer un espace où la foi, le service et le tissu local s’unissent
            pour renforcer les initiatives chrétiennes dans chaque région.
          </p>
        </div>
        <div className="about-card">
          <h3>Notre mission</h3>
          <p>
            Faciliter les échanges utiles entre particuliers et professionnels,
            tout en gardant une expérience simple, respectueuse et inspirante.
          </p>
        </div>
      </div>

      <div className="video-placeholder">
        Vidéo YouTube de présentation / vision du réseau
      </div>
    </div>
  );
}
