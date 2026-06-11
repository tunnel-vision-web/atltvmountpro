
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import TestimonialCard from '@/components/TestimonialCard';

const testimonials = [
  {
    name: 'Marcus Chen',
    service: 'TV Mounting',
    rating: 5,
    text: 'Mounted my 75-inch TV perfectly. Clean cable management and finished in under 2 hours. Very professional and respectful of my home.',
  },
  {
    name: 'Priya Desai',
    service: 'Drywall Repair',
    rating: 5,
    text: 'Fixed multiple holes from old shelving. You can\'t even tell there was damage. The texture matching was perfect.',
  },
  {
    name: 'James Wilson',
    service: 'Painting',
    rating: 5,
    text: 'Repainted our living room and hallway. Professional finish and stayed on budget. They protected all our furniture and cleaned up completely.',
  },
  {
    name: 'Sofia Martinez',
    service: 'Carpentry',
    rating: 5,
    text: 'Built custom shelving for our home office. Exactly what we needed and the measurements were perfect. Very satisfied with the craftsmanship.',
  },
  {
    name: 'David Kim',
    service: 'Flooring',
    rating: 5,
    text: 'Installed laminate flooring in two bedrooms. Fast, clean, and looks amazing. They finished ahead of schedule.',
  },
  {
    name: 'Rachel Thompson',
    service: 'TV Mounting',
    rating: 5,
    text: 'Excellent service from start to finish. They helped me choose the right mount and the installation was flawless.',
  },
  {
    name: 'Michael Brown',
    service: 'Plumbing',
    rating: 5,
    text: 'Fixed a leaky faucet and installed a new toilet. Quick, professional, and reasonably priced. Highly recommend.',
  },
  {
    name: 'Lisa Anderson',
    service: 'Light Electrical',
    rating: 5,
    text: 'Installed new outlets and light fixtures in our kitchen. Everything works perfectly and looks great.',
  },
  {
    name: 'Carlos Ramirez',
    service: 'Drywall Repair',
    rating: 5,
    text: 'Repaired water damage in our ceiling. The repair is invisible and they matched the texture perfectly.',
  },
  {
    name: 'Emma Davis',
    service: 'Painting',
    rating: 5,
    text: 'Painted our entire first floor. The color consultation was helpful and the results exceeded our expectations.',
  },
];

const TestimonialsPage = () => {
  return (
    <>
      <Helmet>
        <title>Testimonials - ATL TV Mount PRO</title>
        <meta name="description" content="Read reviews from satisfied customers of ATL TV Mount PRO. See why Atlanta homeowners trust us for TV mounting, drywall repair, painting, and more." />
      </Helmet>

      <div className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Client testimonials</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real feedback from homeowners who trust ATL TV Mount PRO
            </p>
          </motion.div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} index={index} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TestimonialsPage;
