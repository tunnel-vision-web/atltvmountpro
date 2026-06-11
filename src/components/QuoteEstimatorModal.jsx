
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

const servicePricing = {
  'TV mounting': 150,
  'drywall repair': 200,
  'painting': 300,
  'carpentry': 250,
  'flooring': 400,
  'plumbing': 180,
  'light electrical': 160,
};

const QuoteEstimatorModal = () => {
  const { quoteModalOpen, closeQuoteModal } = useUI();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: '',
    project_details: '',
  });
  const [estimatedQuote, setEstimatedQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateQuote = () => {
    if (!formData.service_type) return;
    const basePrice = servicePricing[formData.service_type];
    const discountedPrice = Math.round(basePrice * 0.8);
    setEstimatedQuote(discountedPrice);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.service_type || !formData.project_details) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await pb.collection('quote_inquiries').create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service_type: formData.service_type,
        project_details: formData.project_details,
        estimated_quote: estimatedQuote,
      }, { $autoCancel: false });

      toast.success('Quote request submitted successfully');
      setFormData({
        name: '',
        email: '',
        phone: '',
        service_type: '',
        project_details: '',
      });
      setEstimatedQuote(null);
      closeQuoteModal();
    } catch (error) {
      console.error('Quote submission error:', error);
      toast.error('Failed to submit quote request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={quoteModalOpen} onOpenChange={closeQuoteModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Get a free quote</DialogTitle>
          <DialogDescription>
            Fill out the form below and we'll provide an estimated quote for your project
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="quote-name">Name</Label>
            <Input
              id="quote-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="text-gray-900"
              placeholder="Your name"
            />
          </div>
          <div>
            <Label htmlFor="quote-email">Email</Label>
            <Input
              id="quote-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="text-gray-900"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <Label htmlFor="quote-phone">Phone</Label>
            <Input
              id="quote-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="text-gray-900"
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="quote-service">Service type</Label>
            <Select
              value={formData.service_type}
              onValueChange={(value) => {
                setFormData({ ...formData, service_type: value });
                setTimeout(calculateQuote, 100);
              }}
            >
              <SelectTrigger id="quote-service" className="text-gray-900">
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
          <div>
            <Label htmlFor="quote-details">Project details</Label>
            <Textarea
              id="quote-details"
              value={formData.project_details}
              onChange={(e) => setFormData({ ...formData, project_details: e.target.value })}
              required
              className="text-gray-900"
              placeholder="Describe your project..."
              rows={4}
            />
          </div>
          {estimatedQuote && (
            <div className="p-4 bg-primary/10 rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Estimated quote</p>
              <p className="text-3xl font-bold text-primary">${estimatedQuote}</p>
              <p className="text-xs text-muted-foreground mt-1">20% below industry standard</p>
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit quote request'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteEstimatorModal;
