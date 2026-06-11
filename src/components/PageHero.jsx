import React from 'react';
import { motion } from 'framer-motion';

const PageHero = ({ eyebrow, title, subtitle, image, alt }) => (
  <div className="relative w-full h-[380px] overflow-hidden">
    <img
      src={image}
      alt={alt || title}
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-black/58" />
    <div className="absolute inset-0 pt-20 flex items-center justify-center">
      <div className="max-w-[1140px] w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {eyebrow && (
            <p className="text-xs tracking-[0.18em] uppercase text-primary font-medium mb-3">
              {eyebrow}
            </p>
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          {subtitle && (
            <p className="text-lg text-white/75 max-w-xl mx-auto">{subtitle}</p>
          )}
        </motion.div>
      </div>
    </div>
  </div>
);

export default PageHero;
