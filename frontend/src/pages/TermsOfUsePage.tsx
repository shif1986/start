import { Link } from "react-router-dom";
import LegalDocumentPage, { LegalSection } from "../components/LegalDocumentPage";

export default function TermsOfUsePage() {
  return (
    <LegalDocumentPage eyebrow="Règles de la plateforme" title="Conditions générales d’utilisation" introduction="Les règles applicables à la consultation du site, aux comptes, aux annonces et aux interactions entre membres.">
      <LegalSection title="Objet et acceptation">
        <p>Les présentes CGU encadrent l’accès et l’utilisation de START, plateforme de mise en relation et de diffusion d’annonces. La création d’un compte et la publication impliquent leur acceptation dans leur version en vigueur.</p>
      </LegalSection>

      <LegalSection title="Accès et comptes">
        <p>La consultation publique est ouverte sans compte. Certaines fonctions exigent un compte particulier ou professionnel. Chaque membre fournit des informations exactes, protège ses identifiants et informe START de tout accès non autorisé.</p>
        <p>Une personne agissant pour une organisation garantit disposer du pouvoir nécessaire pour l’engager.</p>
      </LegalSection>

      <LegalSection title="Publication des annonces">
        <p>La soumission d’annonces est réservée aux professionnels disposant d’un compte validé et, lorsque le paiement sera activé, d’un abonnement actif. Une annonce peut être contrôlée avant ou après publication.</p>
        <p>Le professionnel reste responsable de l’exactitude, de la légalité, des droits attachés aux images et du respect de ses propres obligations envers les utilisateurs.</p>
      </LegalSection>

      <LegalSection title="Contenus interdits">
        <p>Sont notamment interdits les contenus illégaux, frauduleux, trompeurs, discriminatoires, haineux, dangereux, portant atteinte à la vie privée ou aux droits de propriété intellectuelle, ainsi que les offres interdites par la loi.</p>
      </LegalSection>

      <LegalSection title="Classement et mise en avant">
        <p>Les résultats dépendent notamment des filtres choisis, de la localisation, de la catégorie et de la date de publication. Toute mise en avant ou fonctionnalité influençant le classement est clairement identifiée auprès des utilisateurs.</p>
      </LegalSection>

      <LegalSection title="Modération et signalement">
        <p>START peut masquer, refuser ou supprimer un contenu et suspendre un compte en cas de violation de la loi ou des présentes CGU. Sauf impossibilité légale ou urgence, la personne concernée est informée du motif et peut présenter ses observations.</p>
        <p>Tout utilisateur peut utiliser la page <Link to="/signaler-un-contenu" className="text-start-gold underline decoration-start-gold/35 underline-offset-4">Signaler un contenu</Link>.</p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>Le membre conserve ses droits sur ses contenus et accorde à START, pendant leur diffusion, une autorisation non exclusive de les héberger, reproduire et afficher uniquement pour fournir et promouvoir le service.</p>
        <p>L’identité visuelle, la structure et les contenus propres à START ne peuvent pas être réutilisés sans autorisation.</p>
      </LegalSection>

      <LegalSection title="Responsabilité et échanges">
        <p>START met les membres en relation mais n’est pas partie aux contrats conclus entre eux. Chacun doit vérifier l’identité, les compétences, le prix, les assurances et les conditions d’une offre avant de s’engager.</p>
      </LegalSection>

      <LegalSection title="Suspension et suppression">
        <p>Un membre peut demander la suppression de son compte. START peut limiter ou suspendre l’accès pour protéger les utilisateurs, respecter la loi, prévenir la fraude ou faire appliquer les CGU. Les données sont ensuite traitées conformément à la politique de confidentialité.</p>
      </LegalSection>

      <LegalSection title="Droit applicable et contact">
        <p>Les CGU sont soumises au droit français, sous réserve des règles impératives applicables dans le pays de l’utilisateur. Toute difficulté doit d’abord être adressée à START via le <Link to="/contact" className="text-start-gold underline decoration-start-gold/35 underline-offset-4">formulaire de contact</Link>.</p>
      </LegalSection>
    </LegalDocumentPage>
  );
}
