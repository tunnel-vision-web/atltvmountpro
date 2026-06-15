import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Filter, 
  Mail, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Send, 
  History, 
  User, 
  Users, 
  Check, 
  X, 
  ChevronRight, 
  Plus, 
  RefreshCw, 
  FileText, 
  Trash2,
  ExternalLink,
  MessageSquare,
  Loader2,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import pb from "@/lib/pocketbaseClient";
import RichTextEditor from "./RichTextEditor";

export default function CRMModule() {
  const [contacts, setContacts] = useState([]);
  const [blasts, setBlasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("contacts"); // "contacts" | "blasts"
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All"); // "All" | "Client" | "Tech"
  const [filterChannel, setFilterChannel] = useState("All"); // "All" | "Email" | "SMS" | "WhatsApp"
  const [filterStatus, setFilterStatus] = useState("All"); // "All" | "Confirmed" | "Pending" | "Opted_Out"
  
  // Selected Contact for Detail/Timeline panel
  const [selectedContact, setSelectedContact] = useState(null);
  
  // Blast Form States
  const [blastAudience, setBlastAudience] = useState("Clients"); // "Clients" | "Techs" | "All"
  const [blastChannel, setBlastChannel] = useState("Email"); // "Email" | "SMS" | "WhatsApp"
  const [blastSubject, setBlastSubject] = useState("");
  const [blastBody, setBlastBody] = useState("");
  const [sendingBlast, setSendingBlast] = useState(false);
  
  // Queue Dispatch Progress States
  const [dispatchQueue, setDispatchQueue] = useState([]);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchStats, setDispatchStats] = useState({ sent: 0, skipped: 0, failed: 0, total: 0 });
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Load Contacts (Clients + Techs)
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Clients
      let clientList = [];
      try {
        clientList = await pb.collection("clients").getFullList({ sort: "-created" });
      } catch (err) {
        console.warn("PocketBase client list fetch failed, using local fallback", err);
        const stored = localStorage.getItem("atltvmountpro_local_clients");
        clientList = stored ? JSON.parse(stored) : [];
      }

      // Map clients with normalized fields
      const mappedClients = clientList.map(c => ({
        id: c.id,
        name: c.Name || c.name || "Unnamed Client",
        email: c.email || "",
        phone: c.Phone_Number || c.phone_number || c.phone || "",
        type: "Client",
        optInStatus: c.OptIn_Status || "Pending",
        optInChannel: c.OptIn_Channel || "Email",
        optInDate: c.OptIn_Date || "",
        doubleOptInToken: c.DoubleOptIn_Token || "",
        created: c.created || new Date().toISOString(),
        raw: c
      }));

      // 2. Fetch Technicians
      let techList = [];
      try {
        techList = await pb.collection("team_members").getFullList({ sort: "created" });
      } catch (err) {
        console.warn("PocketBase team members fetch failed, using local fallback", err);
        const stored = localStorage.getItem("atltvmountpro_local_team");
        techList = stored ? JSON.parse(stored) : [];
      }

      const mappedTechs = techList.map(t => ({
        id: t.id,
        name: t.name || "Unnamed Tech",
        email: t.email || "",
        phone: t.phone || "",
        type: "Tech",
        optInStatus: "Confirmed", // Internal techs are auto-confirmed
        optInChannel: "Email",
        optInDate: t.created || "",
        doubleOptInToken: "",
        created: t.created || new Date().toISOString(),
        raw: t
      }));

      const merged = [...mappedClients, ...mappedTechs];
      setContacts(merged);
      
      // Save client backup to localStorage for reliability
      localStorage.setItem("atltvmountpro_local_clients", JSON.stringify(clientList));

      // If we have a selected contact, update their data
      if (selectedContact) {
        const updated = merged.find(m => m.id === selectedContact.id && m.type === selectedContact.type);
        if (updated) setSelectedContact(updated);
      }
    } catch (err) {
      console.error("Error merging contact directory:", err);
      toast.error("Error loading contact list.");
    } finally {
      setLoading(false);
    }
  }, [selectedContact]);

  // Load Blasts History
  const loadBlasts = useCallback(async () => {
    try {
      let list = [];
      try {
        list = await pb.collection("crm_blasts").getFullList({ sort: "-created" });
      } catch (err) {
        console.warn("PocketBase crm_blasts fetch failed, reading localStorage", err);
        const stored = localStorage.getItem("atltvmountpro_local_blasts");
        list = stored ? JSON.parse(stored) : [];
      }
      setBlasts(list);
    } catch (err) {
      console.error("Failed to fetch crm_blasts:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadBlasts();
  }, []);

  // Update OptIn status in DB
  const handleUpdateStatus = async (contact, newStatus) => {
    if (contact.type === "Tech") {
      toast.info("Technician status is managed by administrators and is auto-confirmed.");
      return;
    }
    
    try {
      const payload = { OptIn_Status: newStatus };
      if (newStatus === "Confirmed" && !contact.optInDate) {
        payload.OptIn_Date = new Date().toISOString();
      }
      await pb.collection("clients").update(contact.id, payload);
      toast.success(`Updated opt-in status to ${newStatus}`);
      loadData();
    } catch (err) {
      console.error("Failed to update status in PB, simulating locally", err);
      // Simulate locally
      const stored = localStorage.getItem("atltvmountpro_local_clients");
      if (stored) {
        const clients = JSON.parse(stored);
        const idx = clients.findIndex(c => c.id === contact.id);
        if (idx !== -1) {
          clients[idx].OptIn_Status = newStatus;
          if (newStatus === "Confirmed") {
            clients[idx].OptIn_Date = new Date().toISOString();
          }
          localStorage.setItem("atltvmountpro_local_clients", JSON.stringify(clients));
          toast.success(`Updated status to ${newStatus} (Local Mode)`);
          loadData();
        }
      }
    }
  };

  // Update OptIn channel in DB
  const handleUpdateChannel = async (contact, newChannel) => {
    if (contact.type === "Tech") return;
    
    try {
      await pb.collection("clients").update(contact.id, { OptIn_Channel: newChannel });
      toast.success(`Updated preferred channel to ${newChannel}`);
      loadData();
    } catch (err) {
      console.error("Failed to update channel, simulating locally", err);
      const stored = localStorage.getItem("atltvmountpro_local_clients");
      if (stored) {
        const clients = JSON.parse(stored);
        const idx = clients.findIndex(c => c.id === contact.id);
        if (idx !== -1) {
          clients[idx].OptIn_Channel = newChannel;
          localStorage.setItem("atltvmountpro_local_clients", JSON.stringify(clients));
          toast.success(`Updated preferred channel to ${newChannel} (Local Mode)`);
          loadData();
        }
      }
    }
  };

  // Trigger simulated Double Opt-in invite / verify link
  const triggerOptInInvite = (contact) => {
    if (contact.type === "Tech") return;
    
    const token = contact.doubleOptInToken || Math.random().toString(36).substr(2, 12);
    const verifyLink = `${window.location.origin}/verify-optin?token=${token}&email=${encodeURIComponent(contact.email)}`;
    
    // Save token if not present
    if (!contact.doubleOptInToken) {
      pb.collection("clients").update(contact.id, { DoubleOptIn_Token: token }).then(() => loadData());
    }

    toast.info(
      <div className="flex flex-col gap-1">
        <span className="font-bold text-xs">Simulated Double Opt-in link sent!</span>
        <span className="text-[10px] text-muted-foreground">Preferred: {contact.optInChannel}</span>
        <a 
          href={verifyLink} 
          target="_blank" 
          rel="noreferrer"
          className="text-xs text-primary underline font-medium mt-1 flex items-center gap-0.5 hover:text-primary/80"
        >
          Verify Opt-In Now <ExternalLink size={10} />
        </a>
      </div>,
      { duration: 10000 }
    );
  };

  // Run the Mass Blast queue with setTimeout delays to simulate networks
  const handleSendBlast = async (e) => {
    e.preventDefault();
    const strippedBody = blastBody.replace(/<[^>]*>/g, '').trim();
    if (!blastBody.trim() || (!strippedBody && !blastBody.includes("<img") && !blastBody.includes("<iframe"))) {
      toast.error("Message body cannot be empty.");
      return;
    }
    if (blastChannel === "Email" && !blastSubject.trim()) {
      toast.error("Subject is required for Email blasts.");
      return;
    }

    // Filter targets based on selection
    const targets = contacts.filter(c => {
      // Filter by Audience type
      if (blastAudience === "Clients" && c.type !== "Client") return false;
      if (blastAudience === "Techs" && c.type !== "Tech") return false;
      
      // Filter out empty contact endpoints (e.g. no email if sending email)
      if (blastChannel === "Email" && !c.email) return false;
      if ((blastChannel === "SMS" || blastChannel === "WhatsApp") && !c.phone) return false;
      
      return true;
    });

    if (targets.length === 0) {
      toast.error("No contacts found matching the selected blast target criteria.");
      return;
    }

    // Initialize Dispatch Queue UI state
    const queue = targets.map(t => {
      let dispStatus = "Pending";
      let detail = "Awaiting queue...";
      
      // Enforce Double Opt-In constraint: Clients MUST be Confirmed. Techs are always Confirmed.
      if (t.type === "Client" && t.optInStatus !== "Confirmed") {
        dispStatus = "Skipped";
        detail = "Skipped: Client has not double opted-in.";
      }

      return {
        id: t.id,
        name: t.name,
        type: t.type,
        endpoint: blastChannel === "Email" ? t.email : t.phone,
        status: dispStatus,
        detail: detail,
        rawContact: t
      };
    });

    setDispatchQueue(queue);
    setDispatchStats({
      sent: 0,
      skipped: queue.filter(q => q.status === "Skipped").length,
      failed: 0,
      total: queue.length
    });
    setShowDispatchModal(true);
    setSendingBlast(true);

    // Sequential Queue Runner
    let sentCount = 0;
    let skippedCount = queue.filter(q => q.status === "Skipped").length;
    let failedCount = 0;

    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status === "Skipped") continue;

      // Update item to "Sending..."
      setDispatchQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: "Sending", detail: "Connecting simulation API..." } : item));
      
      // Wait 300ms network simulation
      await new Promise(resolve => setTimeout(resolve, 300));

      // Simulate success/fail check (95% success rate for confirmed contacts)
      const isSuccess = Math.random() < 0.98;

      if (isSuccess) {
        sentCount++;
        setDispatchQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: "Delivered", detail: `Sent via Simulated ${blastChannel}` } : item));
      } else {
        failedCount++;
        setDispatchQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: "Failed", detail: `Simulated carrier error` } : item));
      }

      setDispatchStats(prev => ({
        ...prev,
        sent: sentCount,
        failed: failedCount
      }));
    }

    // Finalize: Write blast record to PocketBase crm_blasts
    const statsJSON = { sent: sentCount, skipped: skippedCount, failed: failedCount };
    const blastPayload = {
      subject: blastChannel === "Email" ? blastSubject : "",
      body: blastBody,
      audience: blastAudience,
      channel: blastChannel,
      sent_by: pb.authStore.record?.email || "admin@atltvmountpro.com",
      sent_date: new Date().toISOString(),
      stats: statsJSON
    };

    try {
      await pb.collection("crm_blasts").create(blastPayload);
    } catch (err) {
      console.warn("Failed to save crm_blasts record, caching locally", err);
      // Fallback local save
      const stored = localStorage.getItem("atltvmountpro_local_blasts");
      const localBlasts = stored ? JSON.parse(stored) : [];
      const newLocalBlast = {
        id: "local_" + Math.random().toString(36).substr(2, 9),
        created: new Date().toISOString(),
        ...blastPayload
      };
      localBlasts.unshift(newLocalBlast);
      localStorage.setItem("atltvmountpro_local_blasts", JSON.stringify(localBlasts));
    }

    // Reload blasts history
    loadBlasts();
    
    // Clear composer form
    setBlastSubject("");
    setBlastBody("");
    setSendingBlast(false);
    toast.success("Mass blast dispatch completed!");
  };

  // Helper to delete blast history
  const handleDeleteBlast = async (id) => {
    try {
      await pb.collection("crm_blasts").delete(id);
      toast.success("Blast record deleted.");
      loadBlasts();
    } catch (e) {
      // Simulate locally
      const stored = localStorage.getItem("atltvmountpro_local_blasts");
      if (stored) {
        const localBlasts = JSON.parse(stored).filter(b => b.id !== id);
        localStorage.setItem("atltvmountpro_local_blasts", JSON.stringify(localBlasts));
        toast.success("Blast record deleted (Local Mode).");
        loadBlasts();
      }
    }
  };

  // Filter contacts list
  const filteredContacts = contacts.filter(c => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(query) || 
                          c.email.toLowerCase().includes(query) || 
                          c.phone.includes(query);
    
    const matchesType = filterType === "All" || c.type === filterType;
    const matchesChannel = filterChannel === "All" || c.optInChannel === filterChannel;
    
    let matchesStatus = true;
    if (filterStatus !== "All") {
      if (c.type === "Tech") {
        matchesStatus = filterStatus === "Confirmed"; // Techs are always confirmed
      } else {
        matchesStatus = c.optInStatus === filterStatus;
      }
    }

    return matchesSearch && matchesType && matchesChannel && matchesStatus;
  });

  // Calculate statistics for contact directory header
  const totalCount = contacts.length;
  const clientCount = contacts.filter(c => c.type === "Client").length;
  const techCount = contacts.filter(c => c.type === "Tech").length;
  const confirmedCount = contacts.filter(c => c.optInStatus === "Confirmed").length;
  const pendingCount = contacts.filter(c => c.type === "Client" && c.optInStatus === "Pending").length;
  const optedOutCount = contacts.filter(c => c.type === "Client" && c.optInStatus === "Opted_Out").length;

  return (
    <div className="space-y-6">
      {/* ── CRM METRIC CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border/60 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Contacts</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-foreground">{totalCount}</span>
            <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded font-medium">
              {clientCount} Clients / {techCount} Techs
            </span>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-4 flex flex-col justify-between shadow-sm border-l-4 border-l-emerald-500">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Double Opted-In</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-emerald-500">{confirmedCount}</span>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-500 px-2 py-0.5 rounded font-medium">
              {totalCount > 0 ? Math.round((confirmedCount / totalCount) * 100) : 0}% Opted In
            </span>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-4 flex flex-col justify-between shadow-sm border-l-4 border-l-amber-500">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Pending Opt-In</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-amber-500">{pendingCount}</span>
            <span className="text-[10px] bg-amber-500/15 text-amber-500 px-2 py-0.5 rounded font-medium">
              Needs Verification
            </span>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-4 flex flex-col justify-between shadow-sm border-l-4 border-l-destructive">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Opted Out / Unsub</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-destructive">{optedOutCount}</span>
            <span className="text-[10px] bg-destructive/15 text-destructive px-2 py-0.5 rounded font-medium">
              Spam Shielded
            </span>
          </div>
        </div>
      </div>

      {/* ── CRM SUB TABS MENU ────────────────────────────────────────────────── */}
      <div className="flex border-b border-border bg-card/40 p-1 rounded-lg gap-2">
        <button
          onClick={() => setActiveSubTab("contacts")}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
            activeSubTab === "contacts" 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>Contacts Directory</span>
          </div>
        </button>
        <button
          onClick={() => setActiveSubTab("blasts")}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
            activeSubTab === "blasts" 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <Mail size={16} />
            <span>Mass Blasts Composer</span>
          </div>
        </button>
      </div>

      {/* ── SUB TAB 1: CONTACTS DIRECTORY ────────────────────────────────────── */}
      {activeSubTab === "contacts" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Directory Table */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-base w-full pl-9 py-1.5 text-sm"
                />
              </div>

              {/* Filters Panel */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="input-base py-1 px-2 text-xs bg-muted/60"
                >
                  <option value="All">All Types</option>
                  <option value="Client">Clients Only</option>
                  <option value="Tech">Technicians Only</option>
                </select>

                <select
                  value={filterChannel}
                  onChange={(e) => setFilterChannel(e.target.value)}
                  className="input-base py-1 px-2 text-xs bg-muted/60"
                >
                  <option value="All">All Channels</option>
                  <option value="Email">Email Preferred</option>
                  <option value="SMS">SMS Preferred</option>
                  <option value="WhatsApp">WhatsApp Preferred</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-base py-1 px-2 text-xs bg-muted/60"
                >
                  <option value="All">All Opt-in Status</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Opted_Out">Opted Out</option>
                </select>
                
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={loadData} title="Refresh Contacts">
                  <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                </Button>
              </div>
            </div>

            {/* Contacts Table */}
            <div className="border border-border/80 rounded-lg overflow-hidden bg-background">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/80 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Preferred Channel</th>
                    <th className="px-4 py-3">Opt-in Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                        <span className="text-xs text-muted-foreground mt-2 block">Loading Directory...</span>
                      </td>
                    </tr>
                  ) : filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-muted-foreground">
                        No contacts found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map(c => (
                      <tr 
                        key={`${c.type}-${c.id}`}
                        onClick={() => setSelectedContact(c)}
                        className={`border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors ${
                          selectedContact && selectedContact.id === c.id && selectedContact.type === c.type
                            ? "bg-primary/5 border-l-2 border-l-primary"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-foreground">{c.name}</div>
                          <div className="text-muted-foreground text-[10px] flex items-center gap-1.5 mt-0.5">
                            <span>{c.email}</span>
                            {c.phone && <span className="before:content-['•'] before:mr-1.5">{c.phone}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                            c.type === "Client" 
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                              : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}>
                            {c.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            {c.optInChannel === "Email" && <Mail size={12} className="text-indigo-400" />}
                            {c.optInChannel === "SMS" && <Smartphone size={12} className="text-emerald-400" />}
                            {c.optInChannel === "WhatsApp" && <MessageSquare size={12} className="text-teal-400" />}
                            <span>{c.optInChannel}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`flex items-center gap-1 font-semibold ${
                            c.optInStatus === "Confirmed" 
                              ? "text-emerald-500" 
                              : c.optInStatus === "Opted_Out"
                              ? "text-destructive"
                              : "text-amber-500"
                          }`}>
                            {c.optInStatus === "Confirmed" && <CheckCircle2 size={13} />}
                            {c.optInStatus === "Opted_Out" && <AlertTriangle size={13} />}
                            {c.optInStatus === "Pending" && <Clock size={13} />}
                            <span className="capitalize">{c.optInStatus}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {c.type === "Client" && c.optInStatus === "Pending" && (
                              <Button
                                size="xs"
                                variant="outline"
                                className="h-7 px-2 text-[10px] text-primary border-primary/20 hover:bg-primary/5"
                                onClick={() => triggerOptInInvite(c)}
                              >
                                Send Invite
                              </Button>
                            )}
                            <Button
                              size="xs"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => setSelectedContact(c)}
                            >
                              <ChevronRight size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* HubSpot-style Detail Panel & Activity Timeline */}
          <div className="lg:col-span-1 bg-card border border-border rounded-xl p-5 space-y-6">
            {selectedContact ? (
              <div className="space-y-6">
                {/* Contact Header */}
                <div className="border-b border-border/50 pb-4 flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-lg text-foreground">{selectedContact.name}</h3>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{selectedContact.type} Record</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => setSelectedContact(null)}
                  >
                    <X size={14} />
                  </Button>
                </div>

                {/* Profile Data & Interactive Controls */}
                <div className="space-y-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-semibold">{selectedContact.email || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-semibold">{selectedContact.phone || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registered:</span>
                      <span className="font-semibold">{new Date(selectedContact.created).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {selectedContact.type === "Client" && (
                    <div className="pt-4 border-t border-border/50 space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                          Opt-In Status
                        </label>
                        <select
                          value={selectedContact.optInStatus}
                          onChange={(e) => handleUpdateStatus(selectedContact, e.target.value)}
                          className="input-base w-full py-1 text-xs bg-muted/50 border-border/60"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Opted_Out">Opted Out (Unsubscribed)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                          Preferred Contact Channel
                        </label>
                        <select
                          value={selectedContact.optInChannel}
                          onChange={(e) => handleUpdateChannel(selectedContact, e.target.value)}
                          className="input-base w-full py-1 text-xs bg-muted/50 border-border/60"
                        >
                          <option value="Email">Email</option>
                          <option value="SMS">SMS Text Message</option>
                          <option value="WhatsApp">WhatsApp Chat</option>
                        </select>
                      </div>

                      <div className="pt-2">
                        <Button
                          onClick={() => triggerOptInInvite(selectedContact)}
                          variant="outline"
                          size="xs"
                          className="w-full justify-center text-xs"
                        >
                          {selectedContact.optInStatus === "Confirmed" ? "Resend Confirmation Alert" : "Send Double Opt-In Link"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* HubSpot-style Timeline */}
                <div className="pt-4 border-t border-border/50">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <History size={13} className="text-primary" /> Activity Timeline
                  </h4>
                  
                  <div className="space-y-4 relative before:absolute before:left-2 top-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60 pl-6">
                    {/* Event 1: Account Created */}
                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-border border-2 border-background" />
                      <div className="text-[11px] font-bold text-foreground">Record Created</div>
                      <div className="text-[9px] text-muted-foreground">{new Date(selectedContact.created).toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground/80 mt-0.5">
                        Added to directory as administrative {selectedContact.type.toLowerCase()}.
                      </div>
                    </div>

                    {/* Event 2: Verification token */}
                    {selectedContact.type === "Client" && (
                      <div className="relative">
                        <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-background" />
                        <div className="text-[11px] font-bold text-foreground">Double Opt-In Token Generated</div>
                        <div className="text-[9px] text-muted-foreground">{new Date(selectedContact.created).toLocaleDateString()}</div>
                        <div className="text-[10px] text-muted-foreground/80 mt-0.5">
                          Assigned secure token for verification via preferred channel {selectedContact.optInChannel}.
                        </div>
                      </div>
                    )}

                    {/* Event 3: Opt-in confirmation */}
                    {selectedContact.optInStatus === "Confirmed" && (
                      <div className="relative">
                        <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                        <div className="text-[11px] font-bold text-foreground text-emerald-500">Double Opt-In Confirmed</div>
                        <div className="text-[9px] text-muted-foreground">
                          {selectedContact.optInDate ? new Date(selectedContact.optInDate).toLocaleString() : "Confirmed"}
                        </div>
                        <div className="text-[10px] text-muted-foreground/80 mt-0.5">
                          Verified consent to receive automated messages, blasts, and digital invoices.
                        </div>
                      </div>
                    )}

                    {selectedContact.optInStatus === "Opted_Out" && (
                      <div className="relative">
                        <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-destructive border-2 border-background" />
                        <div className="text-[11px] font-bold text-destructive">User Opted-Out / Unsubscribed</div>
                        <div className="text-[10px] text-muted-foreground/80 mt-0.5">
                          Strict communications shield active. All automated emails, SMS, and invoices are blocked.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground border border-dashed border-border rounded-xl">
                <User size={28} className="stroke-1 mb-2 text-muted-foreground/60" />
                <p className="text-xs max-w-[180px]">Select a contact from the directory to review timeline and manage opt-in settings.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SUB TAB 2: MASS BLAST COMPOSER ───────────────────────────────────── */}
      {activeSubTab === "blasts" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Blast Composer Panel */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-5">
            <div>
              <h3 className="font-extrabold text-foreground text-base">New Bulk Communication Blast</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dispatch messages to user segments. Antispam filters automatically omit contacts without double opt-in.
              </p>
            </div>

            <form onSubmit={handleSendBlast} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block text-muted-foreground mb-1">Target Segment</label>
                  <select
                    value={blastAudience}
                    onChange={(e) => setBlastAudience(e.target.value)}
                    className="input-base w-full bg-muted/50 text-xs py-1.5"
                  >
                    <option value="Clients">All Clients</option>
                    <option value="Techs">All Internal Technicians</option>
                    <option value="All">All Contacts (Clients & Techs)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold block text-muted-foreground mb-1">Communication Channel</label>
                  <select
                    value={blastChannel}
                    onChange={(e) => setBlastChannel(e.target.value)}
                    className="input-base w-full bg-muted/50 text-xs py-1.5"
                  >
                    <option value="Email">Email Broadcast</option>
                    <option value="SMS">SMS Text Message</option>
                    <option value="WhatsApp">WhatsApp Message</option>
                  </select>
                </div>
              </div>

              {blastChannel === "Email" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Email Subject</label>
                  <input
                    type="text"
                    value={blastSubject}
                    onChange={(e) => setBlastSubject(e.target.value)}
                    placeholder="e.g. Atlanta TV Mount Pro — Schedule Updates"
                    className="input-base w-full text-xs py-1.5"
                    required={blastChannel === "Email"}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Message Body</label>
                <RichTextEditor
                  value={blastBody}
                  onChange={setBlastBody}
                  placeholder={`Write your HTML or Rich Text ${blastChannel.toLowerCase()} content here...`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreviewModal(true)}
                  disabled={sendingBlast}
                  className="flex items-center gap-1.5 border-border"
                >
                  <Eye size={14} /> Preview Message
                </Button>
                <Button type="submit" className="flex items-center gap-1.5 px-5" disabled={sendingBlast}>
                  <Send size={14} /> Send Broadcast
                </Button>
              </div>
            </form>
          </div>

          {/* Blast History Log */}
          <div className="lg:col-span-1 bg-card border border-border rounded-xl p-5 space-y-4">
            <div>
              <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
                <History size={14} className="text-primary" /> Logged Blasts
              </h3>
              <p className="text-[11px] text-muted-foreground">Audit log of mass broadcasts initiated by administrators.</p>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {blasts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs border border-dashed border-border rounded-xl">
                  No historical blasts logged.
                </div>
              ) : (
                blasts.map(b => {
                  let parsedStats = { sent: 0, skipped: 0, failed: 0 };
                  if (b.stats) {
                    parsedStats = typeof b.stats === "string" ? JSON.parse(b.stats) : b.stats;
                  }
                  
                  return (
                    <div key={b.id} className="bg-background border border-border p-3.5 rounded-lg space-y-2 relative group">
                      <button
                        onClick={() => handleDeleteBlast(b.id)}
                        className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Log"
                      >
                        <Trash2 size={12} />
                      </button>

                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold uppercase">
                          {b.channel}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(b.sent_date || b.created).toLocaleDateString()}
                        </span>
                      </div>

                      {b.subject && <div className="text-[11px] font-bold text-foreground line-clamp-1">{b.subject}</div>}
                      <p className="text-[10px] text-muted-foreground line-clamp-2 italic">"{b.body}"</p>

                      <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-border/40">
                        <span className="text-muted-foreground">Sent by: {b.sent_by?.split("@")[0]}</span>
                        <div className="flex gap-2">
                          <span className="text-emerald-500 font-bold">✓ {parsedStats.sent}</span>
                          {parsedStats.skipped > 0 && <span className="text-amber-500 font-bold">↷ {parsedStats.skipped}</span>}
                          {parsedStats.failed > 0 && <span className="text-destructive font-bold">✗ {parsedStats.failed}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── QUEUE DISPATCH CONSOLE DIALOG ────────────────────────────────────── */}
      <Dialog open={showDispatchModal} onOpenChange={setShowDispatchModal}>
        <DialogContent className="max-w-lg bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-extrabold text-foreground">
              <Send size={18} className="text-primary animate-pulse" /> HubSpot Mass Dispatch Console
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Statistics Bar */}
            <div className="grid grid-cols-4 gap-2 text-center bg-muted/50 p-3 rounded-lg border border-border/40">
              <div>
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Total Recip</span>
                <span className="text-lg font-extrabold">{dispatchStats.total}</span>
              </div>
              <div>
                <span className="text-[9px] text-emerald-500 uppercase font-bold tracking-wider block">Delivered</span>
                <span className="text-lg font-extrabold text-emerald-500">{dispatchStats.sent}</span>
              </div>
              <div>
                <span className="text-[9px] text-amber-500 uppercase font-bold tracking-wider block">Skipped</span>
                <span className="text-lg font-extrabold text-amber-500">{dispatchStats.skipped}</span>
              </div>
              <div>
                <span className="text-[9px] text-destructive uppercase font-bold tracking-wider block">Failed</span>
                <span className="text-lg font-extrabold text-destructive">{dispatchStats.failed}</span>
              </div>
            </div>

            {/* Live Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                <span>Dispatch Progress</span>
                <span>
                  {dispatchStats.total > 0 
                    ? Math.round(((dispatchStats.sent + dispatchStats.skipped + dispatchStats.failed) / dispatchStats.total) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-primary h-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${dispatchStats.total > 0 
                      ? ((dispatchStats.sent + dispatchStats.skipped + dispatchStats.failed) / dispatchStats.total) * 100 
                      : 0}%` 
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>

            {/* Queue Item Rows */}
            <div className="border border-border/80 rounded-lg overflow-y-auto max-h-[260px] bg-background">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-muted text-muted-foreground font-semibold border-b border-border sticky top-0">
                  <tr>
                    <th className="px-3 py-2">Contact</th>
                    <th className="px-3 py-2">Endpoint</th>
                    <th className="px-3 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dispatchQueue.map((item, idx) => (
                    <tr key={idx} className="border-b border-border/50 last:border-0 hover:bg-muted/10">
                      <td className="px-3 py-2 font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            item.type === "Client" ? "bg-blue-400" : "bg-purple-400"
                          }`} />
                          {item.name}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground font-mono">{item.endpoint || "N/A"}</td>
                      <td className="px-3 py-2 text-right font-medium">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          item.status === "Delivered" 
                            ? "bg-emerald-500/10 text-emerald-500"
                            : item.status === "Skipped"
                            ? "bg-amber-500/10 text-amber-500"
                            : item.status === "Failed"
                            ? "bg-destructive/10 text-destructive"
                            : item.status === "Sending"
                            ? "bg-primary/10 text-primary animate-pulse"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Dialog Footer */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setShowDispatchModal(false)}
                disabled={sendingBlast}
                variant={sendingBlast ? "outline" : "default"}
                size="sm"
              >
                {sendingBlast ? "Broadcasting Queue..." : "Close Console"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── MASS BLAST PREVIEW DIALOG ────────────────────────────────────────── */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-2xl bg-card border border-border p-0 overflow-hidden max-h-[85vh] flex flex-col">
          <DialogHeader className="px-5 py-4 border-b border-border flex flex-row items-center justify-between shrink-0 space-y-0">
            <DialogTitle className="text-base font-extrabold text-foreground flex items-center gap-1.5">
              <Eye size={18} className="text-primary" /> Message Preview
            </DialogTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground hover:bg-muted" onClick={() => setShowPreviewModal(false)}>
              <X size={14} />
            </Button>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 bg-muted/20 min-h-0 flex items-center justify-center">
            {/* Email Preview */}
            {blastChannel === "Email" && (
              <div className="w-full max-w-xl bg-background rounded-lg border border-border shadow-md overflow-hidden flex flex-col">
                {/* Email Client Header */}
                <div className="bg-muted/40 p-4 border-b border-border space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-semibold">From:</span>
                    <span className="font-medium text-foreground">Atlanta TV Mount Pro &lt;info@atltvmountpro.com&gt;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-semibold">To:</span>
                    <span className="font-medium text-foreground">{blastAudience === "Clients" ? "All Opted-In Clients" : blastAudience === "Techs" ? "All Technicians" : "All Contacts"}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border/40">
                    <span className="text-muted-foreground font-semibold">Subject:</span>
                    <span className="font-bold text-foreground">{blastSubject || "(No Subject)"}</span>
                  </div>
                </div>
                {/* Email Body */}
                <div 
                  className="p-6 overflow-y-auto text-sm leading-relaxed prose dark:prose-invert max-w-none prose-sm min-h-[180px] bg-background"
                  dangerouslySetInnerHTML={{ __html: blastBody || "<p class='text-muted-foreground italic'>Write something in the editor to preview...</p>" }}
                />
              </div>
            )}

            {/* SMS Preview */}
            {blastChannel === "SMS" && (
              <div className="w-[300px] h-[520px] bg-background rounded-[40px] border-8 border-neutral-800 shadow-2xl overflow-hidden flex flex-col relative">
                {/* Phone Speaker & Camera notches */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-neutral-800 rounded-full z-20 flex items-center justify-center">
                  <div className="w-12 h-1 bg-neutral-600 rounded-full" />
                </div>
                {/* Phone screen header */}
                <div className="pt-7 pb-3 px-4 bg-muted/65 border-b border-border flex flex-col items-center justify-center shrink-0">
                  <div className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                    AT
                  </div>
                  <span className="text-[10px] font-bold mt-1 text-foreground">Atlanta TV Mount Pro</span>
                  <span className="text-[8px] text-muted-foreground mt-0.5">iMessage</span>
                </div>
                {/* Conversations Area */}
                <div className="flex-1 bg-background p-4 overflow-y-auto flex flex-col justify-end">
                  <div className="flex flex-col items-end gap-1 max-w-[85%] self-end">
                    <div 
                      className="bg-blue-600 text-white rounded-2xl px-3 py-2 text-xs leading-normal select-none shadow-sm break-words prose prose-invert prose-xs"
                      dangerouslySetInnerHTML={{ __html: blastBody || "<span class='italic opacity-60'>Message empty...</span>" }}
                      style={{
                        borderBottomRightRadius: "4px"
                      }}
                    />
                    <span className="text-[8px] text-muted-foreground mr-1">Delivered</span>
                  </div>
                </div>
                {/* Bottom bar */}
                <div className="p-3 bg-muted/40 border-t border-border flex gap-2 items-center shrink-0">
                  <div className="flex-1 bg-background rounded-full border border-border px-3 py-1 text-[10px] text-muted-foreground">
                    iMessage
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp Preview */}
            {blastChannel === "WhatsApp" && (
              <div className="w-[300px] h-[520px] bg-[#0b141a] rounded-[40px] border-8 border-neutral-800 shadow-2xl overflow-hidden flex flex-col relative text-white font-sans">
                {/* Phone Speaker & Camera notches */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-neutral-800 rounded-full z-20 flex items-center justify-center">
                  <div className="w-12 h-1 bg-neutral-600 rounded-full" />
                </div>
                {/* Phone screen header */}
                <div className="pt-7 pb-2.5 px-4 bg-[#1f2c34] flex items-center gap-2 shrink-0 border-b border-neutral-900">
                  <div className="w-8 h-8 rounded-full bg-[#111b21] flex items-center justify-center text-emerald-500 font-bold">
                    A
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#e9edef]">Atlanta TV Mount Pro</div>
                    <div className="text-[8px] text-[#8696a0]">online</div>
                  </div>
                </div>
                {/* WhatsApp Chat Area */}
                <div 
                  className="flex-1 p-3 overflow-y-auto flex flex-col justify-end gap-2 bg-[#0b141a]"
                  style={{
                    backgroundImage: "radial-gradient(#1f2c34 1px, transparent 1px)",
                    backgroundSize: "16px 16px"
                  }}
                >
                  <div className="flex flex-col items-end gap-0.5 max-w-[85%] self-end">
                    <div 
                      className="bg-[#005c4b] text-[#e9edef] rounded-lg px-2.5 py-1.5 text-xs leading-normal select-none shadow-sm break-words relative prose prose-invert prose-xs"
                      dangerouslySetInnerHTML={{ __html: blastBody || "<span class='italic opacity-60'>Message empty...</span>" }}
                      style={{
                        borderTopRightRadius: "0"
                      }}
                    />
                    <div className="text-[8px] text-[#8696a0] flex items-center gap-0.5 self-end mt-0.5 mr-0.5">
                      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-sky-400">✓✓</span>
                    </div>
                  </div>
                </div>
                {/* WhatsApp input bar */}
                <div className="p-2.5 bg-[#1f2c34] flex gap-2 items-center shrink-0">
                  <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-[9px] text-[#8696a0]">
                    Message
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border flex justify-end shrink-0 bg-muted/20">
            <Button onClick={() => setShowPreviewModal(false)} size="sm">
              Back to Editor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
