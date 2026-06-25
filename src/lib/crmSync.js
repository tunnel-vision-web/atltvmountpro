/**
 * Utility to sync events from Atlanta TV Mount to Intermaven CRM Ingest API.
 */
export async function syncToIntermavenCRM(eventType, clientEmail, clientName, clientPhone, payload) {
  try {
    const intermavenBackendUrl =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:8001"
        : "https://intermaven-production.up.railway.app";

    const response = await fetch(`${intermavenBackendUrl}/api/crm/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Partner-Client-ID": "atltvmount",
        "X-Partner-Client-Secret": "atltvmount_secret_secure_2026",
      },
      body: JSON.stringify({
        partner_id: "atltvmount",
        event_type: eventType,
        client_email: clientEmail,
        client_name: clientName || null,
        client_phone: clientPhone || null,
        payload: payload,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.warn("CRM Ingestion warning:", err.detail || response.statusText);
      return { success: false, error: err.detail || response.statusText };
    }

    const data = await response.json();
    console.log("CRM Ingestion success:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to dispatch CRM webhook:", error);
    return { success: false, error: error.message };
  }
}
