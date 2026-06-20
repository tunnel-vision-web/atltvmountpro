import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import usePageTitle from "@/hooks/usePageTitle";
import {
  useClientAuth,
  getLocalJobs,
  updateLocalJob,
} from "@/contexts/ClientAuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ClipboardList,
  Calendar,
  Wrench,
  ArrowLeft,
  DollarSign,
  CreditCard,
  CheckCircle2,
  Send,
  Mail,
  Smartphone,
  MessageSquare,
  UserCheck,
  FileText,
  Clock,
  Sparkles,
  AlertTriangle,
  Lock,
  Shield,
  Plus,
  Play,
  Check,
  Upload,
  BookOpen,
  Award,
  CheckCircle,
  HelpCircle,
  Eye,
  EyeOff,
  Camera,
  Trash2,
} from "lucide-react";
import {
  getInvoices,
  getInvoiceForBooking,
  autoCreateInvoiceForBooking,
  sendInvoiceVia,
  saveInvoices,
} from "@/lib/invoiceUtils";
import { getEscrowLedger, createEscrowEntry } from "@/lib/escrowUtils";
import pb from "@/lib/pocketbaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const LOCAL_BOOKINGS_KEY = "atltvmountpro_local_bookings";
const LOCAL_TECH_APPLICATIONS_KEY = "atltv_tech_applications";

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "in-progress": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  invoiced: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  paid: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

function getLocalBookings() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalBookings(bookings) {
  localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
}

function getTQSScore(email) {
  try {
    const team = JSON.parse(localStorage.getItem("atltvmountpro_local_team") || "[]");
    const matched = team.find(t => t.email?.toLowerCase() === email?.toLowerCase());
    return matched?.tqs !== undefined ? matched.tqs : 100;
  } catch {
    return 100;
  }
}

function getIsSuspended(email) {
  try {
    const team = JSON.parse(localStorage.getItem("atltvmountpro_local_team") || "[]");
    const matched = team.find(t => t.email?.toLowerCase() === email?.toLowerCase());
    return matched?.isSuspended || false;
  } catch {
    return false;
  }
}

const ClientDashboard = () => {
  usePageTitle({
    title: "Client Dashboard - Atlanta TV Mount PRO",
    robots: "noindex, nofollow",
  });

  const { user, isAuthenticated, isCustomer, isTech, updateProfile } = useClientAuth();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [assignedBookings, setAssignedBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState("jobs");

  const isSuspended = user ? getIsSuspended(user.email) : false;
  const tqsScore = user ? getTQSScore(user.email) : 100;

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  const [showSendInvoice, setShowSendInvoice] = useState(false);
  const [invoiceToSend, setInvoiceToSend] = useState(null);

  // Onboarding States
  const [application, setApplication] = useState(null);
  const [checkingApp, setCheckingApp] = useState(true);

  // Modals for Recruits/Techs
  const [showBgModal, setShowBgModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // Submitting States
  const [submittingBg, setSubmittingBg] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Form states
  const [bgForm, setBgForm] = useState({ fullName: "", ssn: "", consent: false });
  const [payoutForm, setPayoutForm] = useState({ method: "direct_deposit", bankName: "", routing: "", account: "", cashapp: "" });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSsn, setShowSsn] = useState(false);
  
  // Stripe Checkout & Escrow States
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [paymentTip, setPaymentTip] = useState(0);
  const [customTipValue, setCustomTipValue] = useState("");
  const [stripeCardNumber, setStripeCardNumber] = useState("");
  const [stripeCardExpiry, setStripeCardExpiry] = useState("");
  const [stripeCardCvc, setStripeCardCvc] = useState("");
  const [stripeCardName, setStripeCardName] = useState("");
  const [checkoutStatus, setCheckoutStatus] = useState("idle");
  const [escrowHolds, setEscrowHolds] = useState([]);

  // Availability Schedule State
  const [weeklySchedule, setWeeklySchedule] = useState({
    Monday: { active: true, slots: ["morning", "afternoon"] },
    Tuesday: { active: true, slots: ["morning", "afternoon"] },
    Wednesday: { active: true, slots: ["morning", "afternoon"] },
    Thursday: { active: true, slots: ["morning", "afternoon"] },
    Friday: { active: true, slots: ["morning", "afternoon"] },
    Saturday: { active: false, slots: [] },
    Sunday: { active: false, slots: [] },
  });

  useEffect(() => {
    if (user?.email) {
      try {
        const savedAvailability = localStorage.getItem(`atltv_tech_availability_${user.email}`);
        if (savedAvailability) {
          setWeeklySchedule(JSON.parse(savedAvailability));
        }
        const savedPayout = localStorage.getItem(`atltv_payout_${user.email}`);
        if (savedPayout) {
          setPayoutForm(JSON.parse(savedPayout));
        }
      } catch (e) {
        console.error("Error loading profile storage caches:", e);
      }
    }
  }, [user]);

  // Profile settings form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    bio: "",
    preferredChannel: "Email",
    payoutMethod: "direct_deposit",
    bankName: "",
    routing: "",
    account: "",
    cashapp: "",
    avatar: "",
  });

  // Sync profile form when user or application changes
  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        preferredChannel: user.preferredChannel || user.OptIn_Channel || "Email",
        bio: prev.bio || "",
        avatar: user.avatar || "",
      }));
    }
  }, [user]);

  // Load bio from application if exists
  useEffect(() => {
    if (application) {
      setProfileForm((prev) => ({
        ...prev,
        bio: application.bio || prev.bio || "",
      }));
    }
  }, [application]);

  // Sync payout fields into profileForm when payoutForm changes
  useEffect(() => {
    if (payoutForm) {
      setProfileForm((prev) => ({
        ...prev,
        payoutMethod: payoutForm.method || "direct_deposit",
        bankName: payoutForm.bankName || "",
        routing: payoutForm.routing || "",
        account: payoutForm.account || "",
        cashapp: payoutForm.cashapp || "",
      }));
    }
  }, [payoutForm]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("Image size exceeds 1MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm((prev) => ({
        ...prev,
        avatar: reader.result,
      }));
      toast.success("Photo uploaded! Click 'Save Profile Settings' to save.");
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        newPassword: profileForm.newPassword || null,
        preferredChannel: profileForm.preferredChannel || null,
        avatar: profileForm.avatar,
      });

      // Update technician application bio locally and in PocketBase if active tech
      if (isTech && application) {
        try {
          if (application.id && !application.id.startsWith("local_")) {
            await pb.collection("technician_applications").update(application.id, {
              bio: profileForm.bio,
            });
          }
        } catch (e) {
          console.warn("PocketBase bio update failed:", e);
        }

        const stored = JSON.parse(localStorage.getItem(LOCAL_TECH_APPLICATIONS_KEY) || "[]");
        const idx = stored.findIndex((a) => a.email === user.email);
        if (idx !== -1) {
          stored[idx] = { ...stored[idx], bio: profileForm.bio };
          localStorage.setItem(LOCAL_TECH_APPLICATIONS_KEY, JSON.stringify(stored));
        }
        setApplication((prev) => prev ? { ...prev, bio: profileForm.bio } : null);
        updateOnboardingKey("profileSetup", true);
      }

      // Update Payout details if technician
      if (isTech) {
        if (profileForm.payoutMethod === "direct_deposit" && (!profileForm.bankName || !profileForm.routing || !profileForm.account)) {
          toast.error("Please fill in all direct deposit fields.");
          return;
        }
        if (profileForm.payoutMethod === "cashapp" && !profileForm.cashapp) {
          toast.error("Please enter your CashApp Cashtag.");
          return;
        }

        const newPayout = {
          method: profileForm.payoutMethod,
          bankName: profileForm.bankName,
          routing: profileForm.routing,
          account: profileForm.account,
          cashapp: profileForm.cashapp,
        };
        
        setPayoutForm(newPayout);
        localStorage.setItem(`atltv_payout_${user.email}`, JSON.stringify(newPayout));
        updateOnboardingKey("payoutSetup", true);
      }

      setProfileForm(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      toast.error("Profile update failed: " + err.message);
    }
  };

  // Quiz states
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const quizQuestions = [
    {
      q: "What must you always check before mounting a TV on a drywall?",
      options: [
        "Color of the drywall paint",
        "Locations of studs using a stud finder",
        "Distance to the kitchen",
        "Television sound levels"
      ],
      correct: 1
    },
    {
      q: "What is the industry recommended safe load limit for heavy-duty toggle bolts in 1/2\" drywall?",
      options: [
        "Under 10 lbs",
        "Between 50 - 70 lbs depending on shear direction",
        "Over 300 lbs",
        "Drywall should never hold any weight directly"
      ],
      correct: 1
    },
    {
      q: "What is the standard viewing height rule of thumb when mounting in a living room?",
      options: [
        "As close to the ceiling as possible",
        "Center of the screen at seated eye level (approx. 42 inches from floor)",
        "Flat against the baseboard",
        "Exactly 6 feet from the floor regardless of seating"
      ],
      correct: 1
    }
  ];

  // Load user data and check application
  useEffect(() => {
    if (!user) return;

    let activeJobsList = [];

    // Fetch jobs and invoices
    if (isTech) {
      const bookings = getLocalBookings().filter(
        (b) =>
          b.assignedTechName === user.name ||
          String(b.assignedTechId) === String(user.id) ||
          (user.email && b.assignedTechEmail === user.email),
      );
      setAssignedBookings(bookings);
      
      const holds = getEscrowLedger().filter(
        (e) =>
          e.techEmail === user.email ||
          String(e.techId) === String(user.id) ||
          e.techName === user.name
      );
      setEscrowHolds(holds);

      activeJobsList = bookings.map((b) => ({
        id: b.id,
        service: b.service_type || b.service || "TV Mounting",
        date: b.preferred_date || b.Preferred_Date,
        status: (b.status || "Pending").toLowerCase(),
      }));
    } else {
      const allJobs = getLocalJobs();
      const myJobsFromLocalJobs = allJobs.filter(
        (j) => j.clientId === user.id || j.clientEmail === user.email,
      );
      
      const myBookings = getLocalBookings().filter(
        (b) =>
          b.clientId === user.id ||
          (user.email && (b.email?.toLowerCase() === user.email.toLowerCase() || b.clientEmail?.toLowerCase() === user.email.toLowerCase())),
      );
      
      const normalizedBookings = myBookings.map((b) => ({
        id: b.id,
        clientId: b.clientId || user.id,
        clientEmail: b.email || b.clientEmail || user.email,
        service: b.service_type || b.service || "TV Mounting",
        date: b.preferred_date || b.Preferred_Date,
        time: b.preferred_time || b.Preferred_Time,
        status: (b.status || "Pending").toLowerCase(),
        description: b.project_description || b.Project_Description || "",
        estimatedQuote: b.estimated_quote || b.Estimated_Quote || "0.00",
      }));
      
      const mergedJobs = [...myJobsFromLocalJobs];
      normalizedBookings.forEach((b) => {
        if (!mergedJobs.some((j) => j.id === b.id)) {
          mergedJobs.push(b);
        }
      });
      
      setJobs(mergedJobs);
      activeJobsList = mergedJobs;
    }

    const allInvoices = getInvoices();
    const myInvoices = allInvoices.filter(
      (inv) =>
        inv.clientId === user.id ||
        inv.clientEmail === user.email ||
        (isTech && assignedBookings.some((b) => b.id === inv.bookingId)) ||
        (!isTech && activeJobsList.some((j) => j.id === inv.bookingId)),
    );
    setInvoices(myInvoices.length ? myInvoices : allInvoices.filter((inv) => inv.clientEmail === user.email));

    // Fetch application details for tech roles
    if (isTech) {
      const fetchApp = async () => {
        setCheckingApp(true);
        try {
          // Attempt PocketBase fetch
          const record = await pb.collection("technician_applications").getFirstListItem(`email="${user.email}"`);
          setApplication(record?.data || record);
        } catch (err) {
          console.warn("PB tech applications fetch failed, checking local storage:", err);
          const stored = JSON.parse(localStorage.getItem(LOCAL_TECH_APPLICATIONS_KEY) || "[]");
          const found = stored.find((a) => a.email === user.email);
          setApplication(found || null);
        } finally {
          setCheckingApp(false);
        }
      };
      fetchApp();
    } else {
      setCheckingApp(false);
    }
  }, [user, isTech]); // eslint-disable-line react-hooks/exhaustive-deps

  // Onboarding local overrides
  const getOnboardingState = () => {
    const defaultState = {
      bgConsent: false,
      idUploaded: false,
      trainingQuiz: false,
      payoutSetup: false,
      insuranceUploaded: false,
      appDownloaded: false,
      profileSetup: false,
    };
    try {
      const localData = JSON.parse(localStorage.getItem(`atltv_onboarding_${user?.email}`) || "null");
      return localData || {
        ...defaultState,
        bgConsent: application?.bgConsent || false,
        idUploaded: application?.idUploaded || false,
      };
    } catch {
      return defaultState;
    }
  };

  const [onboarding, setOnboarding] = useState(getOnboardingState);

  useEffect(() => {
    if (application) {
      setOnboarding((prev) => {
        const merged = {
          ...prev,
          bgConsent: prev.bgConsent || application.bgConsent || application.status === "Screening" || application.status === "Background Pending" || application.status === "Approved",
          idUploaded: prev.idUploaded || application.idUploaded || application.status === "Approved",
        };
        localStorage.setItem(`atltv_onboarding_${user?.email}`, JSON.stringify(merged));
        return merged;
      });
    }
  }, [application, user]);

  const updateOnboardingKey = (key, value) => {
    setOnboarding((prev) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem(`atltv_onboarding_${user?.email}`, JSON.stringify(updated));
      return updated;
    });
  };

  // Submit background screening consent
  const handleBgSubmit = async (e) => {
    e.preventDefault();
    if (!bgForm.fullName || !bgForm.ssn || !bgForm.consent) {
      toast.error("Please fill out all fields and check the consent box.");
      return;
    }
    setSubmittingBg(true);
    try {
      if (application?.id && !application.id.startsWith("local_")) {
        await pb.collection("technician_applications").update(application.id, {
          bgConsent: true,
          status: "Background Pending",
        });
      }
      
      // Update local storage tech applications list
      const stored = JSON.parse(localStorage.getItem(LOCAL_TECH_APPLICATIONS_KEY) || "[]");
      const idx = stored.findIndex((a) => a.email === user.email);
      if (idx !== -1) {
        stored[idx] = { ...stored[idx], bgConsent: true, status: "Background Pending" };
        localStorage.setItem(LOCAL_TECH_APPLICATIONS_KEY, JSON.stringify(stored));
      }
      
      setApplication((prev) => prev ? { ...prev, bgConsent: true, status: "Background Pending" } : null);
      updateOnboardingKey("bgConsent", true);
      toast.success("Background check authorization submitted successfully!");
      setShowBgModal(false);
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmittingBg(false);
    }
  };

  // Simulate document upload
  const handleUploadId = () => {
    setUploadingDoc(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setUploadingDoc(false);
          updateOnboardingKey("idUploaded", true);
          
          // Sync ID upload state back to application record
          if (application?.id && !application.id.startsWith("local_")) {
            pb.collection("technician_applications").update(application.id, { idUploaded: true }).catch(() => {});
          }
          const stored = JSON.parse(localStorage.getItem(LOCAL_TECH_APPLICATIONS_KEY) || "[]");
          const idx = stored.findIndex((a) => a.email === user.email);
          if (idx !== -1) {
            stored[idx] = { ...stored[idx], idUploaded: true };
            localStorage.setItem(LOCAL_TECH_APPLICATIONS_KEY, JSON.stringify(stored));
          }
          
          toast.success("ID Document uploaded and verified successfully.");
          setShowUploadModal(false);
          return 100;
        }
        return p + 20;
      });
    }, 250);
  };

  // Payout details saving
  const handlePayoutSubmit = (e) => {
    e.preventDefault();
    if (payoutForm.method === "direct_deposit" && (!payoutForm.bankName || !payoutForm.routing || !payoutForm.account)) {
      toast.error("Please fill out all bank deposit fields.");
      return;
    }
    if (payoutForm.method === "cashapp" && !payoutForm.cashapp) {
      toast.error("Please enter your CashApp Cashtag.");
      return;
    }
    updateOnboardingKey("payoutSetup", true);
    toast.success("Payout payout profile updated successfully.");
    setShowPayoutModal(false);
  };

  // Insurance upload simulation
  const handleUploadInsurance = () => {
    updateOnboardingKey("insuranceUploaded", true);
    toast.success("General liability insurance certificate submitted.");
  };

  // PWA app simulate download
  const handleAppDownload = () => {
    updateOnboardingKey("appDownloaded", true);
    toast.success("Atlanta TV Mount PRO companion app link sent to device.");
  };

  // Complete job updates
  const markBookingComplete = (booking) => {
    const bookings = getLocalBookings();
    const idx = bookings.findIndex((b) => b.id === booking.id);
    if (idx === -1) return;

    bookings[idx] = { ...bookings[idx], status: "Completed" };
    saveLocalBookings(bookings);
    setAssignedBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id ? { ...b, status: "Completed" } : b,
      ),
    );

    let inv = getInvoiceForBooking(booking.id);
    if (!inv) inv = autoCreateInvoiceForBooking(bookings[idx]);

    if (inv) {
      setInvoiceToSend(inv);
      setShowSendInvoice(true);
      toast.success("Job marked complete. Send the invoice to the client.");
    } else {
      toast.success("Job marked complete.");
    }
  };

  const markJobComplete = (job) => {
    updateLocalJob(job.id, { status: "completed" });
    setJobs((prev) =>
      prev.map((j) =>
        j.id === job.id ? { ...j, status: "completed" } : j,
      ),
    );
    toast.success("Job marked complete.");
  };

  const handleSendInvoice = async (method) => {
    if (!invoiceToSend) return;
    const ok = await sendInvoiceVia(invoiceToSend, method);
    if (!ok) {
      const phone = (invoiceToSend.clientPhone || "").replace(/\D/g, "");
      if (!phone && method !== "email") {
        toast.error("Client phone number is required for text or WhatsApp.");
      }
      return;
    }
    toast.success(
      `Invoice sent via ${method === "email" ? "Email" : method === "sms" ? "Text" : "WhatsApp"}.`,
    );
    setShowSendInvoice(false);
    setInvoiceToSend(null);
  };

  const handleStripePaymentSubmit = async () => {
    if (!stripeCardNumber || !stripeCardExpiry || !stripeCardCvc || !stripeCardName) {
      toast.error("Please fill in all credit card details.");
      return;
    }

    setCheckoutStatus("processing");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const tipVal = paymentTip === "custom" ? parseFloat(customTipValue || 0) : parseFloat(paymentTip || 0);
      
      const allInvoices = getInvoices();
      const invIdx = allInvoices.findIndex(inv => inv.id === selectedInvoiceForPayment.id);
      if (invIdx !== -1) {
        allInvoices[invIdx].status = "paid";
        allInvoices[invIdx].paidDate = new Date().toISOString();
        allInvoices[invIdx].paymentMethod = "stripe";
        allInvoices[invIdx].tipAmount = tipVal;
        allInvoices[invIdx].totalPaid = allInvoices[invIdx].total + tipVal;
        
        const rxNo = "REC-STRIPE-" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);
        const txId = "TXN-STRIPE-" + Math.floor(10000000 + Math.random() * 90000000);
        
        allInvoices[invIdx].receipt = {
          number: rxNo,
          transactionId: txId,
          method: "stripe",
          details: `Stripe Card ending in ${stripeCardNumber.slice(-4) || "4242"}`,
          amount: allInvoices[invIdx].total + tipVal,
          timestamp: new Date().toISOString(),
        };
        saveInvoices(allInvoices);
        setInvoices(allInvoices.filter(inv => inv.clientEmail === user.email || inv.clientId === user.id));
      }

      const bookings = getLocalBookings();
      const bIdx = bookings.findIndex(b => b.id === selectedInvoiceForPayment.bookingId);
      if (bIdx !== -1) {
        bookings[bIdx].status = "completed";
        saveLocalBookings(bookings);
        createEscrowEntry(bookings[bIdx], selectedInvoiceForPayment, tipVal);
      }

      setCheckoutStatus("success");
      toast.success("Payment completed successfully!");
    } catch (err) {
      setCheckoutStatus("idle");
      toast.error("Stripe payment failed: " + err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <ClipboardList className="w-12 h-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Please Sign In</h1>
        <p className="text-muted-foreground mb-6 text-center max-w-sm">
          Sign in to your account to view your jobs, invoices, and track progress.
        </p>
        <Link to="/">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <ArrowLeft size={16} className="mr-2" /> Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  // Pre-approval checklists calculations
  const preChecklist = [
    { id: 1, label: "Submit Recruitment Application", done: !!application, desc: "Fill in skills, toolsets and experience" },
    { id: 2, label: "Double Opt-In Email Verification", done: user.OptIn_Status === "Verified" || user.OptIn_Status === "VerifiedLocal", desc: "Confirm your email via secure link" },
    { id: 3, label: "Background Screening Consent", done: onboarding.bgConsent, desc: "Submit SSN and sign electronic screening waiver", action: () => setShowBgModal(true) },
    { id: 4, label: "Upload Identity Verification", done: onboarding.idUploaded, desc: "Upload clear photo of Driver's License or ID Card", action: () => setShowUploadModal(true) },
    { id: 5, label: "Operation Phone Interview", done: application?.status === "Screening" || application?.status === "Approved", desc: "Complete brief 15-minute introductory screening call" }
  ];

  const preDoneCount = preChecklist.filter(item => item.done).length;
  const preProgress = Math.round((preDoneCount / preChecklist.length) * 100);

  // Post-approval checklists calculations
  const postChecklist = [
    { id: 1, label: "Competency Safety Handbook Quiz", done: onboarding.trainingQuiz, desc: "Pass 3-question competency screening", action: () => { setQuizStep(0); setQuizAnswers({}); setShowQuizModal(true); } },
    { id: 2, label: "Direct Payout Registration", done: onboarding.payoutSetup, desc: "Submit routing/account info or CashApp tag", action: () => setShowPayoutModal(true) },
    { id: 3, label: "Liability Insurance Upload", done: onboarding.insuranceUploaded, desc: "Upload active certificate of general liability insurance", action: handleUploadInsurance },
    { id: 4, label: "On-site Profile Construction", done: onboarding.profileSetup, desc: "Submit a friendly bio and profile photo for customers", action: () => updateOnboardingKey("profileSetup", true) },
    { id: 5, label: "Install Technician Mobile Companion PWA", done: onboarding.appDownloaded, desc: "Link the progressive web app shortcut", action: handleAppDownload }
  ];

  const postDoneCount = postChecklist.filter(item => item.done).length;
  const postProgress = Math.round((postDoneCount / postChecklist.length) * 100);

  // User classification
  const isApprovedTech = isTech && application?.status === "Approved";
  const isPendingRecruit = isTech && (!application || application?.status !== "Approved");

  const totalSpent = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const unpaidTotal = invoices
    .filter((inv) => inv.status === "sent" || inv.status === "pending")
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const getNotifications = () => {
    const list = [];
    
    if (isPendingRecruit) {
      list.push({
        id: "recruit-status",
        type: "info",
        title: "Application Under Review",
        desc: `Your application status is currently: ${application?.status || "Pending Application"}.`,
        date: "Today"
      });
      if (!onboarding.bgConsent) {
        list.push({
          id: "action-bg",
          type: "action",
          title: "Pending Action: Background Screen Consent",
          desc: "Please authorize your motor vehicle and background screening check to proceed.",
          actionLabel: "Complete waiver",
          action: () => setShowBgModal(true)
        });
      }
      if (!onboarding.idUploaded) {
        list.push({
          id: "action-id",
          type: "action",
          title: "Pending Action: Upload Identity Card",
          desc: "Provide a clear picture of your Driver's License or Government ID.",
          actionLabel: "Upload photo",
          action: () => setShowUploadModal(true)
        });
      }
    }

    if (isApprovedTech) {
      if (isSuspended) {
        list.push({
          id: "tech-suspended",
          type: "action",
          title: "CRITICAL: Profile Suspended",
          desc: `Your active profile is suspended because your Quality Rating (TQS Score: ${tqsScore}/100) has fallen below 75. You are locked out of dispatches.`,
          date: "Urgent"
        });
      } else {
        list.push({
          id: "tqs-status",
          type: "success",
          title: "Active Profile Status",
          desc: `Congratulations! Your active technician profile is live. Quality Rating: ${tqsScore}/100 (TQS).`,
          date: "Today"
        });
      }
      if (!onboarding.trainingQuiz) {
        list.push({
          id: "action-quiz",
          type: "action",
          title: "Pending Action: Safety handbook Quiz",
          desc: "You must pass the 3-question technician safety guidelines checklist before dispatch.",
          actionLabel: "Take handbook Quiz",
          action: () => { setQuizStep(0); setQuizAnswers({}); setShowQuizModal(true); }
        });
      }
      if (!onboarding.payoutSetup) {
        list.push({
          id: "action-payout",
          type: "action",
          title: "Pending Action: Payout Details Registration",
          desc: "Link your Direct Deposit bank details or CashApp Cashtag to receive weekly earnings.",
          actionLabel: "Setup accounts",
          action: () => setShowPayoutModal(true)
        });
      }
      if (!onboarding.insuranceUploaded) {
        list.push({
          id: "action-ins",
          type: "action",
          title: "Pending Action: Liability Insurance Upload",
          desc: "Please upload your certificate of General Liability Insurance.",
          actionLabel: "Upload insurance",
          action: handleUploadInsurance
        });
      }
    }

    if (isCustomer) {
      const pendingInvoiceCount = invoices.filter(inv => inv.status === "sent" || inv.status === "pending").length;
      if (pendingInvoiceCount > 0) {
        list.push({
          id: "pending-invoice",
          type: "action",
          title: `Pending Action: Payment Required`,
          desc: `You have ${pendingInvoiceCount} outstanding unpaid invoice(s). Please review and submit payments.`,
          actionLabel: "View Invoices",
          action: () => setActiveTab("invoices")
        });
      }

      const activeJob = jobs.find(j => j.status === "scheduled" || j.status === "in-progress");
      if (activeJob) {
        list.push({
          id: "job-scheduled",
          type: "info",
          title: "Upcoming Installation Scheduled",
          desc: `Your mounting appointment for ${activeJob.service || "TV Mounting"} is set for ${new Date(activeJob.scheduledDate).toLocaleDateString() || activeJob.preferred_date}.`,
          date: "Update"
        });
      }

      list.push({
        id: "welcome-cust",
        type: "success",
        title: "Atlanta TV Mount PRO Guarantee",
        desc: "All workmanship is backed by a 1-year replacement warranty. If you have concerns, submit a ticket in the Support & Claims page.",
        date: "Info"
      });
    }

    return list;
  };

  const notifications = getNotifications();

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">
                {isPendingRecruit ? "Recruitment Portal" : isApprovedTech ? "Technician Dashboard" : "My Dashboard"}
              </h1>
              <Badge variant="outline" className="capitalize text-xs font-semibold px-2.5 py-0.5 border-primary/20 bg-primary/15 text-primary">
                {isPendingRecruit ? "Recruit" : isApprovedTech ? "Approved Tech" : "Customer"}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Welcome back, {user?.name || user?.email}
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft size={14} className="mr-1" /> Back to Site
            </Button>
          </Link>
        </div>

        {/* ── RECRUIT ONBOARDING FLOW ── */}
        {isPendingRecruit && (
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm mb-8 space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/50">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <UserCheck className="text-primary" size={20} />
                  Onboarding Steps (Pre-Approval)
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Complete these required checklists to activate your active technician profile.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-muted/60 border border-border/80 px-3 py-1.5 rounded-xl text-xs font-semibold">
                <Clock size={12} className="text-yellow-500 animate-spin" />
                <span>Application Status:</span>
                <span className="text-yellow-500 capitalize">{application?.status || "Pending Application"}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span>Verification Progress</span>
                <span className="text-primary">{preProgress}% Complete</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" 
                  style={{ width: `${preProgress}%` }}
                />
              </div>
            </div>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {preChecklist.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                    item.done 
                      ? "bg-emerald-500/5 border-emerald-500/20" 
                      : "bg-background border-border/70 hover:border-border"
                  }`}
                >
                  <div className="mt-0.5">
                    {item.done ? (
                      <div className="bg-emerald-500 text-white rounded-full p-0.5">
                        <Check size={12} />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-muted-foreground/45 flex items-center justify-center text-[10px] font-bold text-muted-foreground/60">
                        {item.id}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className={`text-xs font-bold ${item.done ? "text-emerald-500 line-through" : "text-foreground"}`}>
                      {item.label}
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      {item.desc}
                    </p>
                    {!item.done && item.action && (
                      <Button 
                        onClick={item.action} 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-[10px] font-bold mt-1 bg-card hover:bg-muted"
                      >
                        Complete Task
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {preProgress === 100 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
                <Sparkles size={16} />
                <span>Verification checklist complete! Atlanta TV Mount PRO operations is reviewing your license. You will receive email instructions upon profile approval.</span>
              </div>
            )}
          </div>
        )}

        {/* ── APPROVED ONBOARDING FLOW ── */}
        {isApprovedTech && postProgress < 100 && (
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm mb-8 space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/50">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Award className="text-emerald-500" size={20} />
                  Technician Launch Steps (Post-Approval)
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your application is approved! Setup your credentials, payout tags, and safety profiles to activate your booking stream.
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span>Technician Launch Progress</span>
                <span className="text-emerald-500">{postProgress}% Active</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500" 
                  style={{ width: `${postProgress}%` }}
                />
              </div>
            </div>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {postChecklist.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                    item.done 
                      ? "bg-emerald-500/5 border-emerald-500/20" 
                      : "bg-background border-border/70 hover:border-border"
                  }`}
                >
                  <div className="mt-0.5">
                    {item.done ? (
                      <div className="bg-emerald-500 text-white rounded-full p-0.5">
                        <Check size={12} />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-muted-foreground/45 flex items-center justify-center text-[10px] font-bold text-muted-foreground/60">
                        {item.id}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className={`text-xs font-bold ${item.done ? "text-emerald-500 line-through" : "text-foreground"}`}>
                      {item.label}
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      {item.desc}
                    </p>
                    {!item.done && item.action && (
                      <Button 
                        onClick={item.action} 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-[10px] font-bold mt-1 bg-card hover:bg-muted"
                      >
                        Complete Task
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CUSTOMER TOTALS GRID ── */}
        {isCustomer && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ClipboardList size={16} className="text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Total Jobs</span>
              </div>
              <p className="text-2xl font-bold">{jobs.length}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign size={16} className="text-green-500" />
                </div>
                <span className="text-sm text-muted-foreground">Total Spent</span>
              </div>
              <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <CreditCard size={16} className="text-orange-500" />
                </div>
                <span className="text-sm text-muted-foreground">Outstanding</span>
              </div>
              <p className="text-2xl font-bold">${unpaidTotal.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* ── TABS NAVIGATION ── */}
        <div className="flex items-center gap-1 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "jobs"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {isTech ? "Assigned Jobs" : "My Jobs"}
          </button>
          {isApprovedTech && (
            <>
              <button
                onClick={() => setActiveTab("earnings")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "earnings"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Earnings & Payouts
              </button>
              <button
                onClick={() => setActiveTab("availability")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "availability"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                My Availability
              </button>
            </>
          )}
          {!isTech && (
            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "invoices"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Invoices
            </button>
          )}
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "profile"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            My Profile
          </button>
        </div>

        {/* ── JOBS TAB ── */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            {isTech ? (
              isSuspended ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center animate-pulse">
                  <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
                  <h3 className="font-semibold text-destructive mb-1 text-base">Account Suspended</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Your technician profile has been suspended because your Quality Rating (TQS score: {tqsScore}/100) has fallen below 75. You are blocked from managing or viewing assigned jobs.
                  </p>
                </div>
              ) : assignedBookings.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <Wrench className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">No assigned jobs</h3>
                  <p className="text-sm text-muted-foreground">
                    Jobs assigned to you by admin will appear here once your onboarding checklist is completed.
                  </p>
                </div>
              ) : (
                assignedBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {booking.service_type}
                          </h3>
                          <Badge
                            variant="outline"
                            className={statusColors[booking.status?.toLowerCase()] || ""}
                          >
                            {booking.status || "Pending"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Client: {booking.name} • {booking.phone}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Calendar size={12} />
                          Date: {booking.preferred_date} at {booking.preferred_time || "Anytime"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {booking.estimated_quote && (
                          <p className="text-lg font-bold">${booking.estimated_quote}</p>
                        )}
                        {(booking.status || "").toLowerCase() !== "completed" && (
                          <Button
                            size="sm"
                            onClick={() => markBookingComplete(booking)}
                          >
                            Mark Complete & Bill
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : jobs.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <Wrench className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-1">No jobs yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't requested any services yet.
                </p>
                <Link to="/services">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Browse Services
                  </Button>
                </Link>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          {job.service || "General Service"}
                        </h3>
                        <Badge
                          variant="outline"
                          className={statusColors[job.status] || ""}
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Requested on{" "}
                        {new Date(job.created).toLocaleDateString()}
                      </p>
                      {job.scheduledDate && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Calendar size={12} />
                          Scheduled:{" "}
                          {new Date(job.scheduledDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {job.price && (
                        <p className="text-lg font-bold">${job.price}</p>
                      )}
                      {job.status !== "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markJobComplete(job)}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                  {job.notes && (
                    <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
                      {job.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── INVOICES TAB ── */}
        {activeTab === "invoices" && !isTech && (
          <div className="space-y-4">
            {invoices.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <DollarSign className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-1">No invoices yet</h3>
                <p className="text-sm text-muted-foreground">
                  Invoices will appear here once your jobs are scheduled.
                </p>
              </div>
            ) : (
              invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          Invoice #{inv.number || inv.id.slice(-6)}
                        </h3>
                        <Badge
                          variant="outline"
                          className={statusColors[inv.status] || ""}
                        >
                          {inv.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {inv.jobDate &&
                          `Job date: ${new Date(inv.jobDate).toLocaleDateString()} • `}
                        Created{" "}
                        {new Date(inv.created).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold">
                        ${(inv.total || 0).toFixed(2)}
                      </p>
                      {(inv.status === "sent" || inv.status === "pending" || inv.status === "draft") && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedInvoiceForPayment(inv);
                            setShowStripeCheckout(true);
                            setCheckoutStatus("idle");
                            setPaymentTip(0);
                            setCustomTipValue("");
                            setStripeCardNumber("");
                            setStripeCardExpiry("");
                            setStripeCardCvc("");
                            setStripeCardName("");
                          }}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                        >
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── EARNINGS TAB ── */}
        {activeTab === "earnings" && isApprovedTech && (
          <div className="space-y-6 animate-fade-in">
            {/* Earnings Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <DollarSign size={16} className="text-emerald-500" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">Total Earnings (70% + Tips)</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${(escrowHolds
                    .reduce((sum, e) => sum + (parseFloat(e.baseCommission) || 0) + (parseFloat(e.tipAmount) || 0), 0)
                  ).toFixed(2)}
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">Paid Payouts</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${(escrowHolds
                    .filter(e => e.status === "Released")
                    .reduce((sum, e) => sum + (parseFloat(e.baseCommission) || 0) + (parseFloat(e.tipAmount) || 0), 0)
                  ).toFixed(2)}
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Clock size={16} className="text-orange-500" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">Pending / Escrow</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${(escrowHolds
                    .filter(e => e.status === "Holding")
                    .reduce((sum, e) => sum + (parseFloat(e.baseCommission) || 0) + (parseFloat(e.tipAmount) || 0), 0)
                  ).toFixed(2)}
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle size={16} className="text-red-500" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">Disputed / Frozen</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${(escrowHolds
                    .filter(e => e.status === "Frozen")
                    .reduce((sum, e) => sum + (parseFloat(e.baseCommission) || 0) + (parseFloat(e.tipAmount) || 0), 0)
                  ).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Payout Details Summary */}
            <div className="bg-muted/40 border border-border p-4 rounded-xl flex items-center gap-3 text-xs">
              <Shield size={16} className="text-primary flex-shrink-0" />
              <div className="text-muted-foreground">
                <span className="font-semibold text-foreground">Payout Account:</span>{" "}
                {onboarding.payoutSetup ? "Active & Linked (Weekly Deposit)" : "Not Set Up (Go to launch steps/quiz above)"}
              </div>
            </div>

            {/* Earnings breakdown table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-border/60">
                <h3 className="font-bold text-sm">Earnings Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                      <th className="px-5 py-3">Job ID</th>
                      <th className="px-5 py-3">Service</th>
                      <th className="px-5 py-3">Date Completed</th>
                      <th className="px-5 py-3">Job Total</th>
                      <th className="px-5 py-3">Your Commission</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {escrowHolds.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                          No completed earnings records found. Pay invoices to populate weekly payouts.
                        </td>
                      </tr>
                    ) : (
                      escrowHolds.map((e) => {
                        const remainingHours = Math.max(0, Math.ceil((new Date(e.releaseTime).getTime() - Date.now()) / 3600000));
                        return (
                          <tr key={e.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-5 py-3.5 font-mono text-muted-foreground">#{e.bookingId.slice(-6)}</td>
                            <td className="px-5 py-3.5 font-semibold text-foreground">{e.serviceType}</td>
                            <td className="px-5 py-3.5 text-muted-foreground">{e.jobDate}</td>
                            <td className="px-5 py-3.5 font-medium">${(e.invoiceTotal || 0).toFixed(2)}</td>
                            <td className="px-5 py-3.5 font-bold text-emerald-500">
                              ${(e.baseCommission || 0).toFixed(2)}
                              {e.tipAmount > 0 && (
                                <span className="text-[10px] text-indigo-400 block font-normal">+ ${(e.tipAmount || 0).toFixed(2)} tip</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                e.status === "Released"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : e.status === "Frozen"
                                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                                    : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                              }`}>
                                {e.status === "Holding" ? `Holding (${remainingHours}h)` : e.status === "Frozen" ? "Disputed / Frozen" : e.status === "Released" ? "Released" : e.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── AVAILABILITY TAB ── */}
        {activeTab === "availability" && isApprovedTech && (
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Calendar className="text-primary" size={20} />
                My Availability Scheduler
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set the days and time blocks you are active to receive automated client dispatch matches.
              </p>
            </div>

            <div className="space-y-4">
              {Object.keys(weeklySchedule).map((day) => {
                const dayData = weeklySchedule[day];
                return (
                  <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/70 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id={`active-${day}`}
                        checked={dayData.active}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setWeeklySchedule(prev => ({
                            ...prev,
                            [day]: { ...prev[day], active: val, slots: val ? ["morning", "afternoon"] : [] }
                          }));
                        }}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-muted/40 cursor-pointer"
                      />
                      <label htmlFor={`active-${day}`} className="font-bold text-sm select-none cursor-pointer">
                        {day}
                      </label>
                    </div>

                    {dayData.active && (
                      <div className="flex flex-wrap items-center gap-3">
                        {[
                          { id: "morning", label: "Morning (8AM-12PM)" },
                          { id: "afternoon", label: "Afternoon (12PM-4PM)" },
                          { id: "evening", label: "Evening (4PM-8PM)" },
                        ].map((slot) => {
                          const selected = dayData.slots.includes(slot.id);
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => {
                                const newSlots = selected
                                  ? dayData.slots.filter(s => s !== slot.id)
                                  : [...dayData.slots, slot.id];
                                setWeeklySchedule(prev => ({
                                  ...prev,
                                  [day]: { ...prev[day], slots: newSlots }
                                }));
                              }}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                                selected
                                  ? "border-primary/30 bg-primary/10 text-primary"
                                  : "border-border bg-card text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {!dayData.active && (
                      <span className="text-xs text-muted-foreground italic sm:mr-4">Off-Duty / Unavailable</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                onClick={() => {
                  localStorage.setItem(`atltv_tech_availability_${user?.email}`, JSON.stringify(weeklySchedule));
                  toast.success("Weekly availability schedule saved successfully.");
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Save Availability Schedule
              </Button>
            </div>
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            {/* Profile Fields Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Account Overview Stats (Read-Only) */}
              <Card className="bg-card border border-border shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-4">Account Overview</h3>
                  {isTech ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-xl border border-border/50 text-xs">
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Profile Status</span>
                        <span className={`font-semibold capitalize ${isSuspended ? "text-destructive animate-pulse" : "text-green-500"}`}>
                          {isSuspended ? "Suspended" : (application?.status || "Pending")}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Quality Rating</span>
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          <Sparkles size={12} className="text-amber-500" />
                          {tqsScore}/100 TQS
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Screening</span>
                        <span className={`font-semibold ${onboarding.bgConsent ? "text-green-500" : "text-amber-500"}`}>
                          {onboarding.bgConsent ? "Verified" : "Pending Waiver"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Liability Insurance</span>
                        <span className={`font-semibold ${onboarding.insuranceUploaded ? "text-green-500" : "text-amber-500"}`}>
                          {onboarding.insuranceUploaded ? "Active" : "Not Provided"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-xl border border-border/50 text-xs">
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Member Since</span>
                        <span className="font-semibold text-foreground">
                          {user?.created ? new Date(user.created).toLocaleDateString() : "June 2026"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Active Bookings</span>
                        <span className="font-semibold text-foreground">
                          {jobs.filter(j => j.status === 'scheduled' || j.status === 'in-progress' || j.status === 'confirmed').length}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Paid Invoices</span>
                        <span className="font-semibold text-foreground">
                          {invoices.filter(i => i.status === 'paid').length}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Profile Settings Form */}
              <Card className="bg-card border border-border shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-bold text-base text-foreground mb-4">Profile Settings</h3>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-border/60">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 bg-muted/60 flex items-center justify-center shadow-inner">
                          {profileForm.avatar ? (
                            <img src={profileForm.avatar} alt="Profile preview" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-muted-foreground text-xs font-medium">No Photo</span>
                          )}
                        </div>
                        <label 
                          htmlFor="client-avatar-file" 
                          className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center cursor-pointer shadow-md transition-all active:scale-95 border border-background"
                          title="Upload new profile picture"
                        >
                          <Camera size={16} />
                          <input 
                            type="file" 
                            id="client-avatar-file" 
                            accept="image/*" 
                            onChange={handleAvatarChange} 
                            className="hidden" 
                          />
                        </label>
                      </div>
                      <div className="text-center sm:text-left space-y-1.5">
                        <h4 className="text-sm font-semibold text-foreground">Profile Picture</h4>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          Upload a professional photo (JPG or PNG, max 1MB). This picture will represent you on the platform.
                        </p>
                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            type="button"
                            onClick={() => document.getElementById("client-avatar-file").click()}
                            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                          >
                            Upload Photo
                          </button>
                          {profileForm.avatar && (
                            <>
                              <span className="text-muted-foreground/40 text-xs">•</span>
                              <button
                                type="button"
                                onClick={() => setProfileForm(prev => ({ ...prev, avatar: "" }))}
                                className="text-xs font-semibold text-destructive hover:text-destructive/80 transition-colors flex items-center space-x-1"
                              >
                                <Trash2 size={12} />
                                <span>Remove</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="prof-name" className="text-xs font-semibold">Full Name</Label>
                        <Input
                          id="prof-name"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          required
                          className="bg-muted/40 border-border text-foreground h-10 mt-1.5 focus:border-primary"
                        />
                      </div>
                      <div>
                        <Label htmlFor="prof-email" className="text-xs font-semibold">Email Address (Read-only)</Label>
                        <Input
                          id="prof-email"
                          type="email"
                          value={profileForm.email}
                          disabled
                          className="bg-muted/20 border-border text-muted-foreground h-10 mt-1.5 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="prof-phone" className="text-xs font-semibold">Phone Number</Label>
                        <Input
                          id="prof-phone"
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          required
                          className="bg-muted/40 border-border text-foreground h-10 mt-1.5 focus:border-primary"
                        />
                      </div>
                      {!isTech && (
                        <div>
                          <Label htmlFor="prof-channel" className="text-xs font-semibold">Notification Preference</Label>
                          <select
                            id="prof-channel"
                            value={profileForm.preferredChannel || "Email"}
                            onChange={(e) => setProfileForm({ ...profileForm, preferredChannel: e.target.value })}
                            className="w-full bg-muted/40 border border-border text-foreground h-10 rounded-md px-3 text-sm mt-1.5 focus:border-primary focus:outline-none"
                          >
                            <option value="Email">Email Only</option>
                            <option value="SMS">SMS Text Messages</option>
                            <option value="Phone Call">Phone Calls</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {isTech && (
                      <div>
                        <Label htmlFor="prof-bio" className="text-xs font-semibold flex items-center justify-between">
                          <span>Professional Biography</span>
                          <span className="text-[10px] text-muted-foreground font-normal">Shows on customer booking confirmation</span>
                        </Label>
                        <Textarea
                          id="prof-bio"
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                          rows={3}
                          className="bg-muted/40 border-border text-foreground mt-1.5 focus:border-primary"
                          placeholder="Introduce yourself to your clients (experience, specialties, tools)..."
                        />
                      </div>
                    )}

                    {isTech && (
                      <div className="border-t border-border/60 pt-4 space-y-4">
                        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Direct Payout Account settings</h4>
                        <div>
                          <Label htmlFor="prof-payout-method" className="text-xs font-semibold">Payout Method</Label>
                          <select
                            id="prof-payout-method"
                            value={profileForm.payoutMethod || "direct_deposit"}
                            onChange={(e) => setProfileForm({ ...profileForm, payoutMethod: e.target.value })}
                            className="w-full bg-muted/40 border border-border text-foreground h-10 rounded-md px-3 text-sm mt-1.5 focus:border-primary focus:outline-none"
                          >
                            <option value="direct_deposit">Direct Deposit (Bank Account)</option>
                            <option value="cashapp">CashApp Cashtag</option>
                          </select>
                        </div>

                        {profileForm.payoutMethod === "direct_deposit" ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="prof-bank" className="text-xs font-semibold">Bank Name</Label>
                              <Input
                                id="prof-bank"
                                value={profileForm.bankName || ""}
                                onChange={(e) => setProfileForm({ ...profileForm, bankName: e.target.value })}
                                className="bg-muted/40 border-border text-foreground h-10 mt-1.5 focus:border-primary"
                                placeholder="e.g. Chase"
                              />
                            </div>
                            <div>
                              <Label htmlFor="prof-routing" className="text-xs font-semibold">Routing Number</Label>
                              <Input
                                id="prof-routing"
                                value={profileForm.routing || ""}
                                onChange={(e) => setProfileForm({ ...profileForm, routing: e.target.value })}
                                className="bg-muted/40 border-border text-foreground h-10 mt-1.5 focus:border-primary"
                                placeholder="9 digits"
                              />
                            </div>
                            <div>
                              <Label htmlFor="prof-account" className="text-xs font-semibold">Account Number</Label>
                              <Input
                                id="prof-account"
                                value={profileForm.account || ""}
                                onChange={(e) => setProfileForm({ ...profileForm, account: e.target.value })}
                                className="bg-muted/40 border-border text-foreground h-10 mt-1.5 focus:border-primary"
                                placeholder="Account #"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Label htmlFor="prof-cashapp" className="text-xs font-semibold">CashApp Cashtag</Label>
                            <Input
                              id="prof-cashapp"
                              value={profileForm.cashapp || ""}
                              onChange={(e) => setProfileForm({ ...profileForm, cashapp: e.target.value })}
                              className="bg-muted/40 border-border text-foreground h-10 mt-1.5 focus:border-primary"
                              placeholder="$cashtag"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="border-t border-border/60 pt-4 space-y-4">
                      <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Change Password (Optional)</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="prof-newpass" className="text-xs font-semibold">New Password</Label>
                          <div className="relative mt-1.5">
                            <Input
                              id="prof-newpass"
                              type={showNewPassword ? "text" : "password"}
                              value={profileForm.newPassword}
                              onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                              className="bg-muted/40 border-border text-foreground h-10 focus:border-primary pr-10"
                              placeholder="Min 6 characters"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground flex items-center"
                            >
                              {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="prof-confpass" className="text-xs font-semibold">Confirm Password</Label>
                          <div className="relative mt-1.5">
                            <Input
                              id="prof-confpass"
                              type={showConfirmPassword ? "text" : "password"}
                              value={profileForm.confirmPassword}
                              onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                              className="bg-muted/40 border-border text-foreground h-10 focus:border-primary pr-10"
                              placeholder="Re-enter password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground flex items-center"
                            >
                              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                        Save Profile Settings
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Notifications & System Updates Column */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="bg-card border border-border shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-bold text-base text-foreground mb-4">Notifications & Actions</h3>
                  <div className="space-y-4">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-xs">
                        No active notifications or pending actions.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-4 rounded-xl border text-xs flex flex-col gap-2 ${
                            notif.type === "action" 
                              ? "bg-primary/5 border-primary/20" 
                              : notif.type === "success"
                              ? "bg-emerald-500/5 border-emerald-500/10"
                              : "bg-muted/45 border-border"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className={`font-bold ${
                              notif.type === "action" 
                                ? "text-primary" 
                                : notif.type === "success" 
                                ? "text-emerald-500" 
                                : "text-foreground"
                            }`}>
                              {notif.title}
                            </span>
                            {notif.date && (
                              <span className="text-[9px] text-muted-foreground uppercase font-bold bg-muted border border-border px-1.5 py-0.5 rounded">
                                {notif.date}
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground leading-normal">{notif.desc}</p>
                          {notif.type === "action" && notif.action && (
                            <div className="pt-1">
                              <Button 
                                onClick={notif.action}
                                size="sm" 
                                className="h-7 text-[10px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                              >
                                {notif.actionLabel}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* ── BACKGROUND CHECK CONSENT MODAL ── */}
      <Dialog open={showBgModal} onOpenChange={setShowBgModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-card border border-border">
          <DialogHeader>
            <DialogTitle>Background Screening Consent</DialogTitle>
            <DialogDescription>
              Submit details to authorize a standard background verification.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBgSubmit} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Full Legal Name *</label>
              <input 
                type="text" 
                required 
                className="input-base w-full"
                value={bgForm.fullName}
                onChange={e => setBgForm({ ...bgForm, fullName: e.target.value })}
                placeholder="e.g. Marcus Thompson"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Social Security Number (SSN) *</label>
              <div className="relative">
                <input 
                  type={showSsn ? "text" : "password"} 
                  required 
                  maxLength={11}
                  className="input-base w-full pr-10"
                  value={bgForm.ssn}
                  onChange={e => setBgForm({ ...bgForm, ssn: e.target.value })}
                  placeholder="XXX-XX-XXXX"
                />
                <button
                  type="button"
                  onClick={() => setShowSsn(!showSsn)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground flex items-center"
                >
                  {showSsn ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="flex items-start gap-2.5 pt-1">
              <input 
                type="checkbox" 
                id="bgConsentCheck" 
                required 
                className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-muted/40 cursor-pointer mt-0.5"
                checked={bgForm.consent}
                onChange={e => setBgForm({ ...bgForm, consent: e.target.checked })}
              />
              <label htmlFor="bgConsentCheck" className="text-[11px] text-muted-foreground leading-normal cursor-pointer select-none">
                I authorize Atlanta TV Mount PRO to conduct a standard motor vehicle and criminal background check. I verify that the information provided is correct.
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setShowBgModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submittingBg} className="bg-primary hover:bg-primary/90">
                {submittingBg ? "Submitting..." : "Submit Authorization"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── IDENTITY CARD UPLOAD MODAL ── */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-card border border-border">
          <DialogHeader>
            <DialogTitle>Upload Identification</DialogTitle>
            <DialogDescription>
              Submit a clear image of your active Driver's License or Government ID Card.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!uploadingDoc ? (
              <div 
                onClick={handleUploadId}
                className="border-2 border-dashed border-border/70 hover:border-primary/50 rounded-xl p-8 text-center cursor-pointer hover:bg-muted/10 transition-all space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  <Upload size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Click to upload file</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Supports PNG, JPG, or PDF (Max 10MB)</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-6 text-center">
                <Wrench className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                <p className="text-xs font-semibold">Uploading and analyzing document quality...</p>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── SAFETY HANDBOOK COMPETENCY QUIZ MODAL ── */}
      <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-card border border-border">
          <DialogHeader>
            <DialogTitle>Safety Training Competency Quiz</DialogTitle>
            <DialogDescription>
              Answer the questions below based on the technician guidelines.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
            {quizStep < quizQuestions.length ? (
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground font-bold">
                  <span>Question {quizStep + 1} of {quizQuestions.length}</span>
                  <span className="text-primary">{Math.round((quizStep / quizQuestions.length) * 100)}%</span>
                </div>
                <h4 className="text-sm font-bold text-foreground">
                  {quizQuestions[quizStep].q}
                </h4>
                <div className="space-y-2 mt-2">
                  {quizQuestions[quizStep].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuizAnswers({ ...quizAnswers, [quizStep]: i });
                      }}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                        quizAnswers[quizStep] === i
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between pt-4">
                  <Button 
                    disabled={quizStep === 0} 
                    variant="outline" 
                    onClick={() => setQuizStep(s => s - 1)}
                  >
                    Back
                  </Button>
                  <Button
                    disabled={quizAnswers[quizStep] === undefined}
                    onClick={() => {
                      if (quizStep === quizQuestions.length - 1) {
                        // Grade quiz
                        let correctCount = 0;
                        quizQuestions.forEach((q, idx) => {
                          if (quizAnswers[idx] === q.correct) correctCount++;
                        });
                        if (correctCount === quizQuestions.length) {
                          updateOnboardingKey("trainingQuiz", true);
                          toast.success("Congratulations! You passed the Safety Training Quiz.");
                          setShowQuizModal(false);
                        } else {
                          toast.error(`Competency quiz failed. You scored ${correctCount}/${quizQuestions.length}. Please retry!`);
                          setQuizStep(0);
                          setQuizAnswers({});
                        }
                      } else {
                        setQuizStep(s => s + 1);
                      }
                    }}
                  >
                    {quizStep === quizQuestions.length - 1 ? "Submit & Finish" : "Next Question"}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── PAYOUT ACCOUNT MODAL ── */}
      <Dialog open={showPayoutModal} onOpenChange={setShowPayoutModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-card border border-border">
          <DialogHeader>
            <DialogTitle>Direct Payout Registration</DialogTitle>
            <DialogDescription>
              Submit details to receive weekly automated payouts.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePayoutSubmit} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Method</label>
              <select 
                value={payoutForm.method} 
                onChange={e => setPayoutForm({ ...payoutForm, method: e.target.value })}
                className="input-base w-full bg-muted/50"
              >
                <option value="direct_deposit">Direct Bank Deposit</option>
                <option value="cashapp">CashApp</option>
              </select>
            </div>
            {payoutForm.method === "direct_deposit" ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Bank Name *</label>
                  <input 
                    type="text" 
                    required 
                    className="input-base w-full"
                    value={payoutForm.bankName}
                    onChange={e => setPayoutForm({ ...payoutForm, bankName: e.target.value })}
                    placeholder="e.g. Chase Bank"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Routing Number *</label>
                    <input 
                      type="text" 
                      required 
                      maxLength={9}
                      className="input-base w-full"
                      value={payoutForm.routing}
                      onChange={e => setPayoutForm({ ...payoutForm, routing: e.target.value })}
                      placeholder="e.g. 021000021"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Account Number *</label>
                    <input 
                      type="text" 
                      required 
                      className="input-base w-full"
                      value={payoutForm.account}
                      onChange={e => setPayoutForm({ ...payoutForm, account: e.target.value })}
                      placeholder="e.g. 123456789"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">CashApp Cashtag *</label>
                <input 
                  type="text" 
                  required 
                  className="input-base w-full"
                  value={payoutForm.cashapp}
                  onChange={e => setPayoutForm({ ...payoutForm, cashapp: e.target.value })}
                  placeholder="e.g. $ThompsonMount"
                />
              </div>
            )}
            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setShowPayoutModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">Save payout Details</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invoice Delivery Modal */}
      <Dialog open={showSendInvoice} onOpenChange={setShowSendInvoice}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-card border border-border">
          <DialogHeader>
            <DialogTitle>Send Invoice to Client</DialogTitle>
            <DialogDescription>
              Choose how to deliver the invoice to {invoiceToSend?.clientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { method: "email", label: "Email", icon: Mail },
              { method: "sms", label: "Text Message", icon: Smartphone },
              { method: "whatsapp", label: "WhatsApp", icon: MessageSquare },
            ].map(({ method, label, icon: Icon }) => (
              <button
                key={method}
                onClick={() => handleSendInvoice(method)}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left"
              >
                <Icon size={18} className="text-primary" />
                <span className="font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      {/* ── STRIPE SANDBOX CHECKOUT MODAL ── */}
      <Dialog open={showStripeCheckout} onOpenChange={setShowStripeCheckout}>
        <DialogContent className="max-w-md bg-card border border-border p-0 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-950 p-6 text-white border-b border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center font-bold text-xs">S</div>
                <span className="font-bold tracking-tight text-sm">Stripe Checkout <span className="bg-indigo-500/20 text-indigo-300 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ml-1">Sandbox</span></span>
              </div>
              <span className="text-xs text-slate-400">test mode</span>
            </div>
            
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Pay Atlanta TV Mount Pro</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold">${( (selectedInvoiceForPayment?.total || 0) + (paymentTip === "custom" ? parseFloat(customTipValue || 0) : parseFloat(paymentTip || 0)) ).toFixed(2)}</span>
              <span className="text-xs text-slate-400">USD</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Invoice #{selectedInvoiceForPayment?.number || selectedInvoiceForPayment?.id.slice(-6)}</p>
          </div>

          <div className="p-6 space-y-5">
            {checkoutStatus === "idle" && (
              <div className="space-y-4">
                {/* TIPPING SECTION */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Add a Tip for your Tech</Label>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    100% of tips are sent directly to your assigned technician with zero platform commission deductions.
                  </p>
                  <div className="grid grid-cols-5 gap-1.5 pt-1.5">
                    {[
                      { label: "No Tip", value: 0 },
                      { label: "10%", value: Math.round((selectedInvoiceForPayment?.total || 0) * 0.1) },
                      { label: "15%", value: Math.round((selectedInvoiceForPayment?.total || 0) * 0.15) },
                      { label: "20%", value: Math.round((selectedInvoiceForPayment?.total || 0) * 0.2) },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => {
                          setPaymentTip(opt.value);
                          setCustomTipValue("");
                        }}
                        className={`py-2 text-[10px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                          (paymentTip === opt.value && !customTipValue)
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-muted/40 border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        <div>{opt.label}</div>
                        {opt.value > 0 && <div className="text-[9px] font-normal opacity-85">${opt.value}</div>}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPaymentTip("custom")}
                      className={`py-2 text-[10px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                        paymentTip === "custom"
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-muted/40 border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                  
                  {paymentTip === "custom" && (
                    <div className="pt-2">
                      <Label htmlFor="custom-tip" className="text-xs font-semibold">Custom Tip Amount ($)</Label>
                      <Input
                        id="custom-tip"
                        type="number"
                        min="0"
                        placeholder="e.g. 25"
                        value={customTipValue}
                        onChange={(e) => {
                          setCustomTipValue(e.target.value);
                        }}
                        className="bg-muted/40 border-border h-9 mt-1 focus:border-primary text-xs"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-border/60 pt-3 space-y-3">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Payment Details</Label>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="stripe-email" className="text-xs">Email</Label>
                      <Input
                        id="stripe-email"
                        type="email"
                        value={user?.email}
                        disabled
                        className="bg-muted/20 text-muted-foreground border-border h-9 mt-1 text-xs cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stripe-card" className="text-xs">Card Information</Label>
                      <div className="relative mt-1">
                        <Input
                          id="stripe-card"
                          type="text"
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                          value={stripeCardNumber}
                          onChange={(e) => setStripeCardNumber(e.target.value)}
                          className="bg-muted/40 border-border h-9 text-xs pr-10"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                          <CreditCard size={14} className="text-muted-foreground" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Input
                          type="text"
                          placeholder="MM / YY"
                          maxLength={5}
                          value={stripeCardExpiry}
                          onChange={(e) => setStripeCardExpiry(e.target.value)}
                          className="bg-muted/40 border-border h-9 text-xs"
                        />
                        <Input
                          type="text"
                          placeholder="CVC"
                          maxLength={3}
                          value={stripeCardCvc}
                          onChange={(e) => setStripeCardCvc(e.target.value)}
                          className="bg-muted/40 border-border h-9 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="stripe-name" className="text-xs">Name on Card</Label>
                      <Input
                        id="stripe-name"
                        type="text"
                        placeholder="John Doe"
                        value={stripeCardName}
                        onChange={(e) => setStripeCardName(e.target.value)}
                        className="bg-muted/40 border-border h-9 mt-1 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleStripePaymentSubmit}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-10 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Lock size={14} /> Pay ${( (selectedInvoiceForPayment?.total || 0) + (paymentTip === "custom" ? parseFloat(customTipValue || 0) : parseFloat(paymentTip || 0)) ).toFixed(2)}
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground mt-2">
                    Secured by Stripe. Powered by Atlanta TV Mount Pro.
                  </p>
                </div>
              </div>
            )}

            {checkoutStatus === "processing" && (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto"></div>
                <h3 className="font-bold text-sm text-foreground">Processing Secure Payment...</h3>
                <p className="text-xs text-muted-foreground">Communicating with Stripe Sandbox API gateways and dispatching local webhooks.</p>
              </div>
            )}

            {checkoutStatus === "success" && (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-bold text-base text-foreground">Payment Successful!</h3>
                <p className="text-xs text-muted-foreground">
                  Thank you! Your payment of <strong className="text-foreground">${( (selectedInvoiceForPayment?.total || 0) + (paymentTip === "custom" ? parseFloat(customTipValue || 0) : parseFloat(paymentTip || 0)) ).toFixed(2)}</strong> has been processed.
                </p>
                <div className="bg-muted/30 p-3 rounded-lg border border-border/60 max-w-xs mx-auto text-left text-[11px] space-y-1">
                  <div><span className="text-muted-foreground">Transaction ID:</span> <span className="font-mono font-semibold text-foreground">TXN-STRIPE-{Math.floor(10000000 + Math.random() * 90000000)}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <span className="font-semibold text-emerald-500">Invoice Paid</span></div>
                  {(paymentTip === "custom" ? parseFloat(customTipValue || 0) : parseFloat(paymentTip || 0)) > 0 && (
                    <div>
                      <span className="text-muted-foreground">Technician Tip:</span>{" "}
                      <span className="font-bold text-indigo-400">
                        ${(paymentTip === "custom" ? parseFloat(customTipValue || 0) : parseFloat(paymentTip || 0)).toFixed(2)} (100% to tech)
                      </span>
                    </div>
                  )}
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => setShowStripeCheckout(false)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDashboard;
