
import React, { useState, useMemo } from 'react';
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
import {
  Calculator,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Info,
} from 'lucide-react';

// ─── Pricing data ────────────────────────────────────────────────────────────

const SERVICES = {
  'TV mounting': {
    label: 'TV Mounting',
    base: 120,
    description: 'Wall mount + cable management',
    icon: '📺',
    options: [
      {
        id: 'tv_size',
        label: 'TV Size',
        type: 'select',
        choices: [
          { label: 'Up to 43"', value: 0 },
          { label: '44" – 65"', value: 30 },
          { label: '66" – 85"', value: 60 },
          { label: '86" or larger', value: 100 },
        ],
      },
      {
        id: 'wall_type',
        label: 'Wall Type',
        type: 'select',
        choices: [
          { label: 'Standard drywall', value: 0 },
          { label: 'Brick or concrete', value: 50 },
          { label: 'Tile or stone', value: 65 },
        ],
      },
      {
        id: 'cable_mgmt',
        label: 'Cable Management',
        type: 'select',
        choices: [
          { label: 'Basic (surface cover)', value: 50 },
          { label: 'In-wall concealment', value: 100 },
        ],
      },
      {
        id: 'same_day',
        label: 'Rush / Same-Day Service',
        type: 'toggle',
        delta: 40,
      },
    ],
  },
  'drywall repair': {
    label: 'Drywall Repair',
    base: 95,
    description: 'Patching, texturing, paint-ready finish',
    icon: '🔧',
    options: [
      {
        id: 'damage_size',
        label: 'Damage Size',
        type: 'select',
        choices: [
          { label: 'Small (nail holes / <3")', value: 0 },
          { label: 'Medium (3" – 8")', value: 55 },
          { label: 'Large (8" – 24")', value: 120 },
          { label: 'Multiple / extensive', value: 220 },
        ],
      },
      {
        id: 'texture',
        label: 'Texture Matching',
        type: 'toggle',
        delta: 45,
      },
      {
        id: 'prime_paint',
        label: 'Prime & Paint (single coat)',
        type: 'toggle',
        delta: 55,
      },
    ],
  },
  painting: {
    label: 'Painting',
    base: 175,
    description: 'Interior walls — prep, paint, cleanup',
    icon: '🖌️',
    options: [
      {
        id: 'room_count',
        label: 'Number of Rooms',
        type: 'select',
        choices: [
          { label: '1 room', value: 0 },
          { label: '2 rooms', value: 140 },
          { label: '3 rooms', value: 260 },
          { label: '4+ rooms', value: 380 },
        ],
      },
      {
        id: 'ceiling',
        label: 'Include Ceilings',
        type: 'toggle',
        delta: 80,
      },
      {
        id: 'trim',
        label: 'Include Trim / Baseboards',
        type: 'toggle',
        delta: 65,
      },
      {
        id: 'color_consult',
        label: 'Color Consultation',
        type: 'toggle',
        delta: 0,
        note: 'Included free',
      },
    ],
  },
  carpentry: {
    label: 'Carpentry',
    base: 150,
    description: 'Custom shelving, trim, door work',
    icon: '🪵',
    options: [
      {
        id: 'scope',
        label: 'Project Scope',
        type: 'select',
        choices: [
          { label: 'Minor repair / adjustment', value: 0 },
          { label: 'Single shelf / fixture', value: 60 },
          { label: 'Multiple shelves / unit', value: 180 },
          { label: 'Built-in / major project', value: 380 },
        ],
      },
      {
        id: 'material',
        label: 'Materials Supplied By',
        type: 'select',
        choices: [
          { label: 'Client provides materials', value: 0 },
          { label: 'We source materials (+cost)', value: 40 },
        ],
      },
    ],
  },
  flooring: {
    label: 'Flooring',
    base: 200,
    description: 'Installation per room',
    icon: '🏠',
    options: [
      {
        id: 'floor_type',
        label: 'Floor Type',
        type: 'select',
        choices: [
          { label: 'Laminate', value: 0 },
          { label: 'Engineered hardwood', value: 80 },
          { label: 'Solid hardwood', value: 150 },
          { label: 'Tile', value: 120 },
        ],
      },
      {
        id: 'rooms',
        label: 'Number of Rooms',
        type: 'select',
        choices: [
          { label: '1 room', value: 0 },
          { label: '2 rooms', value: 160 },
          { label: '3+ rooms', value: 300 },
        ],
      },
      {
        id: 'subfloor',
        label: 'Subfloor Prep Needed',
        type: 'toggle',
        delta: 95,
      },
    ],
  },
  plumbing: {
    label: 'Plumbing',
    base: 110,
    description: 'Fixture installation & minor repairs',
    icon: '🚿',
    options: [
      {
        id: 'plumb_scope',
        label: 'Job Type',
        type: 'select',
        choices: [
          { label: 'Faucet replacement', value: 0 },
          { label: 'Toilet installation', value: 60 },
          { label: 'Leak repair', value: 40 },
          { label: 'Drain cleaning', value: 30 },
          { label: 'Fixture + rough-in', value: 130 },
        ],
      },
    ],
  },
  'light electrical': {
    label: 'Light Electrical',
    base: 95,
    description: 'Outlets, switches, fixtures',
    icon: '⚡',
    options: [
      {
        id: 'elec_scope',
        label: 'Job Type',
        type: 'select',
        choices: [
          { label: 'Switch / outlet replacement', value: 0 },
          { label: 'Light fixture install (1–2)', value: 35 },
          { label: 'Ceiling fan install', value: 60 },
          { label: 'New outlet / circuit add', value: 120 },
        ],
      },
      {
        label: 'Number of Fixtures / Points',
        type: 'select',
        choices: [
          { label: '1', value: 0 },
          { label: '2–3', value: 40 },
          { label: '4–6', value: 85 },
          { label: '7+', value: 150 },
        ],
      },
    ],
  },
};

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

const DISCOUNT_RATE = 0.2; // 20% below industry standard

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n) {
  return `$${n.toLocaleString('en-US')}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const QuoteEstimatorModal = () => {
  const { quoteModalOpen, closeQuoteModal } = useUI();

  // Step: 'estimate' | 'contact' | 'done'
  const [step, setStep] = useState('estimate');

  const [selectedService, setSelectedService] = useState('');
  const [optionValues, setOptionValues] = useState({});
  const [selectedHardware, setSelectedHardware] = useState([]);

  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    phone: '',
    project_details: '',
  });
  const [loading, setLoading] = useState(false);

  const getAvailableHardwareOptions = () => {
    const s = String(selectedService).toLowerCase();
    if (s === "tv mounting") {
      return TV_HARDWARE_OPTIONS;
    }
    return GENERAL_HARDWARE_OPTIONS.filter(
      (opt) => !opt.services || opt.services.map(x => x.toLowerCase()).includes(s)
    );
  };

  const toggleHardware = (hw) => {
    setSelectedHardware((prev) =>
      prev.some((item) => item.id === hw.id)
        ? prev.filter((item) => item.id !== hw.id)
        : [...prev, hw]
    );
  };

  // ── Derived pricing ──────────────────────────────────────────────────────
  const serviceConfig = SERVICES[selectedService] || null;

  const { subtotal, lineItems } = useMemo(() => {
    if (!serviceConfig) return { subtotal: 0, lineItems: [] };

    const items = [];
    let total = serviceConfig.base;
    items.push({ label: `${serviceConfig.label} — base rate`, amount: serviceConfig.base });

    for (const opt of serviceConfig.options) {
      if (opt.type === 'select') {
        const val = optionValues[opt.id];
        const match = opt.choices.find((c) => String(c.value) === String(val) || c.label === val);
        if (match && Number(match.value) > 0) {
          total += Number(match.value);
          items.push({ label: `${opt.label} (${match.label})`, amount: Number(match.value) });
        }
      } else if (opt.type === 'toggle') {
        if (optionValues[opt.id]) {
          total += opt.delta;
          items.push({ label: opt.label, amount: opt.delta });
        }
      }
    }

    return { subtotal: total, lineItems: items };
  }, [serviceConfig, optionValues]);

  const hardwareTotal = selectedHardware.reduce((sum, h) => sum + h.price, 0);
  const discountAmount = Math.round(subtotal * DISCOUNT_RATE);
  const finalEstimate = subtotal - discountAmount + hardwareTotal;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleOptionChange = (optId, value) => {
    setOptionValues((prev) => ({ ...prev, [optId]: value }));
  };

  const handleServiceChange = (val) => {
    setSelectedService(val);
    setOptionValues({});
    setSelectedHardware([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contactData.name || !contactData.email || !contactData.phone) {
      toast.error('Please fill in your name, email, and phone.');
      return;
    }

    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    if (!isValidEmail(contactData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);

    const hardwareText = selectedHardware.length > 0
      ? `\n\n[Hardware Requested: ${selectedHardware.map(h => `${h.name} ($${h.price})`).join(", ")}]`
      : "";
    const finalDetails = `${contactData.project_details || ""}${hardwareText}`.trim();

    try {
      await pb.collection('quote_inquiries').create(
        {
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone,
          service_type: selectedService,
          project_details: finalDetails,
          estimated_quote: finalEstimate,
        },
        { $autoCancel: false }
      );
      setStep('done');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    closeQuoteModal();
    setTimeout(() => {
      setStep('estimate');
      setSelectedService('');
      setOptionValues({});
      setContactData({ name: '', email: '', phone: '', project_details: '' });
    }, 300);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={quoteModalOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-[560px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">

        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">Job Estimator</DialogTitle>
              <DialogDescription className="text-sm mt-0.5">
                Build your service, see transparent pricing.
              </DialogDescription>
            </div>
          </div>

          {/* Step indicator */}
          {step !== 'done' && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
              {['estimate', 'contact'].map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${step === s ? 'text-primary' : i < ['estimate','contact'].indexOf(step) ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${step === s ? 'bg-primary text-white border-primary' : i < ['estimate','contact'].indexOf(step) ? 'bg-primary/20 text-primary border-primary/20' : 'border-border text-muted-foreground'}`}>
                      {i + 1}
                    </span>
                    {s === 'estimate' ? 'Build Estimate' : 'Your Details'}
                  </div>
                  {i < 1 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />}
                </React.Fragment>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* ── STEP: DONE ── */}
          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
              <CheckCircle2 className="w-14 h-14 text-primary" />
              <h3 className="text-xl font-semibold">Quote Request Sent!</h3>
              <p className="text-muted-foreground max-w-xs text-sm">
                We'll review your estimate and reach out to{' '}
                <strong>{contactData.email}</strong> within a few hours.
              </p>
              <div className="p-4 bg-primary/10 rounded-xl text-center">
                <p className="text-xs text-muted-foreground mb-1">Your estimate</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(finalEstimate)}</p>
                <p className="text-xs text-muted-foreground mt-1">20% below industry average</p>
              </div>
              <Button onClick={handleClose} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Done
              </Button>
            </div>
          )}

          {/* ── STEP: ESTIMATE ── */}
          {step === 'estimate' && (
            <div className="space-y-5">
              {/* Service selector */}
              <div className="space-y-1.5">
                <Label>Service Type <span className="text-primary">*</span></Label>
                <Select value={selectedService} onValueChange={handleServiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a service to get started" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SERVICES).map(([key, svc]) => (
                      <SelectItem key={key} value={key}>
                        <span className="mr-1.5">{svc.icon}</span> {svc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Options for selected service */}
              {serviceConfig && (
                <>
                  <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span>{serviceConfig.description}. Adjust the options below to refine your estimate.</span>
                  </div>

                  {serviceConfig.options.map((opt) => (
                    <div key={opt.id} className="space-y-1.5">
                      <Label>{opt.label}</Label>

                      {opt.type === 'select' && (
                        <Select
                          value={optionValues[opt.id] || ''}
                          onValueChange={(v) => handleOptionChange(opt.id, v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select…" />
                          </SelectTrigger>
                          <SelectContent>
                            {opt.choices.map((c) => (
                              <SelectItem key={c.label} value={c.label}>
                                {c.label}
                                {c.value > 0 && (
                                  <span className="ml-auto text-muted-foreground text-xs pl-3">
                                    +{formatCurrency(c.value)}
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {opt.type === 'toggle' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleOptionChange(opt.id, !optionValues[opt.id])
                          }
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm transition-all duration-150 ${
                            optionValues[opt.id]
                              ? 'bg-primary/10 border-primary text-primary font-medium'
                              : 'bg-transparent border-border text-foreground hover:border-primary/50'
                          }`}
                        >
                          <span>{opt.label}</span>
                          <span className={`text-xs ${optionValues[opt.id] ? 'text-primary' : 'text-muted-foreground'}`}>
                            {opt.note
                              ? opt.note
                              : opt.delta > 0
                              ? `+${formatCurrency(opt.delta)}`
                              : 'Free'}
                          </span>
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Live estimate panel */}
                  <div className="mt-2 rounded-xl border border-border overflow-hidden">
                    <div className="bg-muted/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Estimate Breakdown
                    </div>
                    <div className="divide-y divide-border/50">
                      {lineItems.map((item, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-2 text-sm">
                          <span className="text-foreground">{item.label}</span>
                          <span className="font-medium">{item.amount === 0 ? '—' : formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                    {subtotal > 0 && (
                      <div className="bg-muted/40 px-4 py-3 space-y-1.5">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Industry standard</span>
                          <span className="line-through">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-500">
                          <span>Our discount (20% off)</span>
                          <span>−{formatCurrency(discountAmount)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-1 border-t border-border mt-1">
                          <span>Your Estimate</span>
                          <span className="text-primary">{formatCurrency(finalEstimate)}</span>
                        </div>
                      </div>
                    )}
                    {subtotal === 0 && (
                      <div className="px-4 py-4 text-center text-sm text-muted-foreground">
                        Select options above to see pricing.
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground text-center pb-1">
                    Estimates are indicative. Final price confirmed on-site.
                  </p>
                </>
              )}
            </div>
          )}

          {/* ── STEP: CONTACT ── */}
          {step === 'contact' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Summary chip */}
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Your estimate for {serviceConfig?.label}</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(finalEstimate)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => setStep('estimate')}
                >
                  <ChevronLeft className="w-3 h-3 mr-1" /> Edit
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="q-name">Name <span className="text-primary">*</span></Label>
                  <Input
                    id="q-name"
                    value={contactData.name}
                    onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                    required
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="q-phone">Phone <span className="text-primary">*</span></Label>
                  <Input
                    id="q-phone"
                    type="tel"
                    value={contactData.phone}
                    onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                    required
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="q-email">Email <span className="text-primary">*</span></Label>
                <Input
                  id="q-email"
                  type="email"
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  required
                  placeholder="your@email.com"
                />
              </div>

              {selectedService && getAvailableHardwareOptions().length > 0 && (
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
                <Label htmlFor="q-details">Additional Details</Label>
                <Textarea
                  id="q-details"
                  value={contactData.project_details}
                  onChange={(e) => setContactData({ ...contactData, project_details: e.target.value })}
                  placeholder="Anything else we should know about the job?"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? 'Sending…' : 'Send My Quote Request'}
              </Button>
            </form>
          )}
        </div>

        {/* Footer CTA — only on estimate step when a service is selected */}
        {step === 'estimate' && selectedService && subtotal > 0 && (
          <div className="px-6 py-4 border-t border-border flex-shrink-0">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setStep('contact')}
            >
              Book This Job — {formatCurrency(finalEstimate)} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuoteEstimatorModal;
