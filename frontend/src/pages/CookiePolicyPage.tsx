import { Link } from "react-router-dom";
import LegalDocumentPage, { LegalSection } from "../components/LegalDocumentPage";

export default function CookiePolicyPage() {
  return (
    <LegalDocumentPage eyebrow="Traceurs et préférences" title="Politique relative aux cookies" introduction="Les technologies utilisées par START et les choix proposés aux visiteurs en matière de cookies et de traceurs.">
      <LegalSection title="Préférence d’affichage">
        <p>START mémorise la préférence de thème clair ou sombre dans le stockage local du navigateur sous la clé <code className="rounded bg-black/20 px-1.5 py-0.5 text-start-gold">start-theme</code>. Cette préférence ne sert ni à la publicité ni au suivi entre plusieurs sites.</p>
      </LegalSection>

      <LegalSection title="Cookies strictement nécessaires">
        <p>Supabase utilise le stockage du navigateur pour conserver la session lorsque l’utilisateur choisit de se connecter. Des paramètres temporaires servent aussi à sécuriser les retours d’authentification, notamment avec Google. Ces éléments sont nécessaires au service demandé et ne sont pas utilisés à des fins publicitaires.</p>
      </LegalSection>

      <LegalSection title="Mesure d’audience et publicité">
        <p>START n’utilise actuellement ni traceur publicitaire ni outil de mesure d’audience. Avant l’activation future d’un traceur non essentiel, le site demandera un consentement libre et permettra de le refuser ou de le retirer aussi facilement.</p>
      </LegalSection>

      <LegalSection title="Durée et gestion">
        <p>La préférence de thème reste enregistrée jusqu’à sa modification ou la suppression des données du navigateur. Les éléments d’authentification expirent avec la session ou selon la durée de sécurité configurée par le service d’authentification.</p>
        <p>Vous pouvez supprimer les données locales depuis les réglages de votre navigateur. Le blocage de stockages strictement nécessaires peut empêcher certaines fonctions de fonctionner.</p>
      </LegalSection>

      <LegalSection title="Prestataires tiers">
        <p>L’hébergement est assuré par Netlify. Supabase gère l’authentification. Google intervient seulement si la connexion Google est choisie. Stripe intervient seulement à l’ouverture de son interface de paiement ou de gestion. La carte charge des ressources techniques OpenStreetMap et peut transmettre à ce service l’adresse IP et les informations techniques nécessaires à leur livraison.</p>
      </LegalSection>

      <LegalSection title="En savoir plus">
        <p>Pour comprendre les traitements associés aux comptes et formulaires, consultez la <Link to="/confidentialite" className="text-start-gold underline decoration-start-gold/35 underline-offset-4">politique de confidentialité</Link>. Toute question peut être envoyée depuis la page Contact.</p>
      </LegalSection>
    </LegalDocumentPage>
  );
}
