import { Link } from "react-router-dom";
import ThemedPage from "../components/ThemedPage";

const legalSections = [
  {
    title: "Éditeur du site",
    content: (
      <dl className="mt-5 grid gap-3 text-sm leading-6 text-start-cream/65">
        <div><dt className="font-semibold text-start-cream/85">Nom officiel</dt><dd>START RESEAU CHRETIEN</dd></div>
        <div><dt className="font-semibold text-start-cream/85">Forme juridique</dt><dd>Association déclarée régie par la loi du 1er juillet 1901</dd></div>
        <div><dt className="font-semibold text-start-cream/85">Numéro RNA</dt><dd>W842013429</dd></div>
        <div><dt className="font-semibold text-start-cream/85">Siège social</dt><dd>103 rue du Creuset, 84270 Vedène, France</dd></div>
        <div><dt className="font-semibold text-start-cream/85">Contact</dt><dd><Link to="/contact" className="text-start-gold underline decoration-start-gold/35 underline-offset-4 hover:decoration-start-gold">Formulaire de contact</Link></dd></div>
      </dl>
    ),
  },
  {
    title: "Direction de la publication",
    content: <p className="mt-5 leading-7 text-start-cream/65">Directeur de la publication : Shifnas SALEEM.</p>,
  },
  {
    title: "Hébergement",
    content: (
      <div className="mt-5 text-sm leading-6 text-start-cream/65">
        <p>Netlify, Inc.<br />101 2nd Street<br />San Francisco, CA 94105<br />États-Unis</p>
        <a href="https://www.netlify.com/" target="_blank" rel="noreferrer" className="mt-3 inline-flex text-start-gold underline decoration-start-gold/35 underline-offset-4 hover:decoration-start-gold">www.netlify.com</a>
      </div>
    ),
  },
  {
    title: "Objet du service",
    content: <p className="mt-5 leading-7 text-start-cream/65">START est une plateforme de mise en relation et de diffusion d’annonces destinée aux particuliers et aux professionnels. Les professionnels restent responsables des informations, offres et contenus qu’ils publient.</p>,
  },
  {
    title: "Propriété intellectuelle",
    content: <p className="mt-5 leading-7 text-start-cream/65">Sauf mention contraire, la structure du site, son identité visuelle, ses textes et ses éléments graphiques sont protégés. Toute reproduction ou réutilisation non autorisée est interdite. Les marques, images et contenus appartenant à des tiers demeurent la propriété de leurs titulaires respectifs.</p>,
  },
  {
    title: "Responsabilité",
    content: <p className="mt-5 leading-7 text-start-cream/65">START s’efforce de proposer des informations accessibles et à jour, sans garantir l’absence totale d’erreur ou d’interruption. Les annonces sont fournies par leurs auteurs. Chaque utilisateur doit vérifier les informations utiles avant de s’engager ou d’effectuer une transaction.</p>,
  },
  {
    title: "Données personnelles et cookies",
    content: <p className="mt-5 leading-7 text-start-cream/65">Les données sont limitées à ce qui est nécessaire au fonctionnement du service, à la gestion des comptes, des annonces et des demandes de contact. Consultez notre <Link to="/confidentialite" className="text-start-gold underline decoration-start-gold/35 underline-offset-4">politique de confidentialité</Link> et notre <Link to="/cookies" className="text-start-gold underline decoration-start-gold/35 underline-offset-4">politique relative aux cookies</Link> pour connaître les traitements, les durées de conservation et les modalités d’exercice de vos droits.</p>,
  },
];

export default function LegalNoticePage() {
  return (
    <ThemedPage ambiance="dark" showPattern={false} className="discreet-network-background px-[clamp(20px,5vw,72px)] py-[clamp(32px,5vw,72px)]">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-3xl text-center">
          <span className="mx-auto block h-px w-24 bg-start-gold/70" aria-hidden="true" />
          <span className="mx-auto mt-6 flex w-fit items-center gap-3" aria-hidden="true">
            <span className="size-2 rounded-full bg-network-blue" />
            <span className="size-2 rounded-full bg-network-yellow" />
            <span className="size-2 rounded-full bg-network-red" />
          </span>
          <span className="mt-5 block text-[.65rem] font-bold tracking-[.2em] text-start-gold uppercase">Informations juridiques</span>
          <h1 className="mt-6 text-[clamp(1.65rem,3vw,2.8rem)] leading-[1.08] font-bold tracking-[-.035em]">Mentions légales</h1>
          <p className="mx-auto mt-5 max-w-2xl text-[clamp(.9rem,1.2vw,1rem)] leading-7 text-start-cream/62">Informations relatives à l’édition, l’hébergement et l’utilisation du site START Réseau Chrétien.</p>
        </header>

        <div className="mt-[clamp(48px,7vw,80px)] grid gap-5 md:grid-cols-2">
          {legalSections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-start-cream/10 bg-[#121418]/92 p-[clamp(22px,3vw,32px)] shadow-[0_22px_60px_rgba(0,0,0,.2)]">
              <span className="block h-px w-10 bg-start-gold/65" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-semibold">{section.title}</h2>
              {section.content}
            </article>
          ))}
        </div>

        <section className="mt-8 border-t border-start-cream/10 pt-8 text-center">
          <h2 className="text-xl font-semibold">Nous contacter</h2>
          <p className="mx-auto mt-3 max-w-2xl leading-7 text-start-cream/60">Pour signaler une information incorrecte ou exercer vos droits, utilisez le formulaire de contact.</p>
          <Link to="/contact" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-start-gold/50 px-6 py-3 font-semibold text-start-gold transition hover:bg-start-gold hover:text-start-ink">Accéder au formulaire</Link>
          <p className="mt-7 text-xs text-start-cream/38">Dernière mise à jour : 26 août 2026</p>
        </section>
      </div>
    </ThemedPage>
  );
}
