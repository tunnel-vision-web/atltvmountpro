
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const TeamCard = ({ photo, name, bio, skills, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card border-border overflow-hidden">
        <div className="aspect-square overflow-hidden">
          <img
            src={photo}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-2 text-card-foreground">{name}</h3>
          <p className="text-muted-foreground mb-4 leading-relaxed">{bio}</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-lg font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TeamCard;
