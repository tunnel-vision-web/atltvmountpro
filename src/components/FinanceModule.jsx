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
} from "@/lib/invoiceUtils";

export { autoCreateInvoiceForBooking, sendInvoiceVia, getInvoiceForBooking } from "@/lib/invoiceUtils";

const FinanceModule = ({ initialData = null }) => {
  const [invoices, setInvoices] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

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
    setInvoices(getInvoices());
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

    const total = calculateTotal(form.items);
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
      saveInvoices(all);
      setInvoices(all);
      toast.success(
        `Payment of $${all[idx].total.toFixed(2)} received via ${method}.`,
      );
    }
    setShowPayment(false);
    setSelectedInvoice(null);
  };

  const openSend = (inv) => {
    setSelectedInvoice(inv);
    setShowSend(true);
  };

  const sendInvoice = (method) => {
    if (!selectedInvoice) return;
    const ok = sendInvoiceVia(selectedInvoice, method);
    if (!ok && method !== "email") {
      toast.error("Client phone number is required for text or WhatsApp.");
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

  return (
    <div className="space-y-6">
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
        {filteredInvoices.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <DollarSign className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No invoices</h3>
            <p className="text-sm text-muted-foreground">
              Create your first invoice or schedule a job to auto-generate one.
            </p>
          </div>
        ) : (
          filteredInvoices.map((inv) => (
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
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold mr-2">
                    ${(inv.total || 0).toFixed(2)}
                  </p>
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
          ))
        )}
      </div>

      <Dialog
        open={showCreate}
        onOpenChange={(open) => {
          setShowCreate(open);
          if (!open) {
            setShowDirectoryPicker(false);
            setShowNewClientForm(false);
            setDirectorySearch("");
          }
        }}
      >
        <DialogContent className="w-full max-w-[560px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
            <DialogTitle className="text-lg">Create Invoice</DialogTitle>
            <DialogDescription className="text-sm mt-0.5">
              Pick a client from your directory or add a new one.
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

            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold">
                ${calculateTotal(form.items).toFixed(2)}
              </span>
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
              Create Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
    </div>
  );
};

export default FinanceModule;
