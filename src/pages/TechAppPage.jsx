import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import usePageTitle from "@/hooks/usePageTitle";
import {
  Briefcase,
  Calendar,
  DollarSign,
  User,
  ShieldCheck,
  MapPin,
  ChevronRight,
  Clock,
  CheckCircle2,
  Navigation,
  ArrowRight,
  TrendingUp,
  Settings,
  Star,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import pb from "@/lib/pocketbaseClient";

const DEFAULT_TECH_JOBS = [
  {
    id: "mock-job-1",
    name: "Sarah Jenkins",
    service_type: "TV Mounting",
    preferred_date: new Date().toISOString().slice(0, 10),
    preferred_time: "1:00 PM - 3:00 PM",
    project_description: "Mounting 65\" TV on drywall. Conceal cables behind standard wall.",
    hardwareText: "Full-Motion Articulating Mount ($89), HDMI Cable ($19)",
    hardwareItems: [
      { name: "Full-Motion Articulating Mount", price: 89 },
      { name: "HDMI Cable", price: 19 },
    ],
    payout: 135,
    distance: "3.4 miles away (Virginia Highland)",
  },
  {
    id: "mock-job-2",
    name: "Robert Davis",
    service_type: "Drywall Repair",
    preferred_date: new Date().toISOString().slice(0, 10),
    preferred_time: "4:00 PM - 6:00 PM",
    project_description: "Patching door knob hole in living room and match orange peel texture.",
    hardwareText: "Drywall Patch & Paint Backing Kit ($15)",
    hardwareItems: [
      { name: "Drywall Patch & Paint Backing Kit", price: 15 },
    ],
    payout: 95,
    distance: "6.8 miles away (Decatur)",
  },
];

export default function TechAppPage() {
  usePageTitle("Technician App - Atlanta TV Mount Pro");

  const [activeTab, setActiveTab] = useState("jobs"); // 'jobs' | 'schedule' | 'earnings' | 'profile'
  const [bookings, setBookings] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [selectedJobDetail, setSelectedJobDetail] = useState(null);

  // Load bookings and synchronize states
  const syncBookings = () => {
    // Load local bookings
    const storedBookings = JSON.parse(localStorage.getItem("atltvmountpro_local_bookings") || "[]");
    
    // Auto-calculate tech payouts: 60% of base + 100% of hardware markup
    const baseRates = {
      "TV Mounting": 65,
      "Drywall Repair": 75,
      "Painting": 95,
      "Carpentry": 85,
      "Flooring": 120,
      "Plumbing": 80,
      "Light Electrical": 70,
    };

    const formattedBookings = storedBookings.map((b) => {
      const hardwareItems = b.hardwareItems || [];
      const hardwareSum = hardwareItems.reduce((sum, h) => sum + h.price, 0);
      const serviceBasePayout = baseRates[b.service_type] || 60;
      
      return {
        ...b,
        payout: serviceBasePayout + hardwareSum,
        distance: `${(Math.random() * 8 + 1).toFixed(1)} miles away (${b.city || "Atlanta Metro"})`,
        hardwareText: hardwareItems.length > 0 ? hardwareItems.map(h => `${h.name} ($${h.price})`).join(", ") : "None",
      };
    });

    // Merge default mock jobs if list is completely empty
    const available = formattedBookings.filter(b => b.status === "Pending");
    const mergedAvailable = available.length > 0 ? available : DEFAULT_TECH_JOBS.filter(j => !localStorage.getItem(`tech_claimed_${j.id}`));

    setBookings(mergedAvailable);

    // Active Jobs (status = "Confirmed" or "En Route" or "In Progress")
    const active = formattedBookings.filter(b => ["Confirmed", "En Route", "In Progress"].includes(b.status));
    const mockActive = [];
    DEFAULT_TECH_JOBS.forEach((j) => {
      const claimState = localStorage.getItem(`tech_claimed_${j.id}`);
      if (claimState && claimState !== "Completed") {
        mockActive.push({ ...j, status: claimState });
      }
    });
    setActiveJobs([...active, ...mockActive]);

    // Completed Jobs
    const completed = formattedBookings.filter(b => b.status === "Completed");
    const mockCompleted = [];
    DEFAULT_TECH_JOBS.forEach((j) => {
      const claimState = localStorage.getItem(`tech_claimed_${j.id}`);
      if (claimState === "Completed") {
        mockCompleted.push(j);
      }
    });
    setCompletedJobs([...completed, ...mockCompleted]);
  };

  useEffect(() => {
    syncBookings();
    // Poll local storage every 4 seconds to sync active customer booking requests
    const interval = setInterval(syncBookings, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleClaimJob = (job) => {
    // 1. Mark mock job claimed
    if (String(job.id).startsWith("mock-")) {
      localStorage.setItem(`tech_claimed_${job.id}`, "Confirmed");
      toast.success("Job Claimed successfully!");
      syncBookings();
      setSelectedJobDetail(null);
      setActiveTab("schedule");
      return;
    }

    // 2. Update real local bookings status
    const stored = JSON.parse(localStorage.getItem("atltvmountpro_local_bookings") || "[]");
    const idx = stored.findIndex(b => b.id === job.id);
    if (idx !== -1) {
      stored[idx].status = "Confirmed";
      localStorage.setItem("atltvmountpro_local_bookings", JSON.stringify(stored));
      toast.success("Job Claimed! Added to your schedule.");
      
      // Update PocketBase if synced
      try {
        pb.collection("appointment_bookings").update(job.id, { status: "Confirmed" });
      } catch {}

      syncBookings();
      setSelectedJobDetail(null);
      setActiveTab("schedule");
    }
  };

  const handleAdvanceJobStatus = (job) => {
    let nextStatus = "Confirmed";
    if (job.status === "Confirmed") nextStatus = "En Route";
    else if (job.status === "En Route") nextStatus = "In Progress";
    else if (job.status === "In Progress") nextStatus = "Completed";

    // 1. Process mock job
    if (String(job.id).startsWith("mock-")) {
      localStorage.setItem(`tech_claimed_${job.id}`, nextStatus);
      if (nextStatus === "Completed") {
        toast.success("Job completed! Payout added to your earnings.");
      } else {
        toast.info(`Job status updated to: ${nextStatus}`);
      }
      syncBookings();
      return;
    }

    // 2. Process real local booking
    const stored = JSON.parse(localStorage.getItem("atltvmountpro_local_bookings") || "[]");
    const idx = stored.findIndex(b => b.id === job.id);
    if (idx !== -1) {
      stored[idx].status = nextStatus;
      
      // If completed, update invoice status
      if (nextStatus === "Completed") {
        stored[idx].status = "Completed";
        const invoices = JSON.parse(localStorage.getItem("atltv_invoices") || "[]");
        const invIdx = invoices.findIndex(i => i.bookingId === job.id);
        if (invIdx !== -1) {
          invoices[invIdx].status = "paid";
          invoices[invIdx].paidDate = new Date().toISOString();
          invoices[invIdx].paymentMethod = "Credit Card (App)";
          localStorage.setItem("atltv_invoices", JSON.stringify(invoices));
        }
        toast.success("Job complete! Invoice marked as PAID.");
      } else {
        toast.info(`Job status: ${nextStatus}`);
      }

      localStorage.setItem("atltvmountpro_local_bookings", JSON.stringify(stored));

      // Sync to PocketBase
      try {
        pb.collection("appointment_bookings").update(job.id, { status: nextStatus });
      } catch {}

      syncBookings();
    }
  };

  const totalEarnings = useMemo(() => {
    return completedJobs.reduce((sum, j) => sum + j.payout, 0);
  }, [completedJobs]);

  return (
    <div className="bg-slate-950 min-h-screen py-10 flex items-center justify-center px-4">
      {/* ── DEVICE WRAPPER (IPHONE MOCK) ── */}
      <div className="relative w-full max-w-[390px] h-[780px] bg-slate-900 rounded-[50px] border-[10px] border-slate-800 shadow-2xl overflow-hidden flex flex-col outline outline-2 outline-white/5">
        
        {/* Dynamic Island / Bezel Top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-black rounded-b-2xl z-50 flex items-center justify-around px-2 text-[10px] text-white">
          <span className="font-semibold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="w-12 h-3 bg-black rounded-full border border-zinc-800 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
          </div>
          <span className="text-[9px] text-emerald-400 font-bold">100%</span>
        </div>

        {/* ── APP HEADER ── */}
        <header className="pt-8 pb-3 px-5 border-b border-white/5 bg-slate-900/95 flex justify-between items-center z-10 shrink-0">
          <div>
            <span className="text-[9px] uppercase font-bold text-primary tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> ATLMTech Node
            </span>
            <h1 className="text-sm font-black text-white capitalize">
              {activeTab === "jobs" && "Available Jobs"}
              {activeTab === "schedule" && "My Active Schedule"}
              {activeTab === "earnings" && "Weekly Ledger"}
              {activeTab === "profile" && "Tech Dashboard"}
            </h1>
          </div>
          <div className="flex gap-2">
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
            </div>
          </div>
        </header>

        {/* ── APP BODY ── */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 pb-20">
          <AnimatePresence mode="wait">
            
            {/* TAB: JOBS BOARD */}
            {activeTab === "jobs" && (
              <motion.div
                key="jobs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3.5"
              >
                {bookings.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="p-4 bg-white/5 rounded-2xl w-fit mx-auto text-muted-foreground">
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">No jobs in queue</p>
                      <p className="text-[10px] text-muted-foreground max-w-[200px] mx-auto mt-1">
                        We will notify you immediately when new bookings are requested in Atlanta.
                      </p>
                    </div>
                  </div>
                ) : (
                  bookings.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJobDetail(job)}
                      className="bg-slate-900 border border-white/5 p-4 rounded-2xl cursor-pointer hover:border-primary/30 transition-all space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
                            {job.service_type}
                          </span>
                          <p className="text-xs font-bold text-white mt-2">{job.name}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-muted-foreground shrink-0" /> {job.distance}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Est. Payout</p>
                          <p className="text-sm font-black text-emerald-400 mt-0.5">${job.payout}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary/80" /> {job.preferred_time || "Flexible"}
                        </span>
                        <span className="text-primary font-bold flex items-center gap-1">
                          View details <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* TAB: ACTIVE SCHEDULE */}
            {activeTab === "schedule" && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {activeJobs.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="p-4 bg-white/5 rounded-2xl w-fit mx-auto text-muted-foreground">
                      <Calendar className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Your schedule is empty</p>
                      <p className="text-[10px] text-muted-foreground max-w-[200px] mx-auto mt-1">
                        Go to the jobs board tab to accept active service dispatches.
                      </p>
                    </div>
                  </div>
                ) : (
                  activeJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-slate-900 border border-white/5 p-4 rounded-2xl space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] bg-primary/20 text-primary border border-primary/25 px-2.5 py-0.5 rounded-full font-bold">
                            {job.service_type}
                          </span>
                          <p className="text-xs font-bold text-white mt-2">{job.name}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" /> {job.distance}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full font-bold">
                            {job.status === "Confirmed" ? "Claimed" : job.status}
                          </span>
                          <p className="text-sm font-black text-emerald-400 mt-2">${job.payout}</p>
                        </div>
                      </div>

                      <div className="bg-slate-950/60 p-3 rounded-xl space-y-2 text-[10px]">
                        <p className="text-white font-medium">Job Details:</p>
                        <p className="text-muted-foreground leading-relaxed">{job.project_description}</p>
                        <p className="text-white font-medium mt-2">Required Hardware Add-ons:</p>
                        <p className="text-primary font-bold">{job.hardwareText}</p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex gap-2">
                        <Button
                          onClick={() => handleAdvanceJobStatus(job)}
                          className={`w-full text-xs font-semibold py-2.5 h-auto ${
                            job.status === "Confirmed" && "bg-blue-600 hover:bg-blue-700 text-white"
                          } ${
                            job.status === "En Route" && "bg-yellow-600 hover:bg-yellow-700 text-white"
                          } ${
                            job.status === "In Progress" && "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          {job.status === "Confirmed" && "Start Drive (On My Way)"}
                          {job.status === "En Route" && "Arrived & Start Job"}
                          {job.status === "In Progress" && "Complete & Invoice Customer"}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* TAB: EARNINGS LOG */}
            {activeTab === "earnings" && (
              <motion.div
                key="earnings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Stats Panel */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 p-5 rounded-2xl text-center space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Total Completed Commissions
                  </p>
                  <h3 className="text-3xl font-black text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 mr-0.5" /> {totalEarnings}
                  </h3>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                    <div className="bg-emerald-400 h-full w-[45%]" />
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground pt-1">
                    <span>Deposit Limit: $0</span>
                    <span>Next payout: Thursday</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                    Payout History ({completedJobs.length})
                  </p>
                  {completedJobs.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-white/5 rounded-xl text-[10px] text-muted-foreground">
                      No jobs completed this week.
                    </div>
                  ) : (
                    completedJobs.map((job, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900 border border-white/5 p-3.5 rounded-xl flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{job.name}</p>
                          <p className="text-[9px] text-muted-foreground mt-0.5">{job.service_type} • Completed</p>
                        </div>
                        <p className="font-black text-emerald-400">+${job.payout}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: PROFILE / STATUS */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                {/* Tech Info Card */}
                <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80"
                      alt="Tech profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Alex Mercer</h3>
                    <p className="text-[9px] text-muted-foreground mt-0.5">AV & Handyman Specialist</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="flex items-center gap-0.5 text-[9px] text-primary font-bold">
                        <Star className="w-2.5 h-2.5 fill-primary text-primary" /> 4.93
                      </span>
                      <span className="text-[9px] text-muted-foreground">(84 reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Screening Badges */}
                <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 space-y-3.5">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Trust & Compliance
                  </h4>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Background Screening</span>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                      Verified & Approved
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>Work Authorization</span>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                      Authorized US Tech
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      <span>Orientation Completed</span>
                    </div>
                    <span className="text-[9px] bg-primary/20 text-primary border border-primary/25 px-2 py-0.5 rounded-full font-bold">
                      100% Complete
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 space-y-2.5 text-xs text-muted-foreground">
                  <p className="font-bold text-white text-[10px] uppercase tracking-wider mb-1">Toolbox Verification</p>
                  <p>✓ Magnetic Stud Finder</p>
                  <p>✓ High-Torque Power Drill</p>
                  <p>✓ Level & Measurement Tape</p>
                  <p>✓ Heavy-Duty Toggle Anchors kit</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ── APP FOOTER / NAVIGATION ── */}
        <nav className="absolute bottom-0 left-0 right-0 h-16 bg-slate-900/95 border-t border-white/5 flex justify-around items-center z-10">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex flex-col items-center gap-1 text-[10px] ${
              activeTab === "jobs" ? "text-primary font-bold" : "text-muted-foreground hover:text-white"
            }`}
          >
            <Briefcase className="w-4.5 h-4.5" />
            <span>Jobs</span>
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex flex-col items-center gap-1 text-[10px] ${
              activeTab === "schedule" ? "text-primary font-bold" : "text-muted-foreground hover:text-white"
            }`}
          >
            <Calendar className="w-4.5 h-4.5" />
            <span>My Jobs</span>
          </button>
          <button
            onClick={() => setActiveTab("earnings")}
            className={`flex flex-col items-center gap-1 text-[10px] ${
              activeTab === "earnings" ? "text-primary font-bold" : "text-muted-foreground hover:text-white"
            }`}
          >
            <DollarSign className="w-4.5 h-4.5" />
            <span>Earnings</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center gap-1 text-[10px] ${
              activeTab === "profile" ? "text-primary font-bold" : "text-muted-foreground hover:text-white"
            }`}
          >
            <User className="w-4.5 h-4.5" />
            <span>Profile</span>
          </button>
        </nav>

        {/* ── DETAIL MODAL (CLAIM POPUP) ── */}
        {selectedJobDetail && (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-end animate-fadeIn">
            <div className="bg-slate-900 border-t border-white/10 rounded-t-3xl w-full p-5 space-y-4 max-h-[85%] overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-xs font-bold text-white">Booking Details</h3>
                <button
                  onClick={() => setSelectedJobDetail(null)}
                  className="text-xs font-bold text-muted-foreground hover:text-white bg-white/5 px-2.5 py-1 rounded-full"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[10px] bg-primary/20 text-primary border border-primary/25 px-2.5 py-0.5 rounded-full font-bold">
                    {selectedJobDetail.service_type}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-2.5">{selectedJobDetail.name}</h4>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" /> {selectedJobDetail.distance}
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl space-y-2 text-[10px]">
                  <p className="text-white font-semibold">Preferred Schedule:</p>
                  <p className="text-muted-foreground">{selectedJobDetail.preferred_date} • {selectedJobDetail.preferred_time || "Flexible Time"}</p>
                  
                  <p className="text-white font-semibold mt-2.5">Customer Description:</p>
                  <p className="text-muted-foreground leading-relaxed">{selectedJobDetail.project_description}</p>

                  <p className="text-white font-semibold mt-2.5 font-bold">Required Hardware Add-ons:</p>
                  <p className="text-primary font-bold">{selectedJobDetail.hardwareText}</p>
                </div>

                <div className="flex justify-between items-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Estimated Job Payout</p>
                    <p className="text-lg font-black text-emerald-400 mt-0.5">${selectedJobDetail.payout}</p>
                  </div>
                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Guaranteed Weekly Payout
                  </span>
                </div>

                <Button
                  onClick={() => handleClaimJob(selectedJobDetail)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] mt-2 h-auto"
                >
                  Claim & Accept Job <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
