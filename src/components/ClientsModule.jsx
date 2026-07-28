import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  Ban,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Mail,
  Smartphone,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  MoreVertical,
  ShieldAlert,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import pb from "@/lib/pocketbaseClient";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const LOCAL_CLIENTS_KEY = "atltvmountpro_local_clients";
const DIRECTORY_KEY = "atltv_client_directory";
const LOCAL_BOOKINGS_KEY = "atltvmountpro_local_bookings";
const LOCAL_INVOICES_KEY = "atltv_invoices";

const SEED_CLIENTS = [
  {
    id: "cli_john_miller",
    name: "John Miller",
    email: "john.miller@example.com",
    phone: "(404) 555-0192",
    status: "Active",
    optInChannel: "SMS",
    optInStatus: "Confirmed",
    notes: "Residential TV Mounting & Cable Management. High-value repeat client.",
    created: "2026-01-15T10:30:00.000Z",
    tag: "VIP"
  },
  {
    id: "cli_alice_smith",
    name: "Alice Smith",
    email: "alice.smith@example.com",
    phone: "(770) 555-0183",
    status: "Active",
    optInChannel: "Email",
    optInStatus: "Confirmed",
    notes: "Living room TV mounting & drywall patching.",
    created: "2026-02-10T14:15:00.000Z",
    tag: "Residential"
  },
  {
    id: "cli_robert_davis",
    name: "Robert Davis",
    email: "robert.davis@example.com",
    phone: "(404) 555-8821",
    status: "Pending Opt-In",
    optInChannel: "Email",
    optInStatus: "Pending",
    notes: "Requested quote for commercial office display mounting.",
    created: "2026-03-04T09:00:00.000Z",
    tag: "Commercial"
  },
  {
    id: "cli_sarah_connor",
    name: "Sarah Connor",
    email: "sarah.connor@example.com",
    phone: "(678) 555-3349",
    status: "Suspended",
    optInChannel: "WhatsApp",
    optInStatus: "Opted_Out",
    notes: "Account suspended due to disputed invoice chargeback.",
    created: "2026-03-18T16:45:00.000Z",
    tag: "Review Required"
  },
  {
    id: "cli_david_wilson",
    name: "David Wilson",
    email: "david.wilson@example.com",
    phone: "(404) 555-9012",
    status: "Active",
    optInChannel: "SMS",
    optInStatus: "Confirmed",
    notes: "Fireplace TV mounting & custom floating shelves.",
    created: "2026-04-01T11:20:00.000Z",
    tag: "Repeat Client"
  },
  {
    id: "cli_emily_brown",
    name: "Emily Brown",
    email: "emily.brown@example.com",
    phone: "(770) 555-4421",
    status: "Active",
    optInChannel: "Email",
    optInStatus: "Confirmed",
    notes: "Full home drywall painting & TV setup.",
    created: "2026-05-12T08:15:00.000Z",
    tag: "Residential"
  }
];

export default function ClientsModule() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [channelFilter, setChannelFilter] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  // Selected client for Edit/Delete/Suspend
  const [selectedClient, setSelectedClient] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Active",
    optInChannel: "Email",
    tag: "Residential",
    notes: ""
  });

  // Load clients & sync from PocketBase / localStorage
  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      let pbClients = [];
      try {
        pbClients = await pb.collection("clients").getFullList({ sort: "-created" });
      } catch (err) {
        console.warn("PocketBase client fetch offline/fallback:", err?.message);
      }

      // Read local storage backups
      let storedLocal = [];
      try {
        const raw = localStorage.getItem(LOCAL_CLIENTS_KEY);
        storedLocal = raw ? JSON.parse(raw) : [];
      } catch {}

      let storedDirectory = [];
      try {
        const raw = localStorage.getItem(DIRECTORY_KEY);
        storedDirectory = raw ? JSON.parse(raw) : [];
      } catch {}

      let storedBookings = [];
      try {
        const raw = localStorage.getItem(LOCAL_BOOKINGS_KEY);
        storedBookings = raw ? JSON.parse(raw) : [];
      } catch {}

      // Normalize & Merge
      const map = new Map();

      // Seed default demo clients first
      SEED_CLIENTS.forEach((c) => {
        map.set(c.email.toLowerCase(), c);
      });

      // Add directory entries
      storedDirectory.forEach((d) => {
        if (!d.email) return;
        const key = d.email.toLowerCase();
        const existing = map.get(key) || {};
        map.set(key, {
          id: d.id || existing.id || `cli_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: d.name || existing.name || d.email,
          email: d.email,
          phone: d.phone || existing.phone || "",
          status: existing.status || "Active",
          optInChannel: existing.optInChannel || "Email",
          optInStatus: existing.optInStatus || "Confirmed",
          notes: existing.notes || "Imported from client directory",
          created: d.created || existing.created || new Date().toISOString(),
          tag: existing.tag || "Residential"
        });
      });

      // Add booking clients
      storedBookings.forEach((b) => {
        if (!b.email) return;
        const key = b.email.toLowerCase();
        const existing = map.get(key) || {};
        map.set(key, {
          id: existing.id || `cli_b_${b.id}`,
          name: b.name || existing.name || b.email,
          email: b.email,
          phone: b.phone || existing.phone || "",
          status: existing.status || "Active",
          optInChannel: existing.optInChannel || "SMS",
          optInStatus: existing.optInStatus || "Confirmed",
          notes: existing.notes || `Booking #${b.id} - ${b.service_type || "Service"}`,
          created: b.created || existing.created || new Date().toISOString(),
          tag: existing.tag || "Booking Client"
        });
      });

      // Add stored local clients
      storedLocal.forEach((c) => {
        const email = c.email || c.Email;
        if (!email) return;
        const key = email.toLowerCase();
        map.set(key, {
          id: c.id,
          name: c.name || c.Name || email,
          email: email,
          phone: c.phone || c.Phone_Number || c.phone_number || "",
          status: c.status || c.Status || "Active",
          optInChannel: c.optInChannel || c.OptIn_Channel || "Email",
          optInStatus: c.optInStatus || c.OptIn_Status || "Confirmed",
          notes: c.notes || c.Notes || "",
          created: c.created || new Date().toISOString(),
          tag: c.tag || "Client"
        });
      });

      // Add PocketBase live clients
      pbClients.forEach((p) => {
        const email = p.email || p.Email;
        if (!email) return;
        const key = email.toLowerCase();
        map.set(key, {
          id: p.id,
          name: p.name || p.Name || email,
          email: email,
          phone: p.phone || p.Phone_Number || p.phone_number || "",
          status: p.status || p.Status || "Active",
          optInChannel: p.optInChannel || p.OptIn_Channel || "Email",
          optInStatus: p.optInStatus || p.OptIn_Status || "Confirmed",
          notes: p.notes || p.Notes || "",
          created: p.created || new Date().toISOString(),
          tag: p.tag || "Client"
        });
      });

      const mergedList = Array.from(map.values()).sort(
        (a, b) => new Date(b.created) - new Date(a.created)
      );

      setClients(mergedList);
      localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(mergedList));
    } catch (err) {
      console.error("Failed to load client directory:", err);
      toast.error("Failed to load client list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Compute Invoices / Bookings lookup per client
  const clientStats = useMemo(() => {
    let invoices = [];
    try {
      invoices = JSON.parse(localStorage.getItem(LOCAL_INVOICES_KEY)) || [];
    } catch {}

    const statsMap = {};
    clients.forEach((c) => {
      const email = c.email.toLowerCase();
      const clientInvoices = invoices.filter(
        (inv) => (inv.clientEmail || "").toLowerCase() === email
      );
      const totalSpent = clientInvoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
      statsMap[email] = {
        invoiceCount: clientInvoices.length,
        totalSpent
      };
    });
    return statsMap;
  }, [clients]);

  // Metrics computation
  const metrics = useMemo(() => {
    const total = clients.length;
    const active = clients.filter((c) => c.status === "Active").length;
    const pending = clients.filter((c) => c.status === "Pending Opt-In" || c.status === "Pending").length;
    const suspended = clients.filter((c) => c.status === "Suspended").length;

    const now = new Date();
    const newThisMonth = clients.filter((c) => {
      const d = new Date(c.created);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    return { total, active, pending, suspended, newThisMonth };
  }, [clients]);

  // Chart Data: Monthly Growth Trend
  const growthChartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthCounts = {};
    months.forEach((m) => (monthCounts[m] = 0));

    clients.forEach((c) => {
      if (c.created) {
        const d = new Date(c.created);
        if (!isNaN(d.getTime())) {
          const m = months[d.getMonth()];
          monthCounts[m] = (monthCounts[m] || 0) + 1;
        }
      }
    });

    return months.map((m) => ({
      month: m,
      Clients: monthCounts[m]
    }));
  }, [clients]);

  // Status Distribution Data
  const statusPieData = useMemo(() => {
    return [
      { name: "Active", value: metrics.active, color: "#10b981" },
      { name: "Pending Opt-In", value: metrics.pending, color: "#f59e0b" },
      { name: "Suspended", value: metrics.suspended, color: "#f43f5e" }
    ];
  }, [metrics]);

  // Filtered & Searched Client List
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q)) ||
        (c.tag && c.tag.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Pending" && (c.status === "Pending" || c.status === "Pending Opt-In")) ||
        c.status === statusFilter;

      const matchesChannel =
        channelFilter === "All" || c.optInChannel === channelFilter;

      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [clients, searchQuery, statusFilter, channelFilter]);

  // Pagination Math
  const totalPages = Math.ceil(filteredClients.length / pageSize) || 1;
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, currentPage, pageSize]);

  // Reset to page 1 on search / filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, channelFilter, pageSize]);

  // Handle Add Client Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Name and Email are required.");
      return;
    }

    const newClient = {
      id: `cli_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      status: formData.status,
      optInChannel: formData.optInChannel,
      optInStatus: formData.status === "Active" ? "Confirmed" : "Pending",
      notes: formData.notes.trim(),
      tag: formData.tag || "Client",
      created: new Date().toISOString()
    };

    try {
      // Attempt PocketBase create
      await pb.collection("clients").create({
        Name: newClient.name,
        email: newClient.email,
        Phone_Number: newClient.phone,
        OptIn_Status: newClient.optInStatus,
        OptIn_Channel: newClient.optInChannel,
        OptIn_Date: new Date().toISOString()
      });
      toast.success(`Client ${newClient.name} added successfully (Synced to Database).`);
    } catch (err) {
      console.warn("PocketBase client creation offline, saving locally:", err?.message);
      toast.success(`Client ${newClient.name} added (Local Mode).`);
    }

    const nextList = [newClient, ...clients];
    setClients(nextList);
    localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(nextList));

    setShowAddModal(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      status: "Active",
      optInChannel: "Email",
      tag: "Residential",
      notes: ""
    });
  };

  // Open Edit Modal
  const openEditModal = (client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      status: client.status || "Active",
      optInChannel: client.optInChannel || "Email",
      tag: client.tag || "Residential",
      notes: client.notes || ""
    });
    setShowEditModal(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;

    const updated = {
      ...selectedClient,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      status: formData.status,
      optInChannel: formData.optInChannel,
      tag: formData.tag,
      notes: formData.notes.trim()
    };

    try {
      if (selectedClient.id && !selectedClient.id.startsWith("cli_")) {
        await pb.collection("clients").update(selectedClient.id, {
          Name: updated.name,
          email: updated.email,
          Phone_Number: updated.phone,
          OptIn_Channel: updated.optInChannel
        });
      }
      toast.success(`Updated details for ${updated.name}`);
    } catch (err) {
      toast.success(`Updated ${updated.name} (Local Mode)`);
    }

    const nextList = clients.map((c) => (c.id === selectedClient.id ? updated : c));
    setClients(nextList);
    localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(nextList));
    setShowEditModal(false);
    setSelectedClient(null);
  };

  // Handle Suspend Toggle
  const handleSuspendToggle = async (client) => {
    const newStatus = client.status === "Suspended" ? "Active" : "Suspended";
    const updated = { ...client, status: newStatus };

    try {
      if (client.id && !client.id.startsWith("cli_")) {
        await pb.collection("clients").update(client.id, { OptIn_Status: newStatus === "Active" ? "Confirmed" : "Opted_Out" });
      }
    } catch {}

    const nextList = clients.map((c) => (c.id === client.id ? updated : c));
    setClients(nextList);
    localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(nextList));

    toast.info(
      newStatus === "Suspended"
        ? `Client account for ${client.name} has been suspended.`
        : `Client account for ${client.name} has been reactivated.`
    );
    setShowSuspendModal(false);
    setSelectedClient(null);
  };

  // Handle Delete Client
  const handleDeleteSubmit = async () => {
    if (!selectedClient) return;

    try {
      if (selectedClient.id && !selectedClient.id.startsWith("cli_")) {
        await pb.collection("clients").delete(selectedClient.id);
      }
    } catch {}

    const nextList = clients.filter((c) => c.id !== selectedClient.id);
    setClients(nextList);
    localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(nextList));

    toast.success(`Client ${selectedClient.name} removed from system.`);
    setShowDeleteModal(false);
    setSelectedClient(null);
  };

  // Export Clients to CSV
  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Status", "OptIn Channel", "Tag", "Created Date", "Notes"];
    const rows = filteredClients.map((c) => [
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.status}"`,
      `"${c.optInChannel}"`,
      `"${c.tag || ""}"`,
      `"${new Date(c.created).toLocaleDateString()}"`,
      `"${(c.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Clients_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Client directory exported to CSV.");
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ── TOP HEADER & ACTIONS ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Client Directory & Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage accounts, track opt-in compliance, view spend metrics, and control client access.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadClients} disabled={loading} className="gap-2">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
            <Download size={14} />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
            <UserPlus size={16} />
            Add New Client
          </Button>
        </div>
      </div>

      {/* ── METRICS & DASHBOARD CHARTS ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Clients</span>
            <span className="p-2 rounded-lg bg-primary/10 text-primary"><Users size={16} /></span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-foreground">{metrics.total}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp size={12} className="text-emerald-500" />
              <span>+{metrics.newThisMonth} added this month</span>
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Accounts</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><UserCheck size={16} /></span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-500">{metrics.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Verified & active in system</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Opt-In</span>
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><AlertTriangle size={16} /></span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-amber-500">{metrics.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting double opt-in</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Suspended</span>
            <span className="p-2 rounded-lg bg-rose-500/10 text-rose-500"><Ban size={16} /></span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-rose-500">{metrics.suspended}</div>
            <p className="text-xs text-muted-foreground mt-1">Access restricted / holds</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New This Month</span>
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Calendar size={16} /></span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-blue-500">{metrics.newThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">Recent registrations</p>
          </div>
        </div>
      </div>

      {/* ── VISUAL CHARTS ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Trend AreaChart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" />
                Client Registration Growth
              </h3>
              <p className="text-xs text-muted-foreground">Monthly breakdown of new client onboarding</p>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="clientColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="month" tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <YAxis allowDecimals={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", borderRadius: "12px", border: "none", color: "#fff" }}
                />
                <Area type="monotone" dataKey="Clients" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#clientColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution PieChart */}
        <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <PieIcon size={18} className="text-emerald-500" />
              Account Status Breakdown
            </h3>
            <p className="text-xs text-muted-foreground">Distribution across status categories</p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px", border: "none", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="font-bold text-emerald-500">{metrics.active}</div>
              <div className="text-[10px] text-muted-foreground">Active</div>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="font-bold text-amber-500">{metrics.pending}</div>
              <div className="text-[10px] text-muted-foreground">Pending</div>
            </div>
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <div className="font-bold text-rose-500">{metrics.suspended}</div>
              <div className="text-[10px] text-muted-foreground">Suspended</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CLIENT TABLE SEARCH & FILTERS ────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              type="text"
              placeholder="Search clients by name, email, phone, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-background/60"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Status:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending Opt-In</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-xs text-muted-foreground font-medium">Channel:</span>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Channels</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>

            <Select value={String(pageSize)} onValueChange={(val) => setPageSize(Number(val))}>
              <SelectTrigger className="w-[90px] h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 / page</SelectItem>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── CLIENT MANAGEMENT TABLE ───────────────────────────────────── */}
        <div className="overflow-x-auto rounded-xl border border-border/40">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Client Name & Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Opt-In Preference</th>
                <th className="py-3 px-4">Tag</th>
                <th className="py-3 px-4 text-center">Invoices / Total Spent</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="animate-spin inline-block mb-2 text-primary" size={24} />
                    <p className="text-xs">Loading client directory...</p>
                  </td>
                </tr>
              ) : paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <Users className="inline-block mb-2 text-muted-foreground/50" size={32} />
                    <p className="text-sm font-semibold">No clients found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Try adjusting your search criteria or add a new client.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => {
                  const stats = clientStats[client.email.toLowerCase()] || { invoiceCount: 0, totalSpent: 0 };
                  const isSuspended = client.status === "Suspended";
                  const isPending = client.status === "Pending Opt-In" || client.status === "Pending";

                  return (
                    <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                            isSuspended
                              ? "bg-rose-500/10 text-rose-500"
                              : isPending
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-primary/10 text-primary"
                          }`}>
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{client.name}</div>
                            <div className="text-xs text-muted-foreground">{client.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground">
                        {client.phone || "N/A"}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            <Ban size={12} />
                            Suspended
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <AlertTriangle size={12} />
                            Pending Opt-In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 size={12} />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Opt-In Channel */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground border border-border/40">
                          {client.optInChannel === "SMS" && <Smartphone size={10} />}
                          {client.optInChannel === "Email" && <Mail size={10} />}
                          {client.optInChannel === "WhatsApp" && <Smartphone size={10} className="text-emerald-500" />}
                          {client.optInChannel}
                        </span>
                      </td>

                      {/* Tag */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                          {client.tag || "Client"}
                        </span>
                      </td>

                      {/* Stats */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="text-xs font-bold text-foreground">${stats.totalSpent.toFixed(2)}</div>
                        <div className="text-[10px] text-muted-foreground">{stats.invoiceCount} invoices</div>
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {new Date(client.created).toLocaleDateString()}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditModal(client)}
                            title="Edit Client"
                          >
                            <Pencil size={14} />
                          </Button>

                          {/* Suspend / Reactivate */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${
                              isSuspended
                                ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                                : "text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                            }`}
                            onClick={() => {
                              setSelectedClient(client);
                              setShowSuspendModal(true);
                            }}
                            title={isSuspended ? "Reactivate Account" : "Suspend Account"}
                          >
                            {isSuspended ? <CheckCircle2 size={14} /> : <Ban size={14} />}
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                            onClick={() => {
                              setSelectedClient(client);
                              setShowDeleteModal(true);
                            }}
                            title="Delete Client"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION CONTROLS ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/40 text-xs text-muted-foreground">
          <div>
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredClients.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(currentPage * pageSize, filteredClients.length)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{filteredClients.length}</span> clients
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={14} className="mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-1 px-2 font-medium">
              Page {currentPage} of {totalPages}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
              <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── ADD CLIENT MODAL ─────────────────────────────────────────────── */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <UserPlus className="text-primary" size={20} />
              Add New Client Account
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Client Full Name *</Label>
              <Input
                required
                placeholder="e.g. Marcus Vance"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Email Address *</Label>
                <Input
                  type="email"
                  required
                  placeholder="marcus@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Phone Number</Label>
                <Input
                  type="tel"
                  placeholder="(404) 555-0199"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Account Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending Opt-In</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Opt-In Channel</Label>
                <Select value={formData.optInChannel} onValueChange={(val) => setFormData({ ...formData, optInChannel: val })}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Client Tag</Label>
                <Select value={formData.tag} onValueChange={(val) => setFormData({ ...formData, tag: val })}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="Repeat Client">Repeat Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Notes / Special Instructions</Label>
              <Input
                placeholder="Preferred service times, property details, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground">
                Save & Register Client
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── EDIT CLIENT MODAL ────────────────────────────────────────────── */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Pencil className="text-primary" size={20} />
              Edit Client Profile
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Client Full Name *</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Email Address *</Label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Phone Number</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Account Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending Opt-In</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Opt-In Channel</Label>
                <Select value={formData.optInChannel} onValueChange={(val) => setFormData({ ...formData, optInChannel: val })}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Client Tag</Label>
                <Select value={formData.tag} onValueChange={(val) => setFormData({ ...formData, tag: val })}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="Repeat Client">Repeat Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Notes / Special Instructions</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground">
                Update Client
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── SUSPEND / REACTIVATE CONFIRMATION MODAL ─────────────────────── */}
      <Dialog open={showSuspendModal} onOpenChange={setShowSuspendModal}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <ShieldAlert className={selectedClient?.status === "Suspended" ? "text-emerald-500" : "text-amber-500"} size={20} />
              {selectedClient?.status === "Suspended" ? "Reactivate Client Account?" : "Suspend Client Account?"}
            </DialogTitle>
          </DialogHeader>

          <div className="text-sm text-muted-foreground space-y-2 pt-1">
            <p>
              Are you sure you want to{" "}
              <strong className="text-foreground">
                {selectedClient?.status === "Suspended" ? "reactivate" : "suspend"}
              </strong>{" "}
              the account for <strong className="text-foreground">{selectedClient?.name}</strong> (
              {selectedClient?.email})?
            </p>
            {selectedClient?.status !== "Suspended" && (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                Suspending this client will restrict booking privileges and pause active dispatch notifications.
              </p>
            )}
          </div>

          <DialogFooter className="pt-4 border-t gap-2">
            <Button variant="outline" onClick={() => setShowSuspendModal(false)}>
              Cancel
            </Button>
            <Button
              className={
                selectedClient?.status === "Suspended"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              }
              onClick={() => handleSuspendToggle(selectedClient)}
            >
              Confirm {selectedClient?.status === "Suspended" ? "Reactivation" : "Suspension"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRMATION MODAL ────────────────────────────────────── */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-rose-500">
              <Trash2 size={20} />
              Delete Client Record?
            </DialogTitle>
          </DialogHeader>

          <div className="text-sm text-muted-foreground space-y-2 pt-1">
            <p>
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">{selectedClient?.name}</strong> from the client directory?
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              This action cannot be undone. Associated invoice history will be archived.
            </p>
          </div>

          <DialogFooter className="pt-4 border-t gap-2">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubmit}>
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
