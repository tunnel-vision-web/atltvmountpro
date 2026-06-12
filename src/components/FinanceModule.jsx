import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
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
  Printer,
  Trash2,
} from 'lucide-react';

const INVOICE_STORAGE_KEY = 'atltv_invoices';

const statusColors = {
  draft: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  sent: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  pending: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  paid: 'bg-green-500/10 text-green-500 border-green-500/20',
  overdue: 'bg-red-500/10 text-red-500 border-red-500/20',
};

function getInvoices() {
  try {
    return JSON.parse(localStorage.getItem(INVOICE_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveInvoices(invoices) {
  localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(invoices));
}

function generateInvoiceNumber() {
  const prefix = 'INV';
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${date}-${random}`;
}

const FinanceModule = () => {
  const [invoices, setInvoices] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    items: [{ description: '', quantity: 1, rate: 0 }],
    notes: '',
    dueDate: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    method: 'card',
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: '',
    cashappTag: '',
  });

  useEffect(() => {
    setInvoices(getInvoices());
  }, []);

  const filteredInvoices =
    filterStatus === 'all' ? invoices : invoices.filter((inv) => inv.status === filterStatus);

  const totalRevenue = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0);
  const outstanding = invoices
    .filter((i) => i.status === 'sent' || i.status === 'pending')
    .reduce((s, i) => s + (i.total || 0), 0);

  const calculateTotal = (items) =>
    items.reduce((sum, item) => sum + (item.quantity || 0) * (item.rate || 0), 0);

  const updateItem = (idx, field, value) => {
    const next = [...form.items];
    next[idx][field] = field === 'description' ? value : parseFloat(value) || 0;
    setForm({ ...form, items: next });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { description: '', quantity: 1, rate: 0 }] });
  const removeItem = (idx) => {
    const next = form.items.filter((_, i) => i !== idx);
    setForm({ ...form, items: next.length ? next : [{ description: '', quantity: 1, rate: 0 }] });
  };

  const createInvoice = () => {
    if (!form.clientName || !form.clientEmail || form.items.every((i) => !i.description)) {
      toast.error('Please fill in client info and at least one line item.');
      return;
    }
    const total = calculateTotal(form.items);
    const invoice = {
      id: 'inv_' + Math.random().toString(36).substr(2, 9),
      number: generateInvoiceNumber(),
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      clientPhone: form.clientPhone,
      clientId: null,
      items: form.items,
      notes: form.notes,
      total,
      status: 'draft',
      created: new Date().toISOString(),
      dueDate: form.dueDate || null,
      paidDate: null,
      paymentMethod: null,
    };
    const next = [invoice, ...getInvoices()];
    saveInvoices(next);
    setInvoices(next);
    setShowCreate(false);
    setForm({ clientName: '', clientEmail: '', clientPhone: '', items: [{ description: '', quantity: 1, rate: 0 }], notes: '', dueDate: '' });
    toast.success(`Invoice ${invoice.number} created.`);
  };

  const deleteInvoice = (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    const next = getInvoices().filter((i) => i.id !== id);
    saveInvoices(next);
    setInvoices(next);
    toast.success('Invoice deleted.');
  };

  const openPayment = (inv) => {
    setSelectedInvoice(inv);
    setPaymentForm({ method: 'card', cardNumber: '', expiry: '', cvc: '', name: '', cashappTag: '' });
    setShowPayment(true);
  };

  const processPayment = () => {
    if (!selectedInvoice) return;
    const { method } = paymentForm;
    if (method === 'card' && (!paymentForm.cardNumber || !paymentForm.expiry || !paymentForm.cvc)) {
      toast.error('Please fill in all card details.');
      return;
    }
    if (method === 'cashapp' && !paymentForm.cashappTag) {
      toast.error('Please enter your CashApp $Cashtag.');
      return;
    }

    const all = getInvoices();
    const idx = all.findIndex((i) => i.id === selectedInvoice.id);
    if (idx !== -1) {
      all[idx].status = 'paid';
      all[idx].paidDate = new Date().toISOString();
      all[idx].paymentMethod = method;
      saveInvoices(all);
      setInvoices(all);
      toast.success(`Payment of $${all[idx].total.toFixed(2)} received via ${method}.`);
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
    const all = getInvoices();
    const idx = all.findIndex((i) => i.id === selectedInvoice.id);
    if (idx !== -1 && all[idx].status === 'draft') {
      all[idx].status = 'sent';
      saveInvoices(all);
      setInvoices(all);
    }
    const methodLabels = { email: 'Email', sms: 'Text message', whatsapp: 'WhatsApp' };
    toast.success(`Invoice sent to ${selectedInvoice.clientName} via ${methodLabels[method]}.`);
    setShowSend(false);
    setSelectedInvoice(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
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
          <p className="text-2xl font-bold">{invoices.filter((i) => i.status === 'paid').length}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
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
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus size={16} className="mr-1" /> New Invoice
        </Button>
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        {filteredInvoices.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <DollarSign className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No invoices</h3>
            <p className="text-sm text-muted-foreground">Create your first invoice to get started.</p>
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
                    <Badge variant="outline" className={statusColors[inv.status] || ''}>
                      {inv.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {inv.clientName} • {inv.clientEmail}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(inv.created).toLocaleDateString()}
                    {inv.dueDate && ` • Due ${new Date(inv.dueDate).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold mr-2">${(inv.total || 0).toFixed(2)}</p>
                  {inv.status === 'draft' && (
                    <Button size="sm" variant="outline" onClick={() => openSend(inv)}>
                      <Send size={14} className="mr-1" /> Send
                    </Button>
                  )}
                  {(inv.status === 'sent' || inv.status === 'pending') && (
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => openPayment(inv)}>
                      <DollarSign size={14} className="mr-1" /> Record Payment
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => deleteInvoice(inv.id)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Invoice Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="w-full max-w-[560px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
            <DialogTitle className="text-lg">Create Invoice</DialogTitle>
            <DialogDescription className="text-sm mt-0.5">
              Enter client details and line items below.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Client Name</Label>
                <Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="John Doe" />
              </div>
              <div className="space-y-1.5">
                <Label>Client Email</Label>
                <Input type="email" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} placeholder="john@example.com" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Client Phone</Label>
              <Input type="tel" value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} placeholder="(555) 123-4567" />
            </div>
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Line Items</Label>
              {form.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    className="flex-1"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  />
                  <Input
                    className="w-20"
                    type="number"
                    min={1}
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                  />
                  <Input
                    className="w-28"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => updateItem(idx, 'rate', e.target.value)}
                  />
                  <button onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-destructive">
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
              <span className="text-xl font-bold">${calculateTotal(form.items).toFixed(2)}</span>
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
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={createInvoice}>
              Create Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="w-full max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Invoice {selectedInvoice?.number} — ${(selectedInvoice?.total || 0).toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'card', label: 'Credit/Debit', icon: CreditCard },
                  { value: 'cashapp', label: 'CashApp', icon: Banknote },
                  { value: 'cash', label: 'Cash', icon: DollarSign },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, method: opt.value })}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                      paymentForm.method === opt.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card hover:bg-muted/50'
                    }`}
                  >
                    <opt.icon size={18} />
                    <span className="text-xs font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {paymentForm.method === 'card' && (
              <>
                <div className="space-y-1.5">
                  <Label>Card Number</Label>
                  <Input
                    placeholder="0000 0000 0000 0000"
                    value={paymentForm.cardNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Expiry</Label>
                    <Input placeholder="MM/YY" value={paymentForm.expiry} onChange={(e) => setPaymentForm({ ...paymentForm, expiry: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>CVC</Label>
                    <Input placeholder="123" value={paymentForm.cvc} onChange={(e) => setPaymentForm({ ...paymentForm, cvc: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Name on Card</Label>
                  <Input value={paymentForm.name} onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })} />
                </div>
              </>
            )}

            {paymentForm.method === 'cashapp' && (
              <div className="space-y-1.5">
                <Label>CashApp $Cashtag</Label>
                <Input
                  placeholder="$yourtag"
                  value={paymentForm.cashappTag}
                  onChange={(e) => setPaymentForm({ ...paymentForm, cashappTag: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Payment will be deposited to the business CashApp account.
                </p>
              </div>
            )}

            {paymentForm.method === 'cash' && (
              <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                Record a cash payment received in person.
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowPayment(false)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={processPayment}>
              Confirm Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      <Dialog open={showSend} onOpenChange={setShowSend}>
        <DialogContent className="w-full max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Send Invoice</DialogTitle>
            <DialogDescription>
              Send {selectedInvoice?.number} to {selectedInvoice?.clientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <button
              onClick={() => sendInvoice('email')}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-sm text-muted-foreground">{selectedInvoice?.clientEmail}</p>
              </div>
            </button>
            <button
              onClick={() => sendInvoice('sms')}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Smartphone size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="font-semibold">Text Message</p>
                <p className="text-sm text-muted-foreground">{selectedInvoice?.clientPhone || 'No phone on file'}</p>
              </div>
            </button>
            <button
              onClick={() => sendInvoice('whatsapp')}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <MessageSquare size={18} className="text-green-500" />
              </div>
              <div>
                <p className="font-semibold">WhatsApp</p>
                <p className="text-sm text-muted-foreground">Send via WhatsApp Business</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceModule;
