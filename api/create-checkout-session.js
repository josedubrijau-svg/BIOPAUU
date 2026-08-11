// POST /api/create-checkout-session
// Body: { plan: "monthly" | "annual" }
// Requiere cabecera Authorization: Bearer <access_token de Supabase>
// El SERVIDOR decide el precio (por ID en variables de entorno). Nunca el navegador.

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  annual: process.env.STRIPE_PRICE_ANNUAL,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // 1) Autenticar al usuario a partir de su token
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'No autenticado' });

    const { data: { user }, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !user) return res.status(401).json({ error: 'Sesión inválida' });

    // 2) El servidor elige el precio (ignora cualquier importe del cliente)
    const plan = (req.body && req.body.plan) === 'annual' ? 'annual' : 'monthly';
    const priceId = PRICES[plan];
    if (!priceId) return res.status(400).json({ error: 'Ese plan no está disponible' });

    // 3) Reutilizar (o crear) el cliente de Stripe asociado al usuario
    const { data: profile } = await admin
      .from('profiles').select('stripe_customer_id, subscription_status').eq('id', user.id).single();

    // Si ya tiene una suscripción activa, no dejamos duplicar
    if (profile && ['active', 'trialing'].includes(profile.subscription_status)) {
      return res.status(409).json({ error: 'Ya tienes una suscripción activa', already: true });
    }

    let customerId = profile && profile.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await admin.from('profiles')
        .update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    // 4) Crear la sesión de Checkout (modo suscripción)
    const appUrl = process.env.APP_URL || `https://${req.headers.host}`;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      client_reference_id: user.id,
      subscription_data: { metadata: { supabase_user_id: user.id, plan } },
      metadata: { supabase_user_id: user.id, plan },
      success_url: `${appUrl}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout-cancel.html`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[create-checkout-session]', err);
    return res.status(500).json({ error: 'No se pudo iniciar el pago' });
  }
}
