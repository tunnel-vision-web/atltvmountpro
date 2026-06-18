import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ProjectCard = ({ project, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
    >
      <Link to={`/projects/${project.id}`} className="block group">
        <div className="rounded-xl overflow-hidden bg-card border border-border hover:border-primary/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)] hover:-translate-y-1 transition-all duration-300">
          {/* Thumbnail */}
          <div className="relative h-56 overflow-hidden bg-muted">
            {project.thumbnail ? (
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                No image
              </div>
            )}
            {/* Location overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
              <div className="flex items-center gap-1 text-white/90 text-xs font-medium">
                <MapPin size={11} />
                <span>{project.location}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-semibold text-base leading-snug mb-2 text-card-foreground group-hover:text-primary transition-colors duration-200">
              {project.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
              {project.description ? project.description.replace(/<[^>]*>/g, "") : ""}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.services.slice(0, 3).map((s, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-xs font-normal bg-primary/10 text-primary border-transparent"
                >
                  {s}
                </Badge>
              ))}
              {project.services.length > 3 && (
                <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                  +{project.services.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProjectCard;
