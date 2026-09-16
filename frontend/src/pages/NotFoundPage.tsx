import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="grid min-h-[55vh] place-content-center gap-5 rounded-3xl border border-start-cream/10 bg-[#171a21] px-6 text-center text-start-cream">
      <p className="text-sm font-bold tracking-[.2em] text-start-gold uppercase">Erreur 404</p>
      <h1 className="text-[clamp(2rem,5vw,4rem)] font-bold">Page introuvable</h1>
      <p className="mx-auto max-w-xl text-start-cream/70">Cette page n’existe pas ou n’est plus disponible.</p>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        <Link to="/" className="rounded-xl bg-start-gold px-5 py-3 font-bold text-start-ink">Retour à l’accueil</Link>
        <Link to="/annonces" className="rounded-xl border border-start-cream/20 px-5 py-3 font-semibold">Voir les annonces</Link>
      </div>
    </section>
  );
}
