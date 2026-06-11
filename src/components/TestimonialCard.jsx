
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const TestimonialCard = ({ name, service, rating, text, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="break-inside-avoid mb-6"
    >
      <Card className="transition-all duration-300 hover:shadow-lg bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-1 mb-3">
            {[...Array(rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-accent text-accent" />
            ))}
          </div>
          <p className="text-card-foreground leading-relaxed mb-4">{text}</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">{name.charAt(0)}</span>
            </div>
            <div>
              <p className="font-semibold text-card-foreground">{name}</p>
              <p className="text-sm text-muted-foreground">{service}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TestimonialCard;
