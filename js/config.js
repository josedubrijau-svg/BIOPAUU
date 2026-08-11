/* ============================================================================
   BioPAU — configuración PÚBLICA del navegador.
   Estos valores son públicos por diseño (la seguridad la da RLS en Supabase
   y la clave secreta de Stripe, que vive SOLO en el servidor).
   Sustituye los valores por los de tu proyecto.
   ============================================================================ */
window.BIOPAU_CONFIG = {
  // Supabase → Project Settings → API
  SUPABASE_URL: "https://TU-PROYECTO.supabase.co",
  SUPABASE_ANON_KEY: "TU_SUPABASE_ANON_KEY",

  // Stripe → Developers → API keys → Publishable key (opcional con Checkout redirect)
  STRIPE_PUBLISHABLE_KEY: "pk_test_...",

  // ¿Existe plan anual? (debe coincidir con haber configurado STRIPE_PRICE_ANNUAL)
  HAS_ANNUAL: true,

  // Precios solo para MOSTRAR en /precios (el cobro real lo fija Stripe en el servidor)
  PRICE_MONTHLY_LABEL: "2,99 €/mes",
  PRICE_ANNUAL_LABEL: "29,99 €/año"
};
