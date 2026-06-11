
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Tv, Hammer, Paintbrush, Wrench, Home, Droplet, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUI } from '@/contexts/UIContext';
import PageHero from '@/components/PageHero';

const services = [
  {
    icon: Tv,
    title: 'TV mounting',
    description: 'Professional wall mounting for all TV sizes',
    details: 'Our expert technicians handle TVs of all sizes, from compact 32-inch displays to massive 85-inch screens. We ensure optimal viewing angles, secure mounting on any wall type (drywall, brick, concrete), and clean cable management that keeps wires hidden. Every installation includes a level check, stud finder verification, and a final quality inspection.',
    benefits: ['All TV sizes supported', 'Clean cable management', 'Optimal viewing angles', 'Secure wall mounting', 'Same-day service available'],
    image: 'https://images.unsplash.com/photo-1698047945367-112339b04d51',
  },
  {
    icon: Hammer,
    title: 'Drywall repair',
    description: 'Expert patching and texture matching',
    details: 'From small nail holes to large damaged sections, we repair all types of drywall damage. Our process includes proper patching, sanding, texture matching, and priming. We ensure seamless repairs that blend perfectly with your existing walls, making damage completely invisible.',
    benefits: ['Hole patching', 'Crack repair', 'Texture matching', 'Smooth finishes', 'Paint-ready results'],
    image: 'https://images.unsplash.com/photo-1618832515521-3a8c6716aafc',
  },
  {
    icon: Paintbrush,
    title: 'Painting',
    description: 'Interior and exterior painting services',
    details: 'Transform your space with professional painting services. We handle everything from single rooms to entire homes, both interior and exterior. Our service includes color consultation, thorough surface preparation, quality paint application, and complete cleanup. We use premium paints and ensure clean lines and even coverage.',
    benefits: ['Color consultation', 'Surface preparation', 'Interior & exterior', 'Quality materials', 'Complete cleanup'],
    image: 'https://images.unsplash.com/photo-1629195352955-850830e4d6c9',
  },
  {
    icon: Wrench,
    title: 'Carpentry',
    description: 'Custom woodwork and repairs',
    details: 'Our skilled carpenters handle custom shelving, trim work, door installation, and repairs. Whether you need built-in storage solutions, crown molding, or door replacements, we deliver precise craftsmanship. Every project is measured carefully and built to last.',
    benefits: ['Custom shelving', 'Trim installation', 'Door repairs', 'Built-ins', 'Precise measurements'],
    image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d',
  },
  {
    icon: Home,
    title: 'Flooring',
    description: 'Professional floor installation',
    details: 'We install and repair hardwood, laminate, and tile flooring. Our process includes proper subfloor preparation, precise cutting and fitting, and professional finishing. We ensure level surfaces, tight seams, and durable installations that look great and last for years.',
    benefits: ['Hardwood installation', 'Laminate flooring', 'Tile work', 'Floor repairs', 'Subfloor prep'],
    image: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0',
  },
  {
    icon: Droplet,
    title: 'Plumbing',
    description: 'Fixture installation and repairs',
    details: 'From faucet replacements to toilet installations, we handle common plumbing tasks. Our services include fixture installation, leak repairs, drain cleaning, and minor pipe repairs. We ensure proper connections, test for leaks, and leave your plumbing working perfectly.',
    benefits: ['Fixture installation', 'Leak repairs', 'Drain cleaning', 'Faucet replacement', 'Toilet installation'],
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39',
  },
  {
    icon: Zap,
    title: 'Light electrical',
    description: 'Safe electrical installations',
    details: 'We handle light electrical work including outlet installation, switch replacement, and light fixture mounting. All work is performed safely and up to code. We test all connections and ensure proper grounding for your safety.',
    benefits: ['Outlet installation', 'Switch replacement', 'Light fixtures', 'Code compliant', 'Safety tested'],
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a',
  },
];

const ServicesPage = () => {
  const { openQuoteModal } = useUI();

  return (
    <>
      <Helmet>
        <title>Our Services - ATL TV Mount PRO</title>
        <meta name="description" content="Professional TV mounting, drywall repair, painting, carpentry, flooring, plumbing, and electrical services in Atlanta. Expert handyman services for your home." />
      </Helmet>

      <PageHero
        eyebrow="What We Do"
        title="Our Services"
        subtitle="Professional handyman services delivered with expertise and care"
        image="https://images.unsplash.com/photo-1698047945367-112339b04d51?w=1920&q=80"
        alt="Professional TV mounting service"
      />

      <div className="py-20 bg-background">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-border">
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-0 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    <div className={`${index % 2 === 1 ? 'md:order-2' : ''}`}>
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover min-h-[300px]"
                      />
                    </div>
                    <CardContent className={`p-8 flex flex-col justify-center ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                      <div className="mb-4 p-3 bg-primary/10 rounded-xl w-fit">
                        <service.icon className="w-8 h-8 text-primary" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-3">{service.title}</h2>
                      <p className="text-lg text-muted-foreground mb-4">{service.description}</p>
                      <p className="text-card-foreground leading-relaxed mb-6">{service.details}</p>
                      <ul className="space-y-2 mb-6">
                        {service.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2 text-card-foreground">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={openQuoteModal}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.98] w-fit"
                      >
                        Get a quote
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ServicesPage;
