import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAllCMS } from '@/hooks/useCMS';
import MediaPickerButton from '@/components/MediaPickerButton';

const PAGES = [
  { id: 'home', label: 'Home Page' },
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

