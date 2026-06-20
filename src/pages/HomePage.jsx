import React from "react";
import usePageTitle from "@/hooks/usePageTitle";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import HeroCarousel from "@/components/HeroCarousel";
import ServiceCard from "@/components/ServiceCard";
import TestimonialCard from "@/components/TestimonialCard";
import NewsletterSignup from "@/components/NewsletterSignup";
import { useUI } from "@/contexts/UIContext";
import { useCMS } from "@/hooks/useCMS";
import ProjectCard from "@/components/ProjectCard";
import DUMMY_PROJECTS from "@/data/dummyProjects";

// Helper to resolve icon component from name string
const getIconComponent = (iconName) => {
  const IconComponent = Icons[iconName];
  return IconComponent || Icons.Hammer;
};

const defaultStaticServices = [
  {
    icon: "Tv",
    title: "TV Mounting",
    description:
      "Professional wall mounting for all TV sizes with clean cable management and optimal viewing angles.",
  },
  {
    icon: "Hammer",
    title: "Drywall Repair",
    description:
      "Expert patching of holes, crack repairs, smooth finishes, and texture matching for seamless results.",
  },
  {
    icon: "Paintbrush",
    title: "Painting",
    description:
      "Interior and exterior painting services with color consultation and thorough prep work included.",
  },
  {
    icon: "Wrench",
    title: "Carpentry",
    description:
      "Custom shelving, trim work, door installation, and professional carpentry repairs.",
  },
  {
    icon: "Home",
    title: "Flooring",
    description:
      "Hardwood, laminate, and tile installation with expert repair services.",
  },
  {
    icon: "Droplet",
    title: "Plumbing",
    description:
      "Fixture installation, leak repairs, and drain cleaning services.",
  },
  {
    icon: "Zap",
    title: "Light Electrical",
    description:
      "Outlet installation, switch replacement, and light fixture mounting.",
  },
];

const testimonials = [
  {
    name: "Marcus Chen",
    service: "TV Mounting",
    rating: 5,
    text: "Mounted my 75-inch TV perfectly. Clean cable management and finished in under 2 hours.",
  },
  {
    name: "Priya Desai",
    service: "Drywall Repair",
    rating: 5,
    text: "Fixed multiple holes from old shelving. You can't even tell there was damage.",
  },
  {
    name: "James Wilson",
    service: "Painting",
    rating: 5,
    text: "Repainted our living room and hallway. Professional finish and stayed on budget.",
  },
  {
    name: "Sofia Martinez",
    service: "Carpentry",
    rating: 5,
    text: "Built custom shelving for our home office. Exactly what we needed.",
  },
  {
    name: "David Kim",
    service: "Flooring",
    rating: 5,
    text: "Installed laminate flooring in two bedrooms. Fast, clean, and looks amazing.",
  },
];

const HomePage = () => {
  const { openQuoteModal, openBookingModal } = useUI();
  const { data: cmsHome } = useCMS("home");
  const { data: cmsServicesData } = useCMS("services");
  const { data: ctaData } = useCMS("cta");
 
  const [projects, setProjects] = React.useState([]);
 
  React.useEffect(() => {
    fetch("/api/projects")
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data) => {
        const featured = (data || []).filter(p => p.featured_landing);
        setProjects(featured.length > 0 ? featured.slice(0, 3) : (data || []).slice(0, 3));
      })
      .catch(() => {
        const stored = localStorage.getItem("atltvmountpro_local_projects");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.length > 0) {
              const featured = parsed.filter(p => p.featured_landing);
              setProjects(featured.length > 0 ? featured.slice(0, 3) : parsed.slice(0, 3));
              return;
            }
          } catch {}
        }
        const featured = DUMMY_PROJECTS.filter(p => p.featured_landing);
        setProjects(featured.length > 0 ? featured.slice(0, 3) : DUMMY_PROJECTS.slice(0, 3));
      });
  }, []);
 
  const cmsFaqs = cmsHome?.faqs;
 
  const allServicesList = cmsServicesData?.list || [];
  const cmsCoreServices = allServicesList.filter((s) => s.isCore);
 
  const featuredServices =
    cmsCoreServices.length > 0
      ? cmsCoreServices
      : (allServicesList.length > 0 ? allServicesList.slice(0, 3) : [
          {
            title: "TV Mounting & AV Setup",
            tagline: "Clean walls. Perfect angles.",
            description:
              "We mount any size TV on any wall type — brick, tile, concrete, or drywall — with full in-wall cable concealment.",
            image:
              "https://images.unsplash.com/photo-1698047945367-112339b04d51?w=900&q=80",
            bg: "from-black/70 via-black/50 to-black/20",
          },
          {
            title: "Drywall & Painting",
            tagline: "Flawless finishes, every time.",
            description:
              "Seamless hole repairs with texture matching, full-room priming and painting with colour consultation included.",
            image:
              "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=900&q=80",
            bg: "from-black/70 via-black/50 to-black/20",
          },
          {
            title: "Carpentry & Custom Shelving",
            tagline: "Built exactly the way you need it.",
            description:
              "Floating shelves, entertainment centers, trim work, and custom storage built to fit your space perfectly.",
            image:
              "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80",
            bg: "from-black/70 via-black/50 to-black/20",
          },
        ]);
 
  const servicesListToRender = allServicesList.length > 0 ? allServicesList : defaultStaticServices;
 
  const faqs =
    cmsFaqs?.length > 0
      ? cmsFaqs
      : [
          {
            question: "What areas do you serve?",
            answer:
              "We serve the Atlanta metro area and throughout Georgia. Contact us to confirm service availability in your specific location.",
          },
          {
            question: "How much does TV mounting cost?",
            answer:
              "TV mounting starts at $120 and varies based on TV size, wall type, and complexity of cable management. Use our Job Estimator for a detailed breakdown.",
          },
          {
            question: "Do you offer same-day service?",
            answer:
              "Yes, we offer same-day service with a $40 rush fee, subject to availability. Book early for best availability.",
          },
          {
            question: "Are you licensed and insured?",
            answer:
              "Yes, we are fully licensed and insured for all services we provide, giving you peace of mind.",
          },
          {
            question: "What's your guarantee?",
            answer:
              "We offer a 100% satisfaction guarantee on all work. If you're not happy, we'll make it right.",
          },
        ];

  usePageTitle({
    title: "Atlanta TV Mount PRO - Professional TV Mounting & Handyman Services in Atlanta",
    description: "Atlanta's top-rated professional TV wall mounting, wire concealment, home theater installation, drywall patching, and handyman services. Fully licensed and insured. Get a free quote today!",
    keywords: "TV mounting Atlanta, TV wall mount, cable concealment, home theater setup, handyman services Atlanta, drywall repair, TV installation Atlanta",
    ogImage: "/favicon.png"
  });

  return (
    <>
      {/* Hero */}
      <HeroCarousel />

      {/* ── Featured Services Spotlight ── */}
      <section className="py-20 bg-muted">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <p className="text-xs tracking-[0.18em] uppercase text-primary font-medium mb-3">
              What We Do Best
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Core Services
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From precision TV installs to custom carpentry — professional
              results on every job.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(featuredServices.length > 0 ? featuredServices : []).map(
              (svc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer"
                  style={{ minHeight: "340px" }}
                >
                  {svc.video ? (
                    <video
                      src={svc.video}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={svc.image}
                      alt={svc.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  )}
                  {/* Gradient overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${svc.bg} transition-opacity duration-300 group-hover:opacity-90`}
                  />

                  {/* Content */}
                  <div
                    className="relative h-full flex flex-col justify-end p-7"
                    style={{ minHeight: "340px" }}
                  >
                    <p className="text-xs tracking-[0.15em] uppercase text-primary font-semibold mb-2">
                      {svc.tagline}
                    </p>
                    <h3 className="text-xl font-bold text-white mb-2 leading-snug">
                      {svc.title}
                    </h3>
                    <div 
                      className="text-white/75 text-sm leading-relaxed mb-5 prose prose-invert prose-sm"
                      dangerouslySetInnerHTML={{ __html: svc.description }}
                    />
                    <Link
                      to="/services"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white transition-colors duration-200"
                    >
                      Learn More <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── All Services ── */}
      <section className="py-20 bg-background">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              All Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional handyman services for your home and business
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {servicesListToRender.map((service, index) => {
              const IconComponent = getIconComponent(service.icon);
              return (
                <ServiceCard
                  key={service.id || index}
                  icon={IconComponent}
                  title={service.title}
                  description={service.description}
                  index={index}
                />
              );
            })}
          </div>

          <div className="text-center flex gap-4 justify-center flex-wrap">
            <Button
              onClick={openQuoteModal}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.98]"
            >
              Estimate My Job
            </Button>
            <Button
              onClick={openBookingModal}
              size="lg"
              variant="outline"
              className="transition-all duration-200 active:scale-[0.98]"
            >
              Book a Service
            </Button>
          </div>
        </div>
      </section>

      {/* ── Featured Projects teaser ── */}
      <section className="py-20 bg-muted border-t border-border">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <p className="text-xs tracking-[0.18em] uppercase text-primary font-medium mb-3">
              Real Results
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Work Speaks for Itself
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Browse completed projects across the Atlanta metro area.
            </p>
          </motion.div>

          {projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 text-left">
              {projects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link to="/projects">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.98]"
              >
                View All Projects <ArrowRight size={16} className="ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-background">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Clients Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real feedback from satisfied customers across Atlanta
            </p>
          </motion.div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-muted">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about our services
            </p>
          </motion.div>

          <Accordion type="single" collapsible className="w-full">
            {(faqs.length > 0 ? faqs : []).map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── Recruitment CTA ── */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left space-y-4">
              <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                {ctaData.hiringTagline || "We're Hiring Handymen & Techs"}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {ctaData.hiringTitle || "Grow Your Business & Join the PRO Team"}
              </h2>
              <div 
                className="text-slate-300 text-base md:text-lg leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: ctaData.hiringDescription || "Are you an experienced TV mounting technician or general handyman in the Atlanta area? Get steady jobs, weekly direct deposits, and work on your own schedule." }}
              />
            </div>
            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4 w-full md:w-auto justify-center">
              <Link to="/join" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all duration-200 active:scale-[0.98]"
                >
                  {ctaData.hiringButtonText || "Apply to Join"} <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile App Download CTA ── */}
      <section className="py-20 bg-slate-900 border-t border-slate-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_120%,rgba(230,179,119,0.1),rgba(255,255,255,0))]" />
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-slate-850/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left space-y-4">
              <span className="text-xs bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Atlanta TV Mount PRO Mobile
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Download the Mobile Application
              </h2>
              <p className="text-slate-300 text-base md:text-lg leading-relaxed">
                Manage your appointments, track your technician in real-time, view invoice histories, tip after service, and communicate with support directly from your mobile device.
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link to="/apps/customer" title="Download Customer App" className="block cursor-pointer">
                <svg className="h-[44px] w-[150px] transition-transform hover:scale-105 duration-200 border border-slate-700/50 rounded-lg shadow-md" viewBox="0 0 135 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="135" height="40" rx="6" fill="black"/>
                  <path d="M20.2 16.5C20.2 14.2 22.1 13 22.2 13C21.1 11.4 19.4 11.2 18.8 11.1C17.3 11 15.8 12 15 12C14.2 12 13 11.2 12 11.2C10.7 11.2 9.4 12 8.7 13.2C7.3 15.7 8.3 19.4 9.7 21.3C10.4 22.2 11.1 23.2 12.1 23.2C13 23.2 13.4 22.6 14.5 22.6C15.6 22.6 15.9 23.2 16.9 23.2C17.9 23.2 18.6 22.3 19.2 21.4C19.9 20.4 20.2 19.4 20.2 19.3C20.2 19.3 18.7 18.7 18.7 17C18.7 15.6 19.9 14.6 20.2 14.5C20.1 14.5 20.2 16.5 20.2 16.5ZM17.2 9.5C17.8 8.7 18.2 7.7 18.1 6.6C17.2 6.6 16.1 7.2 15.5 8C15 8.6 14.6 9.6 14.7 10.7C15.7 10.8 16.7 10.2 17.2 9.5Z" fill="white"/>
                  <text x="32" y="16" fill="white" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="7" fontWeight="500" letterSpacing="0.2">Download on the</text>
                  <text x="32" y="29" fill="white" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="13" fontWeight="bold" letterSpacing="0.2">App Store</text>
                </svg>
              </Link>
              <Link to="/apps/tech" title="Download Technician App" className="block cursor-pointer">
                <svg className="h-[44px] w-[150px] transition-transform hover:scale-105 duration-200 border border-slate-700/50 rounded-lg shadow-md" viewBox="0 0 135 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="135" height="40" rx="6" fill="black"/>
                  <path d="M12 10.5V29.5C12 30.1 12.4 30.3 12.8 30L26 20.5L12.8 10C12.4 9.7 12 9.9 12 10.5Z" fill="#00F0FF"/>
                  <path d="M12.8 10L20 15L12 23.5V10.5C12 10 12.4 9.7 12.8 10Z" fill="#00E676"/>
                  <path d="M20 15L26 20.5L20 26L12.8 30L20 15Z" fill="#FFD600"/>
                  <path d="M12 23.5L20 26L12.8 30C12.4 30.3 12 30.1 12 29.5V23.5Z" fill="#FF3D00"/>
                  <text x="35" y="16" fill="white" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="7" fontWeight="500" letterSpacing="0.2">GET IT ON</text>
                  <text x="35" y="29" fill="white" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="13" fontWeight="bold" letterSpacing="0.2">Google Play</text>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-20" style={{ backgroundColor: "#e6b377" }}>
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Stay Updated
            </h2>
            <p className="text-lg mb-8 text-gray-700">
              Subscribe for tips, special offers, and service updates from our
              team.
            </p>
            <NewsletterSignup />
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
