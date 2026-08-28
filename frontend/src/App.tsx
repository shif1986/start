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
import ProtectedRoute from "./features/auth/components/ProtectedRoute";

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
          <Route path="/publier" element={<ProtectedRoute accountTypes={["professional"]}><PublishPage /></ProtectedRoute>} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/connexion" element={<AuthPage mode="login" />} />
          <Route path="/inscription" element={<AuthPage mode="register" />} />
          <Route path="/espace/particulier" element={<ProtectedRoute accountTypes={["customer"]}><AccountDashboardPage role="customer" /></ProtectedRoute>} />
          <Route path="/espace/professionnel" element={<ProtectedRoute accountTypes={["professional"]}><AccountDashboardPage role="professional" /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={["moderator", "admin"]}><AccountDashboardPage role="admin" /></ProtectedRoute>} />
          <Route path="/abonnement" element={<ProtectedRoute accountTypes={["professional"]}><SubscriptionPage /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
