import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";

const HomePage = lazy(() => import("./pages/HomePage"));
const ListingsPage = lazy(() => import("./pages/ListingsPage"));
const ListingDetailPage = lazy(() => import("./pages/ListingDetailPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const DonationsPage = lazy(() => import("./pages/DonationsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PublishPage = lazy(() => import("./pages/PublishPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AccountDashboardPage = lazy(() => import("./pages/AccountDashboardPage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const ProfessionalListingsPage = lazy(() => import("./pages/ProfessionalListingsPage"));
const LegalNoticePage = lazy(() => import("./pages/LegalNoticePage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfUsePage = lazy(() => import("./pages/TermsOfUsePage"));
const SubscriptionTermsPage = lazy(() => import("./pages/SubscriptionTermsPage"));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage"));
const ReportContentPage = lazy(() => import("./pages/ReportContentPage"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage"));
const CustomerFavoritesPage = lazy(() => import("./pages/CustomerFavoritesPage"));
const CustomerReviewsPage = lazy(() => import("./pages/CustomerReviewsPage"));
const ProfessionalSubscriptionPage = lazy(() => import("./pages/ProfessionalSubscriptionPage"));
const ProfessionalAccountRequiredPage = lazy(() => import("./pages/ProfessionalAccountRequiredPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const EditListingPage = lazy(() => import("./pages/EditListingPage"));
const EditProfessionalProfilePage = lazy(() => import("./pages/EditProfessionalProfilePage"));
const PublicProfessionalProfilePage = lazy(() => import("./pages/PublicProfessionalProfilePage"));

function PageLoadingFallback() {
  return (
    <div className="grid min-h-[55vh] place-items-center" role="status" aria-label="Chargement de la page">
      <span className="size-10 animate-spin rounded-full border-2 border-start-cream/15 border-t-start-gold" aria-hidden="true" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/annonces" element={<ListingsPage />} />
          <Route path="/annonce/:slug" element={<ListingDetailPage />} />
          <Route path="/professionnel/:username" element={<PublicProfessionalProfilePage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/don" element={<DonationsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/publier" element={<ProtectedRoute accountTypes={["professional"]} unauthorizedTo="/publier/compte-professionnel-requis" unauthenticatedTo="/publier/compte-professionnel-requis"><PublishPage /></ProtectedRoute>} />
          <Route path="/publier/compte-professionnel-requis" element={<ProfessionalAccountRequiredPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/connexion" element={<AuthPage mode="login" />} />
          <Route path="/inscription" element={<AuthPage mode="register" />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/espace/particulier" element={<ProtectedRoute accountTypes={["customer"]}><AccountDashboardPage role="customer" /></ProtectedRoute>} />
          <Route path="/espace/particulier/favoris" element={<ProtectedRoute accountTypes={["customer"]}><CustomerFavoritesPage /></ProtectedRoute>} />
          <Route path="/espace/particulier/avis" element={<ProtectedRoute accountTypes={["customer"]}><CustomerReviewsPage /></ProtectedRoute>} />
          <Route path="/espace/professionnel" element={<ProtectedRoute accountTypes={["professional"]}><AccountDashboardPage role="professional" /></ProtectedRoute>} />
          <Route path="/espace/professionnel/annonces" element={<ProtectedRoute accountTypes={["professional"]}><ProfessionalListingsPage /></ProtectedRoute>} />
          <Route path="/espace/professionnel/annonces/:listingId/modifier" element={<ProtectedRoute accountTypes={["professional"]}><EditListingPage /></ProtectedRoute>} />
          <Route path="/espace/professionnel/profil" element={<ProtectedRoute accountTypes={["professional"]}><EditProfessionalProfilePage /></ProtectedRoute>} />
          <Route path="/espace/professionnel/favoris" element={<ProtectedRoute accountTypes={["professional"]}><CustomerFavoritesPage accountType="professional" /></ProtectedRoute>} />
          <Route path="/espace/professionnel/avis" element={<ProtectedRoute accountTypes={["professional"]}><CustomerReviewsPage accountType="professional" /></ProtectedRoute>} />
          <Route path="/espace/professionnel/abonnement" element={<ProtectedRoute accountTypes={["professional"]}><ProfessionalSubscriptionPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={["moderator", "admin"]}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/abonnement" element={<ProtectedRoute accountTypes={["professional"]}><SubscriptionPage /></ProtectedRoute>} />
          <Route path="/mentions-legales" element={<LegalNoticePage />} />
          <Route path="/confidentialite" element={<PrivacyPolicyPage />} />
          <Route path="/conditions-utilisation" element={<TermsOfUsePage />} />
          <Route path="/conditions-abonnement" element={<SubscriptionTermsPage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />
          <Route path="/signaler-un-contenu" element={<ReportContentPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
