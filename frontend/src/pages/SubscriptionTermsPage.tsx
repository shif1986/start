import { Link } from "react-router-dom";
import LegalDocumentPage, { LegalSection } from "../components/LegalDocumentPage";

export default function SubscriptionTermsPage() {
  return (
    <LegalDocumentPage eyebrow="Services professionnels" title="Conditions de l’abonnement" introduction="Les conditions contractuelles des formules professionnelles START, à consulter avant toute souscription.">
      <LegalSection title="Souscripteurs">
        <p>L’abonnement est exclusivement destiné aux comptes professionnels agissant dans le cadre de leur activité. Un compte particulier ne peut pas souscrire. START peut demander les informations nécessaires à la vérification du profil et de l’activité avant d’autoriser la publication.</p>
      </LegalSection>

      <LegalSection title="Formules et prix">
        <p>START propose une formule mensuelle à 7 € et une formule annuelle à 84 €. La mention de TVA correspondant au régime fiscal de START figure sur la facture. Le prix total, la fréquence de prélèvement et les éventuels frais sont récapitulés avant la validation du paiement.</p>
      </LegalSection>

      <LegalSection title="Souscription et paiement">
        <p>La souscription exige l’identification du professionnel, l’acceptation explicite des présentes conditions et la validation du paiement. Les données bancaires sont traitées par un prestataire de paiement sécurisé ; START n’a pas accès au numéro complet de la carte.</p>
      </LegalSection>

      <LegalSection title="Durée et renouvellement">
        <p>La formule mensuelle ou annuelle est renouvelée pour une période identique jusqu’à sa résiliation. Les modalités et la date du prochain renouvellement sont consultables depuis l’espace professionnel.</p>
      </LegalSection>

      <LegalSection title="Résiliation">
        <p>Lorsque la souscription Stripe est activée, le bouton « Gérer mon abonnement » ouvre le portail sécurisé qui permet de demander la résiliation en ligne. La résiliation prend effet à la fin de la période déjà réglée, sauf disposition impérative ou offre plus favorable. Aucun nouveau prélèvement n’est effectué après cette échéance.</p>
      </LegalSection>

      <LegalSection title="Accès aux services">
        <p>L’abonnement actif autorise la création et la soumission d’annonces ainsi que l’accès aux fonctionnalités professionnelles. Il ne garantit ni leur validation, ni leur classement, ni un nombre de contacts ou un résultat commercial.</p>
        <p>À l’expiration de l’abonnement, le profil professionnel et les annonces déjà publiées peuvent rester consultables. Le professionnel ne peut plus créer ou soumettre de nouvelle annonce et ses coordonnées sont masquées aux comptes particuliers.</p>
      </LegalSection>

      <LegalSection title="Suspension">
        <p>START peut suspendre une annonce ou un compte en cas d’impayé, de fraude, de risque pour la plateforme ou de non-respect des CGU. La suspension ne supprime pas les obligations déjà nées.</p>
      </LegalSection>

      <LegalSection title="Facturation et retard de paiement">
        <p>Les factures sont mises à disposition par voie électronique. Le paiement est exigible à la souscription puis à chaque renouvellement. En cas d’échec, l’accès payant peut être suspendu après les éventuelles tentatives de régularisation.</p>
        <p>Lorsqu’une somme reste due par un professionnel, des pénalités au taux de trois fois le taux d’intérêt légal sont exigibles sans rappel à compter du lendemain de l’échéance, ainsi que l’indemnité forfaitaire légale de 40 € pour frais de recouvrement, sans préjudice d’une indemnisation complémentaire sur justificatifs.</p>
      </LegalSection>

      <LegalSection title="Réduction d’impôt">
        <p>L’abonnement rémunère l’accès à un service professionnel et ne constitue pas un don. Il n’ouvre donc pas, à ce titre, droit à un reçu fiscal de don.</p>
      </LegalSection>

      <LegalSection title="Réclamations et droit applicable">
        <p>Toute réclamation doit être transmise via le <Link to="/contact" className="text-start-gold underline decoration-start-gold/35 underline-offset-4">formulaire de contact</Link> ou à <a href="mailto:contact@startreseauchretien.com" className="text-start-gold underline decoration-start-gold/35 underline-offset-4">contact@startreseauchretien.com</a>. Le contrat est soumis au droit français, sous réserve des règles impératives applicables. L’abonnement étant réservé à un usage professionnel, les règles propres aux contrats de consommation ne s’appliquent que si une disposition impérative en décide autrement.</p>
      </LegalSection>
    </LegalDocumentPage>
  );
}
