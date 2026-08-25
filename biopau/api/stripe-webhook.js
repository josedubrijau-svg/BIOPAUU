// POST /api/stripe-webhook
// Recibe eventos de Stripe, VERIFICA la firma y actualiza la base de datos.
// Esta es la ÚNICA fuente de verdad del estado de pago (nunca el navegador).

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Necesitamos el cuerpo SIN parsear para verificar la firma del webhook.
export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Lee el cuerpo crudo del request como Buffer
async function readRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

function planFromSubscription(sub) {
  const interval = sub?.items?.data?.[0]?.price?.recurring?.interval;
  if (interval === 'year') return 'annual';
  if (interval === 'month') return 'monthly';
  return null;
}

async function updateByCustomer(customerId, fields) {
  if (!customerId) return;
  const { error } = await admin.from('profiles').update(fields).eq('stripe_customer_id', customerId);
  if (error) console.error('[webhook] update by customer error', error);
}

async function updateByUserId(userId, fields) {
  const { error } = await admin.from('profiles').update(fields).eq('id', userId);
  if (error) console.error('[webhook] update by user error', error);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Método no permitido');
  }

  let event;
  try {
    const buf = await readRawBody(req);
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    // Firma inválida → webhook falsificado o mal configurado
    console.error('[webhook] firma inválida:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object;
        const userId = (s.metadata && s.metadata.supabase_user_id) || s.client_reference_id;
        const customerId = s.customer;
        const subId = s.subscription;
        let status = 'active';
        let plan = (s.metadata && s.metadata.plan) || null;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          status = sub.status;
          plan = planFromSubscription(sub) || plan;
        }
        const fields = {
          stripe_customer_id: customerId,
          stripe_subscription_id: subId || null,
          subscription_status: status,
          payment_status: 'paid',
          plan,
        };
        if (userId) await updateByUserId(userId, fields);
        else await updateByCustomer(customerId, fields);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        await updateByCustomer(sub.customer, {
          stripe_subscription_id: sub.id,
          subscription_status: sub.status,
          plan: planFromSubscription(sub),
          payment_status: ['active', 'trialing'].includes(sub.status) ? 'paid' : 'none',
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await updateByCustomer(sub.customer, {
          subscription_status: 'canceled',
          payment_status: 'none',
        });
        break;
      }

      case 'invoice.paid': {
        const inv = event.data.object;
        await updateByCustomer(inv.customer, {
          subscription_status: 'active',
          payment_status: 'paid',
        });
        break;
      }

      case 'invoice.payment_failed': {
        const inv = event.data.object;
        await updateByCustomer(inv.customer, {
          subscription_status: 'past_due',
          payment_status: 'failed',
        });
        break;
      }

      default:
        // Otros eventos: ignorados a propósito
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[webhook] error procesando', event.type, err);
    return res.status(500).json({ error: 'Error procesando el evento' });
  }
}
