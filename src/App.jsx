import React from "react";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";
import { UIProvider } from "@/contexts/UIContext";
import { ClientAuthProvider } from "@/contexts/ClientAuthContext";
import ScrollToTop from "./components/ScrollToTop";
import Header from "./components/Header";
import Footer from "./components/Footer";
import QuoteEstimatorModal from "./components/QuoteEstimatorModal";
import AppointmentBookingModal from "./components/AppointmentBookingModal";
import ClientAuthModal from "./components/ClientAuthModal";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import AboutPage from "./pages/AboutPage";
import TeamPage from "./pages/TeamPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ClientDashboard from "./pages/ClientDashboard";
import AdminPage from "./pages/AdminPage";
import VerifyOptinPage from "./pages/VerifyOptinPage";
import JoinPage from "./pages/JoinPage";
import TechAppPage from "./pages/TechAppPage";
import CustomerAppPage from "./pages/CustomerAppPage";
import BlogPage from "./pages/BlogPage";
import BlogPostDetailPage from "./pages/BlogPostDetailPage";
import TechnicianTermsPage from "./pages/TechnicianTermsPage";
import SupportPage from "./pages/SupportPage";

function App() {
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <UIProvider>
      <ClientAuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Admin — no site chrome */}
            <Route path="/admin" element={<AdminPage />} />

            {/* App Simulators — no site chrome */}
            <Route path="/apps/tech" element={<TechAppPage />} />
            <Route path="/apps/customer" element={<CustomerAppPage />} />

            {/* Client Dashboard — minimal chrome */}
            <Route
              path="/dashboard"
              element={
                <div className="flex flex-col min-h-screen bg-background text-foreground">
                  <Header />
                  <main className="flex-1 pt-0">
                    <ClientDashboard />
                  </main>
                </div>
              }
            />

            {/* Public site */}
            <Route
              path="*"
              element={
                <div className="flex flex-col min-h-screen bg-background text-foreground">
                  <Header />
                  <main className="flex-1 pt-0">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/services" element={<ServicesPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/team" element={<TeamPage />} />
                      <Route
                        path="/testimonials"
                        element={<TestimonialsPage />}
                      />
                      <Route path="/blog" element={<BlogPage />} />
                      <Route
                        path="/blog/:slug"
                        element={<BlogPostDetailPage />}
                      />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/projects" element={<ProjectsPage />} />
                      <Route
                        path="/projects/:id"
                        element={<ProjectDetailPage />}
                      />
                      <Route
                        path="/privacy-policy"
                        element={<PrivacyPolicyPage />}
                      />
                      <Route
                        path="/terms-of-service"
                        element={<TermsOfServicePage />}
                      />
                      <Route
                        path="/verify-optin"
                        element={<VerifyOptinPage />}
                      />
                      <Route path="/join" element={<JoinPage />} />
                      <Route path="/technician-terms" element={<TechnicianTermsPage />} />
                      <Route path="/support" element={<SupportPage />} />
                    </Routes>
                  </main>
                  <Footer />
                  <QuoteEstimatorModal />
                  <AppointmentBookingModal />
                  <ClientAuthModal />
                </div>
              }
            />
          </Routes>
          <Toaster />
        </Router>
      </ClientAuthProvider>
    </UIProvider>
  );
}

export default App;
