import React, { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import pb from "@/lib/pocketbaseClient";
import CMSEditor from "@/components/CMSEditor";
import FinanceModule from "@/components/FinanceModule";

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
};

// ── Permission constants ──────────────────────────────────────────────────────
const ROLES = {
  Admin: "Admin",
  Moderator: "Moderator",
  Viewer: "Viewer",
};

const PERMISSIONS = {
  [ROLES.Admin]: {
    canView: ["projects", "orders", "team", "profile", "cms", "finance"],
    canEdit: [
      "projects",
      "orders",
      "team",
      "profile",
      "cms",
      "users",
      "finance",
    ],
    canDelete: [
      "projects",
      "orders",
      "team",
      "profile",
      "cms",
      "users",
      "finance",
    ],
  },
  [ROLES.Moderator]: {
    canView: ["projects", "orders", "team", "profile", "finance"],
    canEdit: ["projects", "orders", "team", "finance"],
    canDelete: ["projects", "orders", "team"],
  },
  [ROLES.Viewer]: {
    canView: ["projects", "orders", "team", "profile", "finance"],
    canEdit: [],
    canDelete: [],
  },
};

function hasPermission(role, action, resource) {
  if (!role || !PERMISSIONS[role]) return false;
  return PERMISSIONS[role][action]?.includes(resource) ?? false;
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
          alt="ATL TV Mount PRO"
          className="h-10 mx-auto mb-6"
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
            <textarea
              value={form.description}
              onChange={(e) => field("description", e.target.value)}
              rows={4}
              className="input-base w-full resize-none"
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

          <div>
            <label className="text-sm font-medium mb-1.5 block text-foreground">
              Thumbnail URL
            </label>
            <input
              value={form.thumbnail}
              onChange={(e) => field("thumbnail", e.target.value)}
              className="input-base w-full"
              placeholder="https://… or /images/projects/project-1/main.jpg"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block text-foreground">
              Carousel Images
            </label>
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
      <DialogContent className="max-w-md bg-card border border-border">
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
          <div>
            <label className="text-sm font-medium mb-1 block">Photo URL</label>
            <input
              value={form.photo}
              onChange={(e) => setForm({ ...form, photo: e.target.value })}
              className="input-base w-full"
              placeholder="e.g. https://images.unsplash.com/photo-..."
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Bio *</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              required
              rows={3}
              className="input-base w-full resize-none"
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
const UserFormDialog = ({ open, onClose, onSaved }) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "Admin",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        passwordConfirm: form.password,
        role: form.role,
      };
      const savedUser = await pb.collection("users").create(payload);
      onSaved(savedUser);
      onClose();
      toast.success("Admin user created successfully.");
    } catch (err) {
      console.warn("PocketBase user creation failed, saving locally:", err);
      const mockUser = {
        id: "local_" + Math.random().toString(36).substr(2, 9),
        username: form.username,
        email: form.email,
        role: form.role,
        created: new Date().toISOString(),
      };
      onSaved(mockUser);
      onClose();
      toast.success("User created locally.");
    } finally {
      setSaving(false);
      setForm({ username: "", email: "", password: "", role: "Admin" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md bg-card border border-border">
        <DialogHeader>
          <DialogTitle>Add Admin User</DialogTitle>
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
            <label className="text-sm font-medium mb-1 block">Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
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
                <Plus size={14} className="mr-1.5" />
              )}
              Create User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ── Main Admin Panel ──────────────────────────────────────────────────────────
const AdminPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");

  // Sidebar navigation toggler for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Projects state
  const [projects, setProjects] = useState([]);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);

  // Orders / Bookings state
  const [ordersTab, setOrdersTab] = useState("appointments");
  const [bookings, setBookings] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Team state
  const [teamMembers, setTeamMembers] = useState([]);
  const [techDialogOpen, setTechDialogOpen] = useState(false);
  const [editingTech, setEditingTech] = useState(null);

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

  // --- Fetch methods ---

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        setProjects(await res.json());
      }
    } catch {
      // Load fallback projects if server offline
      setProjects([]);
    }
    setLoading(false);
  }, []);

  const fetchBookingsAndQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const appts = await pb
        .collection("appointment_bookings")
        .getFullList({ sort: "-created" });
      setBookings(appts);
      localStorage.setItem(LOCAL_BOOKINGS_STORAGE, JSON.stringify(appts));
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
            ],
      );
    }
  }, []);

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
        const allowedRoles = [ROLES.Admin, ROLES.Moderator];

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

  // Load specific tab data
  useEffect(() => {
    if (!authed) return;
    if (activeTab === "projects") fetchProjects();
    if (activeTab === "orders") fetchBookingsAndQuotes();
    if (activeTab === "team") fetchTeam();
    if (activeTab === "profile") fetchUsers();
  }, [
    activeTab,
    authed,
    fetchProjects,
    fetchBookingsAndQuotes,
    fetchTeam,
    fetchUsers,
  ]);

  const handleLogin = (user) => {
    const allowedRoles = [ROLES.Admin, ROLES.Moderator];

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
    setProjects((prev) =>
      isUpdate
        ? prev.map((p) => (p.id === saved.id ? saved : p))
        : [saved, ...prev],
    );
  };

  const handleProjectDelete = async (id) => {
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
  const handleUpdateStatus = async (collection, id, status) => {
    try {
      await pb.collection(collection).update(id, { status });
      toast.success("Status updated.");
      fetchBookingsAndQuotes();
    } catch (err) {
      console.warn("PocketBase update failed, updating locally:", err);
      if (collection === "appointment_bookings") {
        const updated = bookings.map((b) =>
          b.id === id ? { ...b, status } : b,
        );
        setBookings(updated);
        localStorage.setItem(LOCAL_BOOKINGS_STORAGE, JSON.stringify(updated));
      } else {
        const updated = quotes.map((q) => (q.id === id ? { ...q, status } : q));
        setQuotes(updated);
        localStorage.setItem(LOCAL_QUOTES_STORAGE, JSON.stringify(updated));
      }
      toast.success("Status updated locally.");
    }
  };

  const handleDeleteOrder = async (collection, id) => {
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
    const updatedList = isUpdate
      ? teamMembers.map((t) => (t.id === saved.id ? saved : t))
      : [...teamMembers, saved];
    setTeamMembers(updatedList);
    localStorage.setItem(LOCAL_TEAM_STORAGE, JSON.stringify(updatedList));
  };

  const handleDeleteTech = async (id) => {
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
  const handleUserSaved = (saved) => {
    const updated = [...users, saved];
    setUsers(updated);
    localStorage.setItem(LOCAL_USERS_STORAGE, JSON.stringify(updated));
  };

  const handleDeleteUser = async (id) => {
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

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setIsEditingProfile(false);
    toast.success("Profile updated.");
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

  return (
    <>
      <Helmet>
        <title>Admin Dashboard — ATL TV Mount PRO</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        {/* MOBILE HEADER */}
        <header className="md:hidden sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/images/logo/logo.png"
              alt="ATL TV Mount PRO"
              className="h-6"
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
          <div className="p-5 flex-1 flex flex-col">
            {/* Sidebar Branding */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <img
                  src="/images/logo/logo.png"
                  alt="ATL TV Mount PRO"
                  className="h-7"
                />
                <span className="text-[10px] uppercase tracking-wider font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  Pro
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Menu Links with Flat Icons */}
            <nav className="space-y-1.5 flex-1">
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

              {hasPermission(currentUser?.role, "canView", "profile") && (
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

              {hasPermission(currentUser?.role, "canView", "finance") && (
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

              {hasPermission(currentUser?.role, "canView", "cms") && (
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
        <main className="flex-1 min-h-screen px-4 sm:px-6 lg:px-8 py-8 md:py-10 max-w-[1200px] w-full">
          {currentUser?.role === ROLES.Viewer && (
            <div className="mb-4 flex items-center gap-2 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded-lg px-4 py-2.5 text-sm">
              <Lock size={14} />
              <span>
                You are viewing in <strong>read-only mode</strong>. Contact an
                administrator for editing access.
              </span>
            </div>
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
                          <th className="text-right px-4 py-3 font-semibold text-muted-foreground w-24">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((project, i) => (
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
              </div>

              {/* Data tables */}
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
                getFilteredBookings().length === 0 ? (
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
                              Status
                            </th>
                            <th className="text-right px-4 py-3 font-semibold text-muted-foreground w-36">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredBookings().map((b) => (
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
                  </div>
                )
              ) : getFilteredQuotes().length === 0 ? (
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
                        {getFilteredQuotes().map((q) => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teamMembers.map((tech) => (
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
                          <th className="px-4 py-2.5">Created</th>
                          <th className="px-4 py-2.5 text-right w-16">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
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
                            <td className="px-4 py-3 text-muted-foreground">
                              {new Date(u.created).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {hasPermission(
                                currentUser?.role,
                                "canDelete",
                                "users",
                              ) && (
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="text-muted-foreground hover:text-destructive p-1 rounded-md"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: FINANCE */}
          {activeTab === "finance" && <FinanceModule />}

          {/* TAB CONTENT: CMS */}
          {activeTab === "cms" && <CMSEditor />}
        </main>
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
        onClose={() => setUserDialogOpen(false)}
        onSaved={handleUserSaved}
      />

      {/* DETAIL MODAL FOR ORDERS */}
      {selectedOrder && (
        <Dialog
          open={!!selectedOrder}
          onOpenChange={() => setSelectedOrder(null)}
        >
          <DialogContent className="max-w-md bg-card border border-border">
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
                    <span className="text-muted-foreground">Job Details</span>
                    <span className="col-span-2 whitespace-pre-wrap">
                      {selectedOrder.project_description || "None provided"}
                    </span>
                  </div>
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
                    <span className="col-span-2 whitespace-pre-wrap">
                      {selectedOrder.project_details || "None provided"}
                    </span>
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
              <div className="flex justify-end pt-3">
                <Button onClick={() => setSelectedOrder(null)}>Close</Button>
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
        .input-base::placeholder { color: hsl(var(--muted-foreground)); }
        .input-base:focus { outline: none; box-shadow: 0 0 0 2px hsl(var(--primary) / 0.35); }
      `}</style>
    </>
  );
};

export default AdminPage;
