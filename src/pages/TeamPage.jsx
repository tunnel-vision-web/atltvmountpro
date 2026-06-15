import React, { useEffect, useState } from "react";
import usePageTitle from "@/hooks/usePageTitle";
import { motion } from "framer-motion";
import TeamCard from "@/components/TeamCard";
import PageHero from "@/components/PageHero";
import pb from "@/lib/pocketbaseClient";

const STATIC_TEAM = [
  {
    photo: "/images/team/team-1.jpg",
    photoFallback:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    name: "Marcus Thompson",
    bio: "Lead technician with 8 years of experience specializing in TV mounting, home theater installations, and AV equipment setup.",
    skills: ["TV Mounting", "Cable Management", "Home Theater", "AV Setup"],
  },
  {
    photo: "/images/team/team-2.jpg",
    photoFallback:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    name: "James Rodriguez",
    bio: "Senior tech with 6 years of experience delivering flawless drywall repairs and professional interior painting across metro Atlanta.",
    skills: ["Drywall Repair", "Painting", "Texture Matching", "Priming"],
  },
  {
    photo: "/images/team/team-3.jpg",
    photoFallback:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
    name: "Kevin Patel",
    bio: "Experienced technician with 5 years specializing in custom carpentry builds and precision flooring installation.",
    skills: ["Carpentry", "Flooring", "Custom Shelving", "Trim Work"],
  },
  {
    photo: "/images/team/team-4.jpg",
    photoFallback:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
    name: "Andre Williams",
    bio: "Certified technician with 4 years handling fixture installations, minor plumbing repairs, and light electrical upgrades safely and efficiently.",
    skills: [
      "Plumbing",
      "Light Electrical",
      "Fixture Installation",
      "Drain Cleaning",
    ],
  },
  {
    photo: "/images/team/team-5.jpg",
    photoFallback:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    name: "Darius Jackson",
    bio: "Versatile handyman with 7 years across all service categories. Go-to tech for complex multi-trade jobs and same-day emergency calls.",
    skills: ["TV Mounting", "Drywall Repair", "Carpentry", "Same-Day Service"],
  },
  {
    photo: "/images/team/team-6.jpg",
    photoFallback:
      "https://images.unsplash.com/photo-1560250097-0dc05ae561e0?w=400&q=80",
    name: "Carlos Mendez",
    bio: "Flooring and painting specialist with a keen eye for detail. Known for delivering showroom-quality finishes on every project.",
    skills: ["Flooring", "Painting", "Surface Prep", "Color Consultation"],
  },
];

const TeamPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  usePageTitle("Our Team - Atlanta TV Mount Pro");

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const records = await pb.collection("team_members").getFullList({
          sort: "created",
        });
        if (records && records.length > 0) {
          // Map pocketbase record properties to standard fields
          const mapped = records.map((r) => ({
            id: r.id,
            photo: r.photo || "/images/team/team-placeholder.jpg",
            name: r.name,
            bio: r.bio,
            skills: Array.isArray(r.skills)
              ? r.skills
              : r.skills
                ? JSON.parse(r.skills)
                : [],
          }));
          setTeamMembers(mapped);
        } else {
          setTeamMembers(STATIC_TEAM);
        }
      } catch (error) {
        console.warn(
          "Failed to load team from PocketBase, using static fallback:",
          error,
        );
        setTeamMembers(STATIC_TEAM);
      } finally {
        setLoading(false);
      }
    };
    loadTeam();
  }, []);

  return (
    <>
      <PageHero
        eyebrow="The Team"
        title="Our Techs"
        subtitle="Meet the skilled professionals who bring expertise and care to every project"
        image="/images/pages/page-team.jpg"
        alt="Professional technicians at work"
      />

      <div className="py-20 bg-background">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-muted animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <TeamCard key={member.id || index} {...member} index={index} />
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              All our technicians are background-checked, fully trained, and
              committed to delivering exceptional service. We take pride in our
              work and treat every home with respect.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default TeamPage;
