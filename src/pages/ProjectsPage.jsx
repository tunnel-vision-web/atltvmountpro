import React, { useEffect, useState } from "react";
import usePageTitle from "@/hooks/usePageTitle";
import { motion } from "framer-motion";
import ProjectCard from "@/components/ProjectCard";
import PageHero from "@/components/PageHero";

const DUMMY_PROJECTS = [
  {
    id: "demo-1",
    title: '75" Samsung Frame TV — Living Room Mount',
    location: "Buckhead, Atlanta, GA",
    description:
      "Full-wall mount installation for a 75-inch Samsung Frame TV with complete in-wall cable concealment and soundbar bracket. Client wanted a gallery-wall look with zero visible wires.",
    services: ["TV Mounting", "Cable Management"],
    thumbnail:
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1200&q=80",
    ],
  },
  {
    id: "demo-2",
    title: "Master Bedroom Drywall Repair & Repaint",
    location: "Midtown, Atlanta, GA",
    description:
      "Repaired multiple large holes left by a removed shelving system. Matched existing orange-peel texture, primed, and repainted the entire accent wall — completely invisible finish.",
    services: ["Drywall Repair", "Painting", "Texture Matching"],
    thumbnail:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&q=80",
    ],
  },
  {
    id: "demo-3",
    title: "Full Interior Repaint — 4-Room Home",
    location: "Sandy Springs, GA",
    description:
      "Complete interior repaint covering living room, dining room, and two bedrooms. Included free color consultation, full surface prep, and two-coat premium low-VOC application.",
    services: ["Painting"],
    thumbnail:
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&q=80",
    ],
  },
  {
    id: "demo-4",
    title: "Custom Built-In Shelving — Home Office",
    location: "Decatur, GA",
    description:
      "Designed and built a floor-to-ceiling shelving unit for a dedicated home office. Client supplied materials; we handled all measuring, cutting, assembly, and finishing.",
    services: ["Carpentry", "Custom Shelving"],
    thumbnail:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
    ],
  },
  {
    id: "demo-5",
    title: "Engineered Hardwood Flooring — 3 Bedrooms",
    location: "Marietta, GA",
    description:
      "Removed old carpet and installed 1,200 sq ft of engineered hardwood across three bedrooms. Included subfloor leveling, underlayment, and coordinated shoe-molding installation.",
    services: ["Flooring"],
    thumbnail:
      "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=1200&q=80",
    ],
  },
  {
    id: "demo-6",
    title: "Basement Home Theater Build-Out",
    location: "Alpharetta, GA",
    description:
      "85-inch display wall-mounted with full in-wall wiring, 7.1 surround system, ceiling fan install, new dedicated outlets for all AV equipment, and custom media console carpentry.",
    services: [
      "TV Mounting",
      "Light Electrical",
      "Carpentry",
      "Cable Management",
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=1200&q=80",
    ],
  },
];

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  usePageTitle("Our Projects - ATL TV Mount PRO");

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
        setError(true);
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
