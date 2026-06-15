export const INVOICE_STORAGE_KEY = "atltv_invoices";
export const CLIENT_DIRECTORY_KEY = "atltv_client_directory";

export const statusColors = {
  draft: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  sent: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  pending: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  paid: "bg-green-500/10 text-green-500 border-green-500/20",
  overdue: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function getInvoices() {
  try {
    return JSON.parse(localStorage.getItem(INVOICE_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveInvoices(invoices) {
  localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(invoices));
}

export function generateInvoiceNumber() {
  const prefix = "INV";
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${date}-${random}`;
}

export function addSevenDays(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

/** Merge clients from dedicated directory, local users, and bookings */
export function getClientDirectory() {
  const seen = new Set();
  const clients = [];

  const add = (c) => {
    const email = (c.email || "").trim().toLowerCase();
    if (!email || seen.has(email)) return;
    seen.add(email);
    clients.push({
      id: c.id || `client_${email.replace(/[^a-z0-9]/g, "_")}`,
      name: c.name || c.email,
      email: c.email,
      phone: c.phone || "",
    });
  };

  try {
    JSON.parse(localStorage.getItem(CLIENT_DIRECTORY_KEY) || "[]").forEach(add);
  } catch {}
  try {
    JSON.parse(localStorage.getItem("atltv_local_users") || "[]").forEach((u) =>
      add({ name: u.name || u.email, email: u.email, phone: u.phone }),
    );
  } catch {}
  try {
    JSON.parse(
      localStorage.getItem("atltvmountpro_local_bookings") || "[]",
    ).forEach((b) => add({ name: b.name, email: b.email, phone: b.phone }));
  } catch {}

  return clients;
}

export function saveClientToDirectory(client) {
  if (!client?.email) return null;
  const existing = getClientDirectory();
  const email = client.email.trim().toLowerCase();
  const record = {
    id: client.id || `client_${Date.now()}`,
    name: client.name || client.email,
    email: client.email,
    phone: client.phone || "",
    created: new Date().toISOString(),
  };
  const stored = JSON.parse(localStorage.getItem(CLIENT_DIRECTORY_KEY) || "[]");
  const idx = stored.findIndex((c) => c.email?.toLowerCase() === email);
  if (idx >= 0) {
    stored[idx] = { ...stored[idx], ...record };
  } else {
    stored.push(record);
  }
  localStorage.setItem(CLIENT_DIRECTORY_KEY, JSON.stringify(stored));
  return record;
}

export function autoCreateInvoiceForBooking(booking, options = {}) {
  const existing = getInvoices();
  if (existing.find((inv) => inv.bookingId === booking.id)) return null;

  const jobDate = booking.preferred_date || null;
  const estimatedTotal = options.estimatedTotal ?? booking.estimated_quote ?? 0;

  saveClientToDirectory({
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
  });

  const invoice = {
    id: "inv_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
    number: generateInvoiceNumber(),
    clientName: booking.name,
    clientEmail: booking.email,
    clientPhone: booking.phone || "",
    clientId: null,
    bookingId: booking.id,
    jobId: booking.jobId || null,
    items: [
      {
        description: booking.service_type || "Service",
        quantity: 1,
        rate: Number(estimatedTotal) || 0,
      },
    ],
    notes: booking.project_description || "",
    total: Number(estimatedTotal) || 0,
    status: "draft",
    created: new Date().toISOString(),
    jobDate,
    dueDate: jobDate ? addSevenDays(jobDate) : null,
    paidDate: null,
    paymentMethod: null,
  };

  const next = [invoice, ...existing];
  saveInvoices(next);
  return invoice;
}

export function getInvoiceForBooking(bookingId) {
  return getInvoices().find((inv) => inv.bookingId === bookingId) || null;
}

export function getInvoiceForJob(jobId) {
  return getInvoices().find((inv) => inv.jobId === jobId) || null;
}

export function updateInvoice(id, updates) {
  const all = getInvoices();
  const idx = all.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
  if (updates.items) {
    all[idx].total = updates.items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.rate || 0),
      0,
    );
  }
  saveInvoices(all);
  return all[idx];
}

export function buildInvoiceMessage(invoice) {
  const due = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString()
    : "Upon receipt";
  return `Hi ${invoice.clientName},\n\nPlease find your invoice from ATL TV Mount PRO.\n\nInvoice: ${invoice.number}\nAmount: $${(invoice.total || 0).toFixed(2)}\nJob Date: ${invoice.jobDate ? new Date(invoice.jobDate).toLocaleDateString() : "TBD"}\nDue: ${due}\n\nThank you,\nATL TV Mount PRO\n770-374-3203`;
}

export function sendInvoiceVia(invoice, method) {
  if (!invoice) return false;
  const subject = encodeURIComponent(
    `Invoice ${invoice.number} from ATL TV Mount PRO`,
  );
  const body = encodeURIComponent(buildInvoiceMessage(invoice));
  const phone = (invoice.clientPhone || "").replace(/\D/g, "");

  if (method === "email") {
    window.open(
      `mailto:${invoice.clientEmail}?subject=${subject}&body=${body}`,
    );
  } else if (method === "sms") {
    if (!phone) return false;
    window.open(`sms:+1${phone}?body=${body}`);
  } else if (method === "whatsapp") {
    if (!phone) return false;
    window.open(`https://wa.me/1${phone}?text=${body}`);
  } else {
    return false;
  }

  updateInvoice(invoice.id, { status: "sent" });
  return true;
}
