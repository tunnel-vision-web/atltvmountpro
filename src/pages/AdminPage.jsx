import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, ChevronLeft, Save, Loader2, Eye, EyeOff, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const ADMIN_KEY_STORAGE = 'atltvmountpro_admin_key';

const ALL_SERVICES = [
  'TV Mounting', 'Cable Management', 'Drywall Repair',
  'Painting', 'Carpentry', 'Flooring', 'Plumbing',
  'Light Electrical', 'Shelf Installation',
];

const EMPTY_FORM = {
  title: '',
  location: '',
  description: '',
  services: [],
  thumbnail: '',
  images: [''],
  sort_order: 0,
};

// ── Login screen ──────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }) => {
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verify', {
        headers: { 'x-admin-key': key },
      });
      if (res.ok) {
        localStorage.setItem(ADMIN_KEY_STORAGE, key);
        onLogin(key);
      } else {
        setErr('Invalid admin key. Try again.');
      }
    } catch {
      setErr('Network error. Is the API server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-xl">
        <img
          src="https://horizons-cdn.hostinger.com/10e32518-3a0b-422d-a971-66d579a3db35/47c7080c79518d5a6d915f8a78db18d6.png"
          alt="ATL TV Mount PRO"
          className="h-10 mx-auto mb-6"
        />
        <h1 className="text-xl font-bold text-center mb-1">Admin Panel</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">Enter your admin key to continue</p>
        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Admin key"
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </Button>
        </form>
        <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground mt-4 transition-colors">
          ← Back to site
        </Link>
      </div>
    </div>
  );
};

// ── Project form dialog ────────────────────────────────────────────────────────
const ProjectFormDialog = ({ open, onClose, initial, adminKey, onSaved }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? { ...initial, images: initial.images.length ? initial.images : [''], sort_order: initial.sort_order ?? 0 }
          : EMPTY_FORM,
      );
    }
  }, [open, initial]);

  const field = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleService = (s) =>
    setForm((f) => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s],
    }));

  const setImage = (i, v) =>
    setForm((f) => {
      const imgs = [...f.images];
      imgs[i] = v;
      return { ...f, images: imgs };
    });

  const addImage = () => setForm((f) => ({ ...f, images: [...f.images, ''] }));
  const removeImage = (i) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      images: form.images.filter(Boolean),
      sort_order: Number(form.sort_order) || 0,
    };
    try {
      const url = initial ? `/api/projects/${initial.id}` : '/api/projects';
      const res = await fetch(url, {
        method: initial ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
      const saved = await res.json();
      onSaved(saved, !!initial);
      onClose();
      toast.success(initial ? 'Project updated.' : 'Project created.');
    } catch {
      toast.error('Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Project' : 'New Project'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5 mt-2">
          {/* Title + location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title *</label>
              <input
                value={form.title}
                onChange={(e) => field('title', e.target.value)}
                required
                className="input-base w-full"
                placeholder='e.g. 75" Samsung Wall Mount'
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Location *</label>
              <input
                value={form.location}
                onChange={(e) => field('location', e.target.value)}
                required
                className="input-base w-full"
                placeholder="e.g. Buckhead, Atlanta, GA"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => field('description', e.target.value)}
              rows={4}
              className="input-base w-full resize-none"
              placeholder="Describe the project scope and outcome..."
            />
          </div>

          {/* Services */}
          <div>
            <label className="text-sm font-medium mb-2 block">Services Provided</label>
            <div className="flex flex-wrap gap-2">
              {ALL_SERVICES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleService(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
                    form.services.includes(s)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-border hover:border-primary/40'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Thumbnail URL</label>
            <input
              value={form.thumbnail}
              onChange={(e) => field('thumbnail', e.target.value)}
              className="input-base w-full"
              placeholder="https://… or /images/projects/project-1/main.jpg"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Drop real images in <code className="bg-muted px-1 rounded">public/images/projects/project-N/</code> and reference as <code className="bg-muted px-1 rounded">/images/projects/project-N/main.jpg</code>
            </p>
          </div>

          {/* Images */}
          <div>
            <label className="text-sm font-medium mb-2 block">Carousel Images</label>
            <div className="space-y-2">
              {form.images.map((img, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={img}
                    onChange={(e) => setImage(i, e.target.value)}
                    className="input-base flex-1"
                    placeholder={`Image ${i + 1} URL`}
                  />
                  {form.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addImage}
              className="mt-2 text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              <Plus size={13} /> Add image
            </button>
          </div>

          {/* Sort order */}
          <div className="w-32">
            <label className="text-sm font-medium mb-1.5 block">Sort Order</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => field('sort_order', e.target.value)}
              className="input-base w-full"
              min={0}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save size={14} className="mr-1.5" />}
              {initial ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>

        <style>{`
          .input-base {
            background: hsl(var(--muted));
            border: 1px solid hsl(var(--border));
            border-radius: 0.5rem;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            color: hsl(var(--foreground));
            transition: box-shadow 0.15s;
          }
          .input-base::placeholder { color: hsl(var(--muted-foreground)); }
          .input-base:focus { outline: none; box-shadow: 0 0 0 2px hsl(var(--primary) / 0.35); }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

// ── Main admin panel ──────────────────────────────────────────────────────────
const AdminPage = () => {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem(ADMIN_KEY_STORAGE) ?? '');
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(!!adminKey);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchProjects = useCallback(async (key) => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      setProjects(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  // Auto-verify stored key on load
  useEffect(() => {
    if (!adminKey) { setChecking(false); return; }
    fetch('/api/admin/verify', { headers: { 'x-admin-key': adminKey } })
      .then((r) => {
        if (r.ok) { setAuthed(true); fetchProjects(adminKey); }
        else { localStorage.removeItem(ADMIN_KEY_STORAGE); setAdminKey(''); }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = (key) => {
    setAdminKey(key);
    setAuthed(true);
    fetchProjects(key);
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_KEY_STORAGE);
    setAdminKey('');
    setAuthed(false);
    setProjects([]);
  };

  const handleSaved = (saved, isUpdate) => {
    setProjects((prev) =>
      isUpdate ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev],
    );
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        toast.success('Project deleted.');
      } else {
        toast.error('Delete failed.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setDeleting(null);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!authed) return <LoginScreen onLogin={handleLogin} />;

  return (
    <>
      <Helmet><title>Admin — ATL TV Mount PRO</title></Helmet>

      <div className="min-h-screen bg-background">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-card border-b border-border">
          <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft size={14} />
                View Site
              </Link>
              <span className="text-border">|</span>
              <img
                src="https://horizons-cdn.hostinger.com/10e32518-3a0b-422d-a971-66d579a3db35/47c7080c79518d5a6d915f8a78db18d6.png"
                alt="ATL TV Mount PRO"
                className="h-7"
              />
              <span className="text-sm font-semibold">Admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Projects</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {projects.length} project{projects.length !== 1 ? 's' : ''} total
              </p>
            </div>
            <Button
              onClick={() => { setEditing(null); setDialogOpen(true); }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus size={15} className="mr-1.5" />
              New Project
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <p className="mb-4">No projects yet.</p>
              <Button
                onClick={() => { setEditing(null); setDialogOpen(true); }}
                variant="outline"
              >
                Add your first project
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground w-16">Thumb</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Location</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Services</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, i) => (
                    <tr
                      key={project.id}
                      className={`border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-background' : 'bg-card'}`}
                    >
                      <td className="px-4 py-3">
                        {project.thumbnail ? (
                          <img
                            src={project.thumbnail}
                            alt=""
                            className="w-12 h-8 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-12 h-8 bg-muted rounded-md" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">{project.title}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{project.location}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {project.services.slice(0, 2).map((s, si) => (
                            <span key={si} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {s}
                            </span>
                          ))}
                          {project.services.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{project.services.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Link
                            to={`/projects/${project.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                            title="View project"
                          >
                            <Eye size={15} />
                          </Link>
                          <button
                            onClick={() => { setEditing(project); setDialogOpen(true); }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            disabled={deleting === project.id}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
                            title="Delete"
                          >
                            {deleting === project.id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      <ProjectFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initial={editing}
        adminKey={adminKey}
        onSaved={handleSaved}
      />
    </>
  );
};

export default AdminPage;
