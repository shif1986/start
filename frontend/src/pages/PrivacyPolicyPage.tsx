import { Link } from "react-router-dom";
import LegalDocumentPage, { LegalSection } from "../components/LegalDocumentPage";

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage eyebrow="Protection des données" title="Politique de confidentialité" introduction="Comment START RESEAU CHRETIEN collecte, utilise et protège les données des visiteurs, particuliers et professionnels.">
      <LegalSection title="Responsable du traitement">
        <p>START RESEAU CHRETIEN, association loi 1901 enregistrée sous le numéro RNA W842013429, dont le siège est situé 103 rue du Creuset, 84270 Vedène, France.</p>
        <p>Les demandes relatives aux données personnelles peuvent être adressées à <a href="mailto:contact@startreseauchretien.com" className="text-start-gold underline decoration-start-gold/35 underline-offset-4">contact@startreseauchretien.com</a> ou depuis le <Link to="/contact" className="text-start-gold underline decoration-start-gold/35 underline-offset-4">formulaire de contact</Link>.</p>
      </LegalSection>

      <LegalSection title="Données et finalités">
        <ul className="grid gap-2 pl-5 [list-style:disc]">
          <li>identité, coordonnées et authentification pour créer et sécuriser les comptes ;</li>
          <li>profil, annonces, favoris, avis et demandes de contact pour fournir le service de mise en relation ;</li>
          <li>clics sur « Contacter », demandes de contact et signalements pour fournir l’historique d’activité, modérer et prévenir les abus ;</li>
          <li>données d’abonnement, de facturation et de paiement pour gérer les souscriptions ;</li>
          <li>identité, adresse e-mail, consentement, montant, fréquence et références Stripe nécessaires au traitement des dons et à l’émission des justificatifs de paiement ;</li>
          <li>données techniques et journaux de sécurité pour protéger et maintenir la plateforme ;</li>
          <li>adresse électronique de newsletter uniquement avec le consentement de la personne.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Bases juridiques">
        <ul className="grid gap-2 pl-5 [list-style:disc]">
          <li>exécution des CGU ou des conditions d’abonnement : compte, authentification, profil, annonces, favoris, avis, demandes de contact et abonnement ;</li>
          <li>mesures précontractuelles et exécution de la demande : formulaires de contact, paiement et traitement d’un don demandé par la personne ;</li>
          <li>obligations légales : facturation, comptabilité, lutte contre la fraude et réponse aux autorités habilitées ;</li>
          <li>intérêt légitime de START : sécurité, prévention des abus, modération, preuve des opérations et amélioration strictement nécessaire du service ;</li>
          <li>consentement : communications facultatives et traceurs non essentiels, s’ils sont activés.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Caractère obligatoire des données">
        <p>Les champs signalés comme obligatoires sont nécessaires pour créer un compte, publier, contacter START, souscrire ou effectuer un don. Sans eux, la demande concernée ne peut pas être traitée. Les autres champs sont facultatifs et leur absence n’empêche pas l’utilisation des fonctions qui n’en dépendent pas.</p>
        <p>START ne prend pas de décision produisant un effet juridique exclusivement à partir d’un traitement automatisé. Des contrôles techniques peuvent néanmoins bloquer provisoirement une opération suspecte, qui peut être contestée auprès de START.</p>
      </LegalSection>

      <LegalSection title="Destinataires et prestataires">
        <p>Les données sont accessibles aux personnes habilitées de START et aux prestataires strictement nécessaires : Netlify pour l’hébergement du site, Supabase pour l’authentification, la base de données et les fonctions serveur, Infomaniak pour l’envoi d’e-mails, Stripe pour les paiements, Google lorsque la connexion Google est choisie et OpenStreetMap lorsque la carte est affichée.</p>
        <p>Le téléphone, l’adresse électronique et l’éventuelle adresse postale de contact renseignés par un professionnel sont accessibles aux particuliers connectés uniquement pendant la période où l’abonnement professionnel est actif. À son expiration, le profil et les annonces déjà publiées peuvent rester visibles, mais ces coordonnées sont masquées aux particuliers. Les visiteurs non connectés n’y ont jamais accès.</p>
        <p>Lorsqu’un particulier clique sur « Contacter » ou directement sur un téléphone, un e-mail ou une adresse postale, START enregistre le professionnel concerné, l’annonce utilisée, le type de coordonnée, le nombre de clics et leurs dates. L’adresse ouvre un service cartographique externe. Ce suivi indique seulement qu’une prise de contact a été initiée : il ne permet pas de savoir si un appel a abouti, si un e-mail a effectivement été envoyé ou si un déplacement a eu lieu.</p>
        <p>Certains prestataires peuvent traiter des données hors de l’Espace économique européen. Ces transferts reposent, selon le pays et le prestataire, sur une décision d’adéquation ou sur des clauses contractuelles types approuvées par la Commission européenne, complétées si nécessaire. Une copie des garanties applicables peut être demandée à START.</p>
      </LegalSection>

      <LegalSection title="Durées de conservation">
        <ul className="grid gap-2 pl-5 [list-style:disc]">
          <li>compte et profil : pendant l’utilisation du service, puis en archivage limité pendant le délai nécessaire à la preuve et aux réclamations ;</li>
          <li>annonces, avis, signalements et décisions de modération : pendant leur utilisation, puis en archivage limité pour la sécurité, la preuve et les litiges ;</li>
          <li>clics et demandes de contact : jusqu’à trois ans après le dernier clic ou échange ;</li>
          <li>factures, paiements et pièces comptables : dix ans à compter de la clôture de l’exercice concerné, lorsque cette durée légale s’applique ;</li>
          <li>communications facultatives : jusqu’au retrait du consentement ou au plus tard trois ans après le dernier contact actif ;</li>
          <li>journaux techniques et de sécurité : durée limitée aux besoins de détection, d’investigation et de preuve.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>Selon votre situation, vous pouvez demander l’accès, la rectification, l’effacement, la limitation, la portabilité ou l’opposition au traitement, définir des directives relatives au sort de vos données après votre décès et retirer votre consentement à tout moment. Une réponse est apportée en principe dans un délai d’un mois, prolongeable dans les conditions prévues par le RGPD.</p>
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
