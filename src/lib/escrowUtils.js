export const ESCROW_STORAGE_KEY = "atltvmountpro_escrow_ledger";

export function getEscrowLedger() {
  try {
    return JSON.parse(localStorage.getItem(ESCROW_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveEscrowLedger(ledger) {
  localStorage.setItem(ESCROW_STORAGE_KEY, JSON.stringify(ledger));
}

export function createEscrowEntry(booking, invoice, tipAmount = 0) {
  const ledger = getEscrowLedger();
  
  // Prevent duplicate entries for the same booking
  if (ledger.some(entry => entry.bookingId === booking.id)) {
    return null;
  }

  const baseRate = parseFloat(booking.estimated_quote || invoice.subtotal || invoice.total || 0);
  const techCommission = baseRate * 0.70;
  const tip = parseFloat(tipAmount) || 0;
  const totalPayout = techCommission + tip;

  const entry = {
    id: "esc_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
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

  ledger.unshift(entry);
  saveEscrowLedger(ledger);
  return entry;
}

export function updateEscrowStatusByBooking(bookingId, status, updates = {}) {
  const ledger = getEscrowLedger();
  const idx = ledger.findIndex(e => e.bookingId === bookingId);
  if (idx !== -1) {
    ledger[idx] = { 
      ...ledger[idx], 
      status,
      ...updates 
    };
    if (status === "Refunded") {
      ledger[idx].baseCommission = 0;
      ledger[idx].tipAmount = 0;
      ledger[idx].totalPayout = 0;
    }
    saveEscrowLedger(ledger);
    return ledger[idx];
  }
  return null;
}
