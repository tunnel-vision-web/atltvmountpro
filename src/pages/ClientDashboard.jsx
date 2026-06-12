import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useClientAuth, getLocalJobs } from "@/contexts/ClientAuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ClipboardList,
  Calendar,
  Wrench,
  ArrowLeft,
  DollarSign,
  CreditCard,
} from "lucide-react";

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "in-progress": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  invoiced: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  paid: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

const ClientDashboard = () => {
  const { user, isAuthenticated, isCustomer, isTech } = useClientAuth();
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState("jobs");

  useEffect(() => {
    if (!user) return;
    const allJobs = getLocalJobs();
    const myJobs = allJobs.filter(
      (j) => j.clientId === user.id || j.clientEmail === user.email,
    );
    setJobs(myJobs);

    const allInvoices = JSON.parse(
      localStorage.getItem("atltv_invoices") || "[]",
    );
    const myInvoices = allInvoices.filter(
      (inv) => inv.clientId === user.id || inv.clientEmail === user.email,
    );
    setInvoices(myInvoices);
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <ClipboardList className="w-12 h-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Please Sign In</h1>
        <p className="text-muted-foreground mb-6 text-center max-w-sm">
          Sign in to your account to view your jobs, invoices, and track
          progress.
        </p>
        <Link to="/">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <ArrowLeft size={16} className="mr-2" /> Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const totalSpent = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const unpaidTotal = invoices
    .filter((inv) => inv.status === "sent" || inv.status === "pending")
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">My Dashboard</h1>
              {isTech && (
                <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full font-semibold border border-secondary/30">
                  Technician
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              Welcome back, {user?.name || user?.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft size={14} className="mr-1" /> Back to Site
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ClipboardList size={16} className="text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total Jobs</span>
            </div>
            <p className="text-2xl font-bold">{jobs.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign size={16} className="text-green-500" />
              </div>
              <span className="text-sm text-muted-foreground">Total Spent</span>
            </div>
            <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <CreditCard size={16} className="text-orange-500" />
              </div>
              <span className="text-sm text-muted-foreground">Outstanding</span>
            </div>
            <p className="text-2xl font-bold">${unpaidTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "jobs"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            My Jobs
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "invoices"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Invoices
          </button>
        </div>

        {/* Jobs Tab */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <Wrench className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-1">No jobs yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't requested any services yet.
                </p>
                <Link to="/services">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Browse Services
                  </Button>
                </Link>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          {job.service || "General Service"}
                        </h3>
                        <Badge
                          variant="outline"
                          className={statusColors[job.status] || ""}
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Requested on{" "}
                        {new Date(job.created).toLocaleDateString()}
                      </p>
                      {job.scheduledDate && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Calendar size={12} />
                          Scheduled:{" "}
                          {new Date(job.scheduledDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {job.price && (
                      <div className="text-right">
                        <p className="text-lg font-bold">${job.price}</p>
                      </div>
                    )}
                  </div>
                  {job.notes && (
                    <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
                      {job.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === "invoices" && (
          <div className="space-y-4">
            {invoices.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <DollarSign className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-1">No invoices yet</h3>
                <p className="text-sm text-muted-foreground">
                  Invoices will appear here once your jobs are completed.
                </p>
              </div>
            ) : (
              invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          Invoice #{inv.number || inv.id.slice(-6)}
                        </h3>
                        <Badge
                          variant="outline"
                          className={statusColors[inv.status] || ""}
                        >
                          {inv.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {inv.description || "Service Invoice"} •{" "}
                        {new Date(inv.created).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold">
                        ${(inv.total || 0).toFixed(2)}
                      </p>
                      {(inv.status === "sent" || inv.status === "pending") && (
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
