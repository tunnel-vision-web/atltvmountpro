const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Stripe = require('stripe');
const PocketBase = require('pocketbase/cjs');

const app = express();
app.use(cors());

// Load environment variables (to be set in your production host environment)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock_secret';
const POCKETBASE_API_URL = process.env.VITE_POCKETBASE_API_URL || 'http://127.0.0.1:8090';

const stripe = Stripe(STRIPE_SECRET_KEY);
const pb = new PocketBase(POCKETBASE_API_URL);

// Authenticate backend PocketBase client as superuser to bypass collection rules
async function initPocketBase() {
  try {
    console.log("Authenticating backend PocketBase client as superuser...");
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL || 'admin@atltvmountpro.com';
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD || 'password123';
    await pb.collection('_superusers').authWithPassword(adminEmail, adminPassword);
    console.log("PocketBase backend client authenticated successfully.");
  } catch (err) {
    console.warn("PocketBase backend superuser authentication failed. Admin collection operations may fail:", err.message);
  }
}
initPocketBase();

// Parse JSON payloads for regular endpoints
app.use((req, res, next) => {
  if (req.originalUrl === '/stripe/webhook') {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});

// Endpoint to create checkout sessions
app.post('/stripe/create-checkout-session', async (req, res) => {
  const { items, customerEmail, total, referenceId, type } = req.body;
  
  try {
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name || 'Store Item',
          description: item.size ? `Size: ${item.size}` : undefined,
        },
        unit_amount: Math.round((item.pricePaid || item.price || total) * 100),
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      metadata: {
        referenceId,
        type // 'store_order' | 'booking_invoice'
      },
      success_url: `${req.headers.origin}/dashboard?payment=success&ref=${referenceId}`,
      cancel_url: `${req.headers.origin}/store?payment=cancelled`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session creation error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Webhook endpoint to receive payments completion from Stripe
app.post('/stripe/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { referenceId, type } = session.metadata;

    console.log(`Payment received for reference ${referenceId} (${type})`);

    try {
      if (type === 'store_order') {
        // Mark store order as Paid in PocketBase
        const record = await pb.collection('atltv_store_orders').getFirstListItem(`id="${referenceId}"`);
        if (record) {
          await pb.collection('atltv_store_orders').update(record.id, { status: 'Paid' });
          console.log(`Store order ${referenceId} marked as Paid.`);
        }
      } else if (type === 'booking_invoice') {
        // Mark booking invoice as paid (completed)
        const record = await pb.collection('appointment_bookings').getFirstListItem(`id="${referenceId}"`);
        if (record) {
          await pb.collection('appointment_bookings').update(record.id, { status: 'completed' });
          console.log(`Booking ${referenceId} marked as completed.`);
        }
      }
    } catch (pbErr) {
      console.error("Failed to update database via webhook:", pbErr.message);
    }
  }

  res.json({ received: true });
});

// Load Checkr environment variables
const CHECKR_API_KEY = process.env.CHECKR_API_KEY || 'sk_test_mock_key';
const CHECKR_PACKAGE_NAME = process.env.CHECKR_PACKAGE_NAME || 'driver_pro';

// Helper to get Checkr Basic Authorization header
const getCheckrAuthHeader = () => {
  return 'Basic ' + Buffer.from(CHECKR_API_KEY + ':').toString('base64');
};

// Endpoint to trigger Checkr background check candidate creation & invitation
app.post('/api/checkr/create-invitation', async (req, res) => {
  const { applicationId } = req.body;
  if (!applicationId) {
    return res.status(400).json({ error: "Missing applicationId" });
  }

  try {
    console.log("Fetching recruit application details for ID:", applicationId);
    const application = await pb.collection('technician_applications').getOne(applicationId);
    
    // Split name into first and last name for Checkr Candidate model
    const nameParts = (application.name || '').trim().split(/\s+/);
    const first_name = nameParts[0] || 'First';
    const last_name = nameParts.slice(1).join(' ') || 'Last';

    // MOCK CHECKR SANDBOX FLOW: if API key is mock, return a simulation URL
    if (CHECKR_API_KEY === 'sk_test_mock_key') {
      const mockCandidateId = "cand_mock_" + Math.floor(Math.random() * 1000000);
      const mockInvitationId = "inv_mock_" + Math.floor(Math.random() * 1000000);
      const mockInvitationUrl = `https://invitation.checkr.com/mock/${mockInvitationId}`;
      
      console.log(`[MOCK MODE] Simulating Checkr invitation for ${application.email}`);
      await pb.collection('technician_applications').update(applicationId, {
        checkrCandidateId: mockCandidateId,
        checkrInvitationId: mockInvitationId,
        checkrInvitationUrl: mockInvitationUrl,
        checkrStatus: "pending",
        bgConsent: true,
        status: "Background Pending"
      });
      
      return res.json({ invitationUrl: mockInvitationUrl, isMock: true });
    }

    let candidateId = application.checkrCandidateId;

    // 1. Create Checkr Candidate if not already registered
    if (!candidateId) {
      console.log("Creating new Candidate profile in Checkr for:", application.email);
      const candidateRes = await fetch("https://api.checkr.com/v1/candidates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": getCheckrAuthHeader()
        },
        body: JSON.stringify({
          first_name,
          last_name,
          email: application.email,
          phone: application.phone,
          no_middle_name: true
        })
      });

      if (!candidateRes.ok) {
        throw new Error(`Checkr Candidate registration failed: ${await candidateRes.text()}`);
      }
      const candidateData = await candidateRes.json();
      candidateId = candidateData.id;
    }

    // 2. Create Background Check Invitation Link
    console.log(`Creating Checkr invitation for Candidate: ${candidateId}`);
    const invitationRes = await fetch("https://api.checkr.com/v1/invitations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": getCheckrAuthHeader()
      },
      body: JSON.stringify({
        candidate_id: candidateId,
        package: CHECKR_PACKAGE_NAME
      })
    });

    if (!invitationRes.ok) {
      throw new Error(`Checkr Invitation creation failed: ${await invitationRes.text()}`);
    }
    const invitationData = await invitationRes.json();

    // 3. Save Candidate details to recruit's application
    await pb.collection('technician_applications').update(applicationId, {
      checkrCandidateId: candidateId,
      checkrInvitationId: invitationData.id,
      checkrInvitationUrl: invitationData.invitation_url,
      checkrStatus: invitationData.status,
      bgConsent: true,
      status: "Background Pending"
    });

    console.log(`Invitation generated successfully for ${application.email}`);
    res.json({ invitationUrl: invitationData.invitation_url });
  } catch (err) {
    console.error("Failed to initiate Checkr check:", err.message);
    if (err.response) {
      console.error("PocketBase error response data:", JSON.stringify(err.response.data || err.response));
    } else if (err.data) {
      console.error("PocketBase error data:", JSON.stringify(err.data));
    }
    res.status(500).json({ error: err.message });
  }
});

// Webhook listener for Checkr status notifications
app.post('/api/checkr/webhook', async (req, res) => {
  const event = req.body;
  console.log("Checkr webhook event received:", event.type);

  const type = event.type;
  const dataObject = event.data?.object;
  if (!dataObject) {
    return res.status(400).send("Invalid webhook data payload.");
  }

  const invitationId = dataObject.invitation_id;
  const candidateId = dataObject.candidate_id;

  try {
    let application = null;
    if (invitationId) {
      application = await pb.collection('technician_applications').getFirstListItem(`checkrInvitationId="${invitationId}"`);
    } else if (candidateId) {
      application = await pb.collection('technician_applications').getFirstListItem(`checkrCandidateId="${candidateId}"`);
    }

    if (!application) {
      console.warn("No matching recruit record found for Checkr reference:", invitationId || candidateId);
      return res.status(404).send("Application record not found.");
    }

    const updates = {};
    if (type === 'invitation.completed') {
      updates.checkrStatus = "completed";
      updates.status = "Background Screening";
    } else if (type === 'report.completed') {
      updates.checkrStatus = dataObject.result; // "clear" or "consider"
      if (dataObject.result === 'clear') {
        updates.status = "Background Clear";
      } else {
        updates.status = "Review Required";
      }
    } else if (type === 'invitation.expired') {
      updates.checkrStatus = "expired";
      updates.status = "Review Required";
    }

    if (Object.keys(updates).length > 0) {
      await pb.collection('technician_applications').update(application.id, updates);
      console.log(`Successfully synced Checkr webhook. Recruit ${application.email} status updated to: ${updates.status}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Failed to process Checkr webhook update:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Stripe/Checkr integration server running on port ${PORT}`);
});
