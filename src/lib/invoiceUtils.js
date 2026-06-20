import React from "react";
import pb from "./pocketbaseClient";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

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

  const baseRates = {
    "TV Mounting": 120,
    "Drywall Repair": 150,
    "Painting": 200,
    "Carpentry": 180,
    "Flooring": 250,
    "Plumbing": 140,
    "Light Electrical": 110,
  };
  const serviceRate = Number(estimatedTotal) || baseRates[booking.service_type] || 120;

  // Extract hardware items from booking or options
  const hardwareItems = booking.hardwareItems || options.hardwareItems || [];

  const items = [
    {
      description: `${booking.service_type || "Service"} (Base)`,
      quantity: 1,
      rate: serviceRate,
    },
    ...hardwareItems.map((hw) => ({
      description: hw.name,
      quantity: 1,
      rate: Number(hw.price) || 0,
    })),
  ];

  const subtotal = items.reduce((sum, item) => sum + item.rate * item.quantity, 0);
  const taxRate = 0.07;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const invoice = {
    id: "inv_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
    number: generateInvoiceNumber(),
    clientName: booking.name,
    clientEmail: booking.email,
    clientPhone: booking.phone || "",
    clientId: null,
    bookingId: booking.id,
    jobId: booking.jobId || null,
    items: items,
    notes: booking.project_description || "",
    subtotal: subtotal,
    tax: tax,
    total: total,
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

  const wasPaid = all[idx].status === "paid";
  const isRefunded = updates.status === "refunded";

  all[idx] = { ...all[idx], ...updates };
  if (updates.items) {
    const subtotal = updates.items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.rate || 0),
      0,
    );
    const tax = subtotal * 0.07;
    const total = subtotal + tax;
    all[idx].subtotal = subtotal;
    all[idx].tax = tax;
    all[idx].total = total;
  }

  // If transitioning to refunded, insert negative transaction into the ledger
  if (wasPaid && isRefunded) {
    const original = all[idx];
    const refundNo = "REF-" + original.number;
    // Check if refund already exists in all
    const alreadyRefunded = all.some(inv => inv.number === refundNo);
    if (!alreadyRefunded) {
      const refundEntry = {
        id: "ref_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
        number: refundNo,
        clientName: original.clientName,
        clientEmail: original.clientEmail,
        clientPhone: original.clientPhone || "",
        clientId: original.clientId || null,
        bookingId: original.bookingId,
        jobId: original.jobId,
        items: [
          {
            description: `Refund for ${original.number}`,
            quantity: 1,
            rate: -original.total,
          }
        ],
        subtotal: -original.subtotal,
        tax: -original.tax,
        total: -original.total,
        status: "paid", // marked paid so it counts in revenue totals
        created: new Date().toISOString(),
        jobDate: original.jobDate,
        dueDate: original.dueDate,
        paidDate: new Date().toISOString(),
        paymentMethod: original.paymentMethod,
      };
      all.unshift(refundEntry);
    }
  }

  saveInvoices(all);
  return all[idx];
}

export function buildInvoiceMessage(invoice) {
  const due = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString()
    : "Upon receipt";
  return `Hi ${invoice.clientName},\n\nPlease find your invoice from Atlanta TV Mount Pro.\n\nInvoice: ${invoice.number}\nAmount: $${(invoice.total || 0).toFixed(2)}\nJob Date: ${invoice.jobDate ? new Date(invoice.jobDate).toLocaleDateString() : "TBD"}\nDue: ${due}\n\nThank you,\nAtlanta TV Mount Pro\n770-374-3203`;
}

export async function sendInvoiceVia(invoice, method) {
  if (!invoice) return false;

  // 1. Fetch client from PocketBase
  let optInStatus = "Pending";
  let doubleOptInToken = "";
  let clientRecord = null;

  try {
    const list = await pb.collection("clients").getList(1, 1, {
      filter: `email = "${invoice.clientEmail}"`
    });
    if (list.items.length > 0) {
      clientRecord = list.items[0];
      optInStatus = clientRecord.OptIn_Status || "Pending";
      doubleOptInToken = clientRecord.DoubleOptIn_Token || "";
    } else {
      optInStatus = "Pending";
    }
  } catch (err) {
    console.warn("Failed to query PocketBase for client opt-in status, fallback to local:", err);
    try {
      const stored = localStorage.getItem("atltvmountpro_local_clients");
      if (stored) {
        const clients = JSON.parse(stored);
        const match = clients.find(c => c.email?.toLowerCase() === invoice.clientEmail?.toLowerCase());
        if (match) {
          optInStatus = match.OptIn_Status || "Pending";
          doubleOptInToken = match.DoubleOptIn_Token || "";
        }
      }
    } catch {}
  }

  // 2. Block if status is not 'Confirmed'
  if (optInStatus !== "Confirmed") {
    const token = doubleOptInToken || Math.random().toString(36).substr(2, 12);
    const verifyLink = `${window.location.origin}/verify-optin?token=${token}&email=${encodeURIComponent(invoice.clientEmail)}`;
    
    // Save token if not exists and we found a client record
    if (clientRecord && !doubleOptInToken) {
      pb.collection("clients").update(clientRecord.id, { DoubleOptIn_Token: token }).catch(console.error);
    }

    toast.error(
      React.createElement("div", { className: "flex flex-col gap-1.5 text-left" },
        React.createElement("span", { className: "font-bold text-xs" }, "Dispatch Blocked: Client Not Opted-In"),
        React.createElement("span", { className: "text-[10px] text-muted-foreground" }, 
          "Anti-spam laws require double opt-in verification before sending invoices."
        ),
        React.createElement("a", { 
          href: verifyLink, 
          target: "_blank", 
          rel: "noreferrer",
          className: "text-xs text-primary underline font-bold mt-1 flex items-center gap-0.5 hover:text-primary/80"
        }, "Send Double Opt-In Invite ", React.createElement(ExternalLink, { size: 10 }))
      ),
      { duration: 8000 }
    );
    return false;
  }

  const subject = encodeURIComponent(
    `Invoice ${invoice.number} from Atlanta TV Mount Pro`,
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
