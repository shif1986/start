import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ListingsPage from "./pages/ListingsPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import AboutPage from "./pages/AboutPage";
import DonationsPage from "./pages/DonationsPage";
import ContactPage from "./pages/ContactPage";
import PublishPage from "./pages/PublishPage";
import CategoriesPage from "./pages/CategoriesPage";
import AuthPage from "./pages/AuthPage";
import AccountDashboardPage from "./pages/AccountDashboardPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import ProfessionalListingsPage from "./pages/ProfessionalListingsPage";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import LegalNoticePage from "./pages/LegalNoticePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfUsePage from "./pages/TermsOfUsePage";
import SubscriptionTermsPage from "./pages/SubscriptionTermsPage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import ReportContentPage from "./pages/ReportContentPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import CustomerFavoritesPage from "./pages/CustomerFavoritesPage";
import CustomerReviewsPage from "./pages/CustomerReviewsPage";
import ProfessionalSubscriptionPage from "./pages/ProfessionalSubscriptionPage";
import ProfessionalAccountRequiredPage from "./pages/ProfessionalAccountRequiredPage";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/annonces" element={<ListingsPage />} />
          <Route path="/annonce/:slug" element={<ListingDetailPage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/don" element={<DonationsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/publier" element={<ProtectedRoute accountTypes={["professional"]} unauthorizedTo="/publier/compte-professionnel-requis"><PublishPage /></ProtectedRoute>} />
          <Route path="/publier/compte-professionnel-requis" element={<ProtectedRoute><ProfessionalAccountRequiredPage /></ProtectedRoute>} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/connexion" element={<AuthPage mode="login" />} />
          <Route path="/inscription" element={<AuthPage mode="register" />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/espace/particulier" element={<ProtectedRoute accountTypes={["customer"]}><AccountDashboardPage role="customer" /></ProtectedRoute>} />
          <Route path="/espace/particulier/favoris" element={<ProtectedRoute accountTypes={["customer"]}><CustomerFavoritesPage /></ProtectedRoute>} />
          <Route path="/espace/particulier/avis" element={<ProtectedRoute accountTypes={["customer"]}><CustomerReviewsPage /></ProtectedRoute>} />
          <Route path="/espace/professionnel" element={<ProtectedRoute accountTypes={["professional"]}><AccountDashboardPage role="professional" /></ProtectedRoute>} />
          <Route path="/espace/professionnel/annonces" element={<ProtectedRoute accountTypes={["professional"]}><ProfessionalListingsPage /></ProtectedRoute>} />
          <Route path="/espace/professionnel/abonnement" element={<ProtectedRoute accountTypes={["professional"]}><ProfessionalSubscriptionPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={["moderator", "admin"]}><AccountDashboardPage role="admin" /></ProtectedRoute>} />
          <Route path="/abonnement" element={<ProtectedRoute accountTypes={["professional"]}><SubscriptionPage /></ProtectedRoute>} />
          <Route path="/mentions-legales" element={<LegalNoticePage />} />
          <Route path="/confidentialite" element={<PrivacyPolicyPage />} />
          <Route path="/conditions-utilisation" element={<TermsOfUsePage />} />
          <Route path="/conditions-abonnement" element={<SubscriptionTermsPage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />
          <Route path="/signaler-un-contenu" element={<ReportContentPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
