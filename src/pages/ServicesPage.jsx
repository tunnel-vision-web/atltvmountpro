import React from "react";
import usePageTitle from "@/hooks/usePageTitle";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUI } from "@/contexts/UIContext";
import PageHero from "@/components/PageHero";
import { useCMS } from "@/hooks/useCMS";

const getIconComponent = (iconName) => {
  const IconComponent = Icons[iconName];
  return IconComponent || Icons.Hammer;
};

const defaultStaticServices = [
  {
    icon: "Tv",
    title: "TV mounting",
    description: "Professional wall mounting for all TV sizes",
    details:
      "Our expert technicians handle TVs of all sizes, from compact 32-inch displays to massive 85-inch screens. We ensure optimal viewing angles, secure mounting on any wall type (drywall, brick, concrete), and clean cable management that keeps wires hidden. Every installation includes a level check, stud finder verification, and a final quality inspection.",
    benefits: [
      "All TV sizes supported",
      "Clean cable management",
      "Optimal viewing angles",
      "Secure wall mounting",
      "Same-day service available",
    ],
    image: "https://images.unsplash.com/photo-1698047945367-112339b04d51?w=900&q=80",
  },
  {
    icon: "Hammer",
    title: "Drywall repair",
    description: "Expert patching and texture matching",
    details:
      "From small nail holes to large damaged sections, we repair all types of drywall damage. Our process includes proper patching, sanding, texture matching, and priming. We ensure seamless repairs that blend perfectly with your existing walls, making damage completely invisible.",
    benefits: [
      "Hole patching",
      "Crack repair",
      "Texture matching",
      "Smooth finishes",
      "Paint-ready results",
    ],
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=900&q=80",
  },
  {
    icon: "Paintbrush",
    title: "Painting",
    description: "Interior and exterior painting services",
    details:
      "Transform your space with professional painting services. We handle everything from single rooms to entire homes, both interior and exterior. Our service includes color consultation, thorough surface preparation, quality paint application, and complete cleanup. We use premium paints and ensure clean lines and even coverage.",
    benefits: [
      "Color consultation",
      "Surface preparation",
      "Interior & exterior",
      "Quality materials",
      "Complete cleanup",
    ],
    image: "https://images.unsplash.com/photo-1629195352955-850830e4d6c9?w=900&q=80",
  },
  {
    icon: "Wrench",
    title: "Carpentry",
    description: "Custom woodwork and repairs",
    details:
      "Our skilled carpenters handle custom shelving, trim work, door installation, and repairs. Whether you need built-in storage solutions, crown molding, or door replacements, we deliver precise craftsmanship. Every project is measured carefully and built to last.",
    benefits: [
      "Custom shelving",
      "Trim installation",
      "Door repairs",
      "Built-ins",
      "Precise measurements",
    ],
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80",
  },
  {
    icon: "Home",
    title: "Flooring",
    description: "Professional floor installation",
    details:
      "We install and repair hardwood, laminate, and tile flooring. Our process includes proper subfloor preparation, precise cutting and fitting, and professional finishing. We ensure level surfaces, tight seams, and durable installations that look great and last for years.",
    benefits: [
      "Hardwood installation",
      "Laminate flooring",
      "Tile work",
      "Floor repairs",
      "Subfloor prep",
    ],
    image: "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=900&q=80",
  },
  {
    icon: "Droplet",
    title: "Plumbing",
    description: "Fixture installation and repairs",
    details:
      "From faucet replacements to toilet installations, we handle common plumbing tasks. Our services include fixture installation, leak repairs, drain cleaning, and minor pipe repairs. We ensure proper connections, test for leaks, and leave your plumbing working perfectly.",
    benefits: [
      "Fixture installation",
      "Leak repairs",
      "Drain cleaning",
      "Faucet replacement",
      "Toilet installation",
    ],
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=900&q=80",
  },
  {
    icon: "Zap",
    title: "Light electrical",
    description: "Safe electrical installations",
    details:
      "We handle light electrical work including outlet installation, switch replacement, and light fixture mounting. All work is performed safely and up to code. We test all connections and ensure proper grounding for your safety.",
    benefits: [
      "Outlet installation",
      "Switch replacement",
      "Light fixtures",
      "Code compliant",
      "Safety tested",
    ],
    image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=900&q=80",
  },
];

const ServicesPage = () => {
  const { openQuoteModal } = useUI();
  const { data: cmsServicesData } = useCMS("services");
  usePageTitle("Our Services - Atlanta TV Mount Pro");

  const allServicesList = cmsServicesData?.list || [];
  const servicesListToRender = allServicesList.length > 0 ? allServicesList : defaultStaticServices;

  return (
    <>
      <PageHero
        eyebrow="What We Do"
        title="Our Services"
        subtitle="Professional handyman services delivered with expertise and care"
        image="https://images.unsplash.com/photo-1698047945367-112339b04d51?w=1200&q=80"
        alt="Professional TV mounting service"
      />

      <div className="py-20 bg-background">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {servicesListToRender.map((service, index) => {
              const IconComponent = getIconComponent(service.icon);
              const fallbackImage = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80";
              return (
                <motion.div
                  key={service.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden border-border">
                    <div
                      className={`grid grid-cols-1 md:grid-cols-2 gap-0 ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}
                    >
                      <div className={`${index % 2 === 1 ? "md:order-2" : ""}`}>
                        <img
                          src={service.image || fallbackImage}
                          alt={service.title}
                          className="w-full h-full object-cover min-h-[300px]"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = fallbackImage;
                          }}
                        />
                      </div>
                      <CardContent
                        className={`p-8 flex flex-col justify-center ${index % 2 === 1 ? "md:order-1" : ""}`}
                      >
                        <div className="mb-4 p-3 bg-primary/10 rounded-xl w-fit">
                          <IconComponent className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-3">
                          {service.title}
                        </h2>
                        <p className="text-lg text-muted-foreground mb-4">
                          {service.description}
                        </p>
                        <p className="text-card-foreground leading-relaxed mb-6">
                          {service.details}
                        </p>
                        {service.benefits && service.benefits.length > 0 && (
                          <ul className="space-y-2 mb-6">
                            {service.benefits.map((benefit, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-2 text-card-foreground"
                              >
                                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        )}
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
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ServicesPage;
