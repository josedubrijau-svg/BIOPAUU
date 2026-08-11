// POST /api/create-portal-session
// Abre el portal de cliente de Stripe (gestionar método de pago, cancelar, facturas).
// Requiere Authorization: Bearer <access_token de Supabase>.

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'No autenticado' });

    const { data: { user }, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !user) return res.status(401).json({ error: 'Sesión inválida' });

    const { data: profile } = await admin
      .from('profiles').select('stripe_customer_id').eq('id', user.id).single();

    if (!profile || !profile.stripe_customer_id) {
      return res.status(400).json({ error: 'Todavía no tienes datos de facturación' });
    }

    const appUrl = process.env.APP_URL || `https://${req.headers.host}`;
    const portal = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/cuenta.html`,
    });

    return res.status(200).json({ url: portal.url });
  } catch (err) {
    console.error('[create-portal-session]', err);
    return res.status(500).json({ error: 'No se pudo abrir el portal de facturación' });
  }
}
