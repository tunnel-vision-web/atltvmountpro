import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUI } from "@/contexts/UIContext";
import pb from "@/lib/pocketbaseClient";
import { toast } from "sonner";
import { CalendarDays, Clock, CheckCircle2 } from "lucide-react";
import { autoCreateInvoiceForBooking } from "@/lib/invoiceUtils";

const TV_HARDWARE_OPTIONS = [
  { id: "hw-flat", name: "Standard Flat Mount (Up to 80\")", price: 49 },
  { id: "hw-tilt", name: "Tilting Wall Mount (Up to 80\")", price: 59 },
  { id: "hw-motion", name: "Full-Motion Articulating Mount (Up to 85\")", price: 89 },
  { id: "hw-hdmi", name: "Premium HDMI 2.1 Cable (10ft)", price: 19 },
  { id: "hw-conceal", name: "In-Wall Cable Concealment Power Kit", price: 69 },
];

const GENERAL_HARDWARE_OPTIONS = [
  { id: "hw-drywall-kit", name: "Drywall Patch & Paint Backing Kit", price: 15, services: ["Drywall Repair", "Painting"] },
  { id: "hw-brackets", name: "Floating Shelf Brackets (Pair)", price: 25, services: ["Carpentry", "Other"] },
  { id: "hw-anchors", name: "Heavy-Duty Toggle Wall Anchors Pack", price: 12, services: ["TV Mounting", "Carpentry", "Other", "Light Electrical"] },
];

const LOCAL_BOOKINGS_KEY = "atltvmountpro_local_bookings";

const AppointmentBookingModal = () => {
  const { bookingModalOpen, closeBookingModal } = useUI();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service_type: "",
    preferred_date: "",
    preferred_time: "",
    project_description: "",
  });
  const [selectedHardware, setSelectedHardware] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getAvailableHardwareOptions = () => {
    if (formData.service_type === "TV Mounting") {
      return TV_HARDWARE_OPTIONS;
    }
    return GENERAL_HARDWARE_OPTIONS.filter(
      (opt) => !opt.services || opt.services.includes(formData.service_type)
    );
  };

  const toggleHardware = (hw) => {
    setSelectedHardware((prev) =>
      prev.some((item) => item.id === hw.id)
        ? prev.filter((item) => item.id !== hw.id)
        : [...prev, hw]
    );
  };

  const saveBookingLocally = (record) => {
    const stored = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY) || "[]");
    stored.unshift(record);
    localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(stored));
    return record;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.service_type ||
      !formData.preferred_date
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    const hardwareText = selectedHardware.length > 0
      ? `\n\n[Hardware Requested: ${selectedHardware.map(h => `${h.name} ($${h.price})`).join(", ")}]`
      : "";
    const finalDescription = `${formData.project_description || ""}${hardwareText}`.trim();

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      service_type: formData.service_type,
      preferred_date: formData.preferred_date,
      preferred_time: formData.preferred_time,
      project_description: finalDescription,
      status: "Pending",
      hardwareItems: selectedHardware,
    };

    const pbPayload = {
      Name: formData.name,
      Email: formData.email,
      Phone_Number: formData.phone,
      Preferred_Date: formData.preferred_date,
      Preferred_Time: formData.preferred_time,
      Project_Description: finalDescription,
    };

    try {
      const record = await pb.collection("appointment_bookings").create(
        pbPayload,
        { $autoCancel: false },
      );
      const normalized = {
        ...record,
        id: record.id,
        name: record.Name || record.name || formData.name,
        email: record.Email || record.email || formData.email,
        phone: record.Phone_Number || record.phone || formData.phone,
        preferred_date: record.Preferred_Date || record.preferred_date || formData.preferred_date,
        preferred_time: record.Preferred_Time || record.preferred_time || formData.preferred_time,
        project_description: record.Project_Description || record.project_description || finalDescription,
        hardwareItems: selectedHardware,
      };
      autoCreateInvoiceForBooking(normalized);
      setSubmitted(true);
    } catch (error) {
      console.warn("Booking submission error, saving locally:", error);
      const localRecord = saveBookingLocally({
        ...payload,
        id: "local_" + Date.now(),
        created: new Date().toISOString(),
      });
      autoCreateInvoiceForBooking(localRecord);
      setSubmitted(true);
      toast.success("Appointment booked (saved locally).");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    closeBookingModal();
    setTimeout(() => {
      setSubmitted(false);
      setSelectedHardware([]);
      setFormData({
        name: "",
        email: "",
        phone: "",
        service_type: "",
        preferred_date: "",
        preferred_time: "",
        project_description: "",
      });
    }, 300);
  };

  return (
    <Dialog open={bookingModalOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-[520px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">Book an Appointment</DialogTitle>
              <DialogDescription className="text-sm mt-0.5">
                We'll confirm within 24 hours of your request.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
              <CheckCircle2 className="w-14 h-14 text-primary" />
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Appointment Requested!
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Thank you, {formData.name}. We'll confirm your{" "}
                  {formData.service_type} appointment for{" "}
                  {formData.preferred_date} shortly.
                </p>
              </div>
              <Button onClick={handleClose} className="mt-2">
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="booking-name">Full Name *</Label>
                  <Input
                    id="booking-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-phone">Phone *</Label>
                  <Input
                    id="booking-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="booking-email">Email *</Label>
                <Input
                  id="booking-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="you@email.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Service Type *</Label>
                <Select
                  value={formData.service_type}
                  onValueChange={(v) =>
                    setFormData({ ...formData, service_type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "TV Mounting",
                      "Drywall Repair",
                      "Painting",
                      "Carpentry",
                      "Flooring",
                      "Plumbing",
                      "Light Electrical",
                      "Other",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="booking-date">Preferred Date *</Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="booking-date"
                      type="date"
                      value={formData.preferred_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferred_date: e.target.value,
                        })
                      }
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-time">Preferred Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="booking-time"
                      value={formData.preferred_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferred_time: e.target.value,
                        })
                      }
                      placeholder="e.g. 10:00 AM"
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              {formData.service_type && getAvailableHardwareOptions().length > 0 && (
                <div className="space-y-2 border border-border bg-muted/30 rounded-xl p-3.5">
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-sm font-semibold text-foreground">Need Mounts or Hardware?</Label>
                    {selectedHardware.length > 0 && (
                      <span className="text-xs bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-semibold">
                        +${selectedHardware.reduce((sum, h) => sum + h.price, 0)} hardware
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground -mt-1 mb-2">
                    Select any accessories to have the technician arrive with the required hardware.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {getAvailableHardwareOptions().map((opt) => {
                      const isSelected = selectedHardware.some((item) => item.id === opt.id);
                      return (
                        <div
                          key={opt.id}
                          onClick={() => toggleHardware(opt)}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border text-[11px] cursor-pointer select-none transition-all duration-150 ${
                            isSelected
                              ? "bg-primary/10 border-primary text-foreground font-medium"
                              : "bg-muted/40 border-border text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 bg-muted/40 cursor-pointer pointer-events-none"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="truncate">{opt.name}</p>
                            <p className="text-[10px] text-primary/85 font-semibold mt-0.5">+${opt.price}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="booking-desc">Project Description</Label>
                <Textarea
                  id="booking-desc"
                  value={formData.project_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      project_description: e.target.value,
                    })
                  }
                  placeholder="Tell us about your project..."
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Request Appointment"}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentBookingModal;
