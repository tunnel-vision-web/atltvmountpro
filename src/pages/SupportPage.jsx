import React, { useState, useEffect } from "react";
import usePageTitle from "@/hooks/usePageTitle";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
  LifeBuoy
} from "lucide-react";
import pb from "@/lib/pocketbaseClient";
import { toast } from "sonner";
import PageHero from "@/components/PageHero";
import { updateEscrowStatusByBooking } from "@/lib/escrowUtils";

const LOCAL_BOOKINGS_KEY = "atltvmountpro_local_bookings";
const LOCAL_SUPPORT_TICKETS_KEY = "atltv_local_support_tickets";

const SupportPage = () => {
  usePageTitle({
    title: "Support & Claims - Atlanta TV Mount PRO",
    description: "Submit a support ticket or warranty claim for a mounting job. 100% satisfaction guaranteed. Quick refunds and re-dispatch repairs.",
    keywords: "TV mount support, warranty claim, refund request, mounting repair, local handyman help"
  });

  useEffect(() => {
    const ticketKey = "atltv_local_support_tickets";
    const escrowKey = "atltvmountpro_escrow_ledger";
    
    // Seed escrow ledger if empty or missing these bookings
    let escrowLedger = [];
    try {
      escrowLedger = JSON.parse(localStorage.getItem(escrowKey)) || [];
    } catch {
      escrowLedger = [];
    }
    
    const hasJohnEscrow = escrowLedger.some(e => e.bookingId === "6hejy3kkpoew1sv");
    const hasAliceEscrow = escrowLedger.some(e => e.bookingId === "vgutmssfvpmotwh");
    
    let updatedLedger = [...escrowLedger];
    let escrowChanged = false;
    
    if (!hasJohnEscrow) {
      updatedLedger.unshift({
        id: "esc_john_miller_mock",
        bookingId: "6hejy3kkpoew1sv",
        invoiceId: "inv_john_miller",
        techId: "tech_john",
        techName: "John Handyman",
        techEmail: "john.handyman@example.com",
        clientName: "John Miller",
        clientEmail: "john.miller@example.com",
        serviceType: "TV Mounting",
        jobDate: "2026-06-20",
        invoiceTotal: 150.00,
        baseCommission: 105.00,
        tipAmount: 0,
        totalPayout: 105.00,
        status: "Frozen",
        paidDate: new Date().toISOString(),
        releaseTime: Date.now() + 48 * 3600 * 1000,
        disputed: true,
        disputeTicketId: "ST-294019",
      });
      escrowChanged = true;
    }
    
    if (!hasAliceEscrow) {
      updatedLedger.unshift({
        id: "esc_alice_smith_mock",
        bookingId: "vgutmssfvpmotwh",
        invoiceId: "inv_alice_smith",
        techId: "tech_alice",
        techName: "Alice Technician",
        techEmail: "alice.tech@example.com",
        clientName: "Alice Smith",
        clientEmail: "alice.smith@example.com",
        serviceType: "TV Mounting",
        jobDate: "2026-06-21",
        invoiceTotal: 120.00,
        baseCommission: 84.00,
        tipAmount: 0,
        totalPayout: 84.00,
        status: "Frozen",
        paidDate: new Date().toISOString(),
        releaseTime: Date.now() + 48 * 3600 * 1000,
        disputed: true,
        disputeTicketId: "ST-849204",
      });
      escrowChanged = true;
    }
    
    if (escrowChanged) {
      localStorage.setItem(escrowKey, JSON.stringify(updatedLedger));
    }
    
    // Seed support tickets
    const existingTickets = localStorage.getItem(ticketKey);
    if (!existingTickets || JSON.parse(existingTickets).length === 0) {
      const seedTickets = [
        {
          id: "ST-294019",
          client_name: "John Miller",
          client_email: "john.miller@example.com",
          client_phone: "4045550192",
          booking_id: "6hejy3kkpoew1sv",
          booking_service: "TV Mounting",
          technician_id: "tech_john",
          technician_name: "John Handyman",
          category: "workmanship",
          description: "The 65 inch TV was mounted in the living room yesterday. However, the wires are hanging down slightly, and I paid for wire concealment. I need a technician to return and fix this.",
          attachments: [],
          status: "Pending Review",
          created: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          updated: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        },
        {
          id: "ST-849204",
          client_name: "Alice Smith",
          client_email: "alice.smith@example.com",
          client_phone: "7705550183",
          booking_id: "vgutmssfvpmotwh",
          booking_service: "TV Mounting",
          technician_id: "tech_alice",
          technician_name: "Alice Technician",
          category: "workmanship",
          description: "The TV is mounted perfectly, but there is some drywall dust left on the carpet under the fireplace. I'd appreciate a quick cleanup or minor credit.",
          attachments: [],
          status: "Pending Review",
          created: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
          updated: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        }
      ];
      localStorage.setItem(ticketKey, JSON.stringify(seedTickets));
    }
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bookingId: "",
    category: "workmanship",
    description: "",
  });

  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ticketResult, setTicketResult] = useState(null);

  // Handle file select and convert to base64 for simulation/persistence
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + attachments.length > 3) {
      toast.error("You can upload a maximum of 3 photos.");
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files (JPG, PNG) are supported.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + " KB",
            data: reader.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    if (!isValidEmail(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      // 1. Fetch bookings to match
      let matchedBooking = null;
      
      // Try PocketBase first
      try {
        if (formData.bookingId) {
          const records = await pb.collection("appointment_bookings").getFullList({
            filter: `id = "${formData.bookingId}" || preferred_time ~ "${formData.bookingId}"`,
          });
          matchedBooking = records.find(
            (b) =>
              b.email?.toLowerCase() === formData.email.toLowerCase() ||
              b.phone?.replace(/\D/g, "") === formData.phone.replace(/\D/g, "")
          );
        }
      } catch (err) {
        console.warn("PocketBase bookings lookup failed, checking local storage:", err);
      }

      // Local storage fallback lookup
      if (!matchedBooking) {
        try {
          const localBookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY) || "[]");
          matchedBooking = localBookings.find(
            (b) =>
              (formData.bookingId && (b.id === formData.bookingId || b.id.endsWith(formData.bookingId))) &&
              (b.email?.toLowerCase() === formData.email.toLowerCase() ||
                b.clientEmail?.toLowerCase() === formData.email.toLowerCase() ||
                b.phone?.replace(/\D/g, "") === formData.phone.replace(/\D/g, "") ||
                b.clientPhone?.replace(/\D/g, "") === formData.phone.replace(/\D/g, ""))
          );
        } catch (err) {
          console.error("Local storage lookup error:", err);
        }
      }

      // Generate support ticket model
      const ticketId = "ST-" + Math.floor(100000 + Math.random() * 900000);
      const newTicket = {
        id: ticketId,
        client_name: formData.name,
        client_email: formData.email,
        client_phone: formData.phone,
        booking_id: matchedBooking ? matchedBooking.id : null,
        booking_service: matchedBooking ? (matchedBooking.service_type || matchedBooking.service) : null,
        technician_id: matchedBooking ? (matchedBooking.assignedTechId || matchedBooking.technicianId || null) : null,
        technician_name: matchedBooking ? (matchedBooking.assignedTechName || matchedBooking.technicianName || null) : null,
        category: formData.category,
        description: formData.description,
        attachments: attachments.map(a => a.data), // Base64 data strings
        status: "Pending Review",
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      };

      // 2. Save ticket to PocketBase (if online) or fallback to Local Storage
      let savedToDb = false;
      try {
        await pb.collection("support_tickets").create(newTicket, { $autoCancel: false });
        savedToDb = true;
      } catch (err) {
        console.warn("PocketBase ticket creation failed, using local storage cache:", err);
      }

      // Always update local storage cache to keep local state synced
      const storedTickets = JSON.parse(localStorage.getItem(LOCAL_SUPPORT_TICKETS_KEY) || "[]");
      storedTickets.push(newTicket);
      localStorage.setItem(LOCAL_SUPPORT_TICKETS_KEY, JSON.stringify(storedTickets));

      // 3. Set outcome result
      setTicketResult({
        ticketId,
        isLinked: !!matchedBooking,
        matchedService: matchedBooking ? (matchedBooking.service_type || matchedBooking.service) : null,
        techName: matchedBooking ? (matchedBooking.assignedTechName || matchedBooking.technicianName) : null,
      });

      if (matchedBooking) {
        try {
          await updateEscrowStatusByBooking(matchedBooking.id, "Frozen");
        } catch (escrowErr) {
          console.warn("Failed to freeze escrow on ticket submission:", escrowErr);
        }
        toast.success(`Ticket submitted! Linked to booking: ${matchedBooking.service_type || matchedBooking.service}`);
      } else {
        toast.warning("Ticket logged. Note: booking reference could not be auto-matched.");
      }

    } catch (error) {
      console.error("Support form submission failed:", error);
      toast.error("Failed to submit support ticket. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Claims & Support"
        title="Support Desk"
        subtitle="Report issues, request warranty claims, or submit workmanship feedback for your recent jobs."
        image="/images/pages/page-contact.jpg"
        alt="Support Desk"
      />

      <div className="py-16 bg-background">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <AnimatePresence mode="wait">
            {!ticketResult ? (
              <motion.div
                key="form-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10"
              >
                {/* Form Column */}
                <div className="lg:col-span-7">
                  <Card className="bg-card border-border shadow-md">
                    <CardContent className="p-6 sm:p-8">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-foreground">File a Claim / Submit Ticket</h2>
                        <p className="text-xs text-muted-foreground mt-1">
                          Provide your details and we will investigate immediately. If linked, active warranties apply.
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="support-name" className="text-xs font-semibold">Your Name *</Label>
                            <Input
                              id="support-name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                              className="bg-muted/40 border-border text-foreground h-10 mt-1.5 focus:border-primary"
                              placeholder="e.g. John Doe"
                            />
                          </div>
                          <div>
                            <Label htmlFor="support-email" className="text-xs font-semibold">Email Address *</Label>
                            <Input
                              id="support-email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              required
                              className="bg-muted/40 border-border text-foreground h-10 mt-1.5 focus:border-primary"
                              placeholder="e.g. john@example.com"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="support-phone" className="text-xs font-semibold">Phone Number *</Label>
                            <Input
                              id="support-phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              required
                              className="bg-muted/40 border-border text-foreground h-10 mt-1.5 focus:border-primary"
                              placeholder="e.g. 404-555-0199"
                            />
                          </div>
                          <div>
                            <Label htmlFor="support-booking" className="text-xs font-semibold flex items-center justify-between">
                              <span>Booking ID / Job Reference</span>
                              <span className="text-[10px] text-muted-foreground font-normal italic">Optional but recommended</span>
                            </Label>
                            <Input
                              id="support-booking"
                              value={formData.bookingId}
                              onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                              className="bg-muted/40 border-border text-foreground h-10 mt-1.5 focus:border-primary"
                              placeholder="e.g. BK-109283"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="support-category" className="text-xs font-semibold">Issue Category *</Label>
                          <select
                            id="support-category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full flex h-10 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-sm text-foreground shadow-sm mt-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <option value="workmanship" className="bg-card">Workmanship Issue (Loose bracket, unlevel, etc.)</option>
                            <option value="damage" className="bg-card">Drywall or Property Damage</option>
                            <option value="billing" className="bg-card">Billing / Overcharge Issue</option>
                            <option value="no-show" className="bg-card">Technician No-Show / Late Arrival</option>
                            <option value="other" className="bg-card">Other Inquiries / Warranty Claims</option>
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="support-desc" className="text-xs font-semibold">Describe the Issue *</Label>
                          <Textarea
                            id="support-desc"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows={4}
                            className="bg-muted/40 border-border text-foreground mt-1.5 focus:border-primary"
                            placeholder="Please provide details about the workmanship error, billing concern, or damage details..."
                          />
                        </div>

                        {/* Photo Attachments */}
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold block">Attach Photo Evidence (Max 3)</Label>
                          <div className="flex gap-4 items-center">
                            <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/20 transition-all text-xs font-semibold text-muted-foreground hover:text-foreground">
                              <Upload size={14} />
                              Select Images
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </label>
                            <span className="text-[10px] text-muted-foreground">Attach photos of the workmanship or damage to support your claim.</span>
                          </div>

                          {/* Image preview strip */}
                          {attachments.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 pt-2">
                              {attachments.map((item, idx) => (
                                <div key={idx} className="relative group rounded-lg overflow-hidden border border-border bg-muted/30 p-2 flex items-center gap-2">
                                  <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-black">
                                    <img src={item.data} alt="preview" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-semibold truncate text-foreground">{item.name}</p>
                                    <p className="text-[8px] text-muted-foreground">{item.size}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeAttachment(idx)}
                                    className="p-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors"
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-3">
                          <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 transition-all"
                          >
                            {loading ? "Submitting Claim..." : "Submit Support Request"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                {/* Information Column */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Warranty Card */}
                  <Card className="bg-card border-border shadow-sm">
                    <CardContent className="p-6 space-y-4">
                      <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <LifeBuoy className="text-primary" size={16} />
                        Atlanta TV Mount PRO Guarantee
                      </h3>
                      <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                        <p>
                          We back all installations with our **1-Year Workmanship Warranty**. If your mount slips, wires loosen, or there are workmanship defects, we correct it free of charge.
                        </p>
                        <p>
                          For workmanship complaints, we dispatch a senior technician to inspect and fix the job within 24 hours.
                        </p>
                        <p>
                          Our technician database monitors quality control. Issues regarding workmanship or damage deduct from technician quality ratings and trigger reviews.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Claims Policy Card */}
                  <Card className="bg-card border-border shadow-sm">
                    <CardContent className="p-6 space-y-3">
                      <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <ShieldAlert className="text-primary" size={16} />
                        Refunds & Claims Guide
                      </h3>
                      <ul className="space-y-2 text-xs text-muted-foreground list-disc list-inside">
                        <li>Submit your booking email and phone number to auto-link your ticket.</li>
                        <li>Refunds are processed to your original payment method upon approval.</li>
                        <li>Property damage claims require photostatic attachments.</li>
                        <li>For urgent escalations, call our dispatcher directly at **770-374-3203**.</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="max-w-xl mx-auto"
              >
                <Card className="bg-card border border-border shadow-lg">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-500 animate-pulse">
                      <CheckCircle2 size={36} />
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-foreground">Support Ticket Logged</h2>
                      <p className="text-xs text-muted-foreground">
                        Your claim has been successfully registered with our administration desk.
                      </p>
                    </div>

                    {/* Ticket Details */}
                    <div className="bg-muted/40 border border-border p-5 rounded-2xl text-left space-y-3 text-xs">
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-muted-foreground font-semibold">Ticket Reference:</span>
                        <span className="font-mono font-bold text-foreground">{ticketResult.ticketId}</span>
                      </div>
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-muted-foreground font-semibold">Linking Status:</span>
                        <span className={`font-semibold ${ticketResult.isLinked ? "text-emerald-500" : "text-yellow-500"}`}>
                          {ticketResult.isLinked ? "Auto-Matched & Verified" : "Verification Pending"}
                        </span>
                      </div>
                      {ticketResult.isLinked && (
                        <>
                          <div className="flex justify-between border-b border-border/50 pb-2">
                            <span className="text-muted-foreground font-semibold">Matching Job:</span>
                            <span className="font-bold text-foreground truncate max-w-[200px]">{ticketResult.matchedService}</span>
                          </div>
                          {ticketResult.techName && (
                            <div className="flex justify-between border-b border-border/50 pb-2">
                              <span className="text-muted-foreground font-semibold">Assigned Tech:</span>
                              <span className="font-semibold text-foreground">{ticketResult.techName}</span>
                            </div>
                          )}
                        </>
                      )}
                      {!ticketResult.isLinked && (
                        <div className="flex items-start gap-2 text-yellow-500 bg-yellow-500/5 border border-yellow-500/10 p-2.5 rounded-lg text-[10px] mt-1 leading-normal">
                          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                          <span>We could not find an active booking under reference ID "{formData.bookingId}" matching your details. A service agent will contact you shortly to review your receipt manually.</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground leading-relaxed">
                      Our dispatch agents review all support inquiries within **2 hours**. If a workmanship repair is approved, we will coordinate another technician to resolve the issues under warranty.
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Link to="/" className="flex-1">
                        <Button variant="outline" className="w-full">
                          <ArrowLeft size={14} className="mr-2" /> Back to Home
                        </Button>
                      </Link>
                      <Button
                        onClick={() => {
                          setTicketResult(null);
                          setFormData({
                            name: "",
                            email: "",
                            phone: "",
                            bookingId: "",
                            category: "workmanship",
                            description: "",
                          });
                          setAttachments([]);
                        }}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                      >
                        Submit Another Issue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </>
  );
};

export default SupportPage;
