import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ListingsPage from "./pages/ListingsPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import AboutPage from "./pages/AboutPage";
import DonationsPage from "./pages/DonationsPage";
import ContactPage from "./pages/ContactPage";
import PublishPage from "./pages/PublishPage";

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
          <Route path="/publier" element={<PublishPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
