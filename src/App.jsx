import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { UIProvider } from '@/contexts/UIContext';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import QuoteEstimatorModal from './components/QuoteEstimatorModal';
import AppointmentBookingModal from './components/AppointmentBookingModal';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import TeamPage from './pages/TeamPage';
import TestimonialsPage from './pages/TestimonialsPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AdminPage from './pages/AdminPage';

function App() {
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <UIProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Admin — no site chrome */}
          <Route path="/admin" element={<AdminPage />} />

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
                    <Route path="/testimonials" element={<TestimonialsPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/:id" element={<ProjectDetailPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                  </Routes>
                </main>
                <Footer />
                <QuoteEstimatorModal />
                <AppointmentBookingModal />
              </div>
            }
          />
        </Routes>
        <Toaster />
      </Router>
    </UIProvider>
  );
}

export default App;
