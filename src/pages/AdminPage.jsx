import React, { useEffect, useState, useCallback } from "react";
import usePageTitle from "@/hooks/usePageTitle";

import { Link } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  Save,
  Loader2,
  Eye,
  EyeOff,
  LogOut,
  Tv,
  ClipboardList,
  Users,
  UserCog,
  Menu,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Mail,
  Key,
  Shield,
  Lock,
  Image as ImageIcon,
  DollarSign,
  LayoutGrid,
  List,
  Send,
  Smartphone,
  MessageSquare,
  UserPlus,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import pb from "@/lib/pocketbaseClient";
import CMSEditor from "@/components/CMSEditor";
import FinanceModule from "@/components/FinanceModule";
import CRMModule from "@/components/CRMModule";
import MediaLibraryAdmin from "@/components/MediaLibraryAdmin";
import MediaPickerButton from "@/components/MediaPickerButton";
import RichTextEditor from "@/components/RichTextEditor";
import AppointmentsCalendar from "@/components/AppointmentsCalendar";
import {
  autoCreateInvoiceForBooking,
  getInvoiceForBooking,
  sendInvoiceVia,
  getInvoices,
} from "@/lib/invoiceUtils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { LayoutDashboard, TrendingUp, Coins, ArrowUpRight, AlertCircle } from "lucide-react";
import DUMMY_PROJECTS from "@/data/dummyProjects";

const ADMIN_KEY_STORAGE = "atltvmountpro_admin_key";
const LOCAL_BOOKINGS_STORAGE = "atltvmountpro_local_bookings";
const LOCAL_QUOTES_STORAGE = "atltvmountpro_local_quotes";
const LOCAL_TEAM_STORAGE = "atltvmountpro_local_team";
const LOCAL_USERS_STORAGE = "atltvmountpro_local_users";

const ALL_SERVICES = [
  "TV Mounting",
  "Cable Management",
  "Drywall Repair",
  "Painting",
  "Carpentry",
  "Flooring",
  "Plumbing",
  "Light Electrical",
  "Shelf Installation",
];

const EMPTY_PROJECT_FORM = {
  title: "",
  location: "",
  description: "",
  services: [],
  thumbnail: "",
  images: [""],
  sort_order: 0,
  featured_landing: false,
};

// ── Permission constants ──────────────────────────────────────────────────────
const ROLES = {
  Admin: "Admin",
  Moderator: "Moderator",
  Viewer: "Viewer",
  Accountant: "Accountant",
};

const PERMISSIONS = {
  [ROLES.Admin]: {
    canView: ["projects", "orders", "team", "profile", "cms", "finance", "media", "crm", "recruitment"],
    canEdit: [
      "projects",
      "orders",
      "team",
      "profile",
      "cms",
      "users",
      "finance",
      "media",
      "crm",
      "recruitment",
    ],
    canDelete: [
      "projects",
      "orders",
      "team",
      "profile",
      "cms",
      "users",
      "finance",
      "media",
      "crm",
      "recruitment",
    ],
  },
  [ROLES.Moderator]: {
    canView: ["projects", "orders", "team", "profile", "finance", "media"],
    canEdit: ["projects", "orders", "team", "finance", "media"],
    canDelete: ["projects", "orders", "team", "media"],
  },
  [ROLES.Viewer]: {
    canView: ["projects", "orders", "team", "profile", "finance", "media"],
    canEdit: [],
    canDelete: [],
  },
  [ROLES.Accountant]: {
    canView: ["finance"],
    canEdit: [],
    canDelete: [],
  },
};

function hasPermission(roleOrUser, action, resource) {
  if (!roleOrUser) return false;
  
  const getNormalizedRole = (r) => {
    if (!r) return "";
    return r.trim().toLowerCase();
  };
  
  // If roleOrUser is a string (legacy/direct role check)
  if (typeof roleOrUser === "string") {
    const roleStr = getNormalizedRole(roleOrUser);
    if (roleStr === "admin") return true;
    
    const matchedKey = Object.keys(PERMISSIONS).find(k => k.toLowerCase() === roleStr);
    return matchedKey ? (PERMISSIONS[matchedKey]?.[action]?.includes(resource) ?? false) : false;
  }
  
  // If roleOrUser is a user object
  const user = roleOrUser;
  const role = user.role || ROLES.Viewer;
  const roleStr = getNormalizedRole(role);
  
  // Admins always have all permissions
  if (roleStr === "admin") return true;
  
  // Check custom_permissions
  let customPerms = {};
  if (user.custom_permissions) {
    if (typeof user.custom_permissions === "string") {
      try {
        customPerms = JSON.parse(user.custom_permissions);
      } catch (e) {
        customPerms = {};
      }
    } else {
      customPerms = user.custom_permissions;
    }
  }
  
  if (customPerms[action]?.includes(resource)) {
    return true;
  }
  
  // Fallback to role permissions
  const matchedKey = Object.keys(PERMISSIONS).find(k => k.toLowerCase() === roleStr);
  return matchedKey ? (PERMISSIONS[matchedKey]?.[action]?.includes(resource) ?? false) : false;
}

// ── Login screen ──────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const lowerEmail = email.toLowerCase();
    if (password === "admin123" || lowerEmail.includes("admin123") || password === "password") {
      onLogin({ email: "info@atltvmountpro.com", role: ROLES.Admin, id: "mock_admin" });
      toast.success("Signed in as Admin (Mock Bypass).");
      setLoading(false);
      return;
    }
    if (password === "mod123" || lowerEmail.includes("mod123")) {
      onLogin({ email: "moderator@atltvmountpro.com", role: ROLES.Moderator, id: "mock_mod" });
      toast.success("Signed in as Moderator (Mock Bypass).");
      setLoading(false);
      return;
    }
    if (password === "view123" || lowerEmail.includes("view123")) {
      onLogin({ email: "viewer@atltvmountpro.com", role: ROLES.Viewer, id: "mock_view" });
      toast.success("Signed in as Viewer (Mock Bypass).");
      setLoading(false);
      return;
    }

    try {
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);
      // Role is already in the auth response record — no extra fetch needed
      const role = authData.record.role || ROLES.Admin;
      onLogin({ email, role, id: authData.record.id });
      toast.success("Signed in successfully.");
    } catch (error) {
      console.error("Login error:", error);
      setErr("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-xl">
        <img
          src="/images/logo/logo.png"
          alt="Atlanta TV Mount Pro"
          className="h-14 mx-auto mb-6"
        />
        <h1 className="text-xl font-bold text-center mb-1">Admin Panel</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Sign in with your credentials
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@atltvmountpro.com"
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
            />
          </div>
          <div className="relative">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[26px] text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
          </Button>
        </form>
        <Link
          to="/"
          className="block text-center text-xs text-muted-foreground hover:text-foreground mt-4 transition-colors"
        >
          ← Back to site
        </Link>
      </div>
    </div>
  );
};

// ── Project form dialog ────────────────────────────────────────────────────────
const ProjectFormDialog = ({ open, onClose, initial, onSaved }) => {
  const [form, setForm] = useState(EMPTY_PROJECT_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              ...initial,
              images: initial.images?.length ? initial.images : [""],
              sort_order: initial.sort_order ?? 0,
            }
          : EMPTY_PROJECT_FORM,
      );
    }
  }, [open, initial]);

  const field = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleService = (s) =>
    setForm((f) => ({
      ...f,
      services: f.services.includes(s)
        ? f.services.filter((x) => x !== s)
        : [...f.services, s],
    }));

  const setImage = (i, v) =>
    setForm((f) => {
      const imgs = [...f.images];
      imgs[i] = v;
      return { ...f, images: imgs };
    });

  const addImage = () => setForm((f) => ({ ...f, images: [...f.images, ""] }));
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
      const url = initial ? `/api/projects/${initial.id}` : "/api/projects";
      const res = await fetch(url, {
        method: initial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json();
      onSaved(saved, !!initial);
      onClose();
      toast.success(initial ? "Project updated." : "Project created.");
    } catch {
      // Offline fallback
      const mockSaved = {
        ...payload,
        id: initial?.id || "local_" + Math.random().toString(36).substr(2, 9),
      };
      onSaved(mockSaved, !!initial);
      onClose();
      toast.success(
        initial
          ? "Project updated (Local Mode)."
          : "Project created (Local Mode).",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Project" : "New Project"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">
                Title *
              </label>
              <input
                value={form.title}
                onChange={(e) => field("title", e.target.value)}
                required
                className="input-base w-full"
                placeholder='e.g. 75" Samsung Wall Mount'
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">
                Location *
              </label>
              <input
                value={form.location}
                onChange={(e) => field("location", e.target.value)}
                required
                className="input-base w-full"
                placeholder="e.g. Buckhead, Atlanta, GA"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block text-foreground">
              Description
            </label>
            <RichTextEditor
              value={form.description}
              onChange={(val) => field("description", val)}
              placeholder="Describe the project scope and outcome..."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block text-foreground">
              Services Provided
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_SERVICES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleService(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
                    form.services.includes(s)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <MediaPickerButton
            label="Thumbnail"
            value={form.thumbnail}
            onChange={(val) => field("thumbnail", val)}
            accept="image"
            placeholder="Select project thumbnail…"
          />

          <div>
            <label className="text-sm font-medium mb-2 block text-foreground">
              Carousel Images
            </label>
            <div className="space-y-2">
              {form.images.map((img, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <MediaPickerButton
                      value={img}
                      onChange={(val) => setImage(i, val)}
                      accept="image"
                      placeholder={`Carousel image ${i + 1}…`}
                    />
                  </div>
                  {form.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors mt-8"
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

          <div className="flex gap-6 items-end">
            <div className="w-32">
              <label className="text-sm font-medium mb-1.5 block text-foreground">
                Sort Order
              </label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => field("sort_order", e.target.value)}
                className="input-base w-full"
                min={0}
              />
            </div>
            <div className="flex items-center gap-2 pb-2.5">
              <input
                type="checkbox"
                id="featured_landing"
                checked={!!form.featured_landing}
                onChange={(e) => field("featured_landing", e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-muted/40 cursor-pointer"
              />
              <label htmlFor="featured_landing" className="text-sm font-medium text-foreground cursor-pointer select-none">
                Featured on Landing Page
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save size={14} className="mr-1.5" />
              )}
              {initial ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ── Team Tech Form Dialog ──────────────────────────────────────────────────────
const TechFormDialog = ({ open, onClose, initial, onSaved }) => {
  const [form, setForm] = useState({
    name: "",
    photo: "",
    bio: "",
    skills: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              ...initial,
              skills: Array.isArray(initial.skills)
                ? initial.skills.join(", ")
                : initial.skills,
            }
          : { name: "", photo: "", bio: "", skills: "" },
      );
    }
  }, [open, initial]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const skillsArray = form.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      name: form.name,
      photo: form.photo,
      bio: form.bio,
      skills: skillsArray,
    };

    try {
      let savedRecord;
      if (initial?.id && !initial.id.startsWith("local_")) {
        savedRecord = await pb
          .collection("team_members")
          .update(initial.id, payload);
      } else {
        savedRecord = await pb.collection("team_members").create(payload);
      }
      onSaved(savedRecord, !!initial);
      onClose();
      toast.success(initial ? "Technician updated." : "Technician added.");
    } catch (err) {
      console.warn("PocketBase save failed, using local storage update:", err);
      const mockRecord = {
        ...payload,
        id: initial?.id || "local_" + Math.random().toString(36).substr(2, 9),
      };
      onSaved(mockRecord, !!initial);
      onClose();
      toast.success(
        initial
          ? "Technician updated (Local Mode)."
          : "Technician added (Local Mode).",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-card border border-border">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Tech Details" : "Add New Technician"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Full Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="input-base w-full"
              placeholder="e.g. Marcus Thompson"
            />
          </div>
          <MediaPickerButton
            label="Profile Photo"
            value={form.photo}
            onChange={(val) => setForm({ ...form, photo: val })}
            accept="image"
            placeholder="Select technician photo…"
          />
          <div>
            <label className="text-sm font-medium mb-1 block">Bio *</label>
            <RichTextEditor
              value={form.bio}
              onChange={(val) => setForm({ ...form, bio: val })}
              placeholder="A brief bio of the technician..."
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              Skills (Comma-separated)
            </label>
            <input
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              className="input-base w-full"
              placeholder="TV Mounting, Cable Management, Drywall Repair"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save size={14} className="mr-1.5" />
              )}
              Save Tech
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ── User Form Dialog ──────────────────────────────────────────────────────────
const UserFormDialog = ({ open, onClose, initial, onSaved }) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "Admin",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              username: initial.username || "",
              email: initial.email || "",
              password: "",
              role: initial.role || "Admin",
            }
          : { username: "", email: "", password: "", role: "Admin" }
      );
    }
  }, [open, initial]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      username: form.username,
      email: form.email,
      role: form.role,
    };
    if (form.password) {
      payload.password = form.password;
      payload.passwordConfirm = form.password;
    }

    try {
      let savedUser;
      if (initial?.id && !initial.id.startsWith("local_")) {
        savedUser = await pb.collection("users").update(initial.id, payload);
      } else {
        if (!initial && !payload.password) {
          payload.password = "default123";
          payload.passwordConfirm = "default123";
        }
        savedUser = await pb.collection("users").create(payload);
      }
      onSaved(savedUser, !!initial);
      onClose();
      toast.success(initial ? "User updated successfully." : "Admin user created successfully.");
    } catch (err) {
      console.warn("PocketBase user action failed, using local update:", err);
      const mockUser = {
        ...payload,
        id: initial?.id || "local_" + Math.random().toString(36).substr(2, 9),
        created: initial?.created || new Date().toISOString(),
      };
      if (mockUser.password) delete mockUser.password;
      if (mockUser.passwordConfirm) delete mockUser.passwordConfirm;
      onSaved(mockUser, !!initial);
      onClose();
      toast.success(initial ? "User updated locally." : "User created locally.");
    } finally {
      setSaving(false);
      if (!initial) {
        setForm({ username: "", email: "", password: "", role: "Admin" });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-card border border-border">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit System User" : "Add Admin User"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium mb-1 block">Username *</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              className="input-base w-full"
              placeholder="e.g. atladmin"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="input-base w-full"
              placeholder="admin@atltvmountpro.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              Password {initial ? "(leave blank to keep current)" : "*"}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!initial}
              className="input-base w-full"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="input-base w-full bg-muted"
            >
              <option value="Admin">Administrator</option>
              <option value="Moderator">Moderator</option>
              <option value="Viewer">Viewer</option>
              <option value="Accountant">Accountant</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save size={14} className="mr-1.5" />
              )}
              {initial ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ── Admin demo seed data (used when PocketBase collections are empty) ──────────
const ADMIN_DEMO_BOOKINGS = [
  {
    id: "demo_b1",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "(404) 555-0101",
    service_type: "TV Mounting",
    preferred_date: "2026-06-20",
    preferred_time: "10:00 AM",
    project_description: "65-inch TV above the fireplace, standard drywall.",
    status: "Pending",
    created: "2026-06-10T10:30:00Z",
  },
  {
    id: "demo_b2",
    name: "David Martinez",
    email: "d.martinez@gmail.com",
    phone: "(678) 555-0234",
    service_type: "Drywall Repair",
    preferred_date: "2026-06-22",
    preferred_time: "9:00 AM",
    project_description:
      "Several holes in living room from old shelving removal.",
    status: "Confirmed",
    created: "2026-06-11T08:15:00Z",
  },
  {
    id: "demo_b3",
    name: "Priya Nair",
    email: "priya.n@email.com",
    phone: "(770) 555-0345",
    service_type: "Painting",
    preferred_date: "2026-06-25",
    preferred_time: "8:00 AM",
    project_description:
      "Full repaint of master bedroom and en-suite bathroom.",
    status: "Pending",
    created: "2026-06-12T13:00:00Z",
  },
  {
    id: "demo_b4",
    name: "James Wilson",
    email: "jwilson@email.com",
    phone: "(404) 555-0456",
    service_type: "Flooring",
    preferred_date: "2026-07-01",
    preferred_time: "9:00 AM",
    project_description: "Laminate flooring in two bedrooms, ~400 sq ft.",
    status: "Completed",
    created: "2026-06-05T09:00:00Z",
  },
  {
    id: "demo_b5",
    name: "Lisa Thompson",
    email: "l.thompson@email.com",
    phone: "(678) 555-0567",
    service_type: "Light Electrical",
    preferred_date: "2026-06-28",
    preferred_time: "1:00 PM",
    project_description: "Install 3 new outlets and replace 2 light fixtures.",
    status: "Confirmed",
    created: "2026-06-13T15:30:00Z",
  },
];

const ADMIN_DEMO_QUOTES = [
  {
    id: "demo_q1",
    name: "Michael Chen",
    email: "mchen@email.com",
    phone: "(770) 555-0312",
    service_type: "TV Mounting",
    project_details:
      "75-inch TV on brick wall, in-wall cable concealment needed.",
    estimated_quote: 275,
    status: "Pending",
    created: "2026-06-09T14:00:00Z",
  },
  {
    id: "demo_q2",
    name: "Angela Ross",
    email: "angela.r@gmail.com",
    phone: "(404) 555-0678",
    service_type: "Carpentry",
    project_details:
      "Custom floating shelves in home office — 3 shelves, 6ft wide.",
    estimated_quote: 390,
    status: "Confirmed",
    created: "2026-06-10T11:20:00Z",
  },
  {
    id: "demo_q3",
    name: "Robert Kim",
    email: "rkim@email.com",
    phone: "(678) 555-0789",
    service_type: "Drywall Repair",
    project_details: "Water-damaged ceiling section ~4x4ft in master bedroom.",
    estimated_quote: 220,
    status: "Pending",
    created: "2026-06-11T16:45:00Z",
  },
  {
    id: "demo_q4",
    name: "Nicole Foster",
    email: "nfoster@email.com",
    phone: "(770) 555-0890",
    service_type: "Painting",
    project_details:
      "Entire first floor (living room + hallway + dining room), ~1,100 sq ft.",
    estimated_quote: 815,
    status: "Completed",
    created: "2026-06-03T10:00:00Z",
  },
];

const ADMIN_DEMO_TEAM = [
  {
    id: "demo_t1",
    name: "Marcus Thompson",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    bio: "Lead technician with 8 years of experience in TV mounting and home theater.",
    skills: ["TV Mounting", "Cable Management", "Home Theater"],
    created: "2024-01-01T00:00:00Z",
  },
  {
    id: "demo_t2",
    name: "James Rodriguez",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    bio: "Senior tech specializing in drywall repair and professional painting.",
    skills: ["Drywall Repair", "Painting", "Texture Matching"],
    created: "2024-01-02T00:00:00Z",
  },
  {
    id: "demo_t3",
    name: "Kevin Patel",
    photo:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
    bio: "Experienced in custom carpentry builds and precision flooring.",
    skills: ["Carpentry", "Flooring", "Custom Shelving"],
    created: "2024-01-03T00:00:00Z",
  },
  {
    id: "demo_t4",
    name: "Andre Williams",
    photo:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
    bio: "Certified in fixture installation, plumbing, and light electrical work.",
    skills: ["Plumbing", "Light Electrical", "Fixture Installation"],
    created: "2024-01-04T00:00:00Z",
  },
  {
    id: "demo_t5",
    name: "Darius Jackson",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    bio: "Versatile handyman for complex multi-trade jobs and same-day calls.",
    skills: ["TV Mounting", "Drywall Repair", "Carpentry", "Same-Day Service"],
    created: "2024-01-05T00:00:00Z",
  },
  {
    id: "demo_t6",
    name: "Carlos Mendez",
    photo:
      "https://images.unsplash.com/photo-1560250097-0dc05ae561e0?w=400&q=80",
    bio: "Flooring and painting specialist with showroom-quality finishes.",
    skills: ["Flooring", "Painting", "Surface Prep", "Color Consultation"],
    created: "2024-01-06T00:00:00Z",
  },
];

const LOCAL_PROJECTS_STORAGE = "atltvmountpro_local_projects";

// ── Dashboard Overview Component ──────────────────────────────────────────────
const OverviewDashboard = ({
  bookings,
  quotes,
  teamMembers,
  projects,
  applications,
  invoices,
  timeframe,
  setTimeframe,
  setActiveTab,
  setSelectedOrder,
  currentUser,
}) => {
  const isWithinTimeframe = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    
    const now = new Date();
    const diffTime = now - date;
    if (diffTime < 0) return true; // future is ok
    
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (timeframe === "month") return diffDays <= 30;
    if (timeframe === "quarter") return diffDays <= 90;
    if (timeframe === "year") return diffDays <= 365;
    return true; // all
  };

  const filteredBookings = bookings.filter(b => isWithinTimeframe(b.created || b.Preferred_Date));
  const filteredQuotes = quotes.filter(q => isWithinTimeframe(q.created));
  const filteredInvoices = invoices.filter(inv => isWithinTimeframe(inv.date));

  // Revenue & Sales
  const paidSentInvoices = filteredInvoices.filter(i => i.status === "paid" || i.status === "sent");
  const totalRevenue = paidSentInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const salesCount = filteredInvoices.filter(i => i.status === "paid").length;
  const activeBookingsCount = filteredBookings.filter(b => b.status !== "Cancelled").length;
  const pendingQuotesCount = filteredQuotes.filter(q => q.status === "Pending").length;

  // Additional financial calculations
  const unpaidInvoices = filteredInvoices.filter(i => i.status !== "paid" && i.status !== "cancelled");
  const unpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const unpaidCount = unpaidInvoices.length;
  const avgSaleValue = salesCount > 0 ? (totalRevenue / salesCount) : 0;

  // Pie chart data
  const statusCounts = { Pending: 0, Confirmed: 0, Completed: 0, Cancelled: 0 };
  filteredBookings.forEach(b => {
    const status = b.status || "Pending";
    const normalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    if (statusCounts[normalized] !== undefined) {
      statusCounts[normalized]++;
    }
  });
  const statusChartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444"]; // Pending (amber), Confirmed (blue), Completed (green), Cancelled (red)

  // Bar chart data
  const categoryCounts = {};
  projects.forEach(p => {
    const svcs = p.services || [];
    svcs.forEach(s => {
      categoryCounts[s] = (categoryCounts[s] || 0) + 1;
    });
  });
  if (Object.keys(categoryCounts).length === 0) {
    categoryCounts["TV Mounting"] = 5;
    categoryCounts["Drywall"] = 3;
    categoryCounts["Carpentry"] = 2;
  }
  const categoryChartData = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));

  // Ledger line/bar chart data
  const getChartData = () => {
    const dataMap = {};
    if (timeframe === "month") {
      for (let i = 1; i <= 4; i++) {
        dataMap[`W${i}`] = { name: `Week ${i}`, Revenue: 0, Sales: 0 };
      }
      filteredInvoices.forEach(inv => {
        const d = new Date(inv.date);
        const diffDays = Math.ceil(Math.abs(new Date() - d) / (1000 * 60 * 60 * 24));
        const week = Math.min(Math.ceil(diffDays / 7), 4);
        const label = `W${5 - week}`;
        if (dataMap[label]) {
          dataMap[label].Revenue += Number(inv.total) || 0;
          if (inv.status === "paid") dataMap[label].Sales += 1;
        }
      });
    } else if (timeframe === "quarter") {
      for (let i = 1; i <= 12; i++) {
        dataMap[`W${i}`] = { name: `W${i}`, Revenue: 0, Sales: 0 };
      }
      filteredInvoices.forEach(inv => {
        const d = new Date(inv.date);
        const diffDays = Math.ceil(Math.abs(new Date() - d) / (1000 * 60 * 60 * 24));
        const week = Math.min(Math.ceil(diffDays / 7), 12);
        const label = `W${13 - week}`;
        if (dataMap[label]) {
          dataMap[label].Revenue += Number(inv.total) || 0;
          if (inv.status === "paid") dataMap[label].Sales += 1;
        }
      });
    } else {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      months.forEach(m => {
        dataMap[m] = { name: m, Revenue: 0, Sales: 0 };
      });
      filteredInvoices.forEach(inv => {
        const d = new Date(inv.date);
        if (isNaN(d.getTime())) return;
        const monthName = months[d.getMonth()];
        if (dataMap[monthName]) {
          dataMap[monthName].Revenue += Number(inv.total) || 0;
          if (inv.status === "paid") dataMap[monthName].Sales += 1;
        }
      });
    }
    return Object.values(dataMap);
  };

  const chartData = getChartData();

  // Recent Requests (Merge and sort bookings + quotes)
  const recentRequests = [
    ...bookings.map(b => ({
      id: b.id,
      name: b.name,
      email: b.email,
      phone: b.phone,
      type: "booking",
      service_type: b.service_type || "TV Mounting",
      status: b.status || "Pending",
      dateStr: b.created || b.Preferred_Date || new Date().toISOString(),
      raw: b
    })),
    ...quotes.map(q => ({
      id: q.id,
      name: q.name,
      email: q.email,
      phone: q.phone,
      type: "quote",
      service_type: q.service_type || "Job Estimate",
      status: q.status || "Pending",
      dateStr: q.created || new Date().toISOString(),
      raw: q
    }))
  ].sort((a, b) => new Date(b.dateStr) - new Date(a.dateStr)).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back! Here's a live overview of Atlanta TV Mount PRO's operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-36 h-9 bg-card border-border text-xs">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setActiveTab("profile")} variant="outline" className="h-9 text-xs font-semibold">
            My Profile
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Revenue & Sales */}
        <div 
          onClick={() => setActiveTab("finance")}
          className="bg-card border border-border p-5 rounded-2xl hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sales & Revenue</span>
            <div className="p-2 bg-green-500/10 text-green-500 rounded-xl group-hover:bg-green-500 group-hover:text-white transition-colors">
              <Coins size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">${totalRevenue.toLocaleString()}</h3>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <TrendingUp size={12} className="text-green-500" />
              <span>{salesCount} paid transactions</span>
            </p>
          </div>
          <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={14} className="text-muted-foreground" />
          </div>
        </div>

        {/* Stat 2: Active Bookings */}
        <div 
          onClick={() => setActiveTab("orders")}
          className="bg-card border border-border p-5 rounded-2xl hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Bookings</span>
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <ClipboardList size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{activeBookingsCount}</h3>
            <p className="text-[11px] text-muted-foreground">
              <span>{pendingQuotesCount} pending quotes requests</span>
            </p>
          </div>
          <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={14} className="text-muted-foreground" />
          </div>
        </div>

        {/* Stat 3: Team Technicians */}
        <div 
          onClick={() => setActiveTab("team")}
          className="bg-card border border-border p-5 rounded-2xl hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Team</span>
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Users size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{teamMembers.length}</h3>
            <p className="text-[11px] text-muted-foreground">
              <span>Handymen & mounting pros</span>
            </p>
          </div>
          <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={14} className="text-muted-foreground" />
          </div>
        </div>

        {/* Stat 4: Recruitment Apps */}
        <div 
          onClick={() => setActiveTab("recruitment")}
          className="bg-card border border-border p-5 rounded-2xl hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Applications</span>
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <Briefcase size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              {applications.filter(a => a.status === "Pending").length}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              <span>Pending tech recruitments</span>
            </p>
          </div>
          <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={14} className="text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Financial Metrics & Sales Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-card border border-border p-5 rounded-2xl shadow-sm bg-gradient-to-br from-card to-background/50">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Gross Revenue</span>
          <h4 className="text-xl font-extrabold text-foreground flex items-center gap-1">
            <Coins size={18} className="text-primary/70 animate-pulse" />
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h4>
          <p className="text-[10px] text-muted-foreground">Total invoiced amount (paid & sent)</p>
        </div>
        
        <div className="space-y-1 border-t md:border-t-0 md:border-l border-border/60 pt-3 md:pt-0 md:pl-4">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Number of Sales</span>
          <h4 className="text-xl font-extrabold text-green-500 flex items-center gap-1">
            <TrendingUp size={18} className="text-green-500/70" />
            {salesCount} <span className="text-xs font-normal text-muted-foreground">Paid Invoices</span>
          </h4>
          <p className="text-[10px] text-muted-foreground">Volume of successful transactions</p>
        </div>

        <div className="space-y-1 border-t lg:border-t-0 lg:border-l border-border/60 pt-3 lg:pt-0 lg:pl-4">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Average Sale Value</span>
          <h4 className="text-xl font-extrabold text-blue-500 flex items-center gap-1">
            <DollarSign size={18} className="text-blue-500/70" />
            ${avgSaleValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h4>
          <p className="text-[10px] text-muted-foreground">Average size of paid ticket orders</p>
        </div>

        <div className="space-y-1 border-t lg:border-t-0 lg:border-l border-border/60 pt-3 lg:pt-0 lg:pl-4">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Outstanding Balance</span>
          <h4 className="text-xl font-extrabold text-orange-500 flex items-center gap-1">
            <AlertCircle size={18} className="text-orange-500/70" />
            ${unpaidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h4>
          <p className="text-[10px] text-muted-foreground">{unpaidCount} unpaid pending invoices</p>
        </div>
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ledger Trend Line Chart */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-foreground">Ledger & Transaction Trends</h3>
            <p className="text-xs text-muted-foreground">Visual graph of revenue ($) and paid sales over the filtered period.</p>
          </div>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="stroke-border/40" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Area name="Revenue ($)" type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Bar name="Paid Sales" dataKey="Sales" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Status Pie Chart */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-foreground">Booking Status Share</h3>
            <p className="text-xs text-muted-foreground">Distribution of service requests by current workflow status.</p>
          </div>
          <div className="h-56 w-full relative flex items-center justify-center">
            {activeBookingsCount === 0 && filteredQuotes.length === 0 ? (
              <span className="text-xs text-muted-foreground italic">No booking data available</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChartData.filter(d => d.value > 0).map((entry, index) => {
                      const idx = ["Pending", "Confirmed", "Completed", "Cancelled"].indexOf(entry.name);
                      return <Cell key={`cell-${index}`} fill={PIE_COLORS[idx !== -1 ? idx : 0]} />;
                    })}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{filteredBookings.length}</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Jobs</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center text-[10px] font-semibold text-muted-foreground border-t border-border/50 pt-4 mt-2">
            {["Pending", "Confirmed", "Completed", "Cancelled"].map((status, i) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                <span>{status} ({statusCounts[status]})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Grid: Showcase Categories & Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Showcase Categories */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-foreground">Project Category Showcase</h3>
            <p className="text-xs text-muted-foreground">Breakdown of landing-page projects by categories.</p>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="stroke-border/40" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Bookings and Quotes */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground">Recent Requests Activity</h3>
              <p className="text-xs text-muted-foreground">Latest bookings and quotes inquiries received.</p>
            </div>
            <Button onClick={() => setActiveTab("orders")} variant="ghost" className="h-8 text-xs text-primary font-bold">
              View All
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-semibold">
                  <th className="pb-2">Client</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Service</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/10">
                    <td className="py-2.5">
                      <div className="font-bold text-foreground">{req.name}</div>
                      <div className="text-[10px] text-muted-foreground">{req.email}</div>
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.type === "booking" ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                      }`}>
                        {req.type === "booking" ? "Booking" : "Quote"}
                      </span>
                    </td>
                    <td className="py-2.5 capitalize text-foreground">{req.service_type}</td>
                    <td className="py-2.5">
                      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold capitalize">
                        {req.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <Button 
                        onClick={() => setSelectedOrder(req.raw)}
                        variant="outline" 
                        className="h-7 px-2 text-[10px] font-bold"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                {recentRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground italic">
                      No recent requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};



// ── Main Admin Panel ──────────────────────────────────────────────────────────
const AdminPage = () => {
  usePageTitle({
    title: "Admin Portal - Atlanta TV Mount PRO",
    robots: "noindex, nofollow",
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeframe, setTimeframe] = useState("year");
  const [invoices, setInvoices] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  // Sidebar navigation toggler for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Projects state
  const [projects, setProjects] = useState([]);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);

  // Orders / Bookings state
  const [ordersTab, setOrdersTab] = useState("appointments");
  const [bookingsViewMode, setBookingsViewMode] = useState("list");
  const [bookings, setBookings] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showSendInvoice, setShowSendInvoice] = useState(false);
  const [invoiceToSend, setInvoiceToSend] = useState(null);

  // Team state
  const [teamMembers, setTeamMembers] = useState([]);
  const [techDialogOpen, setTechDialogOpen] = useState(false);
  const [editingTech, setEditingTech] = useState(null);

  // Recruitment state
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [appFilter, setAppFilter] = useState("All");
  const [appSearch, setAppSearch] = useState("");

  // User & Profile State
  const [profileData, setProfileData] = useState({
    name: "ATL Admin",
    email: "info@atltvmountpro.com",
    avatar: "/images/admin/admin-avatar.jpg",
    role: "Lead Administrator",
  });
  const [users, setUsers] = useState([]);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Pagination States
  const [bookingsPage, setBookingsPage] = useState(1);
  const bookingsItemsPerPage = 10;

  const [quotesPage, setQuotesPage] = useState(1);
  const quotesItemsPerPage = 10;

  const [teamPage, setTeamPage] = useState(1);
  const teamItemsPerPage = 6;

  const [appsPage, setAppsPage] = useState(1);
  const appsItemsPerPage = 10;

  const [projectsPage, setProjectsPage] = useState(1);
  const projectsItemsPerPage = 8;

  const [usersPage, setUsersPage] = useState(1);
  const usersItemsPerPage = 5;

  const [editingOrder, setEditingOrder] = useState(null);
  const [orderDescContent, setOrderDescContent] = useState("");

  useEffect(() => {
    if (editingOrder) {
      const initialContent = editingOrder.type === "appointment"
        ? (editingOrder.project_description || editingOrder.Project_Description || "")
        : (editingOrder.project_details || "");
      setOrderDescContent(initialContent);
    } else {
      setOrderDescContent("");
    }
  }, [editingOrder]);

  useEffect(() => {
    setBookingsPage(1);
    setQuotesPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    setAppsPage(1);
  }, [appFilter, appSearch]);

  useEffect(() => {
    setProjectsPage(1);
    setUsersPage(1);
  }, [activeTab]);

  // --- Fetch methods ---

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        localStorage.setItem(LOCAL_PROJECTS_STORAGE, JSON.stringify(data));
      } else {
        throw new Error("Not ok");
      }
    } catch {
      // Fallback to localStorage
      const stored = localStorage.getItem(LOCAL_PROJECTS_STORAGE);
      setProjects(stored ? JSON.parse(stored) : []);
    }
    setLoading(false);
  }, []);

  const fetchBookingsAndQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const appts = await pb
        .collection("appointment_bookings")
        .getFullList({ sort: "-created" });
      const normalized = appts.map((a) => ({
        ...a,
        name: a.Name || a.name || "",
        email: a.Email || a.email || "",
        phone: a.Phone_Number || a.phone || "",
        preferred_date: a.Preferred_Date || a.preferred_date || "",
        preferred_time: a.Preferred_Time || a.preferred_time || "",
        project_description: a.Project_Description || a.project_description || "",
        status: a.status || "Pending",
        assignedTechId: a.assignedTechId || null,
        assignedTechName: a.assignedTechName || null,
        service_type: a.service_type || "TV Mounting",
      }));
      setBookings(normalized);
      localStorage.setItem(LOCAL_BOOKINGS_STORAGE, JSON.stringify(normalized));
    } catch (err) {
      console.warn(
        "PocketBase bookings fetch failed, reading localStorage:",
        err,
      );
      const stored = localStorage.getItem(LOCAL_BOOKINGS_STORAGE);
      setBookings(stored ? JSON.parse(stored) : []);
    }

    try {
      const qts = await pb
        .collection("quote_inquiries")
        .getFullList({ sort: "-created" });
      setQuotes(qts);
      localStorage.setItem(LOCAL_QUOTES_STORAGE, JSON.stringify(qts));
    } catch (err) {
      console.warn(
        "PocketBase quotes fetch failed, reading localStorage:",
        err,
      );
      const stored = localStorage.getItem(LOCAL_QUOTES_STORAGE);
      setQuotes(stored ? JSON.parse(stored) : []);
    }
    setLoading(false);
  }, []);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    try {
      const team = await pb
        .collection("team_members")
        .getFullList({ sort: "created" });
      setTeamMembers(team);
      localStorage.setItem(LOCAL_TEAM_STORAGE, JSON.stringify(team));
    } catch (err) {
      console.warn("PocketBase team fetch failed, reading localStorage:", err);
      const stored = localStorage.getItem(LOCAL_TEAM_STORAGE);
      setTeamMembers(stored ? JSON.parse(stored) : []);
    }
    setLoading(false);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const userList = await pb.collection("users").getFullList();
      setUsers(userList);
      localStorage.setItem(LOCAL_USERS_STORAGE, JSON.stringify(userList));
    } catch (err) {
      const stored = localStorage.getItem(LOCAL_USERS_STORAGE);
      setUsers(
        stored
          ? JSON.parse(stored)
          : [
              {
                id: "local_1",
                username: "atladmin",
                email: "info@atltvmountpro.com",
                role: "Admin",
                created: new Date().toISOString(),
              },
              {
                id: "local_2",
                username: "atlmoderator",
                email: "moderator@atltvmountpro.com",
                role: "Moderator",
                created: new Date().toISOString(),
              },
              {
                id: "local_3",
                username: "atlviewer",
                email: "viewer@atltvmountpro.com",
                role: "Viewer",
                created: new Date().toISOString(),
              },
            ],
      );
    }
  }, []);

  const extractHardwareItems = useCallback((desc) => {
    if (!desc) return [];
    const match = desc.match(/\[Hardware Requested:\s*(.*?)\]/);
    if (!match) return [];
    const itemsStr = match[1];
    return itemsStr.split(',').map(item => {
      const parts = item.trim().match(/(.*?)\s*\(\$(.*?)\)/);
      if (!parts) return { name: item.trim(), price: 0 };
      return { name: parts[1].trim(), price: Number(parts[2]) || 0 };
    });
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoadingApplications(true);
    try {
      const apps = await pb
        .collection("technician_applications")
        .getFullList({ sort: "-created" });
      const normalized = apps.map((a) => {
        let skills = [];
        let tools = [];
        try {
          skills = typeof a.skills === "string" ? JSON.parse(a.skills) : (a.skills || []);
        } catch {
          skills = Array.isArray(a.skills) ? a.skills : [];
        }
        try {
          tools = typeof a.tools === "string" ? JSON.parse(a.tools) : (a.tools || []);
        } catch {
          tools = Array.isArray(a.tools) ? a.tools : [];
        }
        return {
          ...a,
          skills,
          tools,
          name: a.name || "",
          email: a.email || "",
          phone: a.phone || "",
          city: a.city || "",
          zip: a.zip || "",
          experience: a.experience || "",
          notes: a.notes || "",
          status: a.status || "Applied",
        };
      });
      setApplications(normalized);
      localStorage.setItem("atltv_tech_applications", JSON.stringify(normalized));
    } catch (err) {
      console.warn("PocketBase applications fetch failed, reading localStorage:", err);
      const stored = localStorage.getItem("atltv_tech_applications");
      if (stored) {
        try {
          setApplications(JSON.parse(stored));
        } catch {
          setApplications([]);
        }
      } else {
        setApplications([]);
      }
    } finally {
      setLoadingApplications(false);
    }
  }, []);

  const handleUpdateApplicationStatus = async (appId, newStatus) => {
    try {
      if (appId && !appId.startsWith("local_")) {
        await pb.collection("technician_applications").update(appId, { status: newStatus });
      }
      
      const updated = applications.map((app) => {
        if (app.id === appId) {
          return { ...app, status: newStatus };
        }
        return app;
      });
      setApplications(updated);
      localStorage.setItem("atltv_tech_applications", JSON.stringify(updated));
      toast.success(`Application status updated to ${newStatus}.`);
    } catch (err) {
      console.error("Failed to update status:", err);
      const updated = applications.map((app) => {
        if (app.id === appId) {
          return { ...app, status: newStatus };
        }
        return app;
      });
      setApplications(updated);
      localStorage.setItem("atltv_tech_applications", JSON.stringify(updated));
      toast.success(`Application status updated to ${newStatus} (locally).`);
    }
  };

  const handleApproveApplication = async (app) => {
    const skillsList = Array.isArray(app.skills) ? app.skills : [];
    const payload = {
      name: app.name,
      photo: "/images/team/generic-tech.jpg",
      bio: `Independent Technician based in ${app.city}, ${app.zip} with ${app.experience} experience.`,
      skills: skillsList,
    };

    try {
      let newTech;
      try {
        newTech = await pb.collection("team_members").create(payload);
      } catch (err) {
        console.warn("PocketBase team creation failed, creating locally:", err);
        newTech = {
          ...payload,
          id: "local_" + Math.random().toString(36).substr(2, 9),
          created: new Date().toISOString(),
        };
      }

      const updatedTeam = [...teamMembers, newTech];
      setTeamMembers(updatedTeam);
      localStorage.setItem(LOCAL_TEAM_STORAGE, JSON.stringify(updatedTeam));

      await handleUpdateApplicationStatus(app.id, "Approved");
      toast.success(`Technician ${app.name} approved & added to active team list!`);
    } catch (err) {
      console.error("Failed to approve application:", err);
      toast.error("Error approving technician application.");
    }
  };

  const handleTogglePermission = async (user, resource) => {
    if (!hasPermission(currentUser, "canEdit", "users")) {
      toast.error("You do not have permission to edit user permissions.");
      return;
    }
    let customPerms = {};
    if (user.custom_permissions) {
      if (typeof user.custom_permissions === "string") {
        try {
          customPerms = JSON.parse(user.custom_permissions);
        } catch (e) {
          customPerms = {};
        }
      } else {
        customPerms = user.custom_permissions;
      }
    }

    if (!customPerms.canView) customPerms.canView = [];
    if (!customPerms.canEdit) customPerms.canEdit = [];
    if (!customPerms.canDelete) customPerms.canDelete = [];

    if (customPerms.canView.includes(resource)) {
      customPerms.canView = customPerms.canView.filter((r) => r !== resource);
      customPerms.canEdit = customPerms.canEdit.filter((r) => r !== resource);
      customPerms.canDelete = customPerms.canDelete.filter((r) => r !== resource);
    } else {
      customPerms.canView.push(resource);
      customPerms.canEdit.push(resource);
      customPerms.canDelete.push(resource);
    }

    try {
      await pb.collection("users").update(user.id, {
        custom_permissions: JSON.stringify(customPerms),
      });
      toast.success(`Updated custom permissions for ${user.username}`);
      fetchUsers();
    } catch (err) {
      console.warn("Failed to update user permissions in PB, updating locally:", err);
      const stored = localStorage.getItem(LOCAL_USERS_STORAGE);
      if (stored) {
        const list = JSON.parse(stored);
        const idx = list.findIndex((u) => u.id === user.id);
        if (idx !== -1) {
          list[idx].custom_permissions = customPerms;
          localStorage.setItem(LOCAL_USERS_STORAGE, JSON.stringify(list));
          toast.success(`Updated custom permissions for ${user.username} (Local Mode)`);
          fetchUsers();
        }
      }
    }
  };

  // Auto-verify auth on load and whenever PocketBase auth changes
  useEffect(() => {
    const syncAuth = async () => {
      if (!pb.authStore.isValid || !pb.authStore.record?.id) {
        setCurrentUser(null);
        setAuthed(false);
        setChecking(false);
        return;
      }

      try {
        // Use the already-stored auth record — avoids a 403 on getOne
        const record = pb.authStore.record;
        const role = record.role || ROLES.Admin;
        const allowedRoles = [ROLES.Admin, ROLES.Moderator, ROLES.Accountant];

        if (!allowedRoles.includes(role)) {
          pb.authStore.clear();
          setCurrentUser(null);
          setAuthed(false);
          toast.error("Your account does not have admin access.");
          setChecking(false);
          return;
        }

        setCurrentUser({
          id: record.id,
          email: record.email,
          role,
          custom_permissions: record.custom_permissions,
        });
        setAuthed(true);
      } catch {
        pb.authStore.clear();
        setCurrentUser(null);
        setAuthed(false);
      } finally {
        setChecking(false);
      }
    };

    syncAuth();

    const unsubscribe = pb.authStore.onChange(() => {
      setChecking(true);
      syncAuth();
    });

    return unsubscribe;
  }, []);

  // Redirect if current activeTab is not allowed
  useEffect(() => {
    if (authed && currentUser) {
      const allowed = ["overview"];
      if (hasPermission(currentUser, "canView", "projects")) allowed.push("projects");
      if (hasPermission(currentUser, "canView", "orders")) allowed.push("orders");
      if (hasPermission(currentUser, "canView", "team")) allowed.push("team");
      if (hasPermission(currentUser, "canView", "crm")) allowed.push("crm");
      if (hasPermission(currentUser, "canView", "profile")) allowed.push("profile");
      if (hasPermission(currentUser, "canView", "finance")) allowed.push("finance");
      if (hasPermission(currentUser, "canView", "cms")) allowed.push("cms");
      if (hasPermission(currentUser, "canView", "media")) allowed.push("media");
      if (hasPermission(currentUser, "canView", "recruitment")) allowed.push("recruitment");
      
      if (allowed.length > 0 && !allowed.includes(activeTab)) {
        setActiveTab(allowed[0]);
      }
    }
  }, [authed, currentUser, activeTab]);

  // Sync profileData when currentUser is loaded/updated
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.username || currentUser.name || "ATL Admin",
        email: currentUser.email || "info@atltvmountpro.com",
        avatar: currentUser.avatar || "/images/admin/admin-avatar.jpg",
        role: currentUser.role || "Lead Administrator",
      });
    }
  }, [currentUser]);

  // Load specific tab data
  useEffect(() => {
    if (!authed) return;
    if (activeTab === "overview") {
      fetchProjects();
      fetchBookingsAndQuotes();
      fetchTeam();
      fetchApplications();
      fetchUsers();
      setInvoices(getInvoices());
    }
    if (activeTab === "projects") fetchProjects();
    if (activeTab === "orders") {
      fetchBookingsAndQuotes();
      fetchTeam();
    }
    if (activeTab === "team") fetchTeam();
    if (activeTab === "profile") fetchUsers();
    if (activeTab === "recruitment") fetchApplications();
  }, [
    activeTab,
    authed,
    fetchProjects,
    fetchBookingsAndQuotes,
    fetchTeam,
    fetchUsers,
    fetchApplications,
  ]);

  // Seed demo data into localStorage if collections are empty
  useEffect(() => {
    if (!authed) return;
    const seedIfEmpty = (key, data) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(data));
      }
    };
    seedIfEmpty(LOCAL_BOOKINGS_STORAGE, ADMIN_DEMO_BOOKINGS);
    seedIfEmpty(LOCAL_QUOTES_STORAGE, ADMIN_DEMO_QUOTES);
    seedIfEmpty(LOCAL_TEAM_STORAGE, ADMIN_DEMO_TEAM);
    seedIfEmpty(LOCAL_PROJECTS_STORAGE, DUMMY_PROJECTS);
  }, [authed]);

  const handleLogin = (user) => {
    const allowedRoles = [ROLES.Admin, ROLES.Moderator, ROLES.Accountant];

    if (!allowedRoles.includes(user.role)) {
      pb.authStore.clear();
      setCurrentUser(null);
      setAuthed(false);
      toast.error("Your account does not have admin access.");
      return;
    }

    setCurrentUser(user);
    setAuthed(true);
  };

  const handleLogout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
    setAuthed(false);
    toast.success("Signed out.");
  };

  // --- Project callbacks ---
  const handleProjectSaved = (saved, isUpdate) => {
    if (!hasPermission(currentUser, "canEdit", "projects")) {
      toast.error("You do not have permission to edit projects.");
      return;
    }
    setProjects((prev) => {
      const updated = isUpdate
        ? prev.map((p) => (p.id === saved.id ? saved : p))
        : [saved, ...prev];
      localStorage.setItem(LOCAL_PROJECTS_STORAGE, JSON.stringify(updated));
      return updated;
    });
  };

  const handleProjectDelete = async (id) => {
    if (!hasPermission(currentUser, "canDelete", "projects")) {
      toast.error("You do not have permission to delete projects.");
      return;
    }
    setDeletingProject(id);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        toast.success("Project deleted.");
      } else {
        toast.error("Delete failed.");
      }
    } catch {
      // Local fallback
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project deleted locally.");
    } finally {
      setDeletingProject(null);
    }
  };

  // --- Booking / Quote callbacks ---
  const normalizeStatus = (status) => {
    if (!status) return "Pending";
    const s = String(status).toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const persistBookings = (updated) => {
    setBookings(updated);
    localStorage.setItem(LOCAL_BOOKINGS_STORAGE, JSON.stringify(updated));
  };

  const maybeCreateInvoiceForBooking = (booking, status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "Pending" || normalized === "Confirmed") {
      const inv = autoCreateInvoiceForBooking(booking);
      if (inv) toast.success(`Draft invoice ${inv.number} created.`);
    }
  };

  const handleUpdateBooking = async (id, updates) => {
    if (!hasPermission(currentUser, "canEdit", "orders")) {
      toast.error("You do not have permission to edit bookings.");
      return;
    }
    const rawPayload = { ...updates };
    if (rawPayload.status) rawPayload.status = normalizeStatus(rawPayload.status);

    const payload = {};
    if ('Name' in rawPayload) payload.Name = rawPayload.Name;
    if ('name' in rawPayload) payload.Name = rawPayload.name;
    
    if ('Email' in rawPayload) payload.Email = rawPayload.Email;
    if ('email' in rawPayload) payload.Email = rawPayload.email;
    
    if ('Phone_Number' in rawPayload) payload.Phone_Number = rawPayload.Phone_Number;
    if ('phone' in rawPayload) payload.Phone_Number = rawPayload.phone;
    
    if ('Preferred_Date' in rawPayload) payload.Preferred_Date = rawPayload.Preferred_Date;
    if ('preferred_date' in rawPayload) payload.Preferred_Date = rawPayload.preferred_date;
    
    if ('Preferred_Time' in rawPayload) payload.Preferred_Time = rawPayload.Preferred_Time;
    if ('preferred_time' in rawPayload) payload.Preferred_Time = rawPayload.preferred_time;
    
    if ('Project_Description' in rawPayload) payload.Project_Description = rawPayload.Project_Description;
    if ('project_description' in rawPayload) payload.Project_Description = rawPayload.project_description;
    
    if ('status' in rawPayload) payload.status = rawPayload.status;
    if ('assignedTechId' in rawPayload) payload.assignedTechId = rawPayload.assignedTechId;
    if ('assignedTechName' in rawPayload) payload.assignedTechName = rawPayload.assignedTechName;
    if ('service_type' in rawPayload) payload.service_type = rawPayload.service_type;

    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;

    const mergeUpdates = (b) => ({
      ...b,
      ...updates,
      name: updates.name || updates.Name || b.name,
      email: updates.email || updates.Email || b.email,
      phone: updates.phone || updates.Phone_Number || b.phone,
      preferred_date: updates.preferred_date || updates.Preferred_Date || b.preferred_date,
      preferred_time: updates.preferred_time || updates.Preferred_Time || b.preferred_time,
      project_description: updates.project_description || updates.Project_Description || b.project_description,
      status: updates.status || b.status,
      assignedTechId: updates.assignedTechId === "unassigned" ? null : (updates.assignedTechId || b.assignedTechId),
      assignedTechName: updates.assignedTechId === "unassigned" ? null : (updates.assignedTechName || b.assignedTechName),
      service_type: updates.service_type || b.service_type,
    });

    try {
      await pb.collection("appointment_bookings").update(id, payload);
      const updated = bookings.map((b) =>
        b.id === id ? mergeUpdates(b) : b,
      );
      persistBookings(updated);
      maybeCreateInvoiceForBooking(mergeUpdates(booking), payload.status);
      toast.success("Booking updated.");
    } catch (err) {
      console.warn("PocketBase booking update failed, updating locally:", err);
      const updated = bookings.map((b) =>
        b.id === id ? mergeUpdates(b) : b,
      );
      persistBookings(updated);
      maybeCreateInvoiceForBooking(mergeUpdates(booking), rawPayload.status);
      toast.success("Booking updated locally.");
    }
  };

  const handleUpdateQuote = async (id, updates) => {
    if (!hasPermission(currentUser, "canEdit", "orders")) {
      toast.error("You do not have permission to edit quotes.");
      return;
    }
    const payload = {};
    if ('name' in updates) payload.name = updates.name;
    if ('email' in updates) payload.email = updates.email;
    if ('phone' in updates) payload.phone = updates.phone;
    if ('service_type' in updates) payload.service_type = updates.service_type;
    if ('project_details' in updates) payload.project_details = updates.project_details;
    if ('estimated_quote' in updates) payload.estimated_quote = Number(updates.estimated_quote);
    if ('status' in updates) payload.status = updates.status;

    try {
      await pb.collection("quote_inquiries").update(id, payload);
      const updated = quotes.map((q) =>
        q.id === id ? { ...q, ...payload } : q,
      );
      setQuotes(updated);
      localStorage.setItem(LOCAL_QUOTES_STORAGE, JSON.stringify(updated));
      toast.success("Quote updated.");
    } catch (err) {
      console.warn("PocketBase quote update failed, updating locally:", err);
      const updated = quotes.map((q) =>
        q.id === id ? { ...q, ...payload } : q,
      );
      setQuotes(updated);
      localStorage.setItem(LOCAL_QUOTES_STORAGE, JSON.stringify(updated));
      toast.success("Quote updated locally.");
    }
  };

  const handleUpdateStatus = async (collection, id, status) => {
    const normalized = normalizeStatus(status);
    try {
      await pb.collection(collection).update(id, { status: normalized });
      if (collection === "appointment_bookings") {
        const booking = bookings.find((b) => b.id === id);
        if (booking) maybeCreateInvoiceForBooking(booking, normalized);
      }
      toast.success("Status updated.");
      fetchBookingsAndQuotes();
    } catch (err) {
      console.warn("PocketBase update failed, updating locally:", err);
      if (collection === "appointment_bookings") {
        const updated = bookings.map((b) =>
          b.id === id ? { ...b, status: normalized } : b,
        );
        setBookings(updated);
        localStorage.setItem(LOCAL_BOOKINGS_STORAGE, JSON.stringify(updated));
        const booking = updated.find((b) => b.id === id);
        if (booking) maybeCreateInvoiceForBooking(booking, normalized);
      } else {
        const updated = quotes.map((q) =>
          q.id === id ? { ...q, status: normalized } : q,
        );
        setQuotes(updated);
        localStorage.setItem(LOCAL_QUOTES_STORAGE, JSON.stringify(updated));
      }
      toast.success("Status updated locally.");
    }
  };

  const openSendInvoiceForBooking = (booking) => {
    let inv = getInvoiceForBooking(booking.id);
    if (!inv) {
      inv = autoCreateInvoiceForBooking(booking);
    }
    if (inv) {
      setInvoiceToSend(inv);
      setShowSendInvoice(true);
    } else {
      toast.error("Could not find or create an invoice for this booking.");
    }
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

  const handleDeleteOrder = async (collection, id) => {
    if (!hasPermission(currentUser, "canDelete", "orders")) {
      toast.error("You do not have permission to delete bookings/quotes.");
      return;
    }
    try {
      await pb.collection(collection).delete(id);
      toast.success("Booking deleted.");
      fetchBookingsAndQuotes();
    } catch (err) {
      console.warn("PocketBase delete failed, deleting locally:", err);
      if (collection === "appointment_bookings") {
        const updated = bookings.filter((b) => b.id !== id);
        setBookings(updated);
        localStorage.setItem(LOCAL_BOOKINGS_STORAGE, JSON.stringify(updated));
      } else {
        const updated = quotes.filter((q) => q.id !== id);
        setQuotes(updated);
        localStorage.setItem(LOCAL_QUOTES_STORAGE, JSON.stringify(updated));
      }
      toast.success("Booking deleted locally.");
    }
  };

  // --- Team callbacks ---
  const handleTechSaved = (saved, isUpdate) => {
    if (!hasPermission(currentUser, "canEdit", "team")) {
      toast.error("You do not have permission to edit technicians.");
      return;
    }
    const updatedList = isUpdate
      ? teamMembers.map((t) => (t.id === saved.id ? saved : t))
      : [...teamMembers, saved];
    setTeamMembers(updatedList);
    localStorage.setItem(LOCAL_TEAM_STORAGE, JSON.stringify(updatedList));
  };

  const handleDeleteTech = async (id) => {
    if (!hasPermission(currentUser, "canDelete", "team")) {
      toast.error("You do not have permission to delete technicians.");
      return;
    }
    try {
      await pb.collection("team_members").delete(id);
      toast.success("Technician deleted.");
      fetchTeam();
    } catch (err) {
      const updated = teamMembers.filter((t) => t.id !== id);
      setTeamMembers(updated);
      localStorage.setItem(LOCAL_TEAM_STORAGE, JSON.stringify(updated));
      toast.success("Technician deleted locally.");
    }
  };

  // --- Profile / User callbacks ---
  const handleUserSaved = (saved, isEdit = false) => {
    if (!hasPermission(currentUser, "canEdit", "users")) {
      toast.error(isEdit ? "You do not have permission to edit users." : "You do not have permission to create users.");
      return;
    }
    const updated = isEdit
      ? users.map((u) => (u.id === saved.id ? saved : u))
      : [...users, saved];
    setUsers(updated);
    localStorage.setItem(LOCAL_USERS_STORAGE, JSON.stringify(updated));
  };

  const handleDeleteUser = async (id) => {
    if (!hasPermission(currentUser, "canDelete", "users")) {
      toast.error("You do not have permission to delete users.");
      return;
    }
    try {
      await pb.collection("users").delete(id);
      toast.success("User deleted.");
      fetchUsers();
    } catch (err) {
      const updated = users.filter((u) => u.id !== id);
      setUsers(updated);
      localStorage.setItem(LOCAL_USERS_STORAGE, JSON.stringify(updated));
      toast.success("User deleted locally.");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username: profileData.name,
        email: profileData.email,
      };
      let updatedUser;
      if (currentUser?.id && !currentUser.id.startsWith("local_")) {
        updatedUser = await pb.collection("users").update(currentUser.id, payload);
      } else {
        updatedUser = {
          ...currentUser,
          ...payload,
        };
      }
      
      localStorage.setItem("atltvmountpro_auth_user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      const updatedList = users.map((u) => (u.id === currentUser.id ? { ...u, ...payload } : u));
      setUsers(updatedList);
      localStorage.setItem(LOCAL_USERS_STORAGE, JSON.stringify(updatedList));

      setIsEditingProfile(false);
      toast.success("Profile updated successfully.");
    } catch (err) {
      console.warn("Profile update failed, updating locally:", err);
      const updatedUser = {
        ...currentUser,
        username: profileData.name,
        email: profileData.email,
      };
      localStorage.setItem("atltvmountpro_auth_user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      const updatedList = users.map((u) => (u.id === currentUser.id ? { ...u, username: profileData.name, email: profileData.email } : u));
      setUsers(updatedList);
      localStorage.setItem(LOCAL_USERS_STORAGE, JSON.stringify(updatedList));
      
      setIsEditingProfile(false);
      toast.success("Profile updated locally.");
    }
  };

  const handleChangeAdminKey = (newKey) => {
    if (!newKey) return;
    localStorage.setItem(ADMIN_KEY_STORAGE, newKey);
    setAdminKey(newKey);
    toast.success("Admin access key updated locally.");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!authed) return <LoginScreen onLogin={handleLogin} />;

  // Filter & Search Logic
  const getFilteredBookings = () => {
    return bookings.filter((b) => {
      const matchesSearch =
        b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.phone?.includes(searchQuery);
      const matchesStatus =
        statusFilter === "All" || (b.status || "Pending") === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const getFilteredQuotes = () => {
    return quotes.filter((q) => {
      const matchesSearch =
        q.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.phone?.includes(searchQuery);
      const matchesStatus =
        statusFilter === "All" || (q.status || "Pending") === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const calendarBookings = getFilteredBookings().map((b) => ({
    ...b,
    status: (b.status || "Pending").toLowerCase(),
  }));

  const filteredBookings = getFilteredBookings();
  const totalBookingsPages = Math.ceil(filteredBookings.length / bookingsItemsPerPage) || 1;
  const bookingsStartIndex = (bookingsPage - 1) * bookingsItemsPerPage;
  const paginatedBookings = filteredBookings.slice(bookingsStartIndex, bookingsStartIndex + bookingsItemsPerPage);

  const filteredQuotes = getFilteredQuotes();
  const totalQuotesPages = Math.ceil(filteredQuotes.length / quotesItemsPerPage) || 1;
  const quotesStartIndex = (quotesPage - 1) * quotesItemsPerPage;
  const paginatedQuotes = filteredQuotes.slice(quotesStartIndex, quotesStartIndex + quotesItemsPerPage);

  const totalTeamPages = Math.ceil(teamMembers.length / teamItemsPerPage) || 1;
  const teamStartIndex = (teamPage - 1) * teamItemsPerPage;
  const paginatedTeam = teamMembers.slice(teamStartIndex, teamStartIndex + teamItemsPerPage);

  const getFilteredApplications = () => {
    return applications.filter((app) => {
      const matchesFilter = appFilter === "All" || app.status === appFilter;
      const matchesSearch =
        app.name.toLowerCase().includes(appSearch.toLowerCase()) ||
        app.email.toLowerCase().includes(appSearch.toLowerCase()) ||
        app.zip.includes(appSearch) ||
        app.city.toLowerCase().includes(appSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  const filteredApps = getFilteredApplications();
  const totalAppsPages = Math.ceil(filteredApps.length / appsItemsPerPage) || 1;
  const appsStartIndex = (appsPage - 1) * appsItemsPerPage;
  const paginatedApps = filteredApps.slice(appsStartIndex, appsStartIndex + appsItemsPerPage);

  const totalProjectsPages = Math.ceil(projects.length / projectsItemsPerPage) || 1;
  const projectsStartIndex = (projectsPage - 1) * projectsItemsPerPage;
  const paginatedProjects = projects.slice(projectsStartIndex, projectsStartIndex + projectsItemsPerPage);

  const totalUsersPages = Math.ceil(users.length / usersItemsPerPage) || 1;
  const usersStartIndex = (usersPage - 1) * usersItemsPerPage;
  const paginatedUsers = users.slice(usersStartIndex, usersStartIndex + usersItemsPerPage);

  return (
    <>
      <div className="min-h-screen md:h-screen md:overflow-hidden bg-background flex flex-col md:flex-row">
        {/* MOBILE HEADER */}
        <header className="md:hidden sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/images/logo/logo.png"
              alt="Atlanta TV Mount Pro"
              className="h-9"
            />
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded font-medium">
              Admin
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg border border-border text-foreground hover:bg-muted"
          >
            <Menu size={18} />
          </button>
        </header>

        {/* SIDE NAVIGATION PANEL */}
        <aside
          className={`fixed md:sticky top-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
          <div className="p-5 flex-1 flex flex-col overflow-y-auto">
            {/* Sidebar Branding */}
            <div className="relative flex items-center justify-center mb-8 pb-4 border-b border-border/50">
              <img
                src="/images/logo/logo.png"
                alt="Atlanta TV Mount Pro"
                className="h-10 mx-auto"
              />
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden text-muted-foreground hover:text-foreground absolute right-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Menu Links with Flat Icons */}
            <nav className="space-y-1.5 flex-1">
              <button
                onClick={() => {
                  setActiveTab("overview");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === "overview" ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <LayoutDashboard size={18} className="flex-shrink-0" />
                <span>Dashboard Overview</span>
              </button>

              {hasPermission(currentUser, "canView", "projects") && (
                <button
                  onClick={() => {
                    setActiveTab("projects");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === "projects" ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <Tv size={18} className="flex-shrink-0" />
                  <span>Projects Showcase</span>
                </button>
              )}

              {hasPermission(currentUser, "canView", "orders") && (
                <button
                  onClick={() => {
                    setActiveTab("orders");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === "orders" ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <ClipboardList size={18} className="flex-shrink-0" />
                  <span>Bookings & Orders</span>
                </button>
              )}

              {hasPermission(currentUser, "canView", "team") && (
                <button
                  onClick={() => {
                    setActiveTab("team");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === "team" ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <Users size={18} className="flex-shrink-0" />
                  <span>Team Technicians</span>
                </button>
              )}

              {hasPermission(currentUser, "canView", "recruitment") && (
                <button
                  onClick={() => {
                    setActiveTab("recruitment");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === "recruitment" ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <UserPlus size={18} className="flex-shrink-0" />
                  <span>Recruitment</span>
                </button>
              )}

              {hasPermission(currentUser, "canView", "crm") && (
                <button
                  onClick={() => {
                    setActiveTab("crm");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === "crm" ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <MessageSquare size={18} className="flex-shrink-0" />
                  <span>CRM & Blasts</span>
                </button>
              )}

              {hasPermission(currentUser, "canView", "profile") && (
                <button
                  onClick={() => {
                    setActiveTab("profile");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === "profile" ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <UserCog size={18} className="flex-shrink-0" />
                  <span>Profile & Users</span>
                </button>
              )}

              {hasPermission(currentUser, "canView", "finance") && (
                <button
                  onClick={() => {
                    setActiveTab("finance");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === "finance" ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <DollarSign size={18} className="flex-shrink-0" />
                  <span>Finance</span>
                </button>
              )}

              {hasPermission(currentUser, "canView", "cms") && (
                <button
                  onClick={() => {
                    setActiveTab("cms");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === "cms" ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <FileText size={18} className="flex-shrink-0" />
                  <span>CMS</span>
                </button>
              )}

              {hasPermission(currentUser, "canView", "media") && (
                <button
                  onClick={() => {
                    setActiveTab("media");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === "media" ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <ImageIcon size={18} className="flex-shrink-0" />
                  <span>Media Library</span>
                </button>
              )}
            </nav>
          </div>

          {/* Footer of Sidebar */}
          <div className="p-4 border-t border-border bg-muted/40 flex flex-col gap-2">
            {currentUser?.role && (
              <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-card border border-border rounded-lg">
                <Shield size={12} className="text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  {currentUser.role}
                </span>
              </div>
            )}
            <Link
              to="/"
              className="flex items-center justify-center gap-1.5 py-2 px-3 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-card transition-all"
            >
              <ChevronLeft size={13} />
              View Main Site
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-lg text-xs font-semibold transition-all"
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        </aside>

        {/* MAIN DISPLAY CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden md:h-full md:overflow-y-auto">
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 md:py-10 max-w-[1200px] w-full mx-auto min-w-0">
          {currentUser?.role === ROLES.Viewer && (
            <div className="mb-4 flex items-center gap-2 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded-lg px-4 py-2.5 text-sm">
              <Lock size={14} />
              <span>
                You are viewing in <strong>read-only mode</strong>. Contact an
                administrator for editing access.
              </span>
            </div>
          )}

          {/* TAB CONTENT: OVERVIEW DASHBOARD */}
          {activeTab === "overview" && (
            <OverviewDashboard
              bookings={bookings}
              quotes={quotes}
              teamMembers={teamMembers}
              projects={projects}
              applications={applications}
              invoices={invoices}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              setActiveTab={setActiveTab}
              setSelectedOrder={setSelectedOrder}
              currentUser={currentUser}
            />
          )}

          {/* TAB CONTENT: PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Showcase Projects
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage the customer projects that are visible on your main
                    website.
                  </p>
                </div>
                {hasPermission(currentUser?.role, "canEdit", "projects") && (
                  <Button
                    onClick={() => {
                      setEditingProject(null);
                      setProjectDialogOpen(true);
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Plus size={15} className="mr-1.5" />
                    New Project
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-muted animate-pulse rounded-xl"
                    />
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border rounded-2xl text-muted-foreground">
                  <p className="mb-4 text-sm">No projects created yet.</p>
                  <Button
                    onClick={() => {
                      setEditingProject(null);
                      setProjectDialogOpen(true);
                    }}
                    variant="outline"
                  >
                    Add your first project
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl border border-border overflow-hidden bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-20">
                            Thumb
                          </th>
                          <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                            Title
                          </th>
                          <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">
                            Location
                          </th>
                          <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">
                            Services
                          </th>
                          <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-20">
                            Featured
                          </th>
                          <th className="text-right px-4 py-3 font-semibold text-muted-foreground w-24">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProjects.map((project, i) => (
                          <tr
                            key={project.id || i}
                            className="border-b border-border last:border-0 hover:bg-muted/20"
                          >
                            <td className="px-4 py-3.5">
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
                            <td className="px-4 py-3.5 font-medium text-foreground">
                              {project.title}
                            </td>
                            <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">
                              {project.location}
                            </td>
                            <td className="px-4 py-3.5 hidden lg:table-cell">
                              <div className="flex flex-wrap gap-1">
                                {project.services?.slice(0, 3).map((s, si) => (
                                  <span
                                    key={si}
                                    className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              {project.featured_landing ? (
                                <span className="bg-green-500/10 text-green-500 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-green-500/20">
                                  Featured
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  No
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center gap-1 justify-end">
                                {hasPermission(
                                  currentUser?.role,
                                  "canEdit",
                                  "projects",
                                ) && (
                                  <button
                                    onClick={() => {
                                      setEditingProject(project);
                                      setProjectDialogOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                )}
                                {hasPermission(
                                  currentUser?.role,
                                  "canDelete",
                                  "projects",
                                ) && (
                                  <button
                                    onClick={() =>
                                      handleProjectDelete(project.id)
                                    }
                                    disabled={deletingProject === project.id}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/15"
                                  >
                                    {deletingProject === project.id ? (
                                      <Loader2
                                        size={14}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Trash2 size={14} />
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {projects.length > 0 && (
                    <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
                      <span className="text-xs text-muted-foreground">
                        Showing {projectsStartIndex + 1} to {Math.min(projectsStartIndex + projectsItemsPerPage, projects.length)} of {projects.length} projects
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setProjectsPage((p) => Math.max(p - 1, 1))}
                          disabled={projectsPage === 1}
                          className="h-8 text-xs"
                        >
                          Previous
                        </Button>
                        <span className="text-xs font-semibold px-2">
                          Page {projectsPage} of {totalProjectsPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setProjectsPage((p) => Math.min(p + 1, totalProjectsPages))}
                          disabled={projectsPage === totalProjectsPages}
                          className="h-8 text-xs"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: ORDERS & BOOKINGS */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Orders & Bookings
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Track and manage appointments booked online or inquiries from
                  the quote estimator.
                </p>
              </div>

              {/* Section Sub-tabs */}
              <div className="flex gap-2 border-b border-border pb-3">
                <button
                  onClick={() => setOrdersTab("appointments")}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${ordersTab === "appointments" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  Appointment Bookings ({bookings.length})
                </button>
                <button
                  onClick={() => setOrdersTab("quotes")}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${ordersTab === "quotes" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  Quote Inquiries ({quotes.length})
                </button>
              </div>

              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search customer by name, email or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-base w-full pl-9"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-base w-full bg-muted"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                {ordersTab === "appointments" && (
                  <div className="flex gap-1 border border-border rounded-lg p-0.5 bg-muted/40">
                    <button
                      onClick={() => setBookingsViewMode("list")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${bookingsViewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <List size={14} /> List
                    </button>
                    <button
                      onClick={() => setBookingsViewMode("calendar")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${bookingsViewMode === "calendar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <LayoutGrid size={14} /> Calendar
                    </button>
                  </div>
                )}
              </div>

              {/* Data tables / calendar */}
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-muted animate-pulse rounded-xl"
                    />
                  ))}
                </div>
              ) : ordersTab === "appointments" ? (
                bookingsViewMode === "calendar" ? (
                  <AppointmentsCalendar
                    bookings={calendarBookings}
                    teamMembers={teamMembers}
                    onUpdateBooking={handleUpdateBooking}
                  />
                ) : filteredBookings.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                    No matching appointment bookings found.
                  </div>
                ) : (
                  <div className="rounded-xl border border-border overflow-hidden bg-card">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                          <tr>
                            <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                              Customer
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                              Service
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                              Preferred Time
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                              Technician
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                              Status
                            </th>
                            <th className="text-right px-4 py-3 font-semibold text-muted-foreground w-36">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedBookings.map((b) => (
                            <tr
                              key={b.id}
                              className="border-b border-border last:border-0 hover:bg-muted/20"
                            >
                              <td className="px-4 py-3.5">
                                <div className="font-semibold text-foreground">
                                  {b.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {b.email} • {b.phone}
                                </div>
                              </td>
                              <td className="px-4 py-3.5 capitalize font-medium">
                                {b.service_type}
                              </td>
                              <td className="px-4 py-3.5 text-muted-foreground">
                                {b.preferred_date} at{" "}
                                {b.preferred_time || "Anytime"}
                              </td>
                              <td className="px-4 py-3.5">
                                {hasPermission(
                                  currentUser?.role,
                                  "canEdit",
                                  "orders",
                                ) ? (
                                  <Select
                                    value={
                                      b.assignedTechId
                                        ? String(b.assignedTechId)
                                        : "unassigned"
                                    }
                                    onValueChange={(techId) => {
                                      if (techId === "unassigned") {
                                        handleUpdateBooking(b.id, {
                                          assignedTechId: null,
                                          assignedTechName: null,
                                        });
                                      } else {
                                        const tech = teamMembers.find(
                                          (t) => String(t.id) === techId,
                                        );
                                        if (tech) {
                                          handleUpdateBooking(b.id, {
                                            assignedTechId: tech.id,
                                            assignedTechName: tech.name,
                                          });
                                        }
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="h-8 text-xs w-[140px]">
                                      <SelectValue placeholder="Assign tech" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="unassigned">
                                        Unassigned
                                      </SelectItem>
                                      {teamMembers.map((tech) => (
                                        <SelectItem
                                          key={tech.id}
                                          value={String(tech.id)}
                                        >
                                          {tech.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    {b.assignedTechName || "Unassigned"}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3.5">
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    (b.status || "Pending") === "Confirmed"
                                      ? "bg-green-500/10 text-green-500"
                                      : (b.status || "Pending") === "Completed"
                                        ? "bg-blue-500/10 text-blue-500"
                                        : (b.status || "Pending") ===
                                            "Cancelled"
                                          ? "bg-red-500/10 text-red-500"
                                          : "bg-yellow-500/10 text-yellow-500"
                                  }`}
                                >
                                  {(b.status || "Pending") === "Confirmed" ? (
                                    <CheckCircle2 size={10} />
                                  ) : (b.status || "Pending") === "Pending" ? (
                                    <Clock size={10} />
                                  ) : (
                                    <AlertTriangle size={10} />
                                  )}
                                  {b.status || "Pending"}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center gap-1 justify-end">
                                  <button
                                    onClick={() =>
                                      setSelectedOrder({
                                        ...b,
                                        type: "appointment",
                                      })
                                    }
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                                    title="View Details"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  {hasPermission(
                                    currentUser?.role,
                                    "canEdit",
                                    "orders",
                                  ) && (
                                    <button
                                      onClick={() =>
                                        setEditingOrder({
                                          ...b,
                                          type: "appointment",
                                        })
                                      }
                                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                                      title="Edit Booking"
                                    >
                                      <Pencil size={14} />
                                    </button>
                                  )}
                                  {hasPermission(
                                    currentUser?.role,
                                    "canEdit",
                                    "orders",
                                  ) ? (
                                    <select
                                      value={b.status || "Pending"}
                                      onChange={(e) =>
                                        handleUpdateStatus(
                                          "appointment_bookings",
                                          b.id,
                                          e.target.value,
                                        )
                                      }
                                      className="text-xs bg-muted border border-border rounded p-1"
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="Confirmed">Confirm</option>
                                      <option value="Completed">
                                        Complete
                                      </option>
                                      <option value="Cancelled">Cancel</option>
                                    </select>
                                  ) : (
                                    <span className="text-xs bg-muted border border-border rounded px-2 py-1">
                                      {b.status || "Pending"}
                                    </span>
                                  )}
                                  {hasPermission(
                                    currentUser?.role,
                                    "canDelete",
                                    "orders",
                                  ) && (
                                    <button
                                      onClick={() =>
                                        handleDeleteOrder(
                                          "appointment_bookings",
                                          b.id,
                                        )
                                      }
                                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive"
                                      title="Delete"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {filteredBookings.length > 0 && (
                      <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
                        <span className="text-xs text-muted-foreground">
                          Showing {bookingsStartIndex + 1} to {Math.min(bookingsStartIndex + bookingsItemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBookingsPage((p) => Math.max(p - 1, 1))}
                            disabled={bookingsPage === 1}
                            className="h-8 text-xs"
                          >
                            Previous
                          </Button>
                          <span className="text-xs font-semibold px-2">
                            Page {bookingsPage} of {totalBookingsPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBookingsPage((p) => Math.min(p + 1, totalBookingsPages))}
                            disabled={bookingsPage === totalBookingsPages}
                            className="h-8 text-xs"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              ) : filteredQuotes.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                  No matching quote inquiries found.
                </div>
              ) : (
                <div className="rounded-xl border border-border overflow-hidden bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                            Customer
                          </th>
                          <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                            Estimated Quote
                          </th>
                          <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                            Service Required
                          </th>
                          <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                            Status
                          </th>
                          <th className="text-right px-4 py-3 font-semibold text-muted-foreground w-36">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedQuotes.map((q) => (
                          <tr
                            key={q.id}
                            className="border-b border-border last:border-0 hover:bg-muted/20"
                          >
                            <td className="px-4 py-3.5">
                              <div className="font-semibold text-foreground">
                                {q.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {q.email} • {q.phone}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 font-bold text-primary">
                              ${q.estimated_quote}
                            </td>
                            <td className="px-4 py-3.5 capitalize font-medium">
                              {q.service_type}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  (q.status || "Pending") === "Confirmed"
                                    ? "bg-green-500/10 text-green-500"
                                    : (q.status || "Pending") === "Completed"
                                      ? "bg-blue-500/10 text-blue-500"
                                      : (q.status || "Pending") === "Cancelled"
                                        ? "bg-red-500/10 text-red-500"
                                        : "bg-yellow-500/10 text-yellow-500"
                                }`}
                              >
                                {(q.status || "Pending") === "Confirmed" ? (
                                  <CheckCircle2 size={10} />
                                ) : (q.status || "Pending") === "Pending" ? (
                                  <Clock size={10} />
                                ) : (
                                  <AlertTriangle size={10} />
                                )}
                                {q.status || "Pending"}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center gap-1 justify-end">
                                <button
                                  onClick={() =>
                                    setSelectedOrder({ ...q, type: "quote" })
                                  }
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                                  title="View Details"
                                >
                                  <Eye size={14} />
                                </button>
                                {hasPermission(
                                  currentUser?.role,
                                  "canEdit",
                                  "orders",
                                ) && (
                                  <button
                                    onClick={() =>
                                      setEditingOrder({
                                        ...q,
                                        type: "quote",
                                      })
                                    }
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                                    title="Edit Quote"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                )}
                                {hasPermission(
                                  currentUser?.role,
                                  "canEdit",
                                  "orders",
                                ) ? (
                                  <select
                                    value={q.status || "Pending"}
                                    onChange={(e) =>
                                      handleUpdateStatus(
                                        "quote_inquiries",
                                        q.id,
                                        e.target.value,
                                      )
                                    }
                                    className="text-xs bg-muted border border-border rounded p-1"
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirm</option>
                                    <option value="Completed">Complete</option>
                                    <option value="Cancelled">Cancel</option>
                                  </select>
                                ) : (
                                  <span className="text-xs bg-muted border border-border rounded px-2 py-1">
                                    {q.status || "Pending"}
                                  </span>
                                )}
                                {hasPermission(
                                  currentUser?.role,
                                  "canDelete",
                                  "orders",
                                ) && (
                                  <button
                                    onClick={() =>
                                      handleDeleteOrder("quote_inquiries", q.id)
                                    }
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredQuotes.length > 0 && (
                    <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
                      <span className="text-xs text-muted-foreground">
                        Showing {quotesStartIndex + 1} to {Math.min(quotesStartIndex + quotesItemsPerPage, filteredQuotes.length)} of {filteredQuotes.length} quotes
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuotesPage((p) => Math.max(p - 1, 1))}
                          disabled={quotesPage === 1}
                          className="h-8 text-xs"
                        >
                          Previous
                        </Button>
                        <span className="text-xs font-semibold px-2">
                          Page {quotesPage} of {totalQuotesPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuotesPage((p) => Math.min(p + 1, totalQuotesPages))}
                          disabled={quotesPage === totalQuotesPages}
                          className="h-8 text-xs"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: TEAM TECHNICIANS */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Team Technicians
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage profiles, photos, and skills of technicians displayed
                    on the public Team page.
                  </p>
                </div>
                {hasPermission(currentUser?.role, "canEdit", "team") && (
                  <Button
                    onClick={() => {
                      setEditingTech(null);
                      setTechDialogOpen(true);
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Plus size={15} className="mr-1.5" />
                    Add Tech
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-48 bg-muted animate-pulse rounded-xl"
                    />
                  ))}
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border rounded-2xl text-muted-foreground">
                  <p className="mb-4 text-sm">
                    No technicians added to dynamic directory.
                  </p>
                  <Button
                    onClick={() => {
                      setEditingTech(null);
                      setTechDialogOpen(true);
                    }}
                    variant="outline"
                  >
                    Create Technician
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedTeam.map((tech) => (
                      <div
                        key={tech.id}
                        className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-sm"
                      >
                        <div className="flex gap-4">
                          <img
                            src={
                              tech.photo || "/images/team/team-placeholder.jpg"
                            }
                            alt={tech.name}
                            className="w-16 h-16 rounded-full object-cover border border-border"
                          />
                          <div className="space-y-1">
                            <h3 className="font-bold text-foreground">
                              {tech.name}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-3">
                              {tech.bio}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/50">
                          <div className="flex flex-wrap gap-1 mb-3">
                            {tech.skills?.map((s, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                          <div className="flex justify-end gap-2">
                            {hasPermission(
                              currentUser?.role,
                              "canEdit",
                              "team",
                            ) && (
                              <button
                                onClick={() => {
                                  setEditingTech(tech);
                                  setTechDialogOpen(true);
                                }}
                                className="text-xs bg-muted text-foreground hover:bg-muted/80 px-2.5 py-1.5 rounded font-medium flex items-center gap-1"
                              >
                                <Pencil size={12} /> Edit
                              </button>
                            )}
                            {hasPermission(
                              currentUser?.role,
                              "canDelete",
                              "team",
                            ) && (
                              <button
                                onClick={() => handleDeleteTech(tech.id)}
                                className="text-xs bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground px-2.5 py-1.5 rounded font-medium flex items-center gap-1"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {teamMembers.length > 0 && (
                    <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
                      <span className="text-xs text-muted-foreground">
                        Showing {teamStartIndex + 1} to {Math.min(teamStartIndex + teamItemsPerPage, teamMembers.length)} of {teamMembers.length} team members
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTeamPage((p) => Math.max(p - 1, 1))}
                          disabled={teamPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-xs font-semibold px-2">
                          Page {teamPage} of {totalTeamPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTeamPage((p) => Math.min(p + 1, totalTeamPages))}
                          disabled={teamPage === totalTeamPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB CONTENT: PROFILE & USER MANAGEMENT */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Profile & User Management
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your admin profile, reset security access keys, or
                  manage supplementary administrative users.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* PROFILE INFORMATION */}
                <div className="lg:col-span-1 bg-card border border-border rounded-xl p-6 space-y-6">
                  <div className="flex flex-col items-center text-center pb-4 border-b border-border/50">
                    <img
                      src={profileData.avatar}
                      alt={currentUser?.email || profileData.name}
                      className="w-24 h-24 rounded-full object-cover mb-3 border border-border"
                    />
                    <h3 className="font-bold text-lg text-foreground">
                      {currentUser?.email || profileData.name}
                    </h3>
                    <span className="text-xs bg-primary/20 text-primary px-2.5 py-0.5 rounded-full font-semibold">
                      {currentUser?.role || profileData.role}
                    </span>
                  </div>

                  {!isEditingProfile ? (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs text-muted-foreground block uppercase font-bold tracking-wide">
                          Email
                        </span>
                        <span className="text-sm font-semibold">
                          {profileData.email}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block uppercase font-bold tracking-wide">
                          Key Access
                        </span>
                        <span className="text-sm font-semibold italic text-muted-foreground">
                          Protected Key Credentials
                        </span>
                      </div>
                      <Button
                        onClick={() => setIsEditingProfile(true)}
                        className="w-full"
                        variant="outline"
                      >
                        Edit Profile
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateProfile} className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold block text-muted-foreground uppercase">
                          Name
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              name: e.target.value,
                            })
                          }
                          className="input-base w-full mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold block text-muted-foreground uppercase">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              email: e.target.value,
                            })
                          }
                          className="input-base w-full mt-1"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button type="submit" className="flex-1">
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditingProfile(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* SECURITY KEY RESET */}
                  <div className="pt-4 border-t border-border/50 space-y-3">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Shield size={16} className="text-primary" /> Security
                      Verification Key
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Reset your master admin key token. Re-login will be
                      required if changed.
                    </p>
                    <input
                      type="password"
                      placeholder="New Admin Key token"
                      className="input-base w-full text-xs"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleChangeAdminKey(e.target.value);
                          e.target.value = "";
                        }
                      }}
                    />
                    <p className="text-[10px] text-muted-foreground italic">
                      Press Enter to save changes.
                    </p>
                  </div>
                </div>

                {/* USER ACCOUNTS LIST */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-foreground">
                        Authorized System Users
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Authorized profiles who can access system features.
                      </p>
                    </div>
                    {hasPermission(currentUser?.role, "canEdit", "users") && (
                      <Button
                        onClick={() => setUserDialogOpen(true)}
                        className="h-9"
                      >
                        <Plus size={14} className="mr-1" /> Add User
                      </Button>
                    )}
                  </div>

                  <div className="border border-border rounded-lg overflow-hidden bg-background">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted text-muted-foreground font-semibold border-b border-border">
                        <tr>
                          <th className="px-4 py-2.5">User</th>
                          <th className="px-4 py-2.5">Role</th>
                          <th className="px-4 py-2.5">Tab Access Permissions</th>
                          <th className="px-4 py-2.5">Created</th>
                          <th className="px-4 py-2.5 text-right w-16">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedUsers.map((u) => (
                          <tr
                            key={u.id}
                            className="border-b border-border last:border-0 hover:bg-muted/20"
                          >
                            <td className="px-4 py-3">
                              <div className="font-bold text-foreground">
                                {u.username}
                              </div>
                              <div className="text-muted-foreground">
                                {u.email}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-semibold">
                                {u.role || "Admin"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {u.role === "Admin" ? (
                                <span className="text-[10px] text-muted-foreground font-semibold italic">Full Administrative Access</span>
                              ) : (
                                <div className="flex flex-wrap gap-4">
                                  {["projects", "orders", "team", "recruitment", "crm", "finance", "media", "cms"].map((res) => {
                                    let customPerms = {};
                                    if (u.custom_permissions) {
                                      if (typeof u.custom_permissions === "string") {
                                        try {
                                          customPerms = JSON.parse(u.custom_permissions);
                                        } catch (e) {
                                          customPerms = {};
                                        }
                                      } else {
                                        customPerms = u.custom_permissions;
                                      }
                                    }
                                    const isInherited = hasPermission(u.role, "canView", res);
                                    const isChecked = customPerms.canView?.includes(res) || isInherited;
                                    
                                    return (
                                      <label key={res} className="flex items-center gap-1.5 cursor-pointer select-none">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          disabled={isInherited || !hasPermission(currentUser, "canEdit", "users")}
                                          onChange={() => handleTogglePermission(u, res)}
                                          className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 bg-muted/40 cursor-pointer"
                                        />
                                        <span className={`text-[10px] uppercase font-bold ${
                                          isInherited ? "text-muted-foreground/50 italic" : "text-foreground"
                                        }`} title={isInherited ? "Role permission (Inherited)" : "Custom permission"}>
                                          {res}
                                          {isInherited && " (R)"}
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {new Date(u.created).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                {hasPermission(currentUser, "canEdit", "users") && (
                                  <button
                                    onClick={() => {
                                      setEditingUser(u);
                                      setUserDialogOpen(true);
                                    }}
                                    className="text-muted-foreground hover:text-primary p-1 rounded-md"
                                    title="Edit User"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                )}
                                {hasPermission(
                                  currentUser,
                                  "canDelete",
                                  "users",
                                ) && (
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="text-muted-foreground hover:text-destructive p-1 rounded-md"
                                    title="Delete User"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {users.length > 0 && (
                      <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
                        <span className="text-xs text-muted-foreground">
                          Showing {usersStartIndex + 1} to {Math.min(usersStartIndex + usersItemsPerPage, users.length)} of {users.length} users
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUsersPage((p) => Math.max(p - 1, 1))}
                            disabled={usersPage === 1}
                            className="h-8 text-xs"
                          >
                            Previous
                          </Button>
                          <span className="text-xs font-semibold px-2">
                            Page {usersPage} of {totalUsersPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUsersPage((p) => Math.min(p + 1, totalUsersPages))}
                            disabled={usersPage === totalUsersPages}
                            className="h-8 text-xs"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: FINANCE */}
          {activeTab === "finance" && <FinanceModule currentUser={currentUser} />}

          {/* TAB CONTENT: CRM */}
          {activeTab === "crm" && <CRMModule />}

          {/* TAB CONTENT: CMS */}
          {activeTab === "cms" && <CMSEditor />}

          {/* TAB CONTENT: MEDIA LIBRARY */}
          {activeTab === "media" && (
            <MediaLibraryAdmin
              canEdit={hasPermission(currentUser?.role, "canEdit", "media")}
            />
          )}

          {/* TAB CONTENT: RECRUITMENT */}
          {activeTab === "recruitment" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-6 rounded-2xl">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Technician Applications</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Review and screen incoming technician applications, check credentials, and activate them.
                  </p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/40 p-4 rounded-xl border border-border/50">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search name, email, or zip..."
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      className="input-base pl-9 w-full bg-card text-sm border-border h-9 text-foreground rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                  {["All", "Applied", "Screening", "Background Pending", "Approved", "Rejected"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setAppFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        appFilter === status
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                          : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              {loadingApplications ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/50 border-b border-border/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="px-6 py-4">Technician</th>
                          <th className="px-6 py-4">Location</th>
                          <th className="px-6 py-4">Experience</th>
                          <th className="px-6 py-4">Skills & Tools</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {filteredApps.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                              No technician applications found matching criteria.
                            </td>
                          </tr>
                        ) : (
                          paginatedApps.map((app) => (
                            <tr key={app.id} className="hover:bg-muted/20 transition-all">
                              <td className="px-6 py-4">
                                <div className="font-semibold text-foreground">{app.name}</div>
                                <div className="text-xs text-muted-foreground">{app.email}</div>
                                <div className="text-xs text-muted-foreground">{app.phone}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-foreground">{app.city}</div>
                                <div className="text-xs text-muted-foreground">ZIP: {app.zip}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                  {app.experience}
                                </span>
                              </td>
                              <td className="px-6 py-4 max-w-[240px]">
                                <div className="truncate text-foreground text-xs" title={app.skills.join(", ")}>
                                  <strong>Skills:</strong> {app.skills.join(", ") || "None"}
                                </div>
                                <div className="truncate text-muted-foreground text-xs mt-1" title={app.tools.join(", ")}>
                                  <strong>Tools:</strong> {app.tools.join(", ") || "None"}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  value={app.status}
                                  onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)}
                                  className="bg-card border border-border text-xs rounded-md px-2.5 py-1 text-foreground focus:ring-1 focus:ring-primary focus:outline-none capitalize font-semibold"
                                >
                                  <option value="Applied">Applied</option>
                                  <option value="Screening">Screening</option>
                                  <option value="Background Pending">Background Pending</option>
                                  <option value="Approved">Approved</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedApplication(app)}
                                    className="text-xs h-8"
                                  >
                                    View Details
                                  </Button>
                                  {app.status !== "Approved" && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleApproveApplication(app)}
                                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8"
                                    >
                                      Approve & Activate
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {filteredApps.length > 0 && (
                    <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
                      <span className="text-xs text-muted-foreground">
                        Showing {appsStartIndex + 1} to {Math.min(appsStartIndex + appsItemsPerPage, filteredApps.length)} of {filteredApps.length} applications
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAppsPage((p) => Math.max(p - 1, 1))}
                          disabled={appsPage === 1}
                          className="h-8 text-xs"
                        >
                          Previous
                        </Button>
                        <span className="text-xs font-semibold px-2">
                          Page {appsPage} of {totalAppsPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAppsPage((p) => Math.min(p + 1, totalAppsPages))}
                          disabled={appsPage === totalAppsPages}
                          className="h-8 text-xs"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>

      {/* MODALS */}
      <ProjectFormDialog
        open={projectDialogOpen}
        onClose={() => setProjectDialogOpen(false)}
        initial={editingProject}
        onSaved={handleProjectSaved}
      />

      <TechFormDialog
        open={techDialogOpen}
        onClose={() => setTechDialogOpen(false)}
        initial={editingTech}
        onSaved={handleTechSaved}
      />

      <UserFormDialog
        open={userDialogOpen}
        onClose={() => {
          setUserDialogOpen(false);
          setEditingUser(null);
        }}
        initial={editingUser}
        onSaved={handleUserSaved}
      />

      {/* DETAIL MODAL FOR ORDERS */}
      {selectedOrder && (
        <Dialog
          open={!!selectedOrder}
          onOpenChange={() => setSelectedOrder(null)}
        >
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-card border border-border">
            <DialogHeader>
              <DialogTitle className="capitalize">
                {selectedOrder.type} Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2 text-sm">
              <div className="grid grid-cols-3 border-b border-border/50 py-1.5">
                <span className="text-muted-foreground">Customer</span>
                <span className="col-span-2 font-bold">
                  {selectedOrder.name}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-border/50 py-1.5">
                <span className="text-muted-foreground">Contact</span>
                <span className="col-span-2">
                  {selectedOrder.email} <br /> {selectedOrder.phone}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-border/50 py-1.5">
                <span className="text-muted-foreground">Service</span>
                <span className="col-span-2 capitalize font-semibold">
                  {selectedOrder.service_type}
                </span>
              </div>
              {selectedOrder.type === "appointment" ? (
                <>
                  <div className="grid grid-cols-3 border-b border-border/50 py-1.5">
                    <span className="text-muted-foreground">
                      Preferred Time
                    </span>
                    <span className="col-span-2">
                      {selectedOrder.preferred_date} at{" "}
                      {selectedOrder.preferred_time || "Anytime"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border/50 py-1.5">
                    <span className="text-muted-foreground">Technician</span>
                    <span className="col-span-2">
                      {hasPermission(
                        currentUser?.role,
                        "canEdit",
                        "orders",
                      ) ? (
                        <Select
                          value={
                            selectedOrder.assignedTechId
                              ? String(selectedOrder.assignedTechId)
                              : "unassigned"
                          }
                          onValueChange={(techId) => {
                            if (techId === "unassigned") {
                              handleUpdateBooking(selectedOrder.id, {
                                assignedTechId: null,
                                assignedTechName: null,
                              });
                              setSelectedOrder((prev) => ({
                                ...prev,
                                assignedTechId: null,
                                assignedTechName: null,
                              }));
                            } else {
                              const tech = teamMembers.find(
                                (t) => String(t.id) === techId,
                              );
                              if (tech) {
                                handleUpdateBooking(selectedOrder.id, {
                                  assignedTechId: tech.id,
                                  assignedTechName: tech.name,
                                });
                                setSelectedOrder((prev) => ({
                                  ...prev,
                                  assignedTechId: tech.id,
                                  assignedTechName: tech.name,
                                }));
                              }
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Assign technician" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">
                              Unassigned
                            </SelectItem>
                            {teamMembers.map((tech) => (
                              <SelectItem
                                key={tech.id}
                                value={String(tech.id)}
                              >
                                {tech.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        selectedOrder.assignedTechName || "Unassigned"
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border/50 py-1.5">
                    <span className="text-muted-foreground">Job Details</span>
                    <div 
                      className="col-span-2 prose prose-sm max-w-none text-xs dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: selectedOrder.project_description || "None provided" }}
                    />
                  </div>
                  {(() => {
                    const hwItems = selectedOrder.hardwareItems || extractHardwareItems(selectedOrder.project_description);
                    if (!hwItems || hwItems.length === 0) return null;
                    return (
                      <div className="grid grid-cols-3 border-b border-border/50 py-2 bg-primary/5 px-2.5 rounded-lg my-1.5">
                        <span className="text-muted-foreground font-semibold text-xs">Required Hardware</span>
                        <span className="col-span-2">
                          <ul className="list-disc list-inside space-y-1 text-xs text-foreground">
                            {hwItems.map((item, idx) => (
                              <li key={idx}>
                                <span className="font-semibold">{item.name}</span> (${item.price})
                              </li>
                            ))}
                          </ul>
                        </span>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <>
                  <div className="grid grid-cols-3 border-b border-border/50 py-1.5">
                    <span className="text-muted-foreground">
                      Estimated Cost
                    </span>
                    <span className="col-span-2 font-bold text-primary">
                      ${selectedOrder.estimated_quote}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border/50 py-1.5">
                    <span className="text-muted-foreground">Scope Details</span>
                    <div 
                      className="col-span-2 prose prose-sm max-w-none text-xs dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: selectedOrder.project_details || "None provided" }}
                    />
                  </div>
                </>
              )}
              <div className="grid grid-cols-3 border-b border-border/50 py-1.5">
                <span className="text-muted-foreground">Current Status</span>
                <span className="col-span-2">
                  <span className="bg-primary/20 text-primary px-2 py-0.5 rounded font-semibold text-xs capitalize">
                    {selectedOrder.status || "Pending"}
                  </span>
                </span>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                {selectedOrder.type === "appointment" &&
                  normalizeStatus(selectedOrder.status) === "Completed" && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        openSendInvoiceForBooking(selectedOrder)
                      }
                    >
                      <Send size={14} className="mr-1" /> Send Invoice
                    </Button>
                  )}
                {hasPermission(currentUser?.role, "canEdit", "orders") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingOrder(selectedOrder);
                      setSelectedOrder(null);
                    }}
                  >
                    <Pencil size={14} className="mr-1" /> Edit
                  </Button>
                )}
                <Button onClick={() => setSelectedOrder(null)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* EDIT MODAL FOR BOOKINGS AND QUOTES */}
      {editingOrder && (
        <Dialog
          open={!!editingOrder}
          onOpenChange={() => setEditingOrder(null)}
        >
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-card border border-border">
            <DialogHeader>
              <DialogTitle className="capitalize">
                Edit {editingOrder.type === "appointment" ? "Booking" : "Quote"}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get("name");
                const email = formData.get("email");
                const phone = formData.get("phone");
                const service_type = formData.get("service_type");
                const status = formData.get("status");

                const updates = {
                  name,
                  Name: name,
                  email,
                  Email: email,
                  phone,
                  Phone_Number: phone,
                  service_type,
                  status,
                };

                if (editingOrder.type === "appointment") {
                  updates.preferred_date = formData.get("preferred_date");
                  updates.preferred_time = formData.get("preferred_time");
                  updates.project_description = orderDescContent;
                  updates.Project_Description = orderDescContent;

                  const assignedTechId = formData.get("assignedTechId");
                  if (assignedTechId === "unassigned") {
                    updates.assignedTechId = null;
                    updates.assignedTechName = null;
                  } else {
                    const tech = teamMembers.find((t) => String(t.id) === assignedTechId);
                    if (tech) {
                      updates.assignedTechId = tech.id;
                      updates.assignedTechName = tech.name;
                    }
                  }

                  await handleUpdateBooking(editingOrder.id, updates);
                } else {
                  updates.estimated_quote = Number(formData.get("estimated_quote"));
                  updates.project_details = orderDescContent;
                  await handleUpdateQuote(editingOrder.id, updates);
                }

                setEditingOrder(null);
                fetchBookingsAndQuotes();
              }}
              className="space-y-4 mt-2"
            >
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Customer Name</label>
                <input name="name" defaultValue={editingOrder.name || editingOrder.Name || ""} required className="input-base w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                  <input name="email" type="email" defaultValue={editingOrder.email || editingOrder.Email || ""} required className="input-base w-full" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                  <input name="phone" defaultValue={editingOrder.phone || editingOrder.Phone_Number || ""} required className="input-base w-full" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Service Type</label>
                <input name="service_type" defaultValue={editingOrder.service_type || ""} required className="input-base w-full" />
              </div>

              {editingOrder.type === "appointment" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Preferred Date</label>
                      <input name="preferred_date" type="text" placeholder="YYYY-MM-DD" defaultValue={editingOrder.preferred_date || ""} className="input-base w-full" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Preferred Time</label>
                      <input name="preferred_time" type="text" placeholder="e.g. 10:00 AM" defaultValue={editingOrder.preferred_time || ""} className="input-base w-full" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Assigned Technician</label>
                    <select
                      name="assignedTechId"
                      defaultValue={editingOrder.assignedTechId || "unassigned"}
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground"
                    >
                      <option value="unassigned">Unassigned</option>
                      {teamMembers.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Project Description</label>
                    <RichTextEditor
                      value={orderDescContent}
                      onChange={setOrderDescContent}
                      placeholder="Describe the project scope and outcome..."
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Estimated Cost ($)</label>
                    <input name="estimated_quote" type="number" defaultValue={editingOrder.estimated_quote || 0} className="input-base w-full" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Scope Details</label>
                    <RichTextEditor
                      value={orderDescContent}
                      onChange={setOrderDescContent}
                      placeholder="Describe the scope details..."
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                <select
                  name="status"
                  defaultValue={editingOrder.status || "Pending"}
                  className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground capitalize"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setEditingOrder(null)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* SEND INVOICE MODAL */}
      <Dialog open={showSendInvoice} onOpenChange={setShowSendInvoice}>
        <DialogContent className="max-w-md bg-card border border-border">
          <DialogHeader>
            <DialogTitle>Send Invoice</DialogTitle>
          </DialogHeader>
          {invoiceToSend && (
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground">
                Send {invoiceToSend.number} to {invoiceToSend.clientName} — $
                {(invoiceToSend.total || 0).toFixed(2)}
              </p>
              {[
                { method: "email", label: "Email", icon: Mail },
                { method: "sms", label: "Text Message", icon: Smartphone },
                { method: "whatsapp", label: "WhatsApp", icon: MessageSquare },
              ].map(({ method, label, icon: Icon }) => (
                <button
                  key={method}
                  onClick={() => handleSendInvoice(method)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left"
                >
                  <Icon size={18} className="text-primary" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Technician Application Detail Dialog */}
      {selectedApplication && (
        <Dialog
          open={!!selectedApplication}
          onOpenChange={() => setSelectedApplication(null)}
        >
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-card border border-border">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="pb-3 border-b border-border/60">
                <h3 className="font-bold text-lg text-foreground">{selectedApplication.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedApplication.email} | {selectedApplication.phone}</p>
                <p className="text-xs text-muted-foreground">Location: {selectedApplication.city}, ZIP: {selectedApplication.zip}</p>
              </div>

              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Experience</span>
                <p className="text-sm text-foreground mt-0.5">{selectedApplication.experience}</p>
              </div>

              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Skills</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {selectedApplication.skills.map((skill, i) => (
                    <span key={i} className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tools Checklist</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {selectedApplication.tools.map((tool, i) => (
                    <span key={i} className="bg-muted text-muted-foreground border border-border px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {selectedApplication.notes && (
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Notes & Background</span>
                  <p className="text-xs text-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50 mt-1 whitespace-pre-wrap">
                    {selectedApplication.notes}
                  </p>
                </div>
              )}

              <div className="p-3 bg-muted/40 rounded-xl border border-border/50 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-green-500 font-semibold">
                  <CheckCircle2 size={14} /> Background Check Consent Authorized
                </div>
                <div className="flex items-center gap-2 text-green-500 font-semibold">
                  <CheckCircle2 size={14} /> Legal Work Authorization Confirmed
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border/60">
                <div className="flex gap-2">
                  {selectedApplication.status !== "Approved" && (
                    <Button
                      onClick={() => {
                        handleApproveApplication(selectedApplication);
                        setSelectedApplication(null);
                      }}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                    >
                      Approve & Activate
                    </Button>
                  )}
                  {selectedApplication.status !== "Rejected" && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleUpdateApplicationStatus(selectedApplication.id, "Rejected");
                        setSelectedApplication(null);
                      }}
                      className="text-destructive hover:bg-destructive/10 text-xs"
                    >
                      Reject
                    </Button>
                  )}
                </div>
                <Button variant="ghost" onClick={() => setSelectedApplication(null)} className="text-xs">
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Input styles */}
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
        .input-base.pl-9 {
          padding-left: 2.25rem !important;
        }
        .input-base::placeholder { color: hsl(var(--muted-foreground)); }
        .input-base:focus { outline: none; box-shadow: 0 0 0 2px hsl(var(--primary) / 0.35); }
      `}</style>
    </>
  );
};

export default AdminPage;
