import { pocketbaseClient as pb } from "./pocketbaseClient";

export const ESCROW_STORAGE_KEY = "atltvmountpro_escrow_ledger";

// Local storage fallback helper
function getLocalEscrowLedger() {
  try {
    return JSON.parse(localStorage.getItem(ESCROW_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLocalEscrowLedger(ledger) {
  localStorage.setItem(ESCROW_STORAGE_KEY, JSON.stringify(ledger));
}

export async function getEscrowLedger() {
  try {
    const records = await pb.collection("escrow_ledger").getFullList({
      sort: "-created"
    });
    // map pocketbase fields back to client structure
    const ledger = records.map(r => ({
      id: r.id,
      bookingId: r.bookingId,
      invoiceId: r.invoiceId,
      techId: r.techId,
      techName: r.techName,
      techEmail: r.techEmail,
      clientName: r.clientName,
      clientEmail: r.clientEmail,
      serviceType: r.serviceType,
      jobDate: r.jobDate,
      invoiceTotal: r.invoiceTotal,
      baseCommission: r.baseCommission,
      tipAmount: r.tipAmount,
      totalPayout: r.totalPayout,
      status: r.status,
      paidDate: r.paidDate || r.created,
      releaseTime: r.releaseTime || (Date.parse(r.created) + 48 * 3600 * 1000),
      disputed: r.disputed || false,
      disputeTicketId: r.disputeTicketId || null,
    }));
    saveLocalEscrowLedger(ledger); // keep local cache updated
    return ledger;
  } catch (err) {
    console.warn("PocketBase getEscrowLedger failed, using local storage cache:", err);
    return getLocalEscrowLedger();
  }
}

export function saveEscrowLedger(ledger) {
  saveLocalEscrowLedger(ledger);
}

export async function createEscrowEntry(booking, invoice, tipAmount = 0) {
  const localLedger = getLocalEscrowLedger();
  
  // Prevent duplicate entries locally/caching
  if (localLedger.some(entry => entry.bookingId === booking.id)) {
    return null;
  }

  const baseRate = parseFloat(booking.estimated_quote || invoice.subtotal || invoice.total || 0);
  const techCommission = baseRate * 0.70;
  const tip = parseFloat(tipAmount) || 0;
  const totalPayout = techCommission + tip;

  const entry = {
    bookingId: booking.id,
    invoiceId: invoice.id,
    techId: booking.assignedTechId || "mock_tech_id",
    techName: booking.assignedTechName || "Unassigned",
    techEmail: booking.assignedTechEmail || "",
    clientName: booking.name || invoice.clientName,
    clientEmail: booking.email || invoice.clientEmail,
    serviceType: booking.service_type || booking.service || "TV Mounting",
    jobDate: booking.preferred_date || invoice.jobDate || new Date().toISOString().slice(0, 10),
    invoiceTotal: invoice.total || baseRate,
    baseCommission: techCommission,
    tipAmount: tip,
    totalPayout: totalPayout,
    status: "Holding", // Holding | Frozen | Released | Refunded
    paidDate: new Date().toISOString(),
    releaseTime: Date.now() + 48 * 3600 * 1000, // 48 hours hold
    disputed: false,
    disputeTicketId: null,
  };

  // Try to create in PocketBase
  try {
    const record = await pb.collection("escrow_ledger").create(entry);
    const createdEntry = {
      ...entry,
      id: record.id,
      paidDate: record.paidDate || record.created
    };
    localLedger.unshift(createdEntry);
    saveLocalEscrowLedger(localLedger);
    return createdEntry;
  } catch (err) {
    console.warn("PocketBase createEscrowEntry failed, using local storage cache fallback:", err);
    // fallback to local storage entry with generated ID
    const fallbackEntry = {
      ...entry,
      id: "esc_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6)
    };
    localLedger.unshift(fallbackEntry);
    saveLocalEscrowLedger(localLedger);
    return fallbackEntry;
  }
}

export async function updateEscrowStatusByBooking(bookingId, status, updates = {}) {
  const localLedger = getLocalEscrowLedger();
  const idx = localLedger.findIndex(e => e.bookingId === bookingId);
  
  let entryToUpdate = null;
  if (idx !== -1) {
    localLedger[idx] = { 
      ...localLedger[idx], 
      status,
      ...updates 
    };
    if (status === "Refunded") {
      localLedger[idx].baseCommission = 0;
      localLedger[idx].tipAmount = 0;
      localLedger[idx].totalPayout = 0;
    }
    saveLocalEscrowLedger(localLedger);
    entryToUpdate = localLedger[idx];
  }

  // Try to update in PocketBase
  try {
    const record = await pb.collection("escrow_ledger").getFirstListItem(`bookingId="${bookingId}"`);
    if (record) {
      const pbUpdates = {
        status,
        ...updates
      };
      if (status === "Refunded") {
        pbUpdates.baseCommission = 0;
        pbUpdates.tipAmount = 0;
        pbUpdates.totalPayout = 0;
      }
      const updatedRecord = await pb.collection("escrow_ledger").update(record.id, pbUpdates);
      return {
        ...entryToUpdate,
        id: updatedRecord.id
      };
    }
  } catch (err) {
    console.warn(`PocketBase updateEscrowStatusByBooking failed for booking ${bookingId}:`, err);
  }
  
  return entryToUpdate; // return local update fallback
}
