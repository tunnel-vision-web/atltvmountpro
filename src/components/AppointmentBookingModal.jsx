
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUI } from '@/contexts/UIContext';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.service_type || !formData.preferred_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await pb.collection('appointment_bookings').create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service_type: formData.service_type,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time,
        project_description: formData.project_description,
      }, { $autoCancel: false });

      toast.success('Booking submitted successfully! We will contact you soon.');
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        service_type: '',
        preferred_date: '',
        preferred_time: '',
        project_description: '',
      });
      closeBookingModal();
    } catch (error) {
      console.error('Booking submission error:', error);
      toast.error(error.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={bookingModalOpen} onOpenChange={closeBookingModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book an appointment</DialogTitle>
          <DialogDescription>
            Schedule your service appointment and we'll confirm within 24 hours
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="booking-name">Name</Label>
            <Input
              id="booking-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="text-gray-900"
              placeholder="Your name"
            />
          </div>
          <div>
            <Label htmlFor="booking-email">Email</Label>
            <Input
              id="booking-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="text-gray-900"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <Label htmlFor="booking-phone">Phone</Label>
            <Input
              id="booking-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="text-gray-900"
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="booking-service">Service type</Label>
            <Select
              value={formData.service_type}
              onValueChange={(value) => setFormData({ ...formData, service_type: value })}
            >
              <SelectTrigger id="booking-service" className="text-gray-900">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TV mounting">TV mounting</SelectItem>
                <SelectItem value="drywall repair">Drywall repair</SelectItem>
                <SelectItem value="painting">Painting</SelectItem>
                <SelectItem value="carpentry">Carpentry</SelectItem>
                <SelectItem value="flooring">Flooring</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="light electrical">Light electrical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="booking-date">Preferred date</Label>
              <Input
                id="booking-date"
                type="date"
                value={formData.preferred_date}
                onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                required
                className="text-gray-900"
              />
            </div>
            <div>
              <Label htmlFor="booking-time">Preferred time</Label>
              <Input
                id="booking-time"
                type="time"
                value={formData.preferred_time}
                onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                className="text-gray-900"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="booking-description">Project description</Label>
            <Textarea
              id="booking-description"
              value={formData.project_description}
              onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
              className="text-gray-900"
              placeholder="Tell us about your project..."
              rows={3}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? 'Booking...' : 'Book appointment'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentBookingModal;
