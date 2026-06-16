import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAllCMS } from '@/hooks/useCMS';
import MediaPickerButton from '@/components/MediaPickerButton';

const PAGES = [
  { id: 'home', label: 'Home Page' },
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About Page' },
  { id: 'contact', label: 'Contact Page' },
];

export default function CMSEditor() {
  const { data, loading, fetchAll, savePage } = useAllCMS();
  const [activePage, setActivePage] = useState('home');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (data[activePage]) {
      setFormData(data[activePage]);
    }
  }, [activePage, data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await savePage(activePage, formData);
      if (result.success) {
        toast.success(result.offline ? 'Saved to localStorage (offline).' : 'Saved successfully.');
      }
    } catch (err) {
      toast.error('Failed to save CMS data.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateServiceField = (idx, field, value) => {
    const list = [...(formData.list || [])];
    list[idx] = { ...list[idx], [field]: value };
    updateField('list', list);
  };

  const addService = () => {
    const list = [...(formData.list || [])];
    list.push({
      id: "svc_" + Math.random().toString(36).substr(2, 9),
      title: "New Service",
      tagline: "Professional solution.",
      description: "Brief summary description.",
      details: "Detailed description of what is included.",
      benefits: ["Professional technicians", "Satisfied customers"],
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80",
      icon: "Hammer",
      isCore: false
    });
    updateField('list', list);
  };

  const deleteService = (idx) => {
    const list = (formData.list || []).filter((_, i) => i !== idx);
    updateField('list', list);
  };

  if (loading && Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Content Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage page content, hero images, and contact details across the site.
        </p>
      </div>

      {/* Page Selector */}
      <div className="flex gap-2 border-b border-border pb-3">
        {PAGES.map((page) => (
          <button
            key={page.id}
            onClick={() => setActivePage(page.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activePage === page.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold capitalize">{activePage} Page Settings</h2>
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save size={14} className="mr-1.5" />}
          Save Changes
        </Button>
      </div>

      {/* Home Page Editor */}
      {activePage === 'home' && (
        <div className="space-y-6">
          <CMSCard title="Hero Section">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Hero Title</label>
                <input
                  value={formData.heroTitle || ''}
                  onChange={(e) => updateField('heroTitle', e.target.value)}
                  className="input-base w-full"
                  placeholder="e.g. Atlanta TV Mount Pro"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Hero Subtitle</label>
                <input
                  value={formData.heroSubtitle || ''}
                  onChange={(e) => updateField('heroSubtitle', e.target.value)}
                  className="input-base w-full"
                  placeholder="e.g. Professional TV Mounting & Handyman Services"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Hero Description</label>
              <textarea
                value={formData.heroDescription || ''}
                onChange={(e) => updateField('heroDescription', e.target.value)}
                rows={3}
                className="input-base w-full resize-none"
                placeholder="Short description for SEO/meta..."
              />
            </div>
            <MediaPickerButton
              label="Hero Background Video (optional)"
              value={formData.heroVideo || ''}
              onChange={(val) => updateField('heroVideo', val)}
              accept="video"
              placeholder="Select or upload a hero video…"
            />
          </CMSCard>

          <CMSCard title="Featured Services">
            {(formData.featuredServices || []).map((svc, idx) => (
              <div key={idx} className="border border-border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
                    <input
                      value={svc.title || ''}
                      onChange={(e) => {
                        const updated = [...(formData.featuredServices || [])];
                        updated[idx] = { ...updated[idx], title: e.target.value };
                        updateField('featuredServices', updated);
                      }}
                      className="input-base w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Tagline</label>
                    <input
                      value={svc.tagline || ''}
                      onChange={(e) => {
                        const updated = [...(formData.featuredServices || [])];
                        updated[idx] = { ...updated[idx], tagline: e.target.value };
                        updateField('featuredServices', updated);
                      }}
                      className="input-base w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                  <textarea
                    value={svc.description || ''}
                    onChange={(e) => {
                      const updated = [...(formData.featuredServices || [])];
                      updated[idx] = { ...updated[idx], description: e.target.value };
                      updateField('featuredServices', updated);
                    }}
                    rows={2}
                    className="input-base w-full resize-none"
                  />
                </div>
                <MediaPickerButton
                  label="Service Image"
                  value={svc.image || ''}
                  onChange={(val) => {
                    const updated = [...(formData.featuredServices || [])];
                    updated[idx] = { ...updated[idx], image: val };
                    updateField('featuredServices', updated);
                  }}
                  accept="image"
                />
                <MediaPickerButton
                  label="Service Video (optional)"
                  value={svc.video || ''}
                  onChange={(val) => {
                    const updated = [...(formData.featuredServices || [])];
                    updated[idx] = { ...updated[idx], video: val };
                    updateField('featuredServices', updated);
                  }}
                  accept="video"
                />
              </div>
            ))}
          </CMSCard>

          <CMSCard title="FAQs">
            {(formData.faqs || []).map((faq, idx) => (
              <div key={idx} className="border border-border rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Question</label>
                  <input
                    value={faq.question || ''}
                    onChange={(e) => {
                      const updated = [...(formData.faqs || [])];
                      updated[idx] = { ...updated[idx], question: e.target.value };
                      updateField('faqs', updated);
                    }}
                    className="input-base w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Answer</label>
                  <textarea
                    value={faq.answer || ''}
                    onChange={(e) => {
                      const updated = [...(formData.faqs || [])];
                      updated[idx] = { ...updated[idx], answer: e.target.value };
                      updateField('faqs', updated);
                    }}
                    rows={3}
                    className="input-base w-full resize-none"
                  />
                </div>
              </div>
            ))}
          </CMSCard>
        </div>
      )}

      {/* About Page Editor */}
      {activePage === 'about' && (
        <div className="space-y-6">
          <CMSCard title="Hero Section">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Hero Title</label>
              <input
                value={formData.heroTitle || ''}
                onChange={(e) => updateField('heroTitle', e.target.value)}
                className="input-base w-full"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Hero Subtitle</label>
              <input
                value={formData.heroSubtitle || ''}
                onChange={(e) => updateField('heroSubtitle', e.target.value)}
                className="input-base w-full"
              />
            </div>
            <MediaPickerButton
              label="Hero Image"
              value={formData.heroImage || ''}
              onChange={(val) => updateField('heroImage', val)}
              accept="image"
            />
            <MediaPickerButton
              label="Hero Video (optional)"
              value={formData.heroVideo || ''}
              onChange={(val) => updateField('heroVideo', val)}
              accept="video"
            />
          </CMSCard>

          <CMSCard title="Our Story">
            {(formData.storyParagraphs || []).map((para, idx) => (
              <div key={idx}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Paragraph {idx + 1}</label>
                <textarea
                  value={para || ''}
                  onChange={(e) => {
                    const updated = [...(formData.storyParagraphs || [])];
                    updated[idx] = e.target.value;
                    updateField('storyParagraphs', updated);
                  }}
                  rows={4}
                  className="input-base w-full resize-none"
                />
              </div>
            ))}
          </CMSCard>

          <CMSCard title="Statistics">
            {(formData.stats || []).map((stat, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-border rounded-lg p-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Label</label>
                  <input
                    value={stat.label || ''}
                    onChange={(e) => {
                      const updated = [...(formData.stats || [])];
                      updated[idx] = { ...updated[idx], label: e.target.value };
                      updateField('stats', updated);
                    }}
                    className="input-base w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Value</label>
                  <input
                    value={stat.value || ''}
                    onChange={(e) => {
                      const updated = [...(formData.stats || [])];
                      updated[idx] = { ...updated[idx], value: e.target.value };
                      updateField('stats', updated);
                    }}
                    className="input-base w-full"
                  />
                </div>
              </div>
            ))}
          </CMSCard>

          <CMSCard title="Why Choose Us">
            {(formData.whyChooseUs || []).map((item, idx) => (
              <div key={idx} className="border border-border rounded-lg p-3 space-y-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
                  <input
                    value={item.title || ''}
                    onChange={(e) => {
                      const updated = [...(formData.whyChooseUs || [])];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      updateField('whyChooseUs', updated);
                    }}
                    className="input-base w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => {
                      const updated = [...(formData.whyChooseUs || [])];
                      updated[idx] = { ...updated[idx], description: e.target.value };
                      updateField('whyChooseUs', updated);
                    }}
                    rows={2}
                    className="input-base w-full resize-none"
                  />
                </div>
              </div>
            ))}
          </CMSCard>
        </div>
      )}

      {/* Contact Page Editor */}
      {activePage === 'contact' && (
        <div className="space-y-6">
          <CMSCard title="Hero Section">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Hero Title</label>
              <input
                value={formData.heroTitle || ''}
                onChange={(e) => updateField('heroTitle', e.target.value)}
                className="input-base w-full"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Hero Subtitle</label>
              <input
                value={formData.heroSubtitle || ''}
                onChange={(e) => updateField('heroSubtitle', e.target.value)}
                className="input-base w-full"
              />
            </div>
            <MediaPickerButton
              label="Hero Image"
              value={formData.heroImage || ''}
              onChange={(val) => updateField('heroImage', val)}
              accept="image"
            />
            <MediaPickerButton
              label="Hero Video (optional)"
              value={formData.heroVideo || ''}
              onChange={(val) => updateField('heroVideo', val)}
              accept="video"
            />
          </CMSCard>

          <CMSCard title="Contact Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                <input
                  value={formData.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="input-base w-full"
                  placeholder="e.g. 770-374-3203"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
                <input
                  value={formData.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="input-base w-full"
                  placeholder="e.g. Atlanta, GA"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Service Area</label>
              <input
                value={formData.serviceArea || ''}
                onChange={(e) => updateField('serviceArea', e.target.value)}
                className="input-base w-full"
                placeholder="e.g. Atlanta metro area and throughout Georgia"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Hours</label>
              <textarea
                value={formData.hours || ''}
                onChange={(e) => updateField('hours', e.target.value)}
                rows={3}
                className="input-base w-full resize-none"
                placeholder="Monday - Saturday: 8:00 AM - 6:00 PM"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Map Embed URL</label>
              <input
                value={formData.mapEmbed || ''}
                onChange={(e) => updateField('mapEmbed', e.target.value)}
                className="input-base w-full"
                placeholder="OpenStreetMap embed URL..."
              />
            </div>
          </CMSCard>
        </div>
      )}

      {/* Services Page Editor */}
      {activePage === 'services' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-foreground">Manage Services ({ (formData.list || []).length })</h3>
            <button
              onClick={addService}
              type="button"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
            >
              + Add New Service
            </button>
          </div>

          {(formData.list || []).map((svc, idx) => (
            <CMSCard key={svc.id || idx} title={`${idx + 1}. ${svc.title || 'New Service'}`}>
              <div className="flex justify-between items-center pb-2 border-b border-border mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`is_core_${idx}`}
                      checked={!!svc.isCore}
                      onChange={(e) => updateServiceField(idx, 'isCore', e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-muted/40 cursor-pointer"
                    />
                    <label htmlFor={`is_core_${idx}`} className="text-xs font-medium text-foreground cursor-pointer select-none">
                      Highlight as Core Service on Landing Page
                    </label>
                  </div>
                  {svc.isCore && (
                    <span className="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full border border-primary/20">
                      Core Landing Spotlight
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteService(idx)}
                  type="button"
                  className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded transition-all"
                >
                  Delete Service
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Service Title</label>
                  <input
                    value={svc.title || ''}
                    onChange={(e) => updateServiceField(idx, 'title', e.target.value)}
                    className="input-base w-full"
                    placeholder="e.g. TV Mounting"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Homepage Tagline</label>
                  <input
                    value={svc.tagline || ''}
                    onChange={(e) => updateServiceField(idx, 'tagline', e.target.value)}
                    className="input-base w-full"
                    placeholder="e.g. Clean walls. Perfect angles."
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Short Summary Description</label>
                <input
                  value={svc.description || ''}
                  onChange={(e) => updateServiceField(idx, 'description', e.target.value)}
                  className="input-base w-full"
                  placeholder="Appears on landing page services list..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Detailed Description (Services Page)</label>
                <textarea
                  value={svc.details || ''}
                  onChange={(e) => updateServiceField(idx, 'details', e.target.value)}
                  rows={3}
                  className="input-base w-full resize-none"
                  placeholder="Full description of what this service covers..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Benefits / Bullet Points (comma-separated)</label>
                  <input
                    value={svc.benefits ? (Array.isArray(svc.benefits) ? svc.benefits.join(', ') : svc.benefits) : ''}
                    onChange={(e) => {
                      const benefitsArr = e.target.value.split(',').map(b => b.trim()).filter(Boolean);
                      updateServiceField(idx, 'benefits', benefitsArr);
                    }}
                    className="input-base w-full"
                    placeholder="e.g. Stud finder verification, Cable management, Fully insured"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Lucide Icon Class</label>
                  <select
                    value={svc.icon || 'Hammer'}
                    onChange={(e) => updateServiceField(idx, 'icon', e.target.value)}
                    className="input-base w-full h-[38px] bg-muted/40 text-sm border-border text-foreground"
                  >
                    <option value="Tv">Tv (Television)</option>
                    <option value="Hammer">Hammer (Drywall/Handyman)</option>
                    <option value="Paintbrush">Paintbrush (Painting)</option>
                    <option value="Wrench">Wrench (Carpentry)</option>
                    <option value="Home">Home (Flooring)</option>
                    <option value="Droplet">Droplet (Plumbing)</option>
                    <option value="Zap">Zap (Electrical)</option>
                    <option value="Trash">Trash (Cleanup)</option>
                    <option value="Shield">Shield (Security)</option>
                    <option value="Sun">Sun (Outdoor/Patio)</option>
                    <option value="Scissors">Scissors (Hanging Art)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MediaPickerButton
                  label="Service Image"
                  value={svc.image || ''}
                  onChange={(val) => updateServiceField(idx, 'image', val)}
                  accept="image"
                />
                <MediaPickerButton
                  label="Service Video (optional)"
                  value={svc.video || ''}
                  onChange={(val) => updateServiceField(idx, 'video', val)}
                  accept="video"
                />
              </div>
            </CMSCard>
          ))}

          { (formData.list || []).length === 0 && (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground text-sm">No services defined. Click "+ Add New Service" to start.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CMSCard({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <h3 className="font-bold text-foreground">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

