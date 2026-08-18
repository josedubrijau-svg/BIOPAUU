/* ============================================================================
   BioPAU — configuración PÚBLICA del navegador.
   Estos valores son públicos por diseño (la seguridad la da RLS en Supabase
   y la clave secreta de Stripe, que vive SOLO en el servidor).
   ============================================================================ */
window.BIOPAU_CONFIG = {
  SUPABASE_URL: "https://dqkcmubzfrllggkpkzrt.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxa2NtdWJ6ZnJsbGdna3BrenJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNjE2NzAsImV4cCI6MjEwMTkzNzY3MH0.AWvG4bOXP-QQ1MrvvsZzPCdNeoRaFcbxhv9hH5u0Gy4",

  STRIPE_PUBLISHABLE_KEY: "pk_live_51U2rxN1XdsyhO4j4Y6T6jjmwnSTiwmml5owXlbZMeUHO1yuK5CQg0TfsE70meyLFgPOBOuGrGBEjVXU0aznDb1cU00fnqHzcYE",

  HAS_ANNUAL: true,
  PRICE_MONTHLY_LABEL: "2,99 €/mes",
  PRICE_ANNUAL_LABEL: "29,99 €/año"
};
