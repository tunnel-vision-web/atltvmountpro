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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Stripe integration server running on port ${PORT}`);
});
