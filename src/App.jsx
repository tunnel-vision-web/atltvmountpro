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
import AuthCallbackPage from "./pages/AuthCallbackPage";
import JoinPage from "./pages/JoinPage";
import TechAppPage from "./pages/TechAppPage";
import CustomerAppPage from "./pages/CustomerAppPage";
import BlogPage from "./pages/BlogPage";
import BlogPostDetailPage from "./pages/BlogPostDetailPage";
import TechnicianTermsPage from "./pages/TechnicianTermsPage";
import SupportPage from "./pages/SupportPage";
import StorePage from "./pages/StorePage";

function App() {
  React.useEffect(() => {
    document.documentElement.classList.add("dark");

    try {
      const ticketKey = "atltv_local_support_tickets";
      const escrowKey = "atltvmountpro_escrow_ledger";
      
      let escrowLedger = [];
      try {
        escrowLedger = JSON.parse(localStorage.getItem(escrowKey)) || [];
      } catch {
        escrowLedger = [];
      }
      
      const hasJohnEscrow = escrowLedger.some(e => e.bookingId === "6hejy3kkpoew1sv");
      const hasAliceEscrow = escrowLedger.some(e => e.bookingId === "vgutmssfvpmotwh");
      
      let updatedLedger = [...escrowLedger];
      let escrowChanged = false;
      
      if (!hasJohnEscrow) {
        updatedLedger.unshift({
          id: "esc_john_miller_mock",
          bookingId: "6hejy3kkpoew1sv",
          invoiceId: "inv_john_miller",
          techId: "tech_john",
          techName: "John Handyman",
          techEmail: "john.handyman@example.com",
          clientName: "John Miller",
          clientEmail: "john.miller@example.com",
          serviceType: "TV Mounting",
          jobDate: "2026-06-20",
          invoiceTotal: 150.00,
          baseCommission: 105.00,
          tipAmount: 0,
          totalPayout: 105.00,
          status: "Frozen",
          paidDate: new Date().toISOString(),
          releaseTime: Date.now() + 48 * 3600 * 1000,
          disputed: true,
          disputeTicketId: "ST-294019",
        });
        escrowChanged = true;
      }
      
      if (!hasAliceEscrow) {
        updatedLedger.unshift({
          id: "esc_alice_smith_mock",
          bookingId: "vgutmssfvpmotwh",
          invoiceId: "inv_alice_smith",
          techId: "tech_alice",
          techName: "Alice Technician",
          techEmail: "alice.tech@example.com",
          clientName: "Alice Smith",
          clientEmail: "alice.smith@example.com",
          serviceType: "TV Mounting",
          jobDate: "2026-06-21",
          invoiceTotal: 120.00,
          baseCommission: 84.00,
          tipAmount: 0,
          totalPayout: 84.00,
          status: "Frozen",
          paidDate: new Date().toISOString(),
          releaseTime: Date.now() + 48 * 3600 * 1000,
          disputed: true,
          disputeTicketId: "ST-849204",
        });
        escrowChanged = true;
      }
      
      if (escrowChanged) {
        localStorage.setItem(escrowKey, JSON.stringify(updatedLedger));
      }
      
      const existingTickets = localStorage.getItem(ticketKey);
      if (!existingTickets || JSON.parse(existingTickets).length === 0) {
        const seedTickets = [
          {
            id: "ST-294019",
            client_name: "John Miller",
            client_email: "john.miller@example.com",
            client_phone: "4045550192",
            booking_id: "6hejy3kkpoew1sv",
            booking_service: "TV Mounting",
            technician_id: "tech_john",
            technician_name: "John Handyman",
            category: "workmanship",
            description: "The 65 inch TV was mounted in the living room yesterday. However, the wires are hanging down slightly, and I paid for wire concealment. I need a technician to return and fix this.",
            attachments: [],
            status: "Pending Review",
            created: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
            updated: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          },
          {
            id: "ST-849204",
            client_name: "Alice Smith",
            client_email: "alice.smith@example.com",
            client_phone: "7705550183",
            booking_id: "vgutmssfvpmotwh",
            booking_service: "TV Mounting",
            technician_id: "tech_alice",
            technician_name: "Alice Technician",
            category: "workmanship",
            description: "The TV is mounted perfectly, but there is some drywall dust left on the carpet under the fireplace. I'd appreciate a quick cleanup or minor credit.",
            attachments: [],
            status: "Pending Review",
            created: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
            updated: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
          }
        ];
        localStorage.setItem(ticketKey, JSON.stringify(seedTickets));
      }
    } catch (e) {
      console.warn("Global seeding failed:", e);
    }
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
                      <Route
                        path="/auth/callback"
                        element={<AuthCallbackPage />}
                      />
                      <Route path="/join" element={<JoinPage />} />
                      <Route path="/technician-terms" element={<TechnicianTermsPage />} />
                      <Route path="/support" element={<SupportPage />} />
                      <Route path="/store" element={<StorePage />} />
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
