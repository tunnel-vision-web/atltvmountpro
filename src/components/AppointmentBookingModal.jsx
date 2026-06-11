
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUI } from '@/contexts/UIContext';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { CalendarDays, Clock, CheckCircle2 } from 'lucide-react';

const AppointmentBookingModal = () => {
  const { bookingModalOpen, closeBookingModal } = useUI();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: '',
    preferred_date: '',
    preferred_time: '',
    project_description: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.service_type ||
      !formData.preferred_date
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await pb.collection('appointment_bookings').create(
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service_type: formData.service_type,
          preferred_date: formData.preferred_date,
          preferred_time: formData.preferred_time,
          project_description: formData.project_description,
        },
        { $autoCancel: false }
      );

      setSubmitted(true);
    } catch (error) {
      console.error('Booking submission error:', error);
      toast.error(
        error.message || 'Failed to book appointment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    closeBookingModal();
    // Reset after close animation
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        service_type: '',
        preferred_date: '',
        preferred_time: '',
        project_description: '',
      });
    }, 300);
  };

  return (
    <Dialog open={bookingModalOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-[520px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Fixed header */}
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

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
              <CheckCircle2 className="w-14 h-14 text-primary" />
              <h3 className="text-xl font-semibold">Booking Received!</h3>
              <p className="text-muted-foreground max-w-xs">
                Thanks, <strong>{formData.name}</strong>. We'll reach out to{' '}
                {formData.email} within 24 hours to confirm your appointment.
              </p>
              <Button
                onClick={handleClose}
                className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name + Phone row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="booking-name">
                    Name <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="booking-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-phone">
                    Phone <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="booking-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="booking-email">
                  Email <span className="text-primary">*</span>
                </Label>
                <Input
                  id="booking-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  placeholder="your@email.com"
                />
              </div>

              {/* Service */}
              <div className="space-y-1.5">
                <Label htmlFor="booking-service">
                  Service Type <span className="text-primary">*</span>
                </Label>
                <Select
                  value={formData.service_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, service_type: value })
                  }
                >
                  <SelectTrigger id="booking-service">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TV mounting">TV Mounting</SelectItem>
                    <SelectItem value="drywall repair">Drywall Repair</SelectItem>
                    <SelectItem value="painting">Painting</SelectItem>
                    <SelectItem value="carpentry">Carpentry</SelectItem>
                    <SelectItem value="flooring">Flooring</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="light electrical">Light Electrical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="booking-date">
                    Preferred Date <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="booking-date"
                    type="date"
                    value={formData.preferred_date}
                    onChange={(e) =>
                      setFormData({ ...formData, preferred_date: e.target.value })
                    }
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-time">Preferred Time</Label>
                  <Select
                    value={formData.preferred_time}
                    onValueChange={(value) =>
                      setFormData({ ...formData, preferred_time: value })
                    }
                  >
                    <SelectTrigger id="booking-time">
                      <SelectValue placeholder="Any time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8:00 AM">8:00 AM</SelectItem>
                      <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                      <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                      <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                      <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                      <SelectItem value="1:00 PM">1:00 PM</SelectItem>
                      <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                      <SelectItem value="3:00 PM">3:00 PM</SelectItem>
                      <SelectItem value="4:00 PM">4:00 PM</SelectItem>
                      <SelectItem value="5:00 PM">5:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="booking-description">Project Description</Label>
                <Textarea
                  id="booking-description"
                  value={formData.project_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      project_description: e.target.value,
                    })
                  }
                  placeholder="Describe your project — TV size, room type, access, etc."
                  rows={3}
                />
              </div>

              {/* Same-day note */}
              <div className="flex items-start gap-2 p-3 bg-muted/60 rounded-lg text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>
                  Need it today?{' '}
                  <a href="tel:770-374-3203" className="text-primary underline underline-offset-2">
                    Call 770-374-3203
                  </a>{' '}
                  — same-day service available with $40 rush fee.
                </span>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? 'Submitting…' : 'Confirm Booking Request'}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentBookingModal;
