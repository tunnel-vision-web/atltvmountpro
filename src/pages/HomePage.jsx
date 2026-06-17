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
                    <p className="text-white/75 text-sm leading-relaxed mb-5">
                      {svc.description}
                    </p>
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
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
