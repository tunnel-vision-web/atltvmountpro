import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import usePageTitle from "@/hooks/usePageTitle";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ShieldCheck,
  Calendar,
  DollarSign,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  UserCheck,
  ArrowRight,
  Clock,
  Sparkles,
  Search,
} from "lucide-react";
import pb from "@/lib/pocketbaseClient";

const SLIDES = [
  {
    image: "/images/pages/join-slide1.jpg",
    title: "Earn Up to $45 – $85 / Hour",
    description: "Atlanta TV Mount Pro is recruiting talented independent technicians. Average weekly payout: $800 - $2,500.",
    cta: "Apply Now",
    action: "apply",
  },
  {
    image: "/images/pages/join-slide2.jpg",
    title: "Weekly Direct Payouts",
    description: "Get paid automatically every week. No invoicing customers, chasing quotes, or chasing down balances.",
    cta: "Estimate Earnings",
    action: "calculator",
  },
  {
    image: "/images/pages/join-slide3.jpg",
    title: "Set Your Own Schedule",
    description: "Be your own boss. Accept jobs you want in your service area, skip the ones you don't. Work when you want.",
    cta: "Apply Now",
    action: "apply",
  },
];

const SKILLS = [
  "TV Mounting & AV Setup",
  "Drywall Repair",
  "Painting",
  "Carpentry & Custom Shelving",
  "Flooring Installation",
  "Light Plumbing",
  "Light Electrical",
];

const TOOLS = [
  "Power Drill & Screwdriver set",
  "Magnetic Stud Finder",
  "Spirit Level (24\"+)",
  "Step Ladder (6ft+)",
  "Drywall Saw & Patching knives",
  "Spackle & Sanding blocks",
];

export default function JoinPage() {
  usePageTitle("Become a Tech - Atlanta TV Mount Pro");

  // Carousel states
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5500, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setVisible(false);
      setTimeout(() => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
        setVisible(true);
      }, 120);
    };
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Calculator states
  const [jobsPerWeek, setJobsPerWeek] = useState(15);
  const avgJobPayout = 75; // average payout per completed booking
  const weeklyEarnings = useMemo(() => jobsPerWeek * avgJobPayout, [jobsPerWeek]);
  const monthlyEarnings = useMemo(() => weeklyEarnings * 4.33, [weeklyEarnings]);

  // Form states
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    zip: "",
    experience: "1-2 years",
    skills: [],
    tools: [],
    notes: "",
    bgConsent: false,
    authorized: false,
    termsConsent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const toggleTool = (tool) => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter((t) => t !== tool)
        : [...prev.tools, tool],
    }));
  };

  const handleApplyCTA = (action) => {
    if (action === "apply") {
      document.getElementById("apply-form-section")?.scrollIntoView({ behavior: "smooth" });
    } else {
      document.getElementById("earnings-calculator")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bgConsent || !formData.authorized) {
      toast.error("You must authorize the background check and certify authorization to work.");
      return;
    }
    if (!formData.termsConsent) {
      toast.error("You must agree to the Terms of Service, Privacy Policy, and Technician Membership Terms.");
      return;
    }

    setSubmitting(true);
    const applicationPayload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      zip: formData.zip,
      experience: formData.experience,
      skills: formData.skills,
      tools: formData.tools,
      notes: formData.notes,
      status: "Applied", // Initial recruitment stage
      created: new Date().toISOString(),
    };

    try {
      // Try writing to PocketBase recruitment collection if online
      await pb.collection("technician_applications").create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        zip: formData.zip,
        experience: formData.experience,
        skills: JSON.stringify(formData.skills),
        tools: JSON.stringify(formData.tools),
        notes: formData.notes,
        status: "Applied",
      }, { $autoCancel: false });

      // Save application locally
      const stored = JSON.parse(localStorage.getItem("atltv_tech_applications") || "[]");
      stored.unshift({ ...applicationPayload, id: "pb_" + Math.random().toString(36).substr(2, 5) });
      localStorage.setItem("atltv_tech_applications", JSON.stringify(stored));

      setSuccess(true);
      toast.success("Application submitted successfully!");
    } catch (err) {
      console.warn("PocketBase application save failed, caching locally:", err);
      // Save locally as offline fallback
      const stored = JSON.parse(localStorage.getItem("atltv_tech_applications") || "[]");
      stored.unshift({ ...applicationPayload, id: "local_" + Date.now() });
      localStorage.setItem("atltv_tech_applications", JSON.stringify(stored));

      setSuccess(true);
      toast.success("Application received (saved locally).");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* ── HERO CAROUSEL ── */}
      <div className="relative overflow-hidden w-full h-[85vh]">
        {/* Background Image Slides */}
        <div className="absolute inset-0">
          {SLIDES.map((slide, index) => (
            <div
              key={index}
              className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out"
              style={{ opacity: index === selectedIndex ? 1 : 0 }}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover filter brightness-[0.35]"
              />
            </div>
          ))}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-background/95 pointer-events-none" />

        {/* Embla carousel slider viewport */}
        <div className="relative h-full w-full" ref={emblaRef}>
          <div className="flex h-full">
            {SLIDES.map((slide, index) => (
              <div
                key={index}
                className="flex-[0_0_100%] min-w-0 relative h-full flex items-center justify-center"
              >
                <div className="max-w-[850px] mx-auto px-6 text-center pt-24">
                  {selectedIndex === index && (
                    <div
                      className={`hero-content ${visible ? "hero-content--visible" : "hero-content--hidden"}`}
                    >
                      <span className="hero-eyebrow text-primary font-bold text-xs tracking-[0.2em] uppercase bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full inline-block mb-4">
                        JOIN ATL'S PREMIER HANDYMAN NETWORK
                      </span>
                      <h1 className="hero-title text-4xl md:text-6xl font-black tracking-tight text-white leading-tight mb-4">
                        {slide.title}
                      </h1>
                      <p className="hero-desc text-base md:text-lg text-gray-300 max-w-xl mx-auto leading-relaxed mb-6">
                        {slide.description}
                      </p>
                      <div className="hero-cta flex gap-4 justify-center">
                        <Button
                          size="lg"
                          onClick={() => handleApplyCTA(slide.action)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12 transition-all active:scale-[0.98]"
                        >
                          {slide.cta}
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => handleApplyCTA("calculator")}
                          className="border-white/20 text-white hover:bg-white/10 hover:text-white px-8 h-12"
                        >
                          How it works
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={scrollPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full border border-white/10 bg-black/40 text-white hover:bg-black/75 transition-all z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full border border-white/10 bg-black/40 text-white hover:bg-black/75 transition-all z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 z-10">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => emblaApi && emblaApi.scrollTo(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === selectedIndex ? "w-8 bg-primary" : "w-2 bg-white/30"
              }`}
            />
          ))}
        </div>

        <style>{`
          /* Slide-in from right + fade */
          .hero-content {
            will-change: opacity, transform;
            transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
                        transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
          }
          .hero-content--hidden {
            opacity: 0;
            transform: translateX(40px);
          }
          .hero-content--visible {
            opacity: 1;
            transform: translateX(0);
          }

          /* Stagger children — each element cascades one after the other */
          .hero-content--visible .hero-eyebrow {
            animation: slideRight 0.6s 0.15s cubic-bezier(0.22,1,0.36,1) both;
          }
          .hero-content--visible .hero-title {
            animation: slideRight 0.65s 0.45s cubic-bezier(0.22,1,0.36,1) both;
          }
          .hero-content--visible .hero-desc {
            animation: slideRight 0.65s 0.75s cubic-bezier(0.22,1,0.36,1) both;
          }
          .hero-content--visible .hero-cta {
            animation: slideRight 0.65s 1.05s cubic-bezier(0.22,1,0.36,1) both;
          }

          @keyframes slideRight {
            from { opacity: 0; transform: translateX(36px); }
            to   { opacity: 1; transform: translateX(0); }
          }

          @media (prefers-reduced-motion: reduce) {
            .hero-content,
            .hero-content--visible .hero-eyebrow,
            .hero-content--visible .hero-title,
            .hero-content--visible .hero-desc,
            .hero-content--visible .hero-cta {
              animation: none;
              transition: none;
              opacity: 1;
              transform: none;
            }
          }
        `}</style>
      </div>

      {/* ── BENEFITS GRID ── */}
      <section className="py-24 max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.18em] uppercase text-primary font-bold mb-3">
            Why Atlanta TV Mount Pro?
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            We Bring You the Jobs, You Do the Work
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Say goodbye to spending hours chasing down leads, building estimates, or chasing unpaid invoices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card border border-border p-8 rounded-2xl relative overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-all">
            <div className="p-4 bg-primary/10 rounded-2xl w-fit text-primary mb-6">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Uncapped Earning Potential</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Earn between $45 and $85 per hour depending on the project. Average techs make $1,200/week working part-time.
            </p>
          </div>

          <div className="bg-card border border-border p-8 rounded-2xl relative overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-all">
            <div className="p-4 bg-primary/10 rounded-2xl w-fit text-primary mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Complete Schedule Flexibility</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Accept jobs based on your availability. Block out days off directly inside the Tech App. You set the hours.
            </p>
          </div>

          <div className="bg-card border border-border p-8 rounded-2xl relative overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-all">
            <div className="p-4 bg-primary/10 rounded-2xl w-fit text-primary mb-6">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Steady Job Pipeline</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We handle the SEO, marketing, booking platform, and customer service. You get dispatch notifications for local jobs.
            </p>
          </div>
        </div>
      </section>

      {/* ── EARNINGS CALCULATOR ── */}
      <section id="earnings-calculator" className="py-20 bg-muted/30 border-y border-border">
        <div className="max-w-[980px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs text-primary font-bold tracking-wider uppercase mb-2 block">
              EARNINGS RANGE
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              Calculate Your Earning Potential
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              See what you could be making weekly and monthly based on the average jobs completed in your neighborhood.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between font-bold text-sm">
                <span>Jobs Completed / Week</span>
                <span className="text-primary">{jobsPerWeek} jobs</span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                value={jobsPerWeek}
                onChange={(e) => setJobsPerWeek(Number(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 Job</span>
                <span>20 Jobs</span>
                <span>40 Jobs</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8 space-y-6 shadow-sm">
            <div className="pb-4 border-b border-border">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                Estimated Weekly Earnings
              </p>
              <h3 className="text-4xl font-black text-primary flex items-center">
                <DollarSign className="w-7 h-7 mr-0.5" />
                {Math.round(weeklyEarnings).toLocaleString()}
              </h3>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                Estimated Monthly Revenue
              </p>
              <h3 className="text-2xl font-black text-foreground flex items-center">
                <DollarSign className="w-5 h-5 mr-0.5" />
                {Math.round(monthlyEarnings).toLocaleString()}
              </h3>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/40 rounded-xl text-xs text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p>
                Calculations are based on an average technician job commission of <strong>${avgJobPayout}</strong> per installation. Active techs earn more by upselling mounts and dynamic HDMI configurations on-site.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ONBOARDING WORKFLOW ── */}
      <section className="py-24 max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.18em] uppercase text-primary font-bold mb-3">
            Onboarding Milestones
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            How to Get Started
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Our fast-track onboarding process gets you dispatched to your first customer in less than a week.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-lg shadow-sm">
              1
            </div>
            <h3 className="font-bold text-base">Submit Application</h3>
            <p className="text-xs text-muted-foreground leading-relaxed px-4">
              Fill out the form below detailing your experience, tools list, and service area.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-lg shadow-sm">
              2
            </div>
            <h3 className="font-bold text-base">Phone Screening</h3>
            <p className="text-xs text-muted-foreground leading-relaxed px-4">
              Schedule a quick 15-minute call with our team to talk credentials, skills, and tools.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-lg shadow-sm">
              3
            </div>
            <h3 className="font-bold text-base">Background Check</h3>
            <p className="text-xs text-muted-foreground leading-relaxed px-4">
              Provide consent for a standard identity and criminal background screening for client safety.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-lg shadow-sm">
              4
            </div>
            <h3 className="font-bold text-base">Activate & Dispatch</h3>
            <p className="text-xs text-muted-foreground leading-relaxed px-4">
              Download the Tech App, pass a virtual orientation, and start claiming jobs instantly!
            </p>
          </div>
        </div>
      </section>

      {/* ── BACKGROUND CHECK DISCLOSURE ── */}
      <section className="py-16 bg-muted/20 border-t border-border">
        <div className="max-w-[800px] mx-auto px-6 bg-card border border-border p-8 rounded-2xl flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">PRO-Level Trust & Screening</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We stand for premium quality. To protect our customers and provide total peace of mind, all network technicians must undergo a mandatory criminal and identity background check. There are no fees to you for this check, and it is processed securely in compliance with the FCRA.
            </p>
          </div>
        </div>
      </section>

      {/* ── APPLICATION FORM ── */}
      <section id="apply-form-section" className="py-24 max-w-[620px] mx-auto px-4 sm:px-6">
        <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
          {success ? (
            <div className="text-center py-10 space-y-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <UserCheck className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Application Received!</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Thank you for applying, {formData.name}. Our screening team will review your tools, skills, and zip code, and contact you within 24 hours.
                </p>
              </div>
              <Button
                onClick={() => setSuccess(false)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
              >
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold tracking-tight">Apply to the Tech Network</h3>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Step {formStep} of 3 — Provide your onboarding credentials
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${(formStep / 3) * 100}%` }}
                />
              </div>

              {/* STEP 1: CONTACT DETAILS */}
              {formStep === 1 && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="t-name">Full Name *</Label>
                    <Input
                      id="t-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="t-email">Email Address *</Label>
                      <Input
                        id="t-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="t-phone">Phone Number *</Label>
                      <Input
                        id="t-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(555) 000-0000"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="t-city">Current City *</Label>
                      <Input
                        id="t-city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Atlanta"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="t-zip">ZIP Code *</Label>
                      <Input
                        id="t-zip"
                        value={formData.zip}
                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                        placeholder="30301"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        if (!formData.name || !formData.email || !formData.phone || !formData.city || !formData.zip) {
                          toast.error("Please fill in all required fields.");
                          return;
                        }
                        setFormStep(2);
                      }}
                      className="bg-primary text-primary-foreground font-semibold px-6 flex items-center gap-1.5"
                    >
                      Next Step <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: EXPERIENCE & SKILLS */}
              {formStep === 2 && (
                <div className="space-y-4 pt-2 animate-fadeIn">
                  <div className="space-y-1.5">
                    <Label htmlFor="t-exp">Years of Handyman/AV Experience *</Label>
                    <select
                      id="t-exp"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="input-base w-full h-[38px] bg-muted/40 text-sm border-border text-foreground"
                    >
                      <option value="Less than 1 year">Less than 1 year</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5+ years">5+ years</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Select Your Active Handyman Skills *</Label>
                    <p className="text-[10px] text-muted-foreground -mt-1 mb-2">
                      Choose all service categories you are fully qualified to perform.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SKILLS.map((skill) => {
                        const hasSkill = formData.skills.includes(skill);
                        return (
                          <div
                            key={skill}
                            onClick={() => toggleSkill(skill)}
                            className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                              hasSkill
                                ? "bg-primary/10 border-primary text-foreground"
                                : "bg-muted/40 border-border text-muted-foreground hover:bg-muted/70"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={hasSkill}
                              readOnly
                              className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 bg-muted/40 pointer-events-none"
                            />
                            <span>{skill}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormStep(1)}
                      className="border-border text-muted-foreground"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        if (formData.skills.length === 0) {
                          toast.error("Please select at least one skill.");
                          return;
                        }
                        setFormStep(3);
                      }}
                      className="bg-primary text-primary-foreground font-semibold px-6 flex items-center gap-1.5"
                    >
                      Next Step <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: TOOLS, DISCLOSURES & CONSENT */}
              {formStep === 3 && (
                <div className="space-y-4 pt-2 animate-fadeIn">
                  <div className="space-y-1.5">
                    <Label>Confirm Tool Inventory</Label>
                    <p className="text-[10px] text-muted-foreground -mt-1 mb-2">
                      Check all tools you currently own and can bring to job dispatches.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {TOOLS.map((tool) => {
                        const hasTool = formData.tools.includes(tool);
                        return (
                          <div
                            key={tool}
                            onClick={() => toggleTool(tool)}
                            className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                              hasTool
                                ? "bg-primary/10 border-primary text-foreground"
                                : "bg-muted/40 border-border text-muted-foreground hover:bg-muted/70"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={hasTool}
                              readOnly
                              className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 bg-muted/40 pointer-events-none"
                            />
                            <span>{tool}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-border">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        id="t-consent"
                        checked={formData.bgConsent}
                        onChange={(e) => setFormData({ ...formData, bgConsent: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5 bg-muted/40 cursor-pointer mt-0.5"
                        required
                      />
                      <label htmlFor="t-consent" className="text-[11px] text-muted-foreground leading-snug cursor-pointer select-none">
                        I authorize Atlanta TV Mount Pro to perform a criminal and identity background check, and agree to the screening policies. *
                      </label>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        id="t-auth"
                        checked={formData.authorized}
                        onChange={(e) => setFormData({ ...formData, authorized: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5 bg-muted/40 cursor-pointer mt-0.5"
                        required
                      />
                      <label htmlFor="t-auth" className="text-[11px] text-muted-foreground leading-snug cursor-pointer select-none">
                        I certify that I am at least 18 years of age and legally authorized to work in the United States. *
                      </label>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        id="t-termsConsent"
                        checked={formData.termsConsent}
                        onChange={(e) => setFormData({ ...formData, termsConsent: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5 bg-muted/40 cursor-pointer mt-0.5"
                        required
                      />
                      <label htmlFor="t-termsConsent" className="text-[11px] text-muted-foreground leading-snug cursor-pointer select-none">
                        I have read and agree to the <Link to="/terms-of-service" className="text-primary hover:underline font-semibold" target="_blank" rel="noopener noreferrer">Terms of Service</Link>, <Link to="/privacy-policy" className="text-primary hover:underline font-semibold" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>, and <Link to="/technician-terms" className="text-primary hover:underline font-semibold" target="_blank" rel="noopener noreferrer">Technician Membership Terms</Link>. *
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <Label htmlFor="t-notes">Additional Details / Experience notes</Label>
                    <Textarea
                      id="t-notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Tell us a little more about yourself, certifications, or custom AV expertise..."
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormStep(2)}
                      className="border-border text-muted-foreground"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 flex items-center gap-1.5 active:scale-[0.98]"
                    >
                      {submitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
