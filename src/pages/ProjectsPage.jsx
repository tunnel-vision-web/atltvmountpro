import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import ProjectCard from '@/components/ProjectCard';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load');
        return r.json();
      })
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>Our Projects — ATL TV Mount PRO</title>
        <meta
          name="description"
          content="See our completed TV mounting and handyman projects across the Atlanta metro area."
        />
      </Helmet>

      {/* Page header */}
      <div className="pt-32 pb-16 bg-muted border-b border-border">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs tracking-[0.18em] uppercase text-primary font-medium mb-3">
              Our Work
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Featured Projects</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              A showcase of professional TV mounting and handyman work across the Atlanta metro area.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-border bg-card">
                  <div className="h-56 bg-muted animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-full" />
                    <div className="h-3 bg-muted animate-pulse rounded w-5/6" />
                    <div className="flex gap-2 pt-1">
                      <div className="h-5 bg-muted animate-pulse rounded-full w-20" />
                      <div className="h-5 bg-muted animate-pulse rounded-full w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-16 text-muted-foreground">
              Could not load projects. Please try again.
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              No projects yet. Check back soon!
            </div>
          )}

          {!loading && !error && projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ProjectsPage;
