
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Tv, Hammer, Paintbrush, Wrench, Home, Droplet, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import HeroCarousel from '@/components/HeroCarousel';
import ServiceCard from '@/components/ServiceCard';
import TestimonialCard from '@/components/TestimonialCard';
import NewsletterSignup from '@/components/NewsletterSignup';
import { useUI } from '@/contexts/UIContext';

const services = [
  {
    icon: Tv,
    title: 'TV mounting',
    description: 'Professional wall mounting for all TV sizes with clean cable management and optimal viewing angles',
  },
  {
    icon: Hammer,
    title: 'Drywall repair',
    description: 'Expert patching of holes, crack repairs, smooth finishes, and texture matching for seamless results',
  },
  {
    icon: Paintbrush,
    title: 'Painting',
    description: 'Interior and exterior painting services with color consultation and thorough prep work included',
  },
  {
    icon: Wrench,
    title: 'Carpentry',
    description: 'Custom shelving, trim work, door installation, and professional carpentry repairs',
  },
  {
    icon: Home,
    title: 'Flooring',
    description: 'Hardwood, laminate, and tile installation with expert repair services',
  },
  {
    icon: Droplet,
    title: 'Plumbing',
    description: 'Fixture installation, leak repairs, and drain cleaning services',
  },
  {
    icon: Zap,
    title: 'Light electrical',
    description: 'Outlet installation, switch replacement, and light fixture mounting',
  },
];

const testimonials = [
  {
    name: 'Marcus Chen',
    service: 'TV Mounting',
    rating: 5,
    text: 'Mounted my 75-inch TV perfectly. Clean cable management and finished in under 2 hours.',
  },
  {
    name: 'Priya Desai',
    service: 'Drywall Repair',
    rating: 5,
    text: 'Fixed multiple holes from old shelving. You can\'t even tell there was damage.',
  },
  {
    name: 'James Wilson',
    service: 'Painting',
    rating: 5,
    text: 'Repainted our living room and hallway. Professional finish and stayed on budget.',
  },
  {
    name: 'Sofia Martinez',
    service: 'Carpentry',
    rating: 5,
    text: 'Built custom shelving for our home office. Exactly what we needed.',
  },
  {
    name: 'David Kim',
    service: 'Flooring',
    rating: 5,
    text: 'Installed laminate flooring in two bedrooms. Fast, clean, and looks amazing.',
  },
];

const faqs = [
  {
    question: 'What areas do you serve?',
    answer: 'We serve the Atlanta metro area and throughout Georgia. Contact us to confirm service availability in your specific location.',
  },
  {
    question: 'How much does TV mounting cost?',
    answer: 'TV mounting starts at $120 and varies based on TV size, wall type, and complexity of cable management. Contact us for a free quote.',
  },
  {
    question: 'Do you offer same-day service?',
    answer: 'Yes, we offer same-day service with a $40 rush fee, subject to availability. Book early for best availability.',
  },
  {
    question: 'Are you licensed and insured?',
    answer: 'Yes, we are fully licensed and insured for all services we provide, giving you peace of mind.',
  },
  {
    question: 'What\'s your guarantee?',
    answer: 'We offer a 100% satisfaction guarantee on all work. If you\'re not happy, we\'ll make it right.',
  },
];

const HomePage = () => {
  const { openQuoteModal } = useUI();

  return (
    <>
      <Helmet>
        <title>ATL TV Mount PRO - Professional TV Mounting & Handyman Services in Atlanta</title>
        <meta name="description" content="Expert TV mounting, drywall repair, painting, and handyman services in Atlanta metro area. Same-day service available. Call 770-374-3203 for a free quote." />
      </Helmet>

      <HeroCarousel />

      <section className="py-20 bg-background">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional handyman services for your home and business
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {services.slice(0, 4).map((service, index) => (
              <ServiceCard key={index} {...service} index={index} />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {services.slice(4).map((service, index) => (
              <ServiceCard key={index + 4} {...service} index={index + 4} />
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={openQuoteModal}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.98]"
            >
              Get a free quote
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What our clients say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real feedback from satisfied customers
            </p>
          </motion.div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently asked questions</h2>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about our services
            </p>
          </motion.div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay updated</h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Subscribe to our newsletter for tips, special offers, and service updates
            </p>
            <NewsletterSignup />
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
