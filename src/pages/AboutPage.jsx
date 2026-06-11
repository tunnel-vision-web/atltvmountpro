
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Award, Clock, Shield, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUI } from '@/contexts/UIContext';
import PageHero from '@/components/PageHero';

const stats = [
  { icon: Clock, label: 'Years experience', value: '5+' },
  { icon: Users, label: 'Installations completed', value: '1,000+' },
  { icon: Award, label: 'Satisfaction rate', value: '98.7%' },
  { icon: Shield, label: 'Licensed & insured', value: 'Yes' },
];

const AboutPage = () => {
  const { openBookingModal } = useUI();

  return (
    <>
      <Helmet>
        <title>About Us - ATL TV Mount PRO</title>
        <meta name="description" content="Learn about ATL TV Mount PRO - 5+ years of professional handyman services in Atlanta with 1,000+ installations completed. Licensed, insured, and trusted." />
      </Helmet>

      <PageHero
        eyebrow="About Us"
        title="About ATL TV Mount PRO"
        subtitle="Your trusted partner for professional handyman services in Atlanta"
        image="https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=1920&q=80"
        alt="Professional handyman at work"
      />

      <div className="py-20 bg-background">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img
                src="https://images.unsplash.com/photo-1581858726788-75bc0f6a952d"
                alt="Professional handyman at work"
                className="rounded-2xl shadow-lg w-full"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-4">Our story</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Founded in 2021, ATL TV Mount PRO started with a simple mission: provide reliable, professional handyman services to the Atlanta community. What began as a TV mounting specialty has grown into a full-service handyman company serving thousands of satisfied customers.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our team of skilled technicians brings years of experience and a commitment to quality workmanship. We take pride in every project, whether it's mounting a TV, repairing drywall, or completing a full room renovation.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We're fully licensed and insured, and we stand behind our work with a 100% satisfaction guarantee. When you choose ATL TV Mount PRO, you're choosing professionalism, reliability, and expertise.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="text-center bg-card border-border">
                  <CardContent className="p-6">
                    <div className="mb-4 p-3 bg-primary/10 rounded-xl w-fit mx-auto">
                      <stat.icon className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-3xl font-bold mb-2 text-card-foreground">{stat.value}</p>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-primary text-primary-foreground rounded-2xl p-12 text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Why choose us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-2">Professional credentials</h3>
                <p className="text-primary-foreground/90">
                  Fully licensed and insured for your peace of mind
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Same-day service</h3>
                <p className="text-primary-foreground/90">
                  Available with $40 rush fee, subject to availability
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Quality guarantee</h3>
                <p className="text-primary-foreground/90">
                  100% satisfaction guarantee on all work
                </p>
              </div>
            </div>
            <Button
              onClick={openBookingModal}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 transition-all duration-200 active:scale-[0.98]"
            >
              Book your service today
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
