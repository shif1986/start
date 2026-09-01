import { Link } from "react-router-dom";
import LegalDocumentPage, { LegalSection } from "../components/LegalDocumentPage";

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage eyebrow="Protection des données" title="Politique de confidentialité" introduction="Comment START RESEAU CHRETIEN collecte, utilise et protège les données des visiteurs, particuliers et professionnels.">
      <LegalSection title="Responsable du traitement">
        <p>START RESEAU CHRETIEN, association loi 1901 enregistrée sous le numéro RNA W842013429, dont le siège est situé 103 rue du Creuset, 84270 Vedène, France.</p>
        <p>Les demandes relatives aux données personnelles peuvent être adressées depuis le <Link to="/contact" className="text-start-gold underline decoration-start-gold/35 underline-offset-4">formulaire de contact</Link>.</p>
      </LegalSection>

      <LegalSection title="Données et finalités">
        <ul className="grid gap-2 pl-5 [list-style:disc]">
          <li>identité, coordonnées et authentification pour créer et sécuriser les comptes ;</li>
          <li>profil, annonces, avis et échanges pour fournir le service de mise en relation ;</li>
          <li>demandes de contact et signalements pour répondre, modérer et prévenir les abus ;</li>
          <li>données d’abonnement, de facturation et de paiement pour gérer les souscriptions ;</li>
          <li>données techniques et journaux de sécurité pour protéger et maintenir la plateforme ;</li>
          <li>adresse électronique de newsletter uniquement avec le consentement de la personne.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Bases juridiques">
        <p>Les traitements reposent, selon leur finalité, sur l’exécution du contrat ou des CGU, le consentement, le respect d’une obligation légale et l’intérêt légitime de START à sécuriser, administrer et améliorer son service.</p>
      </LegalSection>

      <LegalSection title="Destinataires et prestataires">
        <p>Les données sont accessibles aux personnes habilitées de START et aux prestataires strictement nécessaires au fonctionnement du service, notamment pour l’hébergement, l’authentification, l’envoi d’e-mails et le paiement. Le site est hébergé par Netlify, Inc.</p>
        <p>Le téléphone, l’adresse électronique et l’éventuelle adresse postale de contact renseignés par un professionnel sont accessibles aux particuliers connectés uniquement pendant la période où l’abonnement professionnel est actif. À son expiration, le profil et les annonces déjà publiées peuvent rester visibles, mais ces coordonnées sont masquées aux particuliers. Les visiteurs non connectés n’y ont jamais accès.</p>
        <p>Lorsque des prestataires traitent des données hors de l’Espace économique européen ou de Suisse, START applique les garanties de transfert requises par la réglementation.</p>
      </LegalSection>

      <LegalSection title="Durées de conservation">
        <ul className="grid gap-2 pl-5 [list-style:disc]">
          <li>compte et profil : pendant l’utilisation du service, puis le temps nécessaire à la gestion des réclamations ;</li>
          <li>annonces et modération : pendant leur publication puis en archivage limité pour la sécurité et les litiges ;</li>
          <li>demandes de contact : jusqu’à trois ans après le dernier échange ;</li>
          <li>documents comptables et factures : durée légale applicable ;</li>
          <li>newsletter : jusqu’au retrait du consentement ou après une période prolongée sans interaction ;</li>
          <li>journaux techniques : durée proportionnée aux besoins de sécurité.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>Selon votre situation, vous pouvez demander l’accès, la rectification, l’effacement, la limitation, la portabilité ou l’opposition au traitement, et retirer votre consentement à tout moment.</p>
        <p>Après avoir contacté START, vous pouvez saisir la <a href="https://www.cnil.fr/" target="_blank" rel="noreferrer" className="text-start-gold underline decoration-start-gold/35 underline-offset-4">CNIL</a>. Les personnes concernées en Suisse peuvent également contacter le <a href="https://www.edoeb.admin.ch/" target="_blank" rel="noreferrer" className="text-start-gold underline decoration-start-gold/35 underline-offset-4">PFPDT</a>.</p>
      </LegalSection>

      <LegalSection title="Sécurité et mineurs">
        <p>START applique des mesures techniques et organisationnelles proportionnées aux risques. Aucun système ne pouvant garantir une sécurité absolue, tout incident suspect doit être signalé rapidement.</p>
        <p>START peut suspendre un compte pour protéger les membres ou appliquer ses règles. Pendant la suspension, l’accès aux coordonnées privées et les fonctions de contribution sont désactivés, sans supprimer automatiquement les contenus publics déjà publiés.</p>
        <p>La création autonome d’un compte n’est pas destinée aux personnes ne disposant pas de la capacité juridique requise. L’autorisation du représentant légal est demandée lorsque la réglementation l’exige.</p>
      </LegalSection>

      <LegalSection title="Évolution de la politique">
        <p>Cette politique peut évoluer afin de refléter les changements du service ou de la réglementation. La date de dernière mise à jour est indiquée sur cette page.</p>
      </LegalSection>
    </LegalDocumentPage>
  );
}
