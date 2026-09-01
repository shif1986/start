import { Link } from "react-router-dom";
import LegalDocumentPage, { LegalSection } from "../components/LegalDocumentPage";

export default function SubscriptionTermsPage() {
  return (
    <LegalDocumentPage eyebrow="Services professionnels" title="Conditions de l’abonnement" introduction="Les conditions contractuelles des formules professionnelles START, à consulter avant toute souscription.">
      <LegalSection title="Souscripteurs">
        <p>L’abonnement est exclusivement destiné aux comptes professionnels agissant dans le cadre de leur activité. Un compte particulier ne peut pas souscrire. START peut demander les informations nécessaires à la vérification du profil et de l’activité avant d’autoriser la publication.</p>
      </LegalSection>

      <LegalSection title="Formules et prix">
        <p>START propose une formule mensuelle à 7 € et une formule annuelle à 84 €. Le prix, la fréquence de prélèvement et les éventuels frais sont récapitulés avant la validation du paiement.</p>
      </LegalSection>

      <LegalSection title="Souscription et paiement">
        <p>La souscription exige l’identification du professionnel, l’acceptation explicite des présentes conditions et la validation du paiement. Les données bancaires sont traitées par un prestataire de paiement sécurisé ; START n’a pas accès au numéro complet de la carte.</p>
      </LegalSection>

      <LegalSection title="Durée et renouvellement">
        <p>La formule mensuelle ou annuelle est renouvelée pour une période identique jusqu’à sa résiliation. Les modalités et la date du prochain renouvellement sont consultables depuis l’espace professionnel.</p>
      </LegalSection>

      <LegalSection title="Résiliation">
        <p>Une fonction clairement identifiée permettra de résilier l’abonnement en ligne. La résiliation prendra effet à la fin de la période déjà réglée, sauf disposition impérative ou offre plus favorable. Aucun nouveau prélèvement ne sera effectué après cette échéance.</p>
      </LegalSection>

      <LegalSection title="Accès aux services">
        <p>L’abonnement actif autorise la création et la soumission d’annonces ainsi que l’accès aux fonctionnalités professionnelles. Il ne garantit ni leur validation, ni leur classement, ni un nombre de contacts ou un résultat commercial.</p>
        <p>À l’expiration de l’abonnement, le profil professionnel et les annonces déjà publiées peuvent rester consultables. Le professionnel ne peut plus créer ou soumettre de nouvelle annonce et ses coordonnées sont masquées aux comptes particuliers.</p>
      </LegalSection>

      <LegalSection title="Suspension">
        <p>START peut suspendre une annonce ou un compte en cas d’impayé, de fraude, de risque pour la plateforme ou de non-respect des CGU. La suspension ne supprime pas les obligations déjà nées.</p>
      </LegalSection>

      <LegalSection title="Réduction d’impôt">
        <p>Un abonnement ne bénéficie pas automatiquement du régime du mécénat. Une réduction d’impôt de 60 % n’est envisageable que si le versement remplit les conditions légales et qu’un reçu fiscal peut valablement être délivré.</p>
      </LegalSection>

      <LegalSection title="Réclamations et droit applicable">
        <p>Toute réclamation doit être transmise via le <Link to="/contact" className="text-start-gold underline decoration-start-gold/35 underline-offset-4">formulaire de contact</Link>. Le contrat est soumis au droit français, sous réserve des règles impératives applicables. Lorsqu’un souscripteur bénéficie légalement du statut de consommateur, les informations relatives au médiateur compétent lui sont communiquées avant la souscription.</p>
      </LegalSection>
    </LegalDocumentPage>
  );
}
