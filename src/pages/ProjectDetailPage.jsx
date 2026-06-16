import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import usePageTitle from "@/hooks/usePageTitle";
import DUMMY_PROJECTS from "@/data/dummyProjects";
import { motion } from "framer-motion";
import { MapPin, ChevronLeft, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProjectCarousel from "@/components/ProjectCarousel";
import { useUI } from "@/contexts/UIContext";

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { openBookingModal, openQuoteModal } = useUI();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  usePageTitle(
    project ? `${project.title} — Atlanta TV Mount Pro` : "Atlanta TV Mount Pro",
  );

  useEffect(() => {
    setLoading(true);
    // Check demo projects first (no API needed)
    const demoMatch = DUMMY_PROJECTS.find((p) => p.id === id);
    if (demoMatch) {
      setProject(demoMatch);
      setLoading(false);
      return;
    }
    // Check local storage projects next
    const stored = localStorage.getItem("atltvmountpro_local_projects");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const match = parsed?.find((p) => String(p.id) === String(id));
        if (match) {
          setProject(match);
          setLoading(false);
          return;
        }
      } catch {}
    }
    fetch(`/api/projects/${id}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          setLoading(false);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setProject(data);
          setLoading(false);
        }
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="pt-28 pb-20 flex flex-col items-center gap-4">
        <div
          className="w-full bg-muted"
          style={{ height: "min(65vh, 620px)" }}
        />
        <div className="max-w-[800px] w-full px-4 mt-8 space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded w-2/3" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
          <div className="h-24 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="pt-40 pb-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Project not found</h1>
        <Link to="/projects">
          <Button variant="outline">← Back to Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Carousel (full-width, sits behind the fixed header) */}
      <div className="pt-20">
        <ProjectCarousel images={project.images} title={project.title} />
      </div>

      {/* Details */}
      <section className="py-16 bg-background">
        <div className="max-w-[840px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            {/* Back link */}
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 mb-8"
            >
              <ChevronLeft size={14} />
              All Projects
            </Link>

            {/* Title & location */}
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {project.title}
            </h1>
            <div className="flex items-center gap-1.5 text-muted-foreground mb-8">
              <MapPin size={15} className="text-primary" />
              <span className="text-sm">{project.location}</span>
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed text-base mb-10">
              {project.description}
            </p>

            {/* Services */}
            <div className="border-t border-border pt-8 mb-10">
              <h2 className="font-semibold text-lg mb-4">Services Provided</h2>
              <div className="flex flex-wrap gap-2">
                {project.services.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm font-medium"
                  >
                    <CheckCircle2 size={14} />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-muted rounded-2xl p-8 text-center border border-border">
              <h3 className="text-xl font-bold mb-2">Want a similar result?</h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Get a free estimate or book our team for your project.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  onClick={openQuoteModal}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.98]"
                >
                  Estimate My Job
                </Button>
                <Button
                  variant="outline"
                  onClick={openBookingModal}
                  className="transition-all duration-200 active:scale-[0.98]"
                >
                  Book a Service
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default ProjectDetailPage;
