import React, { useEffect, useState } from "react";
import usePageTitle from "@/hooks/usePageTitle";
import { motion } from "framer-motion";
import ProjectCard from "@/components/ProjectCard";
import PageHero from "@/components/PageHero";
import DUMMY_PROJECTS from "@/data/dummyProjects";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  usePageTitle("Our Projects - Atlanta TV Mount Pro");

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch(() => {
        const stored = localStorage.getItem("atltvmountpro_local_projects");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.length > 0) {
              setProjects(parsed);
              setLoading(false);
              return;
            }
          } catch {}
        }
        setProjects(DUMMY_PROJECTS);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Our Work"
        title="Featured Projects"
        subtitle="A showcase of professional TV mounting and handyman work across the Atlanta metro area."
        image="/images/pages/page-projects.jpg"
        alt="Professional project work"
      />

      {/* Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden border border-border bg-card"
                >
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

          {(error || (!loading && !error && projects.length === 0)) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DUMMY_PROJECTS.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
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
