import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DollarSign,
  Send,
  Mail,
  MessageSquare,
  Smartphone,
  CreditCard,
  Banknote,
  Plus,
  X,
  CheckCircle2,
  Trash2,
  Users,
  ExternalLink,
  UserPlus,
  Eye,
  Printer,
  Receipt,
} from "lucide-react";
import {
  getInvoices,
  saveInvoices,
  generateInvoiceNumber,
  addSevenDays,
  getClientDirectory,
  saveClientToDirectory,
  autoCreateInvoiceForBooking,
  statusColors,
  sendInvoiceVia,
  updateInvoice,
} from "@/lib/invoiceUtils";
import pb from "@/lib/pocketbaseClient";

export { autoCreateInvoiceForBooking, sendInvoiceVia, getInvoiceForBooking } from "@/lib/invoiceUtils";

const FinanceModule = ({ initialData = null, currentUser = null }) => {
  const [invoices, setInvoices] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);

  // Accountant and Tax updates
  const role = currentUser?.role || pb.authStore.record?.role || "Admin";
  const [subTab, setSubTab] = useState("ledger");
  const [showViewInvoice, setShowViewInvoice] = useState(false);
  const [showViewReceipt, setShowViewReceipt] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [taxPage, setTaxPage] = useState(1);
  const taxItemsPerPage = 10;

  const [taxYear, setTaxYear] = useState("2026");
  const [taxQuarter, setTaxQuarter] = useState("all");

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  useEffect(() => {
    setTaxPage(1);
  }, [taxYear, taxQuarter]);

  const [showDirectoryPicker, setShowDirectoryPicker] = useState(false);
  const [directorySearch, setDirectorySearch] = useState("");
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const blankForm = {
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    jobDate: "",
    items: [{ description: "", quantity: 1, rate: 0 }],
    notes: "",
    dueDate: "",
    bookingId: null,
  };

  const [form, setForm] = useState(blankForm);

  const [paymentForm, setPaymentForm] = useState({
    method: "card",
    cardNumber: "",
    expiry: "",
    cvc: "",
    name: "",
    cashappTag: "",
  });

  useEffect(() => {
    // 1. Initial quick load from local storage
    const localInvoices = getInvoices();
    setInvoices(localInvoices);

    // 2. Fetch bookings and sync
    const syncBookings = async () => {
      let bookingList = [];
      try {
        bookingList = await pb.collection("appointment_bookings").getFullList({ sort: "-created" });
      } catch (err) {
        console.warn("FinanceModule: PocketBase bookings fetch failed, reading localStorage:", err);
        const stored = localStorage.getItem("atltvmountpro_local_bookings");
        bookingList = stored ? JSON.parse(stored) : [];
      }

      let currentInvoices = getInvoices();
      let createdAny = false;

      bookingList.forEach((booking) => {
        const normalized = {
          id: booking.id,
          name: booking.Name || booking.name || "Unnamed Client",
          email: booking.Email || booking.email || "",
          phone: booking.Phone_Number || booking.phone_number || booking.phone || "",
          preferred_date: booking.Preferred_Date || booking.preferred_date || "",
          service_type: booking.Service_Type || booking.service_type || "TV Mounting Service",
          estimated_quote: booking.Estimated_Quote || booking.estimated_quote || 150,
          project_description: booking.Project_Description || booking.project_description || "",
          status: booking.status || "pending",
        };

        const hasInvoice = currentInvoices.some((inv) => inv.bookingId === normalized.id);
        if (!hasInvoice) {
          const newInv = autoCreateInvoiceForBooking(normalized);
          if (newInv) {
            currentInvoices.unshift(newInv);
            createdAny = true;
          }
        }
      });

      if (createdAny) {
        saveInvoices(currentInvoices);
      }
      setInvoices(currentInvoices);
    };

    syncBookings();

    if (initialData) {
      const due = initialData.jobDate ? addSevenDays(initialData.jobDate) : "";
      setForm({
        clientName: initialData.clientName || "",
        clientEmail: initialData.clientEmail || "",
        clientPhone: initialData.clientPhone || "",
        jobDate: initialData.jobDate || "",
        items: [
          {
            description: initialData.serviceType || "",
            quantity: 1,
            rate: initialData.rate || 0,
          },
        ],
        notes: initialData.notes || "",
        dueDate: due,
        bookingId: initialData.bookingId || null,
      });
      setShowCreate(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleJobDateChange = (value) => {
    setForm((prev) => ({
      ...prev,
      jobDate: value,
      dueDate: value ? addSevenDays(value) : prev.dueDate,
    }));
  };

  const filteredInvoices =
    filterStatus === "all"
      ? invoices
      : invoices.filter((inv) => inv.status === filterStatus);

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + (i.total || 0), 0);
  const outstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "pending")
    .reduce((s, i) => s + (i.total || 0), 0);

  const calculateTotal = (items) =>
    items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.rate || 0),
      0,
    );

  const updateItem = (idx, field, value) => {
    const next = [...form.items];
    next[idx][field] = field === "description" ? value : parseFloat(value) || 0;
    setForm({ ...form, items: next });
  };

  const addItem = () =>
    setForm({
      ...form,
      items: [...form.items, { description: "", quantity: 1, rate: 0 }],
    });

  const removeItem = (idx) => {
    const next = form.items.filter((_, i) => i !== idx);
    setForm({
      ...form,
      items: next.length ? next : [{ description: "", quantity: 1, rate: 0 }],
    });
  };

  const createInvoice = () => {
    if (
      !form.clientName ||
      !form.clientEmail ||
      form.items.every((i) => !i.description)
    ) {
      toast.error("Please fill in client info and at least one line item.");
      return;
    }

    saveClientToDirectory({
      name: form.clientName,
      email: form.clientEmail,
      phone: form.clientPhone,
    });

    if (editingInvoiceId) {
      const updated = updateInvoice(editingInvoiceId, {
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientPhone: form.clientPhone,
        items: form.items,
        notes: form.notes,
        jobDate: form.jobDate || null,
        dueDate: form.dueDate || null,
      });
      if (updated) {
        setInvoices(getInvoices());
        toast.success(`Invoice ${updated.number} updated.`);
      }
      setEditingInvoiceId(null);
      setShowCreate(false);
      setForm(blankForm);
      return;
    }

    const subtotal = calculateTotal(form.items);
    const tax = subtotal * 0.07;
    const total = subtotal + tax;
    const invoice = {
      id: "inv_" + Math.random().toString(36).substr(2, 9),
      number: generateInvoiceNumber(),
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      clientPhone: form.clientPhone,
      clientId: null,
      bookingId: form.bookingId || null,
      items: form.items,
      notes: form.notes,
      subtotal,
      tax,
      total,
      status: "draft",
      created: new Date().toISOString(),
      jobDate: form.jobDate || null,
      dueDate: form.dueDate || null,
      paidDate: null,
      paymentMethod: null,
    };
    const next = [invoice, ...getInvoices()];
    saveInvoices(next);
    setInvoices(next);
    setShowCreate(false);
    setForm(blankForm);
    toast.success(`Invoice ${invoice.number} created.`);
  };

  const openEditInvoice = (inv) => {
    setForm({
      clientName: inv.clientName || "",
      clientEmail: inv.clientEmail || "",
      clientPhone: inv.clientPhone || "",
      items: inv.items || [{ description: "", quantity: 1, rate: 0 }],
      notes: inv.notes || "",
      jobDate: inv.jobDate || "",
      dueDate: inv.dueDate || "",
      bookingId: inv.bookingId || null,
    });
    setEditingInvoiceId(inv.id);
    setShowViewInvoice(false);
    setShowCreate(true);
  };

  const deleteInvoice = (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    const next = getInvoices().filter((i) => i.id !== id);
    saveInvoices(next);
    setInvoices(next);
    toast.success("Invoice deleted.");
  };

  const openPayment = (inv) => {
    setSelectedInvoice(inv);
    setPaymentForm({
      method: "card",
      cardNumber: "",
      expiry: "",
      cvc: "",
      name: "",
      cashappTag: "",
    });
    setShowPayment(true);
  };

  const processPayment = () => {
    if (!selectedInvoice) return;
    const { method } = paymentForm;
    if (
      method === "card" &&
      (!paymentForm.cardNumber || !paymentForm.expiry || !paymentForm.cvc)
    ) {
      toast.error("Please fill in all card details.");
      return;
    }
    if (method === "cashapp" && !paymentForm.cashappTag) {
      toast.error("Please enter your CashApp $Cashtag.");
      return;
    }

    const all = getInvoices();
    const idx = all.findIndex((i) => i.id === selectedInvoice.id);
    if (idx !== -1) {
      all[idx].status = "paid";
      all[idx].paidDate = new Date().toISOString();
      all[idx].paymentMethod = method;
      
      const rxNo = "REC-" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);
      const txId = method === "card" 
        ? "TXN-" + Math.floor(10000000 + Math.random() * 90000000)
        : method === "cashapp"
          ? "CASH-" + Math.floor(100000 + Math.random() * 900000)
          : "CASH-PAID-" + Date.now().toString().slice(-6);

      const details = method === "card"
        ? `Card ending in ${paymentForm.cardNumber.slice(-4) || "4111"}`
        : method === "cashapp"
          ? `CashApp: ${paymentForm.cashappTag}`
          : "In-Person Cash Payment";

      all[idx].receipt = {
        number: rxNo,
        transactionId: txId,
        method: method,
        details: details,
        amount: all[idx].total,
        timestamp: new Date().toISOString(),
      };
      
      saveInvoices(all);
      setInvoices(all);
      toast.success(
        `Payment of $${all[idx].total.toFixed(2)} received via ${method}. Receipt generated.`,
      );
    }
    setShowPayment(false);
    setSelectedInvoice(null);
  };

  const openSend = (inv) => {
    setSelectedInvoice(inv);
    setShowSend(true);
  };

  const sendInvoice = async (method) => {
    if (!selectedInvoice) return;
    const ok = await sendInvoiceVia(selectedInvoice, method);
    if (!ok) {
      const phone = (selectedInvoice.clientPhone || "").replace(/\D/g, "");
      if (!phone && method !== "email") {
        toast.error("Client phone number is required for text or WhatsApp.");
      }
      return;
    }
    setInvoices(getInvoices());
    toast.success(
      `Invoice ${selectedInvoice.number} sent via ${method === "email" ? "Email" : method === "sms" ? "Text" : "WhatsApp"}.`,
    );
    setShowSend(false);
    setSelectedInvoice(null);
  };

  const clientDirectory = getClientDirectory();
  const filteredDirectory = directorySearch.trim()
    ? clientDirectory.filter(
        (c) =>
          c.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
          c.email.toLowerCase().includes(directorySearch.toLowerCase()),
      )
    : clientDirectory;

  const pickClient = (client) => {
    setForm((prev) => ({
      ...prev,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone || "",
    }));
    setShowDirectoryPicker(false);
    setShowNewClientForm(false);
    setDirectorySearch("");
  };

  const addNewClientAndUse = () => {
    if (!newClient.name || !newClient.email) {
      toast.error("Name and email are required.");
      return;
    }
    const saved = saveClientToDirectory(newClient);
    pickClient(saved);
    setNewClient({ name: "", email: "", phone: "" });
    toast.success("Client added to directory.");
  };

  // Tax period check
  const matchesPeriod = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    
    const year = date.getFullYear().toString();
    if (year !== taxYear) return false;
    
    if (taxQuarter === "all") return true;
    
    const month = date.getMonth();
    if (taxQuarter === "q1") return month >= 0 && month <= 2;
    if (taxQuarter === "q2") return month >= 3 && month <= 5;
    if (taxQuarter === "q3") return month >= 6 && month <= 8;
    if (taxQuarter === "q4") return month >= 9 && month <= 11;
    
    return false;
  };

  const taxPaidInvoices = invoices.filter(
    (inv) => inv.status === "paid" && matchesPeriod(inv.paidDate || inv.created)
  );

  const taxUnpaidInvoices = invoices.filter(
    (inv) => inv.status !== "paid" && matchesPeriod(inv.jobDate || inv.created)
  );

  const grossRevenue = taxPaidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const netServiceRevenue = taxPaidInvoices.reduce((sum, inv) => {
    const sub = inv.subtotal ?? (inv.total / 1.07);
    return sum + sub;
  }, 0);
  const salesTaxCollected = taxPaidInvoices.reduce((sum, inv) => {
    const tax = inv.tax ?? (inv.total - (inv.total / 1.07));
    return sum + tax;
  }, 0);
  const outstandingLiabilities = taxUnpaidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

  const methodStats = taxPaidInvoices.reduce((acc, inv) => {
    const method = inv.paymentMethod || "other";
    if (!acc[method]) {
      acc[method] = { count: 0, amount: 0 };
    }
    acc[method].count += 1;
    acc[method].amount += inv.total || 0;
    return acc;
  }, {});

  const handlePrint = (title, htmlContent) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocker detected! Please allow popups to print invoices and receipts.");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; background: white; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; font-weight: bold; text-align: left; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintTaxReport = () => {
    const periodStr = taxQuarter === "all"
      ? `Full Year ${taxYear}`
      : `${taxQuarter.toUpperCase()} ${taxYear}`;

    const itemsHtml = taxPaidInvoices.map(inv => {
      const sub = inv.subtotal ?? (inv.total / 1.07);
      const tax = inv.tax ?? (inv.total - sub);
      return `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
          <td style="padding: 8px 0; font-family: monospace;">${inv.number}</td>
          <td style="padding: 8px 0;">${inv.clientName}</td>
          <td style="padding: 8px 0; text-align: right;">$${sub.toFixed(2)}</td>
          <td style="padding: 8px 0; text-align: right;">$${tax.toFixed(2)}</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">$${inv.total.toFixed(2)}</td>
          <td style="padding: 8px 0; text-align: right; text-transform: capitalize;">${inv.paymentMethod}</td>
          <td style="padding: 8px 0; text-align: right;">${inv.paidDate ? new Date(inv.paidDate).toLocaleDateString() : "N/A"}</td>
        </tr>
      `;
    }).join("");

    const html = `
      <div style="max-width: 900px; margin: 0 auto; padding: 25px; color: #1e293b; line-height: 1.5; font-family: sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 30px;">
          <div>
            <h1 style="margin: 0; font-size: 22px; font-weight: bold; color: #0f172a;">Atlanta TV Mount Pro</h1>
            <p style="margin: 3px 0 0 0; font-size: 13px; color: #64748b;">Corporate Tax Aggregation Sheet</p>
          </div>
          <div style="text-align: right;">
            <span style="font-weight: bold; background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-transform: uppercase;">TAX REPORT</span>
            <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold;">Period: ${periodStr}</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 35px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #f8fafc;">
          <div style="border-right: 1px solid #e2e8f0; padding-right: 10px;">
            <span style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Gross Revenue</span>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #0f172a;">$${grossRevenue.toFixed(2)}</p>
          </div>
          <div style="border-right: 1px solid #e2e8f0; padding: 0 10px;">
            <span style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Net Revenue</span>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #0f172a;">$${netServiceRevenue.toFixed(2)}</p>
          </div>
          <div style="border-right: 1px solid #e2e8f0; padding: 0 10px;">
            <span style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Sales Tax (7.0%)</span>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #2563eb;">$${salesTaxCollected.toFixed(2)}</p>
          </div>
          <div style="padding-left: 10px;">
            <span style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Outstanding</span>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #ea580c;">$${outstandingLiabilities.toFixed(2)}</p>
          </div>
        </div>

        <h3 style="font-size: 15px; font-weight: bold; border-bottom: 2px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 15px;">Payment Method Breakdown</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 1px solid #cbd5e1; color: #475569; font-weight: bold; text-align: left;">
              <th style="padding: 6px 0;">Method</th>
              <th style="padding: 6px 0; text-align: center;">Transactions</th>
              <th style="padding: 6px 0; text-align: right;">Collected Amount</th>
            </tr>
          </thead>
          <tbody>
            ${["card", "cashapp", "cash"].map(method => {
              const stat = methodStats[method] || { count: 0, amount: 0 };
              return `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 0; text-transform: capitalize; font-weight: bold;">${method}</td>
                  <td style="padding: 6px 0; text-align: center;">${stat.count}</td>
                  <td style="padding: 6px 0; text-align: right;">$${stat.amount.toFixed(2)}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>

        <h3 style="font-size: 15px; font-weight: bold; border-bottom: 2px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 15px;">Transaction Log</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 1px solid #cbd5e1; color: #475569; font-weight: bold;">
              <th style="padding: 6px 0; text-align: left;">Invoice #</th>
              <th style="padding: 6px 0; text-align: left;">Customer</th>
              <th style="padding: 6px 0; text-align: right;">Subtotal</th>
              <th style="padding: 6px 0; text-align: right;">Tax (7%)</th>
              <th style="padding: 6px 0; text-align: right;">Total</th>
              <th style="padding: 6px 0; text-align: right;">Method</th>
              <th style="padding: 6px 0; text-align: right;">Date Paid</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml || `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #64748b; font-style: italic;">No matching paid invoices found for this period.</td></tr>`}
          </tbody>
        </table>

        <div style="margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #94a3b8;">
          Atlanta TV Mount Pro Financial Administration System • Generated on ${new Date().toLocaleString()}
        </div>
      </div>
    `;
    handlePrint(`Tax-Report-${periodStr}`, html);
  };

  const renderTaxTab = () => {
    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">Tax Reporting & Analytics</h2>
            <p className="text-xs text-muted-foreground">Select a tax year and quarter to view collections and liabilities.</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={taxYear} onValueChange={setTaxYear}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>

            <Select value={taxQuarter} onValueChange={setTaxQuarter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Quarter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Full Year</SelectItem>
                <SelectItem value="q1">Q1 (Jan - Mar)</SelectItem>
                <SelectItem value="q2">Q2 (Apr - Jun)</SelectItem>
                <SelectItem value="q3">Q3 (Jul - Sep)</SelectItem>
                <SelectItem value="q4">Q4 (Oct - Dec)</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={handlePrintTaxReport}
              className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
            >
              <Printer size={14} /> Print Report
            </Button>
          </div>
        </div>

        {/* Aggregates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Gross Revenue</span>
            <p className="text-2xl font-bold text-foreground mt-1">${grossRevenue.toFixed(2)}</p>
            <span className="text-[10px] text-muted-foreground block mt-1">Total revenue collected (cash basis)</span>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Net Service Revenue</span>
            <p className="text-2xl font-bold text-foreground mt-1">${netServiceRevenue.toFixed(2)}</p>
            <span className="text-[10px] text-muted-foreground block mt-1">Excludes sales tax collections</span>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sales Tax Collected</span>
            <p className="text-2xl font-bold text-primary mt-1">${salesTaxCollected.toFixed(2)}</p>
            <span className="text-[10px] text-muted-foreground block mt-1">7.0% tax liabilities collected</span>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Outstanding Liabilities</span>
            <p className="text-2xl font-bold text-orange-500 mt-1">${outstandingLiabilities.toFixed(2)}</p>
            <span className="text-[10px] text-muted-foreground block mt-1">Unpaid invoices in selected period</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment breakdown */}
          <div className="lg:col-span-1 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-foreground text-sm border-b pb-2">Revenue by Payment Method</h3>
            <div className="space-y-3">
              {["card", "cashapp", "cash"].map((method) => {
                const stat = methodStats[method] || { count: 0, amount: 0 };
                const pct = grossRevenue > 0 ? (stat.amount / grossRevenue) * 100 : 0;
                return (
                  <div key={method} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="capitalize text-muted-foreground">{method} ({stat.count} tx)</span>
                      <span className="text-foreground">${stat.amount.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* matching invoices table */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-foreground text-sm border-b pb-2">Period Transaction Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="px-3 py-2">Invoice #</th>
                    <th className="px-3 py-2">Customer</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                    <th className="px-3 py-2 text-right">Tax (7%)</th>
                    <th className="px-3 py-2 text-right">Total</th>
                    <th className="px-3 py-2 text-right">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const totalTaxPages = Math.ceil(taxPaidInvoices.length / taxItemsPerPage) || 1;
                    const taxStartIndex = (taxPage - 1) * taxItemsPerPage;
                    const paginatedTaxInvoices = taxPaidInvoices.slice(taxStartIndex, taxStartIndex + taxItemsPerPage);

                    if (taxPaidInvoices.length === 0) {
                      return (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-muted-foreground italic">No paid transactions in this period.</td>
                        </tr>
                      );
                    }

                    return paginatedTaxInvoices.map((inv) => {
                      const sub = inv.subtotal ?? (inv.total / 1.07);
                      const tax = inv.tax ?? (inv.total - sub);
                      return (
                        <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                          <td className="px-3 py-2 font-mono font-medium">{inv.number}</td>
                          <td className="px-3 py-2 truncate max-w-[120px]" title={inv.clientName}>{inv.clientName}</td>
                          <td className="px-3 py-2 text-right">${sub.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right">${tax.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right font-bold">${inv.total.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right capitalize font-medium text-primary">{inv.paymentMethod}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
            {(() => {
              const totalTaxPages = Math.ceil(taxPaidInvoices.length / taxItemsPerPage) || 1;
              if (taxPaidInvoices.length > 0) {
                return (
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      Showing {(taxPage - 1) * taxItemsPerPage + 1} to {Math.min(taxPage * taxItemsPerPage, taxPaidInvoices.length)} of {taxPaidInvoices.length} entries
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTaxPage((p) => Math.max(p - 1, 1))}
                        disabled={taxPage === 1}
                        className="h-8 text-xs"
                      >
                        Previous
                      </Button>
                      <span className="text-xs font-semibold px-2">
                        Page {taxPage} of {totalTaxPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTaxPage((p) => Math.min(p + 1, totalTaxPages))}
                        disabled={taxPage === totalTaxPages}
                        className="h-8 text-xs"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Subtab selection - only visible if Admin or Accountant */}
      {(role === "Admin" || role === "Accountant") && (
        <div className="flex border-b border-border">
          <button
            onClick={() => setSubTab("ledger")}
            className={`px-4 py-2.5 border-b-2 font-semibold text-sm transition-all duration-150 ${
              subTab === "ledger"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Invoices Ledger
          </button>
          <button
            onClick={() => setSubTab("tax")}
            className={`px-4 py-2.5 border-b-2 font-semibold text-sm transition-all duration-150 ${
              subTab === "tax"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Tax Reporting & Analytics
          </button>
        </div>
      )}

      {subTab === "tax" && (role === "Admin" || role === "Accountant") ? (
        renderTaxTab()
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign size={16} className="text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Send size={16} className="text-orange-500" />
                </div>
                <span className="text-sm text-muted-foreground">Outstanding</span>
              </div>
              <p className="text-2xl font-bold">${outstanding.toFixed(2)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-green-500" />
                </div>
                <span className="text-sm text-muted-foreground">Paid Invoices</span>
              </div>
              <p className="text-2xl font-bold">
                {invoices.filter((i) => i.status === "paid").length}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus size={16} className="mr-1" /> New Invoice
            </Button>
          </div>

          <div className="space-y-3">
            {(() => {
              const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
              const startIndex = (currentPage - 1) * itemsPerPage;
              const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

              if (filteredInvoices.length === 0) {
                return (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <DollarSign className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">No invoices</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your first invoice or schedule a job to auto-generate one.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {paginatedInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold">{inv.number}</h3>
                            <Badge
                              variant="outline"
                              className={statusColors[inv.status] || ""}
                            >
                              {inv.status}
                            </Badge>
                            {inv.bookingId && (
                              <Badge variant="outline" className="text-xs">
                                Job linked
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {inv.clientName} • {inv.clientEmail}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Created {new Date(inv.created).toLocaleDateString()}
                            {inv.jobDate &&
                              ` • Job ${new Date(inv.jobDate).toLocaleDateString()}`}
                            {inv.dueDate &&
                              ` • Due ${new Date(inv.dueDate).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-lg font-bold mr-2">
                            ${(inv.total || 0).toFixed(2)}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setShowViewInvoice(true);
                            }}
                          >
                            <Eye size={14} className="mr-1" /> View Invoice
                          </Button>
                          {inv.status === "paid" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-600"
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setShowViewReceipt(true);
                              }}
                            >
                              <Receipt size={14} className="mr-1" /> View Receipt
                            </Button>
                          )}
                          {(inv.status === "draft" ||
                            inv.status === "sent" ||
                            inv.status === "pending") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openSend(inv)}
                            >
                              <Send size={14} className="mr-1" /> Send
                            </Button>
                          )}
                          {(inv.status === "sent" || inv.status === "pending") && (
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90 text-primary-foreground"
                              onClick={() => openPayment(inv)}
                            >
                              <DollarSign size={14} className="mr-1" /> Record Payment
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteInvoice(inv.id)}
                          >
                            <Trash2 size={14} className="text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredInvoices.length > 0 && (
                    <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                      <span className="text-xs text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} entries
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-xs font-semibold px-2">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </>
      )}

      {/* CREATE INVOICE DIALOG */}
      <Dialog
        open={showCreate}
        onOpenChange={(open) => {
          setShowCreate(open);
          if (!open) {
            setShowDirectoryPicker(false);
            setShowNewClientForm(false);
            setDirectorySearch("");
            setEditingInvoiceId(null);
            setForm(blankForm);
          }
        }}
      >
        <DialogContent className="w-full max-w-[560px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
            <DialogTitle className="text-lg">
              {editingInvoiceId ? "Edit Invoice" : "Create Invoice"}
            </DialogTitle>
            <DialogDescription className="text-sm mt-0.5">
              {editingInvoiceId
                ? "Update your invoice details below."
                : "Pick a client from your directory or add a new one."}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    setShowDirectoryPicker((v) => !v);
                    setShowNewClientForm(false);
                    setDirectorySearch("");
                  }}
                >
                  <Users size={14} />
                  Pick from directory
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    setShowNewClientForm((v) => !v);
                    setShowDirectoryPicker(false);
                  }}
                >
                  <UserPlus size={14} />
                  Add new client
                </Button>
              </div>

              {showDirectoryPicker && (
                <div className="border border-border rounded-lg bg-card shadow-sm overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <Input
                      autoFocus
                      placeholder="Search by name or email…"
                      value={directorySearch}
                      onChange={(e) => setDirectorySearch(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredDirectory.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No clients found. Add a new client below.
                      </p>
                    ) : (
                      filteredDirectory.map((c) => (
                        <button
                          key={c.id || c.email}
                          type="button"
                          onClick={() => pickClient(c)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors flex flex-col gap-0.5"
                        >
                          <span className="font-medium">{c.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {c.email}
                            {c.phone ? ` • ${c.phone}` : ""}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {showNewClientForm && (
                <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Name *</Label>
                      <Input
                        value={newClient.name}
                        onChange={(e) =>
                          setNewClient({ ...newClient, name: e.target.value })
                        }
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={newClient.email}
                        onChange={(e) =>
                          setNewClient({ ...newClient, email: e.target.value })
                        }
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) =>
                        setNewClient({ ...newClient, phone: e.target.value })
                      }
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <Button size="sm" onClick={addNewClientAndUse}>
                    Save &amp; use client
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Client Name</Label>
                <Input
                  value={form.clientName}
                  onChange={(e) =>
                    setForm({ ...form, clientName: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Client Email</Label>
                <Input
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) =>
                    setForm({ ...form, clientEmail: e.target.value })
                  }
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Client Phone</Label>
              <Input
                type="tel"
                value={form.clientPhone}
                onChange={(e) =>
                  setForm({ ...form, clientPhone: e.target.value })
                }
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Job Date</Label>
                <Input
                  type="date"
                  value={form.jobDate}
                  onChange={(e) => handleJobDateChange(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Line Items</Label>
              {form.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    className="flex-1"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(idx, "description", e.target.value)
                    }
                  />
                  <Input
                    className="w-20"
                    type="number"
                    min={1}
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, "quantity", e.target.value)
                    }
                  />
                  <Input
                    className="w-28"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => updateItem(idx, "rate", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus size={14} className="mr-1" /> Add Item
              </Button>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-border text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${calculateTotal(form.items).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Sales Tax (7.0%)</span>
                <span>${(calculateTotal(form.items) * 0.07).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-border/50">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-foreground">
                  ${(calculateTotal(form.items) * 1.07).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional notes for the client..."
                rows={2}
              />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={createInvoice}
            >
              {editingInvoiceId ? "Save Changes" : "Create Invoice"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* RECORD PAYMENT DIALOG */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="w-full max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Invoice {selectedInvoice?.number} — $
              {(selectedInvoice?.total || 0).toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "card", label: "Credit/Debit", icon: CreditCard },
                  { value: "cashapp", label: "CashApp", icon: Banknote },
                  { value: "cash", label: "Cash", icon: DollarSign },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setPaymentForm({ ...paymentForm, method: opt.value })
                    }
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                      paymentForm.method === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card hover:bg-muted/50"
                    }`}
                  >
                    <opt.icon size={18} />
                    <span className="text-xs font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {paymentForm.method === "card" && (
              <>
                <div className="space-y-1.5">
                  <Label>Card Number</Label>
                  <Input
                    placeholder="0000 0000 0000 0000"
                    value={paymentForm.cardNumber}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        cardNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Expiry</Label>
                    <Input
                      placeholder="MM/YY"
                      value={paymentForm.expiry}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          expiry: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>CVC</Label>
                    <Input
                      placeholder="123"
                      value={paymentForm.cvc}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, cvc: e.target.value })
                      }
                    />
                  </div>
                </div>
              </>
            )}

            {paymentForm.method === "cashapp" && (
              <div className="space-y-1.5">
                <Label>CashApp $Cashtag</Label>
                <Input
                  placeholder="$yourtag"
                  value={paymentForm.cashappTag}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      cashappTag: e.target.value,
                    })
                  }
                />
              </div>
            )}

            {paymentForm.method === "cash" && (
              <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                Record a cash payment received in person.
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowPayment(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={processPayment}
            >
              Confirm Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SEND INVOICE DIALOG */}
      <Dialog open={showSend} onOpenChange={setShowSend}>
        <DialogContent className="w-full max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Send Invoice</DialogTitle>
            <DialogDescription>
              Send {selectedInvoice?.number} to {selectedInvoice?.clientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {[
              {
                method: "email",
                label: "Email",
                sub: selectedInvoice?.clientEmail,
                icon: Mail,
                color: "primary",
              },
              {
                method: "sms",
                label: "Text Message",
                sub: selectedInvoice?.clientPhone || "No phone on file",
                icon: Smartphone,
                color: "blue-500",
              },
              {
                method: "whatsapp",
                label: "WhatsApp",
                sub: "Send via WhatsApp",
                icon: MessageSquare,
                color: "green-500",
              },
            ].map(({ method, label, sub, icon: Icon, color }) => (
              <button
                key={method}
                onClick={() => sendInvoice(method)}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left"
              >
                <div
                  className={`w-10 h-10 rounded-full bg-${color}/10 flex items-center justify-center flex-shrink-0`}
                >
                  <Icon size={18} className={`text-${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{label}</p>
                  <p className="text-sm text-muted-foreground truncate">{sub}</p>
                </div>
                <ExternalLink size={14} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* VIEW INVOICE DIALOG */}
      <Dialog open={showViewInvoice} onOpenChange={setShowViewInvoice}>
        <DialogContent className="w-full max-w-[650px] max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-4 mb-4">
            <DialogTitle className="text-xl flex items-center justify-between">
              <span>Invoice Details</span>
              <Badge variant="outline" className={statusColors[selectedInvoice?.status] || ""}>
                {selectedInvoice?.status}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="bg-card border p-6 rounded-xl space-y-6 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Atlanta TV Mount Pro</h2>
                    <p className="text-xs text-muted-foreground">770-374-3203 • info@atltvmountpro.com</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-primary">{selectedInvoice.number}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Issued: {new Date(selectedInvoice.created).toLocaleDateString()}
                    </p>
                    {selectedInvoice.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <hr className="border-border/50" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Bill To</span>
                    <p className="font-semibold mt-1">{selectedInvoice.clientName}</p>
                    <p className="text-xs text-muted-foreground">{selectedInvoice.clientEmail}</p>
                    {selectedInvoice.clientPhone && (
                      <p className="text-xs text-muted-foreground">{selectedInvoice.clientPhone}</p>
                    )}
                  </div>
                  {selectedInvoice.jobDate && (
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Job Details</span>
                      <p className="mt-1">Date: {new Date(selectedInvoice.jobDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                <div className="border border-border/50 rounded-lg overflow-hidden mt-4">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-muted-foreground font-medium text-xs">
                      <tr>
                        <th className="px-4 py-2 text-left">Description</th>
                        <th className="px-4 py-2 text-center w-16">Qty</th>
                        <th className="px-4 py-2 text-right w-24">Rate</th>
                        <th className="px-4 py-2 text-right w-28">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-xs">
                      {(selectedInvoice.items || []).map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2.5 text-left font-medium">{item.description}</td>
                          <td className="px-4 py-2.5 text-center">{item.quantity}</td>
                          <td className="px-4 py-2.5 text-right">${(item.rate || 0).toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-right">${((item.quantity || 0) * (item.rate || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-4">
                  <div className="w-64 space-y-1.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal:</span>
                      <span>${(selectedInvoice.subtotal ?? (selectedInvoice.total / 1.07)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Sales Tax (7.0%):</span>
                      <span>${(selectedInvoice.tax ?? (selectedInvoice.total - (selectedInvoice.total / 1.07))).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-1.5 text-base text-foreground">
                      <span>Total:</span>
                      <span>${(selectedInvoice.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div className="pt-4 border-t text-xs text-muted-foreground font-normal">
                    <span className="font-semibold block mb-0.5">Notes:</span>
                    <p>{selectedInvoice.notes}</p>
                  </div>
                )}

                {selectedInvoice.status === "paid" && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 rounded-lg text-xs flex justify-between items-center">
                    <span>
                      <strong>Payment Received:</strong> via {selectedInvoice.paymentMethod} on{" "}
                      {selectedInvoice.paidDate ? new Date(selectedInvoice.paidDate).toLocaleString() : "N/A"}
                    </span>
                    {selectedInvoice.receipt?.number && (
                      <span className="font-mono font-semibold">{selectedInvoice.receipt.number}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const sub = (selectedInvoice.subtotal ?? (selectedInvoice.total / 1.07)).toFixed(2);
                    const tx = (selectedInvoice.tax ?? (selectedInvoice.total - (selectedInvoice.total / 1.07))).toFixed(2);
                    const tot = (selectedInvoice.total || 0).toFixed(2);
                    const itemsHtml = (selectedInvoice.items || []).map(item => `
                      <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 10px 0; text-align: left;">${item.description}</td>
                        <td style="padding: 10px 0; text-align: center;">${item.quantity}</td>
                        <td style="padding: 10px 0; text-align: right;">$${(item.rate || 0).toFixed(2)}</td>
                        <td style="padding: 10px 0; text-align: right;">$${((item.quantity || 0) * (item.rate || 0)).toFixed(2)}</td>
                      </tr>
                    `).join("");
                    const notesHtml = selectedInvoice.notes ? `
                      <div style="margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 15px;">
                        <h4 style="margin: 0 0 5px 0; font-size: 14px;">Notes:</h4>
                        <p style="margin: 0; font-size: 12px; color: #475569;">${selectedInvoice.notes}</p>
                      </div>
                    ` : "";
                    const paymentHtml = selectedInvoice.status === "paid" ? `
                      <div style="margin-top: 20px; padding: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; font-size: 13px; color: #166534; display: flex; justify-content: space-between;">
                        <span><strong>Payment Received:</strong> via ${selectedInvoice.paymentMethod} on ${selectedInvoice.paidDate ? new Date(selectedInvoice.paidDate).toLocaleString() : "N/A"}</span>
                        <span style="font-family: monospace; font-weight: bold;">${selectedInvoice.receipt?.number || ""}</span>
                      </div>
                    ` : "";

                    const html = `
                      <div style="max-width: 800px; margin: 0 auto; padding: 20px; color: #1e293b; line-height: 1.5;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 30px;">
                          <div>
                            <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #0f172a;">Atlanta TV Mount Pro</h1>
                            <p style="margin: 3px 0 0 0; font-size: 14px; color: #64748b;">770-374-3203 | info@atltvmountpro.com</p>
                          </div>
                          <div style="text-align: right;">
                            <h2 style="margin: 0; font-size: 22px; font-weight: bold; color: #3b82f6;">INVOICE</h2>
                            <p style="margin: 5px 0; font-size: 15px; font-weight: bold;">${selectedInvoice.number}</p>
                            <p style="margin: 2px 0; font-size: 13px; color: #64748b;">Issued: ${new Date(selectedInvoice.created).toLocaleDateString()}</p>
                            ${selectedInvoice.dueDate ? `<p style="margin: 2px 0; font-size: 13px; color: #64748b;">Due: ${new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>` : ""}
                          </div>
                        </div>

                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 25px;" />

                        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px;">
                          <div>
                            <span style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">Bill To:</span>
                            <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 15px;">${selectedInvoice.clientName}</p>
                            <p style="margin: 2px 0; color: #475569;">${selectedInvoice.clientEmail}</p>
                            ${selectedInvoice.clientPhone ? `<p style="margin: 2px 0; color: #475569;">${selectedInvoice.clientPhone}</p>` : ""}
                          </div>
                          ${selectedInvoice.jobDate ? `
                            <div style="text-align: right;">
                              <span style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">Job Details:</span>
                              <p style="margin: 5px 0 0 0;">Date: ${new Date(selectedInvoice.jobDate).toLocaleDateString()}</p>
                            </div>
                          ` : ""}
                        </div>

                        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                          <thead>
                            <tr style="border-bottom: 2px solid #cbd5e1; font-weight: bold; color: #475569;">
                              <th style="padding: 10px 0; text-align: left;">Description</th>
                              <th style="padding: 10px 0; text-align: center; width: 80px;">Qty</th>
                              <th style="padding: 10px 0; text-align: right; width: 100px;">Rate</th>
                              <th style="padding: 10px 0; text-align: right; width: 120px;">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${itemsHtml}
                          </tbody>
                        </table>

                        <div style="display: flex; justify-content: flex-end; margin-top: 30px;">
                          <div style="width: 250px; font-size: 14px;">
                            <div style="display: flex; justify-content: space-between; padding: 5px 0; color: #475569;">
                              <span>Subtotal</span>
                              <span>$${sub}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 5px 0; color: #475569;">
                              <span>Sales Tax (7%)</span>
                              <span>$${tx}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #cbd5e1; font-weight: bold; font-size: 16px; color: #0f172a; margin-top: 5px;">
                              <span>Total</span>
                              <span>$${tot}</span>
                            </div>
                          </div>
                        </div>

                        ${notesHtml}
                        ${paymentHtml}
                      </div>
                    `;
                    handlePrint(`Invoice-${selectedInvoice.number}`, html);
                  }}
                  className="gap-1.5"
                >
                  <Printer size={14} /> Print Invoice
                </Button>
                {role !== "Viewer" && (
                  <Button
                    variant="outline"
                    onClick={() => openEditInvoice(selectedInvoice)}
                    className="gap-1.5"
                  >
                    <Pencil size={14} /> Edit Invoice
                  </Button>
                )}
                <Button onClick={() => setShowViewInvoice(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* VIEW RECEIPT DIALOG */}
      <Dialog open={showViewReceipt} onOpenChange={setShowViewReceipt}>
        <DialogContent className="w-full max-w-[500px] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-4 mb-4">
            <DialogTitle className="text-xl flex items-center justify-between">
              <span>Digital Payment Receipt</span>
              <Badge className="bg-green-500 hover:bg-green-600 text-white font-semibold">PAID</Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && selectedInvoice.receipt && (
            <div className="space-y-6">
              <div className="bg-green-500/5 dark:bg-green-500/10 border border-green-500/20 p-6 rounded-xl space-y-6 shadow-sm">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 size={24} className="text-green-500" />
                  </div>
                  <h3 className="font-bold text-lg">Payment Successful</h3>
                  <p className="text-2xl font-bold text-green-600 mt-1">${(selectedInvoice.receipt.amount || selectedInvoice.total).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Receipt #: {selectedInvoice.receipt.number}</p>
                </div>

                <hr className="border-green-500/20" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid To:</span>
                    <span className="font-semibold text-right text-foreground">Atlanta TV Mount Pro</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid By:</span>
                    <span className="font-semibold text-right text-foreground">{selectedInvoice.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact Email:</span>
                    <span className="font-medium text-right text-xs text-foreground">{selectedInvoice.clientEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date Paid:</span>
                    <span className="font-medium text-right text-foreground">{new Date(selectedInvoice.receipt.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-semibold text-right capitalize text-foreground">{selectedInvoice.receipt.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction Details:</span>
                    <span className="font-mono text-right text-xs text-foreground">{selectedInvoice.receipt.details}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="font-mono text-right text-xs text-muted-foreground">{selectedInvoice.receipt.transactionId}</span>
                  </div>
                </div>

                <hr className="border-green-500/10" />

                <div className="text-center text-xs text-muted-foreground">
                  <p>Linked to Invoice: <strong>{selectedInvoice.number}</strong></p>
                  <p className="mt-1 font-semibold text-foreground">Thank you for your business!</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const rx = selectedInvoice.receipt;
                    const html = `
                      <div style="max-width: 550px; margin: 40px auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b; line-height: 1.5; font-family: sans-serif; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                        <div style="text-align: center; margin-bottom: 25px;">
                          <div style="width: 48px; height: 48px; border-radius: 50%; background: #dcfce7; display: inline-flex; items-center; justify-content: center; margin-bottom: 10px; color: #166534; font-size: 24px; line-height: 48px; text-align: center; font-weight: bold;">✓</div>
                          <h2 style="margin: 0; font-size: 20px; font-weight: bold; color: #0f172a;">Payment Receipt</h2>
                          <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold; color: #16a34a;">$${(rx.amount || selectedInvoice.total).toFixed(2)}</p>
                          <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">Receipt #: ${rx.number}</p>
                        </div>

                        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />

                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                          <tbody>
                            <tr>
                              <td style="padding: 6px 0; color: #64748b;">Paid To:</td>
                              <td style="padding: 6px 0; text-align: right; font-weight: bold;">Atlanta TV Mount Pro</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #64748b;">Paid By:</td>
                              <td style="padding: 6px 0; text-align: right; font-weight: bold;">${selectedInvoice.clientName}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #64748b;">Client Email:</td>
                              <td style="padding: 6px 0; text-align: right;">${selectedInvoice.clientEmail}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #64748b;">Date Paid:</td>
                              <td style="padding: 6px 0; text-align: right;">${new Date(rx.timestamp).toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #64748b;">Payment Method:</td>
                              <td style="padding: 6px 0; text-align: right; text-transform: capitalize; font-weight: bold;">${rx.method}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #64748b;">Payment Details:</td>
                              <td style="padding: 6px 0; text-align: right; font-family: monospace; font-size: 13px;">${rx.details}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #64748b;">Transaction ID:</td>
                              <td style="padding: 6px 0; text-align: right; font-family: monospace; font-size: 13px; color: #64748b;">${rx.transactionId}</td>
                            </tr>
                          </tbody>
                        </table>

                        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />

                        <div style="text-align: center; font-size: 13px; color: #64748b;">
                          <p style="margin: 0;">Linked to Invoice: <strong>${selectedInvoice.number}</strong></p>
                          <p style="margin: 8px 0 0 0; font-weight: bold; color: #475569;">Thank you for your business!</p>
                        </div>
                      </div>
                    `;
                    handlePrint(`Receipt-${rx.number}`, html);
                  }}
                  className="gap-1.5"
                >
                  <Printer size={14} /> Print Receipt
                </Button>
                <Button onClick={() => setShowViewReceipt(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceModule;
