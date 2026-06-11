
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import TeamCard from '@/components/TeamCard';

const team = [
  {
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    name: 'Marcus Thompson',
    bio: 'Lead technician with 8 years of experience specializing in TV mounting and home theater installations.',
    skills: ['TV Mounting', 'Cable Management', 'Home Theater'],
  },
  {
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    name: 'James Rodriguez',
    bio: 'Senior tech with 6 years of experience in drywall repair and professional painting services.',
    skills: ['Drywall Repair', 'Painting', 'Texture Matching'],
  },
  {
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    name: 'Kevin Patel',
    bio: 'Experienced technician with 5 years specializing in carpentry and flooring installations.',
    skills: ['Carpentry', 'Flooring', 'Custom Shelving'],
  },
  {
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
    name: 'Andre Williams',
    bio: 'Certified technician with 4 years of experience in plumbing and electrical work.',
    skills: ['Plumbing', 'Electrical', 'Fixture Installation'],
  },
];

const TeamPage = () => {
  return (
    <>
      <Helmet>
        <title>Our Team - ATL TV Mount PRO</title>
        <meta name="description" content="Meet the professional technicians at ATL TV Mount PRO. Experienced, certified, and dedicated to quality handyman services in Atlanta." />
      </Helmet>

      <div className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our techs</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Meet the skilled professionals who bring expertise and care to every project
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <TeamCard key={index} {...member} index={index} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              All our technicians are background-checked, fully trained, and committed to delivering exceptional service. We take pride in our work and treat every home with respect.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default TeamPage;
