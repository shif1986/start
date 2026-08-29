import { Link } from "react-router-dom";
import LegalDocumentPage, { LegalSection } from "../components/LegalDocumentPage";

export default function CookiePolicyPage() {
  return (
    <LegalDocumentPage eyebrow="Traceurs et préférences" title="Politique relative aux cookies" introduction="Les technologies utilisées par START et les choix proposés aux visiteurs en matière de cookies et de traceurs.">
      <LegalSection title="Préférence d’affichage">
        <p>START mémorise la préférence de thème clair ou sombre dans le stockage local du navigateur sous la clé <code className="rounded bg-black/20 px-1.5 py-0.5 text-start-gold">start-theme</code>. Cette préférence ne sert ni à la publicité ni au suivi entre plusieurs sites.</p>
      </LegalSection>

      <LegalSection title="Cookies strictement nécessaires">
        <p>Des cookies ou stockages techniques peuvent être nécessaires à l’authentification, à la sécurité, à la prévention de la fraude et à la conservation de la session. Ils sont utilisés uniquement pour fournir le service demandé.</p>
      </LegalSection>

      <LegalSection title="Mesure d’audience et publicité">
        <p>START n’utilise pas de traceur publicitaire. Si un outil de mesure d’audience soumis au consentement est utilisé, un module permet de l’accepter ou de le refuser avec la même facilité.</p>
      </LegalSection>

      <LegalSection title="Durée et gestion">
        <p>La préférence de thème reste enregistrée jusqu’à sa modification ou la suppression des données du navigateur. La durée des autres cookies est indiquée dans l’interface de gestion du consentement lorsqu’elle s’applique.</p>
        <p>Vous pouvez supprimer les données locales depuis les réglages de votre navigateur. Le blocage de stockages strictement nécessaires peut empêcher certaines fonctions de fonctionner.</p>
      </LegalSection>

      <LegalSection title="Prestataires tiers">
        <p>L’hébergement est assuré par Netlify. Les prestataires nécessaires à l’authentification ou au paiement peuvent utiliser leurs propres technologies strictement nécessaires au fonctionnement et à la sécurité du service.</p>
      </LegalSection>

      <LegalSection title="En savoir plus">
        <p>Pour comprendre les traitements associés aux comptes et formulaires, consultez la <Link to="/confidentialite" className="text-start-gold underline decoration-start-gold/35 underline-offset-4">politique de confidentialité</Link>. Toute question peut être envoyée depuis la page Contact.</p>
      </LegalSection>
    </LegalDocumentPage>
  );
}
