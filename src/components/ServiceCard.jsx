
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const ServiceCard = ({ icon: Icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card border-border">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="mb-4 p-3 bg-primary/10 rounded-xl w-fit">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-card-foreground">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ServiceCard;
